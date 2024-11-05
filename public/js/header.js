document.addEventListener('DOMContentLoaded', async function() {
    // טוען את ה-Header מ-header.html ומוסיף אותו ל-document
    async function loadHeader() {
        try {
            const response = await fetch('header.html'); // עדכן את הנתיב בהתאם למיקום האמיתי של header.html
            if (!response.ok) throw new Error('Failed to load header');
            
            const headerHtml = await response.text();
            document.getElementById('header-container').innerHTML = headerHtml; // הכנס את ה-Header לאלמנט עם id 'header-container'
            initializeHeader();
            
            // לאחר שה-Header נטען, טען את admin.js אם העמוד הוא admin.html
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
        if (sessionStorage.getItem('isLoggedIn') === "true" && sessionStorage.getItem('isAdmin') === "true") {
            const navLinks = document.querySelector(".nav-links");
            if (!document.querySelector(".admin-link")) {
                const adminItem = document.createElement("li");
                adminItem.classList.add("menu-item", "admin-link");
                adminItem.innerHTML = '<a href="admin.html" class="admin-button">Admin</a>';
                navLinks.appendChild(adminItem);
            }
        }
    }

    // טעינת כפתור האזור האישי אם יש צורך
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

    // פונקציה לאתחול כל אירועי ההדר
    function initializeEventListeners() {
        const modal = document.getElementById("loginModal");
        const authButton = document.getElementById('authButton');
        const loginLink = document.querySelector(".login-register a");
        const closeModal = document.querySelector(".close");

        if (authButton) {
            authButton.addEventListener('click', function(event) {
                event.preventDefault();
                if (sessionStorage.getItem('isLoggedIn') === "true") {
                    sessionStorage.clear();
                    updateAuthButton();
                    window.location.reload();
                } else {
                    modal.style.display = 'flex';
                }
            });
        }

        if (loginLink) {
            loginLink.addEventListener("click", function(event) {
                event.preventDefault();
                modal.style.display = "flex";
            });
        }

        if (closeModal) {
            closeModal.addEventListener("click", function() {
                modal.style.display = "none";
            });
        }

        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        // Cart functionality
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

        // Handle login form submission
        const loginForm = document.querySelector("#loginFormElement");
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
                        if (data.role === "admin") {
                            sessionStorage.setItem("isAdmin", "true");
                        }
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
    }

    // פונקציה לטעינת admin.js באופן דינמי
    function loadAdminScript() {
        const script = document.createElement('script');
        script.src = 'js/admin.js'; // ודא שהנתיב ל-admin.js נכון
        script.defer = true; // וודא שהקובץ ייטען אחרי שאר תוכן ה-HTML
        document.body.appendChild(script);
    }

    // עדכון הודעת ברכה אם המשתמש מחובר
    function updateGreetingMessage() {
        const greetingMessage = document.getElementById("greetingMessage");
        if (sessionStorage.getItem("isLoggedIn") === "true") {
            const userEmail = sessionStorage.getItem("email");
            greetingMessage.textContent = `שלום, ${userEmail}`;
        } else {
            greetingMessage.textContent = '';
        }
    }

document.addEventListener('DOMContentLoaded', function() {
    // Initialize header state
    updateAuthButton();
    loadAdminButtonIfNeeded();
    updateGreetingMessage();
    initializeHeaderEvents();

    // עדכון כפתור ההתחברות/יציאה
    function updateAuthButton() {
        const authButton = document.getElementById('authButton');
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            authButton.textContent = 'Logout';
        } else {
            authButton.textContent = 'Login/Register';
        }
    }

    // טעינת כפתור האדמין אם יש צורך
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

    // עדכון הודעת ברכה
    function updateGreetingMessage() {
        const greetingMessage = document.getElementById("greetingMessage");
        if (sessionStorage.getItem("isLoggedIn") === "true") {
            const userEmail = sessionStorage.getItem("email");
            greetingMessage.textContent = `שלום, ${userEmail}`;
        } else {
            greetingMessage.textContent = '';
        }
    }

    // פונקציה לאתחול אירועי ההדר
    function initializeHeaderEvents() {
        // Modal Events
        const modal = document.getElementById("loginModal");
        const authButton = document.getElementById("authButton");
        const closeModal = document.querySelector(".close");
        const loginForm = document.getElementById("loginForm");

        authButton.addEventListener('click', function(event) {
            event.preventDefault();
            if (sessionStorage.getItem('isLoggedIn') === "true") {
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('isAdmin');
                sessionStorage.removeItem('email');
                sessionStorage.removeItem('userId'); // הוספת הסרת userId
                updateAuthButton();
                updateGreetingMessage(); // עדכון ההודעה
                window.location.reload();
            } else {
                modal.style.display = 'flex';
            }
        });

        closeModal.addEventListener('click', () => modal.style.display = "none");
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        // Login Form Submission
        loginForm.addEventListener('submit', async function(event) {
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

                console.log("Response data from login:", data); // בדיקה

                if (response.ok) {
                    sessionStorage.setItem("isLoggedIn", "true");
                    sessionStorage.setItem("email", email);

                    if (data.role === "admin") {
                        sessionStorage.setItem("isAdmin", "true");
                    }

                    // שמירת ה-userId
                    sessionStorage.setItem("userId", data.userId);
                    console.log("User ID saved in sessionStorage:", sessionStorage.getItem("userId")); // בדיקה

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

        // Cart Events
        const cartToggle = document.getElementById('cartToggle');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCart = document.getElementById('closeCart');

        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            cartDropdown.classList.toggle('active');
        });

        closeCart.addEventListener('click', () => 
            cartDropdown.classList.remove('active')
        );

        document.addEventListener('click', function(e) {
            if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
                cartDropdown.classList.remove('active');
            }
        });
    }
});



    // קריאה לפונקציה לטעינת ה-Header
    loadHeader();
});
