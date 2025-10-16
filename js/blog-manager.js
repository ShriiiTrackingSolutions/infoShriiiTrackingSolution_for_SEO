// Blog Manager - Complete Working Version with Forced Display
class BlogManager {
    constructor() {
        this.posts = [];
        this.searchIndex = null;
        this.currentPostId = null;
    }

    async init() {
        await this.loadPosts();
        this.initializeSearch();
        this.loadRelatedPosts();
        setTimeout(() => {
            this.initializeTagHandlers();
        }, 100);
    }

    async loadPosts() {
        try {
            const paths = ['/posts.json', '../posts.json', './posts.json', 'posts.json'];
            let data = null;
            
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (data && data.posts) {
                this.posts = data.posts;
               
                return this.posts;
            } else {
                console.error('❌ No posts data found');
                return [];
            }
        } catch (error) {
            console.error('❌ Error loading posts:', error);
            return [];
        }
    }

    initializeSearch() {
        if (typeof lunr === 'undefined') {
            console.warn('⚠️ Lunr.js not loaded, search functionality disabled');
            return;
        }

        if (this.posts.length === 0) {
            console.warn('⚠️ No posts available for search indexing');
            return;
        }

        try {
            const posts = this.posts;
            
            this.searchIndex = lunr(function () {
                this.ref('id');
                this.field('title', { boost: 10 });
                this.field('excerpt', { boost: 5 });
                this.field('tags', { boost: 8 });
                this.field('category', { boost: 7 });
                this.field('author');

                posts.forEach(post => {
                    this.add({
                        id: post.id,
                        title: post.title,
                        excerpt: post.excerpt,
                        tags: Array.isArray(post.tags) ? post.tags.join(' ') : '',
                        category: post.category,
                        author: post.author
                    });
                }, this);
            });

      

            const searchInput = document.getElementById('searchInput');
            const searchResults = document.getElementById('searchResults');

            if (searchInput && searchResults) {
                searchInput.addEventListener('input', (e) => {
                    this.performSearch(e.target.value, searchResults);
                });

                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        searchInput.value = '';
                        searchResults.innerHTML = '';
                        searchResults.style.display = 'none';
                    }
                });

