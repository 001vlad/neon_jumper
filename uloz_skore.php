<?php
header('Content-Type: text/plain; charset=utf-8');

// PRIAME NASTAVENIE PRIPOJENIA
$host = 'localhost';
$dbname = 'neon_jumper_db';
$username_db = 'root';
$password_db = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username_db, $password_db);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Chyba pripojenia k databáze: " . $e->getMessage());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = isset($_POST['username']) ? trim($_POST['username']) : '';
    $userScore = isset($_POST['score']) ? intval($_POST['score']) : 0;

    if (!empty($user) && $userScore >= 0) {
        try {
            // Bezpečný zápis do tabuľky leaderboard
            $stmt = $pdo->prepare("INSERT INTO leaderboard (username, score) VALUES (:username, :score)");
            $stmt->execute([
                ':username' => $user,
                ':score' => $userScore
            ]);

            echo "Skóre úspešne uložené!";
        } catch (PDOException $e) {
            echo "Chyba pri zápise do databázy: " . $e->getMessage();
        }
    } else {
        echo "Neplatné meno alebo skóre.";
    }
} else {
    echo "Tento skript prijíma iba POST požiadavky.";
}
?>
