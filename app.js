//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

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

  const secret = "Thisisourlittlesecret.";
  userSchema.plugin(encrypt, {
    secret: secret,
    encryptedFields: ["password"],
  });

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
    if (foundUser.password === req.body.password) {
      res.redirect("/secrets");
    } else {
      console.log("No such user");
      res.redirect("/");
    }
  });

  app.get("/register", function (req, res) {
    res.render("register");
  });

  app.post("/register", function (req, res) {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
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
