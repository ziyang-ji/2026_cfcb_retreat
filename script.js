// Global state
let currentState = {
    registrationType: null,
    individualId: null,
    individualName: null,
    familyId: null,
    familyHead: null,
    familyMembers: [],
    isExistingFamily: false,
    existingMemberIds: [] // Track members already in the system
};

let currentUser = null;

// GOOGLE_SCRIPT_URL is now defined in config.js

// Check authentication and handle URL parameters immediately
(function initializePage() {
    const userSession = localStorage.getItem('userSession');
    
    if (!userSession) {
        alert('Please sign in to register for the retreat.');
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
            alert('Your session has expired. Please sign in again.');
            window.location.href = 'auth.html';
            return;
        }
        
        // Check URL parameters for direct navigation
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        const type = urlParams.get('type');
        const familyId = urlParams.get('familyId');
        
        console.log('URL parameters:', { action, type, familyId });
        
        // Handle direct registration type from dashboard
        if (type === 'individual') {
            console.log('Direct navigation to individual registration');
            // Show individual name entry immediately
            document.addEventListener('DOMContentLoaded', () => {
                showSection('step-individual-name');
            });
        } else if (type === 'family') {
            console.log('Direct navigation to family registration');
            // Show family check page to let user choose join or create
            document.addEventListener('DOMContentLoaded', () => {
                showSection('step-family-check');
            });
        } else if (action === 'addToFamily' && familyId) {
            console.log('Adding to existing family:', familyId);
            // Pre-select family registration and load family directly (skip confirmation)
            currentState.isExistingFamily = true;
            currentState.familyId = familyId;
            currentState.fromDashboard = true; // Flag to track we came from dashboard
            document.addEventListener('DOMContentLoaded', () => {
                loadFamilyDirectly(familyId);
            });
        } else {
            // No URL parameters, redirect to dashboard
            console.log('No registration type specified, redirecting to dashboard');
            window.location.href = 'dashboard.html';
        }
        
    } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('userSession');
        window.location.href = 'auth.html';
    }
})();

// Sign out function
function signOut() {
    // Show custom modal instead of browser confirm
    document.getElementById('signout-modal').classList.add('active');
}

function closeSignOutModal() {
    document.getElementById('signout-modal').classList.remove('active');
}

function confirmSignOut() {
    localStorage.removeItem('userSession');
    window.location.href = 'auth.html';
}


// Navigation functions
function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}



// Individual Registration Flow
function createIndividualId() {
    const name = document.getElementById('individual-name').value.trim();
    
    if (!name) {
        showErrorModal('Please enter your name');
        return;
    }
    
    currentState.individualName = name;
    // Create unique ID: FIRSTNAME-LASTNAME-YEAR
    const nameParts = name.split(' ');
    const firstName = nameParts[0].toUpperCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : '';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    currentState.individualId = `${firstName}${lastName ? '-' + lastName : ''}-${year}-${random}`;
    
    document.getElementById('display-individual-id').textContent = currentState.individualId;
    showSection('step-individual-form');
}

async function submitIndividual() {
    const phone = document.getElementById('individual-phone').value.trim();
    const email = document.getElementById('individual-email').value.trim();
    const address = document.getElementById('individual-address').value.trim();
    
    if (!phone || !email || !address) {
        showErrorModal('Please fill in all required fields');
        return;
    }
    
    const data = {
        type: 'individual',
        id: currentState.individualId,
        name: currentState.individualName,
        phone: phone,
        email: email,
        address: address,
        userId: currentUser.userId,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString()
    };
    
    await submitToGoogleSheets(data);
    
    // Display success message with translations
    const thankYou = window.t ? window.t('register.thankYou') : 'Thank you';
    const regSubmitted = window.t ? window.t('register.regSubmitted') : 'Your registration has been submitted.';
    const yourRegId = window.t ? window.t('register.yourRegId') : 'Your Registration ID:';
    const saveId = window.t ? window.t('register.saveId') : 'Please save this ID for your records.';
    
    document.getElementById('success-message').textContent = 
        `${thankYou}, ${currentState.individualName}! ${regSubmitted}`;
    document.getElementById('success-id-display').innerHTML = 
        `<strong>${yourRegId}</strong> <span style="font-family: 'Courier New', monospace; font-weight: bold;">${currentState.individualId}</span><br><small style="color: #666;">${saveId}</small>`;
    showSection('step-success');
}

// Family Registration Flow
function selectFamilyOption(option) {
    if (option === 'existing') {
        currentState.isExistingFamily = true;
        showSection('step-family-existing');
    } else if (option === 'new') {
        currentState.isExistingFamily = false;
        showSection('step-family-new');
    }
}

