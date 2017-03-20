/// <reference path="../lib/victim.d.ts" />
import * as $ from "jquery";
import * as _ from "lodash";
import Queue from "../lib/Queue";
import { Promise } from "es6-promise";
import VictimCard from "./VictimCard";
import { AppConfiguration } from "./configuration";

let eventToTitle: { [key: string]: string } = {
    "Armenia": "The Armenian Genocide",
    "Holocaust": "The Holocaust"
};

export default class ReadingDisplay {
    private displayContainer: JQuery;
    private victimCard: VictimCard;
    private fadingOut = false;
    private loadingNewVictims = false;
    private victimQueue: Queue<Victim>;
    private nextButton: JQuery;

    constructor(public container: JQuery, public config: AppConfiguration) {
        this.victimQueue = new Queue<Victim>();
        this.displayContainer = $("<div id='display'></div>");
        this.victimCard = new VictimCard(this.displayContainer);
        this.nextButton = $("<a class='bottom right next button'>Next ❯</a>")
        this.displayContainer.append(this.nextButton);
        container.append(this.displayContainer);
        $(window).keypress((event) => {
            this.moveToNextVictim();
        });
        this.nextButton.click(() => {
            this.moveToNextVictim();
        });

        this.victimCard.updateCard = (victim: Victim) => {
            let text: string = victim.name + ". Perished ";
            if (victim.birthYear && victim.deathYear) {
                text += "at the age of " + (victim.deathYear - victim.birthYear);
            } else if (victim.deathYear) {
                text += "in " + victim.deathYear;
            }
            text += " in ";
            if (eventToTitle[victim.event as string]) {
                text += eventToTitle[victim.event as string];
            } else {
                text += victim.event;
            }
            text += ".";
            return $("<div>"+text+"</div>");
        }
    }

    public moveToNextVictim(): void {
        if (this.fadingOut) return;
        let victim = this.victimQueue.dequeue();
        if (!victim) return;
        this.fadingOut = true;
        this.victimCard.fadeOut(this.config.fadeOutTime);
        setTimeout(() => {
            if (!victim) return;
            this.victimCard.fadeInNewVictim(victim, this.config.fadeInTime)
                .then(() => this.fadingOut = false)
        }, this.config.fadeOutTime);
        this.getAndAddNewVictims();
    }

    public getAndAddNewVictims(): Promise<any> {
        if (!this.loadingNewVictims) {
            this.loadingNewVictims = true;
            return this.getNewVictims().then((victims) => this.addNewVictims(victims))
                .then(() => {this.loadingNewVictims = false; return;})
                .catch(() => {this.loadingNewVictims = false; return});
        } else {
            return Promise.resolve();
        }
    }

    private getNewVictims(): Promise<Victim[]> {
        const request = {
            next: this.config.batchSize
        }
        return new Promise((resolve, reject) => {
            $.get("api/random", request, (data: Victim[]) => {
                resolve(data);
            }, "json");
        });
    }

    private addNewVictims(victims: Victim[]) {
        _.each(victims, (victim) => {
            this.victimQueue.enqueue(victim);
        });
    }
};
