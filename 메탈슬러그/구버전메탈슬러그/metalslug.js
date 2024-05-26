window.onload = mainMenu;

window.gameSettings = {
    gameRules: "off",
    gameStory: "off",
    gameMode: "1",
    character: "player1_big.png",
    backgroundImg: "mainbackground.png",
    music: "sound/BGM1.wav",
    soundOnOff: "off"
};

function mainMenu() {

    var backgroundImg = window.gameSettings.backgroundImg;
    document.body.style.backgroundImage = "url('"+backgroundImg+"')";
    
    var startButton = document.getElementById("startButton");
    startButton.onclick = preGameSettings;

    var settingsButton = document.getElementById("settingsButton");
    settingsButton.onclick = showSettings;

    var scoresButton = document.getElementById("scoresButton");
    scoresButton.onclick = showScores;

    var creditsButton = document.getElementById("creditsButton");
    creditsButton.onclick = showCredits;

    addButtonFunc(".backButton", null, true);
    var backButtons = document.querySelectorAll(".backButton");
    backButtons.forEach((button) => {
        button.onclick = goBack;
    });

    addButtonFunc(".clearScoresButton", null, true);
    var clearScoresButtons = document.querySelectorAll(".clearScoresButton");
    clearScoresButtons.forEach((button) => {
        button.onclick = clearScores;
    });

    addButtonFunc(".menuButtons", null, true);

    addButtonFunc(".musicOnOffButton","soundOnOff", false);
    var musicOffButtons = document.getElementsByClassName('musicOffButton');
    for (var i = 0; i < musicOffButtons.length; i++) {
        musicOffButtons[i].onclick = function(e) {
            musicOnOff();
            window.gameSettings.soundOnOff= "off";
            for (let j = 0; j < musicOffButtons.length; j++) {
                musicOffButtons[j].classList.add("active");
            }
        };
    }

    var musicOnButtons = document.getElementsByClassName('musicOnButton');
    for (var i = 0; i < musicOnButtons.length; i++) {
        musicOnButtons[i].onclick = function(e) {
            musicOnOff();
            window.gameSettings.soundOnOff= "on";
            for (let j = 0; j < musicOnButtons.length; j++) {
                musicOnButtons[j].classList.add("active");
            }
        };
    }
    
}


function preGameSettings() {

    hideShowScreen("mainmenu","preGameSettingsScreen");
    addButtonFunc(".gameModeButton","gameMode", true);
    addButtonFunc(".gameRulesButton","gameRules");
    addButtonFunc(".gameStoryButton","gameStory");

    addButtonFunc(".gameStartButton", null, true);

    var gameStartButton = document.getElementsByClassName('gameStartButton');
    
    for (var i = 0; i < gameStartButton.length; i++) {
        gameStartButton[i].onclick = start;
    }

    var selectedCharacterImg = document.getElementById("selectedCharacterImg");
    // var selectedWeaponImg = document.getElementById("selectedWeaponImg");
    selectedCharacterImg.src = window.gameSettings.character;
    // selectedWeaponImg.src = window.gameSettings.weapon;
}

