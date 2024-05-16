window.onload = mainMenu;

window.gameSettings = {
    gameRules: "off",
    gameStory: "off",
    gameMode: "1",
    character: "player1_big.png",
    backgroundImg: "mainbackground.png",
    music: "BGM1.wav",
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




function start() {
    var parentDiv = this.parentNode;
    var grandParentDiv = parentDiv.parentNode;
    var grandgrandParentDiv = grandParentDiv.parentNode;
    var gameRulesScreen = document.getElementById("gameRulesScreen");
    var gameStoryScreen = document.getElementById("gameStoryScreen");
    score = 0;
    if (window.gameSettings.gameRules ==="off" && window.gameSettings.gameStory ==="off") {
        hideShowScreen("preGameSettingsScreen",null);
        // brickGame();
    }
    else if (window.gameSettings.gameRules ==="on" && window.gameSettings.gameStory ==="off") {
        if (grandgrandParentDiv.id === "gameRulesScreen") {
            hideShowScreen("gameRulesScreen",null);
            // brickGame();
        } else {
            hideShowScreen("preGameSettingsScreen","gameRulesScreen");
        }
    } 
    else if (window.gameSettings.gameRules ==="off" && window.gameSettings.gameStory ==="on") {
        if (grandgrandParentDiv.id === "gameStoryScreen") {
            hideShowScreen("gameStoryScreen",null);
            // brickGame();
        } else {
            hideShowScreen("preGameSettingsScreen","gameStoryScreen");
        }
    } 
    else {
        if (grandgrandParentDiv.id === "gameRulesScreen") {
            hideShowScreen("gameRulesScreen","gameStoryScreen");
        } else if (grandgrandParentDiv.id === "gameStoryScreen") {
            hideShowScreen("gameStoryScreen",null);
            // brickGame();
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
            window.gameSettings.music = this.name+".wav";
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