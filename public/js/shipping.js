// shipping.js - הקובץ החדש והמלא
document.addEventListener('DOMContentLoaded', function() {

    if (headerContainer) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                initializeHeader(); // לקרוא לפונקציה שמאתחלת אירועים ותכנים כמו כפתור כניסה/יציאה
            })
            .catch(error => console.error('Error loading header:', error));
    }
    // Load header and footer dynamically
    loadContent('header.html', 'header-container');
    loadContent('footer.html', 'footer-container');
});

// Function to load content
async function loadContent(url, containerId) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        document.getElementById(containerId).innerHTML = data;
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
    
}