'use strict'


module.exports = {
    
    // 用户登录
    user: {
        name: { type: String, required: true },
        password: { type: String, required: true }
    },

    history: {
        name: {type: String, required: true},
        date: { type: String, required: true },
        data: { type: String, required: true }
    }
};