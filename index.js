//------ SETTINGS START ------//
var db = {
  'url' : 'bolt://hobby-kmoladampbiogbkelgkfagal.dbs.graphenedb.com:24786',
  'username' : 'webConnect',
  'password' : 'b.ryA4HdyLygdx.QaFLplpKB3qWDWkX'
};

var server = {
  'ip' : '0.0.0.0',
  'port' : 1337
}

var http = require('http');
    express = require('express')
    neo4j = require('neo4j-driver').v1;
    app = express();
    driver = neo4j.driver(db.url, neo4j.auth.basic(db.username, db.password));

//------ SETTINGS END ------//

//------------------DATA START------------------//

app.get('/', function (req, res) {
    res.render('index.html', { pageCountMessage : null});
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
