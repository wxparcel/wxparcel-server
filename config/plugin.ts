import { EggPlugin } from 'egg';

import Deploy from '../app/io/controller/deploy';
import Data from '../app/io/controller/data';

declare module 'egg' {
  interface CustomController {
    deploy: Deploy;
    data: Data;
  }
}

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  io: {
    enable: true,
    package: 'egg-socket.io',
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
};

export default plugin;
