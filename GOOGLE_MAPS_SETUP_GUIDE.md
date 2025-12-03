# Google Maps API Setup Guide

## Step 1: Get Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Select a project" at the top → "New Project"
4. Enter project name (e.g., "Restaurant App") → Click "Create"
5. Wait for project to be created (notification will appear)

## Step 2: Enable Required APIs

1. In the Google Cloud Console, click the hamburger menu (☰) → "APIs & Services" → "Library"
2. Search for "Maps JavaScript API" → Click it → Click "Enable"
3. Go back to Library, search for "Geocoding API" → Click it → Click "Enable"

## Step 2.5: Enable Billing (Required)

**Important:** Google Maps requires billing to be enabled, even for free tier usage.

1. In Google Cloud Console, click hamburger menu (☰) → "Billing"
2. Click "Link a billing account" or "Create billing account"
3. Enter your payment information (you won't be charged unless you exceed $200/month free credit)
4. Click "Set account"
5. Verify billing is enabled by going to "APIs & Services" → "Dashboard"

## Step 3: Create API Key

1. Click hamburger menu (☰) → "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top → Select "API key"
3. Your API key will be created and shown in a popup
4. **COPY THIS KEY** (it looks like: AIzaSyD1234567890abcdefghijklmnop)
5. (Optional but recommended) Click "Restrict Key" to add restrictions:
   - Under "Application restrictions", select "HTTP referrers"
   - Add: `http://localhost:*` and your production domain
   - Under "API restrictions", select "Restrict key"
   - Select: Maps JavaScript API and Geocoding API
   - Click "Save"

## Step 4: Add API Key to Your Project

1. In your project, create a file: `frontend/.env`
2. Add this line (replace with your actual key):
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyD1234567890abcdefghijklmnop
   ```
3. Save the file

## Step 5: Restart Your Dev Server

1. Stop your frontend dev server (Ctrl+C)
2. Start it again: `npm run dev` (from the frontend folder)

## Step 6: Test It

1. Open your app in the browser
2. Navigate to the location access page
3. Click "ACCESS LOCATION"
4. Allow location permission when browser asks
5. You should see a Google Map with your location marker!

## Troubleshooting

**Map not showing?**
- Check browser console for errors
- Verify API key is correct in `.env` file
- Make sure you enabled both APIs in Google Cloud Console
- Restart dev server after adding `.env` file

**"This page can't load Google Maps correctly"?**
- Your API key might be restricted incorrectly
- Go to Google Cloud Console → Credentials → Edit your API key
- Remove all restrictions temporarily to test

**Location permission denied?**
- Browser blocked location access
- Click the lock icon in address bar → Allow location
- Refresh the page and try again

## Important Notes

- Never commit your `.env` file to Git (it's already in .gitignore)
- The `.env.example` file is a template (safe to commit)
- Google Maps has a free tier: $200 credit per month
- For production, add proper API key restrictions
