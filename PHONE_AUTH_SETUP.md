# Phone Authentication Setup Guide

Phone authentication is currently not working because it requires additional Firebase configuration.

## Why Phone Auth is Stuck

The "Sending SMS..." hang occurs because Firebase Phone Authentication requires:

1. **Phone Sign-in Method Enabled** in Firebase Console
2. **Authorized Domains** configured
3. **Cloud Functions** or billing enabled (Firebase requires paid plan for SMS)

## Firebase Phone Auth Requirements

### ⚠️ Important: Phone Auth Requires Paid Plan

Firebase Phone Authentication is **NOT available on the free Spark plan**. You need:
- **Blaze (Pay as you go) plan** - Only pay for what you use
- SMS costs vary by country (US: ~$0.01-0.02 per SMS)

## Setup Steps

### Step 1: Upgrade to Blaze Plan

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **cfcb-retreat**
3. Click the gear icon (⚙️) → **Usage and billing**
4. Click **Modify plan**
5. Select **Blaze (Pay as you go)**
   - You'll need to add a credit card
   - Set up budget alerts to avoid unexpected charges
   - Typical cost for a retreat: $1-5 total for all SMS

### Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Sign-in method** tab
3. Find **Phone** in the list
4. Click **Phone** → Click **Enable**
5. Click **Save**

### Step 3: Add Authorized Domain

1. Still in **Sign-in method** tab
2. Scroll down to **Authorized domains**
3. Click **Add domain**
4. Add: `ziyang-ji.github.io`
5. Click **Add**

### Step 4: Test

1. Refresh your website
2. Try phone authentication
3. You should receive an SMS within 30 seconds

## Alternative: Remove Phone Authentication

If you don't want to upgrade to a paid plan, I recommend **removing phone authentication** and keeping only Google Sign-In, which is:
- ✅ Free on Spark plan
- ✅ Simple and secure
- ✅ Most users already have Google accounts
- ✅ No SMS costs

To remove phone auth, just let me know and I'll remove it from the code.

## Cost Estimates

Assuming 100 people sign up for your retreat:
- **SMS costs**: ~$1-2 (if everyone uses phone auth)
- **Google Auth**: FREE
- **Firebase hosting/database**: FREE (within limits)

Most users will use Google Auth, so actual SMS costs will likely be under $1.

## Recommended Solution

**Option 1: Use Google Sign-In Only (Current)**
- Already working perfectly
- No additional setup needed
- No costs
- Simple for users

**Option 2: Add Phone Auth (Requires Upgrade)**
- Need Blaze plan
- SMS costs per user
- More setup complexity
- Good for users without Google accounts

For a church retreat, I recommend **sticking with Google Sign-In only** since:
- Most people have Gmail
- It's free and secure
- Simpler setup
- No ongoing costs
