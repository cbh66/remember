/// <reference path="lib/jquery.d.ts" />
/// <reference path="Queue.ts" />
/// <reference path="victim.d.ts" />
import TimedQueue from './TimedQueue';
import * as _ from 'lodash';
import {getConfig, AppConfiguration} from "./configuration";

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

let victimList: TimedQueue<Victim> = new TimedQueue<Victim>({
    callback: (victim: Victim): void => {
        if (!config) return;
        updateMemorial(victim);
        console.log("Fading in");
        $("#memorial").fadeTo(config.fadeInTime, 1, function () {
            console.log("Faded in");
            if (!config) return;
            setTimeout(function () {
                console.log("Fading out");
                if (!config) return;
                $("#memorial").fadeTo(config.fadeOutTime, 0);
            }, config.duration - config.fadeInTime - config.fadeOutTime);
        });

        if (victimList.length() < config.maxQueueSize) {
            addNewVictims(config);
        }
    }
});

let config: AppConfiguration|null = null;

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
function addNewVictims(config: AppConfiguration, callback?: (config: AppConfiguration)=>void) {
    const nonNullCallback = callback || _.noop;
    console.log("trying to add...");
    /* TODO: Retry on fail after some time and try again a few seconds
     *     after a failure
     */
    $.get("api/schedule", {next: config.batchSize}, function (data: Victim[]) {
        _.each(data, function (victim: Victim) {
            victim.scheduledTime = new Date(victim.scheduledTime);
            if (victim.scheduledTime >= victimList.getLatestScheduledTime()) {
                victimList.addLatest(victim, victim.scheduledTime);
            } else {
                console.warn("EARLIER:", victim.scheduledTime, victimList.getLatestScheduledTime());
            }
        });
        console.log(data);
        nonNullCallback(config);
    }, "json");
}

$(document).ready(function () {
    getConfig(function (conf: AppConfiguration) {
        config = conf;
        addNewVictims(conf/*, updateMemorialLoop*/);
    });
});
