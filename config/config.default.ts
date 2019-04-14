import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
// app special config scheme
export interface BizConfig {
  deployApi: string;
}

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig> & BizConfig;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1555065928368_1202';

  // add your egg config in here
  config.middleware = [];

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    io: {
      init: {}, // passed to engine.io
      namespace: {
        '/': {
          connectionMiddleware: [],
          packetMiddleware: [],
        },
        '/wxparcel': {
          connectionMiddleware: ['connection'],
          packetMiddleware: [],
        },
      },
    },

  };

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/wxparcel',
      options: { useNewUrlParser: true },
    },
  };

  config.security = {
    csrf: {
      enable: false,
    },
    xframe: {
      enable: false,
    },
  };

  config.multipart = {
    fileSize: '50mb',
    fields: 20,
  };

  config.deployApi = 'http://172.25.64.18:3000';

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
