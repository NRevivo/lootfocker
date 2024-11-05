document.addEventListener('DOMContentLoaded', async function() {
    // פונקציה לטעינת ה־footer
    async function loadFooter() {
        try {
            const response = await fetch('footer.html'); // עדכן את הנתיב בהתאם למיקום האמיתי של footer.html
            if (!response.ok) throw new Error('Failed to load footer');
            
            const footerHtml = await response.text();
            document.getElementById('footer-container').innerHTML = footerHtml; // הכנס את ה־footer לאלמנט עם id 'footer-container'
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // קריאה לפונקציה לטעינת ה־footer
    loadFooter();
});
