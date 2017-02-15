/// <reference path="lib/jquery.d.ts" />
/// <reference path="Queue.ts" />
/// <reference path="victim.d.ts" />
import Queue from './Queue';
import * as _ from 'lodash';

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

let victimList: Queue<Victim> = new Queue<Victim>();

function updateMemorialLoop(): void {
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
        $("#memorial").fadeTo(1 * 1000, 1, function () {
            console.log("Faded in");
            setTimeout(function () {
                console.log("Fading out");
                $("#memorial").fadeTo(1 * 1000, 0, updateMemorialLoop);
            }, 3 * 1000);
        });
    }, waitTime);
}

$(document).ready(function () {
    console.log("trying....");
    /* TODO: Retry on fail after some time
     * TODO: Try again:
     *   - when the queue is empty
     *   - a few seconds after a failure
     *   - every few seconds in chunks if queue is below a certain capacity
     *   - a few minutes after the queue reaches capacity
     */
    $.get("api/schedule", function (data: Victim[]) {
        _.each(data, function (victim: Victim) {
            victim.scheduledTime = new Date(victim.scheduledTime);
            victimList.enqueue(victim);
        });
        console.log(data);
        updateMemorialLoop();
    }, "json");
});
