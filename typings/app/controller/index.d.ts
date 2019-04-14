// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCollector from '../../../app/controller/collector';
import ExportHome from '../../../app/controller/home';

declare module 'egg' {
  interface IController {
    collector: ExportCollector;
    home: ExportHome;
  }
}
