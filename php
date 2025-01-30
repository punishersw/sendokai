<?php
$host = "seu_host";
$user = "seu_usuario";
$pass = "sua_senha";
$db = "nome_do_banco";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
