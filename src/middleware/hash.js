// const bcrypt = require("bcryptjs");

// const hash = async (req, res, next) => {
//   if (req.body.password) {
//     try {
//       req.body.password = await bcrypt.hash(req.body.password, 8);
//     } catch (error) {
//       res.status(400).send("hashing problem");
//     }
//   }

//   next();
// };

// module.exports = hash;
