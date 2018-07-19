var me = true;              // 判断该轮黑白棋落子权
var over = false;           // 判断游戏是否结束
var chessBoard = [];        // 棋盘二维数组,存储棋盘信息


/**
 * 清空棋盘上的棋子
 */
function cleanChess() {
    $("div.room_chess div").remove();
}


/**
 * 开始游戏
 */
function startGame() {

    // 初始化棋盘信息
    for (var i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (var j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
        }
    }
    cleanChess();

    // 轮到玩家(白棋)行棋
    me = true;
    // 重置游戏结束标志
    over = false;

    // 初始化赢法统计数组
    for (var i = 0; i < count; i++) {
        myWin[i] = 0;
        airingWin[i] = 0;
    }

    // 让电脑先行，(7,7)处绘制黑棋，并存储信息
    oneStep(7, 7, false);
    chessBoard[7][7] = 2;
}


/**
 * 按照每一步的坐标和颜色绘制旗子绘制棋子
 * @param i     棋子x轴位置
 * @param j     棋子y轴位置
 * @param color    棋子颜色
 *  true 为白色
 *  false 为黑色
 */
function oneStep(i, j, color) {
    var left = i * 35 + 5;
    var top = j * 35 + 5;

    // let COLOR_BLACK = false;
    var css = (color == false ? "black" : "white");

    var html = ' <div id="chess-' + i + '-' + j + '" style="left:' + left + 'px;top:' + top + 'px" class="' + css + '"></div> ';

    $("div.room_chess").append(html);

    if ($("div.room_chess .cur").length == 0) {
        $("div.room_chess").append('<div class="cur"></div>');
    }
    $("div.room_chess .cur").css({
        left: left,
        top: top
    });
}


//落子
$("div.room_chess").click(function (e) {
    if(over) return;

    var x = e.pageX;
    var y = e.pageY;
    var i = parseInt((x - $(this).offset().left - 5) / 35);
    var j = parseInt((y - $(this).offset().top  - 5) / 35);
    
    //DEBUG
    console.log(i,j);

    // if ($("#chess-" + x + '-' + y).length > 0 || me == false /*轮到我方下棋*/) {
    //     console.error("BUG~");
    //     return;
    // }

    // else {
    
    if(chessBoard[i][j] == 0){
        oneStep(i, j, me);
        chessBoard[i][j] = 1;

        //DEBUG
        // console.log(chessBoard);
        
        for (var k = 0; k < count; k++) {
            if (wins[i][j][k]) {
                myWin[k]++;
                airingWin[k] = 6;
                if (myWin[k] == 5) {
                    window.alert("You Win");
                    over = true;
                }
            }

        }
        if (!over) {
            me = !me;
            airingGo();
        }
    }
});