/// <reference path="lib/victim.d.ts" />
import * as $ from "jquery";
import * as _ from 'lodash';
import { Promise } from "es6-promise";
import VictimCard from "./app/VictimCard";
import TimedQueue from './lib/TimedQueue';
import { getConfig, AppConfiguration } from "./app/configuration";

enum ActionType {
    fadeIn,
    fadeOut
}
interface Action {
    type: ActionType,
    victim?: Victim,  // if action type is fadeIn
    config: AppConfiguration
}

$(document).ready(function () {
    let memorial = new VictimCard($("#memorial-container"));
    let loadingActions = false;
    let currentAction:  Promise<void> = Promise.resolve<void>(undefined);
    let actionQueue: TimedQueue<Action> = new TimedQueue<Action>({
        callback: (action: Action): void => {
            currentAction = currentAction.then(() => {
                if (action.type === ActionType.fadeOut) {
                    console.log("Fading out");
                    return memorial.fadeOut(action.config.fadeOutTime);
                } else if (action.victim && action.type === ActionType.fadeIn) {
                    console.log("Fading in");
                    return memorial.fadeInNewVictim(action.victim, action.config.fadeInTime);
                } else {
                    return new Promise<void>((_, reject) =>
                        reject("Invalid state: invalid action type " + action.type));
                }
            });

            if (actionQueue.length() < action.config.maxQueueSize*2 &&
                !loadingActions) {
                loadingActions = true;
                getNewVictims(action.config)
                    .then((victims) => addNewVictims(victims, action.config))
                    .then(() => loadingActions = false)
                    .catch(() => loadingActions = false);
            }
            console.log(_.map(actionQueue.toArray(), (elem) => elem[1].type));
        }
    });

    function getNewVictims(config: AppConfiguration): Promise<Victim[]> {
        console.log("trying to add...");
        /* TODO: Retry on fail after some time and try again a few seconds
         *     after a failure
         */
        const request = {
            next: config.batchSize,
            // TODO: max of latest time and current time
            after: actionQueue.getLatestScheduledTime() || new Date()
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

    function addNewVictims(victims: Victim[], config: AppConfiguration) {
        _.each(victims, (victim) => {
            const fadeOutPrev = new Date(victim.scheduledTime.getTime() - config.fadeOutTime)
            if (victim.scheduledTime > actionQueue.getLatestScheduledTime()) {
                actionQueue.addLatest({
                    type: ActionType.fadeOut,
                    config
                }, fadeOutPrev);
                actionQueue.addLatest({
                    type: ActionType.fadeIn,
                    victim,
                    config
                }, victim.scheduledTime);
            } else {
                console.warn("EARLIER:", victim.scheduledTime, actionQueue.getLatestScheduledTime());
            }
        });
    }

    getConfig()
        .then((config) => getNewVictims(config).then((victims) => addNewVictims(victims, config)))
        .catch((conf) => console.error("Badly formed configuration", conf));
});
