/// <reference path="lib/jquery.d.ts" />
/// <reference path="Queue.ts" />
/// <reference path="victim.d.ts" />
import TimedQueue from './TimedQueue';
import * as _ from 'lodash';
import {getConfig, AppConfiguration} from "./configuration";
import { Promise } from "es6-promise";

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

let actionQueue: TimedQueue<Action> = new TimedQueue<Action>({
    callback: (action: Action): void => {
        if (action.type === ActionType.fadeOut) {
            console.log("Fading out");
            $("#memorial").fadeTo(action.config.fadeOutTime, 0)
        } else if (action.victim && action.type === ActionType.fadeIn) {
            updateMemorial(action.victim);
            console.log("Fading in");
            $("#memorial").fadeTo(action.config.fadeInTime, 1);
        }

        if (actionQueue.length() < action.config.maxQueueSize*2) {
            addNewVictims(action.config);
        }
        console.log(_.map(actionQueue.toArray(), (elem) => elem[1].type));
    }
});
/*
function updateMemorialLoop(config: AppConfiguration): void {
    console.log("Starting loop");
    let currentVictim = victimList.dequeue();
    if (!currentVictim) {
        return console.error("Could not retrieve more names");
    }
    updateMemorial(currentVictim);

    // TODO: to stay synchronized, wait time should reflect how long info is visible,
    //    not how long between victims
    let waitTime: number = 0;  // To stay synchronized
    if (currentVictim.scheduledTime) {
        waitTime = currentVictim.scheduledTime.getTime() - new Date().getTime()
    }
    setTimeout(function () {
        console.log("Fading in");
        $("#memorial").fadeTo(config.fadeInTime, 1, function () {
            console.log("Faded in");
            setTimeout(function () {
                console.log("Fading out");
                $("#memorial").fadeTo(config.fadeOutTime, 0, function () {
                    updateMemorialLoop(config);
                });
            }, config.duration - config.fadeInTime - config.fadeOutTime);
        });
    }, waitTime);
    console.log("Length: " + victimList.getLength());
    if (victimList.getLength() < config.maxQueueSize) {
        addNewVictims(config);
    }
}
*/
function addNewVictims(config: AppConfiguration): Promise<AppConfiguration> {
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
        }, "json");
    })

}

$(document).ready(function () {
    getConfig(function (conf: AppConfiguration) {
        addNewVictims(conf/*, updateMemorialLoop*/);
    });
});
