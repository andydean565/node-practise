//------ SETTINGS START ------//
var db = {
  'url' : 'bolt://127.0.0.1',
  'port' : '7687',
  'username' : 'neo4j',
  'password' : 'neo4j'
};

var server = {
  'ip' : process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  'port' : process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 1337
}

var codes = {
  'success' : 1,
  'dbError' : 2,
  'inputError' : 3,
  'unknown' : 4
}

var labels = {
  'employee' : 'Employee',
  'department' : 'Department',
  'team': 'Team',
  'match': 'Match'
}

//------------------MODELS START------------------//

var employeeModel = ['first_name', 'surename', 'email', 'job_title'];
var departmentModel = ['name', 'description'];

//------------------MODELS END------------------//


var http = require('http'),
    express = require('express'),
    ejs = require('ejs'),
    neo4j = require('neo4j-driver').v1,
    app = express(),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    driver = neo4j.driver((db.url + ":" + db.port), neo4j.auth.basic(db.username, db.password));

    app.engine('html', ejs.renderFile);
    app.use(bodyParser.urlencoded({ extended: true }));
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

//add employee
app.post('/addEmployee', function (req, res) {

  var parameters = setPara(employeeModel, req.body);
  var params = createPara(parameters);
  var statement = "", end = ""
  //department
  if(req.body.department){
    statement += "MATCH(d:Department{name : {department}}) ";
    parameters.department = req.body.department.name;
    end += "CREATE (e)-[r:IN]->(d)";
  }

  statement += "MERGE (e:" + labels.employee + " {" + params + "}) ";
  statement += end;

  //start session
  var session = driver.session();
  session.run(statement, parameters).subscribe({
    onNext: function (record) {
      console.log(record);
    },
    onCompleted: function () {
      res.json(codes.success);
      session.close();
    },
    onError: function (error) {
      res.json(codes.dbError);
      console.log(error);
    }
  });
});

//assign department
app.post('/assignDepartment', function (req, res) {

  var employee = setPara(employeeModel, req.body);
  employee.department = setPara(departmentModel, req.body.department);

  var parameters = {
    "email" : employee.email,
    "department" : employee.department.name
  }

  var statement = "MATCH (e:Employee{email:{email}}), ";
  statement += "(d:Department{name:{department}})";
  var end = "CREATE (e)-[r:IN]->(d)";
  statement += end;
  //start session
  var session = driver.session();
  session.run(statement, parameters).subscribe({
    onNext: function (record) {
      console.log(record);
    },
    onCompleted: function () {
      res.json(codes.success);
      session.close();
    },
    onError: function (error) {
      res.json(codes.dbError);
      console.log(error);
    }
  });
});

//assign manager
app.post('/assignManager', function (req, res) {

  var parameters = {
    "email" : req.body.email,
    "manager" : req.body.manager.email
  }

  var statement = "", end = "";
  //match employee
  statement += "MATCH (e:Employee{email:{email}}), ";
  //match department
  statement += "(m:Employee{email:{manager}})";
  //create
  end += "CREATE (e)-[r:MANAGER]->(m)";
  statement += end;
  //start session
  var session = driver.session();
  session.run(statement, parameters).subscribe({
    onNext: function (record) {
      console.log(record);
    },
    onCompleted: function () {
      res.json(codes.success);
      session.close();
    },
    onError: function (error) {
      res.json(codes.dbError);
      console.log(error);
    }
  });
});

//add department
app.post('/addDepartment', function (req, res) {
  var parameters = setPara(departmentModel, req.body);
  var params = createPara(parameters);
  var statement = "MERGE (d:" + labels.department + " {" + params + "}) RETURN d";

  //start session
  var session = driver.session();
  session.run(statement, parameters).subscribe({
    onNext: function (record) {console.log(record);},
    onCompleted: function () {
      res.json(codes.success);
      session.close();
    },
    onError: function (error) {
      res.json(codes.dbError);
      console.log(error);
    }
  });
});

//get employees
app.get('/Employees', function (req, res) {

  var input = req.body;
  var statement = 'MATCH (e:Employee)';
  var back = ' RETURN e'
  //department
  statement += 'OPTIONAL MATCH (e)-[r:IN]->(d:Department)';
  back += ',d';
  //manager
  statement += 'OPTIONAL MATCH (e)-[g:MANAGER]->(m:Employee)';
  back += ',m';
  statement = statement + back;
  var data = [];
  var session = driver.session();
  session.run(statement).subscribe({
    onNext: function (record) {data.push(record);},
    onCompleted: function () {
      res.json(data);
      session.close();
    },
    onError: function (error) {
      res.json(codes.dbError);
      console.log(error);
    }
  });
});

app.get('/departments', function (req, res) {

  var input = req.body;
  var statement = 'MATCH (d:' + labels.department + ')';
  var back = ' RETURN d'
  statement = statement + back;
  var data = [];

  //start session
  var session = driver.session();
  session.run(statement).subscribe({
    onNext: function (record) {
      data.push(record);
    },
    onCompleted: function () {
      res.json(data);
      session.close();
    },
    onError: function (error) {
      res.json(codes.dbError);
      console.log(error);
    }
  });
});

//------------------DATA END------------------//

//------------------FUNCTION START------------------//

function setPara(model, parameters){
  var obj = {};
  model.forEach(function(prop) {obj[prop] = parameters[prop];});
  return obj;
}

function createPara(parameters){
  var params = "", i = 0;
  var last = lastInObj(parameters);
  for (const field in parameters) {
    if(field != undefined || parameters[field] !== undefined){
      params += "" + field + ": {" + field + "}";
      if(last !== i){params += ", ";}
      i++;
    }
  }
  return params;
}

function lastInObj(parameters){
  var keys = Object.keys(parameters);
  var last = (keys.length - 1);
  return last;
}

//------------------FUNCTION END------------------//

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
