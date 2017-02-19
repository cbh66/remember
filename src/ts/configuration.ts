import * as _ from "lodash";


interface AppConfiguration {
    fadeInTime: number,
    fadeOutTime: number,
    duration: number
}

interface jsonObject {
    [prop: string]: any
}

function isConfig(obj: jsonObject): obj is AppConfiguration {
    return _.every(["fadeInTime", "fadeOutTime", "duration"], (prop:string)=>{
        return _.has(obj, prop) && _.isFinite(obj[prop]);
    });
}

function getConfig(callback: (conf:AppConfiguration)=>void): void {
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