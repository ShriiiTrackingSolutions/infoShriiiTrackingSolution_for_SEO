// =======================================================
// BLOG INDEX PAGE - Loads data from /posts.json
// When adding new post, only edit posts.json at root level
// =======================================================

let currentFilter = 'all';
let currentSearch = '';
let allPosts = [];

// Initialize the blog page
document.addEventListener('DOMContentLoaded', function() {
    loadPostsData();
});

// Load posts from posts.json
async function loadPostsData() {
    try {
        const response = await fetch('../posts.json');
        const data = await response.json();
        allPosts = data.posts;
        initializePage();
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('blogGrid').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error loading blog posts. Please try again later.
                </div>
            </div>
        `;
    }
}

function initializePage() {
    generateCategoryFilters();
    displayPosts(allPosts);
    setupEventListeners();
}

// Generate category filter buttons
function generateCategoryFilters() {
    const categories = ['all', ...new Set(allPosts.map(post => post.category))];
    const filterContainer = document.getElementById('categoryFilters');
    
    if (!filterContainer) return;
    
    filterContainer.innerHTML = categories.map(category => 
        `<button class="filter-btn ${category === 'all' ? 'active' : ''}" data-category="${category}">
            ${category === 'all' ? 'All' : category}
        </button>`
    ).join('');
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleCategoryFilter);
    });
}

// Handle search
function handleSearch(e) {
    currentSearch = e.target.value.toLowerCase();
    filterAndDisplayPosts();
}

// Handle category filter
function handleCategoryFilter(e) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.category;
    filterAndDisplayPosts();
}

// Filter and display posts
function filterAndDisplayPosts() {
    let filteredPosts = allPosts;
    
    if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === currentFilter);
    }
    
    if (currentSearch) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(currentSearch) ||
            post.excerpt.toLowerCase().includes(currentSearch) ||
            post.tags.some(tag => tag.toLowerCase().includes(currentSearch)) ||
            post.category.toLowerCase().includes(currentSearch) ||
            post.author.toLowerCase().includes(currentSearch)
        );
    }
    
    displayPosts(filteredPosts);
}

// Display posts
function displayPosts(posts) {
    const blogGrid = document.getElementById('blogGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!blogGrid) return;
    
    if (posts.length === 0) {
        blogGrid.innerHTML = '';
        if (noResults) noResults.classList.remove('d-none');
        if (resultsCount) resultsCount.textContent = '';
        return;
    }
    
    if (noResults) noResults.classList.add('d-none');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${posts.length} ${posts.length === 1 ? 'article' : 'articles'}`;
    }
    
    blogGrid.innerHTML = posts.map(post => createBlogCard(post)).join('');
    
    document.querySelectorAll('.blog-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagName = this.textContent.trim();
            const searchInput = document.getElementById('blogSearch');
            if (searchInput) {
                searchInput.value = tagName;
                currentSearch = tagName.toLowerCase();
                filterAndDisplayPosts();
            }
        });
    });
}

// Create blog card HTML
function createBlogCard(post) {
    const formattedDate = formatDate(post.date);
    const categoryColor = getCategoryColor(post.category);
    const postInitial = post.title.charAt(0);
    
    return `
        <div class="col-lg-4 col-md-6">
            <div class="blog-card">
                <div class="blog-card-image-wrapper">
                    ${post.image 
                        ? `<img src="${post.image}" alt="${post.title}" class="blog-card-img" loading="eager">` 
                        : `<div class="blog-card-image-placeholder">${postInitial}</div>`
                    }
                </div>
                <div class="blog-card-body">
                    <span class="blog-category" style="background: ${categoryColor};">${post.category}</span>
                    <h2 class="blog-card-title therdH">
                        <a href="${post.url}">${post.title}</a>
                    </h2>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    
                    <div class="blog-tags">
                        ${post.tags.slice(0, 3).map(tag => 
                            `<span class="blog-tag">${tag}</span>`
                        ).join('')}
                        ${post.tags.length > 3 ? `<span class="blog-tag">+${post.tags.length - 3}</span>` : ''}
                    </div>
                    
                    <div class="blog-card-meta">
                        <div class="blog-meta-item">
                            <i class="far fa-user"></i>
                            <span>${post.author}</span>
                        </div>
                        <div class="blog-meta-item">
                            <i class="far fa-calendar"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="blog-meta-item">
                            <i class="far fa-clock"></i>
                            <span>${post.readTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}



// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getCategoryColor(category) {
    const colors = {
        'SEO': '#2563eb',
        'Digital Marketing': '#a55dadff',
        'Technical SEO': '#1a578dff',
        'Content Marketing': '#43e97b',
        'Web Development': '#fa709a'
    };
    return colors[category] || '#2563eb';
}

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
