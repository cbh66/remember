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
        event: "Natural causes"
    },
    {
        name: "Ben Franklin",
        deathYear: 1790,
        event: "Natural causes",
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
        event: "Natural causes"
    }
];

MongoClient.connect(mongoUrl, function (err: mongo.MongoError, db: mongo.Db) {
    if (err) {
        console.error("Error connecting to database:");
        throw err;
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