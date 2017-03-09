import * as _ from "lodash";


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

export function getConfig(callback: (conf:AppConfiguration)=>void): void {
    $.get("config.json", function (config: jsonObject) {
        if (isConfig(config)) {
            callback(config);
        } else {
            console.error(config);
            throw "Badly formed configuration object";
        }
    }, "json");
}

export default getConfig;