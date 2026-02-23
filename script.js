// Global state
let currentState = {
    registrationType: null,
    individualId: null,
    individualName: null,
    familyId: null,
    familyHead: null,
    familyMembers: [],
    isExistingFamily: false
};

// Google Apps Script Web App URL - UPDATE THIS AFTER DEPLOYING
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzilO0f7bGzAoGeVcK2gGoxJMOwyiMuJ-dkN9om42BiXRrTAMrd3_wDWUfHBAfEa0kO3Q/exec';

// Navigation functions
function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function goBack(sectionId) {
    showSection(sectionId);
}

// Step 1: Registration Type Selection
function selectRegistrationType(type) {
    currentState.registrationType = type;
    
    if (type === 'individual') {
        showSection('step-individual-name');
    } else if (type === 'family') {
        showSection('step-family-check');
    }
}

// Individual Registration Flow
function createIndividualId() {
    const name = document.getElementById('individual-name').value.trim();
    
    if (!name) {
        alert('Please enter your name');
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
        alert('Please fill in all required fields');
        return;
    }
    
    const data = {
        type: 'individual',
        id: currentState.individualId,
        name: currentState.individualName,
        phone: phone,
        email: email,
        address: address,
        timestamp: new Date().toISOString()
    };
    
    await submitToGoogleSheets(data);
    
    document.getElementById('success-message').textContent = 
        `Thank you, ${currentState.individualName}! Your registration has been submitted.`;
    document.getElementById('success-id-display').innerHTML = 
        `<strong>Your Registration ID:</strong> <span style="font-family: 'Courier New', monospace; font-weight: bold;">${currentState.individualId}</span><br><small style="color: #666;">Please save this ID for your records.</small>`;
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

async function loadFamilyById() {
    const familyId = document.getElementById('existing-family-id').value.trim().toUpperCase();
    
    if (!familyId) {
        alert('Please enter a Family ID');
        return;
    }
    
    showLoading(true);
    
    try {
        // Fetch existing family data from Google Sheets
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getFamilyMembers&familyId=${familyId}`);
        const result = await response.json();
        
        if (result.success && result.members.length > 0) {
            currentState.familyId = familyId;
            currentState.familyMembers = result.members;
            currentState.familyHead = result.familyHead;
            
            document.getElementById('display-family-id').textContent = familyId;
            displayFamilyMembers();
            showSection('step-family-page');
        } else {
            alert('Family ID not found. Please check the ID or create a new family registration.');
        }
    } catch (error) {
        console.error('Error loading family:', error);
        alert('Unable to load family information. Please try again or contact support.');
    } finally {
        showLoading(false);
    }
}

function createFamilyId() {
    const name = document.getElementById('family-head-name').value.trim();
    
    if (!name) {
        alert('Please enter the head of family name');
        return;
    }
    
    currentState.familyHead = name;
    // Create unique Family ID: LASTNAME-YEAR
    const nameParts = name.split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : nameParts[0].toUpperCase();
    const year = new Date().getFullYear();
    
    currentState.familyId = `${lastName}-${year}`;
    currentState.familyMembers = [];
    
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
        alert('Please fill in all member details');
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
        container.innerHTML = '<p class="empty-state">No members added yet. Click "Add Family Member" to get started.</p>';
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
}

async function completeFamilyRegistration() {
    if (currentState.familyMembers.length === 0) {
        alert('Please add at least one family member before completing registration');
        return;
    }
    
    const data = {
        type: 'family',
        familyId: currentState.familyId,
        familyHead: currentState.familyHead,
        members: currentState.familyMembers,
        isExisting: currentState.isExistingFamily,
        timestamp: new Date().toISOString()
    };
    
    await submitToGoogleSheets(data);
    
    const memberCount = currentState.familyMembers.length;
    document.getElementById('success-message').textContent = 
        `Family registration complete! ${memberCount} member${memberCount > 1 ? 's' : ''} registered successfully.`;
    document.getElementById('success-id-display').innerHTML = 
        `<strong>Family ID:</strong> <span style="font-family: 'Courier New', monospace; font-weight: bold;">${currentState.familyId}</span><br><small style="color: #666;">Share this ID with other family members so they can add themselves to your registration.</small>`;
    showSection('step-success');
}

function goBackFromFamily() {
    if (currentState.isExistingFamily) {
        showSection('step-family-existing');
    } else {
        showSection('step-family-new');
    }
}

// Google Sheets Integration
async function submitToGoogleSheets(data) {
    showLoading(true);
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Note: no-cors mode doesn't allow reading the response
        // We assume success if no error is thrown
        console.log('Data submitted to Google Sheets:', data);
        
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        alert('There was an error submitting your registration. Please try again or contact support.');
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
    currentState = {
        registrationType: null,
        individualId: null,
        individualName: null,
        familyId: null,
        familyHead: null,
        familyMembers: [],
        isExistingFamily: false
    };
    
    // Clear all input fields
    document.querySelectorAll('input, textarea').forEach(field => {
        field.value = '';
    });
    
    showSection('step-registration-type');
}
