import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import { submitPrediction, deleteAllPredictions } from '../firebase';
import { formatMatchDate, formatMatchTime } from '../data/schedule';
import './PollsTab.css';

// Helper to extract name from email for display
const extractName = (email) => {
  if (!email) return '';
  return email.replace('@scapia.cards', '');
};

const PollsTab = () => {
  const { getUpcomingMatches, predictions, matches, isAdmin } = useApp();

  // Load saved username from localStorage
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem('scapia-poll-username') || '';
    return extractName(saved);
  });
  const [matchSelections, setMatchSelections] = useState({});
  const [submittingMatch, setSubmittingMatch] = useState(null);
  const [submittedMatches, setSubmittedMatches] = useState({});
  const [error, setError] = useState('');

  const upcomingMatches = useMemo(() => getUpcomingMatches(), [getUpcomingMatches]);

  // Get full email format
  const getFullEmail = () => userName ? `${userName}@scapia.cards` : '';

  // Get players for a specific match, grouped by team
  const getPlayersForMatch = (match) => {
    const homeTeam = TEAMS[match.home];
    const awayTeam = TEAMS[match.away];

    return {
      home: {
        teamId: match.home,
        teamName: homeTeam?.name,
        teamShort: homeTeam?.shortName,
        logo: homeTeam?.logo,
        players: homeTeam?.players || []
      },
      away: {
        teamId: match.away,
        teamName: awayTeam?.name,
        teamShort: awayTeam?.shortName,
        logo: awayTeam?.logo,
        players: awayTeam?.players || []
      }
    };
  };

  // Save username to localStorage
  const handleUserNameChange = (value) => {
    const cleanValue = value.toLowerCase().replace('@scapia.cards', '').replace(/[^a-z0-9.]/g, '');
    setUserName(cleanValue);
    localStorage.setItem('scapia-poll-username', cleanValue);
  };

  // Check if user already voted for a match
  const getUserPredictionForMatch = (matchId) => {
    if (!userName) return null;
    const fullEmail = getFullEmail();
    return predictions.find(p =>
      p.matchId === matchId && (p.userName === fullEmail || p.userName === userName)
    );
  };

  // Select a player for a match
  const selectPlayer = (matchId, playerName) => {
    setMatchSelections(prev => ({ ...prev, [matchId]: playerName }));
  };

  const handleSubmitForMatch = async (match) => {
    setError('');
    const selectedPlayer = matchSelections[match.id];

    if (!userName.trim()) {
      setError('Please enter your name first');
      return;
    }

    if (!selectedPlayer) {
      setError(`Please select a player for Match ${match.matchNumber}`);
      return;
    }

    if (match.predictionsLocked) {
      setError('Predictions are locked for this match (2 PM cutoff)');
      return;
    }

    if (getUserPredictionForMatch(match.id)) {
      setError(`You already voted for Match ${match.matchNumber}`);
      return;
    }

    setSubmittingMatch(match.id);

    try {
      const teams = getPlayersForMatch(match);
      const isHomePlayer = teams.home.players.includes(selectedPlayer);
      const team = isHomePlayer ? teams.home : teams.away;

      await submitPrediction({
        userName: getFullEmail(),
        matchId: match.id,
        matchNumber: match.matchNumber,
        predictedPlayer: selectedPlayer,
        predictedTeam: team.teamId,
        predictedTeamName: team.teamName
      });

      setSubmittedMatches(prev => ({ ...prev, [match.id]: true }));
      setMatchSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[match.id];
        return newSelections;
      });

      setTimeout(() => {
        setSubmittedMatches(prev => ({ ...prev, [match.id]: false }));
      }, 3000);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmittingMatch(null);
    }
  };

  // Get matches with published Man of the Match winners
  const PRIZE_POOL = 1000;
  const winnersHistory = useMemo(() => {
    return matches
      .filter(m => m.momPublishedAt)
      .sort((a, b) => a.matchNumber - b.matchNumber)
      .map(m => {
        const winners = m.momWinners || [];
        const coinsPerWinner = winners.length > 0 ? Math.floor(PRIZE_POOL / winners.length) : 0;
        return {
          matchNumber: m.matchNumber,
          matchId: m.id,
          homeTeam: TEAMS[m.home]?.shortName || m.home,
          awayTeam: TEAMS[m.away]?.shortName || m.away,
          score: `${m.scoreHome}-${m.scoreAway}`,
          manOfTheMatch: m.manOfTheMatch,
          winners,
          winnersDisplay: winners.map(w => extractName(w)),
          coinsPerWinner
        };
      });
  }, [matches]);

  // Calculate user's total earnings
  const userEarnings = useMemo(() => {
    if (!userName) return { total: 0, wins: [] };
    const fullEmail = getFullEmail();
    let total = 0;
    const wins = [];

    winnersHistory.forEach(item => {
      const isWinner = item.winners.some(w =>
        w === fullEmail || w === userName || extractName(w) === userName
      );
      if (isWinner) {
        total += item.coinsPerWinner;
        wins.push({
          matchNumber: item.matchNumber,
          coins: item.coinsPerWinner
        });
      }
    });

    return { total, wins };
  }, [userName, winnersHistory]);

  // Count predictions per match
  const getPredictionCount = (matchId) => {
    return predictions.filter(p => p.matchId === matchId).length;
  };

  const totalPredictions = predictions.length;

  // Calculate poll leaderboard (total coins won per person) - Top 20
  const pollLeaderboard = useMemo(() => {
    const earnings = {};

    matches.filter(m => m.momPublishedAt && m.momWinners?.length > 0).forEach(match => {
      const coinsPerWinner = Math.floor(PRIZE_POOL / match.momWinners.length);
      match.momWinners.forEach(winner => {
        const cleanName = extractName(winner);
        if (!earnings[cleanName]) {
          earnings[cleanName] = { name: cleanName, coins: 0, wins: 0 };
        }
        earnings[cleanName].coins += coinsPerWinner;
        earnings[cleanName].wins++;
      });
    });

    return Object.values(earnings)
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 20);
  }, [matches]);

  return (
    <div className="tab-content">
      {/* My Earnings Section - Always at Top */}
      {userName && userEarnings.total > 0 && (
        <section className="my-earnings-section animate-slide-up">
          <div className="earnings-card">
            <div className="earnings-header">
              <span className="earnings-icon">💰</span>
              <span className="earnings-title">MY EARNINGS</span>
            </div>
            <div className="earnings-amount">
              <span className="earnings-coins">{userEarnings.total}</span>
              <span className="earnings-label">COINS</span>
            </div>
            <div className="earnings-breakdown">
              {userEarnings.wins.map((win, idx) => (
                <span key={idx} className="earnings-win">
                  M{win.matchNumber}: +{win.coins}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="poll-hero animate-slide-up" style={{ animationDelay: userName && userEarnings.total > 0 ? '0.05s' : '0s' }}>
        <div className="hero-coins-highlight">
          <div className="coins-amount">
            <span className="coins-number">1000</span>
            <span className="coins-label">COINS</span>
          </div>
          <div className="coins-subtext">Every Match!</div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">MAN OF THE MATCH</h1>
          <p className="hero-subtitle">Predict who scores the most goals & win!</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-value">{upcomingMatches.length}</span>
            <span className="stat-label">Matches Open</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="stat-value">{totalPredictions}</span>
            <span className="stat-label">Votes Cast</span>
          </div>
        </div>
        <div className="hero-rules">
          <span>🎯 Pick top scorer</span>
          <span>⏰ Vote by 2 PM</span>
          <span>🏆 Split if tied</span>
        </div>
      </section>

      {/* Winners History */}
      {winnersHistory.length > 0 && (
        <section className="winners-section animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="section-header">
            <h2 className="section-title">WINNERS HALL OF FAME</h2>
            <span className="section-badge trophy-badge">🏆</span>
          </div>

          <div className="winners-list">
            {winnersHistory.map(item => (
              <div key={item.matchNumber} className="winner-card compact">
                <div className="winner-match-info">
                  <span className="winner-match-num">M{item.matchNumber}</span>
                  <span className="winner-teams">{item.homeTeam} vs {item.awayTeam}</span>
                  <span className="winner-score">{item.score}</span>
                </div>
                <div className="winner-details">
                  <div className="mom-player">
                    <span className="mom-label">MoM:</span>
                    <span className="mom-name">{item.manOfTheMatch}</span>
                  </div>
                  {item.winnersDisplay.length > 0 ? (
                    <div className="winner-info">
                      {item.winnersDisplay.length <= 3 ? (
                        <div className="winner-names">
                          {item.winnersDisplay.map((name, idx) => (
                            <span key={idx} className="winner-badge">{name}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="winner-names compact-winners">
                          {item.winnersDisplay.slice(0, 2).map((name, idx) => (
                            <span key={idx} className="winner-badge">{name}</span>
                          ))}
                          <span className="winner-badge more-badge">+{item.winnersDisplay.length - 2} more</span>
                        </div>
                      )}
                      <span className="coins-earned">{item.coinsPerWinner} coins each</span>
                    </div>
                  ) : (
                    <span className="no-winners">No correct predictions</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* User Name Input */}
      <section className="poll-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <h2 className="section-title">MAKE YOUR PREDICTION</h2>
        </div>

        {error && (
          <div className="error-message animate-scale-in">
            {error}
          </div>
        )}

        <div className="user-input-card">
          <label htmlFor="userName">Your Name</label>
          <div className="email-input-wrapper">
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => handleUserNameChange(e.target.value)}
              placeholder="yourname"
              maxLength={30}
            />
            <span className="email-domain">@scapia.cards</span>
          </div>
          {userName && (
            <p className="email-preview">Voting as: <strong>{getFullEmail()}</strong></p>
          )}
        </div>
      </section>

      {/* Match Cards for Voting - New Tap-friendly Design */}
      {upcomingMatches.length > 0 && (
        <section className="vote-cards-section animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="section-header">
            <h2 className="section-title">VOTE FOR EACH MATCH</h2>
            <span className="section-badge">{upcomingMatches.length} matches</span>
          </div>

          <div className="vote-cards-list">
            {upcomingMatches.map(match => {
              const teams = getPlayersForMatch(match);
              const isLocked = match.predictionsLocked;
              const isSubmitting = submittingMatch === match.id;
              const isSubmitted = submittedMatches[match.id];
              const predCount = getPredictionCount(match.id);
              const existingVote = getUserPredictionForMatch(match.id);
              const hasVoted = !!existingVote;
              const selectedPlayer = matchSelections[match.id];

              return (
                <div key={match.id} className={`vote-card ${isLocked ? 'locked' : ''} ${isSubmitted || hasVoted ? 'submitted' : ''}`}>
                  <div className="vote-card-header">
                    <span className="vote-match-num">Match {match.matchNumber}</span>
                    <div className="vote-card-meta">
                      {predCount > 0 && (
                        <span className="vote-count">{predCount} votes</span>
                      )}
                      <span className="vote-match-time">{formatMatchTime(match.time)}</span>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <div className="vote-success">
                      <span className="success-icon">✓</span> Vote Submitted!
                    </div>
                  ) : hasVoted ? (
                    <div className="vote-success already-voted">
                      <span className="success-icon">✓</span> You picked: <strong>{existingVote.predictedPlayer}</strong>
                    </div>
                  ) : isLocked ? (
                    <div className="vote-locked">
                      <span>🔒</span> Voting Closed
                    </div>
                  ) : (
                    <>
                      {/* Team-based player selection */}
                      <div className="player-selection">
                        {/* Home Team */}
                        <div className="team-players-section">
                          <div className="team-players-header">
                            {teams.home.logo && <img src={teams.home.logo} alt={teams.home.teamName} className="team-players-logo" />}
                            <span className="team-players-name">{teams.home.teamShort}</span>
                          </div>
                          <div className="player-chips">
                            {teams.home.players.map(player => (
                              <button
                                key={`${match.id}-${player}`}
                                className={`player-chip ${selectedPlayer === player ? 'selected' : ''}`}
                                onClick={() => selectPlayer(match.id, player)}
                              >
                                {player}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Away Team */}
                        <div className="team-players-section">
                          <div className="team-players-header">
                            {teams.away.logo && <img src={teams.away.logo} alt={teams.away.teamName} className="team-players-logo" />}
                            <span className="team-players-name">{teams.away.teamShort}</span>
                          </div>
                          <div className="player-chips">
                            {teams.away.players.map(player => (
                              <button
                                key={`${match.id}-${player}`}
                                className={`player-chip ${selectedPlayer === player ? 'selected' : ''}`}
                                onClick={() => selectPlayer(match.id, player)}
                              >
                                {player}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {selectedPlayer && (
                        <div className="selected-player-display">
                          Your pick: <strong>{selectedPlayer}</strong>
                        </div>
                      )}

                      <button
                        className="vote-submit-btn"
                        onClick={() => handleSubmitForMatch(match)}
                        disabled={!selectedPlayer || !userName || isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Poll Leaderboard */}
      {pollLeaderboard.length > 0 && (
        <section className="poll-leaderboard-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h2 className="section-title">POLL LEADERBOARD</h2>
            <span className="section-badge coins-badge">💰 TOP 20</span>
          </div>

          <div className="leaderboard-list">
            {pollLeaderboard.map((player, index) => (
              <div
                key={player.name}
                className={`leaderboard-row ${index === 0 ? 'leader' : ''} ${player.name === userName ? 'is-me' : ''}`}
              >
                <span className="leaderboard-rank">
                  {index === 0 ? '💰' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </span>
                <div className="leaderboard-info">
                  <span className="leaderboard-name">{player.name}</span>
                  <span className="leaderboard-wins">{player.wins} win{player.wins !== 1 ? 's' : ''}</span>
                </div>
                <span className="leaderboard-coins">{player.coins}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Predictions */}
      {predictions.length > 0 && (
        <section className="recent-section animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="section-header">
            <h2 className="section-title">RECENT PREDICTIONS</h2>
            <span className="section-badge">{predictions.length}</span>
          </div>

          <div className="predictions-list">
            {predictions.slice(0, 10).map(pred => (
              <div key={pred.id} className="prediction-item">
                <div className="prediction-user">
                  <span className="user-avatar">{extractName(pred.userName)?.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{extractName(pred.userName)}</span>
                </div>
                <div className="prediction-detail">
                  <span className="predicted-player">{pred.predictedPlayer}</span>
                  <span className="predicted-match">Match {pred.matchNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔮</div>
          <h3>No Upcoming Matches</h3>
          <p>Predictions open before each match!</p>
        </div>
      )}

      {/* Admin Controls */}
      {isAdmin && predictions.length > 0 && (
        <section className="admin-poll-section animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <h2 className="section-title">ADMIN CONTROLS</h2>
          </div>
          <button
            className="delete-all-btn"
            onClick={async () => {
              if (window.confirm(`Delete all ${predictions.length} predictions? This cannot be undone.`)) {
                await deleteAllPredictions();
              }
            }}
          >
            Delete All Predictions ({predictions.length})
          </button>
        </section>
      )}
    </div>
  );
};

export default PollsTab;
