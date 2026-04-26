import { KisApi } from './credentials/KisApi.credentials';
import { KisGetDataTrigger } from './nodes/KisGetDataTrigger.node';
import { Kis } from './nodes/Kis.node';


export const nodes = [
	Kis,
	KisGetDataTrigger,
];

export const credentials = [KisApi];