function game(){
    var gamescreen = document.getElementById('gameScreen');
    gamescreen.style.display = "block";
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    var score = 0;
    var time = 60;

    const playerWidth = 100;
    const playerHeight = 100;
    let playerX = (canvas.width - playerWidth) / 2;

    const bulletRadius = 5;
    const bulletSpeed = 5;
    let bullets = [];
    let lastBulletTime = 0;
    const bulletCooldown = 500; // 총알 나가는 시간 (ms)
    let lastMousePosition = { x: canvas.width / 2, y: canvas.height / 2 };

    const brickRow = 3;
    const brickColumn = 8;
    const brickWidth = 100;
    const brickHeight = 70;
    const brickPadding = 10;
    const brickOffsetTop = 100;
    const brickOffsetLeft = (canvas.width-(brickColumn*(brickPadding+brickWidth)))/2;
    let bricks = [];
    var brickcnt = 0;
    var hp;
    var enemyImage = new Image(); // 적이미지 객체 생성
    enemyImage.src = 'enemy.png';

    for (let c = 0; c < brickColumn; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRow; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 10};
            brickcnt++;
        }
    }

    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousemove', mouseMoveHandler);

    function keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = false;
        }
    }

    function mouseMoveHandler(e) {
        const rect = canvas.getBoundingClientRect();
        lastMousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function shootBullet() {
        const now = Date.now();
        if (now - lastBulletTime > bulletCooldown) {
            const bulletAngle = Math.atan2(lastMousePosition.y - (canvas.height - playerHeight / 2), lastMousePosition.x - (playerX + playerWidth / 2));
            const bullet = {
                x: playerX + playerWidth / 2,
                y: canvas.height - playerHeight,
                dx: Math.cos(bulletAngle) * bulletSpeed,
                dy: Math.sin(bulletAngle) * bulletSpeed
            };
            bullets.push(bullet);
            lastBulletTime = now;
        }
    }

    function drawBricks() {
        for (let c = 0; c < brickColumn; c++) {
            for (let r = 0; r < brickRow; r++) {
                if (bricks[c][r].status > 0) {
                    const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.drawImage(enemyImage, brickX, brickY, brickWidth, brickHeight);

                    // 체력바 그리기
                    var hpBarWidth = brickWidth;
                    var hpBarHeight = brickHeight / 20;
                    var remainingHP = bricks[c][r].status * (hpBarWidth / 10); // 체력바의 길이를 상태에 따라 변경
                    //status를 바꿀 때 hpBarWidth옆에 숫자를 함께 바꿔줘야함
                    var hpBarY = brickY - hpBarHeight - 2; // 브릭 위에 체력바를 그리기 위해 Y 좌표 조정
                    ctx.fillStyle = "#FFFFFF"; // 흰색으로 덮어진 체력바
                    ctx.fillRect(brickX, hpBarY, hpBarWidth, hpBarHeight);
                    ctx.fillStyle = "#FF0000"; // 빨간색으로 체력바 그리기
                    ctx.fillRect(brickX, hpBarY, remainingHP, hpBarHeight);
                }
            }
        }
    }

    function drawBullets() {
        bullets.forEach((bullet, index) => {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'orange';
            ctx.fill();
            ctx.closePath();
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            if (bullet.x < bulletRadius || bullet.x > canvas.width - bulletRadius) {
                bullet.dx = -bullet.dx;
            }
            if (bullet.y < bulletRadius) {
                bullet.dy = -bullet.dy;
            }

            if (bullet.y > canvas.height) {
                bullets.splice(index, 1);
            }

            for (let c = 0; c < brickColumn; c++) {
                for (let r = 0; r < brickRow; r++) {
                    const b = bricks[c][r];
                    if (b.status > 0) {
                        if (bullet.x > b.x && bullet.x < b.x + brickWidth && bullet.y > b.y && bullet.y < b.y + brickHeight) {
                            // 충돌한 총알 제거
                            bullets.splice(index, 1);
                            b.status--;
                        }
                        if (b.status == 0) {
                            brickcnt--;
                            var audio = new Audio('sound/enemydie2.wav');
                            audio.play();
                            score += 1;
                            const sc = document.getElementById("score");
                            sc.innerHTML = score;
                            if (brickcnt == 0) {
                                //다음단계로 넘어가는 함수 삽입
                            }
                        }
                    }
                }
            }
        });
    }

    // 캐릭터 이미지 생성
    const characterImages = [];
    for (let i = 0; i < 9; i++) {
        const img = new Image();
        img.src = `player_motion/p${i}.png`;
        characterImages.push(img);
    }

    // 캐릭터 이미지 각도에 따른 설정
    function getCharacterImage(angle) {
        if (angle >= -0.0 && angle < 0.2) return characterImages[0];
        if (angle >= -0.6 && angle < -0.0) return characterImages[1];
        if (angle >= -1.3 && angle < -0.6) return characterImages[2];
        if (angle >= -1.5 && angle < -1.3) return characterImages[3];
        if (angle >= -1.7 && angle < -1.5) return characterImages[4];
        if (angle >= -2.0 && angle < -1.7) return characterImages[5];
        if (angle >= -3.0 && angle < -2.0) return characterImages[6];
        if (angle >= -3.2 && angle < -3.0) return characterImages[7];
        if (angle >= 2.8 && angle <= 3.2) return characterImages[7];

        return characterImages[8];
    }

    function drawCharacter() {
        if (rightPressed && playerX < canvas.width - playerWidth) {
            playerX += 7;
        } else if (leftPressed && playerX > 0) {
            playerX -= 7;
        }

        const angle = Math.atan2(lastMousePosition.y - (canvas.height - playerHeight / 2), lastMousePosition.x - (playerX + playerWidth / 2));
        const characterImage = getCharacterImage(angle);
        
        ctx.drawImage(characterImage, playerX, canvas.height - playerHeight, playerWidth, playerHeight);
    }

    // 시간 갱신 주기
    const timerInterval = 1000; // 1초마다 타이머 갱신

    // 게임 시작 시 타이머 시작
    const intervalId = setInterval(updateTimer, timerInterval);

    // 시간 계산 함수
    function updateTimer() {
        time--;
        document.getElementById('timer').textContent = `${time}`;
        if (time === 0) {
            clearInterval(intervalId);
            gameOver();
        }
    }

    //새로운 화면을 쓸 때 사용할 함수
    function hideShowScreen(hideScreen, showScreen) {
        if (hideScreen) {
            var hideScreen = document.getElementById(hideScreen);
            hideScreen.style.display = "none";
        }
        if (showScreen) {
            var showScreen = document.getElementById(showScreen);
            showScreen.style.display = "block";
        } 
    }

    //게임 종료 함수
    function gameOver() { 
        var gameboard = document.getElementById("gameScreen");
        gameboard.style.display = "none";
        hideShowScreen(null,"gameOverScreen");
        showGameOver();
    }

    //게임 종료 화면
    function showGameOver() {
        var gameover = document.getElementById("gameOverScreen");
        var h1 = gameover.getElementsByTagName('h1')[0];

        const typing = async () => {
            var letter = "GAME OVER . . .".split("");
            while (letter.length)  {
                await new Promise(wait => setTimeout(wait, 100));
                h1.innerHTML += letter.shift(); 
            }
        }
        setTimeout(typing, 1500);
        setTimeout(showGameOverBtn, 4000);      
    }

    function showGameOverBtn() {
        var sco = document.getElementById("gameOverScore");
        var btn = document.getElementById("backToMenuButtonFromGameOver");

        sco.style.display = "block";
        sco.innerHTML = "SCORE : " + score;
        sco.classList.add("appear");
        btn.style.display = "block";
        btn.classList.add("appear");

        btn.onclick = function () {
            hideShowScreen("gameOverScreen", "mainmenu");
        }
    }

    // insertcoin 깜빡거리게 하는 함수
    function blinkInsertCoin() {
        var insertCoinElement = document.getElementById('coin');
        setInterval(function () {
            insertCoinElement.classList.toggle('blink');
        }, 700); // 깜빡임 간격을 0.5초로 설정
    }

    blinkInsertCoin();

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawCharacter();
        drawBullets();

        shootBullet();

        requestAnimationFrame(update);
    }

    // 이미지 다 불러오기
    Promise.all(characterImages.map(img => new Promise(resolve => img.onload = resolve))).then(() => {
        update();
    });
}


