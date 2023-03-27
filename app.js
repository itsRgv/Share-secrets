//jshint esversion:6
// require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "This is our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/SecretDB");

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String,
  });

  userSchema.plugin(passportLocalMongoose);

  //   userSchema.plugin(encrypt, {
  //     secret: process.env.SECRET,
  //     encryptedFields: ["password"],
  //   });

  const User = mongoose.model("User", userSchema);

  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.get("/", function (req, res) {
    res.render("home");
  });

  app.get("/login", function (req, res) {
    res.render("login");
  });

  app.post("/login", async function (req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    });
  });

  app.get("/register", function (req, res) {
    res.render("register");
  });

  app.post("/register", function (req, res) {
    User.register(
      { username: req.body.username },
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
          });
        }
      }
    );
  });

  app.get("/secrets", async function (req, res) {
    const foundUsers = await User.find({ secret: { $ne: null } });
    if (foundUsers) res.render("secrets", { userWithSecrets: foundUsers });
  });

  app.get("/logout", function (req, res) {
    req.logout(function (err) {
      if (err) {
        console.log(err);
      } else res.redirect("/");
    });
  });

  app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  });

  app.post("/submit", async function (req, res) {
    const submittedSecet = req.body.secret;
    // console.log(req.user);
    const foundUser = await User.findById(req.user.id);
    if (foundUser) {
      foundUser.secret = req.body.secret;
      foundUser.save();
      res.redirect("/secrets");
    }
  });

  app.listen("3000", function () {
    console.log("Server started at port 3000");
  });
}
main();
