import * as _ from "lodash";
import * as ConfReader from "./ConfigurationReader";

interface AppConfRequired {
    fadeInTime: number,
    fadeOutTime: number,
    duration: number
}

let confDefaults: AppConfRequired = {
    fadeInTime: 0,
    fadeOutTime: 0,
    duration: 1000
}

interface AppConfOptional {

}

interface AppConfDerived {

}

type AppConfiguration = AppConfRequired & AppConfOptional & AppConfDerived;

function deriveProperties(conf: AppConfRequired & AppConfOptional): AppConfiguration {
    return conf;
}

function getConfig(pathName: string): AppConfiguration {
    let config: Object = ConfReader.configFromFile(pathName);
    return deriveProperties(_.defaults(config, confDefaults));
}

export default getConfig;