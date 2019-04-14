import { Controller } from 'egg';

export default class DeployController extends Controller {
  async index() {
    const { ctx, } = this;
    const data = ctx.args[0];
    const { action, payload } = data;
    ctx.logger.info(`action:${action},payload:${JSON.stringify(payload)}`);
    if (this[action]) {
      await this[action](payload);
    }
  }
  async queryList() {
    const { ctx } = this;
    const list = await ctx.model.Project
      .find()
      .limit(50)
      .select('-__v')
      .sort({ createTime: -1 })
      .lean();
    const res = list.map(ele => {
      const obj = {
        ...ele,
        id: ele._id,
      };
      // tslint:disable-next-line:no-string-literal
      delete obj['_id'];
      return obj;
    });
    this.emit('queryList', res);
  }

  async queryDetail(id) {
    const { ctx } = this;
    const item = await ctx.model.Project
      .findById(id)
      .select('-__v -_id')
      .lean();
    this.emit('queryDetail', item);
  }

  // private send(id, action, payload?: any) {
  //   this.ctx.socket.to(id).emit('data', {
  //     action,
  //     payload,
  //   });
  // }

  private emit(action, payload?: any) {
    this.ctx.socket.emit('data', {
      action,
      payload,
    });
  }

}
