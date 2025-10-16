// Footer Recent Posts - Standalone Version
// Use this on all pages to show recent posts in footer

class FooterRecentPosts {
    constructor() {
        this.posts = [];
    }

    async init() {
        await this.loadPosts();
        this.displayRecentPosts();
    }

    async loadPosts() {
        try {
            // Try multiple paths to find posts.json
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
                console.error('No posts data found for footer');
                return [];
            }
        } catch (error) {
            console.error('Error loading posts for footer:', error);
            return [];
        }
    }

    displayRecentPosts() {
        const footerRecentContainer = document.getElementById('footer-recent-posts');
        
        // Exit if container doesn't exist (not all pages need it)
        if (!footerRecentContainer) return;
        
        // Exit if no posts loaded
        if (this.posts.length === 0) {
            footerRecentContainer.innerHTML = '<p>No recent posts available</p>';
            return;
        }

        // Get 5 most recent posts sorted by date
        const recentPosts = this.posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        // Display posts
        footerRecentContainer.innerHTML = `
            <h2 class="fourthH">Recent Posts</h2>
            <ul class="recent-posts-list">
                ${recentPosts.map(post => `
                    <li>
                        <a href="${post.url}">
                            <span class="post-title">${post.title}</span>
                        </a>
                    </li>
                `).join('')}
                <li>
                    <a href="/blog/index.html">
                        <span class="post-title">All Blog Posts</span>
                    </a>
                </li>
            </ul>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    const footerPosts = new FooterRecentPosts();
    await footerPosts.init();
});
