'use strict'

// 
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/gomoku');

var Schema = mongoose.Schema;
var models = require("./models");

for (var m in models) {
    mongoose.model(m, new Schema(models[m]));
}

module.exports = {
    getModel: function (type) {
        return _getModel(type);
    }
};

var _getModel = function (type) {
    return mongoose.model(type);
};

