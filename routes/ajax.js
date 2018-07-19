var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


router.post('/history', function (req, res) {
    var _name = req.session.user.name;
    var _date = new Date();
    var _data = req.body.history;

    var History = global.dbHandle.getModel('history');

    History.create(
        {
            name: _name,
            date: _date,
            data: _data,
        }, function (err) {
            if (err) {

                console.log(err);
                res.sendStatus(500);
            }
            else {
                res.sendStatus(200);
            }
        });

}).get('/history', function (req, res) {
    res.send('respond with a resource~~');
});


module.exports = router;
