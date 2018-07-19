'use strict'

// 用户登录
module.exports = {
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