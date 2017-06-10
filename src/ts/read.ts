import * as $ from "jquery";
import { getConfig } from "./app/configuration";
import Overlay from "./app/Overlay";
import ReadingDisplay from "./app/ReadingDisplay";

$(document).ready(() => {
    const overlay = new Overlay($("#reading-display"));
    getConfig()
        .then((config) => {
            const display = new ReadingDisplay($("#reading-display"), config);
            display.getAndAddNewVictims().then(() => {
                display.moveToNextVictim();
            });
        })
        .catch((conf) => console.error("Badly formed configuration", conf));
    return overlay;
});
