const { mongoose } = require("mongoose");
require("dotenv").config();
console.log(process.env.MONGODB_URL);

  // Connect to the MongoDB cluster
  mongoose.connect(
    process.env.MONGODB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });

// const me = new User({
//   name: "   Samad    Sarwar    ",
//   email: " Abc@Gmail.com  ",
//   password: "  PasSworD   ",
// });

// me.save()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));
