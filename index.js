const express = require("express");
const multer = require("multer");
const Task = require("./src/model/task");
const User = require("./src/model/user");
const auth = require("./src/middleware/auth");
require("./src/db/mongoose"); // just get all thsose file data here
require("dotenv").config();
// const userRouter = require("./src/routers/user");
// const taskRouter = require("./src/routers/task");

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
// app.use("/", userRouter);
// app.use("/", taskRouter);

app.get("/user", async (req, res) => {
  try {
    const data = await User.find({});
    if (!data.length) {
      return res.send("No users found");
    }
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send(e);
  }
});
app.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});

app.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });
    await req.user.save();

    res.send("log out successfully");
  } catch (error) {
    res.status(500).send({ error: "something wrong happend" });
  }
});
app.post("/user/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send("log out from all successfull");
  } catch (error) {
    res.status(500).send({ error: "something wrong happend" });
  }
});

// app.get("/user/:id", async (req, res) => {
//   const id = req.params.id;

//   // console.log("in the app.get() -->", id);
//   try {
//     const user = await User.findById(id);

//     res.send(user);
//   } catch (error) {
//     res.status(500).send(error);
//   }

//   // User.findById(_id)
//   //   .then((data) => {
//   //     res.status(200).send(data);
//   //   })
//   //   .catch((err) => {
//   //     res.status(500).send(err);
//   //   });
// });

app.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    const saveUser = await user.save();
    res.send(saveUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.patch("/user/me", auth, async (req, res) => {
  const queryUpdates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];

  const isValidOperations = queryUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperations) {
    return res.status(400).send({ error: "Invalid update field" });
  }

  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   returnDocument: "after",
    //   // new: true,
    //   runValidators: true,
    // });

    const user = req.user;
    queryUpdates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/user/me", auth, async (req, res) => {
  try {
    const user = req.user;
    user.deleteOne();
    console.log("deleted user -> ", user);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

const upload = multer({
  // dest: "images",   // if not provided here then data is paased to second function
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload an image"));
    } else cb(null, true);

    //cb(null, false) reject the file
    // cb(null , true) accept the file
    // cb(new Error('Only accept pdf file'))  // give an error
  },
});

app.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // if (!req.file) {
    //   res.status(400).send({ error: "Please upload avatar" });
    // }

    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send(req.user);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

app.delete(
  "/user/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

app.get("/user/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    // res.set('Content-Type','application/json')   by default
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(400).send();
  }
});

app.post("/task", auth, async (req, res) => {
  // const task = new Task(req.body);
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });

    await task.save();

    res.send(task);
  } catch (error) {
    res.status(500).send("not able to create task");
  }
});
app.patch("/task/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) res.send(400).send({ error: "Invalid Operation" });

  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id: _id, owner: req.user._id });

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id: _id, owner: req.user._id });
    if (!task) res.status(400).send();

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
app.get("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) res.status(404).send();

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

// localhost:3000/task?completed=true
// localhost:3000/task?limit=2&skip=1
// localhost:3000/task?sortBy=createdBy:desc

app.get("/task", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // const tasks = await Task.find(match);
    const user = await User.findOne({ _id: req.user._id })
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .exec();

    console.log(user.tasks);
    res.send({ tasks: user.tasks });
  } catch (e) {
    res.status(500).send();
  }

  // const tasks =await req.user.populate("Task");
  // console.log(tasks);

  // res.send({ tasks: tasks });
});

console.log("port ", process.env.PORT);
const port = process.env.PORT || 3000;

app.get("/movie", (req, res) => {
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
module.exports = app;
