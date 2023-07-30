const { mongoose } = require("mongoose");
require('dotenv').config();
console.log(process.env.MONGODB_URL);

try {
    // Connect to the MongoDB cluster
     mongoose.connect(
        process.env.MONGODB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log(" Mongoose is connected")
    );

  } catch (e) {
    console.log("could not connect");
  }

// const me = new User({
//   name: "   Samad    Sarwar    ",
//   email: " Abc@Gmail.com  ",
//   password: "  PasSworD   ",
// });

// me.save()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));
