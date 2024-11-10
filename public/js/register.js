document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');

    // ולידציה בזמן אמת לכל השדות החובה
    document.querySelectorAll('input[required]').forEach(input => {
        const errorMessage = input.nextElementSibling;

        // אירועים לביצוע הולידציה בזמן אמת ובסיום הקלדה
        input.addEventListener('input', () => validateInput(input, errorMessage));
        input.addEventListener('blur', () => validateInput(input, errorMessage));
    });

    // אירוע שליחה של הטופס
    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // מניעת רענון של העמוד

        // איסוף הנתונים מהטופס
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            address: {
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postalCode').value,
                phone: document.getElementById('phone').value
            },
            paymentMethod: {
                cardNumber: document.getElementById('cardNumber').value,
                expirationDate: document.getElementById('expirationDate').value,
                cvv: document.getElementById('cvv').value,
                cardHolderName: document.getElementById('cardHolderName').value
            }
        };

        // בדיקת תקינות הנתונים
        if (!validateFormData(formData)) return;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Account created successfully!');
                window.location.href = '/homepage.html';
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (err) {
            alert('An error occurred while registering. Please try again.');
        }
    });

    // פונקציה לבדיקת שדה ספציפי והצגת הודעת שגיאה
    function validateInput(input, errorMessage) {
        if (!input.checkValidity()) {
            errorMessage.textContent = input.validationMessage; // הצגת הודעת השגיאה של השדה
            errorMessage.style.display = 'block';
            input.classList.add('error'); // הוספת עיצוב שגיאה לשדה
        } else {
            errorMessage.style.display = 'none';
            input.classList.remove('error');
        }
    }

    // פונקציה לבדיקת כל הנתונים בטופס
    function validateFormData(data) {
        let valid = true;

        // בדיקת שם פרטי ושם משפחה
        if (!validateName(data.firstName)) {
            showError('firstName', 'Please enter a valid first name (letters only).');
            valid = false;
        }
        if (!validateName(data.lastName)) {
            showError('lastName', 'Please enter a valid last name (letters only).');
            valid = false;
        }

        // בדיקת אימייל
        if (!validateEmail(data.email)) {
            showError('email', 'Please enter a valid email address.');
            valid = false;
        }

        // בדיקת מספר טלפון
        if (!validatePhone(data.address.phone)) {
            showError('phone', 'Please enter a valid phone number.');
            valid = false;
        }

        // בדיקת מספר כרטיס אשראי
        if (!validateCreditCard(data.paymentMethod.cardNumber)) {
            showError('cardNumber', 'Please enter a valid credit card number.');
            valid = false;
        }

        // בדיקת תאריך תפוגה
        if (!validateExpirationDate(data.paymentMethod.expirationDate)) {
            showError('expirationDate', 'Please enter a valid expiration date (MM/YY).');
            valid = false;
        }

        // בדיקת CVV
        if (!validateCVV(data.paymentMethod.cvv)) {
            showError('cvv', 'Please enter a valid CVV.');
            valid = false;
        }

        return valid; // מחזיר true רק אם כל הנתונים תקינים
    }

    // פונקציה לבדיקת תקינות של שם (רק אותיות)
    function validateName(name) {
        return /^[A-Za-zא-ת]+$/.test(name);
    }

    // פונקציה לבדיקת תקינות של אימייל
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // פונקציה לבדיקת מספר טלפון
    function validatePhone(phone) {
        return /^\d{9,10}$/.test(phone);
    }

    // פונקציה לבדיקת מספר כרטיס אשראי (16 ספרות)
    function validateCreditCard(cardNumber) {
        return /^\d{16}$/.test(cardNumber);
    }

    // פונקציה לבדיקת תאריך תפוגה של כרטיס אשראי
    function validateExpirationDate(expirationDate) {
        const dateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!dateRegex.test(expirationDate)) return false;

        const [month, year] = expirationDate.split('/');
        const expiration = new Date(`20${year}`, month - 1);
        return expiration >= new Date(); // בדיקה אם התאריך בתוקף
    }

    // פונקציה לבדיקת CVV (3-4 ספרות)
    function validateCVV(cvv) {
        return /^[0-9]{3,4}$/.test(cvv);
    }

    // פונקציה להוספת הודעת שגיאה לשדה מסוים
    function showError(fieldId, message) {
        const inputField = document.getElementById(fieldId);
        const errorElement = inputField.nextElementSibling;
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
});
