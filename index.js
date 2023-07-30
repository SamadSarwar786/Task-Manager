const express = require("express");

require("./src/db/mongoose"); // just get all thsose file data here

const userRouter = require("./src/routers/user");
const taskRouter = require("./src/routers/task");

const app = express();


app.use(express.json()); // it allow and convert the request into json -> res.body is now json
app.use(userRouter);
app.use(taskRouter);

console.log('port ',process.env.PORT);
const port = process.env.PORT || 3000;


app.listen(port, () => {
  console.log("Server is up on port " + port);
});


//middle ware
//Without middleware:  new request -> run route handler
//With middleware:  new request -> do Something or you have full control to run route handler or not -> run route handler

//one way ton use middle ware 
// app.use((req, res, next) => {
//   res.status(503).send("site under maintainence");
// });

// 2nd way to use middle ware is to use it inside api call, check in routers/user.js;

// app.use((req, res, next) => {
//   console.log(req.method, req.path);
//   // if(req.method !== 'POST')
//   //   res.send('Thats the power of middleware');
//   // else
//   next();
// });