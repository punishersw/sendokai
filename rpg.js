let currentStats = {};

async function apiCall(action, data = {}) {
    const formData = new FormData();
    formData.append('action', action);
    for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
    }

    const response = await fetch('api.php', {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

async function login() {
    const response = await apiCall('login', {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    });

    if (response.success) {
        loadStats();
        document.getElementById('authBox').style.display = 'none';
        document.getElementById('statusBox').style.display = 'block';
    }
}

async function register() {
    await apiCall('register', {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    });
    alert('Conta criada! Faça login.');
}

async function loadStats() {
    const stats = await apiCall('get_stats');
    currentStats = stats;
    updateUI();
}

function updateUI() {
    document.getElementById('strengthValue').textContent = currentStats.strength;
    document.getElementById('agilityValue').textContent = currentStats.agility;
    document.getElementById('pointsValue').textContent = currentStats.points;
}

async function addStat(stat) {
    if (currentStats.points < 1) return;
    
    currentStats[stat]++;
    currentStats.points--;
    
    await apiCall('update_stats', currentStats);
    updateUI();
}

function logout() {
    window.location.reload(); // Simplesmente recarrega a página
}
