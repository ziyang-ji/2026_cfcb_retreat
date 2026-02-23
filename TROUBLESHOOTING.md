# Troubleshooting Guide

## What I Just Fixed

I've added extensive debugging and a test connection button to help diagnose issues:

### Changes Made:

1. ✅ **Added "Test Connection" button** in the header
2. ✅ **Improved error handling** with detailed console logs
3. ✅ **Fixed CORS issues** by changing fetch mode
4. ✅ **Added logging** to Google Apps Script backend
5. ✅ **Better error messages** that tell you exactly what's wrong

## Step-by-Step Fix Process

### Step 1: Update Google Apps Script

1. Go to your Google Sheet
2. Click **Extensions > Apps Script**
3. **IMPORTANT**: Copy the ENTIRE updated `google-apps-script.js` file
4. Replace ALL the code in Apps Script with the new version
5. Click **Save** (💾 icon)

### Step 2: Re-deploy (CRITICAL!)

Since you updated the Apps Script code, you MUST create a NEW deployment:

1. In Apps Script, click **Deploy > New deployment**
2. Click gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Fill in:
   - Description: "Church Retreat v2" (or any description)
   - Execute as: **Me**
   - Who has access: **Anyone** ← CRITICAL!
5. Click **Deploy**
6. Click **Authorize access** if prompted
7. Copy the NEW Web App URL

**Why?** When you update the script, you need a new deployment for changes to take effect!

### Step 3: Update Your Files

You need to update `script.js` with the new URL (if it changed) and push all three updated files:

```bash
# Make sure all files are updated:
# - index.html (has test button)
# - styles.css (styling for test button)
# - script.js (better error handling)
```

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Add debugging and fix Google Sheets connection"
git push
```

### Step 5: Test the Connection

1. Go to your website: `https://ziyang-ji.github.io/2026_cfcb_retreat`
2. Click the **"🔍 Test Connection"** button at the top
3. Open browser console (Press **F12** or **Cmd+Option+I** on Mac)
4. Look at the console output

### Expected Results:

**✅ Success:**
```
🔍 Testing connection to Google Sheets...
Response status: 200
Response ok: true
Response: {"success":true,"message":"Connection successful!..."}
```

**❌ Failed:**
You'll see detailed error messages telling you exactly what's wrong.

## Common Issues & Solutions

### Issue 1: "Failed to fetch" or CORS error

**Cause:** The deployment isn't set to "Anyone" access

**Fix:**
1. Go to Apps Script
2. Click **Deploy > Manage deployments**
3. Click Edit (pencil icon)
4. Change "Who has access" to **Anyone**
5. Click **Deploy**
6. Update the URL in script.js if it changed

### Issue 2: 404 Not Found

**Cause:** Wrong URL or deployment doesn't exist

**Fix:**
1. Make sure you used the URL from "New deployment" not "Manage deployments"
2. URL must end with `/exec`
3. Try creating a brand new deployment

### Issue 3: Data submits but no error, but nothing in sheets

**Cause:** Sheet names don't match

**Fix:**
1. In your Google Sheet, check if you have tabs named:
   - `Individual_Registrations`
   - `Family_Registrations`
2. If not, either:
   - Rename your tabs to match, OR
   - Run the script once and it will create them automatically

### Issue 4: "Authorization required"

**Cause:** You haven't authorized the script

**Fix:**
1. Go to Apps Script
2. Click the Run button (▶️) on the `testSetup` function
3. Click "Review permissions"
4. Choose your Google account
5. Click "Advanced" → "Go to [project name]"
6. Click "Allow"

### Issue 5: Changes not taking effect

**Cause:** Browser cache or GitHub Pages hasn't updated

**Fix:**
1. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Wait 1-2 minutes for GitHub Pages to rebuild
3. Clear browser cache
4. Try incognito/private browsing mode

## Checking Google Apps Script Logs

To see what's happening on the backend:

1. Go to Apps Script
2. Click **Executions** (left sidebar, clock icon)
3. You'll see all recent requests and any errors
4. Click on an execution to see detailed logs

## Advanced Debugging

### Check the Console

1. Open your website
2. Press **F12** (or **Cmd+Option+I** on Mac)
3. Click **Console** tab
4. Try registering
5. You'll see detailed logs of:
   - What data is being sent
   - The response from Google Sheets
   - Any errors

### What to Look For:

```javascript
// Good:
✅ Data successfully submitted!
Response status: 200
Parsed result: {success: true, ...}

// Bad:
❌ Error submitting to Google Sheets
HTTP error! status: 403  // Permission issue
HTTP error! status: 404  // Wrong URL
```

## Still Not Working?

### Share This Info:

1. Click "Test Connection" and screenshot the console
2. Try to register and screenshot the console
3. Check Google Apps Script > Executions and screenshot any errors
4. Check your Google Sheet - do you see the two tabs created?
5. What's the exact error message you see?

With this info, we can pinpoint exactly what's wrong!

## Quick Checklist

- [ ] Updated Google Apps Script with new code
- [ ] Created NEW deployment (not edited old one)
- [ ] Set "Who has access" to "Anyone"
- [ ] Authorized the script when prompted
- [ ] Copied the correct URL (ends with /exec)
- [ ] Updated script.js with new URL
- [ ] Pushed all changes to GitHub
- [ ] Waited for GitHub Pages to rebuild
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Clicked "Test Connection" button
- [ ] Checked browser console for errors