function start() {
    var parentDiv = this.parentNode;
    var grandParentDiv = parentDiv.parentNode;
    var grandgrandParentDiv = grandParentDiv.parentNode;
    var gameRulesScreen = document.getElementById("gameRulesScreen");
    var gameStoryScreen = document.getElementById("gameStoryScreen");
    score = 0;
    if (window.gameSettings.gameRules ==="off" && window.gameSettings.gameStory ==="off") {
        hideShowScreen("preGameSettingsScreen",null);
        switch (window.gameSettings.gameMode) {
            case "1":
                game();
                break;
            case "2":
                gameMedium();
                break;
            case "3":
                gameHard();
                break;
        }
    }
    else if (window.gameSettings.gameRules ==="on" && window.gameSettings.gameStory ==="off") {
        if (grandgrandParentDiv.id === "gameRulesScreen") {
            hideShowScreen("gameRulesScreen",null);
            switch (window.gameSettings.gameMode) {
                case "1":
                    game();
                    break;
                case "2":
                    gameMedium();
                    break;
                case "3":
                    gameHard();
                    break;
            }
        } else {
            hideShowScreen("preGameSettingsScreen","gameRulesScreen");
        }
    } 
    else if (window.gameSettings.gameRules ==="off" && window.gameSettings.gameStory ==="on") {
        if (grandgrandParentDiv.id === "gameStoryScreen") {
            hideShowScreen("gameStoryScreen",null);
            switch (window.gameSettings.gameMode) {
                case "1":
                    game();
                    break;
                case "2":
                    gameMedium();
                    break;
                case "3":
                    gameHard();
                    break;
            }
        } else {
            hideShowScreen("preGameSettingsScreen","gameStoryScreen");
        }
    } 
    else {
        if (grandgrandParentDiv.id === "gameRulesScreen") {
            hideShowScreen("gameRulesScreen","gameStoryScreen");
        } else if (grandgrandParentDiv.id === "gameStoryScreen") {
            hideShowScreen("gameStoryScreen",null);
            switch (window.gameSettings.gameMode) {
                case "1":
                    game();
                    break;
                case "2":
                    gameMedium();
                    break;
                case "3":
                    gameHard();
                    break;
            }
        } else {
            hideShowScreen("preGameSettingsScreen","gameRulesScreen");
        }
    }
}



