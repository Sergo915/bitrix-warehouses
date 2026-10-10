<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED']);
    exit;
}

$method = isset($_GET['method']) ? (string) $_GET['method'] : '';
$allowedMethods = [
    'crm.item.get',
    'crm.item.list',
    'crm.item.fields',
];

if (!in_array($method, $allowedMethods, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'INVALID_BITRIX_METHOD']);
    exit;
}

$config = require __DIR__ . '/config.php';
$webhookBaseUrl = rtrim((string) ($config['webhook_base_url'] ?? ''), '/') . '/';

if ($webhookBaseUrl === '/') {
    http_response_code(500);
    echo json_encode(['error' => 'PROXY_NOT_CONFIGURED']);
    exit;
}

$curl = curl_init($webhookBaseUrl . rawurlencode($method) . '.json');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => file_get_contents('php://input'),
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30,
]);

$responseBody = curl_exec($curl);
$responseCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if ($responseBody === false) {
    http_response_code(502);
    echo json_encode([
        'error' => 'BITRIX_REQUEST_FAILED',
        'error_description' => $curlError,
    ]);
    exit;
}

http_response_code($responseCode >= 100 ? $responseCode : 502);
echo $responseBody;
