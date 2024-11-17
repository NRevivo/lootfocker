document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');
    const termsCheckbox = document.getElementById('terms');
    const termsError = termsCheckbox.closest('.form-group').querySelector('.error-message');

    // Real-time validation for required fields
    document.querySelectorAll('input[required]').forEach(input => {
        const errorMessage = input.nextElementSibling;
        input.addEventListener('input', () => validateInput(input, errorMessage));
        input.addEventListener('blur', () => validateInput(input, errorMessage));
    });

    // Form submission handler
    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

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
            }
        };

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

    function validateInput(input, errorMessage) {
        if (!input.checkValidity()) {
            errorMessage.textContent = input.validationMessage;
            errorMessage.style.display = 'block';
            input.classList.add('error');
        } else {
            errorMessage.style.display = 'none';
            input.classList.remove('error');
        }
    }

    function validateFormData(data) {
        let valid = true;

        if (!validateName(data.firstName)) {
            showError('firstName', 'Please enter a valid first name (letters only).');
            valid = false;
        }
        if (!validateName(data.lastName)) {
            showError('lastName', 'Please enter a valid last name (letters only).');
            valid = false;
        }

        if (!validateEmail(data.email)) {
            showError('email', 'Please enter a valid email address.');
            valid = false;
        }

        if (!validatePhone(data.address.phone)) {
            showError('phone', 'Please enter a valid phone number.');
            valid = false;
        }

        if (!termsCheckbox.checked) {
            termsError.style.display = 'block';
            valid = false;
        } else {
            termsError.style.display = 'none';
        }
        return valid;
    }

    // Validation helper functions
    function validateName(name) {
        return /^[A-Za-zא-ת]+$/.test(name);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^\d{9,10}$/.test(phone);
    }

    function showError(fieldId, message) {
        const inputField = document.getElementById(fieldId);
        const errorElement = inputField.nextElementSibling;
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
});
