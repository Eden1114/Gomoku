'use strict';

var server = require('./app');

var port = 3000;

server.listen(port, function () {
    console.log('Server running on port: %d', port);
});

// var io = require('socket.io')(server);

// io.on('connection', function (socket) {
//     console.log('12312');

//     socket.on("disconnect", function () {
//         console.log("a user go out");
//     });

//     socket.on("message", function (obj) {
//         //延迟3s返回信息给客户端
//         setTimeout(function () {
//             console.log('the websokcet message is' + obj);
//             io.emit("message", obj);
//         }, 3000);
//     });

// })