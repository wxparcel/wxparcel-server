import { Application, IBoot } from 'egg';
export default class AppBootHook implements IBoot {
  private readonly app: Application;
  constructor(app) {
    this.app = app;
  }
  async didReady() {
    // http / https server 已启动，开始接受外部请求
    // 此时可以从 app.server 拿到 server 的实例
    const ctx = await this.app.createAnonymousContext();
    const checkEmpty = await ctx.model.Connect.find();
    if (checkEmpty.length !== 0) {
      await ctx.model.Connect.collection.drop();
    }
    console.log('start success');
  }
}
