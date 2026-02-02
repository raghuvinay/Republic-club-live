// RESTORE FROM BACKUP - Run with: node restore-from-backup.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

// Read backup file
const backupData = JSON.parse(fs.readFileSync('./final_firebase_backup.json', 'utf8'));

async function restoreFromBackup() {
  console.log('🔄 Starting restoration from backup...\n');

  for (const match of backupData) {
    try {
      const matchRef = doc(db, 'matches', match.id);

      // Prepare the document data (exclude id as it's the doc key)
      const { id, createdAt, updatedAt, ...matchData } = match;

      await setDoc(matchRef, {
        ...matchData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const status = match.status === 'ft' ? `${match.scoreHome}-${match.scoreAway}` : match.status;
      console.log(`✅ ${match.id}: ${status} (MoM: ${match.manOfTheMatch || 'N/A'})`);
    } catch (error) {
      console.error(`❌ Failed to restore ${match.id}:`, error.message);
    }
  }

  console.log('\n🎉 Restoration from backup complete!');
  console.log('📋 Please verify at: https://raghuvinay.github.io/Republic-club-live/');
  process.exit(0);
}

restoreFromBackup();
