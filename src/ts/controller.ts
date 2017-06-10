import * as $ from "jquery";
import { getConfig } from "./app/configuration";
import Memorial from "./app/Memorial";

$(document).ready(() => {
    getConfig()
        .then((config) => new Memorial($("#memorial-container"), config)
            .getAndAddNewVictims())
        .catch((conf) => console.error("Badly formed configuration", conf));
});
