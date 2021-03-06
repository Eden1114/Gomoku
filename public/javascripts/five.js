/**
 * 五子棋
 * socket.io消息处理
 * 与服务器端通信
 * 参数host
 * 参数port
 * 是服务端的host和port
 * 可以考虑从.env中获取
 */

function FiveChess(host, port) {
	var m_Host = host;
	var m_Port = port;
	var m_Events = [];
	var m_Error = "";
	var socket;
	var self = this;
	
	//绑定事件
	var bindEvent = function() {
		for(var e in m_Events) {
			socket.on(e, m_Events[e]);
		}
	}
	
	//设置错误
	var setError = function(err) {
		m_Error = err;
	}
	
	//获取错误
	this.getError = function() {
		return m_Error;
	}
	
	//链接服务器
	this.connect = function() {
		if(!("io" in window)){
			setError("io not defined");
			return false;
		}
		else {
			socket = io.connect('http://' + m_Host + ':' + m_Port);
			bindEvent();
			return true;
		}
	}

	//登陆
	this.login = function(nickname) {
		socket.emit("login", {
			"nickname" : nickname
		});
	}
	
	// 加入房间
	this.joinRoom = function(roomIdx, posIdx) {	
		socket.emit("joinRoom", {"roomIdx" : roomIdx, "posIdx" : posIdx});
	}
	
	//向所有人发送消息
	this.sendAllMsg = function(body) {
		socket.emit("message", {
			"type" : 0,
			"body" : body
		});
	}
	
	//向指定用户发送消息
	this.sendToMsg = function(to, body)
	{
		socket.emit("message", {
			"type" : 1,
			"to" : to,
			"body" : body
		});
	}
	
	//向房间内发送消息
	this.sendRoomMsg = function(body)
	{
		socket.emit("message", {
			"type" : 2,
			"body" : body
		});
	}
	
	//离开房间
	this.leaveRoom = function(roomIdx){
		socket.emit("leaveRoom", {
			"roomIdx" : roomIdx
		});
	}
	
	//准备
	this.ready = function(){
		socket.emit("ready", "");
	}
	
	//落子
	this.drawChess = function(color, x, y)
	{
		socket.emit("drawChess", {
			"color" : color,
			"x" : x,
			"y" : y
		});

		//DEBUG
		socket.emit("message", {
			"type": 2,
			"body": "# x: " + x + ", y: " + y + ", color:" + color
		});
	}

	//绑定事件和回调函数
	this.on = function(event, callback) {
		m_Events[event] = callback;
		return self;
	}
}