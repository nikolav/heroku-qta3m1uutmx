const path = require("path");
const express = require("express");

const mongoose = require("mongoose");
const MONGODBURI =
  "mongodb+srv://0K3qnYek3DR:RovrWqBrqk5@cluster0.ymotm.mongodb.net/dhs3ERJKuef?retryWrites=true&w=majority";
// collections
//   mbf4kjz8igw_users
//   v3jmm4sr6vk_appdata

const cookieParser = require("cookie-parser");
const logger = require("morgan");

// const config = require("config");
const jwt = require("jsonwebtoken");

const indexRouter = require("./routes/index");

const User = require("./model/User");
const AppData = require("./model/AppData");

const app = express();

mongoose.connect(MONGODBURI, {}).then((...args) => {
  console.log("mongoose");
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(indexRouter);

// users
app.get("/users", (req, res) => {
  User.find().then((d) => res.json(d));
});
// register, with jwt
app.post("/users", (req, res) => {
  const { name, email, password: passwordHash } = req.body;
  const user = new User({
    name,
    email,
    passwordHash,
  });
  user.save().then((user) => {
    //
    jwt.sign(
      { id: user._id },
      "jwt-secret",
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      }
    );
  });
});
// auth, with jwt
app.post("/users/auth", (req, res) => {
  //
  const { email, password } = req.body;
  const user = User.findOne({ email }).then((user) => {
    if (!user)
      return res.json({
        status: 400,
        message: "user not found",
      });

    compare_(password, user.passwordHash).then((matches) => {
      if (!matches)
        return res.json({
          status: 401,
          message: "invalid credentials",
        });

      jwt.sign(
        { id: user._id },
        "jwt-secret",
        { expiresIn: 3600 },
        (err, token) => {
          if (err)
            return res.json({
              status: 500,
              message: "internal error, try again later",
              error: err,
            });
          res.json({
            status: 0, 
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
            },
          });
        }
      );

    });
  });
});

// appdata
app.get("/appdata", (req, res) => {
  AppData.find().then((d) => res.json(d));
});
app.get("/appdata/:name", (req, res) => {
  const name = req.params.name;
  AppData.findOne({ name }).then((d) => res.json(d));
  //   AppData.find().then((d) => res.json(d));
});
app.post("/appdata", (req, res) => {
  const appdata = new AppData({
    ...req.body,
  });

  appdata.save().then((d) => res.json(d));
});

module.exports = app;

function compare_(a, b) {
  return new Promise((resolve, reject) => {
    resolve(a === b);
  });
}
