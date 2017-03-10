import * as _ from "lodash";
import { Promise } from "es6-promise";


export interface AppConfiguration {
    fadeInTime: number,
    fadeOutTime: number,
    duration: number,
    maxQueueSize: number,
    batchSize: number
}

interface jsonObject {
    [prop: string]: any
}

function isConfig(obj: jsonObject): obj is AppConfiguration {
    return _.every(["fadeInTime", "fadeOutTime", "duration", "maxQueueSize", "batchSize"], (prop:string)=>{
        return _.has(obj, prop) && _.isFinite(obj[prop]);
    });
}

export function getConfig(): Promise<AppConfiguration> {
    return new Promise((resolve, reject) => {
        $.get("config.json", function (config: jsonObject) {
            if (isConfig(config)) {
                resolve(config);
            } else {
                reject(config);
            }
        }, "json");
    })

}

export default getConfig;