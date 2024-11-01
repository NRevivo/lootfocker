document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');

    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // למנוע רענון של העמוד

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

        console.log('Form data being sent:', formData); // הדפסת הנתונים שנאספו

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status); // הדפסת סטטוס התגובה

            if (response.ok) {
                alert('Account created successfully!');
                window.location.href = '/homepage.html'; // הפניה לדף הבית
            } else {
                const errorData = await response.json();
                console.log('Error data:', errorData); // הדפסת הודעת השגיאה אם הבקשה לא הצליחה
                alert(`Error: ${errorData.message}`);
            }
        } catch (err) {
            console.error('Error during registration:', err);
            alert('An error occurred while registering. Please try again.');
        }
    });
});
