document.addEventListener('DOMContentLoaded', () => {
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
                            /*
                            var audio = new Audio('enemydie2.wav');
                            audio.play(); //상호작용이 없어서 오디오가 재생 안되는데 코드 합치면 작동할 듯
                            */
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

    // Load all character images
    const characterImages = [];
    for (let i = 0; i < 9; i++) {
        const img = new Image();
        img.src = `player_motion/p${i}.png`; // Ensure these paths are correct
        characterImages.push(img);
    }

    // Function to get the appropriate character image based on the angle
    function getCharacterImage(angle) {
        console.log(angle);
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

    // Ensure all images are loaded before starting the game
    Promise.all(characterImages.map(img => new Promise(resolve => img.onload = resolve))).then(() => {
        update();
    });
});
