/// <reference path="lib/victim.d.ts" />
import * as $ from "jquery";
import * as _ from 'lodash';
import { Promise } from "es6-promise";
import TimedQueue from './lib/TimedQueue';
import {getConfig, AppConfiguration} from "./app/configuration";

function verticallyCenter(inner: JQuery, container: JQuery): void  {
    let inHeight = inner.outerHeight();
    let conHeight = container.outerHeight();
    inner.css('margin-top', ((conHeight-inHeight)/2)+'px');
}

$(window).on('resize', function () {
    verticallyCenter($("#memorial"), $("#memorial-container"));
});

function updateMemorial(victim: Victim): void {
    let name = $("#name");
    let years = $("#years");
    let event = $("#event");
    let facts = $("#facts");

    name.html(victim.name || "");
    if (victim.birthYear || victim.deathYear) {
        years.html((victim.birthYear || "?") + " - " +
                   (victim.deathYear || "?"));
    } else {
        years.html("")
    }
    event.html(victim.event || "");
    facts.html(victim.details || "");

    verticallyCenter($("#memorial"), $("#memorial-container"));
}

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
    let loadingActions = false;
    let currentAction:  Promise<any> = Promise.resolve();
    let actionQueue: TimedQueue<Action> = new TimedQueue<Action>({
        callback: (action: Action): void => {
            currentAction = currentAction.then(() => new Promise((resolve, reject) => {
                if (action.type === ActionType.fadeOut) {
                    console.log("Fading out");
                    $("#memorial").fadeTo(action.config.fadeOutTime, 0, resolve);
                } else if (action.victim && action.type === ActionType.fadeIn) {
                    updateMemorial(action.victim);
                    console.log("Fading in");
                    $("#memorial").fadeTo(action.config.fadeInTime, 1, resolve);
                } else {
                    reject();
                }
            }));

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
