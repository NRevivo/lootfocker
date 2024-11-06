document.addEventListener('DOMContentLoaded', function() {
    // פונקציה לטיפול בשליחת טופס צור קשר
    function setupContactForm() {
        const contactForm = document.getElementById("contactForm");
        if (contactForm) {
            contactForm.addEventListener("submit", function(event) {
                event.preventDefault(); // Prevent page refresh
                const fullName = event.target.fullName.value;
                const email = event.target.email.value;
                const message = event.target.message.value;

                // Show success message
                alert("תודה, " + fullName + "! הטופס נשלח בהצלחה.");
                event.target.reset(); // Reset form after submission
            });
        }
    }

    // קריאה לפונקציה כדי לוודא שהטופס נטען והאירועים מוכנים
    setupContactForm();

    // פונקציונליות תפריט עגלת הקניות
    const cartToggle = document.getElementById('cartToggle');
    const cartDropdown = document.getElementById('cartDropdown');
    const closeCart = document.getElementById('closeCart');

    if (cartToggle && cartDropdown) {
        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            cartDropdown.classList.toggle('active');
        });

        if (closeCart) {
            closeCart.addEventListener('click', function() {
                cartDropdown.classList.remove('active');
            });
        }

        document.addEventListener('click', function(e) {
            if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
                cartDropdown.classList.remove('active');
            }
        });
    }
});
