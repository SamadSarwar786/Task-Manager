const { Schema, default: mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Email is Invalid");
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be positive");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      validate(value) {
        if (value.toLowerCase() === "password") {
          throw new Error("password cannot be equal to password");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: "Task", // The referenced model for virtual population
  localField: "_id", // The local field used to match documents (Author's _id)
  foreignField: "owner", // The foreign field used to match documents (Book's author field)
});

//middleware

// 1. only use normal function because normla function bind with 'this' , but arrow function does not
// 2. next() must be call at the end to finish the function call;
// 3. userSchema.pre( trigger function    , function for do some work   )

userSchema.pre("save", async function (next) {
  const user = this;

  console.log("in pre");
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
    console.log("hashing is done");
  }

  next();
});

// {{ document: true, query: false } means when calling on instane(document)(user) not on Model(User)
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const user = this;
    console.log("in pre delteOne");
    const deletedTasks = await Task.deleteMany({ owner: user._id });
    console.log("deleted Tasks -> ", deletedTasks);

    next();
  }
);

// custom function creation on instance (user)
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  console.log(user);
  const jwt_secret = process.env.JWT_SECRET;
  const token = jwt.sign({ _id: user._id.toString() }, jwt_secret);
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};
userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.tokens;
  delete userObj.password;
  delete userObj.avatar;

  return userObj;
};

// custom function creation on Model (User)
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("email not found");
  console.log("inside find by credential", user.password);
  const isValidUser = await bcrypt.compare(password, user.password);
  console.log(isValidUser);

  if (!isValidUser) throw new Error("Wrong Password");
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