// Load family directly without confirmation (for "Add More Members" from dashboard)
async function loadFamilyDirectly(familyId) {
    showLoading(true);
    
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getFamilyMembers&familyId=${familyId}`);
        const result = await response.json();
        
        if (result.success) {
            currentState.familyId = result.familyId;
            currentState.familyHead = result.familyHead;
            currentState.familyMembers = result.members || [];
            currentState.existingMemberIds = result.members ? result.members.map(m => m.id) : [];
            
            document.getElementById('display-family-id').textContent = result.familyId;
            displayFamilyMembers();
            showSection('step-family-page');
        } else {
            showErrorModal('Unable to load family. Please try again from the dashboard.');
        }
    } catch (error) {
        console.error('Error loading family:', error);
        showErrorModal('Unable to load family information. Please try again or contact support.');
    } finally {
        showLoading(false);
    }
}

// Search for family by ID or email (with confirmation step)
async function searchFamily() {
    const familyId = document.getElementById('existing-family-id').value.trim().toUpperCase();
    const memberEmail = document.getElementById('member-email-search').value.trim().toLowerCase();
    
    if (!familyId && !memberEmail) {
        showErrorModal('Please enter either a Family ID or a family member\'s email');
        return;
    }
    
    showLoading(true);
    
    try {
        if (familyId) {
            // Search by Family ID - single result
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getFamilyMembers&familyId=${familyId}`);
            const result = await response.json();
            
            console.log('Family ID search result:', result);
            
            if (result.success) {
                // Single family found, go to confirmation
                currentState.pendingFamilyId = result.familyId;
                currentState.pendingFamilyHead = result.familyHead;
                currentState.pendingFamilyMembers = result.members || [];
                currentState.fromSelection = false;
                
                displayFamilyPreview(result);
                showSection('step-family-confirm');
            } else {
                showErrorModal('Family ID not found. Please check the ID or try searching by email.');
            }
        } else {
            // Search by member email - may return multiple families
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=searchFamilyByEmail&email=${encodeURIComponent(memberEmail)}`);
            const result = await response.json();
            
            console.log('Email search result:', result);
            
            if (result.success && result.families) {
                if (result.families.length > 1) {
                    // Multiple families found, show selection
                    currentState.searchResults = result.families;
                    displayFamilyOptions(result.families);
                    showSection('step-family-select');
                } else if (result.families.length === 1) {
                    // Single family found, go to confirmation
                    const family = result.families[0];
                    currentState.pendingFamilyId = family.familyId;
                    currentState.pendingFamilyHead = family.familyHead;
                    currentState.pendingFamilyMembers = family.members || [];
                    currentState.fromSelection = false;
                    
                    displayFamilyPreview(family);
                    showSection('step-family-confirm');
                } else {
                    showErrorModal('No family found with a member using that email address.');
                }
            } else {
                showErrorModal('No family found with a member using that email address. Please check the email or try using the Family ID.');
            }
        }
    } catch (error) {
        console.error('Error searching for family:', error);
        showErrorModal('Unable to search for family. Please try again or contact support.');
    } finally {
        showLoading(false);
    }
}

// Display family options when multiple found
function displayFamilyOptions(families) {
    const container = document.getElementById('family-options');
    
    container.innerHTML = families.map((family, index) => {
        const members = family.members || [];
        return `
            <div class="member-card" style="margin-bottom: 1rem; padding: 1.5rem; background: #f8f9ff; border: 2px solid #667eea; border-radius: 8px; cursor: pointer;" onclick="selectFamilyFromOptions(${index})">
                <div style="text-align: center; margin-bottom: 0.75rem;">
                    <h3 style="color: #667eea; margin: 0 0 0.3rem 0;">👨‍👩‍👧‍👦 ${family.familyHead}'s Family</h3>
                    <div style="font-family: 'Courier New', monospace; font-weight: bold; color: #333; font-size: 0.95rem;">
                        Family ID: ${family.familyId}
                    </div>
                </div>
                <div style="font-size: 0.9rem; color: #666;">
                    <strong>${members.length} member${members.length !== 1 ? 's' : ''}:</strong>
                    ${members.length > 0 ? members.slice(0, 3).map(m => m.name).join(', ') : 'No members yet'}
                    ${members.length > 3 ? ` and ${members.length - 3} more...` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    if (window.applyLanguage) window.applyLanguage();
}

// Select family from multiple options
function selectFamilyFromOptions(index) {
    const family = currentState.searchResults[index];
    currentState.pendingFamilyId = family.familyId;
    currentState.pendingFamilyHead = family.familyHead;
    currentState.pendingFamilyMembers = family.members || [];
    currentState.fromSelection = true;
    
    displayFamilyPreview(family);
    showSection('step-family-confirm');
}

// Display family preview for confirmation
function displayFamilyPreview(familyData) {
    const preview = document.getElementById('family-preview');
    const members = familyData.members || [];
    
    preview.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <h3 style="color: #667eea; margin: 0 0 0.5rem 0;">👨‍👩‍👧‍👦 ${familyData.familyHead}'s Family</h3>
            <div style="font-family: 'Courier New', monospace; font-weight: bold; color: #333; font-size: 1.1rem;">
                Family ID: ${familyData.familyId}
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <strong style="color: #333;">Current Members (${members.length}):</strong>
            ${members.length > 0 ? `
                <ul style="margin: 0.5rem 0 0 1.5rem; line-height: 1.8;">
                    ${members.map(m => `<li>${m.name} (${m.email})</li>`).join('')}
                </ul>
            ` : `
                <p style="color: #666; font-style: italic; margin: 0.5rem 0;">No members yet</p>
            `}
        </div>
    `;
    
    if (window.applyLanguage) window.applyLanguage();
}

// Go back from confirmation page
function goBackFromConfirm() {
    if (currentState.fromSelection) {
        // Came from selection page, go back to selection
        showSection('step-family-select');
    } else {
        // Came directly from search, go back to search
        showSection('step-family-existing');
    }
}

// Confirm and join the family
function confirmAndJoinFamily() {
    // Move pending family info to current state
    currentState.familyId = currentState.pendingFamilyId;
    currentState.familyHead = currentState.pendingFamilyHead;
    currentState.familyMembers = currentState.pendingFamilyMembers;
    currentState.existingMemberIds = currentState.pendingFamilyMembers.map(m => m.id);
    
    // Clear pending data
    currentState.pendingFamilyId = null;
    currentState.pendingFamilyHead = null;
    currentState.pendingFamilyMembers = null;
    
    // Display in family page
    document.getElementById('display-family-id').textContent = currentState.familyId;
    displayFamilyMembers();
    showSection('step-family-page');
}

// Legacy function - now redirects to searchFamily
async function loadFamilyById() {
    await searchFamily();
}

function createFamilyId() {
    const name = document.getElementById('family-head-name').value.trim();
    
    if (!name) {
        showErrorModal('Please enter the head of family name');
        return;
    }
    
    currentState.familyHead = name;
    currentState.isExistingFamily = false;
    
    // Create unique Family ID: LASTNAME-TIMESTAMP
    // Using timestamp ensures uniqueness even if same name registers multiple times
    const nameParts = name.split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : nameParts[0].toUpperCase();
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    
    currentState.familyId = `${lastName}-${timestamp}`;
    currentState.familyMembers = [];
    currentState.existingMemberIds = []; // New family, no existing members
    
    console.log('Created Family ID:', currentState.familyId);
    
    document.getElementById('display-family-id').textContent = currentState.familyId;
    showSection('step-family-page');
}

function showAddMemberForm() {
    document.getElementById('add-member-section').style.display = 'block';
    document.getElementById('member-name').focus();
}

function cancelAddMember() {
    document.getElementById('add-member-section').style.display = 'none';
    clearMemberForm();
}

function clearMemberForm() {
    document.getElementById('member-name').value = '';
    document.getElementById('member-phone').value = '';
    document.getElementById('member-email').value = '';
    document.getElementById('member-address').value = '';
}

function addFamilyMember() {
    const name = document.getElementById('member-name').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    const email = document.getElementById('member-email').value.trim();
    const address = document.getElementById('member-address').value.trim();
    
    if (!name || !phone || !email || !address) {
        showErrorModal('Please fill in all member details');
        return;
    }
    
    // Generate individual ID for family member
    const nameParts = name.split(' ');
    const firstName = nameParts[0].toUpperCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : '';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const memberId = `${firstName}${lastName ? '-' + lastName : ''}-${random}`;
    
    const member = {
        id: memberId,
        name: name,
        phone: phone,
        email: email,
        address: address
    };
    
    currentState.familyMembers.push(member);
    displayFamilyMembers();
    cancelAddMember();
}

function displayFamilyMembers() {
    const container = document.getElementById('members-container');
    
    if (currentState.familyMembers.length === 0) {
        container.innerHTML = '<p class="empty-state" data-i18n="register.noMembers">No members added yet. Click "Add Family Member" to get started.</p>';
        if (window.applyLanguage) window.applyLanguage();
        return;
    }
    
    container.innerHTML = currentState.familyMembers.map(member => `
        <div class="member-card">
            <div class="member-header">
                <span class="member-name">${member.name}</span>
                <span class="member-id">ID: ${member.id}</span>
            </div>
            <div class="member-details">
                <div>📞 ${member.phone}</div>
                <div>📧 ${member.email}</div>
                <div>🏠 ${member.address}</div>
            </div>
        </div>
    `).join('');
    
    if (window.applyLanguage) window.applyLanguage();
}

async function completeFamilyRegistration() {
    if (currentState.familyMembers.length === 0) {
        showErrorModal('Please add at least one family member before completing registration');
        return;
    }
    
    // Filter out members who were already submitted (only submit new ones)
    const newMembers = currentState.familyMembers.filter(member => 
        !currentState.existingMemberIds.includes(member.id)
    );
    
    if (newMembers.length === 0 && currentState.isExistingFamily) {
        showErrorModal('No new members to submit. All members have already been registered.');
        return;
    }
    
    const data = {
        type: 'family',
        familyId: currentState.familyId,
        familyHead: currentState.familyHead,
        members: newMembers, // Only submit NEW members
        isExisting: currentState.isExistingFamily,
        userId: currentUser.userId,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString()
    };
    
    await submitToGoogleSheets(data);
    
    const memberCount = newMembers.length;
    const totalCount = currentState.familyMembers.length;
    
    if (currentState.isExistingFamily) {
        document.getElementById('success-message').textContent = 
            `${memberCount} new member${memberCount > 1 ? 's' : ''} added to your family! Total family members: ${totalCount}.`;
    } else {
        // Display success message with translations
        const familyRegComplete = window.t ? window.t('register.familyRegComplete') : 'Family registration complete!';
        const memberText = memberCount > 1 ? (window.t ? window.t('register.members') : 'members') : (window.t ? window.t('register.member') : 'member');
        const regSuccess = window.t ? window.t('register.registeredSuccessfully') : 'registered successfully.';
        
        document.getElementById('success-message').textContent = 
            `${familyRegComplete} ${memberCount} ${memberText} ${regSuccess}`;
    }
    
    const yourFamilyId = window.t ? window.t('register.yourFamilyId') : 'Family ID:';
    const saveId = window.t ? window.t('register.saveId') : 'Share this ID with other family members so they can add themselves to your registration.';
    
    document.getElementById('success-id-display').innerHTML = 
        `<strong>${yourFamilyId}</strong> <span style="font-family: 'Courier New', monospace; font-weight: bold;">${currentState.familyId}</span><br><small style="color: #666;">${saveId}</small>`;
    showSection('step-success');
}

function goBackFromFamily() {
    // If came from dashboard's "+Add More Members", go back to dashboard
    if (currentState.fromDashboard) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Otherwise, go back to the previous step in the registration flow
    if (currentState.isExistingFamily) {
        showSection('step-family-existing');
    } else {
        showSection('step-family-new');
    }
}

function goBackFromFamilyNew() {
    // Always go back to family check page
    showSection('step-family-check');
}

function goBackFromIndividual() {
    // Always go back to dashboard
    window.location.href = 'dashboard.html';
}

function goBackFromFamilyCheck() {
    // Always go back to dashboard
    window.location.href = 'dashboard.html';
}

// Google Sheets Integration
async function submitToGoogleSheets(data) {
    showLoading(true);
    
    console.log('Submitting to Google Sheets:', data);
    console.log('Using URL:', GOOGLE_SCRIPT_URL);
    
    try {
        // Use redirect follow mode for Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.text();
        console.log('Response from Google Sheets:', result);
        
        // Try to parse as JSON
        try {
            const jsonResult = JSON.parse(result);
            console.log('Parsed result:', jsonResult);
            if (!jsonResult.success) {
                throw new Error(jsonResult.message || 'Failed to save data');
            }
        } catch (parseError) {
            console.log('Response is not JSON, but request completed');
        }
        
        console.log('✅ Data successfully submitted!');
        
    } catch (error) {
        console.error('❌ Error submitting to Google Sheets:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        showErrorModal(`There was an error submitting your registration: ${error.message}\n\nPlease check the browser console (F12) for details, or contact support.`);
        throw error;
    } finally {
        showLoading(false);
    }
}

// Utility functions
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function resetForm() {
    // Redirect back to dashboard instead of resetting
    window.location.href = 'dashboard.html';
}

// Error modal functions
function showErrorModal(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').classList.add('active');
}

function closeErrorModal() {
    document.getElementById('error-modal').classList.remove('active');
}
