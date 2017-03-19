import * as $ from "jquery";
import * as _ from "lodash";

export default class Overlay {
    private overlayDiv: JQuery;
    private backgroundImage: JQuery;
    private button: JQuery;
    private fadeOutCallback = _.noop;

    constructor(public container: JQuery) {
        this.backgroundImage = $("<img src='build/resources/img/intro-overlay.png' />");
        this.button = $("<a class='bottom center button'>Begin Reading</a>")
        this.overlayDiv = $("<div class='overlay'></div>");
        this.overlayDiv.append(this.backgroundImage).append(this.button);
        this.container.append(this.overlayDiv);
        this.overlayDiv.click(() => {
            this.overlayDiv.fadeOut(500, () => {
                this.fadeOutCallback(this);
            });
        })
    }

    public onFadeOut(callback: (ovly: Overlay)=>void) {
        let oldCallback = this.fadeOutCallback;
        this.fadeOutCallback = (ovly: Overlay) => {
            oldCallback(ovly);
            callback(ovly);
        }
    }
};
