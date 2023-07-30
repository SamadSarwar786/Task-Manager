const express = require("express");
const Task = require("../model/task");
const auth = require("../middleware/auth");
const User = require("../model/user");

const router = new express.Router();

router.post("/task", auth, async (req, res) => {
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
router.patch("/task/:id", auth, async (req, res) => {
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

router.delete("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id: _id, owner: req.user._id });
    if (!task) res.status(400).send();

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/task/:id", auth, async (req, res) => {
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

router.get("/task", auth, async (req, res) => {
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

module.exports = router;
