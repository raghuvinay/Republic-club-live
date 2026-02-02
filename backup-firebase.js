// FIREBASE BACKUP SCRIPT - Run with: node backup-firebase.js
// Creates a timestamped backup of all matches data

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyAYRukNJGOvVmL2jRAMgLtKkDzU7c6wo88",
  authDomain: "republic-cup-live.firebaseapp.com",
  projectId: "republic-cup-live",
  storageBucket: "republic-cup-live.firebasestorage.app",
  messagingSenderId: "642499294047",
  appId: "1:642499294047:web:f5a8b111b79bb8673abcea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function backupData() {
  console.log('📦 Starting Firebase backup...\n');

  try {
    // Backup matches
    const matchesSnapshot = await getDocs(collection(db, 'matches'));
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by match number
    matches.sort((a, b) => a.matchNumber - b.matchNumber);

    // Create timestamp for filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup_${timestamp}.json`;

    // Write backup file
    fs.writeFileSync(filename, JSON.stringify(matches, null, 2));

    console.log(`✅ Backed up ${matches.length} matches`);
    console.log(`📁 Saved to: ${filename}`);

    // Show summary
    console.log('\n--- Match Summary ---');
    matches.forEach(m => {
      if (m.status === 'ft') {
        console.log(`${m.id}: ${m.scoreHome}-${m.scoreAway} (MoM: ${m.manOfTheMatch})`);
      } else {
        console.log(`${m.id}: ${m.status}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

backupData();
