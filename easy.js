// 총알 
var bulletSize = 4; // 적절한 크기로 설정
var bulletSpeed = 5; // 원하는 속도로 설정
var bullets = [];
var bulletCooldown = 100; // 총알 생성 간격 (milliseconds)
var lastBulletTime = 0;

// 마지막으로 마우스 위치를 저장한 시간
var lastMouseTime = 0;
// 마우스의 마지막 위치
var lastMousePosition = { x: 0, y: 0 };

// 마우스 이벤트 핸들러
canvas.addEventListener('mousemove', function(event) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = event.clientX - rect.left;
    var mouseY = event.clientY - rect.top;

    lastMousePosition = { x: mouseX, y: mouseY };
    lastMouseTime = Date.now();
});

// 게임 객체 업데이트
function update() {
    // 일정 시간마다 총알 발사
    if (Date.now() - lastBulletTime > bulletCooldown) {
        // 캐릭터 위치
        var characterX = character.x;
        var characterY = character.y;

        // 마우스의 현재 위치
        var mouseX = lastMousePosition.x;
        var mouseY = lastMousePosition.y;

        // 총알 발사 각도
        var bulletAngle = Math.atan2(mouseY - characterY, mouseX - characterX);

        var bullet = {
            x: characterX, // 캐릭터의 위치를 기준으로 총알을 발사
            y: characterY,
            dx: Math.cos(bulletAngle), // 삼각함수를 이용하여 x 방향의 이동 속도 계산
            dy: Math.sin(bulletAngle) // 삼각함수를 이용하여 y 방향의 이동 속도 계산
        };

        bullets.push(bullet);

        lastBulletTime = Date.now(); // 마지막 총알 발사 시간 업데이트
    }


    // 총알 이동 및 충돌 체크
    bullets.forEach(bullet => {
        bullet.x += bullet.dx * bulletSpeed;
        bullet.y += bullet.dy * bulletSpeed;

        // 벽과 충돌 체크
        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullet.dx = -bullet.dx; // x 방향 반전
        }
        if (bullet.y < 0 || bullet.y > canvas.height) {
            bullet.dy = -bullet.dy; // y 방향 반전
        }

    });

    // 총알이 화면 밖으로 나가면 제거
    bullets.forEach((bullet, index) => {
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}
