/// <reference path="../lib/victim.d.ts" />
import * as express from "express";
import * as mongo from "mongodb";
import * as path from "path";
import * as _ from "lodash";
import getConfig from "./configuration";
import TimedQueue from "../lib/TimedQueue";
var MongoClient = mongo.MongoClient;
var app = express();

const mongoUrl: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/local';

const buildDir = path.resolve(__dirname + "/../../");

const config = getConfig(path.resolve(__dirname + "/../../resources/config.json"), process.env);
console.log(config);

function addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds*1000);
}

function randomNameSample(names: mongo.Collection, quantity: number, response: any, startTime: Date) {
    return names.aggregate([{
            "$sample": { "size": quantity }
        }]).toArray(function (err, docs) {
            docs = _.map(docs, function (doc, index) {
                return _.extend(doc, {
                    scheduledTime: addSeconds(startTime, (index * config.duration/1000) + 1)
                });
            });
            if (err) {
                response.status(500).end();
            } else {
                response.status(200);
                response.send(docs);
            }
        });
}

function valuesFromCache<T>(arr: [Date, T][], after: Date, qty: number): T[] {
    const index = _.sortedIndexBy<[Date, T]>(arr, [after, null], item => item[0]);
    return _.map(arr.slice(index, index + qty), item => item[1]);
}

function setupAppWithDb(db: mongo.Db) {
    let names = db.collection('names');
    let cachedSchedule = new TimedQueue<Victim>();
    app.set('port', (process.env.PORT || 5000));

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
                names.aggregate([{
                    "$sample": {
                        "size": Math.max(amountRemaining, config.batchSize)
                    }
                }]).toArray(function (err, docs) {
                    // Ensures we always add to end, with or without concurrency
                    const baseTime = cachedSchedule.getLatestScheduledTime() || new Date();
                    docs = _.map(docs, function (doc, index) {
                        return _.extend(doc, {
                            scheduledTime: addSeconds(baseTime, (index+1) * config.duration/1000)
                        });
                    });
                    _.each(docs, doc => cachedSchedule.addLatest(doc, doc.scheduledTime));
                    if (err) {
                        reject(err);
                    } else {
                        resolve([
                            ...cachedValues,
                            ..._.take(docs, amountRemaining)
                        ]);
                    }
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

    app.get('/', function(request, response) {
      response.sendFile('resources/index.html', {root: buildDir});
    });

    app.get('/read', function (request, response) {
        response.sendFile('read.html', {root: buildDir});
    });

    app.get('/build/js/main.js', function(request, response) {
        response.sendFile('js/main.min.js', {root: buildDir});
    });

    app.get('/config.json', function (request, response) {
        response.json(config);
    })

    app.get('/api/all', function(request, response) {
        names.find({}).toArray(function (err, docs) {
            if (err) {
                response.status(500).end();
            } else {
                response.status(200);
                response.send(docs);
            }
        });
    });

    app.get('/api/random', function(request, response) {
        let quantity: number = +(request.query.amount || 3);
        randomNameSample(names, quantity, response, new Date());
    });

    app.get('/api/schedule', function(request, response) {
        let params = request.query;
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
            before = addSeconds(after, quantity * config.duration/1000);
        }
        console.log("quantity requested", quantity);
        //TODO: reduce the quantity if it's ridiculously high
        retrieveValues(after, quantity).then((values) => {
            response.status(200);
            response.send(values);
        }).catch((err) => {
            console.error("Error requesting", quantity, "values after", after, err);
            response.status(500).end();
        })
    });
}


MongoClient.connect(mongoUrl, function (err: mongo.MongoError, db: mongo.Db) {
    if (err) {
        console.error("Error connecting to database:");
        console.error(err);
    } else {
        console.log("Connected to database");
        setupAppWithDb(db);
        app.listen(app.get('port'), function() {
          console.log('Node app is running on port', app.get('port'));
        });
    }
});
