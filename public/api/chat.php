<?php
// public/api/chat.php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents('php://input'), true);
$messages = $data['messages'] ?? [];
$systemPrompt = $data['systemPrompt'] ?? 'Sei Leo, un assistente gentile.';

$apiKey = leo_get_openai_api_key();

if ($apiKey === '') {
    echo json_encode([
        'text' => 'Leo non e ancora collegato al motore AI. Configura la chiave API per avere una risposta completa.'
    ]);
    exit();
}

$ch = curl_init('https://api.openai.com/v1/chat/completions');

$postData = [
    'model' => 'gpt-4o',
    'messages' => array_merge(
        [['role' => 'system', 'content' => $systemPrompt]],
        $messages
    ),
    'temperature' => 0.7
];

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $response) {
    $decoded = json_decode($response, true);
    $text = $decoded['choices'][0]['message']['content'] ?? '';

    echo json_encode([
        'text' => $text !== '' ? $text : 'Leo ha ricevuto la richiesta, ma non e riuscito a formulare una risposta completa.'
    ]);
    exit();
}

echo json_encode([
    'text' => 'C e stato un problema tecnico nel collegamento con Leo. Riproviamo con una richiesta piu semplice.'
]);
?>
