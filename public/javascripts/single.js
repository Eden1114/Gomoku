//开始游戏
function start (data) {
    g_Info.status = STAT_START;
    g_Info.color = data.color;
    g_Info.allowDraw = data.allowDraw;
    if (g_Info.allowDraw) {
        $("div.room_chess").css("cursor", "pointer");
    } else {
        $("div.room_chess").css("cursor", "no-drop");
    }
    $("div.room_chess div").remove();//清除棋子
    $("#game_ready").val("游戏中...");
    alert("开始游戏啦...");
}