
function verticallyCenter(innerId, containerId)  {
    var container = document.getElementById(containerId);
    var inner = document.getElementById(innerId);

    var inHeight = inner.offsetHeight;
    var conHeight = container.offsetHeight;

    inner.style.marginTop = ((conHeight-inHeight)/2)+'px';
}

window.onresize = function () {
    verticallyCenter("memorial", "memorial-container");
};

function fade(id, start, end, time, callback) {
    var increment = (end - start) / (100 * time);
    var element = document.getElementById("memorial")
    var op = start;  // initial opacity
    var timer = setInterval(function () {
        if ((op >= end && end >= start) ||
            (op <= end && end <= start)) {
            element.style.opacity = end;
            clearInterval(timer);
            if (callback) {
                callback();
            }
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += increment;
    }, 10);  // 100 updates per second
}

function fadeIn(id, length, callback) {
    fade(id, 0, 1, length, callback);
}
function fadeOut(id, length, callback) {
    fade(id, 1, 0, length, callback);
}

function updateMemorial(victim) {
    var name = document.getElementById("name");
    var years = document.getElementById("years");
    var event = document.getElementById("event");
    var facts = document.getElementById("facts");

    name.innerHTML = victim.name || "";
    if (victim.birthYear || victim.deathYear) {
        years.innerHTML = (victim.birthYear || "?") +
                 " - " +  (victim.deathYear || "?");
    } else {
        years.innerHTML = "";
    }
    event.innerHTML = victim.event || "";
    facts.innerHTML = victim.details || "";
    verticallyCenter("memorial", "memorial-container");
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
    victimList.enqueue(testContent[i])
}

function updateMemorialLoop() {
    console.log("Starting loop");
    var nextVictim = victimList.dequeue();
    if (!nextVictim) {
        return console.error("Could not retrieve more names");
    }
    updateMemorial(nextVictim);
    var waitTime;  // To stay synchronized
    if (nextVictim.scheduledTime) {
        waitTime = nextVictim.scheduledTime.getTime() - new Date().getTime()
    } else {
        waitTime = 0;
    }
    setTimeout(function () {
        console.log("Fading in");
        fadeIn("memorial", 1, function () {
            console.log("Faded in");
            setTimeout(function () {
                console.log("Fading out");
                fadeOut("memorial", 1, updateMemorialLoop);
            }, 5 * 1000);
        });
    }, waitTime);
}

updateMemorialLoop();
