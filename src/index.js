const express = require("express");

require("./db/mongoose"); // just get all thsose file data here

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

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

app.use(express.json()); // it allow and convert the request into json -> res.body is now json
app.use(userRouter);
app.use(taskRouter);

const port = process.env.PORT || 3000;

app.get("", (req, res) => {
  res.send({ data: "root file loaded" });
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

// const bcrypt = require("bcryptjs");

// const hashing = async () => {
//   const password = "ram12345";
//   const hashedPassword = await bcrypt.hash(password, 8);

//   console.log(password);
//   console.log(hashedPassword);
// };

// hashing();

// const jwt = require("jsonwebtoken");

// const myFunction = () => {
//   const token = jwt.sign({ name: "Ram Manohar" }, "NodeJsCourse", {
//     expiresIn: "10 days",
//   });
//   console.log(token);
//   try {
//     const data = jwt.verify(token, "NodeJsCourse");
//     console.log(data);
//   } catch (error) {
//     console.log(error);
//   }
// };

// myFunction();
// const Task = require('./model/task');

// const main = () => {

// }