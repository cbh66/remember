import * as express from "express";
import * as mongo from "mongodb";
import * as path from "path";
import * as _ from "lodash";
var MongoClient = mongo.MongoClient;
var app = express();

var mongoUrl: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/local';

var buildDir = path.resolve(__dirname + "/../");

let DURATION = 5;

function addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds*1000);
}

function randomNameSample(names: mongo.Collection, quantity: number, response: any, startTime: Date) {
    return names.aggregate([{
            "$sample": { "size": quantity }
        }]).toArray(function (err, docs) {
            docs = _.map(docs, function (doc, index) {
                return _.extend(doc, {
                    scheduledTime: addSeconds(startTime, (index * DURATION) + 1)
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

function setupAppWithDb(db: mongo.Db) {
    let names = db.collection('names');
    app.set('port', (process.env.PORT || 5000));

    app.use(express.static(__dirname));
    app.use("/build", express.static(buildDir));

    app.get('/', function(request, response) {
      response.sendFile('index.html', {root: buildDir});
    });

    app.get('/build/js/main.js', function(request, response) {
      response.sendFile('js/main.min.js', {root: buildDir});
    });

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
            quantity = (before.getTime() - after.getTime()) / (DURATION*1000);
        }
        if (!before || !_.isFinite(before.getTime()) || before.getTime > after.getTime()) {
            if (!quantity) {
                quantity = 3;
            }
            before = addSeconds(after, quantity * DURATION);
        }

        names.aggregate([{
            "$sample": { "size": quantity }
        }]).toArray(function (err, docs) {
            docs = _.map(docs, function (doc, index) {
                return _.extend(doc, {
                    scheduledTime: addSeconds(after, (index * DURATION) + 1)
                });
            });
            if (err) {
                response.status(500).end();
            } else {
                response.status(200);
                response.send(docs);
            }
        });
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
