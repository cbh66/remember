import * as $ from "jquery";
import ReadingDisplay from "./app/ReadingDisplay";
import Overlay from "./app/Overlay";
import { getConfig } from "./app/configuration";

$(document).ready(function () {
    new Overlay($("#reading-display"));
    getConfig()
        .then((config) => {
            const display = new ReadingDisplay($("#reading-display"), config);
            display.getAndAddNewVictims().then(() => {
                display.moveToNextVictim();
            });
        })
        .catch((conf) => console.error("Badly formed configuration", conf));
});