                // Updated click listener - don't hide when clicking tags
                document.addEventListener('click', (e) => {
                    const isSearchElement = searchInput.contains(e.target) || 
                                           searchResults.contains(e.target);
                    const isTag = e.target.classList.contains('tag') || 
                                 e.target.closest('.tag');
                    
                    if (!isSearchElement && !isTag) {
                        searchResults.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error initializing search:', error);
        }
    }

    initializeTagHandlers() {
        const tagLinks = document.querySelectorAll('.tag[data-tag]');
        
       
        
        tagLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                const tag = e.target.getAttribute('data-tag');
              
                this.filterByTag(tag);
            });
        });
        

    }

    filterByTag(tag) {

        
        if (!this.posts || this.posts.length === 0) {
            console.error('❌ No posts available');
            alert('Posts are still loading. Please try again.');
            return;
        }
        
        // Filter posts - case-insensitive matching
        const filteredPosts = this.posts.filter(post => {
            if (!post.tags || !Array.isArray(post.tags)) {
                console.warn('⚠️ Post has no tags array:', post.title);
                return false;
            }
            
            const hasTag = post.tags.some(t => 
                t.toLowerCase() === tag.toLowerCase()
            );
            
          
            
            return hasTag;
        });
        

        
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput) {
            console.error('❌ searchInput element not found!');
            return;
        }
        
        if (!searchResults) {
            console.error('❌ searchResults element not found!');
            return;
        }
        
        // Update search input
        searchInput.value = tag;
        
        // Display results
        if (filteredPosts.length > 0) {
            searchResults.innerHTML = `
                <div class="search-results-wrapper">
                    <div class="search-header">
                        <strong>${filteredPosts.length} post${filteredPosts.length > 1 ? 's' : ''} tagged with "${tag}"</strong>
                        <a href="#" onclick="clearSearch(); return false;">Clear</a>
                    </div>
                    ${filteredPosts.map(post => `
                        <div class="search-result-item">
                            <h4><a href="${post.url}">${post.title}</a></h4>
                            <p>${post.excerpt}</p>
                            <div class="post-meta">
                                <span class="category">${post.category}</span>
                                <span class="tags">${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}</span>
                                <span class="read-time">${post.readTime}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // FORCE DISPLAY - Multiple approaches
            searchResults.removeAttribute('style');
            searchResults.style.cssText = `
                display: block !important;
                position: absolute !important;
                z-index: 99999 !important;
                background: white !important;
                border: 1px solid #ddd !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                width: 100% !important;
                max-height: 500px !important;
                overflow-y: auto !important;
                margin-top: 5px !important;
                left: 0 !important;
                top: 100% !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            
            // Add class for CSS targeting
            searchResults.classList.add('force-show');
            
            // Scroll to search area
            setTimeout(() => {
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

        } else {
            const allTags = [...new Set(this.posts.flatMap(p => p.tags || []))];
            searchResults.innerHTML = `
                <div class="no-results" style="padding: 20px;">
                    <p>No posts found with tag "<strong>${tag}</strong>"</p>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        Available tags: ${allTags.join(', ')}
                    </p>
                </div>
            `;
            
            searchResults.removeAttribute('style');
            searchResults.style.cssText = `
                display: block !important;
                position: absolute !important;
                z-index: 99999 !important;
                background: white !important;
                border: 1px solid #ddd !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                width: 100% !important;
                max-height: 500px !important;
                overflow-y: auto !important;
                margin-top: 5px !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            
            searchResults.classList.add('force-show');

        }
    }

    performSearch(query, resultsContainer) {
        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        if (!this.searchIndex) {
            resultsContainer.innerHTML = '<div class="no-results">Search not available</div>';
            resultsContainer.style.display = 'block';
            return;
        }

        try {
            const searchQuery = query.trim().split(' ').map(term => `${term}*`).join(' ');
            const results = this.searchIndex.search(searchQuery);
            
            const matchedPosts = results.map(result => {
                return this.posts.find(post => post.id === result.ref);
            }).filter(post => post);

            if (matchedPosts.length > 0) {
                resultsContainer.innerHTML = `
                    <div class="search-results-wrapper">
                        ${matchedPosts.map(post => `
                            <div class="search-result-item">
                                <h4><a href="${post.url}">${this.highlightText(post.title, query)}</a></h4>
                                <p>${this.highlightText(post.excerpt, query)}</p>
                                <div class="post-meta">
                                    <span class="tags">${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</span>
                                    <span class="read-time">${post.readTime}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.innerHTML = '<div class="no-results">No posts found matching your search</div>';
                resultsContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Search error:', error);
            resultsContainer.innerHTML = '<div class="no-results">Search error occurred</div>';
            resultsContainer.style.display = 'block';
        }
    }

    highlightText(text, query) {
        if (!query) return text;
        
        const terms = query.trim().split(' ').filter(term => term.length > 1);
        let highlightedText = text;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


    loadRelatedPosts() {
        const relatedPostsContainer = document.getElementById('related-posts');
        if (!relatedPostsContainer) return;
        if (this.posts.length === 0) return;

        const currentPostMeta = document.querySelector('meta[name="post-id"]');
        const currentPostId = currentPostMeta ? currentPostMeta.content : null;
        if (!currentPostId) return;

        const currentPost = this.posts.find(post => post.id === currentPostId);
        if (!currentPost) return;

        const relatedPosts = this.posts
            .filter(post => post.id !== currentPostId)
            .map(post => {
                const matchingTags = post.tags.filter(tag => 
                    currentPost.tags.includes(tag)
                );
                return {
                    ...post,
                    matchScore: matchingTags.length,
                    matchingTags: matchingTags
                };
            })
            .filter(post => post.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3);

        if (relatedPosts.length > 0) {
            // ${post.matchingTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            relatedPostsContainer.innerHTML = `
                <div class="related-posts-section">
                    <h3>Related Articles</h3>
                    <div class="related-posts-grid">
                        ${relatedPosts.map(post => `
                            <div class="related-post-card">
                                <h4><a href="${post.url}">${post.title}</a></h4>
                                <p>${post.excerpt}</p>
                                <div class="post-meta">
                                    <span class="category">${post.category}</span>
                                    <span class="read-time">${post.readTime}</span>
                                </div>
                                <div class="matching-tags">
                                    
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getAllPosts() {
        return this.posts;
    }

    getPostsByCategory(category) {
        return this.posts.filter(post => post.category === category);
    }

    getPostsByTag(tag) {
        return this.posts.filter(post => 
            post.tags && post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }
}

// ===========================
// GLOBAL FUNCTIONS
// ===========================

let blogManager;

// Clear search function
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput) searchInput.value = '';
    if (searchResults) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        searchResults.classList.remove('force-show');
    }
}

// Global searchByTag function (for onclick)
function searchByTag(tag) {

    if (blogManager && blogManager.posts.length > 0) {
        blogManager.filterByTag(tag);
    } else {
        console.error('❌ Blog manager not ready');
        alert('Blog is still loading. Please try again in a moment.');
    }
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', async function() {
    blogManager = new BlogManager();
    await blogManager.init();
});
