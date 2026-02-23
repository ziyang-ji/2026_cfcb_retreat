/**
 * Google Apps Script Backend for Church Retreat Sign-Up
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet with two tabs:
 *    - "Individual_Registrations"
 *    - "Family_Registrations"
 * 
 * 2. In Google Sheets, go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone"
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Paste that URL into script.js where it says GOOGLE_SCRIPT_URL
 */

// Get the active spreadsheet
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

// Initialize sheets with headers if they don't exist
function initializeSheets() {
  const ss = getSpreadsheet();
  
  // User Accounts Sheet
  let userSheet = ss.getSheetByName('User_Accounts');
  if (!userSheet) {
    userSheet = ss.insertSheet('User_Accounts');
    userSheet.appendRow([
      'Timestamp',
      'User ID',
      'Name',
      'Email',
      'Password',
      'Status'
    ]);
    userSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4caf50').setFontColor('white');
  }
  
  // Individual Registrations Sheet
  let individualSheet = ss.getSheetByName('Individual_Registrations');
  if (!individualSheet) {
    individualSheet = ss.insertSheet('Individual_Registrations');
    individualSheet.appendRow([
      'Timestamp',
      'Individual ID',
      'Name',
      'Phone',
      'Email',
      'Address',
      'Family ID',
      'User ID',
      'User Email'
    ]);
    individualSheet.getRange('A1:I1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
  }
  
  // Family Registrations Sheet
  let familySheet = ss.getSheetByName('Family_Registrations');
  if (!familySheet) {
    familySheet = ss.insertSheet('Family_Registrations');
    familySheet.appendRow([
      'Timestamp',
      'Family ID',
      'Head of Family',
      'Total Members',
      'Status',
      'User ID',
      'User Email'
    ]);
    familySheet.getRange('A1:G1').setFontWeight('bold').setBackground('#764ba2').setFontColor('white');
  }
}

// Handle GET requests (for loading existing family data)
function doGet(e) {
  try {
    initializeSheets();
    
    const action = e.parameter.action;
    
    // Test endpoint
    if (action === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Connection successful! Google Apps Script is working.',
        timestamp: new Date().toISOString(),
        spreadsheetId: getSpreadsheet().getId()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getFamilyMembers') {
      const familyId = e.parameter.familyId;
      return getFamilyMembers(familyId);
    }
    
    if (action === 'checkUser') {
      const email = e.parameter.email;
      return checkUserExists(email);
    }
    
    if (action === 'authenticateUser') {
      const email = e.parameter.email;
      const password = e.parameter.password;
      return authenticateUser(email, password);
    }
    
    if (action === 'getUserRegistrations') {
      const userId = e.parameter.userId;
      const userEmail = e.parameter.userEmail;
      return getUserRegistrations(userId, userEmail);
    }
    
    if (action === 'getUserByEmail') {
      const email = e.parameter.email;
      return getUserByEmail(email);
    }
    
    if (action === 'getRegistrationById') {
      const id = e.parameter.id;
      return getRegistrationById(id);
    }
    
    if (action === 'searchFamilyByEmail') {
      const email = e.parameter.email;
      return searchFamilyByEmail(email);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (for submitting new registrations)
function doPost(e) {
  try {
    initializeSheets();
    
    Logger.log('Received POST request');
    Logger.log('Post data: ' + e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Parsed data action/type: ' + (data.action || data.type));
    
    if (data.action === 'createUser') {
      Logger.log('Creating user account');
      return createUserAccount(data);
    } else if (data.action === 'updateRegistration') {
      Logger.log('Updating registration');
      return updateRegistration(data);
    } else     if (data.action === 'deleteRegistration') {
      Logger.log('Deleting registration');
      return deleteRegistration(data);
    } else if (data.action === 'deleteFamily') {
      Logger.log('Deleting entire family');
      return deleteFamily(data);
    } else if (data.type === 'individual') {
      Logger.log('Processing individual registration');
      return handleIndividualRegistration(data);
    } else if (data.type === 'family') {
      Logger.log('Processing family registration');
      return handleFamilyRegistration(data);
    }
    
    Logger.log('Invalid registration type: ' + data.type);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid registration type: ' + data.type
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle individual registration
function handleIndividualRegistration(data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Individual_Registrations');
    
    if (!sheet) {
      throw new Error('Individual_Registrations sheet not found');
    }
    
    Logger.log('Appending row to Individual_Registrations');
    sheet.appendRow([
      data.timestamp,
      data.id,
      data.name,
      data.phone,
      data.email,
      data.address,
      '', // No family ID for individual registrations
      data.userId || '',
      data.userEmail || ''
    ]);
    
    Logger.log('Individual registration saved successfully');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Individual registration saved',
      id: data.id
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in handleIndividualRegistration: ' + error.toString());
    throw error;
  }
}

// Handle family registration
function handleFamilyRegistration(data) {
  try {
    const ss = getSpreadsheet();
    const individualSheet = ss.getSheetByName('Individual_Registrations');
    const familySheet = ss.getSheetByName('Family_Registrations');
    
    if (!individualSheet) {
      throw new Error('Individual_Registrations sheet not found');
    }
    if (!familySheet) {
      throw new Error('Family_Registrations sheet not found');
    }
    
    Logger.log('Processing ' + data.members.length + ' family members');
    
    // Add each family member to Individual_Registrations
    data.members.forEach((member, index) => {
      Logger.log('Adding member ' + (index + 1) + ': ' + member.name);
      individualSheet.appendRow([
        data.timestamp,
        member.id,
        member.name,
        member.phone,
        member.email,
        member.address,
        data.familyId,
        data.userId || '',
        data.userEmail || ''
      ]);
    });
    
    // Update or add family entry in Family_Registrations
    if (data.isExisting) {
      Logger.log('Updating existing family record');
      updateFamilyRecord(familySheet, data);
    } else {
      Logger.log('Creating new family record');
      familySheet.appendRow([
        data.timestamp,
        data.familyId,
        data.familyHead,
        data.members.length,
        'Active',
        data.userId || '',
        data.userEmail || ''
      ]);
    }
    
    Logger.log('Family registration saved successfully');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Family registration saved',
      familyId: data.familyId,
      memberCount: data.members.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in handleFamilyRegistration: ' + error.toString());
    throw error;
  }
}

// Update existing family record
function updateFamilyRecord(familySheet, data) {
  const lastRow = familySheet.getLastRow();
  const familyIds = familySheet.getRange(2, 2, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < familyIds.length; i++) {
    if (familyIds[i][0] === data.familyId) {
      const rowIndex = i + 2;
      const currentCount = familySheet.getRange(rowIndex, 4).getValue();
      familySheet.getRange(rowIndex, 1).setValue(data.timestamp);
      familySheet.getRange(rowIndex, 4).setValue(currentCount + data.members.length);
      return;
    }
  }
}

// Get family members by family ID
function getFamilyMembers(familyId) {
  const ss = getSpreadsheet();
  const individualSheet = ss.getSheetByName('Individual_Registrations');
  const familySheet = ss.getSheetByName('Family_Registrations');
  
  // Check if family exists
  const familyLastRow = familySheet.getLastRow();
  const familyData = familySheet.getRange(2, 1, familyLastRow - 1, 5).getValues();
  
  let familyExists = false;
  let familyHead = '';
  
  for (let i = 0; i < familyData.length; i++) {
    if (familyData[i][1] === familyId) {
      familyExists = true;
      familyHead = familyData[i][2];
      break;
    }
  }
  
  if (!familyExists) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Family ID not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Get all members of this family
  const lastRow = individualSheet.getLastRow();
  const data = individualSheet.getRange(2, 1, lastRow - 1, 7).getValues();
  
  const members = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i][6] === familyId) { // Column 7 is Family ID
      members.push({
        id: data[i][1],
        name: data[i][2],
        phone: data[i][3],
        email: data[i][4],
        address: data[i][5]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    familyId: familyId,
    familyHead: familyHead,
    members: members
  })).setMimeType(ContentService.MimeType.JSON);
}

// Search for family by member email
function searchFamilyByEmail(email) {
  try {
    const ss = getSpreadsheet();
    const individualSheet = ss.getSheetByName('Individual_Registrations');
    const familySheet = ss.getSheetByName('Family_Registrations');
    
    Logger.log('Searching for family with member email: ' + email);
    
    // Search for a family member with this email
    const lastRow = individualSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No registrations found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = individualSheet.getRange(2, 1, lastRow - 1, 7).getValues();
    
    let foundFamilyId = null;
    const emailLower = email.toLowerCase();
    
    // Find a family member with matching email
    for (let i = 0; i < data.length; i++) {
      const memberEmail = data[i][4]; // Column 5 is Email
      const familyId = data[i][6]; // Column 7 is Family ID
      
      if (familyId && memberEmail && typeof memberEmail === 'string' && memberEmail.toLowerCase() === emailLower) {
        foundFamilyId = familyId;
        Logger.log('Found family: ' + foundFamilyId + ' for email: ' + email);
        break;
      }
    }
    
    if (!foundFamilyId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No family found with that email'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get family details using the found family ID
    const familyLastRow = familySheet.getLastRow();
    const familyData = familySheet.getRange(2, 1, familyLastRow - 1, 5).getValues();
    
    let familyHead = '';
    for (let i = 0; i < familyData.length; i++) {
      if (familyData[i][1] === foundFamilyId) {
        familyHead = familyData[i][2];
        break;
      }
    }
    
    // Get all members of this family
    const members = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i][6] === foundFamilyId) {
        members.push({
          id: data[i][1],
          name: data[i][2],
          phone: data[i][3],
          email: data[i][4],
          address: data[i][5]
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      familyId: foundFamilyId,
      familyHead: familyHead,
      members: members
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in searchFamilyByEmail: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// User Management Functions

// Create user account
function createUserAccount(data) {
  try {
    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('User_Accounts');
    
    if (!userSheet) {
      throw new Error('User_Accounts sheet not found');
    }
    
    // Generate user ID
    const userId = 'USER-' + new Date().getTime();
    
    Logger.log('Creating user account: ' + data.email);
    userSheet.appendRow([
      data.timestamp,
      userId,
      data.name,
      data.email,
      data.password, // Already base64 encoded by client
      'Active'
    ]);
    
    Logger.log('User account created successfully: ' + userId);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'User account created',
      userId: userId,
      name: data.name
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in createUserAccount: ' + error.toString());
    throw error;
  }
}

// Check if user exists
function checkUserExists(email) {
  try {
    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('User_Accounts');
    
    if (!userSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        exists: false
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = userSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        exists: false
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const emails = userSheet.getRange(2, 4, lastRow - 1, 1).getValues();
    
    for (let i = 0; i < emails.length; i++) {
      if (emails[i][0].toLowerCase() === email.toLowerCase()) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          exists: true
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      exists: false
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in checkUserExists: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Authenticate user
function authenticateUser(email, password) {
  try {
    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('User_Accounts');
    
    if (!userSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'User accounts not initialized'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = userSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No user accounts found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const userData = userSheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    for (let i = 0; i < userData.length; i++) {
      const userEmail = userData[i][3];
      const userPassword = userData[i][4];
      
      if (userEmail.toLowerCase() === email.toLowerCase() && userPassword === password) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          userId: userData[i][1],
          name: userData[i][2],
          email: userEmail
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid credentials'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in authenticateUser: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get user by email
function getUserByEmail(email) {
  try {
    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('User_Accounts');
    
    if (!userSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'User accounts not initialized'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = userSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No user accounts found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const userData = userSheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    for (let i = 0; i < userData.length; i++) {
      const userEmail = userData[i][3];
      
      if (userEmail.toLowerCase() === email.toLowerCase()) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          userId: userData[i][1],
          name: userData[i][2],
          email: userEmail
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'User not found'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in getUserByEmail: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get user's registrations
function getUserRegistrations(userId, userEmail) {
  try {
    const ss = getSpreadsheet();
    const individualSheet = ss.getSheetByName('Individual_Registrations');
    const familySheet = ss.getSheetByName('Family_Registrations');
    
    // Use provided email, or look it up as fallback
    if (!userEmail) {
      userEmail = getUserEmailById(userId);
    }
    
    Logger.log('Getting registrations for userId: ' + userId + ', email: ' + userEmail);
    Logger.log('Starting registration search...');
    
    const individuals = [];
    const userFamilyIds = new Set(); // Track which families the user is part of
    const allFamilyMembers = new Map(); // Store ALL members of each family
    let totalPeople = 0;
    
    // First pass: Get individual registrations and identify which families user is in
    const individualLastRow = individualSheet.getLastRow();
    if (individualLastRow > 1) {
      const individualData = individualSheet.getRange(2, 1, individualLastRow - 1, 9).getValues();
      
      for (let i = 0; i < individualData.length; i++) {
        const rowUserId = individualData[i][7]; // User ID column
        const rowUserEmail = individualData[i][8]; // User Email column
        const rowEmail = individualData[i][4]; // Registrant's email column
        const familyId = individualData[i][6]; // Family ID column
        
        const person = {
          timestamp: individualData[i][0],
          id: individualData[i][1],
          name: individualData[i][2],
          phone: individualData[i][3],
          email: individualData[i][4],
          address: individualData[i][5],
          familyId: familyId,
          registeredBy: rowUserId
        };
        
        // Match by userId OR by email (fallback for legacy data or mismatches)
        // Also match if the registrant's email matches the user's email
        // Safely check if values exist and are strings before calling toLowerCase()
        const isUserRegistration = (rowUserId === userId) || 
                                   (userEmail && rowUserEmail && typeof rowUserEmail === 'string' && rowUserEmail.toLowerCase() === userEmail.toLowerCase()) ||
                                   (userEmail && rowEmail && typeof rowEmail === 'string' && rowEmail.toLowerCase() === userEmail.toLowerCase());
        
        if (isUserRegistration) {
          Logger.log('Found registration for user: ' + person.name + ' (ID: ' + person.id + ')');
          
          if (!familyId) {
            // Individual registration (not part of family)
            individuals.push(person);
            totalPeople++;
          } else {
            // User is part of this family
            userFamilyIds.add(familyId);
          }
        }
        
        // Store all family members (regardless of who registered them)
        if (familyId) {
          if (!allFamilyMembers.has(familyId)) {
            allFamilyMembers.set(familyId, []);
          }
          allFamilyMembers.get(familyId).push(person);
        }
      }
    }
    
    // Get family information - show ALL members for families user is part of OR owns
    const families = [];
    const familyLastRow = familySheet.getLastRow();
    if (familyLastRow > 1) {
      const familyData = familySheet.getRange(2, 1, familyLastRow - 1, 7).getValues();
      
      for (let i = 0; i < familyData.length; i++) {
        const familyId = familyData[i][1];
        const ownerId = familyData[i][5]; // User ID of family creator
        
        // Show family if: user is part of it OR user owns it (even with 0 members)
        const isPartOfFamily = userFamilyIds.has(familyId);
        const isOwner = ownerId === userId;
        
        if (isPartOfFamily || isOwner) {
          const members = allFamilyMembers.get(familyId) || []; // Empty array if no members
          families.push({
            timestamp: familyData[i][0],
            familyId: familyId,
            familyHead: familyData[i][2],
            memberCount: members.length,
            status: familyData[i][4],
            ownerId: ownerId,
            members: members
          });
          totalPeople += members.length;
        }
      }
    }
    
    Logger.log('Found ' + individuals.length + ' individual registrations');
    Logger.log('Found ' + families.length + ' family registrations');
    Logger.log('Total people: ' + totalPeople);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: {
        individuals: individuals,
        families: families,
        totalPeople: totalPeople
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in getUserRegistrations: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString(),
      data: {
        individuals: [],
        families: [],
        totalPeople: 0
      }
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get registration by ID
function getRegistrationById(id) {
  try {
    const ss = getSpreadsheet();
    const individualSheet = ss.getSheetByName('Individual_Registrations');
    
    const lastRow = individualSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No registrations found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = individualSheet.getRange(2, 1, lastRow - 1, 9).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][1] === id) { // Column 2 is Individual ID
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: {
            id: data[i][1],
            name: data[i][2],
            phone: data[i][3],
            email: data[i][4],
            address: data[i][5],
            familyId: data[i][6],
            userId: data[i][7]
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Registration not found'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in getRegistrationById: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Update registration
function updateRegistration(data) {
  try {
    const ss = getSpreadsheet();
    const individualSheet = ss.getSheetByName('Individual_Registrations');
    
    const lastRow = individualSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No registrations found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheetData = individualSheet.getRange(2, 1, lastRow - 1, 9).getValues();
    
    for (let i = 0; i < sheetData.length; i++) {
      if (sheetData[i][1] === data.id) { // Column 2 is Individual ID
        const rowIndex = i + 2; // +2 because arrays are 0-indexed and we skip header
        
        // Verify ownership
        if (sheetData[i][7] !== data.userId) { // Column 8 is User ID
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'You do not have permission to edit this registration'
          })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Update the row
        individualSheet.getRange(rowIndex, 3).setValue(data.name); // Name
        individualSheet.getRange(rowIndex, 4).setValue(data.phone); // Phone
        individualSheet.getRange(rowIndex, 5).setValue(data.email); // Email
        individualSheet.getRange(rowIndex, 6).setValue(data.address); // Address
        
        Logger.log('Updated registration: ' + data.id);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Registration updated successfully'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Registration not found'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in updateRegistration: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Delete registration
function deleteRegistration(data) {
  try {
    const ss = getSpreadsheet();
    const individualSheet = ss.getSheetByName('Individual_Registrations');
    
    const lastRow = individualSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No registrations found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheetData = individualSheet.getRange(2, 1, lastRow - 1, 9).getValues();
    
    for (let i = 0; i < sheetData.length; i++) {
      if (sheetData[i][1] === data.id) { // Column 2 is Individual ID
        const rowIndex = i + 2; // +2 because arrays are 0-indexed and we skip header
        
        // Verify ownership
        if (sheetData[i][7] !== data.userId) { // Column 8 is User ID
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'You do not have permission to delete this registration'
          })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Delete the row
        individualSheet.deleteRow(rowIndex);
        
        Logger.log('Deleted registration: ' + data.id);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Registration deleted successfully'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Registration not found'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in deleteRegistration: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Delete entire family
function deleteFamily(data) {
  try {
    const ss = getSpreadsheet();
    const individualSheet = ss.getSheetByName('Individual_Registrations');
    const familySheet = ss.getSheetByName('Family_Registrations');
    
    // First, verify ownership of the family
    const familyLastRow = familySheet.getLastRow();
    if (familyLastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Family not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const familyData = familySheet.getRange(2, 1, familyLastRow - 1, 7).getValues();
    let familyRowIndex = -1;
    let isOwner = false;
    
    for (let i = 0; i < familyData.length; i++) {
      if (familyData[i][1] === data.familyId) { // Column 2 is Family ID
        familyRowIndex = i + 2;
        isOwner = familyData[i][5] === data.userId; // Column 6 is User ID (owner)
        break;
      }
    }
    
    if (familyRowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Family not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!isOwner) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'You do not have permission to delete this family. Only the family owner can delete it.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Delete all family members from Individual_Registrations
    let deletedCount = 0;
    const individualLastRow = individualSheet.getLastRow();
    
    if (individualLastRow > 1) {
      const individualData = individualSheet.getRange(2, 1, individualLastRow - 1, 9).getValues();
      
      // Delete from bottom to top to maintain row indices
      for (let i = individualData.length - 1; i >= 0; i--) {
        if (individualData[i][6] === data.familyId) { // Column 7 is Family ID
          const rowIndex = i + 2;
          individualSheet.deleteRow(rowIndex);
          deletedCount++;
        }
      }
    }
    
    // Delete the family record
    familySheet.deleteRow(familyRowIndex);
    
    Logger.log('Deleted family: ' + data.familyId + ' with ' + deletedCount + ' members');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Family deleted successfully',
      deletedCount: deletedCount
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in deleteFamily: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to get user's email by userId
function getUserEmailById(userId) {
  try {
    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('User_Accounts');
    
    if (!userSheet) return null;
    
    const lastRow = userSheet.getLastRow();
    if (lastRow <= 1) return null;
    
    const userData = userSheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    for (let i = 0; i < userData.length; i++) {
      if (userData[i][1] === userId) { // Column 2 is User ID
        return userData[i][3]; // Column 4 is Email
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Error in getUserEmailById: ' + error.toString());
    return null;
  }
}

// Test function to verify setup
function testSetup() {
  initializeSheets();
  Logger.log('Sheets initialized successfully!');
  
  const ss = getSpreadsheet();
  Logger.log('Spreadsheet ID: ' + ss.getId());
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
}
