//SOCKET
var socket = io.connect();
//玩家
var direction=2; //0:North  1:East 2:South 3:West
var userX=0;//烏龜位置在地圖的第幾列
var userY=0;//烏龜位置在地圖的第幾行
var game;//玩家遊戲畫面
var wall;//圍牆
var player;//玩家人物所在位置
var goal;
//對手
var comDirection=2; //0:North  1:East 2:South 3:West
var comX=0;//對手烏龜位置在地圖的第幾列
var comY=0;//對手烏龜位置在地圖的第幾行
var comGame;//對手遊戲畫面
var comPlayer;
//x為自定義產生地圖隔數(幾x幾)
//mazeArray產生地圖陣列return [x][y][top,right,bottom,left]
var mazeArray;
var mazeSize;
var resultText;
var comResultText;
socket.on('gameProc', function(maze, x) {
	console.log('遊戲開始!');
	mazeArray = maze;
	mazeSize = x;
	var config = {
		type: Phaser.CANVAS,
		width: x*90+10,
		height: x*90+10,
		parent: playerGameRegion,
		physics: {
			default: 'arcade',
			arcade: {
				debug: false
			}
		},
		scene: {
			preload: preload,
			create: create,
		}
	};
	var comConfig = {
		type: Phaser.CANVAS,
		width: x*90+10,
		height: x*90+10,
		parent: playerGameRegion2,
		physics: {
			default: 'arcade',
			arcade: {
				debug: false
			}
		},
		scene: {
			preload: preload,
			create: comCreate,
		}
	};
	$('#readyButton').hide();
	$('#competitorButton').hide();
	//倒數10秒
	var count = 5;
	var t = setTimeout(time = function() {
		if(count === 0) {
			clearTimeout(t);
			$('#timerText1').hide();
			$('#timerText2').hide();
			$('#gameButton1').show();
			$('#gameButton2').show();
			$('#gameButton3').show();
			$('#gameButton4').show();
			$('#gameButton5').show();
			$('#actionBox').show();
			$('#gameButton6').show();
			game = new Phaser.Game(config);
			comGame = new Phaser.Game(comConfig);
		}else {
			$('#timerText1').text(count);
			$('#timerText2').text(count);
			count--;
			setTimeout(time, 1000);
		}
	}, 1000);
	//GAME ENGINE PHASER.JS//
	function preload() {
		this.load.image('sky', '/assets/sky.png');
		this.load.image('wall', '/assets/wall.png');
		this.load.spritesheet('turtle',
			'/assets/turtle.png',
			{ frameWidth: 50, frameHeight: 50 }
		);
		this.load.image('goal','/assets/star.png');
	}
	function create() {
		this.add.image(400, 300, 'sky');
		wall = this.physics.add.staticGroup();
		resultText = this.add.text(x*45-16, x*45-16, '', { fontSize: '32px', fill: '#f00' });
		for(var i = 0; i < x; i++) {
			for(var j = 0; j < x; j++)
			{
				for(var k = 0; k < 4; k++) {
					if(mazeArray[i][j][k]==0) {
						wall.create(50+j*90, 50+i*90, 'wall').angle=90*k;
					}
				}
			}
		}
		goal = this.physics.add.sprite(x*90-40, x*90-40, 'goal');
		player = this.physics.add.sprite(50, 50, 'turtle');
		// anims key值：從南向右轉turn0~turn3  //從南向左轉turn4~turn7
		for(var i=0;i<8;i++) {
			this.anims.create({
				key: 'turn'+i,
				frames: this.anims.generateFrameNumbers('turtle', { start: 2*i, end: 2*i+2 }),
				frameRate: 20,
			});
		}
		this.anims.create({
			key: 'north',
			frames: [ { key: 'turtle', frame: 4} ],
			duration: 1000,
			frameRate: 1
		});
		this.anims.create({
			key: 'east',
			frames: [ { key: 'turtle', frame: 6 } ],
			duration: 1000,
			frameRate: 1
		});
		this.anims.create({
			key: 'south',
			frames: [ { key: 'turtle', frame: 0 } ],
			duration: 1000,
			frameRate: 1
		});
		this.anims.create({
			key: 'west',
			frames: [ { key: 'turtle', frame: 2 } ],
			duration: 1000,
			frameRate: 1
		});
	}
	function comCreate() {
		this.add.image(400, 300, 'sky');
		wall = this.physics.add.staticGroup();
		comResultText = this.add.text(x*45-16, x*45-16, '', { fontSize: '32px', fill: '#f00' });
		for(var i = 0; i < x; i++) {
			for(var j = 0; j < x; j++)
			{
				for(var k = 0; k < 4; k++) {
					if(mazeArray[i][j][k]==0) {
						wall.create(50+j*90, 50+i*90, 'wall').angle=90*k;
					}
				}
			}
		}
		goal = this.physics.add.sprite(x*90-40, x*90-40, 'goal');
		comPlayer = this.physics.add.sprite(50, 50, 'turtle');
		// anims key值：從南向右轉turn0~turn3  //從南向左轉turn4~turn7
		for(var i=0;i<8;i++) {
			this.anims.create({
				key: 'turn'+i,
				frames: this.anims.generateFrameNumbers('turtle', { start: 2*i, end: 2*i+2 }),
				frameRate: 20,
			});
		}
		this.anims.create({
			key: 'north',
			frames: [ { key: 'turtle', frame: 4} ],
			duration: 1000,
			frameRate: 1
		});
		this.anims.create({
			key: 'east',
			frames: [ { key: 'turtle', frame: 6 } ],
			duration: 1000,
			frameRate: 1
		});
		this.anims.create({
			key: 'south',
			frames: [ { key: 'turtle', frame: 0 } ],
			duration: 1000,
			frameRate: 1
		});
		this.anims.create({
			key: 'west',
			frames: [ { key: 'turtle', frame: 2 } ],
			duration: 1000,
			frameRate: 1
		});
	}
	//----------END.----------//
});
//----------遊戲----------//
var ready = false;
function readyBtn() {
	if(ready === false) {
		ready = true;
		$('#readyButton').html('準備完成&nbsp;<i class="fa fa-check" aria-hidden="true"></i>');
		$('#readyButton').addClass('disabled');
	}else if(ready === true) {
		ready = false;
		$('#readyButton').html('準備&nbsp;<i class="fa fa-question" aria-hidden="true"></i>');
		$('#readyButton').removeClass('disabled');
	}
	socket.emit('readyClick', userName);
}
//遊戲結果出爐並結束
function gameWin() {
	if(userX===(mazeSize-1) && userY===(mazeSize-1)) {
		game.paused = true;
		comGame.paused = true;
		$('#gameButton1').attr("disabled", true);
		$('#gameButton2').attr("disabled", true);
		$('#gameButton3').attr("disabled", true);
		$('#gameButton4').attr("disabled", true);
		$('#gameButton5').attr("disabled", true);
		$('#gameButton6').attr("disabled", true);
		resultText.setText('WIN');
		comResultText.setText('LOSE');
		socket.emit('comAction', 'gameWin');
	}
}
function move() {
	if(direction==0) {
		if(mazeArray[userX][userY][0]==0) {
			hitWall();
		}else {
			player.anims.play('north');
			player.y -=90;
			userX-=1;
			gameWin();
		}
	}else if(direction==1) {
		if(mazeArray[userX][userY][1]==0) {
			hitWall();
		}else {
			player.anims.play('east');
			player.x +=90;
			userY+=1;
			gameWin();
		}
	}else if(direction==2) {
		if(mazeArray[userX][userY][2]==0) {
			hitWall();
		}else {
			player.anims.play('south');
			player.y +=90;
			userX+=1;
			gameWin();
		}
	}else if(direction === 3) {
		if(mazeArray[userX][userY][3] === 0) {
			hitWall();
		}else {
			player.anims.play('west');
			player.x -=90;
			userY-=1;
			gameWin();
		}
	}
	socket.emit('comAction', '');
}
function turn(dir) {
	if(dir=="right") {
		direction=(direction==3)?0:direction+=1;
		if(direction==0) { //西到北
			player.anims.play('turn1');
		}else if(direction==1) { //北到東
			player.anims.play('turn2');
		}else if(direction==2) { //東到南
			player.anims.play('turn3');
		}else if(direction==3) { //南到西
			player.anims.play('turn0');
		}
	} else if(dir=="left") {
		direction=(direction==0)?3:direction-=1;
		if(direction==0) {  //東到北
			player.anims.play('turn5');
		}else if(direction==1) { //南到東
			player.anims.play('turn4');
		}else if(direction==2) { //西到南
			player.anims.play('turn7');
		}else if(direction==3) { //北到西
			player.anims.play('turn6');
		}
	}
	socket.emit('comAction', dir);
}
var actionTable = document.getElementById("actionTable");
var cellIndex =0; //使用者輸入的row index
var executeCellIndex=0;
function codeBtnAction(codeAction) {
	if(codeAction=="forward") {
		var row = actionTable.insertRow();
		var cellNum = row.insertCell();
		cellIndex++;
		cellNum.innerHTML = "<label class='control-label'>"+cellIndex+".</label>";
		var cell = row.insertCell();
		cell.innerHTML = "Forward&nbsp;";
		var inputSteps = document.createElement("input");
		inputSteps.setAttribute("type","text");
		inputSteps.setAttribute("class","form-control");
		cell.appendChild(inputSteps);
		cell.innerHTML += "step(s).";
	}else if(codeAction=="right") {
		var row = actionTable.insertRow();
		var cellNum = row.insertCell();
		cellIndex++;
		cellNum.innerHTML = cellIndex+". ";
		var cell = row.insertCell();
		cell.innerHTML = "turn right";
	}else if(codeAction=="left") {
		var row = actionTable.insertRow();
		var cellNum = row.insertCell();
		cellIndex++;
		cellNum.innerHTML = cellIndex+". ";
		var cell = row.insertCell();
		cell.innerHTML = "turn left";
	}else if(codeAction=="delete") {
		if(cellIndex>0 && actionTable.rows[cellIndex-1].style.backgroundColor!="green" && actionTable.rows[cellIndex-1].style.backgroundColor!="red") {
			actionTable.deleteRow(cellIndex-1);
			cellIndex--;
		}
	}else {
		throw new Error("Error: CodeAction variable don't have any action to determine!");
	}
	$('#actionBox').scrollTop($('#actionBox')[0].scrollHeight);
}
function runCode() {
	executeCellIndex=cellIndex-executeCellIndex; //正在執行的row index
	(function codeLoop(i) { //逐行執行使用者的輸入, 以每一table row為單位的迴圈
		setTimeout(function() { //每一row會停一秒
			$('#actionBox').scrollTop((cellIndex-i)*49);
			executeCellIndex=cellIndex-i+1;
			var action=actionTable.rows[cellIndex-i].cells[1].innerHTML; //取得每一row使用者的輸入
			if(action=="turn left") { // 如果使用者輸入為turn left
				actionTable.rows[cellIndex-i].style.backgroundColor ="green";
				setTimeout(function() {
					turn('left');
					if(--i) codeLoop(i); //執行下一行的table row
				}, 500);
			}else if(action=="turn right") { // 如果使用者輸入為turn right
				actionTable.rows[cellIndex-i].style.backgroundColor ="green";
				setTimeout(function () {
					turn('right');
					if(--i) codeLoop(i); //執行下一行的table row
				}, 500);
			}else { // 如果使用者輸入為Forward
				actionTable.rows[cellIndex-i].style.backgroundColor ="green";
				var forwardStep = actionTable.rows[cellIndex-i].cells[1].children[0].value;
				if(Number.isInteger(Number(forwardStep))&&forwardStep>0) {
					(function animeLoop(j) {
						setTimeout(function() {
							move();
							if(--j) animeLoop(j);
							if(j<=0) {
								if(--i) codeLoop(i); //執行下一行的table row
							}
						}, 500);
					})(forwardStep)
				}else {
					actionTable.rows[cellIndex-i].style.backgroundColor ="red";
					alert("請輸入forward指令所接受之有效數字!")
					$('#gameButton1').attr("disabled", true);
					$('#gameButton2').attr("disabled", true);
					$('#gameButton3').attr("disabled", true);
					$('#gameButton4').attr("disabled", true);
					$('#gameButton6').attr("disabled", true);
					throw new Error("Error! please enter a reasonable number of steps.")
				}
			}
		}, 1000)
	})(executeCellIndex);
}
function reStart() {
	$('#gameButton1').attr("disabled", false);
	$('#gameButton2').attr("disabled", false);
	$('#gameButton3').attr("disabled", false);
	$('#gameButton4').attr("disabled", false);
	$('#gameButton6').attr("disabled", false);
	direction=2;
	userX=0;
	userY=0;
	player.x =50;
	player.y =50;
	player.anims.play('south');
	for(var i = 0; i < executeCellIndex; i++) {
		actionTable.rows[i].style.backgroundColor = "initial";
	}
	executeCellIndex=0;
	socket.emit('comAction', 'restart');
}
function hitWall() {
	actionTable.rows[executeCellIndex-1].style.backgroundColor = "red";
	var yesRestart = confirm("撞到了! 請修正指令。");
	if(yesRestart==true) {
		reStart();
		throw new Error('hit wall and click ok.');
	}else {
		$('#gameButton1').attr("disabled", true);
		$('#gameButton2').attr("disabled", true);
		$('#gameButton3').attr("disabled", true);
		$('#gameButton4').attr("disabled", true);
		$('#gameButton6').attr("disabled", true);
		throw new Error('hit wall and click cancel.');
	}
}
function sendMsg() {
	if($.trim($('#lobbyChat').val())) {
		socket.emit('chat', userName, $('#lobbyChat').val());
		$('#lobbyChat').val('');
	}
}
$('#lobbyChat').bind("enterKey",function(e){
	sendMsg();
	$('#lobbyChat').focus();
});
$('#lobbyChat').keyup(function(e){
	if(e.keyCode === 13) {
		$(this).trigger("enterKey");
	}
});
//使用者加入房間告知後端
socket.on('connect', function() {
	socket.emit('join', userName);
});
//接收後端訊息
socket.on('system', function(sysMsg, users) {
	var msg = '【<span style="color: red">系統</span>】: '+sysMsg+'<br>';
	$('#msgLog').append(msg);
});
//聊天
socket.on('chat', function(user, userChat) {
	$('#cardBody').append('<p class="cardText">' + user + ': ' + userChat + '</p><hr>');
	$('#cardBody').scrollTop($('#cardBody')[0].scrollHeight);
});
//房間已滿
socket.on('roomFull', function() {
	if(!alert('房間已滿，將退回大廳')) {
		document.location.href = '/gameRoom/';
	}
});
//對手準備狀態
socket.on('readyClick', function(data) {
	if(data === true) {
		$('#competitorButton').html('準備完成&nbsp;<i class="fa fa-check" aria-hidden="true"></i>');
	}else if(data === false) {
		$('#competitorButton').html('準備&nbsp;<i class="fa fa-question" aria-hidden="true"></i>');
	}
});
//對手資訊
socket.on('comAction', function(compAct) {
	if(compAct !== '') {
		if(compAct === "right") {
			comDirection=(comDirection === 3) ? 0 : comDirection += 1;
			if(comDirection === 0) { //西到北
				comPlayer.anims.play('turn1');
			}else if(comDirection === 1) { //北到東
				comPlayer.anims.play('turn2');
			}else if(comDirection === 2) { //東到南
				comPlayer.anims.play('turn3');
			}else if(comDirection === 3) { //南到西
				comPlayer.anims.play('turn0');
			}
		}else if(compAct === "left") {
			comDirection=(comDirection === 0) ? 3 : comDirection -= 1;
			if(comDirection === 0) {  //東到北
				comPlayer.anims.play('turn5');
			}else if(comDirection === 1) { //南到東
				comPlayer.anims.play('turn4');
			}else if(comDirection === 2) { //西到南
				comPlayer.anims.play('turn7');
			}else if(comDirection === 3) { //北到西
				comPlayer.anims.play('turn6');
			}
		}else if(compAct === "restart") {
			comDirection = 2;
			comX = 0;
			comY = 0;
			comPlayer.x = 50;
			comPlayer.y = 50;
			comPlayer.anims.play('south');
		}else if(compAct === "gameWin") {
			game.paused = true;
			comGame.paused = true;
			$('#gameButton1').attr("disabled", true);
			$('#gameButton2').attr("disabled", true);
			$('#gameButton3').attr("disabled", true);
			$('#gameButton4').attr("disabled", true);
			$('#gameButton5').attr("disabled", true);
			$('#gameButton6').attr("disabled", true);
			player.setTint(0xff0000);
			resultText.setText('LOSE');
			comResultText.setText('WIN');
		}
	}else {
		if(comDirection === 0) {
			if(mazeArray[comX][comY][0] === 1) {
				comPlayer.anims.play('north');
				comPlayer.y -= 90;
				comX -= 1;
			}
		}else if(comDirection ===1) {
			if(mazeArray[comX][comY][1] === 1) {
				comPlayer.anims.play('east');
				comPlayer.x += 90;
				comY += 1;
			}
		}else if(comDirection == 2) {
			if(mazeArray[comX][comY][2] === 1) {
				comPlayer.anims.play('south');
				comPlayer.y += 90;
				comX += 1;
			}
		}else if(comDirection === 3) {
			if(mazeArray[comX][comY][3] === 1) {
				comPlayer.anims.play('west');
				comPlayer.x -= 90;
				comY -= 1;
			}
		}
	}
});