function playAudio() {
    window.gameSettings.soundOnOff = "on";
    let audio = document.getElementById("myAudio");
    audio.volume = 0.1;
    audio.play();
}

function stopAudio() {
    window.gameSettings.soundOnOff = "off";
    let audio = document.getElementById("myAudio");
    audio.pause();
    audio.currentTime = 0;
}



function addButtonFunc(className, settingName, showArrow = false) {
    let buttons = document.querySelectorAll(className);
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function() {
            for (let j = 0; j < buttons.length; j++) {
                buttons[j].classList.remove("active");
            }
            this.classList.add("active");
            if(settingName)
                window.gameSettings[settingName] = this.value;
        });
    }   
    if (showArrow) {
        buttons.forEach((button) => {
              button.addEventListener("mouseover", () => {
                const prevArrow = button.previousElementSibling;
                const nextArrow = button.nextElementSibling;
                if (prevArrow) {
                    prevArrow.classList.remove("hidden");
                }
                if (nextArrow) {
                    nextArrow.classList.remove("hidden");
                }
                // prevArrow.classList.remove("hidden");
                // nextArrow.classList.remove("hidden");
              });
              button.addEventListener("mouseout", () => {
                const prevArrow = button.previousElementSibling;
                const nextArrow = button.nextElementSibling;
                if (prevArrow) {
                    prevArrow.classList.add("hidden");
                }
                if (nextArrow) {
                    nextArrow.classList.add("hidden");
                }
                // prevArrow.classList.add("hidden");
                // nextArrow.classList.add("hidden");
              });
        });
    }
}


function showSettings() {
    hideShowScreen("mainmenu","settingsScreen");

    var characterThumbnail = document.getElementsByClassName('characterThumbnail');
    for (var i = 0; i < characterThumbnail.length; i++) {
        characterThumbnail[i].onclick = function(e) {
            this.classList.add("selectedCharacter");

            var selected = document.getElementsByClassName('selectedCharacter');
            for (var j = 0; j < selected.length; j++) {
                if (selected[j] !== this) {
                    selected[j].classList.remove("selectedCharacter");
                }
            }
            window.gameSettings.character = this.name + ".png";
        };
    }

    var thumbnail = document.getElementsByClassName('thumbnail');
    for (var i = 0; i < thumbnail.length; i++) {
        thumbnail[i].onclick = function(e) {
            var bgimg = window.gameSettings.backgroundImg = this.name+".png";
            var selected = document.getElementsByClassName('selectedThumbnail');
            for (var j = 0; j < selected.length; j++) {
                selected[j].classList.remove("selectedThumbnail");
            }
            this.classList.add("selectedThumbnail");
            document.body.style.backgroundImage = "url('"+bgimg+"')";
        };
    }

    var bgm = document.getElementsByClassName('musicButton');
    var myAudio = document.getElementById("myAudio");
    for (var i = 0; i < bgm.length; i++) {
        bgm[i].onclick = function(e) {
            window.gameSettings.music = "sound/"+this.name+".wav";
            myAudio.src = window.gameSettings.music;
            musicOnOff();
        };
    }
    addButtonFunc(".musicButton", null, true);
}


