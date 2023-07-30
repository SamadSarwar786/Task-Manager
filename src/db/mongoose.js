const { mongoose } = require("mongoose");

mongoose.connect("mongodb://localhost:27017/task-manager");

// const me = new User({
//   name: "   Samad    Sarwar    ",
//   email: " Abc@Gmail.com  ",
//   password: "  PasSworD   ",
// });

// me.save()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));
