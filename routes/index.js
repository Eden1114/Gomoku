var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: '首页' });
});

router.get('/index', function (req, res, next) {
  res.render('index', { title: '首页' });
});



/* GET login page. */
router.route('/login').get(function (req, res) {
  res.render('login', { 
    title: 'User Login',
     message: ''
  });

}).post(function (req, res) {
  // POST方法，处理登录请求
  
  var uname = req.body.uname;
  var upwd = req.body.upwd;
  
  var User = global.dbHandle.getModel('user');
  
  User.findOne({name: uname}, function (err, doc) {
    if (err) {
      //错误就返回给原post处（login.html) 状态码为500的错误
      res.sendStatus(500);
      console.log(err);
    } else if (!doc) {
      //查询不到用户名匹配信息，则用户名不存在
      req.session.error = '用户名不存在';
      res.sendStatus(404); // 状态码返回404
      // res.redirect('/login');
    } else {
      if (upwd != doc.password) { 
        //查询到匹配用户名的信息，但相应的password属性不匹配
        req.session.error = '密码错误';
        res.sendStatus(404);
        //    res.redirect('/login');
      } else {          
        
        //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
        req.session.user = doc;
        res.sendStatus(200);
        // res.redirect('/home');
      }
    }
  });
});


/* GET register page. */
router.route('/register').get(function (req, res) {
  
  res.render('register', { title: 'User register' , message: '11'});

}).post(function (req, res) {
  var uname = req.body.uname;
  var upwd = req.body.upwd;
  var User = global.dbHandle.getModel('user');

  User.findOne({ name: uname }, function (err, doc) {
    
    if (err) {
      res.sendStatus(500);
      req.session.error = '网络异常错误！';
    } else if (doc) {

      // TODO:
      // 返回该用户已存在
      
    } 
    else {
      // 创建新的用户

      User.create({ name: uname, password: upwd }, function (err, doc) {
        if (err) {

          console.log(err);
          res.sendStatus(500);
        }
        else {
          req.session.error = '用户名创建成功！';
          res.sendStatus(200);
        }
      });
    }
    
  });
});

/* GET home page. */
router.get('/home', function (req, res) {
  console.log(req.session.user);

  if (!req.session.user) {                     //到达/home路径首先判断是否已经登录
    req.session.error = '请先登录'
    res.redirect('/login');                    //未登录则重定向到 /login 路径
  }
  else {
    res.render('home', { title: 'Home', message: ' ' }); 
  }
});


/* GET logout page. */
router.get('/logout', function (req, res) {    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
  req.session.user = null;
  req.session.error = null;
  res.redirect('/');
});

module.exports = router;
