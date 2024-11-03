document.addEventListener('DOMContentLoaded', () => {
    const searchController = {
        fuse: null,
        searchForm: document.getElementById('search-form'),
        searchQuery: document.getElementById('search-query'),
        searchResults: document.getElementById('search-results'),
        isSearchPage: window.location.pathname === '/pages/search/',

        // Fuse.js 配置
        fuseOptions: {
            keys: ['title', 'contents'],
            includeMatches: true,
            threshold: 0.3,
            location: 0,
            distance: 100,
            minMatchCharLength: 2
        },

        async loadSearchIndex() {
            if (this.fuse) return;

            try {
                const response = await fetch('/index.json');
                if (!response.ok) {
                    throw new Error('无法获取搜索索引');
                }
                const data = await response.json();
                this.fuse = new Fuse(data, this.fuseOptions);
            } catch (error) {
                console.error('加载搜索索引时出错:', error);
                this.handleError('加载搜索索引失败');
            }
        },

        async performSearch(query) {
            await this.loadSearchIndex();
            return this.fuse ? this.fuse.search(query) : [];
        },

        displayResults(results) {
            if (!this.searchResults) return;

            this.searchResults.innerHTML = results.length > 0
                ? results.map(result => this.createResultCard(result)).join('')
                : '<p>没有找到相关结果。</p>';
        },

        createResultCard(result) {
            const { item } = result;
            return `
                <article class="post-card">
                    ${item.image ? this.createImageSection(item) : ''}
                    <div class="post-card-content">
                        <h2 class="post-card-title">
                            <a href="${item.permalink}">${item.title}</a>
                        </h2>
                        <p class="post-card-excerpt">
                            ${item.contents.substring(0, 150)}...
                        </p>
                        <div class="post-card-meta">
                            <time datetime="${item.date}">${item.date}</time>
                            ${item.categories ? this.createCategoriesSection(item.categories) : ''}
                        </div>
                    </div>
                </article>
            `;
        },

        createImageSection(item) {
            return `
                <div class="post-card-image">
                    <a href="${item.permalink}">
                        <img src="${item.image}" 
                             alt="${item.title}" 
                             loading="lazy"
                             onerror="this.style.display='none'"
                        >
                    </a>
                </div>
            `;
        },

        createCategoriesSection(categories) {
            return `
                <span class="post-card-categories">
                    ${categories.map(category => `
                        <a href="/categories/${encodeURIComponent(category)}">
                            ${category}
                        </a>
                    `).join('')}
                </span>
            `;
        },

        handleError(message) {
            if (this.searchResults) {
                this.searchResults.innerHTML = `
                    <div class="error-message">
                        <p>${message}</p>
                    </div>
                `;
            }
        },

        init() {
            if (this.searchForm) {
                this.searchForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const query = this.searchQuery.value.trim();
                    if (query) {
                        window.location.href = `/pages/search/?q=${encodeURIComponent(query)}`;
                    }
                });
            }

            if (this.isSearchPage) {
                const urlParams = new URLSearchParams(window.location.search);
                const query = urlParams.get('q');
                if (query) {
                    this.searchQuery.value = query;
                    this.performSearch(query)
                        .then(results => this.displayResults(results))
                        .catch(error => this.handleError('搜索过程中发生错误'));
                }
            }
        }
    };

    searchController.init();
});
