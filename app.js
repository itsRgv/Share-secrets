//jshint esversion:6
// require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/SecretDB");

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  });

  //   userSchema.plugin(encrypt, {
  //     secret: process.env.SECRET,
  //     encryptedFields: ["password"],
  //   });

  const User = mongoose.model("User", userSchema);

  app.get("/", function (req, res) {
    res.render("home");
  });

  app.get("/login", function (req, res) {
    res.render("login");
  });

  app.post("/login", async function (req, res) {
    const username = req.body.username;
    const foundUser = await User.findOne({ email: username });

    if (foundUser) {
      var result = await bcrypt.compare(req.body.password, foundUser.password);
      if (result) {
        res.redirect("/secrets");
      } else res.redirect("/");
    } else {
      console.log("No such user");
      res.redirect("/");
    }
  });

  app.get("/register", function (req, res) {
    res.render("register");
  });

  app.post("/register", async function (req, res) {
    var hash = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    newUser.save();
    res.redirect("/secrets");
  });

  app.get("/secrets", function (req, res) {
    res.render("secrets");
  });

  app.get("/logout", function (req, res) {
    res.render("home");
  });

  app.get("/submit", function (req, res) {
    res.render("submit");
  });

  app.post("/submit", function (req, res) {});

  app.listen("3000", function () {
    console.log("Server started at port 3000");
  });
}
main();
