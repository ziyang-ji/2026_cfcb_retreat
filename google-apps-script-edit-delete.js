/**
 * Add these functions to your Google Apps Script
 * Paste at the end of your existing google-apps-script.js file
 */

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

// UPDATE the doGet function to handle new actions
// Find your existing doGet function and add these cases:
/*
    if (action === 'getRegistrationById') {
      const id = e.parameter.id;
      return getRegistrationById(id);
    }
*/

// UPDATE the doPost function to handle new actions
// Find your existing doPost function and add these cases:
/*
    if (data.action === 'updateRegistration') {
      Logger.log('Updating registration');
      return updateRegistration(data);
    } else if (data.action === 'deleteRegistration') {
      Logger.log('Deleting registration');
      return deleteRegistration(data);
    }
*/
