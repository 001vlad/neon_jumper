const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverMenu = document.getElementById("gameOverMenu");
const finalScoreText = document.getElementById("finalScoreText");

let score = 0;
let gameOver = false;
let platforms = [];
let frameCount = 0; // Nová premenná na sledovanie času/snímok
let currentTriangleColor = "#ff007f"; // Predvolená farba trojuholníka
const platformCount = 6;

// --- NASTAVENIE VETRA ---
let wind = {
    force: 0,        // Aktuálna sila vetra (- hodnoty = vľavo, + hodnoty = vpravo)
    targetForce: 0,  // Cieľová sila vetra, ku ktorej plynule smerujeme
    timer: 0,        // Ako dlho už aktuálny vietor fúka
    nextChange: 150  // Každých cca 2.5 sekundy (150 snímkov) sa zmení počasie
};

// --- POSTAVIČKA S ROTÁCIOU ---
const player = {
    x: 185,
    y: 350,
    width: 30,
    height: 30,
    vx: 0,
    vy: 0,
    angle: 0,        
    jumpForce: -11,
    gravity: 0.35
};

// Inicializácia hry
// Inicializácia hry
function init() {
    score = 0;
    gameOver = false;
    player.x = 185;
    player.y = 350;
    player.vx = 0;
    player.vy = 0;
    player.angle = 0;
    platforms = [];
    
    // Reset vetra na začiatku
    wind.force = 0;
    wind.targetForce = 0;
    wind.timer = 0;

    // ODSTRÁNENIE ANIMÁCIE NADPISU PRI REŠTARTE
    const title = document.querySelector("h1");
    if (title) {
        title.classList.remove("game-over-pulse");
    }

    // Prvá pevná štartovacia plošina
    platforms.push({ x: 130, y: 520, width: 140, height: 12 });
    
    // Ostatné náhodné plošiny
        for (let i = 1; i < platformCount; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - 110),
            y: canvas.height - (i * 105),
            width: 110,
            height: 12,
            vx: Math.random() > 0.5 ? 1.5 : -1.5 // Náhodný štartovací smer pohybu
        });
    }
    gameOverMenu.style.display = "none";

    document.getElementById("saveScoreForm").style.display = "block";
    document.getElementById("usernameInput").value = ""; // Vyčistí textové pole
    document.getElementById("leaderboardContainer").innerHTML = ""; // Vyčistí rebríček pri novej hre


}


// --- OVLÁDANIE (KLÁVESNICA AJ DOTYK PRE MOBIL) ---
const keys = {};

// Sledovanie klávesnice pre počítače
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

// Nové dotykové ovládanie pre smartfóny
window.addEventListener("touchstart", (e) => {
    // Ak sa hráč dotýka tlačidiel v menu (Uložiť, Reštart, Rebríček), nebudeme mu brať kontrolu nad pohybom
    if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;

    // Zistíme horizontálnu polohu prvého dotyku prsta na displeji
    let touchX = e.touches[0].clientX;
    // Zistíme aktuálnu celkovú šírku obrazovky mobilu
    let windowWidth = window.innerWidth;

    if (touchX < windowWidth / 2) {
        // Dotyk na ľavej polovici obrazovky = letíme vľavo
        keys["ArrowLeft"] = true;
        keys["ArrowRight"] = false;
    } else {
        // Dotyk na pravej polovici obrazovky = letíme vpravo
        keys["ArrowRight"] = true;
        keys["ArrowLeft"] = false;
    }
});

// Keď hráč zdvihne prst z obrazovky mobilu, pohyb a saltá okamžite zastavíme
window.addEventListener("touchend", (e) => {
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
}/*, { passive: true }*/);


