document.addEventListener('DOMContentLoaded', () => {
    const masterContainer = document.getElementById('master-gallery-container');

    // 1. Fetch the JSON data file
    fetch('../data/gallery_data.json')
        .then(response => response.json())
        .then(collections => {

            // 2. Loop through each collection (e.g., "Cityscapes", "Nature")
            collections.forEach(collection => {
                
                // --- A. Build the HTML for the scrolling image items ---
                let scrollerContent = '';
                collection.images.forEach(image => {
                    scrollerContent += `
                        <div class="gallery-item">
                            <img 
                                src="${image.image_path}" 
                                alt="${image.alt}" 
                                onerror="this.onerror=null; this.src='${image.fallback_path}';"
                            >
                            <a href="${image.download_path}" download class="download-btn">Download</a>
                        </div>
                    `;
                });

                // --- B. Assemble the full collection gallery section ---
                const gallerySection = `
                    <div class="gallery-section">
                        <div class="gallery-header">
                            <h2>${collection.collection_name}</h2>
                            <div class="scroll-buttons">
                                <button class="scroll-btn prev-btn" 
                                    data-target-id="scroller-${collection.collection_name}">&lt;</button>
                                <button class="scroll-btn next-btn" 
                                    data-target-id="scroller-${collection.collection_name}">&gt;</button>
                            </div>
                        </div>
                        
                        <div class="gallery-scroller" id="scroller-${collection.collection_name}">
                            ${scrollerContent}
                        </div>
                    </div>
                `;

                // --- C. Add the entire section to the page ---
                masterContainer.insertAdjacentHTML('beforeend', gallerySection);
            });
            
            // 3. Re-enable scroll button functionality after content is loaded
            setupScrollButtons();

        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            masterContainer.innerHTML = '<p>Could not load the wallpaper gallery.</p>';
        });
        
    // Function to handle horizontal scrolling
    function setupScrollButtons() {
        const scrollAmount = 400; // Match your item width
        
        document.querySelectorAll('.scroll-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.targetId;
                const scroller = document.getElementById(targetId);
                
                if (!scroller) return;

                const direction = e.currentTarget.classList.contains('next-btn') ? 1 : -1;
                scroller.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
            });
        });
    }

});