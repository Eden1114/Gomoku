/**
 * 使用socket.io实现的服务器端
 * 对应的是home中的的客户端
 */

FiveChess = function() {
	const MSG_ALL  = 0;//发送到所有用户
	const MSG_TO   = 1;//发送指定用户
	const MSG_ROOM = 2;//向指定桌发送消息
	
	const STAT_NORMAL = 0;//无状态
	const STAT_READY  = 1;//准备
	const STAT_START  = 2;//游戏中
	
	const COLOR_BLACK = 1;//黑色
	const COLOR_WHITE = 2;//白色
	
	//默认配置信息
	var m_Config = {
		"RoomTotal" : 100,
		"MaxClientNum" : 300
	};

	var m_Connections = [];	//用户管理
	var m_Rooms = [];		//房间管理
	var m_RoomData = [];	//房间内棋盘信息
	var n_Clients = 0;
	var self = this;
	var io;					//socket.io
	

	//导入外部配置信息
	this.SetConfig = function(cfg) {
		for(var x in cfg) {
			m_Config[x] = cfg[x];
		}
	}
	
	//初始化棋盘数据
	//每一个房间的棋盘为RoomData[roomid][i][j] i,j<= 15
	var InitChessData = function(roomIdx) {
		m_RoomData[roomIdx] = [];
		for(var i = 0; i < 15; i++){
			m_RoomData[roomIdx][i] = [];
			for(var j = 0; j < 15; j++){
				m_RoomData[roomIdx][i][j] = 0;
			}
		}
	}
	
	//重置棋盘数据
	//将棋盘置为全0
	var ResetChessData = function(roomIdx){
		for(var i =0 ; i < 15; i++){
			for(var j = 0; j < 15; j++){
				m_RoomData[roomIdx][i][j] = 0;
			}
		}
	}
	
	//DEBUG
	this.Startup = function(server)
	{
		//初始化房间
		for(var i = 0; i < m_Config.RoomTotal; i++){
			m_Rooms[i] = [0, 0];
			InitChessData(i);
		}
		
		//网络服务
		io = require('socket.io').listen(server);

		io.sockets.on('connection', function (socket) {
			//断开
			socket.on("disconnect", OnClose);
			//登陆
			socket.on("login", OnLogin);
			//加入房间
			socket.on("joinRoom", OnJoinRoom);
			//离开房间
			socket.on("leaveRoom", OnLeaveRoom);
			//准备
			socket.on("ready", OnReady);
			//消息
			socket.on('message', OnMessage);
			//落子
			socket.on("drawChess", OnDrawChess);
		});

		console.log('server is started on server.');
	}

	//用户登陆
	var OnLogin = function (data) {
		var ret = 0;
		var sid = this.id;
		if (n_Clients < m_Config.MaxClientNum) {
			var client = {
				socket: this,
				nickname: data.nickname,
				status: STAT_NORMAL,//0-无状态, 1-准备, 2-游戏中
				roomIdx: -1, //所处房间号
				posIdx: -1 //所处房间的位置
			};

			//更新客户端链接
			m_Connections[sid] = client;
			n_Clients++;

			//登陆成功
			this.emit("login", {
				"ret": 1,
				"info": GetUserInfo(sid),
				"list": GetUserList(),
				"room": GetRoomList()
			});

			//发送用户加入大厅
			io.sockets.emit("join", GetUserInfo(sid));
		} else {
			//登陆失败
			this.emit("login", { "ret": 0 });
		}
	}	


	
	//获取房间列表
	var GetRoomList = function()
	{
		var data = [];
		for(var idx in m_Rooms) {
			var room = [0, 0];
			for(var j = 0; j < 2; j++){
				if(m_Rooms[idx][j]){
					var c = m_Connections[m_Rooms[idx][j]];
					if(c){
						room[j] = {
							"id" : c.socket.id,
							"nickname" : c.nickname,
							"status" : c.status
						};
					}
				}
			}
			data.push(room);
		}
		return data;
	}
	
	//获取用户列表
	var GetUserList = function()
	{
		var list = [];
		for(var sid in m_Connections)
		{
			list.push(GetUserInfo(sid));
		}
		return list;
	}
	
	//获取用户信息
	var GetUserInfo = function(sid)
	{
		return {
			"id" : m_Connections[sid].socket.id,
			"nickname" : m_Connections[sid].nickname,
			"status" : m_Connections[sid].status
		}
	}
	
	//关闭链接
	var OnClose = function(data)
	{
		var sid = this.id;
		
		if(!m_Connections[sid]) return ;
		n_Clients--;
		
		//发送退出消息
		io.sockets.emit("close", {
			"id" : sid,
			"roomIdx" : m_Connections[sid].roomIdx,
			"posIdx" : m_Connections[sid].posIdx
		});
		
		//如果该房间内用户正在游戏，那么重设另一个用户的状态
		var roomIdx = m_Connections[sid].roomIdx;
		var posIdx  = m_Connections[sid].posIdx;
		if(roomIdx != -1){
			m_Rooms[roomIdx][posIdx] = 0;//退出房间
			if(m_Connections[sid].status == STAT_START){
				if(posIdx == 0){
					if(m_Rooms[roomIdx][1] && m_Connections[m_Rooms[roomIdx][1]]){
						m_Connections[m_Rooms[roomIdx][1]].status = STAT_NORMAL;
					}
				}else{
					if(m_Rooms[roomIdx][0] && m_Connections[m_Rooms[roomIdx][0]]){
						m_Connections[m_Rooms[roomIdx][0]].status = STAT_NORMAL;
					}
				}
			}
		}
		//删除元素
		delete m_Connections[sid];
	}
	
	//加入房间
	var OnJoinRoom = function(data){
		var sid = this.id;
		if(data.roomIdx > -1 && data.roomIdx < m_Config.RoomTotal && 
			(data.posIdx == 0 || data.posIdx == 1) && 
			m_Rooms[data.roomIdx][data.posIdx] == 0 && 
			m_Connections[sid] && m_Connections[sid].status != STAT_START)
		{
			var oldRoomIdx = m_Connections[sid].roomIdx;
			var oldPosIdx  = m_Connections[sid].posIdx;
			
			//离开原座位
			if(oldRoomIdx != -1){
				m_Rooms[oldRoomIdx][oldPosIdx] = 0;
				io.sockets.emit("leaveRoom", {
					"id"	   : sid,
					"roomIdx"  : oldRoomIdx,
					"posIdx"   : oldPosIdx
				});
			}			
			
			//加入新房间
			m_Connections[sid].roomIdx = data.roomIdx;
			m_Connections[sid].posIdx  = data.posIdx;
			m_Connections[sid].status  = STAT_NORMAL;
			m_Rooms[data.roomIdx][data.posIdx] = sid;
			io.sockets.emit("joinRoom", {
				"roomIdx"  : data.roomIdx,
				"posIdx"   : data.posIdx,
				"nickname" : m_Connections[sid].nickname,
				"id"       : sid
			});
			
			//发送房间内信息
			var info = [0, 0];
			if(m_Rooms[data.roomIdx][0]) info[0] = GetUserInfo(m_Rooms[data.roomIdx][0]);
			if(m_Rooms[data.roomIdx][1]) info[1] = GetUserInfo(m_Rooms[data.roomIdx][1]);
			this.emit("roomInfo", info);
		}else{
			this.emit("joinRoomError", '');
		}
	}	
	
	//离开房间
	var OnLeaveRoom = function(data){
		var sid = this.id;
		if(m_Connections[sid] && m_Connections[sid].roomIdx != -1 && 
			m_Connections[sid].roomIdx == data.roomIdx)
		{
			var roomIdx = m_Connections[sid].roomIdx;
			var posIdx  = m_Connections[sid].posIdx;
			m_Rooms[roomIdx][posIdx] = 0;
			m_Connections[sid].roomIdx = -1;
			m_Connections[sid].posIdx = -1;
			m_Connections[sid].status = STAT_NORMAL;
			
			//通知大厅人有人离开
			io.sockets.emit("leaveRoom", {
				"id" 	   : sid,
				"roomIdx"  : roomIdx,
				"posIdx"   : posIdx
			});
		}
	}
	
	//准备
	var OnReady = function(data){
		var sid = this.id;
		if(m_Connections[sid] && m_Connections[sid].roomIdx != -1 && 
			m_Connections[sid].status != STAT_START)
		{
			var status = 1 - m_Connections[sid].status;
			var roomIdx = m_Connections[sid].roomIdx;
			m_Connections[sid].status = status;
			
			//发送准备信息到大厅
			io.sockets.emit("ready", {
				"id"      : sid,
				"roomIdx" : roomIdx,
				"posIdx"  : m_Connections[sid].posIdx,
				"nickname": m_Connections[sid].nickname,
				"status"  : status
			});			
			
			//发送开始消息
			if(m_Rooms[roomIdx][0] && m_Rooms[roomIdx][1] && 
				m_Connections[m_Rooms[roomIdx][0]] && 
				m_Connections[m_Rooms[roomIdx][1]] && 
				m_Connections[m_Rooms[roomIdx][0]].status == STAT_READY &&
				m_Connections[m_Rooms[roomIdx][1]].status == STAT_READY)
			{
				//告诉两名玩家游戏正式开始
				m_Connections[m_Rooms[roomIdx][0]].status = STAT_START;
				m_Connections[m_Rooms[roomIdx][1]].status = STAT_START;
				m_Connections[m_Rooms[roomIdx][0]].socket.emit("start", {
					"color" : COLOR_BLACK,
					"allowDraw" : true
				});
				m_Connections[m_Rooms[roomIdx][1]].socket.emit("start", {
					"color" : COLOR_WHITE,
					"allowDraw" : false
				});
				
				//通知大厅的成员有游戏开始了
				io.sockets.emit("startInfo", {
					"roomIdx" : roomIdx,
					"player1" : m_Rooms[roomIdx][0],
					"player2" : m_Rooms[roomIdx][1]
				});
			}		
		}
	}
	
	//落子
	var OnDrawChess = function(data){
		var sid     = this.id;
		var roomIdx = m_Connections[sid].roomIdx;
		if(m_Rooms[roomIdx][0] && m_Rooms[roomIdx][1] && 
			m_Connections[m_Rooms[roomIdx][0]] && 
			m_Connections[m_Rooms[roomIdx][1]] && 		
			m_Connections[m_Rooms[roomIdx][0]].status == STAT_START &&
			m_Connections[m_Rooms[roomIdx][1]].status == STAT_START && 
			checkValidChess(roomIdx, data.x, data.y) == true)
		{
			data.id = sid;
			m_RoomData[roomIdx][data.x][data.y] = data.color;
			
			for(var i = 0; i < 2; i++){//向房间内所有成员发送落子信息
				m_Connections[m_Rooms[roomIdx][i]].socket.emit("drawChess", data);
			}
			
			//结束游戏?
			if(checkGameOver(roomIdx, data.x, data.y) == true){
				var first  = m_Rooms[roomIdx][0];
				var second = m_Rooms[roomIdx][1];
				var winer  = (sid == first ? first : second);
				var loser  = (sid == second ? first : second);
				m_Connections[first].status = STAT_NORMAL;
				m_Connections[second].status = STAT_NORMAL;
				ResetChessData(roomIdx);
				m_Connections[winer].socket.emit("winer", "");	
				m_Connections[loser].socket.emit("loser", "");	

				//通知大厅的成员有游戏结束了
				io.sockets.emit("overInfo", {
					"roomIdx" : roomIdx,
					"player1" : first,
					"player2" : second
				});				
			}
		}
	}
	
	//检查落子是否合法
	var checkValidChess = function(roomIdx, x, y){
		if(m_RoomData[roomIdx][x][y] == 1){
			return false;
		}
		return true;
	}
	
	//检查游戏是否结束
	var checkGameOver = function(roomIdx, x, y){
		var n;
		var cur = m_RoomData[roomIdx][x][y];
		
		//横
		n = 0;
		var startX = (x - 4) < 0 ? 0 : x - 4;
		var endX   = (x + 4) > 14 ? 14 : x + 4;		
		for(var i = startX; i <= endX; i++){
			if(m_RoomData[roomIdx][i][y] == cur){
				n++;
			}else{
				n = 0;
			}
			if(n >= 5) return true;
		}
		
		//竖
		n = 0;
		var startY = (y - 4) < 0 ? 0 : x - 4;
		var endY   = (y + 4) > 14 ? 14 : y + 4;		
		for(var i = startY; i <= endY; i++){
			if(m_RoomData[roomIdx][x][i] == cur){
				n++;
			}else{
				n = 0;
			}
			if(n >= 5) return true;
		}
		
		//正斜
		n = 0;
		var min = x < y ? (x - 4 < 0 ? x : 4) : (y - 4 < 0 ? y : 4);
		var max = x > y ? (x + 4 > 14 ? 14 - x : 4) : (y + 4 > 14 ? 14 - y : 4); 
		var p1x = x - min;
		var p1y = y - min;
		var p2x = x + max;
		var p2y = y + max;
		for(var i = p1x, j = p1y; i <= p2x, j <= p2y; i++, j++){
			if(m_RoomData[roomIdx][i][j] == cur){
				n++;
			}else{
				n = 0;
			}
			if(n >= 5) return true;
		}
		
		//反斜
		n = 0;
		var min = (x + 4 > 14 ? 14 - x : 4) < (y - 4 < 0 ? y : 4) ? 
				  (x + 4 > 14 ? 14 - x : 4) : (y - 4 < 0 ? y : 4);
		var max = (x - 4 < 0 ? x : 4) < (y + 4 > 14 ? 14 - y : 4) ?
				  (x - 4 < 0 ? x : 4) : (y + 4 > 14 ? 14 - y : 4);
		var p1x = x + min;
		var p1y = y - min;
		var p2x = x - max;
		var p2y = y + max;
		for(var i = p1x, j = p1y; i >= p2x; i--, j++){
			if(m_RoomData[roomIdx][i][j] == cur){
				n++;
			}else{
				n = 0;
			}
			if(n >= 5) return true;
		}
		
		return false;
	}
	
	//发送消息
	var OnMessage = function (data) {
		var sid = this.id;
		if(!m_Connections[sid]) return;
		
		var cli = m_Connections[sid];
		var msg = {
			type : data.type,
			id : cli.socket.id,
			nickname : cli.nickname,
			body : data.body
		};
		switch(data.type){
			case MSG_ALL://所有人消息
				if(data.body){
					io.sockets.emit("message", msg);
				}
				break;
			case MSG_TO://发送消息到指定人
				if(data.to && data.body){
					m_Connections[data.to].socket.emit("message", msg);
				}
				break;
			case MSG_ROOM://房间
				if(cli.roomIdx > -1 && cli.roomIdx < m_Config.RoomTotal && data.body){
					for(var i = 0; i < 2; i++){
						if(m_Rooms[cli.roomIdx][i]){
							m_Connections[m_Rooms[cli.roomIdx][i]].socket.emit("message", msg);
						}
					}
				}
				break;
			default:
				break;
		}
	}
}

module.exports = FiveChess;