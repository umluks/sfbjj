<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit();
}

$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados de entrada JSON inválidos']);
    exit();
}

$to = filter_var($data['to'] ?? '', FILTER_VALIDATE_EMAIL);
$subject = trim($data['subject'] ?? '');
$html = trim($data['html'] ?? '');

if (!$to || empty($subject) || empty($html)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parâmetros obrigatórios ausentes ou inválidos (to, subject, html)']);
    exit();
}

// Carregar variáveis de ambiente (via getenv ou $_ENV ou fallback do arquivo .env)
$smtpHost = getenv('SMTP_HOST') ?: (getenv('VITE_SMTP_HOST') ?: 'mail.sagradafamiliabjj.com.br');
$smtpPort = intval(getenv('SMTP_PORT') ?: (getenv('VITE_SMTP_PORT') ?: 465));
$smtpUser = getenv('SMTP_USER') ?: (getenv('VITE_SMTP_USER') ?: 'nao-responder@sagradafamiliabjj.com.br');
$smtpPass = getenv('SMTP_PASS') ?: (getenv('VITE_SMTP_PASS') ?: '');

// Se houver arquivo .env na raiz do servidor web, carregar variáveis adicionais
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if ($name === 'SMTP_HOST' || $name === 'VITE_SMTP_HOST') $smtpHost = $value ?: $smtpHost;
            if ($name === 'SMTP_PORT' || $name === 'VITE_SMTP_PORT') $smtpPort = intval($value) ?: $smtpPort;
            if ($name === 'SMTP_USER' || $name === 'VITE_SMTP_USER') $smtpUser = $value ?: $smtpUser;
            if ($name === 'SMTP_PASS' || $name === 'VITE_SMTP_PASS') $smtpPass = $value ?: $smtpPass;
        }
    }
}

/**
 * Envio via Socket SMTP Direto (SSL 465 ou TLS 587)
 */
function sendSmtpMail($host, $port, $user, $pass, $to, $subject, $htmlBody) {
    $timeout = 15;
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $prefix = ($port == 465) ? 'ssl://' : '';
    $socket = @stream_socket_client($prefix . $host . ':' . $port, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);

    if (!$socket) {
        throw new Exception("Falha na conexão SMTP com {$host}:{$port} - ({$errno}) {$errstr}");
    }

    $read = function($socket) {
        $response = '';
        while ($str = fgets($socket, 515)) {
            $response .= $str;
            if (substr($str, 3, 1) == ' ') break;
        }
        return $response;
    };

    $write = function($socket, $cmd) {
        fputs($socket, $cmd . "\r\n");
    };

    $response = $read($socket);
    if (substr($response, 0, 3) !== '220') {
        fclose($socket);
        throw new Exception("Erro de saudação do servidor SMTP: {$response}");
    }

    $write($socket, "EHLO " . gethostname());
    $read($socket);

    if ($port == 587) {
        $write($socket, "STARTTLS");
        $response = $read($socket);
        if (substr($response, 0, 3) === '220') {
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $write($socket, "EHLO " . gethostname());
            $read($socket);
        }
    }

    if (!empty($user) && !empty($pass)) {
        $write($socket, "AUTH LOGIN");
        $response = $read($socket);
        if (substr($response, 0, 3) !== '334') {
            fclose($socket);
            throw new Exception("AUTH LOGIN não aceito: {$response}");
        }

        $write($socket, base64_encode($user));
        $response = $read($socket);
        if (substr($response, 0, 3) !== '334') {
            fclose($socket);
            throw new Exception("Usuário SMTP rejeitado: {$response}");
        }

        $write($socket, base64_encode($pass));
        $response = $read($socket);
        if (substr($response, 0, 3) !== '235') {
            fclose($socket);
            throw new Exception("Senha SMTP incorreta/rejeitada: {$response}");
        }
    }

    $write($socket, "MAIL FROM: <{$user}>");
    $response = $read($socket);
    if (substr($response, 0, 3) !== '250') {
        fclose($socket);
        throw new Exception("Endereço de remetente rejeitado: {$response}");
    }

    $write($socket, "RCPT TO: <{$to}>");
    $response = $read($socket);
    if (substr($response, 0, 3) !== '250') {
        fclose($socket);
        throw new Exception("Endereço de destino rejeitado: {$response}");
    }

    $write($socket, "DATA");
    $response = $read($socket);
    if (substr($response, 0, 3) !== '354') {
        fclose($socket);
        throw new Exception("Servidor não aceitou os dados: {$response}");
    }

    $fromName = "Sagrada Família BJJ";
    $headers = [];
    $headers[] = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$user}>";
    $headers[] = "To: <{$to}>";
    $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: SFBJJ Mailer 1.0";
    $headers[] = "Date: " . date('r');

    $message = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
    $write($socket, $message);
    $response = $read($socket);

    if (substr($response, 0, 3) !== '250') {
        fclose($socket);
        throw new Exception("Erro ao enviar o conteúdo do e-mail: {$response}");
    }

    $write($socket, "QUIT");
    fclose($socket);

    return true;
}

try {
    // Tenta envio SMTP Socket
    sendSmtpMail($smtpHost, $smtpPort, $smtpUser, $smtpPass, $to, $subject, $html);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'E-mail enviado com sucesso via SMTP HostGator'
    ]);
} catch (Exception $e) {
    // Fallback: tenta mail() nativo se o socket direto não for aceito pela hospedagem local
    $fromName = "Sagrada Família BJJ";
    $headers  = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
    $headers .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <" . $smtpUser . ">" . "\r\n";
    $headers .= "Reply-To: " . $smtpUser . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    $mailSuccess = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, $headers);

    if ($mailSuccess) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'E-mail enviado com sucesso via mail() HostGator'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Falha no envio de e-mail: ' . $e->getMessage()
        ]);
    }
}
