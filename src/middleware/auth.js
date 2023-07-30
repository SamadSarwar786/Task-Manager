const jwt = require("jsonwebtoken");
const User = require("../model/user");

const auth = async (req, res, next) => {
  console.log("I m in auth middle ware");
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    //   console.log(token);
    const decode = jwt.verify(token, "NodeJsCourse");
    // console.log(decode);
    const user = await User.findOne({ _id: decode._id, "tokens.token": token });
    if (!user) throw new Error();

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(400).send("Please first authenticate");
  }

  //   next();
};

module.exports = auth;
