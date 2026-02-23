# Authentication System Setup Guide

## 🎉 New Features

Your Church Retreat Sign-Up system now includes:

✅ **User Accounts** - Sign up with email/password or Google (Google requires Firebase)  
✅ **Personal Dashboard** - View all your registrations in one place  
✅ **User-Specific Data** - Each user sees only their own registrations  
✅ **Secure Sessions** - 30-day login sessions  
✅ **Family Management** - Easily add more family members later  

## 📁 New Files

- `index.html` - Landing page (redirects to auth or dashboard)
- `auth.html` - Sign in / Sign up page
- `auth.js` - Authentication logic
- `dashboard.html` - User dashboard showing registrations
- `dashboard.js` - Dashboard functionality
- `register.html` - Registration form (moved from index.html)

## 🚀 Quick Setup

### Step 1: Update Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Copy ALL the code from `google-apps-script.js`
4. Paste it into Apps Script (replace everything)
5. Click **Save** (💾)

### Step 2: Create NEW Deployment

**IMPORTANT:** You must create a new deployment since the backend code changed!

1. In Apps Script, click **Deploy > New deployment**
2. Click gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Configure:
   - **Execute as**: Me
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. **Authorize** if prompted
7. Copy the new Web App URL

### Step 3: Update URLs in JavaScript Files

Update the `GOOGLE_SCRIPT_URL` in **three files**:

1. **`auth.js`** (line 15)
2. **`dashboard.js`** (line 1)
3. **`script.js`** (line 13)

Replace with your new deployment URL.

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Add user authentication and dashboard"
git push
```

### Step 5: Test the System

1. Go to your website
2. You'll be redirected to the sign-in page
3. Click "Create Account"
4. Fill in your details and sign up
5. You'll be redirected to your dashboard
6. Click "New Registration" to register for the retreat

## 🎯 How It Works

### User Flow

1. **First Visit** → Redirected to `auth.html`
2. **Sign Up** → Account created in Google Sheets
3. **Sign In** → Session saved in browser (30 days)
4. **Dashboard** → See all your registrations
5. **Register** → Create individual or family registrations
6. **Back to Dashboard** → View updated registrations

### Data Structure

#### New Sheet: User_Accounts

| Timestamp | User ID | Name | Email | Password | Status |
|-----------|---------|------|-------|----------|--------|
| ... | USER-1234567890 | John Doe | john@email.com | [encoded] | Active |

#### Updated Sheets

**Individual_Registrations** - Added columns:
- User ID
- User Email

**Family_Registrations** - Added columns:
- User ID
- User Email

### Security Notes

⚠️ **Current Implementation:**
- Passwords are base64 encoded (NOT secure for production!)
- Sessions stored in localStorage (client-side)
- No email verification

🔒 **For Production Use:**
- Implement Firebase Authentication for real security
- Use HTTPS
- Add email verification
- Implement proper password hashing

## 🔐 Optional: Firebase Google Sign-In

To enable Google Sign-In, you need to set up Firebase:

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Google** provider
5. Add your domain to authorized domains

### Step 3: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>)
4. Copy the Firebase config object

### Step 4: Update auth.js

Replace the `FIREBASE_CONFIG` object in `auth.js`:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... rest of config
};
```

### Step 5: Add Firebase SDK

Add these scripts to `auth.html` before `</body>`:

```html
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"></script>
```

## 📊 Dashboard Features

### Summary Cards
- Count of individual registrations
- Count of family registrations
- Total people registered

### Individual Registrations
- View all your individual sign-ups
- See registration details
- Registration ID for reference

### Family Registrations
- View all families you're part of
- See all family members
- Family ID to share with others
- Add more members button

## 🛠️ Customization

### Change Session Duration

In `index.html`, `auth.js`, `dashboard.js`, and `script.js`:

```javascript
const thirtyDays = 30 * 24 * 60 * 60 * 1000;
// Change to 7 days:
const sevenDays = 7 * 24 * 60 * 60 * 1000;
```

### Customize Colors

Edit `styles.css`:
- Main purple gradient: `#667eea` and `#764ba2`
- Success green: `#4caf50`
- Google blue: `#4285F4`

### Add More User Fields

1. Update `auth.html` - add input fields
2. Update `auth.js` - collect data
3. Update Google Apps Script - add columns
4. Update `dashboard.js` - display data

## 🐛 Troubleshooting

### "Please sign in to register"
- Session expired or not signed in
- Clear browser cache and sign in again

### Can't see my registrations
- Make sure you're signed in with the same account
- Check Google Apps Script logs for errors
- Verify User ID matches in sheets

### Google Sign-In not working
- Firebase not set up (see setup above)
- Check browser console for errors
- Verify Firebase config is correct

### Data not saving
- Check that new deployment was created
- Verify all URLs are updated
- Check Apps Script execution logs

## 📝 Migration from Old System

If you have existing registrations without User IDs:

1. Users need to create accounts
2. Existing registrations won't show in their dashboard
3. Options:
   - Let them re-register (will create duplicates)
   - Manually assign User IDs in the sheet
   - Keep old registrations separate

## 🎓 Best Practices

1. **Regular Backups**: Download Google Sheet regularly
2. **Test Accounts**: Create test accounts to verify functionality
3. **User Communication**: Tell users about the new system
4. **Support**: Have someone available to help users sign up
5. **Instructions**: Add a help section for users

## 🚀 Future Enhancements

Possible features to add:
- Email notifications
- Edit/delete registrations
- Payment integration
- QR code check-in
- Admin dashboard
- Family invitations via email
- Profile management
- Password reset

---

Need help? Check `TROUBLESHOOTING.md` or open an issue!
