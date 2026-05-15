<?php
// public/api/vision.php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents('php://input'), true);
$image = $data['image'] ?? '';
$systemPrompt = $data['systemPrompt'] ?? 'Sei Leo, un assistente gentile.';
$task = $data['task'] ?? 'Trova un oggetto';

$apiKey = leo_get_openai_api_key();

if ($apiKey === '') {
    echo json_encode([
        'message' => 'Leo non e ancora collegato al motore vision AI. Configura la chiave API.',
        'objectFound' => false
    ]);
    exit();
}

$ch = curl_init('https://api.openai.com/v1/chat/completions');

$postData = [
    'model' => 'gpt-4o',
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        [
            'role' => 'user',
            'content' => [
                ['type' => 'text', 'text' => "Sto guardando questo. Ho trovato $task?"],
                ['type' => 'image_url', 'image_url' => ['url' => $image]]
            ]
        ]
    ],
    'response_format' => [
        'type' => 'json_schema',
        'json_schema' => [
            'name' => 'vision_analysis',
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'message' => ['type' => 'string'],
                    'objectFound' => ['type' => 'boolean'],
                    'safetyWarning' => ['type' => 'string']
                ],
                'required' => ['message', 'objectFound']
            ]
        ]
    ]
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

if ($httpCode === 200) {
    $resData = json_decode($response, true);
    echo $resData['choices'][0]['message']['content'];
} else {
    echo json_encode(['message' => 'Ops, non riesco a vedere bene! 🦁', 'objectFound' => false]);
}
?>
