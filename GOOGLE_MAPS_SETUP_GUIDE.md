# 🗺️ Google Maps API Setup Guide - Complete Instructions

## 🚀 QUICK START: How to Get Google Maps API Key

### Step 1: Create Google Cloud Account
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Sign in** with your Google account (Gmail account)
3. **Accept Terms of Service** if prompted

### Step 2: Create a New Project
1. **Click the project dropdown** (top left, next to "Google Cloud")
2. **Click "New Project"**
3. **Enter project name**: `Food Delivery App` (or any name you prefer)
4. **Click "Create"**
5. **Wait for project creation** (takes 10-30 seconds)
6. **Select your new project** from the dropdown

### Step 3: Enable Required APIs
1. **Go to "APIs & Services" → "Library"** (left sidebar)
2. **Search for "Maps JavaScript API"**
3. **Click on "Maps JavaScript API"**
4. **Click "Enable"** button
5. **Search for "Geocoding API"** (for address lookup)
6. **Click on "Geocoding API"**
7. **Click "Enable"** button

### Step 4: Create API Key
1. **Go to "APIs & Services" → "Credentials"** (left sidebar)
2. **Click "Create Credentials"** (top blue button)
3. **Select "API Key"**
4. **Copy the generated API key** (starts with `AIza...`)
5. **Click "Close"** (don't restrict it yet)

### Step 5: Configure Your Project
1. **Open your project folder**
2. **Navigate to `frontend/.env` file**
3. **Replace the placeholder**:
   ```env
   # Before:
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   
   # After (use your actual key):
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxxxxxxxxxxxxxxxxxxxxxxxxxxX
   ```
4. **Save the file**

### Step 6: Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### Step 7: Test the Integration
1. **Open your app**: http://localhost:5173
2. **Go to Location Access page** (signup as customer)
3. **Click "ACCESS LOCATION"**
4. **You should see**:
   - Interactive Google Map
   - Your location marker
   - Formatted address (not just coordinates)

---

## � OPTIONAL: Secure Your API Key (Recommended)

### Why Secure It?
- Prevents unauthorized usage
- Protects against quota theft
- Reduces billing risks

### How to Secure:
1. **Go back to Google Cloud Console**
2. **Navigate to "APIs & Services" → "Credentials"**
3. **Click on your API key name**
4. **Under "Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
5. **Add these referrers**:
   ```
   http://localhost:*
   http://127.0.0.1:*
   https://yourdomain.com/*  (when you deploy)
   ```
6. **Under "API restrictions"**:
   - Select **"Restrict key"**
   - Check **"Maps JavaScript API"**
   - Check **"Geocoding API"**
7. **Click "Save"**

---

## 💰 BILLING INFORMATION

### Free Tier:
- **$200 free credit** per month
- **28,500 map loads** per month (free)
- **40,000 geocoding requests** per month (free)

### For Development:
- Your usage will likely stay within free limits
- No credit card required for basic testing

### If You Exceed Free Tier:
- Google will ask for billing information
- Very unlikely during development

---

## 🔧 TROUBLESHOOTING

### Common Issues:

#### 1. "This page can't load Google Maps correctly"
**Solution**: API key not configured or invalid
- Check if API key is correctly copied
- Ensure no extra spaces in `.env` file
- Restart development server

#### 2. "Map shows but no address lookup"
**Solution**: Geocoding API not enabled
- Go to Google Cloud Console
- Enable "Geocoding API"
- Wait 2-3 minutes for activation

#### 3. "RefererNotAllowedMapError"
**Solution**: Referrer restrictions too strict
- Go to API key settings
- Add `http://localhost:*` to referrers
- Or temporarily remove restrictions for testing

#### 4. "API key expired or invalid"
**Solution**: Check API key status
- Go to Google Cloud Console → Credentials
- Verify API key is active
- Check if project billing is enabled (if needed)

---

## ✅ VERIFICATION CHECKLIST

After setup, verify these work:

### Location Access Page:
- [ ] Interactive map loads
- [ ] Click "ACCESS LOCATION" shows your location
- [ ] Address shows as text (not just coordinates)
- [ ] Map marker appears at your location

### Restaurant Settings (if applicable):
- [ ] Map loads in restaurant settings
- [ ] Click on map updates coordinates
- [ ] Address fields populate automatically

---

## 🆘 NEED HELP?

### If Maps Still Don't Work:
1. **Check browser console** (F12 → Console tab)
2. **Look for error messages** starting with "Google Maps"
3. **Common fixes**:
   - Clear browser cache
   - Try incognito/private browsing
   - Restart development server
   - Wait 2-3 minutes after enabling APIs

### Alternative (Without Google Maps):
Your app works perfectly without Google Maps:
- Location access uses device GPS
- Shows coordinates instead of formatted addresses
- All functionality remains intact

---

## 🎯 WHAT YOU GET WITH GOOGLE MAPS

### With API Key:
- ✅ Interactive maps
- ✅ Formatted addresses ("123 Main St, City, State")
- ✅ Click-to-pin location selection
- ✅ Professional map interface

### Without API Key (Fallback):
- ✅ GPS location access still works
- ✅ Coordinates display ("Lat: 23.8103, Lng: 90.4125")
- ✅ All app features functional
- ✅ Graceful degradation

**Your food delivery app works great either way!** 🚀