import { Controller } from 'egg';
import * as sendToWormhole from 'stream-wormhole';
import * as fse from 'fs-extra';
import * as path from 'path';
import {
  write as awaitWriteStream,
} from 'await-stream-ready';

export default class CollectController extends Controller {
  public async post() {
    const { ctx, config } = this;
    const stream = await ctx.getFileStream();
    try {
      const filePath = path.join(config.baseDir, './data', stream.filename);
      const writeStream = fse.createWriteStream(path.join(config.baseDir, './data', stream.filename));
      stream.pipe(writeStream);
      await awaitWriteStream(writeStream);
      const ODM = {
        ...stream.fields,
        createTime: new Date(),
        filePath,
        pkgSize: 0,
      };
      console.log(stream.fields);
      const doc = await ctx.model.Project.findOne({ repoUrl: stream.fields.repoUrl }).exec();
      console.log(doc);
      doc.order = !Array.isArray(doc.order) ? [ODM] : [ODM, ...doc.order];
      await doc.save();
      sendToWormhole(stream);
      return this.ctx.body = {
        status: 200,
      };
    } catch (err) {
      sendToWormhole(stream);
      return this.ctx.body = {
        status: 500,
        message: err.message,
      };
    }
  }
}
