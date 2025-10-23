// Gallery auto-refresh and timer management
const REFRESH_INTERVAL = 2000; // 2 seconds
const IMAGE_DISPLAY_TIME = 5; // seconds
const IMAGE_FADEOUT_TIME = 10; // seconds
const TOTAL_LIFETIME = IMAGE_DISPLAY_TIME + IMAGE_FADEOUT_TIME;

let refreshTimer = null;

// Fetch and display images
async function loadGallery() {
    try {
        const response = await fetch('/api/images');
        if (!response.ok) {
            throw new Error('Failed to fetch images');
        }

        const images = await response.json();
        displayGallery(images);
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

// Display images in gallery
function displayGallery(images) {
    const gallery = document.getElementById('gallery');
    const emptyState = document.getElementById('emptyState');
    const imageCount = document.getElementById('imageCount');

    // Update counter
    if (imageCount) {
        imageCount.textContent = images.length;
    }

    // Show/hide empty state
    if (images.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
        // Clear existing gallery items
        const existingItems = gallery.querySelectorAll('.gallery-item');
        existingItems.forEach(item => item.remove());
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // Get existing items
    const existingItems = new Map();
    gallery.querySelectorAll('.gallery-item').forEach(item => {
        existingItems.set(item.dataset.filename, item);
    });

    // Track which images are currently displayed
    const currentFilenames = new Set(images.map(img => img.filename));

    // Remove items that are no longer in the API response
    existingItems.forEach((item, filename) => {
        if (!currentFilenames.has(filename)) {
            item.remove();
        }
    });

    // Add or update images
    images.forEach(image => {
        let item = existingItems.get(image.filename);

        if (!item) {
            // Create new gallery item
            item = createGalleryItem(image);
            gallery.appendChild(item);
        }

        // Update timer and state
        updateGalleryItem(item, image);
    });
}

// Create a new gallery item element
function createGalleryItem(image) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.filename = image.filename;

    item.innerHTML = `
        <img src="${image.url}" alt="${image.comment || 'Uploaded image'}">
        <div class="gallery-item-info">
            <div class="gallery-item-comment">${escapeHtml(image.comment) || 'No comment'}</div>
            <div class="gallery-item-timer">
                <div class="timer-bar">
                    <div class="timer-bar-fill"></div>
                </div>
                <span class="timer-text">5s</span>
            </div>
        </div>
    `;

    return item;
}

// Update gallery item timer and state
function updateGalleryItem(item, image) {
    const age = image.age;
    const timerText = item.querySelector('.timer-text');
    const timerFill = item.querySelector('.timer-bar-fill');

    if (image.state === 'visible') {
        // Display time remaining
        const remaining = Math.max(0, IMAGE_DISPLAY_TIME - age);
        const percentage = (remaining / IMAGE_DISPLAY_TIME) * 100;

        timerText.textContent = `${Math.ceil(remaining)}s`;
        timerFill.style.width = `${percentage}%`;
        timerFill.classList.remove('fading');
        item.classList.remove('fading');
    } else if (image.state === 'fading') {
        // Fading out
        const fadeAge = age - IMAGE_DISPLAY_TIME;
        const fadeRemaining = Math.max(0, IMAGE_FADEOUT_TIME - fadeAge);
        const percentage = (fadeRemaining / IMAGE_FADEOUT_TIME) * 100;

        timerText.textContent = 'Fading...';
        timerFill.style.width = `${percentage}%`;
        timerFill.classList.add('fading');
        item.classList.add('fading');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start auto-refresh
function startAutoRefresh() {
    // Initial load
    loadGallery();

    // Refresh every 2 seconds
    refreshTimer = setInterval(loadGallery, REFRESH_INTERVAL);
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// Initialize when page loads
if (document.getElementById('gallery')) {
    // Start auto-refresh when gallery page loads
    startAutoRefresh();

    // Stop refresh when page is hidden (tab switched, etc.)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        stopAutoRefresh();
    });
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
