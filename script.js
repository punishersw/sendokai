// 1. Upload de Imagens
function handleImageUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        document.querySelector('.tweet-compose .avatar').style.backgroundImage = `url(${reader.result})`;
    };
    reader.readAsDataURL(file);
}

// 2. Sistema de Seguidores
function followUser(userId) {
    if (!db.currentUser.following.includes(userId)) {
        db.currentUser.following.push(userId);
        db.users.find(u => u.id === userId).followers.push(db.currentUser.id);
    }
}

// 3. Stories (Adicione no HTML)
<div class="stories">
    <div class="story" onclick="viewStory()">
        <div class="story-circle"></div>
        <small>Seu story</small>
    </div>
</div>

// 4. Comunidades
function createCommunity(name) {
    const community = {
        id: Date.now(),
        name,
        members: [db.currentUser.id],
        posts: []
    };
    db.communities.push(community);
}
