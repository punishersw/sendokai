const DB_NAME = 'twitterCloneDB';

// Banco de dados inicial
const initialDB = {
    users: [],
    tweets: [],
    messages: [],
    notifications: [],
    currentUser: null
};

// Funções de persistência
function loadDB() {
    const savedDB = localStorage.getItem(DB_NAME);
    return savedDB ? JSON.parse(savedDB) : initialDB;
}

function saveDB() {
    localStorage.setItem(DB_NAME, JSON.stringify(db));
}

let db = loadDB();

// Sistema de Autenticação
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    document.getElementById('loginModal').innerHTML = `
        <div class="modal-content">
            <h2>Criar Conta</h2>
            <input type="text" id="registerName" placeholder="Nome completo">
            <input type="text" id="registerHandle" placeholder="@username">
            <input type="email" id="registerEmail" placeholder="E-mail">
            <input type="password" id="registerPassword" placeholder="Senha">
            <button onclick="register()">Criar conta</button>
            <button onclick="showLogin()">Já tenho uma conta</button>
        </div>
    `;
}

function register() {
    const newUser = {
        id: Date.now(),
        name: document.getElementById('registerName').value,
        handle: document.getElementById('registerHandle').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        followers: [],
        following: [],
        tweets: [],
        bookmarks: [],
        createdAt: new Date()
    };

    if (db.users.some(u => u.handle === newUser.handle)) {
        alert('Username já está em uso!');
        return;
    }

    db.users.push(newUser);
    db.currentUser = newUser;
    saveDB();
    initApp();
}

function login() {
    const identifier = document.getElementById('loginInput').value;
    const password = document.getElementById('loginPassword').value;

    const user = db.users.find(u => 
        (u.email === identifier || u.handle === identifier) && 
        u.password === password
    );

    if (user) {
        db.currentUser = user;
        saveDB();
        initApp();
    } else {
        alert('Credenciais inválidas!');
    }
}

// Sistema de Tweets
function postTweet() {
    const tweetInput = document.querySelector('.tweet-input');
    const content = tweetInput.value.trim();
    
    if (content && content.length <= 280) {
        const newTweet = {
            id: Date.now(),
            userId: db.currentUser.id,
            content: parseTweetContent(content),
            likes: [],
            retweets: [],
            replies: [],
            timestamp: new Date()
        };

        db.tweets.unshift(newTweet);
        db.currentUser.tweets.push(newTweet.id);
        saveDB();
        renderTweets();
        tweetInput.value = '';
        updateCharCounter();
    }
}

function parseTweetContent(content) {
    return content
        .replace(/#(\w+)/g, '<a href="/tag/$1" class="hashtag">#$1</a>')
        .replace(/@(\w+)/g, '<a href="/user/$1" class="mention">@$1</a>');
}

function renderTweets() {
    const tweetFeed = document.getElementById('tweet-feed');
    tweetFeed.innerHTML = db.tweets
        .map(tweet => {
            const user = db.users.find(u => u.id === tweet.userId);
            return `
                <div class="tweet">
                    <div class="avatar">${user.handle[0]}</div>
                    <div class="tweet-content">
                        <div class="tweet-header">
                            <strong>${user.name}</strong> 
                            <span>${user.handle} · ${new Date(tweet.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p>${tweet.content}</p>
                        <div class="tweet-engagement">
                            <i class="far fa-comment">${tweet.replies.length}</i>
                            <i class="fas fa-retweet">${tweet.retweets.length}</i>
                            <i class="far fa-heart">${tweet.likes.length}</i>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}

// Sistema de UI
function toggleTheme() {
    const theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelector('.theme-toggle i').className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    saveDB();
}

function updateCharCounter() {
    const textarea = document.querySelector('.tweet-input');
    const counter = document.getElementById('char-count');
    counter.textContent = textarea.value.length;
}

// Inicialização
function initApp() {
    if (db.currentUser) {
        document.getElementById('loginModal').style.display = 'none';
        renderTweets();
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.tweet-input').addEventListener('input', updateCharCounter);
    initApp();
    if (!db.currentUser) showLogin();
});
