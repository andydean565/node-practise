//------ SETTINGS START ------//
var db = {
  'url' : 'bolt://hobby-kmoladampbiogbkelgkfagal.dbs.graphenedb.com:24786',
  'username' : 'webConnect',
  'password' : 'b.ryA4HdyLygdx.QaFLplpKB3qWDWkX'
};

var server = {
  'ip' : process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  'port' : process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080
}

var http = require('http'),
    express = require('express'),
    ejs = require('ejs'),
    neo4j = require('neo4j-driver').v1,
    app = express(),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    driver = neo4j.driver(db.url, neo4j.auth.basic(db.username, db.password));

    app.engine('html', ejs.renderFile);
    app.use(bodyParser.json());
    app.use(cors());
    app.use(express.static(__dirname + '../view'));

//------ SETTINGS END ------//

//------------------DATA START------------------//

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function (req, res) {res.render('index.html');});

app.get('/addemployee', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json("{a : 1}");
});


//------------------DATA END------------------//

//------------------ERRORS START------------------//

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

//------------------ERRORS END------------------//

//------------------APP START------------------//

app.listen(server.port, server.ip);
console.log('Server running on http://%s:%s', server.ip, server.port);

module.exports = app ;

//------------------APP END------------------//
