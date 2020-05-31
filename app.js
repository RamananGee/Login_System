const express = require("express");
const createError = require("http-errors");
const path = require("path");
// const favicon = require("serve-favicon");
const cookieParser = require('cookie-parser');
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const expressValidator = require("express-validator")
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const upload = multer({dest: './uploads'});
const flash = require("connect-flash");
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Handle Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', (req, res,next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongDB Connected'))
    .catch(err => console.log(err));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
