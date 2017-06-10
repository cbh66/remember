import { Promise } from "es6-promise";
import * as $ from "jquery";
import * as _ from "lodash";
import TimedQueue from "../lib/TimedQueue";
import Victim from "../lib/Victim";
import { AppConfiguration } from "./configuration";
import VictimCard from "./VictimCard";

enum ActionType {
    fadeIn,
    fadeOut,
}
interface Action {
    type: ActionType;
    victim?: Victim;  // if action type is fadeIn
}

export default class Memorial {
    private victimCard: VictimCard;
    private currentlyLoadingActions = false;
    private currentAction: Promise<void> = Promise.resolve<void>(undefined);
    private actionQueue: TimedQueue<Action>;

    constructor(public container: JQuery, public config: AppConfiguration) {
        this.victimCard = new VictimCard(container);
        this.actionQueue = new TimedQueue<Action>({
            callback: (action: Action): void => {
                this.processAction(action);
                if (this.actionQueue.length() < this.config.maxQueueSize * 2 &&
                    !this.currentlyLoadingActions) {
                    this.currentlyLoadingActions = true;
                    this.getNewVictims()
                        .then((victims) => this.addNewVictims(victims))
                        .then(() => this.currentlyLoadingActions = false)
                        .catch(() => this.currentlyLoadingActions = false);
                }
            },
        });
    }

    public getAndAddNewVictims() {
        return this.getNewVictims().then((victims) => this.addNewVictims(victims));
    }

    private processAction(action: Action): void {
        this.currentAction = this.currentAction.then(() => {
            if (action.type === ActionType.fadeOut) {
                console.log("Fading out");
                return this.victimCard.fadeOut(this.config.fadeOutTime);
            } else if (action.victim && action.type === ActionType.fadeIn) {
                console.log("Fading in");
                return this.victimCard.fadeInNewVictim(action.victim, this.config.fadeInTime);
            } else {
                return new Promise<void>((_, reject) =>
                    reject("Invalid state: invalid action type " + action.type));
            }
        });
    }

    private getNewVictims(): Promise<Victim[]> {
        const request = {
            next: this.config.batchSize,
            // TODO: max of latest time and current time
            after: this.actionQueue.getLatestScheduledTime() || new Date(),
        };
        return new Promise((resolve, reject) => {
            $.get("api/schedule", request, (data: Victim[]) => {
                _.each(data, (victim: Victim) => {
                    victim.scheduledTime = new Date(victim.scheduledTime);
                });
                resolve(data);
            }, "json");
        });
    }

    private addNewVictims(victims: Victim[]) {
        _.each(victims, (victim) => {
            const fadeOutPrev = new Date(victim.scheduledTime.getTime() - this.config.fadeOutTime);
            const latestTime = this.actionQueue.getLatestScheduledTime();
            if (!latestTime || victim.scheduledTime > latestTime) {
                this.actionQueue.addLatest({
                    type: ActionType.fadeOut,
                }, fadeOutPrev);
                this.actionQueue.addLatest({
                    type: ActionType.fadeIn,
                    victim,
                }, victim.scheduledTime);
            } else {
                console.warn("EARLIER:", victim.scheduledTime,
                    this.actionQueue.getLatestScheduledTime());
            }
        });
    }
}
