<?php
header('Content-Type: application/json');
$conn = new mysqli("localhost", "SEU_USUARIO", "SUA_SENHA", "NOME_DB");

// Operações via POST
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'register':
        $username = $_POST['username'];
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        
        $stmt = $conn->prepare("INSERT INTO rpg_users (username, password_hash) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $password);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    case 'login':
        $username = $_POST['username'];
        $password = $_POST['password'];
        
        $stmt = $conn->prepare("SELECT id, password_hash FROM rpg_users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
        break;

    case 'update_stats':
        session_start();
        if (!isset($_SESSION['user_id'])) die(json_encode(['success' => false]));
        
        $stats = [
            'strength' => (int)$_POST['strength'],
            'agility' => (int)$_POST['agility'],
            'points' => (int)$_POST['points']
        ];
        
        $stmt = $conn->prepare("UPDATE rpg_users SET 
            strength = ?, 
            agility = ?, 
            points = ? 
            WHERE id = ?");
        
        $stmt->bind_param("iiii", 
            $stats['strength'],
            $stats['agility'],
            $stats['points'],
            $_SESSION['user_id']
        );
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    case 'get_stats':
        session_start();
        if (!isset($_SESSION['user_id'])) die(json_encode(['success' => false]));
        
        $stmt = $conn->prepare("SELECT strength, agility, points FROM rpg_users WHERE id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        echo json_encode($result);
        break;

    default:
        echo json_encode(['error' => 'Ação inválida']);
}
