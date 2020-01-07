//require the necessary modules
const express = require('express');
let app = express();
const bodyParser = require('body-parser');

//Database variables
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;

//View engine
app.set("view engine", "pug");

//Set up the routes
app.use(bodyParser.json());
app.get("/questions", displayQs);
app.get("/questions/:qID", dispSingle);
app.get("/createquiz/", createQ);
app.get("/quizzes", displayQuizs);
app.get("/quiz/:quizID", dispSingleQuiz);
app.post("/quizzes", saveQuiz);

//function to display all the questions
function displayQs(req, res, next){
  let qArr = [];
  let searchObj = {};
  //if no query parameters were passed then find the first 25 questions form the questions collection and store them in an array
  //then send the appropriate response
  if (Object.keys(req.query).length === 0){
    db.collection("questions").find().toArray(function(err, result) {
  	 if (err) throw err;
     let i=0;
     while (i<26){
       qArr.push(result[i]);
       i++;
     }
     //console.log(qArr);
     res.format({
      'text/html': function () {
        res.render('questions', {questions: qArr});
      },

      'application/json': function () {
        console.log("JSON req");
        let jObj = {};
        jObj['questions'] = qArr;
        res.status(200).send(jObj);
      },

      'default': function () {
          res.status(406).send('Not Acceptable')
        }
      })
    });
  }
  else{
    //create an object to specify search fields for the database
    //this object will contain a category and/or difficulty attribute
    if (req.query.category !=undefined && req.query.difficulty !=undefined){
      searchObj["category"] = req.query.category;
      console.log(searchObj["category"]);
      searchObj["difficulty"] = req.query.difficulty;
      console.log(searchObj["difficulty"]);
    }
    else if (req.query.category !=undefined){
      searchObj["category"] = req.query.category;
      console.log(searchObj["category"]);
    }
    else{
      searchObj["difficulty"] = req.query.difficulty;
      console.log(searchObj["difficulty"]);
    }
    db.collection("questions").find(searchObj).toArray(function(err, result) {
     if (err) throw err;
     //if there are more than 25 questions that meet the criteria, only store 25
     //otherwise store all questions that meet the criteria
     if (result.length>25){
       let i=0;
       while (i<25){
         qArr.push(result[i]);
         i++;
       }
     }
     else{
       //console.log(result);
       result.forEach((item)=>{
        qArr.push(item);
       });
     }
     //send the appropriate response
     res.format({
      'text/html': function () {
        res.render('questions', {questions: qArr});
      },

      'application/json': function () {
        let jObj = {};
        jObj['questions'] = qArr;
        console.log("JSON req");
        res.status(200).send(jObj);
      },

      'default': function () {
          res.status(404).send('Not Acceptable')
        }
      })
    });
  }

}

//function that displays a specific question
function dispSingle(req, res, next){
  //create an object id using the request parameter
  let oid;
	try{
		oid = new mongo.ObjectID(req.params.qID);
	}catch{
		res.status(404).send("Unknown ID");
		return;
	}
  console.log("Object iD:");
  console.log(oid);
  //if the request parameter is valid then send the information about the question in the requested format
	db.collection("questions").findOne({"_id":oid}, function(err, result){
		if(err){
			res.status(404).send("Error reading database.");
			return;
		}
		if(!result){
			res.status(404).send("Error: Unknown ID");
			return;
		}
    res.format({
     'text/html': function () {
       res.status(200).render("singleQuestion", {question: result});
     },

     'application/json': function () {
       console.log("JSON req");;
       res.status(200).send(result);
     },

     'default': function () {
         res.status(406).send('Not Acceptable')
       }
     })

	});
}

//functiin that renders the quiz creatioon page
async function createQ(req, res, next){
  //get all the possible difficulty and category values
  let categories = await db.collection("questions").distinct("category");
  let difficulties = await db.collection("questions").distinct("difficulty");
  console.log(categories);
  console.log(difficulties);
  //render the quiz creatioon page
  res.render("createQuiz", {categories: categories, difficulties: difficulties});
}

