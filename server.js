'use strict';

var server = require('./app');
var port = 3000;

server.listen(port, function () {
    console.log('Server running on port: %d', port);
});