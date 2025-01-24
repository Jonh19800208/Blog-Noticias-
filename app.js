class NewsBlog {
    constructor() {
        this.newsContainer = document.getElementById('newsFeed');
        this.newsModal = document.getElementById('newsModal');
        this.addNewsButton = document.getElementById('addNewsButton');
        this.closeModalButton = document.querySelector('.close');
        this.newsForm = document.getElementById('newsForm');

        this.initEventListeners();
        this.loadNews();
    }

    initEventListeners() {
        this.addNewsButton.addEventListener('click', () => this.openModal());
        this.closeModalButton.addEventListener('click', () => this.closeModal());
        this.newsForm.addEventListener('submit', (e) => this.saveNews(e));
        // Delegate event listener for interaction buttons
        this.newsContainer.addEventListener('click', (e) => this.handleNewsInteraction(e));
    }

    openModal() {
        this.newsModal.style.display = 'block';
    }

    closeModal() {
        this.newsModal.style.display = 'none';
        this.newsForm.reset();
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new NewsBlog();
});