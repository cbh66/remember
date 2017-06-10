/// <reference path="../lib/victim.d.ts" />
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as path from "path";
import TimedQueue from "../lib/TimedQueue";
import getConfig from "./configuration";
const MongoClient = mongo.MongoClient;
const app = express();

const mongoUrl: string = process.env.MONGODB_URI || "mongodb://localhost:27017/local";

const buildDir = path.resolve(__dirname + "/../../");

const config = getConfig(path.resolve(__dirname + "/../../resources/config.json"), process.env);
console.log(config);

function addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
}

// const eventProportions = {
//     "Holocaust": 430,
//     "Bosnia": 290,
//     "Armenia": 100,
//     "Cambodia": 40,
//     "Kosovo": 138,
//     "Darfur": 2,
// };
// const eventProportions = {
//     "Syria": 220,
//     "Armenia": 40,
//     "Bosnia": 130,
//     "Cambodia": 20,
//     "Darfur": 5,
//     "Holocaust": 220,
//     "Kosovo": 130,
//     "Rwanda": 130,
//     "South Sudan Civil War": 40,
//     "Sand Creek Massacre of Native Americans": 4,
//     "Argentine Dirty War": 50,
//     "Bangladesh Genocide": 3,
//     "East Timor Genocide": 8,
// };
const eventProportions = {
    "Natural Causes": 3,
    "Duel": 1
};
function proportionPercents() {
    const sum = _.reduce(eventProportions, (soFar, val) => soFar + val, 0);
    return _.mapValues(eventProportions, (num: number) => num / sum);
}

function randomlyRound(num: number) {
    return Math.random() > 0.5 ? _.ceil(num) : _.floor(num);
}

function normalizeProps(total: number) {
    const proportions = proportionPercents();
    return _.mapValues(proportions, (percent) => randomlyRound(percent * total));
}

/* Potential process for preventing repeats:
 *  - hash all the last n names
 *  - for each event with k specified names:
 *    - fetch 2,3,4 (or something) times k names (maybe depending on how
 *         many have already been hashed?)
 *    - eliminate from this list anything that's already been hashed
 *    - take the first k and add to a running list
 *  - shuffle the list
 *  - add to our cache
 */
function getNamesFromDb(names: mongo.Collection, quantity: number): Promise<Victim[]> {
    const proportions = normalizeProps(quantity);
    const promises: Array<Promise<Victim[]>> = _.values(_.mapValues(proportions, (amt, event) => {
        return new Promise((resolve, reject) => {
            names.aggregate([
                { $match: { event } },
                { $sample: { size: amt } },
            ]).toArray((err, docs) => {
                console.log("chose", amt, "from", event);
                if (err) {
                    reject(err);
                } else {
                    resolve(_.take(docs, amt));
                }
            });
        });
    }));
    return Promise.all(promises).then((results: Victim[][]) =>  {
        const totalLength = _.reduce(results, (sum, result) =>  sum + result.length, 0);
        console.log("Total grabbed:", totalLength);
        return _.shuffle(_.flatten(results));
    });
}

function valuesFromCache<T>(arr: Array<[Date, T]>, after: Date, qty: number): T[] {
    const index = _.sortedIndexBy<[Date, T]>(arr, [after, null],
                    (item) => item[0]);
    return _.map(arr.slice(index, index + qty), (item) => item[1]);
}

function setupAppWithDb(db: mongo.Db) {
    const names = db.collection("names");
    const cachedSchedule = new TimedQueue<Victim>();
    app.set("port", (process.env.PORT || 5000));

    function retrieveValues(after: Date, quantity: number): Promise<Victim> {
        const cachedValues = valuesFromCache(cachedSchedule.toArray(), after, quantity);
        const amountRemaining = quantity - cachedValues.length;
        return new Promise((resolve, reject) => {
            if (amountRemaining) { // cache miss; add to cache
                /* Possible multiple misses happen concurrently: then the cache
                 * will be added to n times; but each insertion to the cache should
                 * still be atomic.
                 */
                console.log("MISS!", "before", cachedValues.length);
                // Possibly increase size to make the call to the db worth it
                getNamesFromDb(names, Math.max(amountRemaining, config.batchSize))
                    .then((docs: Victim[]) => {
                    console.log(docs);
                    // Ensures we always add to end, with or without concurrency
                    const baseTime = cachedSchedule.getLatestScheduledTime() || new Date();
                    const extendedDocs = _.map(docs, (doc, index) => {
                        return _.extend(doc, {
                            scheduledTime: addSeconds(baseTime, (index + 1) * config.duration / 1000),
                        });
                    });
                    _.each(docs, (doc) => cachedSchedule.addLatest(doc, doc.scheduledTime));
                    resolve([
                        ...cachedValues,
                        ..._.take(docs, amountRemaining),
                    ]);
                    console.log("MISS!", "after", cachedSchedule.length());
                });
            } else { // cache hit
                console.log("HIT!", cachedValues.length);
                resolve(cachedValues);
            }
        });
    }

    app.use(express.static(__dirname));
    app.use("/build", express.static(buildDir));

    app.get("/", (request, response) => {
      response.sendFile("resources/index.html", {root: buildDir});
    });

    app.get("/read", (request, response) => {
        response.sendFile("resources/read.html", {root: buildDir});
    });

    app.get("/build/js/main.js", (request, response) => {
        response.sendFile("js/main.min.js", {root: buildDir});
    });

    app.get("/config.json", (request, response) => {
        response.json(config);
    });

    app.get("/api/all", (request, response) => {
        names.find({}).toArray((err, docs) => {
            if (err) {
                response.status(500).end();
            } else {
                response.status(200);
                response.send(docs);
            }
        });
    });

    app.get("/api/random", (request, response) => {
        const quantity: number = +(request.query.amount || request.query.next || 3);
        getNamesFromDb(names, quantity).then((values) => {
            return _.map(values, (doc, index) => {
                return _.extend(doc, {
                    scheduledTime: addSeconds(new Date(), (index + 1) * config.duration / 1000),
                });
            });
        }).then((values) => {
            response.status(200);
            response.send(values);
        }).catch((err) => {
            console.error("Error requesting", quantity, "random values", err);
            response.status(500).end();
        });
    });

    app.get("/api/schedule", (request, response) => {
        const params = request.query;
        let quantity: number = +(params.next);
        let after: Date;
        if (params.after) {
            after = new Date(params.after);
        }
        if (!after || !_.isFinite(after.getTime())) {
            after = new Date();
        }
        let before: Date;
        if (params.before) {
            before = new Date(params.before);
            quantity = (before.getTime() - after.getTime()) / (config.duration);
        }
        if (!before || !_.isFinite(before.getTime()) || before.getTime() > after.getTime()) {
            if (!quantity) {
                quantity = 100;
            }
            before = addSeconds(after, quantity * config.duration / 1000);
        }
        console.log("quantity requested", quantity);
        // TODO: reduce the quantity if it's ridiculously high
        retrieveValues(after, quantity).then((values) => {
            response.status(200);
            response.send(values);
        }).catch((err) => {
            console.error("Error requesting", quantity, "values after", after, err);
            response.status(500).end();
        });
    });
}


MongoClient.connect(mongoUrl, (err: mongo.MongoError, db: mongo.Db) => {
    if (err) {
        console.error("Error connecting to database:");
        console.error(err);
    } else {
        console.log("Connected to database");
        setupAppWithDb(db);
        app.listen(app.get("port"), () => {
          console.log("Node app is running on port", app.get("port"));
        });
    }
});
