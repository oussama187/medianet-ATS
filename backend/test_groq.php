<?php
require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$apiKey = $_ENV['GROQ_API_KEY'] ?? null;
$ch = curl_init('https://api.groq.com/openai/v1/models');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $apiKey]);
$res = curl_exec($ch);
$data = json_decode($res, true);
if (isset($data['data'])) {
    foreach($data['data'] as $model) {
        echo $model['id'] . "\n";
    }
} else {
    echo "Error: $res\n";
}
