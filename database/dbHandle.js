'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var models = require("./models");

for (var m in models) {
    //DEBUG
    console.log('-----' , m, '----');
    console.log( typeof(m));
    
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

