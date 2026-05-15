<?php
// LEO/public/api/reset_database.php
require 'config.php';

header('Content-Type: application/json');

if (getenv('LEO_ENABLE_DB_RESET') !== 'true') {
    http_response_code(403);
    echo json_encode([
        "status" => "error",
        "message" => "Reset database disabilitato in questo ambiente."
    ]);
    exit();
}

try {
    // 1. Svuota le tabelle (usiamo DELETE invece di TRUNCATE se ci sono foreign keys)
    // L'ordine è importante per le dipendenze
    $pdo->exec("DELETE FROM sessions");
    $pdo->exec("DELETE FROM child_profiles");
    $pdo->exec("DELETE FROM parent_profiles");

    echo json_encode([
        "status" => "success",
        "message" => "Sistema resettato correttamente. Tutti i dati clinici sono stati eliminati."
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
