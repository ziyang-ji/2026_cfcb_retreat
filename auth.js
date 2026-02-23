// Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOT6O0wnWUUcacDnjKqrwvV0-tZNBYl24P2L47oAVcpzlyDvzVzI1ATLmWPsj7R2-uQg/exec';


// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Sign in with Google using Firebase
async function signInWithGoogle() {
    try {
        // Check if Firebase is initialized
        if (!window.firebaseAuth) {
            alert('Firebase not initialized. Please refresh the page.');
            return;
        }
        
        console.log('Starting Google Sign-In...');
        
        // Create Google provider
        const provider = new window.GoogleAuthProvider();
        
        // Sign in with popup
        const result = await window.signInWithPopup(window.firebaseAuth, provider);
        
        // Show loading only after successful popup (user actually signed in)
        showLoading(true);
        
        // Get user info
        const user = result.user;
        console.log('Google Sign-In successful:', user.email);
        
        // Check if user exists in our system
        const checkResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkUser&email=${encodeURIComponent(user.email)}`);
        const checkResult = await checkResponse.json();
        
        let userId;
        let userName = user.displayName || user.email.split('@')[0];
        
        if (!checkResult.exists) {
            // Create new user account in Google Sheets
            console.log('Creating new user account for Google user...');
            
            const userData = {
                action: 'createUser',
                name: userName,
                email: user.email,
                password: 'GOOGLE_AUTH', // Special marker for Google-authenticated users
                timestamp: new Date().toISOString()
            };
            
            const createResponse = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify(userData)
            });
            
            const createResult = await createResponse.json();
            
            if (!createResult.success) {
                showLoading(false);
                alert('Failed to create user account: ' + createResult.message);
                return;
            }
            
            userId = createResult.userId;
            console.log('New user account created:', userId);
        } else {
            // Authenticate existing user
            console.log('Authenticating existing Google user...');
            
            const authResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=authenticateUser&email=${encodeURIComponent(user.email)}&password=${encodeURIComponent('GOOGLE_AUTH')}`);
            const authResult = await authResponse.json();
            
            if (authResult.success) {
                userId = authResult.userId;
                userName = authResult.name;
            } else {
                // If auth fails with GOOGLE_AUTH, user might have signed up with email/password
                // Let them in anyway since Google verified their identity
                const checkResponse2 = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUserByEmail&email=${encodeURIComponent(user.email)}`);
                const checkResult2 = await checkResponse2.json();
                
                if (checkResult2.success) {
                    userId = checkResult2.userId;
                    userName = checkResult2.name;
                } else {
                    showLoading(false);
                    alert('Authentication failed. Please try signing in with email/password instead.');
                    return;
                }
            }
        }
        
        // Save user session
        const userSession = {
            userId: userId,
            name: userName,
            email: user.email,
            loginTime: Date.now(),
            authMethod: 'google'
        };
        
        localStorage.setItem('userSession', JSON.stringify(userSession));
        
        console.log('Session saved, redirecting to dashboard...');
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Google Sign-In error:', error);
        
        // Silently handle popup closed by user - don't show any message
        if (error.code === 'auth/popup-closed-by-user') {
            console.log('User closed the sign-in popup');
            return;
        }
        
        // Only show alerts for actual errors
        if (error.code === 'auth/popup-blocked') {
            alert('Pop-up blocked by browser. Please allow pop-ups for this site.');
        } else if (error.code === 'auth/unauthorized-domain') {
            alert('This domain is not authorized. Please add it to Firebase authorized domains.');
        } else if (error.message && !error.code) {
            // Only show custom error messages, not Firebase errors
            alert(error.message);
        }
    }
}

// Phone Authentication Functions

// Send verification code
async function sendVerificationCode(event) {
    event.preventDefault();
    
    let phoneNumber = document.getElementById('phone-number').value.trim();
    
    // Remove all non-digit characters except leading +
    phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // If no country code, assume +1 (US)
    if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+1' + phoneNumber;
    }
    
    console.log('Formatted phone number:', phoneNumber);
    
    showLoading(true);
    
    try {
        if (!window.firebaseAuth) {
            alert('Firebase not initialized. Please refresh the page.');
            showLoading(false);
            return;
        }
        
        console.log('Sending verification code to:', phoneNumber);
        
        // Setup reCAPTCHA verifier
        if (!window.recaptchaVerifier) {
            console.log('Creating reCAPTCHA verifier...');
            console.log('Firebase Auth:', window.firebaseAuth);
            
            window.recaptchaVerifier = new window.RecaptchaVerifier(
                window.firebaseAuth,
                'recaptcha-container',
                {
                    'size': 'normal',
                    'callback': (response) => {
                        console.log('reCAPTCHA solved');
                    },
                    'expired-callback': () => {
                        console.log('reCAPTCHA expired');
                    }
                }
            );
            
            // Render the reCAPTCHA
            await window.recaptchaVerifier.render();
            console.log('reCAPTCHA rendered');
        }
        
        console.log('Sending SMS...');
        
        // Send verification code
        const appVerifier = window.recaptchaVerifier;
        confirmationResult = await window.signInWithPhoneNumber(window.firebaseAuth, phoneNumber, appVerifier);
        
        console.log('Verification code sent successfully');
        showLoading(false);
        
        // Show verification form
        document.getElementById('phone-form').style.display = 'none';
        document.getElementById('verification-form').style.display = 'block';
        
    } catch (error) {
        showLoading(false);
        console.error('Error sending verification code:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'auth/invalid-phone-number') {
            alert('Invalid phone number. Please check the format.');
        } else if (error.code === 'auth/too-many-requests') {
            alert('Too many attempts. Please try again later.');
        } else if (error.code === 'auth/captcha-check-failed') {
            alert('reCAPTCHA verification failed. Please try again.');
        } else {
            alert('Failed to send verification code: ' + error.message);
        }
        
        // Reset reCAPTCHA on error
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            } catch (e) {
                console.error('Error clearing reCAPTCHA:', e);
            }
        }
    }
}

// Verify code and sign in
async function verifyCode(event) {
    event.preventDefault();
    
    const code = document.getElementById('verification-code').value.trim();
    
    if (code.length !== 6) {
        alert('Please enter a 6-digit verification code');
        return;
    }
    
    showLoading(true);
    
    try {
        // Verify the code
        const result = await confirmationResult.confirm(code);
        const user = result.user;
        
        console.log('Phone authentication successful:', user.phoneNumber);
        
        // Check if user exists in our system
        const phoneNumber = user.phoneNumber;
        const checkResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkUserByPhone&phone=${encodeURIComponent(phoneNumber)}`);
        const checkResult = await checkResponse.json();
        
        let userId;
        let userName;
        
        if (!checkResult.exists) {
            // New user - prompt for name
            userName = prompt('Welcome! Please enter your full name:');
            if (!userName || !userName.trim()) {
                userName = phoneNumber; // Use phone as fallback name
            }
            
            // Create new user account
            const userData = {
                action: 'createUser',
                name: userName.trim(),
                phone: phoneNumber,
                password: 'PHONE_AUTH',
                timestamp: new Date().toISOString()
            };
            
            const createResponse = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(userData)
            });
            
            const createResult = await createResponse.json();
            
            if (!createResult.success) {
                showLoading(false);
                alert('Failed to create account: ' + createResult.message);
                return;
            }
            
            userId = createResult.userId;
        } else {
            // Existing user
            userId = checkResult.userId;
            userName = checkResult.name;
        }
        
        // Save user session
        const userSession = {
            userId: userId,
            name: userName,
            phone: phoneNumber,
            loginTime: Date.now(),
            authMethod: 'phone'
        };
        
        localStorage.setItem('userSession', JSON.stringify(userSession));
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Verification error:', error);
        
        if (error.code === 'auth/invalid-verification-code') {
            alert('Invalid verification code. Please try again.');
        } else if (error.code === 'auth/code-expired') {
            alert('Verification code expired. Please request a new one.');
            cancelPhoneAuth();
        } else {
            alert('Verification failed: ' + error.message);
        }
    } finally {
        showLoading(false);
    }
}

// Cancel phone authentication
function cancelPhoneAuth() {
    document.getElementById('phone-form').style.display = 'block';
    document.getElementById('verification-form').style.display = 'none';
    document.getElementById('phone-number').value = '';
    document.getElementById('verification-code').value = '';
    confirmationResult = null;
    
    // Reset reCAPTCHA
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
    }
}

// Make functions globally available
window.signInWithGoogle = signInWithGoogle;
window.sendVerificationCode = sendVerificationCode;
window.verifyCode = verifyCode;
window.cancelPhoneAuth = cancelPhoneAuth;