//function to display all quizzes in the database
function displayQuizs(req, res, next){
  let quArr = [];
  let searchObj = {};
  //if no query parameters were passed then find all quizzes in the quizzes collection
  //then send the appropriate response with the results
  if (Object.keys(req.query).length === 0){
    db.collection("quizzes").find().toArray(function(err, result) {
  	 if (err) throw err;
     res.format({
      'text/html': function () {
        res.render('quizzes', {quizzes: result});
      },

      'application/json': function () {
        console.log("JSON req");
        let jObj = {};
        jObj['quizzes'] = result;
        res.status(200).send(jObj);
      },

      'default': function () {
          res.status(406).send('Not Acceptable')
        }
      })
    });
  }
  else{
    //create an object to specify search fields for the database
    //this object will contain a Creator and/or Tags attribute
    //use regex to make sure that Creator supports partial string amtching and case insensitivity
    //use  regex to make sure that Tags supports case insensitivity
    if (req.query.creator !=undefined && req.query.tag !=undefined){
      searchObj["Creator"] = {"$regex":req.query.creator, "$options": 'i'};
      console.log(searchObj["Creator"]);
      searchObj["Tags"] = {"$regex":req.query.tag, "$options": 'i'};
      console.log(searchObj["Tags"]);
    }
    else if (req.query.creator !=undefined){
      searchObj["Creator"] = {"$regex":req.query.creator, "$options": 'i'};
      console.log(searchObj["Creator"]);
    }
    else{
      searchObj["Tags"] = {"$regex":req.query.tag, "$options": 'i'};
      console.log(searchObj["Tags"]);
    }
    db.collection("quizzes").find(searchObj).toArray(function(err, result) {
     if (err) throw err;
     console.log(result);
     //send the results with an approrate response
     res.format({
      'text/html': function () {
        res.render('quizzes', {quizzes: result});
      },

      'application/json': function () {
        let jObj = {};
        jObj['quizzes'] = result;
        console.log("JSON req");
        res.status(200).send(jObj);
      },

      'default': function () {
          res.status(404).send('Not Acceptable');
        }
      })
    });
  }
}

//function that displays a specific quiz
function dispSingleQuiz(req, res, next){
  //create an object id using the request parameter
  let oid;
	try{
		oid = new mongo.ObjectID(req.params.quizID);
	}catch{
    console.log("can't convert");
		res.status(404).send("Unknown ID");
		return;
	}
  console.log("Object ID:");
  console.log(oid);
  //if the request parameter is valid then send the information about the quiz in the requested format
	db.collection("quizzes").findOne({"_id":oid}, function(err, result){
		if(err){
			res.status(404).send("Error reading database.");
			return;
		}
		if(!result){
      console.log("No id in db");
			res.status(404).send("Error: Unknown ID");
			return;
		}
    res.format({
     'text/html': function () {
       res.status(200).render("singleQuiz", {quiz: result});
     },

     'application/json': function () {
       console.log("JSON req");;
       res.status(200).send(result);
     },

     'default': function () {
         res.status(404).send('Not Acceptable')
       }
     })

	});
}

//function to handle the post request and save the quiz
async function saveQuiz(req, res, next){
  console.log("Recieved post");
  console.log(req.body);
  let flag = false; //variable that validates wheter a quiz should be saved or not
  let quiz = req.body;
  //if the creator/tags are not supplied then trigger the flag
  if (quiz.Creator == undefined || quiz.Creator== "" || quiz.Tags == undefined || quiz.Tags == ""){
    console.log("filed undefined");
    flag = true;
  }
  //search all questions that were saved in the quiz and make sure they are valid questions in the Database
  //otherwise trigger the flag
  quiz["Questions"].forEach((item)=>{
    let oid = new mongo.ObjectID(item._id);
  	db.collection("questions").findOne({"_id":oid}, function(err, result){
  		if(err){
        console.log("ERR");
        flag = true;
  		}
  		if(!result){
        console.log("No match");
        flag = true;
  		}
  	});
  });
  //if no questions were saved then trigger the flag
  if (quiz["Questions"].length == 0){
    console.log("No questions");
    flag = true;
  }
  //insert the quiz to the quizzes database
  db.collection("quizzes").insertOne(quiz, function(err, result){
	  if(err) throw err;
    console.log("Worked");
    let str = "";
    console.log(result.insertedId);
    //if the flag was triggered at any point, then send the error message
    //otherwise send the insertedId of the quiz
    if (flag == true){
      str = "error";
    }
    else{
      console.log("Inserted correctly");
      str = result.insertedId;
    }
    res.send(str);
  });
}

// Initialize database connection
MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;

  //Get the t8 database
  db = client.db('a4');

  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("Listening on port 3000");
});
