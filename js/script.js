/*
* PING-PONG GAME AI
* JAVASCRIPT CANVAS
* https://github.com/mattnix4/ping-pong-js
* 2022-03-22 02:20:03
* Author Matt Nix
*/
var $ = function(select)
{
	if(typeof(select) === 'object' )
		return select;

	if(typeof(select) === 'string' || select.indexOf("#") >= 0)
		return document.querySelector(select);

	return document.querySelectorAll(select);
}

var User;
var Com;
var Ball;
var UserScore;
var ComScore;
var ai = {
	user: false,
	com: true
}

$(window).onload = function (){
	$(".ai_user").checked = ai.user;
	$(".ai_com").checked =  ai.com;
	startGame();
}

var startGame = function () {
	WallTop = new component(440, 5, "black", 20, 5 );
	WallBottom = new component(440, 5, "black", 20, 260 );

	WallCenter = new component(2, 260, "black", (480/2)-1, 5 );
	UserLine = new component(2, 260, "transparent", 5, 5 );
	ComLine = new component(2, 260, "transparent", (480-5), 5 );

    User = new component(10, 80, "red", 10, 95, 'player');
    Com  = new component(10, 80, "green", 460, 95, 'player');   
    Ball  = new component(20, 20, "blue", (480/2)-10, 125, 'ball'); 

    UserScore = new Score([40,40]);
    ComScore = new Score([400,40]);

    Ball.speedX = Math.floor(4+(Math.random()*7)) * [-1,1][Math.floor((Math.random()*2))] ;
    Ball.speedY = Math.floor(-3+(Math.random()*7))  * [-1,1][Math.floor((Math.random()*2))] ;
    GameArea.start();
}

var GameArea = {
    canvas : $("#cvs") ,
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 20);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    },
    replay: function (){
    	if(this.interval)
    		this.stop();

    	var oldScore = [UserScore, ComScore];
    	var oldBallSpeed = {x:Ball.speedX, y: Ball.speedY} ;
    	startGame();
    	UserScore = oldScore[0];
    	ComScore = oldScore[1];
    },
    restart : function () {
    	if(this.interval)
    		this.stop();
    	startGame();
    }
}


var Score = function (xy,score=0){
	this.x = xy[0];
	this.y = xy[1];
	this.score = score;
	this.value = function (val){
		this.score += val
	},
	this.update = function (){
		c = GameArea.canvas;
		ctx = GameArea.context;
		ctx.font = "30px Verdana";
		// Create gradient
		var gradient = ctx.createLinearGradient(0, 0, c.width, 0);
		gradient.addColorStop("0", "green");
		gradient.addColorStop("1.0", "red");
		// Fill with gradient
		ctx.fillStyle = gradient;
		ctx.fillText(this.score, this.x, this.y);

	}
}


var component = function (width, height, color, x, y,type=null) {
	this.type = type;
	this.color = color;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = GameArea.context;
        if(type == "ball"){
        	ctx.fillStyle = color;
        	ctx.beginPath();
			ctx.arc(this.x+(this.width/2),this.y+(this.width/2),this.width/2,0,2*Math.PI);
			ctx.fill();
        }
        else
        {
	        ctx.fillStyle = color;
	        ctx.fillRect(this.x, this.y, this.width, this.height);
    	}
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }    
    this.collisionWith = function(otherobj) {
        var myleft = this.x ;
        var myright = this.x + (this.width);
        var mytop = this.y ;
        var mybottom = this.y + (this.height) ;
        var otherleft = otherobj.x ;
        var otherright = otherobj.x + (otherobj.width) ;
        var othertop = otherobj.y ;
        var otherbottom = otherobj.y + (otherobj.height) ;
        var collision = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            collision = false;
        }
        if(collision && otherobj.type == 'player'){
        	var randSpeed= Math.floor(1+(Math.random()*2));
        	this.speedY += [-randSpeed,randSpeed][Math.floor((Math.random()*2))];
        }

        return collision;
    }

    this.rebound = function(otherobj){

    	// if(this.x>otherobj.x && this.x<otherobj.x+otherobj.width && ( (this.y+(this.width/2)>=otherobj.y ) || (this.y-(this.width/2)<=otherobj.y )) )
    	// 	this.speedY = this.speedY * -1 ;

    	// if( (this.y>otherobj.y) && !(this.y>otherobj.y+otherobj.height) && ((this.x+(this.width/2)>=otherobj.x && this.speedX>0) || (this.x-(this.width/2)<=otherobj.x && this.speedX<0)) )
    	// 	this.speedX = this.speedX * -1 ;

		var myleft = this.x ;
        var myright = this.x + (this.width);
        var otherleft = otherobj.x ;
        var otherright = otherobj.x + (otherobj.width) ;
    	
    	if( ( (myright > otherleft) || (myleft < otherright) ) && otherobj.type == 'player' ) 
    			this.speedX = this.speedX * -1 ;

    	var mytop = this.y ;
        var mybottom = this.y + (this.height) ;
        var othertop = otherobj.y ;
        var otherbottom = otherobj.y + (otherobj.height) ;
        
        if ( ( (mybottom >= othertop) || (mytop <= otherbottom) ) && otherobj.type !== 'player'   )
        	this.speedY = this.speedY * -1 ;

    }
}

var updateGameArea = function () {
    if (Ball.collisionWith(User) ) {
        Ball.rebound(User);
        Ball.speedX += 0.2 ;
    } 

    if (Ball.collisionWith(Com) ) {
        Ball.rebound(Com);
        Ball.speedX -= 0.2 ;
    } 

    if (Ball.collisionWith(WallTop) ) {
        Ball.rebound(WallTop);
    } 

    if (Ball.collisionWith(WallBottom) ) {
        Ball.rebound(WallBottom);
    } 

    if (Ball.collisionWith(UserLine) ) {
        ComScore.value(1);
        GameArea.replay();
    } 

    if (Ball.collisionWith(ComLine) ) {
        UserScore.value(1);
        GameArea.replay();
    } 

    // computer plays for itself, and we must be able to beat it
	// simple AI
	if(ai.com)
		Com.y += (Ball.y - (Com.y + Com.height / 2)) * 0.9;
	if(ai.user)
		User.y += (Ball.y - (User.y + User.height / 2)) * 0.1;

        GameArea.clear();
        WallTop.update();
        WallBottom.update();
        WallCenter.update();

        Ball.newPos();      
        Ball.update();

        User.newPos();    
        User.update();

        Com.newPos(); 
   		Com.update(); 

   		UserLine.update();
   		ComLine.update();

   		UserScore.update();
   		ComScore.update();

}


function moveup(obj) {
    obj.speedY = -3; 
}

function movedown(obj) {
    obj.speedY = 3; 
}

function clearmove(obj) {
    obj.speedX = 0; 
    obj.speedY = 0; 
}

var getAgent = function (evt) {
	// console.log(evt.target.className.split('_')[1]);
	ai[evt.target.className.split('_')[1]] = evt.target.checked ;
}

$(".ai_user").addEventListener("change", getAgent);
$(".ai_com").addEventListener("change", getAgent);

// listening to the mouse

var getMousePos = function (evt) {
  var rect = GameArea.canvas.getBoundingClientRect();

  if(!ai.user)
  		User.y = evt.clientY - rect.top - User.height / 2;
}

GameArea.canvas.addEventListener("mousemove", getMousePos);

