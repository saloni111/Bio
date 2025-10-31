# GHC 2025 Email Capture Backend

A simple Node.js backend service that captures recruiter emails from your bio page and saves them to Google Sheets.

## Setup Instructions

### 1. Google Sheets Setup

1. **Create a Google Sheet:**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "GHC 2025 Recruiter Contacts"
   - Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

2. **Create Google Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable the Google Sheets API
   - Go to "Credentials" → "Create Credentials" → "Service Account"
   - Download the JSON key file
   - Share your Google Sheet with the service account email (give Editor access)

### 2. Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp env-example.txt .env
   ```

3. **Configure .env file:**
   - Add your Google Spreadsheet ID
   - Add your service account email
   - Add your private key (from the JSON file)

4. **Start the server:**
   ```bash
   npm start
   ```

### 3. Deploy to Production

**Option A: Railway (Recommended)**
1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Deploy automatically

**Option B: Heroku**
1. Install Heroku CLI
2. `heroku create your-app-name`
3. Set environment variables: `heroku config:set GOOGLE_SPREADSHEET_ID=your_id`
4. `git push heroku main`

**Option C: Vercel**
1. Install Vercel CLI
2. `vercel`
3. Add environment variables in Vercel dashboard

### 4. Update Frontend

Update the fetch URL in your `app.js` to point to your deployed backend:

```javascript
const response = await fetch('https://your-backend-url.com/api/capture-email', {
```

## API Endpoints

- `POST /api/capture-email` - Captures email data
- `GET /api/health` - Health check

## Data Captured

- Timestamp
- Email address
- Source (ghc25-qr)
- IP Address
- User Agent

## Security Features

- Email validation
- Rate limiting ready
- CORS enabled
- Error handling
- Input sanitization
