// Sistema de Tweets Avançado
const TweetSystem = {
  postTweet(content, options = {}) {
    const tweet = {
      id: Date.now(),
      userId: db.currentUser.id,
      content: this.parseContent(content),
      likes: [],
      retweets: [],
      replies: [],
      timestamp: new Date(),
      media: options.media || null,
      poll: options.poll || null,
      thread: options.thread || null,
      sensitive: options.sensitive || false
    };

    db.tweets.unshift(tweet);
    this.dispatchTweetEvent(tweet);
    saveDB();
    return tweet;
  },

  parseContent(content) {
    return content
      .replace(/#(\w+)/g, '<a href="/tag/$1" class="hashtag">#$1</a>')
      .replace(/@(\w+)/g, (match, username) => {
        const user = db.users.find(u => u.handle === `@${username}`);
        return user ? `<a href="/${username}" class="mention">@${username}</a>` : match;
      });
  },

  createPoll(question, options, duration) {
    return {
      question,
      options: options.map(text => ({ text, votes: 0 })),
      endsAt: new Date(Date.now() + duration * 60000)
    };
  },

  votePoll(tweetId, optionIndex) {
    const tweet = db.tweets.find(t => t.id === tweetId);
    if (tweet?.poll && !this.hasVoted(tweetId)) {
      tweet.poll.options[optionIndex].votes++;
      tweet.poll.voters.push(db.currentUser.id);
      saveDB();
      renderTweets();
    }
  },

  hasVoted(tweetId) {
    const tweet = db.tweets.find(t => t.id === tweetId);
    return tweet?.poll?.voters?.includes(db.currentUser.id);
  },

  dispatchTweetEvent(tweet) {
    const event = new CustomEvent('newtweet', {
      detail: { tweet }
    });
    window.dispatchEvent(event);
  }
};

// Sistema de Notificações Avançado
const NotificationSystem = {
  types: {
    LIKE: 'like',
    RETWEET: 'retweet',
    REPLY: 'reply',
    FOLLOW: 'follow',
    MENTION: 'mention'
  },

  createNotification(type, data) {
    return {
      id: Date.now(),
      type,
      data,
      read: false,
      timestamp: new Date()
    };
  },

  sendNotification(userId, notification) {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.notifications = user.notifications || [];
      user.notifications.push(notification);
      saveDB();
      
      if (userId === db.currentUser?.id) {
        this.showDesktopNotification(notification);
      }
    }
  },

  showDesktopNotification(notification) {
    if (Notification.permission === 'granted') {
      new Notification('Novo no X', {
        body: this.getNotificationText(notification),
        icon: '/logo.png'
      });
    }
  },

  getNotificationText(notification) {
    const user = db.users.find(u => u.id === notification.data.senderId);
    switch(notification.type) {
      case this.types.LIKE:
        return `${user.name} curtiu seu tweet`;
      case this.types.RETWEET:
        return `${user.name} retweetou seu tweet`;
      case this.types.REPLY:
        return `${user.name} respondeu seu tweet`;
      case this.types.FOLLOW:
        return `${user.name} começou a seguir você`;
      case this.types.MENTION:
        return `${user.name} mencionou você em um tweet`;
    }
  }
};

// Sistema de Comunidades
const CommunitySystem = {
  createCommunity(name, description, rules) {
    return {
      id: Date.now(),
      name,
      description,
      rules,
      members: [db.currentUser.id],
      admins: [db.currentUser.id],
      created: new Date(),
      banner: null,
      icon: null
    };
  },

  joinCommunity(communityId) {
    const community = db.communities.find(c => c.id === communityId);
    if (community && !community.members.includes(db.currentUser.id)) {
      community.members.push(db.currentUser.id);
      saveDB();
    }
  },

  moderateContent(tweetId, action) {
    if (this.isAdmin(db.currentUser.id)) {
      const tweet = db.tweets.find(t => t.id === tweetId);
      switch(action) {
        case 'delete':
          tweet.deleted = true;
          break;
        case 'hide':
          tweet.hidden = true;
          break;
        case 'flag':
          tweet.flagged = true;
          break;
      }
      saveDB();
    }
  },

  isAdmin(userId) {
    return db.communities.some(c => c.admins.includes(userId));
  }
};
