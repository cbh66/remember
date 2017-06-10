import * as fs from "fs";
import * as _ from "lodash";

interface JsonObject {
    [prop: string]: any;
}

export function configFromFile(fileName: string, type?: string): JsonObject {
    const obj: any = JSON.parse(fs.readFileSync(fileName, type || "utf8"));
    if (!_.isObject(obj)) {
        throw new Error(`'${fileName}' is not valid JSON (no root object)`);
    } else {
        return obj;
    }
}

// First filenames' props override later ones.  In other words, use later ones for defaults.
export function configFromFiles(fileNames: string[]): JsonObject {
    return _.defaultsDeep(_.map(fileNames, configFromFile));
}

export function overrideFromEnv(obj: JsonObject, env: JsonObject) {
    // TODO
}
