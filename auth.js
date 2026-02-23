// Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5KpvHDqP3aV9gPbQVnARpCfbQtoWE4SQ61jQlEspDOhpOuyJeQ3ljGbi8wjMGP3JoCA/exec';


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

// Make functions globally available
window.signInWithGoogle = signInWithGoogle;
