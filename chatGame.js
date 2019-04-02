var express = require('express');
var path = require('path');
var socketio = require('socket.io');

var app = express();
var server = require('http').createServer(app);
app.use(express.static(path.join(__dirname, 'chatGameStatic')));
app.set('views', path.join(__dirname, 'chatGameViews'));
app.set('view engine', 'ejs');

//建立socket服務
var io = socketio.listen(server);

//房間使用者名單
var roomInfo = {};

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
    }
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
}

function leaveRoom(socket, roomID, user) {
    var userIndex = roomInfo[roomID].indexOf(user);
    if(userIndex !== -1) {
        roomInfo[roomID].splice(userIndex, 1);
    }
    if(roomInfo[roomID].length === 0) {
        delete roomInfo[roomID];
    }
    //離開所在房
    socket.leave(roomID);
    //通知該房之所有使用者
    io.to(roomID).emit('system', user + '離開了房間', roomInfo[roomID]);
    console.log(user + '離開了' + roomID);
}


app.get('/gameRoom/', function(req, res) {
    res.render('index', {});
});

app.get('/gameRoom/:roomID', function(req, res) {
    res.render('room', {'roomID': req.params.roomID});
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});