import * as express from "express";
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname));
app.use("/build", express.static(__dirname + "/build"));

app.get('/', function(request, response) {
  response.sendFile('index.html');
});

app.get('/build/js/main.js', function(request, response) {
  response.sendFile('./build/js/main.min.js', {root: __dirname});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
