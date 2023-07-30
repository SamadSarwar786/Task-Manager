const app = require('../index');
const taskRouter = require("../src/routers/task");
app.use('/api/', taskRouter);

module.exports = app;