// Function to handle container scrolling
function scrollContainer(containerId, direction) {
    const container = document.querySelector(`.${containerId}`);
    
    // Special handling for articles to scroll exactly 3 at a time
    if (containerId === 'articles-grid') {
        // Get the width of a single article card plus its gap
        const firstCard = container.querySelector('.article-card');
        if (firstCard) {
            const cardWidth = firstCard.offsetWidth;
            const gap = 20; // This should match the gap in your CSS
            
            // Calculate total width of 3 cards (3 cards + 2 gaps between them)
            const threeCardsWidth = (cardWidth * 3) + (gap * 2);
            
            // Calculate new scroll position
            let newScrollLeft = container.scrollLeft + (direction * threeCardsWidth);
            
            // Ensure we don't scroll past the bounds
            if (newScrollLeft < 0) {
                newScrollLeft = 0;
            } else if (newScrollLeft > container.scrollWidth - container.offsetWidth) {
                newScrollLeft = container.scrollWidth - container.offsetWidth;
            }
            
            // Smooth scroll to new position
            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    } else {
        // Default behavior for other containers
        const scrollAmount = container.offsetWidth * 0.7; // Scroll 70% of container width
        
        // Calculate new scroll position
        let newScrollLeft = container.scrollLeft + (direction * scrollAmount);
        
        // Ensure we don't scroll past the bounds
        if (newScrollLeft < 0) {
            newScrollLeft = 0;
        } else if (newScrollLeft > container.scrollWidth - container.offsetWidth) {
            newScrollLeft = container.scrollWidth - container.offsetWidth;
        }
        
        // Smooth scroll to new position
        container.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    }
}
