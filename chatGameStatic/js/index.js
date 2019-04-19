var userName = 'anonymous';
//init
jQuery(document).ready(function($) {
	if(sessionStorage.getItem('user') !== null) {
		userName = sessionStorage.getItem('user');
		$('#userDisplay').html('<span class="navbar-brand order-md-last">目前暱稱: ' + userName + '</span>');
	}
	if(userName === 'anonymous') {
		changeNameDialogOpen();
	}
});
//socket
var socket = io.connect();
//使用者加入房間告知後端
socket.on('connect', function() {
	socket.emit('join', userName);
});
//接收房間列表
socket.on('rooms', function(roomInfo) {
	console.log('rooms:---'+roomInfo);
	$('#roomList').empty();
	for(var roomID in roomInfo){
		if(roomID === 'gameRoom'){
			$('#roomList').append('<li class="list-group-item">目前大廳有: <span style="color: red">' + roomInfo[roomID].length + '</span>人</li>');
		}else {
			if(roomInfo[roomID].length === 2) {
				$('#roomList').append('<li class="list-group-item">房間: <span style="color: blue">' + roomID + '</span> <i class="fa fa-arrow-right"></i> ' + roomInfo[roomID].length + '人 <span style="color: red">房間已滿</span>');
			}else {
				$('#roomList').append('<li class="list-group-item">房間: <span style="color: blue">' + roomID + '</span> <i class="fa fa-arrow-right"></i> ' + roomInfo[roomID].length + '人&nbsp<a href="/gameRoom/' + roomID + '" class="btn btn-primary">進入</a></li>');
			}
		}
	}
});
//接收後端廣播的聊天訊息
socket.on('chat', function(user, userChat) {
	$('#cardBody').append('<p class="cardText">' + user + ': ' + userChat + '</p><hr>');
	$('#cardBody').scrollTop($('#cardBody')[0].scrollHeight);
});
//接收後端訊息
socket.on('system', function(sysMsg, users) {
	var msg = '【<span style="color: red">系統</span>】: '+sysMsg+'<br>';
	$('#msgLog').append('<p class="cardText">' + msg + '</p>');
});
//每秒要求接收一次房間列表
setInterval(function() {
	socket.emit('rooms');
},1000);
//傳送聊天訊息
$('#lobbyChat').bind("enterKey",function(e){
	sendMsg();
	$('#lobbyChat').focus();
});
$('#lobbyChat').keyup(function(e){
	if(e.keyCode === 13) {
		$(this).trigger("enterKey");
	}
});
function sendMsg() {
	if($.trim($('#lobbyChat').val())) {
		socket.emit('chat', userName, $('#lobbyChat').val());
		$('#lobbyChat').val('');
	}
}
//叫出暱稱設定表單
function changeNameDialogOpen() {
	$('#dialog').modal('show');
}
//儲存暱稱
function saveUID() {
	userName = $('#userID').val();
	sessionStorage.setItem('user', userName);
	$('#userDisplay').html('<span class="navbar-brand navbar-right">目前暱稱: ' + userName + '</span>');
	socket.emit('changeName', userName);
	$('#dialog').modal('toggle');
}
$('#userID').keyup(function(e){
	if(e.keyCode === 13) {
		$(this).trigger("enterKey");
	}
});
$('#userID').bind("enterKey",function(e){
	saveUID();
});
//叫出新房間建立表單
function newRoomDialogOpen() {
	$('#newRoomDialog').modal('show');
}
//實時檢查房間ID是否重複
$('#newRoomID').bind("keyup change", function() {
	var newRoomID = $('#newRoomID').val();
	$.ajax({
		url: '/checkRoomExist/',
		type: 'POST',
		data: {
			send: true,
			newRoomID: newRoomID,
		},
		success: function(data) {
			if(data === false) {
				$("#newRoomBtn").attr("disabled", false);
			}else {
				$("#newRoomBtn").attr("disabled", true);
			}
		}
	});
});