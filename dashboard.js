const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzilO0f7bGzAoGeVcK2gGoxJMOwyiMuJ-dkN9om42BiXRrTAMrd3_wDWUfHBAfEa0kO3Q/exec';

let currentUser = null;

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    const userSession = localStorage.getItem('userSession');
    
    if (!userSession) {
        window.location.href = 'auth.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userSession);
        
        // Check if session is expired
        const sessionAge = Date.now() - currentUser.loginTime;
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (sessionAge >= thirtyDays) {
            localStorage.removeItem('userSession');
            window.location.href = 'auth.html';
            return;
        }
        
        // Display user name
        document.getElementById('user-name').textContent = currentUser.name;
        
        // Load user's registrations
        await loadUserRegistrations();
        
    } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('userSession');
        window.location.href = 'auth.html';
    }
});

// Load user registrations from Google Sheets
async function loadUserRegistrations() {
    showLoading(true);
    
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUserRegistrations&userId=${currentUser.userId}`);
        const result = await response.json();
        
        if (result.success) {
            displayRegistrations(result.data);
        } else {
            console.error('Failed to load registrations:', result.message);
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading registrations:', error);
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

// Display registrations on dashboard
function displayRegistrations(data) {
    const { individuals, families, totalPeople } = data;
    
    // Update summary cards
    document.getElementById('individual-count').textContent = individuals.length;
    document.getElementById('family-count').textContent = families.length;
    document.getElementById('total-people').textContent = totalPeople;
    
    // Display individual registrations
    const individualContainer = document.getElementById('individual-registrations');
    
    if (individuals.length === 0) {
        individualContainer.innerHTML = `
            <div class="empty-state">
                <p>You haven't registered individually yet.</p>
                <button class="btn btn-primary" onclick="location.href='register.html'">Create Individual Registration</button>
            </div>
        `;
    } else {
        individualContainer.innerHTML = individuals.map(person => `
            <div class="registration-card">
                <div class="card-header">
                    <div class="card-title">
                        <span class="card-icon">👤</span>
                        <span class="card-name">${person.name}</span>
                    </div>
                    <span class="card-badge">ID: ${person.id}</span>
                </div>
                <div class="card-details">
                    <div class="detail-row">
                        <span class="detail-label">📞 Phone:</span>
                        <span class="detail-value">${person.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📧 Email:</span>
                        <span class="detail-value">${person.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🏠 Address:</span>
                        <span class="detail-value">${person.address}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📅 Registered:</span>
                        <span class="detail-value">${formatDate(person.timestamp)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Display family registrations
    const familyContainer = document.getElementById('family-registrations');
    
    if (families.length === 0) {
        familyContainer.innerHTML = `
            <div class="empty-state">
                <p>You're not part of any family registration yet.</p>
                <button class="btn btn-primary" onclick="location.href='register.html'">Create Family Registration</button>
            </div>
        `;
    } else {
        familyContainer.innerHTML = families.map(family => `
            <div class="registration-card family-card">
                <div class="card-header">
                    <div class="card-title">
                        <span class="card-icon">👨‍👩‍👧‍👦</span>
                        <span class="card-name">${family.familyHead}'s Family</span>
                    </div>
                    <span class="card-badge">Family ID: ${family.familyId}</span>
                </div>
                <div class="card-details">
                    <div class="detail-row">
                        <span class="detail-label">👥 Members:</span>
                        <span class="detail-value">${family.memberCount} people</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📅 Created:</span>
                        <span class="detail-value">${formatDate(family.timestamp)}</span>
                    </div>
                </div>
                <div class="family-members">
                    <h4>Family Members:</h4>
                    ${family.members.map(member => `
                        <div class="family-member-item">
                            <div class="member-info">
                                <strong>${member.name}</strong>
                                <span class="member-id">ID: ${member.id}</span>
                            </div>
                            <div class="member-contact">
                                ${member.phone} • ${member.email}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-secondary" onclick="addToFamily('${family.familyId}')">+ Add More Members</button>
            </div>
        `).join('');
    }
}

// Show empty state
function showEmptyState() {
    document.getElementById('individual-count').textContent = '0';
    document.getElementById('family-count').textContent = '0';
    document.getElementById('total-people').textContent = '0';
    
    document.getElementById('individual-registrations').innerHTML = `
        <div class="empty-state">
            <p>You haven't registered individually yet.</p>
            <button class="btn btn-primary" onclick="location.href='register.html'">Create Individual Registration</button>
        </div>
    `;
    
    document.getElementById('family-registrations').innerHTML = `
        <div class="empty-state">
            <p>You're not part of any family registration yet.</p>
            <button class="btn btn-primary" onclick="location.href='register.html'">Create Family Registration</button>
        </div>
    `;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Add more members to family
function addToFamily(familyId) {
    // Store family ID in session storage and redirect to registration page
    sessionStorage.setItem('addToFamilyId', familyId);
    window.location.href = 'register.html?action=addToFamily&familyId=' + familyId;
}

// Sign out
function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('userSession');
        window.location.href = 'auth.html';
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

// Make functions globally available
window.addToFamily = addToFamily;
window.signOut = signOut;
