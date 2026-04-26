import { KisApi } from './credentials/KisApi.credentials';
import { KisGetDataTrigger } from './nodes/KisGetDataTrigger.node';
import { Kis } from './nodes/Kis.node';
export declare const nodes: (typeof KisGetDataTrigger | typeof Kis)[];
export declare const credentials: (typeof KisApi)[];
