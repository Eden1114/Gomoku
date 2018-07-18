/*
 * 五子棋核心消息处理
 * http://www.cxphp.com
 */
function FiveChess(host, port)
{
	var m_Host = host;
	var m_Port = port;
	var m_Events = [];
	var m_Error = "";
	var socket;
	var self = this;
	
	//绑定事件
	var bindEvent = function()
	{
		for(var e in m_Events){
			socket.on(e, m_Events[e]);
		}
	}
	
	//设置错误
	var setError = function(err)
	{
		m_Error = err;
	}
	
	this.getError = function(){
		return m_Error;
	}
	
	//链接服务器
	this.connect = function()
	{
		if(!("io" in window)){
			setError("io not defined");
			return false;
		}
		socket = io.connect('http://' + m_Host + ':' + m_Port);
		
		/*if(socket.socket.open == false){
			setError("connect http://" + m_Host + ":" + m_Port + " failed");
			return false;
		}*/
		bindEvent();
		
		return true;
	}
	
	//登陆
	this.login = function(nickname)
	{
		socket.emit("login", {
			"nickname" : nickname
		});
	}
	
	//加入房间
	this.joinRoom = function(roomIdx, posIdx)
	{	
		socket.emit("joinRoom", {"roomIdx" : roomIdx, "posIdx" : posIdx});
	}
	
	//向所有人发送消息
	this.sendAllMsg = function(body)
	{
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
	}
	
	//事件设置
	this.on = function(event, callback)
	{
		m_Events[event] = callback;
		return self;
	}
}