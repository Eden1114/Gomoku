var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
//////////////////////////////////////////////////////////
//session
var session = require('express-session');

//database
var mongoose = require('mongoose');
global.dbHandle = require('./database/dbHandle');
global.db = mongoose.connect("mongodb://localhost:27017/gomoku", { useNewUrlParser: true });


//upload
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/user')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({ storage: storage });
var cpUpload = upload.any();


var indexRouter = require('./routes/index');// main router
var usersRouter = require('./routes/users');// user router

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express); 
    // use html model rather then ejs.
    // or app.engine('html',require('ejs').renderFile);
    // app.set('view engine', 'ejs');
app.set('view engine', 'html');



//add middleware
//session
app.use(session({
  secret: 'secret',
  cookie: ('name', 'value', {
    path: '/',
    httpOnly: false,
    secure: false,
    maxAge: 1000 * 60 * 30,
  }),
  resave: false,
  saveUninitialized: false,
}));

app.use(function (req, res, next) {
  res.locals.user = req.session.user;   // 从session 获取 user对象
  var err = req.session.error;   //获取错误信息
  delete req.session.error;
  res.locals.message = "";   // 展示的信息 message
  if (err) {
    res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">' + err + '</div>';
  }
  next();  //中间件传递
});



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cpUpload);


// set routers
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/login', indexRouter);
app.use('/register', indexRouter);
app.use('/home', indexRouter);
app.use("/logout", indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
