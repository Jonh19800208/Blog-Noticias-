class NewsBlog {
    constructor() {
        this.newsContainer = document.getElementById('newsFeed');
        this.newsModal = document.getElementById('newsModal');
        this.addNewsButton = document.getElementById('addNewsButton');
        this.closeModalButton = document.querySelector('.close');
        this.newsForm = document.getElementById('newsForm');

        // Admin login elements
        this.adminLoginButton = document.getElementById('adminLoginButton');
        this.adminLoginModal = document.getElementById('adminLoginModal');
        this.closeLoginModalButton = document.querySelector('.close-login');
        this.adminLoginForm = document.getElementById('adminLoginForm');

        // Add admin logout button
        this.adminLogoutButton = document.getElementById('adminLogoutButton');

        // Clear news button
        this.clearNewsButton = document.getElementById('clearNewsButton');

        this.isAdminLoggedIn = false;

        this.initEventListeners();
        this.loadNews();
    }

    initEventListeners() {
        this.addNewsButton.addEventListener('click', () => {
            if (this.isAdminLoggedIn) {
                this.openModal();
            } else {
                alert('Debes iniciar sesión como administrador para añadir noticias');
            }
        });
        this.closeModalButton.addEventListener('click', () => this.closeModal());
        this.newsForm.addEventListener('submit', (e) => {
            if (this.isAdminLoggedIn) {
                this.saveNews(e);
            } else {
                e.preventDefault();
                alert('Debes iniciar sesión como administrador para añadir noticias');
            }
        });
        
        // Admin login event listeners
        this.adminLoginButton.addEventListener('click', () => this.openAdminLoginModal());
        this.closeLoginModalButton.addEventListener('click', () => this.closeAdminLoginModal());
        this.adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));

        // Add event listener for admin logout
        this.adminLogoutButton.addEventListener('click', () => this.handleAdminLogout());

        // Delegate event listener for interaction buttons
        this.newsContainer.addEventListener('click', (e) => this.handleNewsInteraction(e));

        // Add event listener for clear news button
        this.clearNewsButton.addEventListener('click', () => this.clearAllNews());
    }

    openAdminLoginModal() {
        this.adminLoginModal.style.display = 'block';
    }

    closeAdminLoginModal() {
        this.adminLoginModal.style.display = 'none';
        this.adminLoginForm.reset();
    }

    handleAdminLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === 'admin' && password === '1414') {
            this.isAdminLoggedIn = true;
            this.closeAdminLoginModal();
            this.renderNews(); // Re-render to show admin controls
            
            // Show admin-only buttons
            this.addNewsButton.style.display = 'block';
            this.clearNewsButton.style.display = 'block';
            this.adminLogoutButton.style.display = 'block'; // Show logout button
            this.adminLoginButton.style.display = 'none'; // Hide login button
            
            alert('Sesión de administrador iniciada');
        } else {
            alert('Credenciales incorrectas');
        }
    }

    handleAdminLogout() {
        this.isAdminLoggedIn = false;
        
        // Hide admin-only buttons
        this.addNewsButton.style.display = 'none';
        this.clearNewsButton.style.display = 'none';
        this.adminLogoutButton.style.display = 'none';
        this.adminLoginButton.style.display = 'block';
        
        // Re-render news to remove admin controls
        this.renderNews();
        
        alert('Sesión de administrador cerrada');
    }

    openModal() {
        this.newsModal.style.display = 'block';
    }

    closeModal() {
        this.newsModal.style.display = 'none';
        this.newsForm.reset();
    }

    saveNews(event) {
        if (!this.isAdminLoggedIn) {
            event.preventDefault();
            alert('Debes iniciar sesión como administrador para añadir noticias');
            return;
        }

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
                    </div>
                    ${this.isAdminLoggedIn ? `
                    <div class="admin-news-controls">
                        <button class="edit-btn" data-index="${index}">Editar</button>
                        <button class="delete-btn" data-index="${index}">Borrar</button>
                    </div>` : ''}
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

        // Handle admin edit and delete
        if (this.isAdminLoggedIn) {
            if (e.target.classList.contains('edit-btn')) {
                this.editNews(index, currentNews);
                return;
            }

            if (e.target.classList.contains('delete-btn')) {
                this.deleteNews(index);
                return;
            }
        }

        // Handle Like/Dislike
        if (e.target.closest('.like-btn') || e.target.closest('.dislike-btn')) {
            const interactionType = e.target.closest('.like-btn') ? 'likes' : 'dislikes';
            currentNews[interactionType] = (currentNews[interactionType] || 0) + 1;
        }

        // Handle Comments
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

    editNews(index, news) {
        // Populate the modal with existing news details
        document.getElementById('titleInput').value = news.title;
        document.getElementById('linkInput').value = news.link || '';
        document.getElementById('contentInput').value = news.content;

        // Open the modal
        this.openModal();

        // Modify form submission to update existing news
        this.newsForm.onsubmit = (e) => {
            e.preventDefault();
            
            // Get updated values
            const updatedTitle = document.getElementById('titleInput').value;
            const updatedLink = document.getElementById('linkInput').value;
            const updatedContent = document.getElementById('contentInput').value;

            // Get existing news array
            let newsArray = JSON.parse(localStorage.getItem('newsArray')) || [];

            // Update the specific news item
            newsArray[index] = {
                ...newsArray[index],
                title: updatedTitle,
                link: updatedLink,
                content: updatedContent
            };

            // Save updated array
            localStorage.setItem('newsArray', JSON.stringify(newsArray));

            // Re-render and close modal
            this.renderNews(newsArray);
            this.closeModal();

            // Reset form submission
            this.newsForm.onsubmit = this.saveNews.bind(this);
        };
    }

    deleteNews(index) {
        if (!this.isAdminLoggedIn) {
            alert('Debes iniciar sesión como administrador para borrar noticias');
            return;
        }

        // Confirm deletion
        if (confirm('¿Estás seguro de que quieres borrar esta noticia?')) {
            // Get existing news array
            let newsArray = JSON.parse(localStorage.getItem('newsArray')) || [];

            // Remove the specific news item
            newsArray.splice(index, 1);

            // Save updated array
            localStorage.setItem('newsArray', JSON.stringify(newsArray));

            // Re-render
            this.renderNews(newsArray);
        }
    }

    clearAllNews() {
        // Only allow clearing if admin is logged in
        if (!this.isAdminLoggedIn) {
            alert('Debes iniciar sesión como administrador primero');
            return;
        }

        if (confirm('¿Estás seguro de que quieres borrar TODAS las noticias?')) {
            // Clear news from localStorage
            localStorage.removeItem('newsArray');

            // Clear the news feed
            this.newsContainer.innerHTML = '';

            alert('Todas las noticias han sido borradas');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new NewsBlog();
});