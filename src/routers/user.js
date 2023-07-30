const express = require("express");
const User = require("../model/user");
const auth = require("../middleware/auth");
const multer = require("multer");

const router = new express.Router();

// this is the way to use middleware, middleware fucniton does not call next , then the other function will going to call
router.get("/user", async (req, res) => {
  try {
    const data = await User.find({});
    if (!data.length) {
      return res.send("No users found");
    }
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });
    await req.user.save();

    res.send("log out successfully");
  } catch (error) {
    res.status(500).send({ error: "something wrong happend" });
  }
});
router.post("/user/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send("log out from all successfull");
  } catch (error) {
    res.status(500).send({ error: "something wrong happend" });
  }
});

// router.get("/user/:id", async (req, res) => {
//   const id = req.params.id;

//   // console.log("in the router.get() -->", id);
//   try {
//     const user = await User.findById(id);

//     res.send(user);
//   } catch (error) {
//     res.status(500).send(error);
//   }

//   // User.findById(_id)
//   //   .then((data) => {
//   //     res.status(200).send(data);
//   //   })
//   //   .catch((err) => {
//   //     res.status(500).send(err);
//   //   });
// });

router.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    const saveUser = await user.save();
    res.send(saveUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(404).send(error);
  }
});

router.patch("/user/me", auth, async (req, res) => {
  const queryUpdates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];

  const isValidOperations = queryUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperations) {
    return res.status(400).send({ error: "Invalid update field" });
  }

  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   returnDocument: "after",
    //   // new: true,
    //   runValidators: true,
    // });

    const user = req.user;
    queryUpdates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/user/me", auth, async (req, res) => {
  try {
    const user = req.user;
    user.deleteOne();
    console.log("deleted user -> ", user);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

const upload = multer({
  // dest: "images",   // if not provided here then data is paased to second function
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload an image"));
    } else cb(null, true);

    //cb(null, false) reject the file
    // cb(null , true) accept the file
    // cb(new Error('Only accept pdf file'))  // give an error
  },
});

router.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // if (!req.file) {
    //   res.status(400).send({ error: "Please upload avatar" });
    // }

    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send(req.user);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete(
  "/user/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get("/user/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    // res.set('Content-Type','application/json')   by default
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;

// const upload = multer({
//   dest: "uploads",
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.endsWith(".pdf"))
//       cb(new Error("Only accept pdf file"));
//     else cb(null, true);

//     // if (!file.originalname.match(/\.(doc|docx)$/))
//     //   cb(new Error("Only accept doc and cocx file"));
//     // else cb(null, true);

//     //cb(null, false) reject the file
//     // cb(null , true) accept the file
//     // cb(new Error('Only accept pdf file'))  // give an error
//   },
// });

// router.post("/user/upload", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).send("No file uploaded.");

//   res.send("File uploaded successfully");
// });