// --- LOGIKA ---
function update() {
    if (gameOver) return;

    // --- MANAŽMENT VETRA ---
    wind.timer++;
        // --- MANAŽMENT VETRA (Aktivuje sa až od skóre 400) ---
        if (score >= 200) {
        wind.timer++;
        if (wind.timer >= wind.nextChange) {
            wind.timer = 0;
            let chance = Math.random();
            if (chance < 0.2) {
                wind.targetForce = -2; // Jemný vietor DOĽAVA (predtým bol -4)
            } else if (chance < 0.4) {
                wind.targetForce = 2;  // Jemný vietor DOPRAVA (predtým bol 4)
            } else {
                wind.targetForce = 0;  // Bezvetrie
            }
            wind.nextChange = 100 + Math.floor(Math.random() * 150);
        }
    } else {
        wind.targetForce = 0;
    }


    // Plynulý nábeh a slabnutie vetra (interpolácia)
    wind.force += (wind.targetForce - wind.force) * 0.05;

    // Jemný kývavý efekt vo vzduchu (ak nefúka, jemne sa kýve sám)
    let idleRotation = Math.sin(Date.now() * 0.006) * 0.26; 

    // Ak fúka vietor, trojuholník sa prirodzene nakloní v smere vetra [1]
    if (wind.force !== 0 && !keys["ArrowLeft"] && !keys["ArrowRight"]) {
        idleRotation += wind.force * 0.08; 
    }

    // 1. Ovládanie pohybu a rotácie
    if (keys["ArrowLeft"]) {
        player.vx = -6;
        player.angle -= 0.12; 
    } else if (keys["ArrowRight"]) {
        player.vx = 6;
        player.angle += 0.12; 
    } else {
        player.vx *= 0.8;      
        
        // Plynulý návrat do stabilnej polohy (zohľadňuje aj náklon vetra)
        let diff = idleRotation - player.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff)); 
        player.angle += diff * 0.15;
    }

        // --- POHYB PLATFORIEM (Aktivuje sa až od skóre 400) ---
    if (score >= 400) {
        // Výpočet bonusovej rýchlosti podľa skóre
        let speedMultiplier = 1 + (score / 1000); 

        platforms.forEach((plat, index) => {
            if (index === 0) return; 

            plat.x += plat.vx * speedMultiplier;

            if (plat.x <= 0) {
                plat.x = 0;
                plat.vx = -plat.vx; 
            }
            if (plat.x + plat.width >= canvas.width) {
                plat.x = canvas.width - plat.width;
                plat.vx = -plat.vx; 
            }
        });
    }


    // APLIKÁCIA VETRA NA HRÁČA (Vietor unáša trojuholník do strany)
    player.x += player.vx + wind.force;

    // Nekonečné okraje obrazovky
    if (player.x < -player.width) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -player.width;

    player.vy += player.gravity;
    player.y += player.vy;

    // 2. Fyzika odrazu podľa uhla dopadu
    if (player.vy > 0) { 
        platforms.forEach(plat => {
            if (
                player.x + player.width > plat.x &&
                player.x < plat.x + plat.width &&
                player.y + player.height > plat.y &&
                player.y + player.height < plat.y + plat.height + player.vy
            ) {
                // Odraz na základe presného uhla v momente dopadu
                player.vx = Math.sin(player.angle) * 14;
                player.vy = player.jumpForce * Math.cos(player.angle);
                
                if (player.vy > -4) player.vy = -4;
            }
        });
    }

    // Pohyb kamery nahor
    if (player.y < canvas.height / 2) {
        let diff = canvas.height / 2 - player.y;
        player.y = canvas.height / 2;
        score += Math.round(diff / 5);

       platforms.forEach(plat => {
            plat.y += diff;
            if (plat.y > canvas.height) {
                plat.y = -10;
                plat.x = Math.random() * (canvas.width - plat.width);
                // Pri znovuzrodení pridelíme plošine náhodný smer
                plat.vx = Math.random() > 0.5 ? 1.5 : -1.5;
            }
        });
    }

    // Pád pod okraj = koniec hry
    if (player.y > canvas.height) {
        gameOver = true;
        triggerGameOver();
    }
}

// --- GRAFIKA ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Vykreslenie platforiem
    platforms.forEach(plat => {
        let gradient = ctx.createLinearGradient(plat.x, plat.y, plat.x + plat.width, plat.y);
        gradient.addColorStop(0, "#00ffcc");
        gradient.addColorStop(1, "#0077ff");
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ffcc";
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    });

    // 2. Vykreslenie rotujúceho trojuholníka
        // 2. VYKRESLENIE BLIKAJÚCEHO ROTUJÚCEHO TROJUHOLNÍKA
    // Zoznam agresívnych neónových farieb pre stroboskopický efekt
    const neonColors = ["#ff007f", "#00ffcc", "#ff0055", "#00ff00", "#ffff00", "#bd00ff", "#ff00ff"];
    // Náhodný výber indexu z poľa pri každej snímke hry
    let randomNeon = neonColors[Math.floor(Math.random() * neonColors.length)];

    ctx.fillStyle = randomNeon;
    ctx.shadowBlur = 20;          // Zvýšené žiarenie pre väčšiu intenzitu
    ctx.shadowColor = randomNeon;

    ctx.save(); 
    let centerX = player.x + player.width / 2;
    let centerY = player.y + player.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(player.angle);

    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);                       
    ctx.lineTo(player.width / 2, player.height / 2);         
    ctx.lineTo(-player.width / 2, player.height / 2);        
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.shadowBlur = 0; // Vypnutie tieňov pre texty

    // 3. Vykreslenie skóre
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "bold 18px 'Orbitron', sans-serif";
    ctx.fillText("SCORE: " + score, 25, 40);

    // 4. VYKRESLENIE INDIKÁTORA VETRA
    if (Math.abs(wind.force) > 0.5) {
        ctx.fillStyle = wind.force > 0 ? "#ff0055" : "#00ffcc";
        ctx.font = "bold 14px 'Orbitron', sans-serif";
        
        let windDirectionText = wind.force > 0 ? "VIETOR VPRÁVO >>>" : "<<< VIETOR VĽAVO";
        // Centrovanie textu na stred obrazovky hore
        ctx.fillText(windDirectionText, canvas.width / 2 - 70, 40);
    }
}