function musicOnOff() {
        if (window.gameSettings.soundOnOff === "off") {
            stopAudio();
        } else {
            playAudio();
        }
}

function clearScores() {
    let gameNumber = parseInt(localStorage.getItem('gameNumber'));
    for (var i = 0; i <= gameNumber; i++) {
       localStorage.removeItem('score'+i);
    }
    localStorage.removeItem('gameNumber');
    localStorage.setItem('bestScore', 0);

    var scoreTable = document.getElementById("scoreTable");
    scoreTable.innerHTML="";
    var tr = crEl("tr", scoreTable, null);
    crEl("th", tr, "Game #");
    crEl("th", tr, "Score");
    var bestScoreValue = document.getElementById("bestScoreValue");
    bestScoreValue.innerHTML = 0;
}

function updateScores(score) {
    let gameNumber = parseInt(localStorage.getItem('gameNumber'));
    if (gameNumber>=10) {
        localStorage.removeItem('score'+(gameNumber-9));
    }
        if (gameNumber) {
            gameNumber = gameNumber+1;
        } else {
            gameNumber = 1;
        }
        localStorage.setItem('gameNumber', gameNumber);

    localStorage.setItem('score'+gameNumber, score);

    var bestScore = 0;
    for(var i = 0; i<=gameNumber;i++){
    let currentNum = parseInt(localStorage.getItem('score'+i));
        if (bestScore < currentNum) {
            bestScore = currentNum;
        }
    }
    localStorage.setItem('bestScore',bestScore);
}

function showScores() {
    hideShowScreen("mainmenu", "scoresScreen");

    var bestScoreValue = document.getElementById("bestScoreValue");
    bestScoreValue.innerHTML = localStorage.getItem('bestScore');

    var scoreTable = document.getElementById("scoreTable");
    scoreTable.innerHTML="";
    var tr = crEl("tr", scoreTable, null);
    crEl("th", tr, "Game #");
    crEl("th", tr, "Score");
    let gameNumber = parseInt(localStorage.getItem('gameNumber'));
    if (gameNumber>10) {
        for(var i = gameNumber-9; i<=gameNumber;i++){
            var row = crEl("tr", scoreTable);
            crEl("td", row, "game #"+i);
            crEl("td", row, localStorage.getItem('score'+i));
        }
    } else {
        for(var i = 1; i<=gameNumber;i++){
            var row = crEl("tr", scoreTable);
            crEl("td", row, "game #"+i);
            crEl("td", row, localStorage.getItem('score'+i));
        }
    }
    
}

function crEl(tagName, parent, text) {
    let tag = document.createElement(tagName);
    if (parent) parent.appendChild(tag);
    if (text) tag.innerHTML = text;
    return tag;
}

function showCredits() {
    hideShowScreen("mainmenu","creditsScreen");
}

function hideShowScreen(hideScreen, showScreen) {
    if (hideScreen) {
        var hideScreen = document.getElementById(hideScreen);
        hideScreen.style.display = "none";
    }
    if (showScreen) {
        var showScreen = document.getElementById(showScreen);
        showScreen.style.display = "block";
    }
    
}

function goBack() {
    var parentDiv = this.parentNode;
    var grandParentDiv = parentDiv.parentNode;
    var grandgrandParentDiv = grandParentDiv.parentNode;
    grandgrandParentDiv.style.display = "none";
    if (grandgrandParentDiv.id==="gameRulesScreen") {
        hideShowScreen("gameStoryScreen", "preGameSettingsScreen");
    } else if(grandgrandParentDiv.id==="gameStoryScreen") {
        hideShowScreen("gameStoryScreen", "gameRulesScreen");
    } else {
        hideShowScreen(null, "mainmenu");
    }
}