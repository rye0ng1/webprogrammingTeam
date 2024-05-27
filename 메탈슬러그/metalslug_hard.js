function gameHard(){
    var gamescreen = document.getElementById('gameScreen');
    gamescreen.style.display = "block";
    const canvas = document.getElementById('gameCanvas');
    const enemyContainer = document.getElementById("enemyContainer");
    const itemContainer = document.getElementById("itemContainer");
    const ctx = canvas.getContext('2d');

    var score = 0;
    var time = 150;

    const playerWidth = 100;
    const playerHeight = 100;
    let playerX = (canvas.width - playerWidth) / 2;
    let playerY =  canvas.height - playerHeight;
    let isInvincible = false;

    var playerLives;
    var bulletCooldown;
    const selectedCharacterSetting = document.querySelector('.selectedCharacter');
    const nameValue = selectedCharacterSetting.getAttribute('name');
    if(nameValue == "playersetting1") {     //캐릭터 설정에 따른 목숨 및 총알 속도 조절
        playerLives = 5; 
        bulletCooldown = 200; // 총알 나가는 시간 (ms)
    }
    else {
        playerLives = 3;
        bulletCooldown = 120;
    }

    const FItembulletRadius = 10;
    let bulletRadius = 5;
    let bulletSpeed = 10; // 원래는 5
    let bullets = [];
    let lastBulletTime = 0;
    let lastMousePosition = { x: canvas.width / 2, y: canvas.height / 2 };

    const brickRow = 4;
    const brickColumn = 5; // 원래 8
    const brickWidth = 100;
    const brickHeight = 70;
    const brickPadding = 10;
    const brickOffsetTop = 100;
    const brickOffsetLeft = (canvas.width-(brickColumn*(brickPadding+brickWidth)))/2;
    var bricks = [];
    var brickcnt = 0;

    let enemyrandomspeed = 0.1; // 적의 속도차이 랜덤수치 설정
    let enemybasespeed = 0.07; // 적의 기본 속도 설정
    var hp;
    // boss
    let bossCreated = false; // 전역 변수로 보스 생성 여부를 추적
    let bosssCreated = false; // 두번째보스
    let zombieCreated = false;
    // enemy
    var enemy_created = 0; 
    var enemy_level = 0;  
    var zombiecount = 0;
    const enemy_maxlevel = 2; // 0, 1, 2 단계 적 몇 단계까지인지 체크변수
    // enemy Bullet
    let enemyBullets = [];
    let enemyBulletSpeed = 2;
    let enemyBulletRadius = 5;
    let enemyBulletCooldown = 3000; // 적 총알 발사 주기 (ms)

    let gameClear = false;
    let gameFinish = false;


    let rightPressed = false;
    let leftPressed = false;

    //게임 초기화 함수
    bricks_setting(5 * (enemy_level + 1));
    setupEnemyShooting();


    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousemove', mouseMoveHandler);

    function keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = true;
        }
          else if (e.key ==="ArrowUp" && playerY === canvas.height - playerHeight) {
            playerY -= playerHeight;
        }
        else if (e.key ==="ArrowDown" && playerY === canvas.height - 2 * playerHeight) {
            playerY += playerHeight;
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



    // 플레이어의 생명을 업데이트하는 함수
    function updateplayerLives() {
        const lifeContainer = document.getElementById('life');
        lifeContainer.innerHTML = ''; // 기존 하트 이미지를 모두 제거

        for (let i = 0; i < playerLives; i++) {
            const heart = document.createElement('img');
            heart.src = 'Heart.png'; // 하트 이미지 경로 설정
            heart.width = 50;
            lifeContainer.appendChild(heart);
        }

        if (playerLives <= 0) {
            gameOver();
            return;
        }
    }

    function bricks_setting(hp) {
        for (let c = 0; c < brickColumn; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRow; r++) {
                bricks[c][r] = {x: 0, y: 0, status: hp};
                brickcnt++;
            }
        }
    }

    function shootBullet() {
        const now = Date.now();
        if (now - lastBulletTime > bulletCooldown) {
            const bulletAngle = Math.atan2(lastMousePosition.y - (canvas.height - playerHeight / 2), lastMousePosition.x - (playerX + playerWidth / 2));
            const bullet = {
                x: playerX + playerWidth / 2,
                y: playerY - playerHeight / 4,
                radius: bulletRadius,
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

                if (parseFloat(bricks[c][r].y) > canvas.height){ // 적들이 화면 아래까지 내려갈때
                    bricks[c][r].status = -1; // status가 -1일땐 화면아웃 상태
                    const enemy = document.getElementsByClassName(`enemy${c*brickRow+r}`)[0];
                    if (enemy) {
                        enemy.parentNode.removeChild(enemy);
                        playerLives--; // 플레이어 목숨 하나 까임
                    }
                    continue;
                }

                if (bricks[c][r].status > 0) { // 적의 피가 남았을때
                    if(!enemy_created){ // 맨처음에 보스 생성
                        let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                        let brickY = (r * (brickHeight + brickPadding)) - brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        var maxHP = 30 * (enemy_level + 1); // 적의 최대 체력
                        var hpBarWidth = brickWidth;
                        var remainingHP = (bricks[c][r].status / maxHP) * 60 * hpBarWidth;
                        createEnemy(enemy_level, c*brickRow+r , brickX, brickY, brickWidth ,brickHeight);
                    }
                    else {
                        var maxHP = 5 * (enemy_level + 1); // 적의 최대 체력
                        var hpBarWidth = brickWidth;
                        var remainingHP = (bricks[c][r].status / maxHP) * hpBarWidth;
                    }
                    // 체력바 그리기
                    //var hpBarWidth = brickWidth;
                    var hpBarHeight = brickHeight / 20;

                    enemy = document.getElementsByClassName(`enemy${c*brickRow+r}`)[0];
                    enemyLeft = parseFloat(enemy.style.left);
                    enemyTop = parseFloat(enemy.style.top);

                    //var remainingHP = (bricks[c][r].status / maxHP) * hpBarWidth;
                    var hpBarY = parseFloat(bricks[c][r].y) - hpBarHeight - 2; // 브릭 위에 체력바를 그리기 위해 Y 좌표 조정

                    // 그라데이션 생성
                    var gradient = ctx.createLinearGradient(bricks[c][r].x, hpBarY, bricks[c][r].x + hpBarWidth, hpBarY);
                    gradient.addColorStop(0, "#FF0000"); // 빨간색
                    gradient.addColorStop(1, "#800000"); // 어두운 빨간색

                    // 흰색 배경으로 체력바 그리기 (테두리 포함)
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect( enemyLeft, hpBarY, hpBarWidth, hpBarHeight);

                    // 테두리 그리기
                    ctx.strokeStyle = "#000000"; // 검은색 테두리
                    ctx.lineWidth = 2;
                    ctx.strokeRect( enemyLeft, hpBarY, hpBarWidth, hpBarHeight);

                    // 체력바 그리기 (그라데이션 적용)
                    ctx.fillStyle = gradient;
                    ctx.fillRect( enemyLeft, hpBarY, remainingHP, hpBarHeight);

                }
                else if (bricks[c][r].status == 0){ //죽었을때
                    const enemy = document.getElementsByClassName(`enemy${c*brickRow+r}`)[0];
                    if (enemy) {
                        const rand = Math.random();
                        switch (true) {
                            case (rand < 0.1): //10퍼센트확률로 F아이템생성 
                                createShowFItem(enemy.style.left, enemy.style.top);
                                break;
                            case (rand < 0.3): //30퍼센트확률로 치킨아이템생성
                                createChickenItem(enemy.style.left, enemy.style.top);
                                break;
                        }
                        enemy.parentNode.removeChild(enemy);
                    }

                }
                
            }
        }
        enemy_created = 1;

        if(enemyContainer.childElementCount == 0){ // 만약 적들이 다 죽으면(없으면) 다음 레벨로 이동
            if(enemy_level == enemy_maxlevel){ //모든 레벨의 적들을 죽이면 클리어 페이지 이동
                gameClear = true;
                gameOver();
                return;
            }
            else{ // 다음 단계 설정
                bulletRadius *= 1.25;
                bulletCooldown *= 0.75;
                bulletSpeed *= 1.5;
                enemy_created = 0;
                enemy_level++;
                enemyBulletCooldown *= 0.5;
                enemyBulletRadius *= 1.5;
                bricks_setting(5 * (enemy_level + 1));
            }
        }

    }


    

    let bossDirection = 1; // 초기 방향 (1: 오른쪽, -1: 왼쪽)


    function moveBoss(enemy) {
        setInterval(() => {
            const currentLeft = parseFloat(enemy.style.left);
            const newLeft = currentLeft + bossDirection * 50; // 50px 이동
            if (newLeft <= 0 || newLeft + parseFloat(enemy.style.width) >= canvas.width) {
                bossDirection *= -1; // 벽에 닿으면 방향 반전
            }
            enemy.style.left = `${newLeft}px`;
        }, 1000); // 2초마다 이동

    }

    let bosssDirection = -1;

    function moveBosss(enemy) {
        setInterval(() => {
            const currentLeft = parseFloat(enemy.style.left);
            const newLeft = currentLeft + bossDirection * 30; // 50px 이동
            if (newLeft <= 0 || newLeft + parseFloat(enemy.style.width) >= canvas.width) {
                bosssDirection *= -1; // 벽에 닿으면 방향 반전
            }
            enemy.style.left = `${newLeft}px`;
        }, 400); // 2초마다 이동

    }

    let zombieDirection = 1;

    function moveZombie(enemy) {
        setInterval(() => {
            const currentLeft = parseFloat(enemy.style.left);
            const newLeft = currentLeft + bossDirection * 80; // 50px 이동
            if (newLeft <= 0 || newLeft + parseFloat(enemy.style.width) >= canvas.width) {
                zombieDirection *= -1; // 벽에 닿으면 방향 반전
            }
            enemy.style.left = `${newLeft}px`;
        }, 800); // 2초마다 이동
    }

    function createEnemy(level, brick_num, brickX, brickY, brickWidth, brickHeight) {
        const enemy = document.createElement('img');
    
        if (level < 2) {
            enemy.src = `enemy/enemy${level}.gif`;
            enemy.className = 'enemy' + brick_num;
            enemy.style.position = 'absolute';
            enemy.style.left = `${brickX}px`;
            enemy.style.top = `${brickY}px`;
            enemy.style.width = `${brickWidth}px`;
            enemy.style.height = `${brickHeight}px`;
            enemyContainer.appendChild(enemy);
            //enemy.dataset.isBoss = False; // 보스임을 표시
            enemy.dataset.num = brick_num; // 몇 번째 적인지 저장하는 용도
            const enemyspeed = Math.random() * enemyrandomspeed + enemybasespeed; // 적의 속도 랜덤 설정
            enemy.dataset.speed = enemyspeed; // 속도 데이터를 저장
        } else {
            if (!bossCreated) {
                enemy.src = `enemy/boss2.gif`;
                enemy.className = 'enemy' + brick_num;
                enemy.style.position = 'absolute';
                enemy.style.left = `${(canvas.width - brickWidth * 2) / 2}px`; // 중앙에 배치
                enemy.style.top = '100px'; // 캔버스 상단에 배치
                enemy.style.width = `${brickWidth * 2}px`; // 보스 크기를 더 크게 설정
                enemy.style.height = `${brickHeight * 2}px`;
                enemyContainer.appendChild(enemy);
                //enemy.dataset.isBoss = true; // 보스임을 표시
                bossCreated = true; // 보스 생성 여부를 true로 설정
                enemy.dataset.num = brick_num; // 몇 번째 적인지 저장하는 용도
                const enemyspeed = Math.random() * enemyrandomspeed + enemybasespeed; // 적의 속도 랜덤 설정
                enemy.dataset.speed = enemyspeed; // 속도 데이터를 저장
    
                // 보스 좌우 이동 설정
                moveBoss(enemy);
            }
            else if (!bosssCreated) {
                enemy.src = `enemy/boss1.gif`;
                enemy.className = 'enemy' + brick_num;
                enemy.style.position = 'absolute';
                enemy.style.left = `${(canvas.width - brickWidth * 2) / 2}px`; // 중앙에 배치
                enemy.style.top = '200px'; // 캔버스 상단에 배치
                enemy.style.width = `${brickWidth * 2}px`; // 보스 크기를 더 크게 설정
                enemy.style.height = `${brickHeight * 2}px`;
                enemyContainer.appendChild(enemy);
                //enemy.dataset.isBoss = true; // 보스임을 표시
                bosssCreated = true; // 보스 생성 여부를 true로 설정
                enemy.dataset.num = brick_num; // 몇 번째 적인지 저장하는 용도
                const enemyspeed = Math.random() * enemyrandomspeed + enemybasespeed; // 적의 속도 랜덤 설정
                enemy.dataset.speed = enemyspeed; // 속도 데이터를 저장
                // 보스 좌우 이동 설정
                moveBosss(enemy);
            } 
            else if(!zombieCreated)
                {
                enemy.src = `enemy/enemy3.gif`;
                enemy.className = 'enemy' + brick_num;
                enemy.style.position = 'absolute';
                enemy.style.left = `${(canvas.width - brickWidth * 2) / 2}px`; // 중앙에 배치
                enemy.style.top = `700px`; // 캔버스 상단에 배치
                enemy.style.width = `${brickWidth}px`;
                enemy.style.height = `${brickHeight}px`;
                enemyContainer.appendChild(enemy);
                //enemy.dataset.isBoss = true; // 보스임을 표시
                //zombieCreated = true; // 보스 생성 여부를 true로 설정
                enemy.dataset.num = brick_num; // 몇 번째 적인지 저장하는 용도
                const enemyspeed = Math.random() * enemyrandomspeed + enemybasespeed; // 적의 속도 랜덤 설정
                enemy.dataset.speed = enemyspeed; // 속도 데이터를 저장
                zombiecount += 1;
                zombieCreated = true; 
                moveZombie(enemy);
                }
            
            else {
                enemy.src = `enemy/enemy2.gif`;
                // enemy2의 경우: 위에서 아래로 이동
                enemy.style.left = `${brickX}px`;
                enemy.style.top = `${brickY}px`;
                enemy.className = 'enemy' + brick_num;
                enemy.style.position = 'absolute';
                enemy.style.width = `${brickWidth}px`;
                enemy.style.height = `${brickHeight}px`;
                enemyContainer.appendChild(enemy);
                //enemy.dataset.isBoss = False; // 보스임을 표시
                enemy.dataset.num = brick_num; // 몇 번째 적인지 저장하는 용도
                const enemyspeed = Math.random() * enemyrandomspeed + enemybasespeed; // 적의 속도 랜덤 설정
                enemy.dataset.speed = enemyspeed; // 속도 데이터를 저장
            }
        }
    }
    function updateEnemies() {
        const enemies = document.querySelectorAll('#enemyContainer img');
        enemies.forEach(enemy => {
            const enemyNumber = parseFloat(enemy.dataset.num);
            const c = Math.floor(enemyNumber / brickRow);
            const r = enemyNumber % brickRow;
            if (bricks[c] && bricks[c][r]) { // 존재하는 벽돌인지 체크
                const speed = parseFloat(enemy.dataset.speed);
                const currentLeft = parseFloat(enemy.style.left); // 현재 left 위치
                const currentTop = parseFloat(enemy.style.top); // 현재 top 위치
                
                // 보스가 아닌 적들만 이동
                if (!enemy.src.includes('boss2.gif')) {
                    if (!enemy.src.includes('enemy3.gif')) { 
                        if(!enemy.src.includes('boss1.gif'))
                            {
                        enemy.style.top = `${currentTop + 3 * speed}px`; // 나머지는 위에서 아래로 이동
                            }
                            else {
                                enemy.style.top = `${currentTop + 0.3 * speed}px`; // 나머지는 위에서 아래로 이동
                            }
                        }
                    }
                else {
                     
                }
                bricks[c][r].x = currentLeft + speed;
                bricks[c][r].y = currentTop + speed; // 벽돌의 y 위치 업데이트
            }
        });
    }
    
    

    function createShowFItem(x,y){
        const item = document.createElement('img');
        item.src = 'item/metal-slug-pants.gif';
        item.style.position = 'absolute';
        item.style.left = x;
        item.style.top = y;
        item.style.width = '100px'; // 아이템 크기 설정
        item.style.height = '100px';
        itemContainer.appendChild(item);
        // 2초 후 Fitem생성
        setTimeout(() => {
            const newX = parseFloat(x) + 20; // x에 20px을 더한 값
            createFItem(`${newX}px`, y);
        }, 2000);
        // 3초 후 제거
        setTimeout(() => {
            item.remove();
        }, 3000);
    }

    function createFItem(x, y) {
        const item = document.createElement('img');
        item.src = 'item/F_item.gif';
        item.classList.add('falling-item'); // 떨어지는 아이템 클래스 추가
        item.classList.add('Fitem'); // Fitem으로 클래스 추가
        item.style.position = 'absolute';
        item.style.left = x;
        item.style.top = y;
        item.style.width = '100px'; // 아이템 크기 설정
        item.style.height = '100px';
        itemContainer.appendChild(item);

        // 8초 후 아이템 제거
        setTimeout(() => {
            item.remove();
        }, 8000);
    }

    function createChickenItem(x, y) {
        const item = document.createElement('img');
        item.src = 'item/chicken.gif'; // 아이템2 이미지 경로 설정
        item.className = 'falling-item'; // 떨어지는 아이템
        item.style.position = 'absolute';
        item.style.left = x;
        item.style.top = y;
        item.style.width = '50px'; // 아이템2 크기 설정
        item.style.height = '50px';
        itemContainer.appendChild(item);

        // 8초 후 아이템 제거
        setTimeout(() => {
            item.remove();
        }, 8000);
    }

    function updateItems() {
        const items = document.querySelectorAll('.falling-item');
        items.forEach(item => {
            const currentTop = parseFloat(item.style.top);
            if (currentTop + parseFloat(item.style.height)< canvas.height) {
                const newTop = currentTop + 2; // 아이템 떨어지는 속도 조절 (기존에는 0.5)
                item.style.top = `${newTop}px`;
            }
        });
    }

    function checkCollisionWithItems() { // 아이템 함수들의 main 역할 
        const playerRect = {
            left: playerX,
            top: canvas.height - playerHeight,
            right: playerX + playerWidth,
            bottom: canvas.height
        };

        const items = document.querySelectorAll('.falling-item');

        items.forEach(item => {
            const itemRect = {
                left: parseFloat(item.style.left),
                top: parseFloat(item.style.top),
                right: parseFloat(item.style.left) + parseFloat(item.style.width),
                bottom: parseFloat(item.style.top) + parseFloat(item.style.height)
            };

            if (
                playerRect.left < itemRect.right &&
                playerRect.right > itemRect.left &&
                playerRect.top < itemRect.bottom &&
                playerRect.bottom > itemRect.top
            ) {
                // 아이템 클래스 중 Fitem이 있는지 확인
                if (item.classList.contains('Fitem')) {
                    // Fitem이 포함된 경우 새로운 함수 호출
                    showEffectAndShakeScreen();
                    FItemEat();
                } else {
                    // 그 외의 경우 스코어 증가
                    score += 10; // 예시로 10점을 추가
                    document.getElementById("score").textContent = score;
                }
                 // 충돌 시 아이템 제거 및 스코어 증가
                 item.remove();
            }
        });
    }

    function checkCollisionWithEnemies() {
        const playerRect = {
            left: playerX,
            top: playerY,
            right: playerX + playerWidth,
            bottom: canvas.height
        };

        const enemies = document.querySelectorAll('#enemyContainer img');
        enemies.forEach(enemy => {
            const enemyRect = {
                left: parseFloat(enemy.style.left),
                top: parseFloat(enemy.style.top),
                right: parseFloat(enemy.style.left) + parseFloat(enemy.style.width),
                bottom: parseFloat(enemy.style.top) + parseFloat(enemy.style.height)
            };

            if (
                playerRect.left < enemyRect.right &&
                playerRect.right > enemyRect.left &&
                playerRect.top < enemyRect.bottom &&
                playerRect.bottom > enemyRect.top &&
                !isInvincible
            ) {
                // 충돌 시 무적 상태 및 생명 감소 처리
                handlePlayerCollision();
            }
        });
    }

    function handlePlayerCollision() {
        playerLives -= 1;
        isInvincible = true;

        // 2초 후 무적 상태 해제
        setTimeout(() => {
            isInvincible = false;
        }, 2000);

        // 2초간 깜빡임 효과
        const blinkInterval = setInterval(() => {
            canvas.classList.toggle('blink');
        }, 200);

        setTimeout(() => {
            clearInterval(blinkInterval);
            canvas.classList.remove('blink');
        }, 2000);
    }


    function checkCollisionWithEnemyBullets() {
        const playerRect = {
            left: playerX,
            top: playerY,
            right: playerX + playerWidth,
            bottom: playerY + playerHeight
        };

        enemyBullets.forEach((bullet, index) => {
            const bulletRect = {
                left: bullet.x - bullet.radius,
                top: bullet.y - bullet.radius,
                right: bullet.x + bullet.radius,
                bottom: bullet.y + bullet.radius
            };

            if (
                playerRect.left < bulletRect.right &&
                playerRect.right > bulletRect.left &&
                playerRect.top < bulletRect.bottom &&
                playerRect.bottom > bulletRect.top &&
                !isInvincible
            ) {
                // 충돌 시 무적 상태 및 생명 감소 처리
                handlePlayerCollision();
                enemyBullets.splice(index, 1); // 충돌한 총알 제거
            }
        });
    }


    function showEffectAndShakeScreen() {
        // 화면 흔들림 효과
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.classList.add('shake');

        // 이펙트 표시
        const effect = document.createElement('img');
        effect.src = 'item/skill_effect.gif';
        effect.style.position = 'absolute';
        effect.style.left = `${canvas.width / 2 - 100}px`;
        effect.style.top = `${canvas.height / 2 - 50}px`;
        effect.style.width = '200px';
        effect.style.height = '100px';
        itemContainer.appendChild(effect);

        // 1초 후 제거 및 화면 흔들림 효과 제거
        setTimeout(() => {
            effect.remove();
            gameScreen.classList.remove('shake');
            
            // 화면 흔들림 효과를 다시 적용할 수 있도록 잠시 후에 shake 클래스를 다시 추가
            setTimeout(() => {
                gameScreen.classList.add('shake');
            }, 100); // 0.1초 후에 다시 shake 클래스 추가
        }, 1000);
    }

    // Fitem 충돌 시 호출할 함수
    function FItemEat() {
        // 좌측 가운데에 GIF 이미지 표시
        const gif = document.createElement('img');
        gif.src = 'item/metal-slug-soldier.gif'; // 사용할 GIF 이미지 경로
        gif.style.position = 'absolute';
        gif.style.left = '0'; // 좌측 가운데 위치
        gif.style.top = `${(canvas.height - 300)}px`; // 캔버스 높이에서 100px 위
        gif.style.width = '687px'; // GIF 크기 설정
        gif.style.height = '144px';

        const gamenav = document.getElementById('gamenav');
        gamenav.appendChild(gif);

        // 5초 후 GIF 이미지 제거
        setTimeout(() => {
            gif.remove();
        }, 5000);

        // 5초 동안 랜덤 총알 생성
        const shootInterval = setInterval(() => FItemshootBullets(parseFloat(gif.style.left) + 120, parseFloat(gif.style.top) + 80), 100); // 0.1초마다 총알 생성

        // 5초 후 총알 생성 멈추기
        setTimeout(() => {
            clearInterval(shootInterval);
        }, 5000);
    }

    // 랜덤 방향으로 총알 생성 함수
    function FItemshootBullets(create_x, create_y) {
        const bulletAngle = (Math.random() * Math.PI / 3) - (Math.PI / 6); // -π/6부터 +π/6까지 랜덤한 편차
        const bullet = {
            x: create_x, // 총알 시작 위치 (giff 위치)
            y: create_y,
            radius: FItembulletRadius,
            dx: Math.cos(bulletAngle) * bulletSpeed,
            dy: Math.sin(bulletAngle) * bulletSpeed
        };
        bullets.push(bullet);
    }

    function drawBullets() {
        bullets.forEach((bullet, index) => {
            var bulletImage = new Image();
            bulletImage.src = "bullet.png";
            bulletImage.style.width = "100px"
            ctx.beginPath();
            ctx.drawImage(bulletImage, bullet.x - bulletRadius, bullet.y - bulletRadius, bulletRadius * 4, bulletRadius * 4);
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
                    const brick_x = parseFloat(b.x);
                    const brick_y = parseFloat(b.y);
                    if (b.status > 0) {
                        if (bullet.x > brick_x && bullet.x < brick_x + brickWidth && bullet.y > brick_y && bullet.y < brick_y + brickHeight) {
                            // 충돌한 총알 제거
                            bullets.splice(index, 1);
                            b.status--;
                        }
                        if (b.status == 0) {
                            brickcnt--;
                            var onButton = document.getElementById('effectOnButton');
                            if (onButton.classList.contains('active')) {
                                var effectaudio = new Audio('sound/enemydie4.wav');
                                effectaudio.play();
                            }
                            score += 1;
                            const sc = document.getElementById("score");
                            sc.innerHTML = score;
                        }
                    }
                }
            }
        });
    }

    function shootEnemyBullet(enemy) {
        if (enemy.src.includes('enemy3.gif')) {}
        else {
        const enemyX = parseFloat(enemy.style.left) + parseFloat(enemy.style.width) / 2;
        const enemyY = parseFloat(enemy.style.top) + parseFloat(enemy.style.height);
        const bulletAngle = Math.atan2(canvas.height - playerHeight / 2 - enemyY, playerX + playerWidth / 2 - enemyX);

        const bullet = {
            x: enemyX,
            y: enemyY,
            radius: enemyBulletRadius,
            dx: Math.cos(bulletAngle) * enemyBulletSpeed,
            dy: Math.sin(bulletAngle) * enemyBulletSpeed
        };

        enemyBullets.push(bullet);
    }
    }

    function drawEnemyBullets() {
        if(enemy_level == 0){return;} // 몬스터 레벨1일떈 몬스터는 총 안 쏨
        enemyBullets.forEach((bullet, index) => {

            // 그라데이션 설정
            let gradient = ctx.createRadialGradient(bullet.x, bullet.y, bullet.radius / 2, bullet.x, bullet.y, bullet.radius);
            gradient.addColorStop(0, 'red');
            gradient.addColorStop(1, 'orange');

            // 그림자 설정
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;

            // 총알 그리기
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.closePath();

            

            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            // 화면을 벗어나면 총알 제거
            if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
                enemyBullets.splice(index, 1);
            }
        });
    }

    function setupEnemyShooting() {
        setInterval(() => {
            const enemies = document.querySelectorAll('#enemyContainer img');
            enemies.forEach(enemy => {
                shootEnemyBullet(enemy);
            });
        }, enemyBulletCooldown);
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
        // console.log(angle);
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
        
        ctx.drawImage(characterImage, playerX, playerY, playerWidth, playerHeight);
    }

    // 시간 갱신 주기
    const timerInterval = 1000; // 1초마다 타이머 갱신

    // 게임 시작 시 타이머 시작
    const intervalId = setInterval(updateTimer, timerInterval);

    // 시간 계산 함수
    function updateTimer() {
        if(!gameFinish){
            time--;
        }
        else return;
        
        document.getElementById('timer').textContent = `${time}`;
        if (time === 0) {
            clearInterval(intervalId);
            gameOver();
            return;
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
        gameFinish = true;
        var gameboard = document.getElementById("gameScreen");
        gameboard.style.display = "none";
        hideShowScreen(null,"gameOverScreen");
        showGameOver();
        updateScores(score);
        // callback();
    }

    //게임 종료 화면
    function showGameOver() {
        var gameover = document.getElementById("gameOverScreen");
        var h1 = gameover.getElementsByTagName('h1')[0];
        h1.innerHTML = '';

        const typing = async () => {
            var letter;
            if(!gameClear){
                letter = "GAME OVER . . .".split("");
                setTimeout(showGameOverBtn, 4000);
            }
            else{
                letter = "GAME CLEAR!!".split("");
                setTimeout(showGameWinBtn, 4000);
            }

            while (letter.length)  {
                await new Promise(wait => setTimeout(wait, 100));
                h1.innerHTML += letter.shift(); 
            }
        }
        setTimeout(typing, 1500);    
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

    function showGameWinBtn() {
        var sco = document.getElementById("gameOverScore");
        var btn = document.getElementById("nextstage");
        
        sco.style.display = "block";
        sco.innerHTML = "SCORE : " + score;
        sco.classList.add("appear");
        btn.style.display = "block";
        btn.classList.add("appear");

        btn.onclick = function () {
            hideShowScreen("gameOverScreen", null);
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
        if(!gameFinish){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateplayerLives();
            drawBricks();
            drawCharacter();
            drawBullets();
            drawEnemyBullets();

            shootBullet();
            updateEnemies();
            updateItems();
            checkCollisionWithItems();
            checkCollisionWithEnemies();
            checkCollisionWithEnemyBullets();
            requestAnimationFrame(update);
        }
    }

    // 이미지 다 불러오기
    Promise.all(characterImages.map(img => new Promise(resolve => img.onload = resolve))).then(() => {
        update();
    });
}
