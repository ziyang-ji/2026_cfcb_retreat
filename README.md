# Church Retreat Sign-Up Website

A beautiful, user-friendly registration system for church retreats that handles both individual and family registrations with Google Sheets integration.

## Features

- ✅ **Individual Registration** - Quick sign-up for single attendees
- ✅ **Family Registration** - Register multiple family members together
- ✅ **Unique ID Generation** - Automatic creation of unique IDs for individuals and families
- ✅ **Family Linking** - Existing families can add more members using their Family ID
- ✅ **Google Sheets Integration** - All data automatically saved to Google Sheets
- ✅ **Modern, Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Beautiful UI** - Clean, professional interface

## Setup Instructions

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Church Retreat Sign-Up" (or any name you prefer)
4. Keep this tab open - you'll need it for the next steps

### Step 2: Add Google Apps Script

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Open the `google-apps-script.js` file from this project
4. Copy ALL the code and paste it into the Apps Script editor
5. Click the **Save** icon (💾) and name your project (e.g., "Retreat Registration Backend")

### Step 3: Deploy Web App

1. In Apps Script, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Configure the deployment:
   - **Description**: "Church Retreat Sign-Up API"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. You may need to authorize the script:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** if you see a warning
   - Click **Go to [Project Name] (unsafe)**
   - Click **Allow**
7. **IMPORTANT**: Copy the **Web app URL** (it looks like: `https://script.google.com/macros/s/...../exec`)

### Step 4: Configure the Website

1. Open the `script.js` file from this project
2. Find this line near the top:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'` with your Web App URL from Step 3
4. Save the file

### Step 5: Host the Website

You have several options to host the website:

#### Option A: GitHub Pages (Free, Recommended)
1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload `index.html`, `styles.css`, and `script.js`
4. Go to repository Settings > Pages
5. Select main branch as source
6. Your site will be live at `https://yourusername.github.io/repository-name`

#### Option B: Local Testing
1. Simply open `index.html` in your web browser
2. Note: Some browsers may block the Google Sheets connection when running locally

#### Option C: Other Hosting Services
- [Netlify](https://www.netlify.com/) - Free, drag and drop
- [Vercel](https://vercel.com/) - Free, simple deployment
- [Google Sites](https://sites.google.com/) - Embed using custom HTML

### Step 6: Test the System

1. Open your website
2. Try registering as an individual:
   - Enter a name
   - Fill out the form
   - Submit
3. Check your Google Sheet - you should see the data in "Individual_Registrations" tab
4. Try registering a family:
   - Create a new family
   - Add multiple members
   - Complete registration
5. Check your Google Sheet - data should appear in both tabs

## How It Works

### Registration Flow

1. **Choose Type**: User selects Individual or Family registration
2. **Individual Path**:
   - Enter name → Generate unique ID
   - Fill in details (phone, email, address)
   - Submit → Data saved to Google Sheets
3. **Family Path**:
   - Choose: Existing family or New family
   - **New Family**: Enter head of family → Generate Family ID
   - **Existing Family**: Enter Family ID → Load existing members
   - Add family members one by one
   - Each member gets individual ID but linked to Family ID
   - Complete → All data saved to Google Sheets

### Data Structure

#### Individual_Registrations Sheet
| Timestamp | Individual ID | Name | Phone | Email | Address | Family ID |
|-----------|---------------|------|-------|-------|---------|-----------|
| 2026-02-22... | JOHN-DOE-2026-123 | John Doe | (555) 123-4567 | john@email.com | 123 Main St | |
| 2026-02-22... | JANE-SMITH-456 | Jane Smith | (555) 234-5678 | jane@email.com | 456 Oak Ave | SMITH-2026 |

#### Family_Registrations Sheet
| Timestamp | Family ID | Head of Family | Total Members | Status |
|-----------|-----------|----------------|---------------|--------|
| 2026-02-22... | SMITH-2026 | John Smith | 4 | Active |

### ID Generation

- **Individual ID**: `FIRSTNAME-LASTNAME-YEAR-RANDOM`
  - Example: `JOHN-DOE-2026-123`
- **Family ID**: `LASTNAME-YEAR`
  - Example: `SMITH-2026`
- **Family Member ID**: `FIRSTNAME-LASTNAME-RANDOM`
  - Example: `JANE-SMITH-456`

## Benefits Over Google Forms

1. **Family Linking**: Clear relationship between family members
2. **Unique IDs**: Easy tracking and reference
3. **Flexibility**: Families can add members over time
4. **Better Data**: Structured data that's easy to analyze
5. **Professional Look**: Custom branding and design
6. **No Confusion**: Clear process reduces duplicate/unclear entries

## Troubleshooting

### Data Not Saving
- Check that the Web App URL is correctly set in `script.js`
- Verify the Apps Script deployment is set to "Anyone" access
- Check browser console (F12) for error messages

### Family ID Not Found
- Ensure the Family ID is entered exactly as provided (case-sensitive)
- Check the Family_Registrations sheet for the correct ID

### Sheets Not Created
- Run the `testSetup()` function in Apps Script
- Check Apps Script execution log for errors

## Customization

### Change Colors
Edit `styles.css`:
- Main gradient: `.container header` and `.btn-primary`
- Accent colors: Search for `#667eea` and `#764ba2`

### Add Fields
1. Add input fields in `index.html`
2. Update `script.js` to collect the data
3. Update `google-apps-script.js` to save additional columns

### Modify ID Format
Edit ID generation functions in `script.js`:
- `createIndividualId()`
- `createFamilyId()`

## Support

For questions or issues:
1. Check the Google Sheet for data
2. Review Apps Script execution logs
3. Check browser console for JavaScript errors

## Files Included

- `index.html` - Main website structure
- `styles.css` - All styling and design
- `script.js` - Frontend logic and Google Sheets communication
- `google-apps-script.js` - Backend script for Google Sheets
- `README.md` - This documentation

---

Made with ❤️ for your church community
