<?php
// LEO/public/api/get_expert_data.php
require 'config.php';

header('Content-Type: application/json');

try {
    // 1. Fetch Stats
    $stats = [];
    
    // Pazienti Attivi
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM child_profiles");
    $stats['active_patients'] = $stmt->fetch()['total'] ?? 0;

    // Sessioni completate
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM sessions");
    $stats['total_sessions'] = $stmt->fetch()['total'] ?? 0;

    // Aggiornamenti recenti (sessioni nelle ultime 24 ore o semplicemente le ultime 3)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM sessions WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)");
    $stats['recent_updates'] = $stmt->fetch()['total'] ?? 0;

    // 2. Fetch Recent Patients
    $stmt = $pdo->query("SELECT id, name, age, diagnosis, created_at FROM child_profiles ORDER BY created_at DESC LIMIT 5");
    $patients = $stmt->fetchAll();

    // Mapping per rendere il formato compatibile col frontend
    $formattedPatients = array_map(function($p) {
        return [
            'id' => $p['id'],
            'name' => $p['name'],
            'age' => $p['age'],
            'diagnosis' => $p['diagnosis'] ?? 'In attesa di valutazione',
            'date' => date('d/m', strtotime($p['created_at']))
        ];
    }, $patients);

    echo json_encode([
        "status" => "success",
        "stats" => $stats,
        "patients" => $formattedPatients
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
