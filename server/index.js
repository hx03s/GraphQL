document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.querySelector('.sign-in form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const account = loginForm.querySelector('input[type="account"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        console.log('Attempting login with:', account);
        
        try {
            const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${account}:${password}`)}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Login failed:', response.status, errorText);
                throw new Error(`Login failed: ${response.status} ${errorText}`);
            }

            const token = await response.text();
            console.log('Raw token:', token);
            
            // Remove quotes and any escape characters
            const cleanToken = token.replace(/['"\\]/g, '');
            console.log('Clean token:', cleanToken);
            
            // Store clean token in localStorage
            localStorage.setItem('jwt-token', cleanToken);
            
            // Verify token is stored correctly
            const storedToken = localStorage.getItem('jwt-token');
            console.log('Stored token:', storedToken);
            
            // Redirect to profile page after successful login
            window.location.href = '../profile.html';
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message);
        }
    });
});