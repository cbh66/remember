function verticallyCenter(inner, container) {
    var inHeight = inner.outerHeight();
    var conHeight = container.outerHeight();
    inner.css('margin-top', ((conHeight - inHeight) / 2) + 'px');
}
$(window).on('resize', function () {
    verticallyCenter($("#memorial"), $("#memorial-container"));
});
function updateMemorial(victim) {
    var name = $("#name");
    var years = $("#years");
    var event = $("#event");
    var facts = $("#facts");
    name.html(victim.name || "");
    if (victim.birthYear || victim.deathYear) {
        years.html((victim.birthYear || "?") + " - " +
            (victim.deathYear || "?"));
    }
    else {
        years.html("");
    }
    event.html(victim.event || "");
    facts.html(victim.details || "");
    verticallyCenter($("#memorial"), $("#memorial-container"));
}
var testContent = [
    {
        name: "Anne Frank",
        birthYear: 1929,
        deathYear: 1945,
        event: "Holocaust",
        details: "Favorite color: green"
    },
    {
        name: "Mary Karungi",
        deathYear: 1994,
        event: "Rwandan Genocide"
    },
    {
        name: "Unknown",
        event: "Armenian Genocide",
        details: "We known very few names of the victims of the Armenian genocide."
    }
];
var victimList = new Queue();
for (var i = 0; i < testContent.length; ++i) {
    victimList.enqueue(testContent[i]);
}
function updateMemorialLoop() {
    console.log("Starting loop");
    var nextVictim = victimList.dequeue();
    if (!nextVictim) {
        return console.error("Could not retrieve more names");
    }
    updateMemorial(nextVictim);
    // TODO: to stay synchronized, wait time should reflect how long info is visible,
    //    not how long between victims
    var waitTime; // To stay synchronized
    if (nextVictim.scheduledTime) {
        waitTime = nextVictim.scheduledTime.getTime() - new Date().getTime();
    }
    else {
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
