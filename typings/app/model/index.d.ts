// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportConnect from '../../../app/model/connect';
import ExportProject from '../../../app/model/project';

declare module 'egg' {
  interface IModel {
    Connect: ReturnType<typeof ExportConnect>;
    Project: ReturnType<typeof ExportProject>;
  }
}
