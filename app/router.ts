import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router, io } = app;
  io.of('/wxparcel').route('deploy', io.controller.deploy.index);
  io.of('/wxparcel').route('data', io.controller.data.index)
  router.get('/', controller.home.index);
  router.post('/collector', controller.collector.post);
};
