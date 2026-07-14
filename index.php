<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neon Jumper</title>
    <!-- Google Fonts -->
    <link href="https://googleapis.com" rel="stylesheet">
    <!-- Prepojenie na štýly -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <h1>Neon Jumper</h1>
    <div class="controls">POHYB: ŠÍPKY VĽAVO / VPRAVO</div>

    <div class="game-container">
        <canvas id="gameCanvas" width="400" height="600"></canvas>
        
        <div id="gameOverMenu">
            <h2>GAME OVER</h2>
            <div id="finalScoreText">Skóre: 0</div>
            <button class="btn" onclick="resetGame()">Hrať znova</button>
        </div>
    </div>

    <!-- Prepojenie na logiku hry (musí byť na konci body, aby už existoval canvas) -->
    <script src="funkcie.js"></script>
</body>
</html>
