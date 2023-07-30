const app = require("../index");
const userRouter = require("../src/routers/user");
app.use("/api/", userRouter);

module.exports = app;
