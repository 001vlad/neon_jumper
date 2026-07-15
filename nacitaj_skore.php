<?php
// Zapneme vyrovnávaciu pamäť, aby sme mohli zmazať prípadné skryté chyby textu
ob_start();

// Vynútime, aby prehliadač vedel, že vraciame čisté dáta JSON
header('Content-Type: application/json; charset=utf-8');


$host = 'localhost';
$dbname = 'neon_jumper_db';
$username_db = 'root';
$password_db = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username_db, $password_db);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Vytiahneme TOP 10 najlepších výsledkov
    $stmt = $pdo->query("SELECT username, score FROM leaderboard ORDER BY score DESC LIMIT 10");
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Vyčistíme všetok text, ktorý by mohol vniknúť pred JSON (napr. skryté PHP warnings)
    ob_clean();
    
    // Odošleme čisté pole do JavaScriptu
    echo json_encode($results, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Ak nastane akákoľvek chyba s DB, vymažeme výstup a pošleme prázdne pole, aby JS nespadol
    ob_clean();
    echo json_encode([]);
}

// Ukončíme a odošleme výstup
ob_end_flush();
?>
