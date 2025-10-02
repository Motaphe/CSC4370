<?php
// Simple router for PHP built-in server: routes POST /viewreview to viewreview.php

// If the request is for a real file in the directory, let the server handle it
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$docRoot = __DIR__;
$filePath = realpath($docRoot . $path);

if ($filePath && str_starts_with($filePath, $docRoot) && is_file($filePath)) {
  return false; // serve the requested resource as-is
}

// Handle POST /viewreview
if ($path === '/viewreview' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  require __DIR__ . '/viewreview.php';
  return true;
}

// Default: serve index page (our form) or 404
if ($path === '/' || $path === '/index.html') {
  readfile(__DIR__ . '/index.html');
  return true;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "Not Found: " . htmlspecialchars($path, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');


