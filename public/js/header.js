document.addEventListener('DOMContentLoaded', async function() {
    // טוען את ה-Header מ-header.html ומוסיף אותו ל-document
    async function loadHeader() {
        try {
            const response = await fetch('header.html');
            if (!response.ok) throw new Error('Failed to load header');
            
            const headerHtml = await response.text();
            document.getElementById('header-container').innerHTML = headerHtml;
            initializeHeader();
            
            if (window.location.pathname.includes("admin.html")) {
                loadAdminScript();
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // פונקציה לאתחול כל אירועי ה-Header והגדרות הכפתורים
    function initializeHeader() {
        updateAuthButton();
        loadAdminButtonIfNeeded();
        loadPersonalAreaButtonIfNeeded();
        initializeEventListeners();
        updateGreetingMessage();
    }

    // עדכון כפתור ההתחברות/יציאה
    function updateAuthButton() {
        const authButton = document.getElementById('authButton');
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            authButton.textContent = 'Logout';
        } else {
            authButton.textContent = 'Login/Register';
        }
    }

    // טעינת כפתור האדמין אם המשתמש הוא אדמין
    function loadAdminButtonIfNeeded() {
        if (sessionStorage.getItem('isLoggedIn') === "true" && 
            sessionStorage.getItem('isAdmin') === "true") {
            const navLinks = document.querySelector(".nav-links");
            if (!navLinks) return;

            if (!document.querySelector(".admin-link")) {
                const adminItem = document.createElement("li");
                adminItem.classList.add("menu-item", "admin-link");
                adminItem.innerHTML = '<a href="admin.html" class="admin-button">Admin</a>';
                navLinks.appendChild(adminItem);
            }
        }
    }

    // טעינת כפתור האזור האישי אם המשתמש מחובר
    function loadPersonalAreaButtonIfNeeded() {
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            const navLinks = document.querySelector(".nav-links");
            if (!document.querySelector(".personal-area-link")) {
                const personalAreaItem = document.createElement("li");
                personalAreaItem.classList.add("menu-item", "personal-area-link");
                personalAreaItem.innerHTML = '<a href="personalarea.html" class="personalarea-button">Personal Area</a>';
                navLinks.appendChild(personalAreaItem);
            }
        }
    }

    // עדכון הודעת ברכה
    function updateGreetingMessage() {
        const greetingMessage = document.getElementById("greetingMessage");
        if (sessionStorage.getItem("isLoggedIn") === "true") {
            const userFullName = sessionStorage.getItem("fullName");
            greetingMessage.textContent = `Hello, ${userFullName}`;
        } else {
            greetingMessage.textContent = '';
        }
    }

    // פונקציה לאתחול כל אירועי ההדר
    function initializeEventListeners() {
        // אתחול אלמנטים
        const modal = document.getElementById("loginModal");
        const authButton = document.getElementById("authButton");
        const closeModal = document.querySelector(".close");
        const loginForm = document.getElementById("loginFormElement");
        const cartToggle = document.getElementById('cartToggle');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCart = document.getElementById('closeCart');

        // טיפול בכפתור התחברות/יציאה
        if (authButton) {
            authButton.addEventListener('click', function(event) {
                event.preventDefault();
                if (sessionStorage.getItem('isLoggedIn') === "true") {
                    sessionStorage.removeItem('isLoggedIn');
                    sessionStorage.removeItem('isAdmin');
                    sessionStorage.removeItem('email');
                    sessionStorage.removeItem('fullName');
                    sessionStorage.removeItem('userId');
                    updateAuthButton();
                    updateGreetingMessage();
                    window.location.reload();
                } else {
                    modal.style.display = 'flex';
                }
            });
        }

        // טיפול בטופס התחברות
        if (loginForm) {
            loginForm.addEventListener("submit", async function(event) {
                event.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        sessionStorage.setItem("isLoggedIn", "true");
                        sessionStorage.setItem("email", email);
                        sessionStorage.setItem("fullName", data.fullName);
                        
                        if (data.role === "admin") {
                            sessionStorage.setItem("isAdmin", "true");
                        }
                        
                        sessionStorage.setItem("userId", data.userId);
                        alert("התחברת בהצלחה!");
                        window.location.reload();
                    } else {
                        alert(data.message);
                    }
                } catch (err) {
                    console.error("Error during login:", err);
                    alert("An error occurred while logging in.");
                }

                loginForm.reset();
                modal.style.display = "none";
            });
        }

        // טיפול במודל
        if (closeModal) {
            closeModal.addEventListener("click", () => modal.style.display = "none");
        }

        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        // טיפול בעגלת קניות
        if (cartToggle && cartDropdown) {
            cartToggle.addEventListener('click', function(e) {
                e.preventDefault();
                cartDropdown.classList.toggle('active');
            });

            if (closeCart) {
                closeCart.addEventListener('click', () => 
                    cartDropdown.classList.remove('active')
                );
            }

            document.addEventListener('click', function(e) {
                if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
                    cartDropdown.classList.remove('active');
                }
            });
        }
    }

    // פונקציה לטעינת admin.js
    function loadAdminScript() {
        const script = document.createElement('script');
        script.src = 'js/admin.js';
        script.defer = true;
        document.body.appendChild(script);
    }

    // קריאה לפונקציה לטעינת ה-Header
    await loadHeader();
});