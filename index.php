<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neon Jumper</title>
    <!-- Google Fonts -->
    <link href="https://googleapis.com" rel="stylesheet">
    <!-- Prepojenie na externé štýly -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <h1>Neon Jumper</h1>
    <div class="controls">POHYB: ŠÍPKY VĽAVO / VPRAVO</div>

    <div class="game-container">
        <canvas id="gameCanvas" width="400" height="600"></canvas>
        
        <div id="gameOverMenu">
            <!-- TENTO BLOK OBSAHUJE KLASICKÉ MENU -->
            <div id="mainMenuContent">
                <h2>GAME OVER</h2>
                <div id="finalScoreText">Skóre: 0</div>
                
                <div id="saveScoreForm">
                    <input type="text" id="usernameInput" placeholder="Zadaj svoje meno" maxlength="15">
                    <button id="btnUlozit" class="btn" onclick="saveScore()">Uložiť skóre</button>
                </div>

                <button id="btnLeaderboard" class="btn" onclick="loadLeaderboard()">Rebríček</button>
                <button id="btnRestart" class="btn" onclick="resetGame()">Hrať znova</button>
            </div>

            <!-- TENTO BLOK OBSAHUJE REBRÍČEK (SPOČIATKU JE SKRYTÝ) -->
            <div id="leaderboardScreen" style="display: none; width: 100%; text-align: center;">
                <h2 style="color: #bd00ff; text-shadow: 0 0 15px rgba(189, 0, 255, 0.6);">TOP 10 HRÁČOV</h2>
                
                <!-- Tu sa vygeneruje tabuľka, pridali sme wrapper pre bezpečné scrolovanie -->
                <div id="leaderboardScrollWrapper" style="max-height: 320px; overflow-y: auto; width: 90%; margin: 0 auto 20px auto; padding-right: 5px;">
                    <div id="leaderboardContainer"></div>
                </div>

                <button id="btnZavrietLeaderboard" class="btn" onclick="closeLeaderboard()" style="border-color: #ff0055; color: #ff0055;">Zavrieť</button>
            </div>
        </div>
    </div>

    <!-- Načítanie hernej logiky -->
    <script src="funkcie.js"></script>
</body>
</html>
