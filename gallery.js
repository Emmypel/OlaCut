// ===== GALLERY SYSTEM =====

// Real hairstyle images - make sure these image files are in the same folder as index.html
const galleryImages = [
    { url: './bald.jpg', alt: 'Bald with Beard' },
    { url: './Bro Flow.jpg', alt: 'Bro Flow' },
    { url: './Buzz Cut.jpg', alt: 'Buzz Cut' },
    { url: './Caesar Cut.jpg', alt: 'Caesar Cut' },
    { url: './Comb Over.jpg', alt: 'Comb Over' },
    { url: './Crew Cut.jpg', alt: 'Crew Cut' },
    { url: './Dread.jpg', alt: 'Dreadlocks' },
    { url: './Fade.jpg', alt: 'Fade' },
    { url: './Man Bun.jpg', alt: 'Man Bun' },
    { url: './Mohawk.jpg', alt: 'Mohawk' },
    { url: './Mullet.jpg', alt: 'Mullet' },
    { url: './Pompadour.jpg', alt: 'Pompadour' },
    { url: './Quiff Cut.jpg', alt: 'Quiff Cut' },
    { url: './Side Part.jpg', alt: 'Side Part' },
    { url: './Slicked Back.jpg', alt: 'Slicked Back' },
    { url: './Taper Cut.jpg', alt: 'Taper Cut' },
    { url: './Textured Crop.jpg', alt: 'Textured Crop' },
    { url: './Under Cut.jpg', alt: 'Undercut' }
];

// Populate gallery
function populateGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    galleryImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${image.url}" alt="${image.alt}" loading="lazy">
            <div class="gallery-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        `;
        
        galleryItem.addEventListener('click', () => {
            openLightbox(index);
        });
        
        galleryGrid.appendChild(galleryItem);
    });
}

// Lightbox functionality
let currentImageIndex = 0;

function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightboxImg.src = galleryImages[index].url;
    lightboxImg.alt = galleryImages[index].alt;
    lightbox.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    document.getElementById('lightboxImg').src = galleryImages[currentImageIndex].url;
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('lightboxImg').src = galleryImages[currentImageIndex].url;
}

// Initialize gallery
document.addEventListener('DOMContentLoaded', function() {
    populateGallery();
    
    // Lightbox controls
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxNext').addEventListener('click', nextImage);
    document.getElementById('lightboxPrev').addEventListener('click', prevImage);
    
    // Close lightbox on background click
    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (document.getElementById('lightbox').classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        }
    });
});