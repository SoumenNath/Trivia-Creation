let listQs = []; //list that keeps track of the current reuslts based on current drop down values
let addedQ = []; //list that keeps track of what questions have been added already to the quiz
let ids = []; //list that keeps track of question ids
let counter = 0;
//function that updates question based on most recent drop down options
function refresh(){
  console.log('Refresh');
  //get dropdown values for the category and difficulty fields
  let cat = document.querySelector("#category").value;
  let dif = document.querySelector("#difficulty").value;
  //create the url for the get requestion
  let url = "http://localhost:3000/questions?category="+cat+"&difficulty="+dif;
  console.log(url);
  //make a get request
  req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if(this.readyState==4 && this.status==200){
      //populate the response div with the resulting questions
     let body = JSON.parse(this.responseText);
     let results = body["questions"];
     document.querySelector("#refresh").innerHTML = "";
     listQs = results;
     for(let i=0;i<results.length;i++){
         let qus = JSON.stringify(results[i]);
         console.log(JSON.stringify(results[i]));
         document.querySelector("#refresh").innerHTML+=`<a href="http://localhost:3000/questions/`+results[i]._id+`" target="_blank">`+results[i].question+`</> <input type="button" value="Add Question" onClick="addQ(`+i+`)"></br>`;

      }
    }
  }
  req.open("GET", url);
  req.setRequestHeader("Accept", "application/json");
  req.send();
}

//function that adds questions to the quiz
function addQ(index){
  console.log("Adding this question");
  console.log(addedQ);
  console.log(ids);
  //if no questions have been added then add the question
  if (addedQ.length==0){
    let id = 0;
    document.querySelector("#qQuestions").innerHTML += `<a id="`+id+`" href="http://localhost:3000/questions/`+listQs[index]._id+`" target="_blank">`+listQs[index].question+`</> <input type="button" value="Remove Question" onClick="remQ(`+id+`)"></br>`;
    addedQ.push(listQs[index]);
    ids.push(id);
    counter++;
  }
  else{
    //if questions have been added then perform a check to make sure duplicates aren't added
    //if the checks pass then add the question to the quiz
    for (let i=0; i<addedQ.length; i++){
      if (listQs[index].question == addedQ[i].question){
        alert("You have already added this question to the quiz!");
        return;
      }
    }
    console.log("Adding");
    let id = ids[addedQ.length-1] + 1;
    document.querySelector("#qQuestions").innerHTML += `<a id="`+id+`"  href="http://localhost:3000/questions/`+listQs[index]._id+`" target="_blank">`+listQs[index].question+`</> <input type="button" value="Remove Question" onClick="remQ(`+id+`)"></br>`;
    addedQ.push(listQs[index]);
    ids.push(id);
    counter++;
  }

}

//function to remove questions from the quiz
function remQ(id){
  console.log(id);
  //remove the question using the id attribute
  let elem = document.getElementById(id);
  elem.parentNode.removeChild(elem);
  counter--;
  //updated the addedQ array so it doesn't inlcude the removed question anymore
  let temp=[];
  let temp2=[];
  for (let i=0; i<addedQ.length; i++){
    if (i != id){
      temp.push(addedQ[i]);
      temp2.push(ids[i]);
    }
  }
  addedQ = temp;
  ids = temp2;
  console.log("Removing Question");
  console.log(addedQ);
  console.log(ids);
}

//function that makes a post request to the server
function submitQ(){
  //check if the creator name and tags have been supplied
  if (document.querySelector("#cName").value == undefined || document.querySelector("#cName").value == ""){
    alert("The creator must be sepcified!");
    return;
  }
  if( document.querySelector("#tags").value == undefined || document.querySelector("#tags").value == ""){
    alert("At least one tag must be specified");
    return;
  }
  if (addedQ.length == 0 || counter == 0){
    alert("At least one question must be added to the quiz");
    return;
  }
  //create the quiz object
  let quiz = {};
  quiz["Creator"] = document.querySelector("#cName").value;
  quiz["Tags"] = document.querySelector("#tags").value;
  quiz["Questions"] = addedQ;
  console.log(quiz);
  //make a post request
  let req = new XMLHttpRequest();
  req.open("POST", "http://localhost:3000/quizzes", false); // false for synchronous request
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify(quiz));
  //check if the response has an error message
  let body = req.response;
  if (body == "error"){
    alert("The quiz data is invalid!");
    return;
  }
  //if not create an url with the response and redirect the user to newly created quiz resource
  console.log(body);
  let url = "http://localhost:3000/quiz/"+body;
  console.log(url);
  url = url.replace(/["']/g, "");
  console.log(url);
  window.location.href = url;
}
