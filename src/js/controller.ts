/// <reference path="lib/jquery.d.ts" />
/// <reference path="Queue.ts" />
/// <reference path="victim.d.ts" />
function verticallyCenter(inner: JQuery, container: JQuery): void  {
    var inHeight = inner.outerHeight();
    var conHeight = container.outerHeight();
    inner.css('margin-top', ((conHeight-inHeight)/2)+'px');
}

$(window).on('resize', function () {
    verticallyCenter($("#memorial"), $("#memorial-container"));
});

function updateMemorial(victim: Victim): void {
    var name = $("#name");
    var years = $("#years");
    var event = $("#event");
    var facts = $("#facts");

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

function addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds*1000);
}

var testContent : Array<Victim> = [
    {
        name: "Aaron Burr",
        event: "Natural Causes",
        birthYear: 1756,
        deathYear: 1836,
        details: "Was a butt",
        scheduledTime: addSeconds(new Date(), 1)
    },
    {
        name: "Thomas Jefferson",
        event: "Fiftieth Anniversary of US",
        birthYear: 1743,
        deathYear: 1826,
        details: "Slaveowner and father of US",
        scheduledTime: addSeconds(new Date(), 6)
    },
    {
        name: "Button Gwinnett",
        event: "Duel",
        deathYear: 1777,
        scheduledTime: addSeconds(new Date(), 11)
    },
    {
        name: "John Hancock",
        birthYear: 1737,
        deathYear: 1793,
        event: "Natural causes",
        scheduledTime: addSeconds(new Date(), 16)
    },
    {
        name: "Ben Franklin",
        deathYear: 1790,
        event: "Natural causes",
        scheduledTime: addSeconds(new Date(), 21),
        details: "Loved France; polymath"
    },
    {
        name: "Elbridge Gerry",
        birthYear: 1744,
        deathYear: 1814,
        event: "Died in Office",
        scheduledTime: addSeconds(new Date(), 26),
        details: "Only founding father buried in Washington DC"
    },
    {
        name: "Josiah Bartlett",
        birthYear: 1729,
        deathYear: 1795,
        event: "Natural causes",
        scheduledTime: addSeconds(new Date(), 31)
    }
];

var victimList: Queue<any> = new Queue<any>();
for (var i = 0; i < testContent.length; ++i) {
    victimList.enqueue(testContent[i])
}

function updateMemorialLoop(): void {
    console.log("Starting loop");
    var nextVictim = victimList.dequeue();
    if (!nextVictim) {
        return console.error("Could not retrieve more names");
    }
    updateMemorial(nextVictim);

    // TODO: to stay synchronized, wait time should reflect how long info is visible,
    //    not how long between victims
    var waitTime: number;  // To stay synchronized
    if (nextVictim.scheduledTime) {
        waitTime = nextVictim.scheduledTime.getTime() - new Date().getTime()
    } else {
        waitTime = 0;
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
    updateMemorialLoop();
});
