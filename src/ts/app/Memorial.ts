/// <reference path="../lib/victim.d.ts" />
import * as _ from "lodash";
import TimedQueue from "../lib/TimedQueue";
import { Promise } from "es6-promise";
import VictimCard from "./VictimCard";
import { AppConfiguration } from "./configuration";

enum ActionType {
    fadeIn,
    fadeOut
}
interface Action {
    type: ActionType,
    victim?: Victim,  // if action type is fadeIn
    config: AppConfiguration
}

export default class Memorial {
    private victimCard: VictimCard;
    private currentlyLoadingActions = false;
    private currentAction:  Promise<void> = Promise.resolve<void>(undefined);
    private actionQueue: TimedQueue<Action>

    constructor(public container: JQuery) {
        this.victimCard = new VictimCard(container);
        this.actionQueue = new TimedQueue<Action>({
            callback: (action: Action): void => {
                this.processAction(action);
                if (this.actionQueue.length() < action.config.maxQueueSize*2 &&
                    !this.currentlyLoadingActions) {
                    this.currentlyLoadingActions = true;
                    this.getNewVictims(action.config)
                        .then((victims) => this.addNewVictims(victims, action.config))
                        .then(() => this.currentlyLoadingActions = false)
                        .catch(() => this.currentlyLoadingActions = false);
                }
            }
        });
    }

    private processAction(action: Action): void {
        this.currentAction = this.currentAction.then(() => {
            if (action.type === ActionType.fadeOut) {
                console.log("Fading out");
                return this.victimCard.fadeOut(action.config.fadeOutTime);
            } else if (action.victim && action.type === ActionType.fadeIn) {
                console.log("Fading in");
                return this.victimCard.fadeInNewVictim(action.victim, action.config.fadeInTime);
            } else {
                return new Promise<void>((_, reject) =>
                    reject("Invalid state: invalid action type " + action.type));
            }
        });
    }

    public getAndAddNewVictims(config: AppConfiguration) {
        this.getNewVictims(config).then((victims) =>
            this.addNewVictims(victims, config)
        );
    }

    private getNewVictims(config: AppConfiguration): Promise<Victim[]> {
        const request = {
            next: config.batchSize,
            // TODO: max of latest time and current time
            after: this.actionQueue.getLatestScheduledTime() || new Date()
        }
        return new Promise((resolve, reject) => {
            $.get("api/schedule", request, function (data: Victim[]) {
                _.each(data, function (victim: Victim) {
                    victim.scheduledTime = new Date(victim.scheduledTime);
                });
                resolve(data);
            }, "json");
        });
    }

    private addNewVictims(victims: Victim[], config: AppConfiguration) {
        _.each(victims, (victim) => {
            const fadeOutPrev = new Date(victim.scheduledTime.getTime() - config.fadeOutTime)
            if (victim.scheduledTime > this.actionQueue.getLatestScheduledTime()) {
                this.actionQueue.addLatest({
                    type: ActionType.fadeOut,
                    config
                }, fadeOutPrev);
                this.actionQueue.addLatest({
                    type: ActionType.fadeIn,
                    victim,
                    config
                }, victim.scheduledTime);
            } else {
                console.warn("EARLIER:", victim.scheduledTime,
                    this.actionQueue.getLatestScheduledTime());
            }
        });
    }
};
