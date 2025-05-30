// Function to format date
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to create blog card
function createBlogCard(blog) {
    return `
        <div class="col">
            <div class="card blog-card">
                <img src="${blog.thumbnailUrl}" class="card-img-top blog-thumbnail" alt="${blog.title}">
                <div class="card-body">
                    <h5 class="card-title">${blog.title}</h5>
                    <p class="blog-date">${formatDate(blog.createdAt)}</p>
                    <a href="#" class="btn btn-primary" onclick="viewBlog('${blog.id}')">Read More</a>
                </div>
            </div>
        </div>
    `;
}

// Function to view full blog post
function viewBlog(blogId) {
    // Implement blog viewing functionality
    console.log('Viewing blog:', blogId);
}

// Load and display blogs
async function loadBlogs() {
    try {
        const blogGrid = document.getElementById('blogGrid');
        const blogsSnapshot = await db.collection('blogs')
            .orderBy('createdAt', 'desc')
            .get();

        if (blogsSnapshot.empty) {
            blogGrid.innerHTML = '<div class="col-12 text-center"><p>No blogs found.</p></div>';
            return;
        }

        const blogCards = blogsSnapshot.docs.map(doc => {
            const blog = { id: doc.id, ...doc.data() };
            return createBlogCard(blog);
        });

        blogGrid.innerHTML = blogCards.join('');
    } catch (error) {
        console.error('Error loading blogs:', error);
        document.getElementById('blogGrid').innerHTML = 
            '<div class="col-12 text-center"><p>Error loading blogs. Please try again later.</p></div>';
    }
}

// Load blogs when page loads
document.addEventListener('DOMContentLoaded', loadBlogs); 