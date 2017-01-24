import * as express from "express";
import * as mongo from "mongodb";
var MongoClient = mongo.MongoClient;
var app = express();

var mongoUrl: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/local';
console.log(mongoUrl);

function setupAppWithDb(db: mongo.Db) {
    var names = db.collection('names');
    app.set('port', (process.env.PORT || 5000));

    app.use(express.static(__dirname));
    app.use("/build", express.static(__dirname + "/build"));

    app.get('/', function(request, response) {
      response.sendFile('index.html');
    });

    app.get('/build/js/main.js', function(request, response) {
      response.sendFile('./build/js/main.min.js', {root: __dirname});
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