// Hlavná slučka
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Koniec hry
function triggerGameOver() {
    finalScoreText.innerText = "Dosiahnuté skóre: " + score;
    gameOverMenu.style.display = "flex";
    
    // Nájdeme nadpis a pridáme mu animáciu
    const title = document.querySelector("h1");
    if (title) {
        title.classList.add("game-over-pulse");
    }
}

// Reštart hry
function resetGame() {
    init();
}

// Prvé spustenie
init();
loop();


// Úplne čistá funkcia pre uloženie skóre
function saveScore() {
    const usernameInput = document.getElementById("usernameInput");
    const username = usernameInput.value.trim();

    if (username === "") {
        alert("Prosím, zadaj svoje meno predtým, ako uložíš skóre!");
        return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("score", score);

    fetch("uloz_skore.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log("Odpoveď servera:", data); 
        
        // SKRYJEME IBA FORMULÁR PRE MENO A UKLADANIE
        // Keďže tlačidlo "Hrať znova" (btnRestart) je mimo tohto divu, zostane svietiť!
        document.getElementById("saveScoreForm").style.display = "none";
        document.getElementById("btnRestart").style.display = "block";
    })
    .catch(error => {
        console.error("Chyba pri komunikácii so serverom:", error);
        alert("Nepodarilo sa spojiť so serverom.");
    });
}



// Koniec hry (Upravené na automatické ukladanie)
function triggerGameOver() {
    finalScoreText.innerText = "Dosiahnuté skóre: " + score;
    gameOverMenu.style.display = "flex";
    
    // Aktivácia animácie nadpisu
    const title = document.querySelector("h1");
    if (title) {
        title.classList.add("game-over-pulse");
    }
    
}

// Funkcia na stiahnutie TOP 10 z databázy a vygenerovanie tabuľky
function loadLeaderboard() {
    fetch("nacitaj_skore.php")
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("leaderboardContainer");
        if (!container) return;

        // Prepnutie obsahu v okne: skryjeme Game Over menu, ukážeme Rebríček
        document.getElementById("mainMenuContent").style.display = "none";
        document.getElementById("leaderboardScreen").style.display = "block";

        if (!Array.isArray(data)) {
            container.innerHTML = "<p style='color: #ff0055;'>Chyba: Server vrátil neplatné dáta.</p>";
            return;
        }

        if (data.length === 0) {
            container.innerHTML = "<p style='color: #8a85a5; margin-top: 15px;'>Zatiaľ žiadne záznamy. Buď prvý!</p>";
            return;
        }

        let html = `<table class="leaderboard-table">
                        <tr>
                            <th>Pozícia</th>
                            <th>Hráč</th>
                            <th>Skóre</th>
                        </tr>`;

        data.forEach((row, index) => {
            html += `<tr>
                        <td>#${index + 1}</td>
                        <td>${row.username}</td>
                        <td>${row.score}</td>
                     </tr>`;
        });

        html += `</table>`;
        container.innerHTML = html;
    })
    .catch(error => {
        console.error("Chyba pri sieťovom načítaní rebríčka:", error);
    });
}

function closeLeaderboard() {
    // Prepnutie obsahu späť: skryjeme Rebríček, ukážeme Game Over menu
    document.getElementById("leaderboardScreen").style.display = "none";
    document.getElementById("mainMenuContent").style.display = "block";
    
    // Vyčistíme kontajner, aby sa pri ďalšom otvorení načítal znova čerstvý
    document.getElementById("leaderboardContainer").innerHTML = "";
}