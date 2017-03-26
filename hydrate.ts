import * as mongo from "mongodb";
var MongoClient = mongo.MongoClient;

var mongoUrl: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/local';

var seedData = [
    {
        name: "Aaron Burr",
        event: "Natural Causes",
        birthYear: 1756,
        deathYear: 1836,
        details: "Was a butt"
    },
    {
        name: "Thomas Jefferson",
        event: "Fiftieth Anniversary of US",
        birthYear: 1743,
        deathYear: 1826,
        details: "Slaveowner and father of US"
    },
    {
        name: "Button Gwinnett",
        event: "Duel",
        deathYear: 1777
    },
    {
        name: "John Hancock",
        birthYear: 1737,
        deathYear: 1793,
        event: "Natural Causes"
    },
    {
        name: "Ben Franklin",
        deathYear: 1790,
        event: "Natural Causes",
        details: "Loved France; polymath"
    },
    {
        name: "Elbridge Gerry",
        birthYear: 1744,
        deathYear: 1814,
        event: "Died in Office",
        details: "Only founding father buried in Washington DC"
    },
    {
        name: "Josiah Bartlett",
        birthYear: 1729,
        deathYear: 1795,
        event: "Natural Causes"
    },
    {
	name: "Alexander Hamilton",
	birthYear: 1755,
	deathYear: 1804,
	event: "Duel"
    },
    {
	name: "Roger Sherman",
	birthYear: 1721,
	deathYear: 1793,
	event: "Typhoid"
    },
    {
	name: "Robert Morris",
	birthYear: 1734,
	deathYear: 1806,
	event: "Natural Causes"
    },
    {
	name: "George Read",
	birthYear: 1733,
	deathYear: 1798,
	event: "Natural Causes"
    },
    {
	name: "Sam Adams",
	birthYear: 1722,
	deathYear: 1803,
	event: "Natural Causes"
    },
    {
	name: "George Washington",
	birthYear: 1732,
	deathYear: 1799,
	event: "Natural Causes"
    }
];

function connectNtimes(n: number, err?: mongo.MongoError) {
    if (n <= 0) {
        throw err;
    }
    MongoClient.connect(mongoUrl, function (err: mongo.MongoError, db: mongo.Db) {
        if (err) {
            console.error("Error connecting to database....");
            setTimeout(10000, function () {connectNtimes(n-1, err);});
        } else {
            var names = db.collection('names');
            console.log("Clearing database to start fresh");
            names.remove({});
            names.insert(seedData, function (err, result) {
                if (err) throw err;
                console.log("Database successfully seeded");
                db.close();
            });
        }
    });
}
connectNtimes(5);
