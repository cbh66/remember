/// <reference path="../lib/victim.d.ts" />
import * as $ from "jquery";
import * as _ from "lodash";
import Queue from "../lib/Queue";
import { Promise } from "es6-promise";
import VictimCard from "./VictimCard";
import { AppConfiguration } from "./configuration";

export default class Memorial {
    private victimCard: VictimCard;
    private fadingOut = false;
    private loadingNewVictims = false;
    private victimQueue: Queue<Victim>;
    private nextButton: JQuery;

    constructor(public container: JQuery, public config: AppConfiguration) {
        this.victimCard = new VictimCard(container);
        this.nextButton = $("<a class='bottom right next button'>Next ❯</a>")
        container.append(this.nextButton);
        this.victimQueue = new Queue<Victim>();
        $(window).keypress((event) => {
            this.moveToNextVictim();
        });
        this.nextButton.click(() => {
            this.moveToNextVictim();
        })
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