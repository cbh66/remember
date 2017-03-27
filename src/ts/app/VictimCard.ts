/// <reference path="../lib/victim.d.ts" />
import * as $ from "jquery";
import { Promise } from "es6-promise";

let eventToTitle: { [key: string]: string } = {
    "Armenia": "the Armenian Genocide",
    "Holocaust": "the Holocaust",
    "Native American Genocides": "the Genocidal Massacres of Native Americans",
    "Cambodia": "the Cambodian Genocide",
    "Rwanda": "the Rwandan Genocide",
    "Bosnia": "the Bosnian Genocide",
    "Kosovo": "the Kosovo War"
};

export default class VictimCard {
    protected victim: Victim|null;
    protected memorial: JQuery;
    public updateCard: (victim: Victim) => JQuery = (victim: Victim) => {
            let text: string = victim.name + ". Perished ";
            if (victim.birthYear && victim.deathYear) {
                text += "at the age of " + (victim.deathYear - victim.birthYear);
            } else if (victim.deathYear) {
                text += "in " + victim.deathYear;
            }
            text += " in ";
            if (eventToTitle[victim.event as string]) {
                text += eventToTitle[victim.event as string];
            } else if (victim.event.indexOf(" ") > 0) { // multiple words
                text += "the " + victim.event;
            } else {
                text += victim.event;
            }
            text += ".";
            return $("<div>"+text+"</div>");
        }

    constructor(public memorialContainer: JQuery) {
        this.memorial = $("<div>", { id: "memorial" });
        // this.memorial.append(name, years, event, details);
        this.memorialContainer.append(this.memorial);
        $(window).on('resize', () => {
            this.verticallyCenter(this.memorial, this.memorialContainer);
        });
    };

    public fadeOut(fadeOutTime: number): Promise<void> {
        return this.fadeTo(0, fadeOutTime);
    }

    public fadeIn(fadeInTime: number): Promise<void> {
        return this.fadeTo(1, fadeInTime);
    }

    public fadeTo(opacity: number, fadeTime: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.memorial.fadeTo(fadeTime, opacity, resolve);
        });
    }

    public setVictim(victim: Victim) {
        this.victim = victim;
        this.updateMemorial(victim);
    }

    public fadeInNewVictim(victim: Victim, fadeInTime: number): Promise<void> {
        this.setVictim(victim);
        return this.fadeIn(fadeInTime);
    }

    public verticallyCenter(inner: JQuery, container: JQuery): void  {
        let inHeight = inner.outerHeight();
        let conHeight = container.outerHeight();
        inner.css('margin-top', ((conHeight-inHeight)/2)+'px');
    }

    protected updateMemorial(victim: Victim): void {
        this.memorial.empty();
        this.memorial.append(this.updateCard(victim));

        this.verticallyCenter(this.memorial, this.memorialContainer);
    }
};
