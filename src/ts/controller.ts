import * as $ from "jquery";
import Memorial from "./app/Memorial";
import { getConfig } from "./app/configuration";

$(document).ready(function () {
    let memorial = new Memorial($("#memorial-container"));
    getConfig()
        .then((config) => memorial.getAndAddNewVictims(config))
        .catch((conf) => console.error("Badly formed configuration", conf));
});
