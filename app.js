class NewsBlog {
    constructor() {
        this.newsContainer = document.getElementById('newsFeed');
        this.newsModal = document.getElementById('newsModal');
        this.loginModal = document.getElementById('loginModal');
        this.addNewsButton = document.getElementById('addNewsButton');
        this.loginButton = document.getElementById('loginButton');
        this.closeModalButton = document.querySelector('.close');
        this.closeLoginModalButton = document.querySelector('.close-login');
        this.newsForm = document.getElementById('newsForm');
        this.loginForm = document.getElementById('loginForm');

        this.isAdmin = false;

        this.initEventListeners();
        this.loadNews();
    }

    initEventListeners() {
        // News-related event listeners
        this.addNewsButton.addEventListener('click', () => this.openModal());
        this.closeModalButton.addEventListener('click', () => this.closeModal());
        this.newsForm.addEventListener('submit', (e) => this.saveNews(e));
        this.newsContainer.addEventListener('click', (e) => this.handleNewsInteraction(e));

        // Login-related event listeners
        this.loginButton.addEventListener('click', () => this.openLoginModal());
        this.closeLoginModalButton.addEventListener('click', () => this.closeLoginModal());
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    openModal() {
        this.newsModal.style.display = 'block';
    }

    closeModal() {
        this.newsModal.style.display = 'none';
        this.newsForm.reset();
    }

    openLoginModal() {
        this.loginModal.style.display = 'block';
    }

    closeLoginModal() {
        this.loginModal.style.display = 'none';
        this.loginForm.reset();
    }

    handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;

        if (username === 'admin' && password === '1414') {
            this.isAdmin = true;
            this.addNewsButton.style.display = 'block';
            this.loginButton.style.display = 'none';
            this.closeLoginModal();
            this.renderNews(); // Re-render to show admin controls
            alert('Inicio de sesión exitoso');
        } else {
            alert('Credenciales incorrectas');
        }
    }

    saveNews(event) {
        event.preventDefault();
        
        const title = document.getElementById('titleInput').value;
        const link = document.getElementById('linkInput').value;
        const content = document.getElementById('contentInput').value;

        const news = {
            id: Date.now(),
            title,
            link,
            content,
            date: new Date().toLocaleString(), 
            likes: 0,
            dislikes: 0,
            comments: []
        };

        let newsArray = JSON.parse(localStorage.getItem('newsArray')) || [];
        newsArray.unshift(news);
        localStorage.setItem('newsArray', JSON.stringify(newsArray));

        this.renderNews();
        this.closeModal();
    }

    loadNews() {
        const newsArray = JSON.parse(localStorage.getItem('newsArray')) || [];
        this.renderNews(newsArray);
    }

    renderNews(newsArray = []) {
        this.newsContainer.innerHTML = '';
        newsArray.forEach((news, index) => {
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            newsItem.dataset.index = index;
            
            newsItem.innerHTML = `
                <h2>${news.title}</h2>
                ${news.link ? `<img src="${news.link}" alt="${news.title}">` : ''}
                <p>${news.content}</p>
                <small>Publicado el: ${news.date}</small>
                <div class="news-interactions">
                    <div class="interaction-buttons">
                        <button class="like-btn" data-type="like">
                            <i class="fas fa-thumbs-up"></i> ${news.likes || 0}
                        </button>
                        <button class="dislike-btn" data-type="dislike">
                            <i class="fas fa-thumbs-down"></i> ${news.dislikes || 0}
                        </button>
                        ${this.isAdmin ? `
                            <button class="edit-btn" data-type="edit">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="delete-btn" data-type="delete">
                                <i class="fas fa-trash"></i> Borrar
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="comments-section">
                    <input type="text" class="comment-input" placeholder="Escribe un comentario...">
                    <div class="comment-list">
                        ${news.comments ? news.comments.map(comment => `<p>${comment}</p>`).join('') : ''}
                    </div>
                </div>
            `;

            this.newsContainer.appendChild(newsItem);
        });
    }

    handleNewsInteraction(e) {
        const newsItem = e.target.closest('.news-item');
        if (!newsItem) return;

        const index = newsItem.dataset.index;
        let newsArray = JSON.parse(localStorage.getItem('newsArray')) || [];
        const currentNews = newsArray[index];

        // Handle Admin Actions
        if (this.isAdmin) {
            if (e.target.closest('.edit-btn')) {
                // Populate form with current news details for editing
                document.getElementById('titleInput').value = currentNews.title;
                document.getElementById('linkInput').value = currentNews.link;
                document.getElementById('contentInput').value = currentNews.content;
                
                // Remove the existing news item
                newsArray.splice(index, 1);
                localStorage.setItem('newsArray', JSON.stringify(newsArray));
                
                this.openModal();
                return;
            }

            if (e.target.closest('.delete-btn')) {
                // Remove the news item
                newsArray.splice(index, 1);
                localStorage.setItem('newsArray', JSON.stringify(newsArray));
                this.renderNews(newsArray);
                return;
            }
        }

        // Existing Like/Dislike and Comment logic
        if (e.target.closest('.like-btn') || e.target.closest('.dislike-btn')) {
            const interactionType = e.target.closest('.like-btn') ? 'likes' : 'dislikes';
            currentNews[interactionType] = (currentNews[interactionType] || 0) + 1;
        }

        if (e.target.classList.contains('comment-input')) {
            const commentInput = e.target;
            commentInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' && commentInput.value.trim()) {
                    if (!currentNews.comments) currentNews.comments = [];
                    currentNews.comments.push(commentInput.value.trim());
                    commentInput.value = '';
                }
            });
        }

        // Save updated news array
        localStorage.setItem('newsArray', JSON.stringify(newsArray));
        
        // Re-render news to reflect changes
        this.renderNews(newsArray);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new NewsBlog();
});