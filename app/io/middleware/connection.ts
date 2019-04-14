export default () => {
  return async (ctx, next) => {
    console.log(ctx.socket.handshake.address);
    console.log('get connect' + ctx.socket.id);
    await next();
    ctx.service.disconnect.deploy();
  };
};
