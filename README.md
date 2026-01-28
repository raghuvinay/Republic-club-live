# Republic Cup 2026 - Live Scorer & Polls

A real-time football tournament tracking system built with React + Firebase Firestore. Features live match updates, auto-calculating league tables, top scorers leaderboard, and prediction polls.

![Republic Cup](https://img.shields.io/badge/Republic%20Cup-2026-FF005A?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGRDcwMCIgZD0iTTEyIDJMOSA5SDJMNyAxM0w1IDIwTDEyIDE2TDE5IDIwTDE3IDEzTDIyIDlIMTVMMTIgMloiLz48L3N2Zz4=)

## Features

- **Live Matches**: Real-time score updates with live status indicators
- **League Table**: Auto-calculated standings (Points, GD, Goals)
- **Top Scorers**: Golden Boot leaderboard
- **Prediction Polls**: First goal scorer predictions with rewards
- **Admin Panel**: PIN-protected match management (hidden access)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase Firestore (real-time sync)
- **Styling**: CSS3 with CSS Variables
- **Fonts**: Bebas Neue + Montserrat
- **Deployment**: GitHub Pages

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/republic-cup-live.git
cd republic-cup-live
npm install
```

### 2. Firebase Setup

1. Create a new project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database (Start in test mode)
3. Get your config from Project Settings > Web App
4. Update `src/firebase.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

Go to Firestore > Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Matches - read anyone, write requires auth (or remove for testing)
    match /matches/{matchId} {
      allow read: if true;
      allow write: if true; // For admin panel - secure in production
    }

    // Predictions - anyone can read/write
    match /predictions/{predictionId} {
      allow read, write: if true;
    }
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Deploy to GitHub Pages

```bash
# Update vite.config.js base URL to your repo name
# base: '/your-repo-name/'

npm run deploy
```

Or push to `main` branch - GitHub Actions will auto-deploy.

## Admin Access

1. Triple-tap the version number (v1.0) in the header
2. Enter PIN: `1234`
3. Edit buttons appear on match cards
4. Admin mode persists via localStorage

### Admin Controls

- **Status**: Set match to Upcoming / Live / Full Time
- **Goals**: Add goals with player selection
- **Remove**: Undo last goal for each team
- **Reset**: Clear score to 0-0

## Tournament Data

### Teams
- Feel United (White)
- Dhurandhars (Black)
- The Goaldiggers (Sky Blue)
- Userflow United (Red)

### Schedule (13 Matches)
- Jan 29: 4 matches (17:00 - 19:00)
- Jan 30: 5 matches (18:00 - 20:00)
- Feb 2: 4 matches including FINAL (18:00 - 19:30)

## Project Structure

```
src/
├── components/         # React components
│   ├── Header.jsx     # App header with admin access
│   ├── BottomNav.jsx  # Navigation tabs
│   ├── MatchCard.jsx  # Match display card
│   ├── MatchesTab.jsx # Matches list view
│   ├── TableTab.jsx   # Standings & top scorers
│   ├── PollsTab.jsx   # Prediction form
│   └── Admin*.jsx     # Admin modals
├── contexts/
│   └── AppContext.jsx # Global state & Firebase sync
├── data/
│   ├── teams.js       # Team data & logos
│   └── schedule.js    # Match schedule
├── firebase.js        # Firebase config & functions
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Customization

### Colors (src/index.css)
```css
:root {
  --primary-purple: #38003C;
  --primary-pink: #FF005A;
  --success-green: #00ff88;
}
```

### Teams (src/data/teams.js)
Update team names, logos, and player rosters.

### Schedule (src/data/schedule.js)
Modify match dates, times, and matchups.

## License

MIT License - Built for Republic Cup 2026
