import * as _ from "lodash";
import * as fs from "fs";

export function configFromFile(fileName: string, type?: string): Object {
    let obj: any = JSON.parse(fs.readFileSync(fileName, type || 'utf8'));
    if (!_.isObject(obj)) {
        throw "'"+fileName+"'" + " is not valid JSON (no root object)";
    } else {
        return obj;
    }
}

// First filenames' props override later ones.  In other words, use later ones for defaults.
export function configFromFiles(fileNames: string[]): Object {
    return _.defaultsDeep(_.map(fileNames, configFromFile));
}

export function overrideFromEnv(obj: Object, env: Object) {

}