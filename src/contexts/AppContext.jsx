import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToMatches, subscribeToPredictions, seedMatches, updateMatchDates } from '../firebase';
import { TEAMS } from '../data/teams';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  // Check admin status from localStorage
  useEffect(() => {
    const adminStatus = localStorage.getItem('republic-cup-admin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Subscribe to Firestore
  useEffect(() => {
    let unsubMatches;
    let unsubPredictions;

    const init = async () => {
      // Seed matches if needed
      await seedMatches();

      // Update dates from 2025 to 2026
      await updateMatchDates();

      // Subscribe to real-time updates
      unsubMatches = subscribeToMatches((data) => {
        setMatches(data);
        setLoading(false);
      });

      unsubPredictions = subscribeToPredictions((data) => {
        setPredictions(data);
      });
    };

    init();

    return () => {
      if (unsubMatches) unsubMatches();
      if (unsubPredictions) unsubPredictions();
    };
  }, []);

  // Admin login/logout
  const loginAdmin = useCallback((pin) => {
    if (pin === '5555') {
      setIsAdmin(true);
      localStorage.setItem('republic-cup-admin', 'true');
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem('republic-cup-admin');
  }, []);

  // Calculate league table
  const calculateTable = useCallback(() => {
    const table = {};

    // Initialize all teams
    Object.keys(TEAMS).forEach(teamId => {
      table[teamId] = {
        teamId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    });

    // Process completed matches (exclude final)
    matches
      .filter(m => m.status === 'ft' && !m.isFinal)
      .forEach(match => {
        const homeTeam = match.home;
        const awayTeam = match.away;
        const homeGoals = match.scoreHome || 0;
        const awayGoals = match.scoreAway || 0;

        if (!table[homeTeam] || !table[awayTeam]) return;

        // Update played
        table[homeTeam].played++;
        table[awayTeam].played++;

        // Update goals
        table[homeTeam].goalsFor += homeGoals;
        table[homeTeam].goalsAgainst += awayGoals;
        table[awayTeam].goalsFor += awayGoals;
        table[awayTeam].goalsAgainst += homeGoals;

        // Determine result
        if (homeGoals > awayGoals) {
          table[homeTeam].won++;
          table[homeTeam].points += 3;
          table[awayTeam].lost++;
        } else if (homeGoals < awayGoals) {
          table[awayTeam].won++;
          table[awayTeam].points += 3;
          table[homeTeam].lost++;
        } else {
          table[homeTeam].drawn++;
          table[awayTeam].drawn++;
          table[homeTeam].points++;
          table[awayTeam].points++;
        }
      });

    // Calculate GD and sort
    return Object.values(table)
      .map(t => ({
        ...t,
        goalDifference: t.goalsFor - t.goalsAgainst
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
  }, [matches]);

  // Calculate top scorers (only from completed matches)
  const calculateTopScorers = useCallback(() => {
    const scorers = {};

    matches
      .filter(m => m.status === 'ft')
      .forEach(match => {
        (match.goals || []).forEach(goal => {
          const key = `${goal.player}-${goal.team}`;
          if (!scorers[key]) {
            scorers[key] = {
              player: goal.player,
              team: goal.team,
              goals: 0
            };
          }
          scorers[key].goals++;
        });
      });

    return Object.values(scorers)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [matches]);

  // Get upcoming matches for polls
  const getUpcomingMatches = useCallback(() => {
    return matches.filter(m => m.status === 'upcoming' && m.home !== 'tbd');
  }, [matches]);

  const value = {
    matches,
    predictions,
    isAdmin,
    loading,
    activeTab,
    setActiveTab,
    loginAdmin,
    logoutAdmin,
    calculateTable,
    calculateTopScorers,
    getUpcomingMatches
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
