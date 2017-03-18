import * as $ from "jquery";
//import * as _ from "lodash";

export default class Overlay {
    private overlayDiv: JQuery;
    private backgroundImage: JQuery;

    constructor(public container: JQuery) {
        this.backgroundImage = $("<img src='build/resources/img/intro-overlay.png' />");
        this.overlayDiv = $("<div class='overlay'></div>");
        this.overlayDiv.append(this.backgroundImage);
        this.container.append(this.overlayDiv);
        this.overlayDiv.click(() => {
            this.overlayDiv.fadeOut(500);
        })
    }
};
