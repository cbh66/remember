import * as _ from "lodash";
import * as ConfReader from "./ConfigurationReader";

interface AppConfiguration {
    fadeInTime: number,
    fadeOutTime: number,
    duration: number
}

let confDefaults: AppConfiguration = {
    fadeInTime: 0,
    fadeOutTime: 0,
    duration: 1000
}

function getConfig(pathName: string): AppConfiguration {
    let config: Object = ConfReader.configFromFile(pathName);
    return _.defaults(config, confDefaults);
}

export default getConfig;