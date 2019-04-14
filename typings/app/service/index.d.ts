// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportDisconnect from '../../../app/service/Disconnect';
import ExportProject from '../../../app/service/Project';

declare module 'egg' {
  interface IService {
    disconnect: ExportDisconnect;
    project: ExportProject;
  }
}
