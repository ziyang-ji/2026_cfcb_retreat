// Firebase Configuration - You'll need to set this up
const FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// For now, we'll use a simple localStorage-based auth system
// You can upgrade to Firebase later

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzilO0f7bGzAoGeVcK2gGoxJMOwyiMuJ-dkN9om42BiXRrTAMrd3_wDWUfHBAfEa0kO3Q/exec';

// Switch between auth tabs
function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'signin') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('signin-form').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('signup-form').classList.add('active');
    }
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Sign in with Google (Placeholder - requires Firebase setup)
async function signInWithGoogle() {
    alert('Google Sign-In Setup Required:\n\n1. Create a Firebase project\n2. Enable Google Authentication\n3. Add your Firebase config to auth.js\n\nFor now, please use email/password to create an account.');
    
    // TODO: Implement Firebase Google Sign-In
    // const provider = new firebase.auth.GoogleAuthProvider();
    // const result = await firebase.auth().signInWithPopup(provider);
}

// Sign up with email
async function signUpWithEmail(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    showLoading(true);
    
    try {
        // Check if user already exists
        const checkResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkUser&email=${encodeURIComponent(email)}`);
        const checkResult = await checkResponse.json();
        
        if (checkResult.exists) {
            alert('An account with this email already exists. Please sign in instead.');
            showAuthTab('signin');
            showLoading(false);
            return;
        }
        
        // Create user account
        const userData = {
            action: 'createUser',
            name: name,
            email: email,
            password: btoa(password), // Simple base64 encoding (NOT secure for production!)
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Save user session
            const userSession = {
                userId: result.userId,
                name: name,
                email: email,
                loginTime: Date.now()
            };
            
            localStorage.setItem('userSession', JSON.stringify(userSession));
            
            alert('Account created successfully! Welcome to Church Retreat Sign-Up.');
            window.location.href = 'dashboard.html';
        } else {
            alert('Failed to create account: ' + result.message);
        }
        
    } catch (error) {
        console.error('Sign up error:', error);
        alert('An error occurred during sign up. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Sign in with email
async function signInWithEmail(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    
    showLoading(true);
    
    try {
        // Authenticate user
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=authenticateUser&email=${encodeURIComponent(email)}&password=${encodeURIComponent(btoa(password))}`);
        const result = await response.json();
        
        if (result.success) {
            // Save user session
            const userSession = {
                userId: result.userId,
                name: result.name,
                email: email,
                loginTime: Date.now()
            };
            
            localStorage.setItem('userSession', JSON.stringify(userSession));
            
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid email or password. Please try again.');
        }
        
    } catch (error) {
        console.error('Sign in error:', error);
        alert('An error occurred during sign in. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Make functions globally available
window.showAuthTab = showAuthTab;
window.signInWithGoogle = signInWithGoogle;
window.signUpWithEmail = signUpWithEmail;
window.signInWithEmail = signInWithEmail;
