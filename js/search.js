document.addEventListener('DOMContentLoaded', () => {
    const searchController = {
        searchQuery: '',
        searchResults: [],
        
        init() {
            this.searchInput = document.getElementById('search-query');
            this.searchResults = document.getElementById('search-results');
            this.searchForm = document.getElementById('search-form');
            
            if (!this.searchInput || !this.searchResults || !this.searchForm) return;
            
            this.bindEvents();
            this.loadSearchIndex();
            
            // 检查URL参数
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            if (query) {
                this.searchInput.value = query;
                this.performSearch(query);
            }
        },
        
        bindEvents() {
            // 添加输入防抖
            const debouncedSearch = debounce((query) => {
                this.performSearch(query);
            }, 300);

            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    debouncedSearch(query);
                }
            });
            
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = this.searchInput.value.trim();
                if (!query) return;
                
                // 更新URL但不刷新页面
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('q', query);
                window.history.pushState({}, '', newUrl);
                
                this.performSearch(query);
            });
        },
        
        async loadSearchIndex() {
            try {
                const response = await fetch('/index.json');
                const data = await response.json();
                this.searchIndex = new Fuse(data, {
                    keys: ['title', 'contents'],
                    includeScore: true,
                    threshold: 0.3,
                    minMatchCharLength: 2
                });
            } catch (error) {
                console.error('Error loading search index:', error);
            }
        },
        
        performSearch(query) {
            if (!this.searchIndex) return;
            
            const results = this.searchIndex.search(query);
            this.displayResults(results);
        },
        
        displayResults(results) {
            if (!results.length) {
                this.searchResults.innerHTML = '<div class="no-results">没有找到相关文章</div>';
                return;
            }
            
            const html = results.map(result => {
                const item = result.item;
                return `
                    <article class="post-card">
                        <div class="post-card-inner">
                            ${item.image ? `
                                <div class="post-card-image">
                                    <a href="${item.permalink}" class="search-result-link">
                                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                                    </a>
                                </div>
                            ` : ''}
                            <div class="post-card-content">
                                <h2 class="post-card-title">
                                    <a href="${item.permalink}" class="search-result-link">${item.title}</a>
                                </h2>
                                <p class="post-card-excerpt">${this.truncateText(item.contents, 150)}</p>
                                <div class="post-card-meta">
                                    <div class="post-card-date">
                                        <i class="fas fa-calendar-alt"></i>
                                        <time datetime="${item.date}">${item.date}</time>
                                    </div>
                                    ${item.categories ? `
                                        <span class="post-card-categories">
                                            ${item.categories.map(cat => `
                                                <a href="/categories/${this.slugify(cat)}">${cat}</a>
                                            `).join('')}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
            
            this.searchResults.innerHTML = html;
            
            // 为搜索结果链接添加事件监听器
            document.querySelectorAll('.search-result-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    // 使用 window.location.href 进行跳转
                    window.location.href = href;
                });
            });
        },
        
        truncateText(text, length) {
            if (text.length <= length) return text;
            return text.slice(0, length) + '...';
        },
        
        slugify(text) {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        }
    };
    
    searchController.init();
});

// 添加防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
