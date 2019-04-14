import { Service } from 'egg';

export default class Disconnect extends Service {
  public async deploy() {
    const { ctx } = this;
    ctx.model.Connect.findOne({
      clientId: ctx.socket.id,
    }).then(async connect => {
      if (!connect || !connect.deployId) {
        return '';
      }
      const index = connect.clientId.indexOf(ctx.socket.id);
      connect.clientId.splice(index, 1);
      await connect.save();
    });
  }
}
