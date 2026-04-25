"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = exports.nodes = void 0;
const KisApi_credentials_1 = require("./credentials/KisApi.credentials");
const KisGetDataTrigger_node_1 = require("./nodes/KisGetDataTrigger.node");
const Kis_node_1 = require("./nodes/Kis.node");
exports.nodes = [
    Kis_node_1.Kis,
    KisGetDataTrigger_node_1.KisGetDataTrigger,
];
exports.credentials = [KisApi_credentials_1.KisApi];
