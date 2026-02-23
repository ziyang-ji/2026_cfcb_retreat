const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbOwUXBAgDA4qbwcNN6LON7AxZ-uyck1LEmSoVBCG_tWPU70_qKEjPPcTBnPt9W2eX7g/exec';

let currentUser = null;

// Sign out functions - assign to window immediately so they're globally available
window.signOut = function() {
    document.getElementById('signout-modal').classList.add('active');
};

window.closeSignOutModal = function() {
    document.getElementById('signout-modal').classList.remove('active');
};

window.confirmSignOut = function() {
    localStorage.removeItem('userSession');
    window.location.href = 'auth.html';
};

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
        console.log('Loading registrations for user:', currentUser);
        console.log('User ID:', currentUser.userId);
        console.log('User Email:', currentUser.email);
        
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUserRegistrations&userId=${currentUser.userId}&userEmail=${encodeURIComponent(currentUser.email)}`);
        const result = await response.json();
        
        console.log('Registration response:', result);
        
        if (result.success) {
            console.log('Found registrations:', result.data);
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
    
    // Store families in session storage for delete modal
    sessionStorage.setItem('currentFamilies', JSON.stringify(families));
    
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
                <button class="btn btn-primary" onclick="location.href='register.html?type=individual'">Create Individual Registration</button>
            </div>
        `;
    } else {
        individualContainer.innerHTML = individuals.map(person => {
            const isOwner = person.registeredBy === currentUser.userId;
            return `
            <div class="registration-card">
                <div class="card-header">
                    <div class="card-title">
                        <span class="card-icon">👤</span>
                        <span class="card-name">${person.name}</span>
                    </div>
                    <div class="card-actions">
                        <span class="card-badge">ID: ${person.id}</span>
                        ${isOwner ? `
                            <button class="btn-icon" onclick="editIndividual('${person.id}')" title="Edit">✏️</button>
                            <button class="btn-icon" onclick="deleteIndividual('${person.id}', '${person.name}')" title="Delete">🗑️</button>
                        ` : ''}
                    </div>
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
        `;
        }).join('') + `
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="location.href='register.html?type=individual'">+ Create Another Individual Registration</button>
            </div>
        `;
    }
    
    // Display family registrations
    const familyContainer = document.getElementById('family-registrations');
    
    if (families.length === 0) {
        familyContainer.innerHTML = `
            <div class="empty-state">
                <p>You're not part of any family registration yet.</p>
                <button class="btn btn-primary" onclick="location.href='register.html?type=family'">Create Family Registration</button>
            </div>
        `;
    } else {
        familyContainer.innerHTML = families.map(family => {
            const isOwner = family.ownerId === currentUser.userId;
            // Count how many members the current user registered in this family
            const userMemberCount = family.members.filter(m => m.registeredBy === currentUser.userId).length;
            
            return `
            <div class="registration-card family-card">
                <div class="card-header">
                    <div class="card-title">
                        <span class="card-icon">👨‍👩‍👧‍👦</span>
                        <span class="card-name">${family.familyHead}'s Family</span>
                    </div>
                    <div class="card-actions">
                        <span class="card-badge">Family ID: ${family.familyId}</span>
                        ${isOwner ? `
                            <button class="btn-icon" onclick="deleteFamily('${family.familyId}', '${family.familyHead}')" title="Delete Family">🗑️</button>
                        ` : userMemberCount > 0 ? `
                            <button class="btn-icon" onclick="quitFamily('${family.familyId}', '${family.familyHead}', ${userMemberCount})" title="Quit Family" style="background: #ff9800;">🚪</button>
                        ` : ''}
                    </div>
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
                    ${isOwner ? `
                        <div class="detail-row">
                            <span class="detail-label">👑 Status:</span>
                            <span class="detail-value" style="color: #667eea; font-weight: 600;">You are the owner</span>
                        </div>
                    ` : ''}
                </div>
                <div class="family-members">
                    <h4>Family Members:</h4>
                    ${family.members.length > 0 ? family.members.map(member => {
                        const isOwner = member.registeredBy === currentUser.userId;
                        return `
                        <div class="family-member-item">
                            <div class="member-info">
                                <strong>${member.name}</strong>
                                <span class="member-id">ID: ${member.id}</span>
                                ${isOwner ? `
                                    <button class="btn-icon-small" onclick="editFamilyMember('${member.id}', '${family.familyId}')" title="Edit">✏️</button>
                                    <button class="btn-icon-small" onclick="deleteFamilyMember('${member.id}', '${member.name}', '${family.familyId}')" title="Delete">🗑️</button>
                                ` : ''}
                            </div>
                            <div class="member-contact">
                                ${member.phone} • ${member.email}
                            </div>
                        </div>
                    `;
                    }).join('') : '<p style="color: #666; font-style: italic; padding: 1rem;">No members yet. Click "Add More Members" to add someone.</p>'}
                </div>
                <button class="btn btn-secondary" onclick="addToFamily('${family.familyId}')">+ Add More Members</button>
            </div>
        `;
        }).join('') + `
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="location.href='register.html?type=family'">+ Create Another Family Registration</button>
            </div>
        `;
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
            <button class="btn btn-primary" onclick="location.href='register.html?type=individual'">Create Individual Registration</button>
        </div>
    `;
    
    document.getElementById('family-registrations').innerHTML = `
        <div class="empty-state">
            <p>You're not part of any family registration yet.</p>
            <button class="btn btn-primary" onclick="location.href='register.html?type=family'">Create Family Registration</button>
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

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Edit individual registration
async function editIndividual(id) {
    showLoading(true);
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getRegistrationById&id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('edit-id').value = result.data.id;
            document.getElementById('edit-family-id').value = '';
            document.getElementById('edit-name').value = result.data.name;
            document.getElementById('edit-phone').value = result.data.phone;
            document.getElementById('edit-email').value = result.data.email;
            document.getElementById('edit-address').value = result.data.address;
            document.getElementById('edit-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading registration:', error);
        alert('Failed to load registration details');
    } finally {
        showLoading(false);
    }
}

