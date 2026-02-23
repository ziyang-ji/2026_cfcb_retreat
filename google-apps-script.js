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
      'Family ID'
    ]);
    individualSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
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
      'Status'
    ]);
    familySheet.getRange('A1:E1').setFontWeight('bold').setBackground('#764ba2').setFontColor('white');
  }
}

// Handle GET requests (for loading existing family data)
function doGet(e) {
  initializeSheets();
  
  const action = e.parameter.action;
  
  if (action === 'getFamilyMembers') {
    const familyId = e.parameter.familyId;
    return getFamilyMembers(familyId);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle POST requests (for submitting new registrations)
function doPost(e) {
  initializeSheets();
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.type === 'individual') {
      return handleIndividualRegistration(data);
    } else if (data.type === 'family') {
      return handleFamilyRegistration(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid registration type'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle individual registration
function handleIndividualRegistration(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Individual_Registrations');
  
  sheet.appendRow([
    data.timestamp,
    data.id,
    data.name,
    data.phone,
    data.email,
    data.address,
    '' // No family ID for individual registrations
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Individual registration saved',
    id: data.id
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle family registration
function handleFamilyRegistration(data) {
  const ss = getSpreadsheet();
  const individualSheet = ss.getSheetByName('Individual_Registrations');
  const familySheet = ss.getSheetByName('Family_Registrations');
  
  // Add each family member to Individual_Registrations
  data.members.forEach(member => {
    individualSheet.appendRow([
      data.timestamp,
      member.id,
      member.name,
      member.phone,
      member.email,
      member.address,
      data.familyId
    ]);
  });
  
  // Update or add family entry in Family_Registrations
  if (data.isExisting) {
    // Update existing family
    updateFamilyRecord(familySheet, data);
  } else {
    // Add new family
    familySheet.appendRow([
      data.timestamp,
      data.familyId,
      data.familyHead,
      data.members.length,
      'Active'
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Family registration saved',
    familyId: data.familyId,
    memberCount: data.members.length
  })).setMimeType(ContentService.MimeType.JSON);
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

// Test function to verify setup
function testSetup() {
  initializeSheets();
  Logger.log('Sheets initialized successfully!');
  
  const ss = getSpreadsheet();
  Logger.log('Spreadsheet ID: ' + ss.getId());
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
}
