<?php
// Configurazione centralizzata LEO per hosting PHP classico.

$leoConfig = [
    'openai_api_key' => getenv('OPENAI_API_KEY') ?: 'AIzaSyBy59aNqht2BS0MsXeVJOu6YMaBiLmjQgg',
    'db_host' => getenv('LEO_DB_HOST') ?: 'localhost',
    'db_name' => getenv('LEO_DB_NAME') ?: '',
    'db_user' => getenv('LEO_DB_USER') ?: '',
    'db_password' => getenv('LEO_DB_PASSWORD') ?: '',
    'db_charset' => 'utf8mb4',
];

function leo_get_openai_api_key(): string
{
    global $leoConfig;

    return trim((string) ($leoConfig['openai_api_key'] ?? ''));
}

function leo_create_pdo(): PDO
{
    global $leoConfig;

    $host = (string) ($leoConfig['db_host'] ?? 'localhost');
    $db = (string) ($leoConfig['db_name'] ?? '');
    $user = (string) ($leoConfig['db_user'] ?? '');
    $pass = (string) ($leoConfig['db_password'] ?? '');
    $charset = (string) ($leoConfig['db_charset'] ?? 'utf8mb4');

    if ($db === '' || $user === '') {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Configurazione database incompleta. Imposta db_name, db_user e db_password in public/api/config.php oppure nelle variabili ambiente.'
        ]);
        exit();
    }

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    return new PDO($dsn, $user, $pass, $options);
}

$pdo = null;

if (
    ($leoConfig['db_name'] ?? '') !== '' &&
    ($leoConfig['db_user'] ?? '') !== ''
) {
    try {
        $pdo = leo_create_pdo();
    } catch (\PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Connessione DB fallita: ' . $e->getMessage()
        ]);
        exit();
    }
}
?>