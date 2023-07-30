const { mongoose } = require("mongoose");

mongoose.connect(process.env.MONGODB_URL);

// const me = new User({
//   name: "   Samad    Sarwar    ",
//   email: " Abc@Gmail.com  ",
//   password: "  PasSworD   ",
// });

// me.save()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));
