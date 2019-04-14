import { Controller } from 'egg';
import * as FormData from 'form-data';
import * as fse from 'fs-extra';
import axios from 'axios';
import * as util from 'util';

export default class DeployController extends Controller {
  async index() {
    const { ctx, } = this;
    const data = ctx.args[0];
    const { action, payload } = data;
    ctx.logger.info(`action:${action}`);
    if (this[action]) {
      await this[action](payload);
    }
  }

  // 微信登陆，负责客户端
  public async newProject(payload) {
    const { name, desc, repoUrl } = payload;
    const { ctx } = this;
    const project = await ctx.model.Project.create({
      name,
      desc,
      repoUrl,
      createTime: new Date(),
    });
    const isConnected = await this.ensureConnect(project.id);
    if (isConnected) {
      this.emit('login');
    }
  }

  public async ensureConnect(id) {
    const { ctx, } = this;
    const connect = await ctx.model.Connect.findOne({
      projectId: id,
    }).exec();
    // deployer id不存在或者已经断开就触发连接
    if (!connect || !connect.deployId || !this.querySocketPool(connect.deployId)) {
      try {
        await axios.post(`${ctx.app.config.deployApi}/connect`, {
          serverUrl: `http://${ctx.header.host}/wxparcel`,
          socketId: ctx.socket.id,
          projectId: id,
        });
      } catch (err) {
        console.log(err);
        return;
      }
      return false;
    }
    if (!connect) {
      return;
    }
    if (!Array.isArray(connect.clientId)) {
      // tslint:disable-next-line:array-bracket-spacing
      connect.clientId = [ctx.socket.id];
    } else {
      if (!connect.clientId.includes(ctx.socket.id)) {
        connect.clientId.push(ctx.socket.id);
      }
    }
    await connect.save();
    return true;
  }

  // 对接成功
  public async connectSuccess(payload) {
    const { ctx } = this;
    const { data } = payload;
    const doc = await ctx.model.Connect.findOne({ projectId: data.projectId }).exec();
    if (!doc) {
      await ctx.model.Connect.create({
        projectId: data.projectId,
        deployId: ctx.socket.id,
        // tslint:disable-next-line:array-bracket-spacing
        clientId: [data.socketId],
      });
    }
    const project = await ctx.model.Project.findById(data.projectId).exec();
    // 对接成功后肯定是要拉起登陆的
    if (!project) {
      return;
    }
    if (!project.isLogin) {
      project.isLogin = true;
      await project.save();
      console.log('emit');
      this.emit('login');
    } else {
      this.send(data.socketId, 'retryUpload');
    }
  }

  // 扫码回调
  public async login(payload) {
    const { ctx } = this;
    const { status, data } = payload;
    const connect = await ctx.model.Connect.findOne({
      deployId: ctx.socket.id,
    }).exec();
    console.log(payload);
    if (status === 200) {
      console.log(connect.clientId[0]);
      this.send(connect.clientId[0], 'loginSuccess');
    } else {
      this.send(connect.clientId[0], 'loginFail', data);
    }
    connect.clientId.shift();
    connect.save();
  }

  // 获取qrcode
  public async qrcode(payload) {
    const { ctx } = this;
    const { data } = payload;
    console.log(payload);
    const connect = await ctx.model.Connect.findOne({ deployId: ctx.socket.id });
    this.send(connect.clientId[0], 'qrcode', data.toString());
  }

  public async upload({ projectId, orderIndex }) {
    const { ctx } = this;
    const isConnected = await this.ensureConnect(projectId);
    // console.log(isConnected);
    if (!isConnected) {
      this.emit('uploadNotConnect');
      return;
    }
    const connect = await ctx.model.Connect.findOne({ projectId }).exec();
    const index = connect.clientId.indexOf(ctx.socket.id);
    if (index) {
      this.emit('uploadBusy');
      return;
    }
    const project = await ctx.model.Project.findById(projectId).lean();
    const { filePath, appid, message, version } = project.order[orderIndex];
    const stream = fse.createReadStream(filePath);
    stream.once('end', () => stream.close());
    const formData = new FormData();
    formData.append('appid', appid);
    formData.append('version', version);
    formData.append('message', message);
    formData.append('file', stream);
    const contentSize = await util.promisify(formData.getLength.bind(formData))().catch(() => console.log(111));
    const headers = {
      Accept: 'application/json',
      'Content-Type': `multipart/form-data; charset=utf-8; boundary="${formData.getBoundary()}"`,
      'Content-Length': contentSize,
    };
    try {
      const res = await axios.post(`${ctx.app.config.deployApi}/upload`, formData, {
        headers,
      });
      if (res.data.status === 200) {
        this.emit('uploadSuccess');
      }
      connect.clientId.shift();
      connect.save();
    } catch (err) {
      if (err.response.data.status === 401) {
        this.emit('uploadNeedLogin');
        this.send(connect.deployId, 'login');
      }
    }
  }

  private querySocketPool(socketId) {
    const id = socketId.split('#')[1];
    // tslint:disable-next-line:no-string-literal
    const socket = this.ctx.app.io['sockets']['connected'][id];
    return socket;
  }

  private send(id, action, payload?: any) {
    this.ctx.socket.to(id).emit('deploy', {
      action,
      payload,
    });
  }

  private emit(action, payload?: any) {
    this.ctx.socket.emit('deploy', {
      action,
      payload,
    });
  }

}
