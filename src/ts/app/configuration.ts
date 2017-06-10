import { Promise } from "es6-promise";
import * as $ from "jquery";
import * as _ from "lodash";


export interface AppConfiguration {
    fadeInTime: number;
    fadeOutTime: number;
    duration: number;
    maxQueueSize: number;
    batchSize: number;
}

interface JsonObject {
    [prop: string]: any;
}

function isConfig(obj: JsonObject): obj is AppConfiguration {
    return _.every([
        "fadeInTime",
        "fadeOutTime",
        "duration",
        "maxQueueSize",
        "batchSize",
    ], (prop: string) => {
        return _.has(obj, prop) && _.isFinite(obj[prop]);
    });
}

export function getConfig(): Promise<AppConfiguration> {
    return new Promise((resolve, reject) => {
        $.get("config.json", (config: JsonObject) => {
            if (isConfig(config)) {
                resolve(config);
            } else {
                reject(config);
            }
        }, "json");
    });
}

export default getConfig;
