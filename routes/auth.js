const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");

const generateToken = require("../config/authToken");
const { protect } = require("../middleware/fetchuser");

//Route 1: create user

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (username.length < 5) {
    return res
      .status(403)
      .send({ data: "Username should be atleast of 5 length" });
  }

  if (password.length < 5) {
    return res
      .status(402)
      .send({ data: "Password should be atleast of 5 length" });
  }
  //check whether user with same email exist

  const userExists = await User.find({ username: username });
  const emailExists = await User.find({ email: email });
  if (userExists.length != 0 || emailExists.length != 0) {
    return res
      .status(400)
      .send({ data: "Sorry user with this username or email exists" });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const HashPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new User({ username, email, password: HashPassword });
    const user = await newUser.save();
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).send({ data: error.message });
  }
});

//Route 2 :authenticat the user with username and password

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username.length < 5) {
    return res
      .status(403)
      .send({ data: "Username should be atleast of 5 length" });
  }

  if (password.length < 5) {
    return res
      .status(402)
      .send({ data: "Password should be atleast of 5 length" });
  }
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(404).send({ data: "Please enter correct credentails" });
  }

  const validate = await bcrypt.compare(password, user.password);

  try {
    if (!validate) {
      return res.status(401).send({ data: "please correct password" });
    }
    const { password, ...others } = user._doc;
    res.status(200).json({ others, token: generateToken(user.id) });
  } catch (error) {
    res.status(500).send({ data: error.message });
  }
});

//route 3 get user details

router.get("/getuser", protect, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ data: error.message });
  }
});

// route 4 :  update user

router.put("/update", protect, async (req, res) => {
  const { username, email, password } = req.body;
  //If thier is a bad request
  const newUser = {};
  if (username) {
    newUser.username = username;
  }
  if (email) {
    newUser.email = email;
  }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const HashPassword = await bcrypt.hash(password, salt);

    if (HashPassword) {
      newUser.password = HashPassword;
    }
  }
  const userExists = await User.findOne({ username: username });

  const emailExists = await User.findOne({ email: email });
  if (username && username.length < 5) {
    return res
      .status(401)
      .send({ data: "Username must be minimum of 5 length" });
  }
  if (password && password.length < 5) {
    return res
      .status(402)
      .send({ data: "Password must be minimum of 5 length" });
  }

  if (userExists || emailExists) {
    return res
      .status(400)
      .send({ data: "Sorry user with this username or email exists" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: newUser },
      { new: true }
    );
    const { password, ...others } = user._doc;
    res.status(200).json({ others, token: generateToken(user.id) });
  } catch (error) {
    res.status(500).send({ data: error.message });
  }
});

module.exports = router;
