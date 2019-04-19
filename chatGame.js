var express = require('express');
var path = require('path');
var socketio = require('socket.io');
var bodyParser = require('body-parser');

var app = express();
var server = require('http').createServer(app);

app.use(express.static(path.join(__dirname, 'chatGameStatic')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'chatGameViews'));
app.set('view engine', 'ejs');

//建立socket服務
var io = socketio.listen(server);

//房間使用者名單
var roomInfo = {};
var readyState = {};

io.on('connection', function(socket) {
    
    //獲取request Socket服務的房間號
    var userName = '';
    var url = decodeURIComponent(socket.request.headers.referer);
    var spilted = url.split('/');
    var roomID = spilted[spilted.length - 1];
    
    if(roomID === '') {
        roomID = 'gameRoom';
    }
    
    //初始加入大廳
    socket.on('join',function(user){
        userName = user;
        joinRoom(socket, roomID, userName);
    });
    
    //房間列表
    socket.on('rooms', function() {
        socket.emit('rooms', roomInfo);
    });
    
    //接收並廣播聊天訊息至特定聊天室
    socket.on('chat', function(user, userChat) {
        io.to(roomID).emit('chat', user, userChat);
    });
    
    //更換名字
    socket.on('changeName', function(user) {
        io.to(roomID).emit('system', '使用者'+ userName + '已更名為' + user);
        console.log('使用者'+ userName + '已更名為' + user);
        roomInfo[roomID].splice(roomInfo[roomID].indexOf(userName), 1);
        userName = user;
        roomInfo[roomID].push(userName);
        socket.emit('rooms', roomInfo);
    });
    
	
	//遊戲準備按鈕監聽
	socket.on('readyClick', function(user) {
		var userIndex = readyState[roomID].indexOf(user);
		if(userIndex !== -1) {
			if(readyState[roomID].length === 2) {
				io.to(roomID).emit('gameStop');
			}
			//取消準備
			readyState[roomID].splice(userIndex, 1);
			//告知對手
			socket.broadcast.to(roomID).emit('readyClick', false);
		}else {
			//準備
			readyState[roomID].push(user);
			//告知對手
			socket.broadcast.to(roomID).emit('readyClick', true);
			if(readyState[roomID].length === 2) {
				var x = 5;
				var maze = newMaze(x,x);
				io.to(roomID).emit('gameProc', maze, x);
			}
		}
	});
	
	
	
    //離開
    socket.on('leave', function() {
        socket.emit('disconnect');
    });
    socket.on('disconnect', function() {
        leaveRoom(socket, roomID, userName);
    });
    
    
});

function joinRoom(socket, roomID, user) {
    if(!roomInfo[roomID]) {
        roomInfo[roomID] = [];
		readyState[roomID] = [];
    }
    if(roomID !== 'gameRoom') {
        if(roomInfo[roomID].length <= 1) {
            roomInfo[roomID].push(user);
            //建立該房之socket
            socket.join(roomID);
            //通知該房之所有使用者
            io.to(roomID).emit('system', user+'加入了房間', roomInfo[roomID]);
            console.log(user + '加入了' + roomID);
        }else {
            socket.emit('roomFull');
        }
    }else {
        roomInfo[roomID].push(user);
        //建立該房之socket
        socket.join(roomID);
        //通知該房之所有使用者
        io.to(roomID).emit('system', user+'加入了大廳', roomInfo[roomID]);
        console.log(user + '加入了' + roomID);
    }
    
}

function leaveRoom(socket, roomID, user) {
    var userIndex = roomInfo[roomID].indexOf(user);
    if(userIndex !== -1) {
        roomInfo[roomID].splice(userIndex, 1);
    }
    if(roomInfo[roomID].length <= 1) {
        gameStop(roomID);
    }
    if(roomInfo[roomID].length === 0) {
        delete roomInfo[roomID];
		delete readyState[roomID];
    }
    //離開所在房
    socket.leave(roomID);
    //通知該房之所有使用者
    if(roomID !== 'gameRoom') {
        io.to(roomID).emit('system', user + '離開了房間', roomInfo[roomID]);
    }else {
        io.to(roomID).emit('system', user + '離開了大廳', roomInfo[roomID]);
    }
    console.log(user + '離開了' + roomID);
}


//----------遊戲----------//
function gameProc(roomID) {
    generateGameMap(roomID);
    io.to(roomID).emit('gameProc');
}

function gameStop(roomID) {
    io.to(roomID).emit('gameStop');
}

function generateGameMap(roomID) {
    
}

function newMaze(x, y) {

    // Establish variables and starting grid
    var totalCells = x*y;
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < y; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        for (var j = 0; j < x; j++) {
            cells[i][j] = [0,0,0,0];
            unvis[i][j] = true;
        }
    }
    
    // Set a random position to start from
    var currentCell = [Math.floor(Math.random()*y), Math.floor(Math.random()*x)];
    var path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    var visited = 1;
    
    // Loop through all available cell positions
    while (visited < totalCells) {
        // Determine neighboring cells
        var pot = [[currentCell[0]-1, currentCell[1], 0, 2],
                [currentCell[0], currentCell[1]+1, 1, 3],
                [currentCell[0]+1, currentCell[1], 2, 0],
                [currentCell[0], currentCell[1]-1, 3, 1]];
        var neighbors = new Array();
        
        // Determine if each neighboring cell is in game grid, and whether it has already been checked
        for (var l = 0; l < 4; l++) {
            if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
        }
        
        // If at least one active neighboring cell has been found
        if (neighbors.length) {
            // Choose one of the neighbors at random
            next = neighbors[Math.floor(Math.random()*neighbors.length)];
            
            // Remove the wall between the current cell and the chosen neighboring cell
            cells[currentCell[0]][currentCell[1]][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;
            
            // Mark the neighbor as visited, and set it as the current cell
            unvis[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        }
        // Otherwise go back up a step and keep going
        else {
            currentCell = path.pop();
        }
    }
    return cells;
}
//----------END.----------//



//----------Router----------//
app.get('/', function(req, res) {
    res.redirect('/gameRoom/');
});

app.post('/newRoom/', function(req, res) {
    var newRoomID = req.body.newRoomID;
    if(!roomInfo[newRoomID]) {
        res.redirect('/gameRoom/' + req.body.newRoomID);
    }else {
        res.redirect('/gameRoom/');
    }
});

app.post('/checkRoomExist/', function(req, res) {
    var newRoomID = req.body.newRoomID;
    if(roomInfo[newRoomID] || newRoomID === '') {
        res.json(true);
    }else {
        res.json(false);
    }
});

app.get('/gameRoom/', function(req, res) {
    res.render('index', {});
});

app.get('/gameRoom/:roomID', function(req, res) {
    res.render('room', {'roomID': req.params.roomID});
});
//----------END.----------//



server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});