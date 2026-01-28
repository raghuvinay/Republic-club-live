import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { INITIAL_MATCHES } from './data/schedule';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYRukNJGOvVmL2jRAMgLtKkDzU7c6wo88",
  authDomain: "republic-cup-live.firebaseapp.com",
  projectId: "republic-cup-live",
  storageBucket: "republic-cup-live.firebasestorage.app",
  messagingSenderId: "642499294047",
  appId: "1:642499294047:web:f5a8b111b79bb8673abcea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
export const matchesCollection = collection(db, 'matches');
export const predictionsCollection = collection(db, 'predictions');

// Seed matches if collection is empty
export const seedMatches = async () => {
  try {
    const snapshot = await getDocs(matchesCollection);
    if (snapshot.empty) {
      console.log('Seeding matches collection...');
      for (const match of INITIAL_MATCHES) {
        await setDoc(doc(db, 'matches', match.id), {
          ...match,
          createdAt: serverTimestamp()
        });
      }
      console.log('Matches seeded successfully!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding matches:', error);
    return false;
  }
};

// Subscribe to matches (real-time)
export const subscribeToMatches = (callback) => {
  const q = query(matchesCollection, orderBy('matchNumber'));
  return onSnapshot(q, (snapshot) => {
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(matches);
  }, (error) => {
    console.error('Error subscribing to matches:', error);
  });
};

// Update match
export const updateMatch = async (matchId, updates) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating match:', error);
    return false;
  }
};

// Add goal to match
export const addGoal = async (matchId, goal, currentGoals, isHome) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const newGoal = {
      ...goal,
      timestamp: new Date().toISOString()
    };

    const updates = {
      goals: [...currentGoals, newGoal],
      updatedAt: serverTimestamp()
    };

    if (isHome) {
      updates.scoreHome = currentGoals.filter(g => g.team === goal.team).length + 1;
    } else {
      updates.scoreAway = currentGoals.filter(g => g.team === goal.team).length + 1;
    }

    // Recalculate scores based on goals
    const allGoals = [...currentGoals, newGoal];

    await updateDoc(matchRef, {
      goals: allGoals,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error adding goal:', error);
    return false;
  }
};

// Submit prediction
export const submitPrediction = async (prediction) => {
  try {
    await addDoc(predictionsCollection, {
      ...prediction,
      submittedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error submitting prediction:', error);
    return false;
  }
};

// Subscribe to predictions
export const subscribeToPredictions = (callback) => {
  const q = query(predictionsCollection, orderBy('submittedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const predictions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(predictions);
  });
};

// Delete all predictions
export const deleteAllPredictions = async () => {
  try {
    const snapshot = await getDocs(predictionsCollection);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('All predictions deleted');
    return true;
  } catch (error) {
    console.error('Error deleting predictions:', error);
    return false;
  }
};

// Delete a single prediction
export const deletePrediction = async (predictionId) => {
  try {
    await deleteDoc(doc(db, 'predictions', predictionId));
    console.log('Prediction deleted:', predictionId);
    return true;
  } catch (error) {
    console.error('Error deleting prediction:', error);
    return false;
  }
};

export { db };
