import * as $ from "jquery";
import Memorial from "./app/Memorial";
import { getConfig } from "./app/configuration";

$(document).ready(function () {
    getConfig()
        .then((config) => new Memorial($("#memorial-container"), config)
            .getAndAddNewVictims())
        .catch((conf) => console.error("Badly formed configuration", conf));
});
