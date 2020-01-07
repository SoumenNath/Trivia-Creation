# Trivia-Creation
This program implements a trivia quiz creation server. It use MongoDB for storage of all question and quiz data.
The server supports the following routes:
  GET: /questions, /questions/:qID, /createquiz, /quizzes, /quiz/:quizID
  POST: /quizzes

Explanation of each of the following routes:

GET /questions: This route will queries the questions in the server’s database. This route returns either JSON or HTML, depending on the content type specified in the Accept header of the request. For each request, the response may contain up to 25 matching questions. The first 25 matching questions are returned or all of the matching questions are returned if there are less than 25. The route supports the following two query parameters:
  1. category
  2. difficulty
 
GET /questions/:qID: This parameterized route retrieves a single question with the unique ID qID from the server. This route can return either JSON or HTML, depending on the content type specified in the Accept header of the request. If JSON is requested, this server returns the JSON representation of the question object. If HTML is requested, this server uses a template engine to render an HTML page containing the question’s data.

GET /createquiz: This route represents the page that is used to perform quiz creation. When the save quiz button is pressed, the quiz is first validated, then quiz data is sent to the server using a POST request to the /quizzes route. If the new quiz is successfully created on the server, the client is redirected to the URL representing the newly created quiz resource.

POST /quizzes: This route is used to add a new quiz into the database. This route will expect a JSON body containing the representation of a quiz. If the quiz data is valid, a new quiz document is inserted into the 'quizzes' collection in the database.

GET /quizzes: This route is used to query the quizzes in the server’s database.

GET /quiz/:quizID: This parameterized route is used to retrieve a single quiz with the unique ID quizID from the server.

