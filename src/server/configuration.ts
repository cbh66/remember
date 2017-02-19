import * as _ from "lodash";
import * as ConfReader from "./ConfigurationReader";

///// Note: the front-end's configuration is a subset of the back-end's.
/////    To make available on the front end, update ts/configuration.ts
interface AppConfRequired {
    fadeInTime: number,
    fadeOutTime: number,
    duration: number,
    maxQueueSize: number,
    batchSize: number
}

let confDefaults: AppConfRequired = {
    fadeInTime: 0,
    fadeOutTime: 0,
    duration: 1000,
    maxQueueSize: 1000,
    batchSize: 100
}

interface AppConfOptional {

}

interface AppConfDerived {

}

type AppConfiguration = AppConfRequired & AppConfOptional & AppConfDerived;

function deriveProperties(conf: AppConfRequired & AppConfOptional): AppConfiguration {
    return conf;
}

function camelCaseToSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, (ch) => "_" + ch.toLowerCase());
};

function overrideWithEnvironmentVariables(config: AppConfiguration, environment: any): AppConfiguration {
    if (_.isObject(environment)) {
        config = _.mapValues(config, function (val: any, key: string) {
            let envKey = camelCaseToSnakeCase(key).toUpperCase();
            if (_.has(environment, envKey)) {
                if (_.isNumber(val)) {
                    return _.toNumber(environment[envKey]);
                }
                return environment[envKey];
            } else {
                return val;
            }
        });
    }
    return config;
}

function getConfig(pathName: string, environment: any): AppConfiguration {
    let config: Object = ConfReader.configFromFile(pathName);
    return deriveProperties(overrideWithEnvironmentVariables(_.defaults(config, confDefaults), environment));
}

export default getConfig;
