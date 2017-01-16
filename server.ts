import * as express from "express";
import * as mongo from "mongodb";
var MongoClient = mongo.MongoClient;
var app = express();

var mongoUrl: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/local';
console.log(mongoUrl);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname));
app.use("/build", express.static(__dirname + "/build"));

app.get('/', function(request, response) {
  response.sendFile('index.html');
});

app.get('/build/js/main.js', function(request, response) {
  response.sendFile('./build/js/main.min.js', {root: __dirname});
});

MongoClient.connect(mongoUrl, function (err, db) {
    if (err) {
        console.error("Error connecting to database:");
        console.error(err);
    } else {
        console.log("Connected to database");
        app.listen(app.get('port'), function() {
          console.log('Node app is running on port', app.get('port'));
        });
    }
});