// Edit family member
async function editFamilyMember(id, familyId) {
    showLoading(true);
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getRegistrationById&id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('edit-id').value = result.data.id;
            document.getElementById('edit-family-id').value = familyId;
            document.getElementById('edit-name').value = result.data.name;
            document.getElementById('edit-phone').value = result.data.phone;
            document.getElementById('edit-email').value = result.data.email;
            document.getElementById('edit-address').value = result.data.address;
            document.getElementById('edit-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading registration:', error);
        alert('Failed to load registration details');
    } finally {
        showLoading(false);
    }
}

// Save edited registration
async function saveEdit(event) {
    event.preventDefault();
    showLoading(true);
    
    const data = {
        action: 'updateRegistration',
        id: document.getElementById('edit-id').value,
        name: document.getElementById('edit-name').value,
        phone: document.getElementById('edit-phone').value,
        email: document.getElementById('edit-email').value,
        address: document.getElementById('edit-address').value,
        userId: currentUser.userId
    };
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeEditModal();
            await loadUserRegistrations();
            showSuccessModal('Registration updated successfully!');
        } else {
            alert('Failed to update: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating registration:', error);
        alert('Failed to update registration');
    } finally {
        showLoading(false);
    }
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

// Delete individual registration
function deleteIndividual(id, name) {
    document.getElementById('delete-id').value = id;
    document.getElementById('delete-family-id').value = '';
    document.getElementById('delete-message').textContent = `Are you sure you want to delete the registration for ${name}?`;
    document.getElementById('delete-modal').classList.add('active');
}

// Delete family member
function deleteFamilyMember(id, name, familyId) {
    document.getElementById('delete-id').value = id;
    document.getElementById('delete-family-id').value = familyId;
    document.getElementById('delete-message').textContent = `Are you sure you want to remove ${name} from the family registration?`;
    document.getElementById('delete-modal').classList.add('active');
}

