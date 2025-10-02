document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('gallery-scroller');
    const scrollAmount = 400; // How far to scroll in pixels (match your image size)

    document.querySelector('.next-btn').addEventListener('click', () => {
        // Smoothly scrolls to the right
        scroller.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    document.querySelector('.prev-btn').addEventListener('click', () => {
        // Smoothly scrolls to the left
        scroller.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
});
