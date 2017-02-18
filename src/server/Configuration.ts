import * as _ from "lodash";
import * as fs from "fs";

export function configFromFile(fileName: String, type?: String) {
    return JSON.parse(fs.readFileSync(fileName, type || 'utf8'));
}

// First filenames' props override later ones.  In other words, use later ones for defaults.
export function configFromFiles(fileNames: String[]) {
    return _.defaultsDeep(_.map(fileNames, configFromFile));
}

export function overrideFromEnv(obj: Object, env: Object) {

}