// Confirm delete
async function confirmDelete() {
    showLoading(true);
    
    const data = {
        action: 'deleteRegistration',
        id: document.getElementById('delete-id').value,
        userId: currentUser.userId
    };
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeDeleteModal();
            await loadUserRegistrations();
            showSuccessModal('Registration deleted successfully');
        } else {
            alert('Failed to delete: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting registration:', error);
        alert('Failed to delete registration');
    } finally {
        showLoading(false);
    }
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
}

// Delete entire family
function deleteFamily(familyId, familyHead) {
    // Find the family to get member count
    const familyContainer = document.getElementById('family-registrations');
    const families = JSON.parse(sessionStorage.getItem('currentFamilies') || '[]');
    const family = families.find(f => f.familyId === familyId);
    
    document.getElementById('delete-family-id-input').value = familyId;
    document.getElementById('delete-family-message').textContent = 
        `Are you sure you want to delete ${familyHead}'s family?`;
    document.getElementById('delete-family-count').textContent = 
        family ? family.memberCount : '0';
    document.getElementById('delete-family-modal').classList.add('active');
}

async function confirmDeleteFamily() {
    showLoading(true);
    
    const familyId = document.getElementById('delete-family-id-input').value;
    
    const data = {
        action: 'deleteFamily',
        familyId: familyId,
        userId: currentUser.userId
    };
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeDeleteFamilyModal();
            await loadUserRegistrations();
            showSuccessModal(`Family deleted successfully. ${result.deletedCount} member(s) removed.`);
        } else {
            alert('Failed to delete family: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting family:', error);
        alert('Failed to delete family');
    } finally {
        showLoading(false);
    }
}

function closeDeleteFamilyModal() {
    document.getElementById('delete-family-modal').classList.remove('active');
}

// Quit family (for non-owners)
function quitFamily(familyId, familyHead, memberCount) {
    document.getElementById('quit-family-id-input').value = familyId;
    document.getElementById('quit-family-message').textContent = 
        `Are you sure you want to quit ${familyHead}'s family?`;
    document.getElementById('quit-family-count').textContent = memberCount;
    document.getElementById('quit-family-modal').classList.add('active');
}

async function confirmQuitFamily() {
    showLoading(true);
    
    const familyId = document.getElementById('quit-family-id-input').value;
    
    const data = {
        action: 'quitFamily',
        familyId: familyId,
        userId: currentUser.userId
    };
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeQuitFamilyModal();
            await loadUserRegistrations();
            showSuccessModal(`You have left the family. ${result.deletedCount} registration(s) removed.`);
        } else {
            alert('Failed to quit family: ' + result.message);
        }
    } catch (error) {
        console.error('Error quitting family:', error);
        alert('Failed to quit family');
    } finally {
        showLoading(false);
    }
}

function closeQuitFamilyModal() {
    document.getElementById('quit-family-modal').classList.remove('active');
}

// Success modal
function showSuccessModal(message) {
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-modal').classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('active');
}

// Make other functions globally available (signOut functions already assigned to window at top)
window.addToFamily = addToFamily;
window.editIndividual = editIndividual;
window.editFamilyMember = editFamilyMember;
window.saveEdit = saveEdit;
window.closeEditModal = closeEditModal;
window.deleteIndividual = deleteIndividual;
window.deleteFamilyMember = deleteFamilyMember;
window.confirmDelete = confirmDelete;
window.closeDeleteModal = closeDeleteModal;
window.deleteFamily = deleteFamily;
window.confirmDeleteFamily = confirmDeleteFamily;
window.closeDeleteFamilyModal = closeDeleteFamilyModal;
window.quitFamily = quitFamily;
window.confirmQuitFamily = confirmQuitFamily;
window.closeQuitFamilyModal = closeQuitFamilyModal;
window.closeSuccessModal = closeSuccessModal;
