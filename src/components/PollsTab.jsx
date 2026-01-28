import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import { submitPrediction, deleteAllPredictions } from '../firebase';
import { formatMatchDate, formatMatchTime } from '../data/schedule';
import './PollsTab.css';

const PollsTab = () => {
  const { getUpcomingMatches, predictions, matches, isAdmin } = useApp();

  // Load saved username from localStorage
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('scapia-poll-username') || '';
  });
  const [matchSelections, setMatchSelections] = useState({});
  const [submittingMatch, setSubmittingMatch] = useState(null);
  const [submittedMatches, setSubmittedMatches] = useState({});
  const [error, setError] = useState('');

  const upcomingMatches = useMemo(() => getUpcomingMatches(), [getUpcomingMatches]);

  // Get players for a specific match
  const getPlayersForMatch = (match) => {
    const homeTeam = TEAMS[match.home];
    const awayTeam = TEAMS[match.away];
    const players = [];

    if (homeTeam) {
      homeTeam.players.forEach(p => {
        players.push({ name: p, team: match.home, teamName: homeTeam.name, teamShort: homeTeam.shortName });
      });
    }

    if (awayTeam) {
      awayTeam.players.forEach(p => {
        players.push({ name: p, team: match.away, teamName: awayTeam.name, teamShort: awayTeam.shortName });
      });
    }

    return players;
  };

  // Save username to localStorage
  const handleUserNameChange = (value) => {
    const cleanValue = value.toLowerCase().replace('@scapia.cards', '').replace(/[^a-z0-9.]/g, '');
    setUserName(cleanValue);
    localStorage.setItem('scapia-poll-username', cleanValue);
  };

  // Get full email
  const getFullEmail = () => userName ? `${userName}@scapia.cards` : '';

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

    setSubmittingMatch(match.id);

    try {
      const players = getPlayersForMatch(match);
      const player = players.find(p => p.name === selectedPlayer);

      await submitPrediction({
        userName: getFullEmail(),
        matchId: match.id,
        matchNumber: match.matchNumber,
        predictedPlayer: selectedPlayer,
        predictedTeam: player?.team,
        predictedTeamName: player?.teamName
      });

      setSubmittedMatches(prev => ({ ...prev, [match.id]: true }));

      // Clear selection after successful submit
      setMatchSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[match.id];
        return newSelections;
      });

      // Reset success after 3 seconds
      setTimeout(() => {
        setSubmittedMatches(prev => ({ ...prev, [match.id]: false }));
      }, 3000);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmittingMatch(null);
    }
  };

  // Check if a match has started (live or finished)
  const isMatchStarted = (matchId) => {
    const match = matches.find(m => m.id === matchId);
    return match && (match.status === 'live' || match.status === 'ft');
  };

  // Get matches with published Man of the Match winners
  const PRIZE_POOL = 1000;
  const winnersHistory = useMemo(() => {
    return matches
      .filter(m => m.momPublishedAt)
      .sort((a, b) => a.matchNumber - b.matchNumber) // Sort 1 to 15
      .map(m => {
        const winners = m.momWinners || [];
        const coinsPerWinner = winners.length > 0 ? Math.floor(PRIZE_POOL / winners.length) : 0;
        return {
          matchNumber: m.matchNumber,
          homeTeam: TEAMS[m.home]?.shortName || m.home,
          awayTeam: TEAMS[m.away]?.shortName || m.away,
          score: `${m.scoreHome}-${m.scoreAway}`,
          manOfTheMatch: m.manOfTheMatch,
          winners,
          coinsPerWinner
        };
      });
  }, [matches]);

  // Count predictions per match
  const getPredictionCount = (matchId) => {
    return predictions.filter(p => p.matchId === matchId).length;
  };

  const totalPredictions = predictions.length;

  return (
    <div className="tab-content">
      {/* Hero Section */}
      <section className="poll-hero animate-slide-up">
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
              <div key={item.matchNumber} className="winner-card">
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
                  {item.winners.length > 0 ? (
                    <div className="winner-info">
                      <div className="winner-names">
                        {item.winners.map((name, idx) => (
                          <span key={idx} className="winner-badge">{name}</span>
                        ))}
                      </div>
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

      {/* User Name Input - Sticky */}
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

      {/* Match Cards for Voting */}
      {upcomingMatches.length > 0 && (
        <section className="vote-cards-section animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="section-header">
            <h2 className="section-title">VOTE FOR EACH MATCH</h2>
            <span className="section-badge">{upcomingMatches.length} matches</span>
          </div>

          <div className="vote-cards-list">
            {upcomingMatches.map(match => {
              const homeTeam = TEAMS[match.home];
              const awayTeam = TEAMS[match.away];
              const players = getPlayersForMatch(match);
              const isLocked = match.predictionsLocked;
              const isSubmitting = submittingMatch === match.id;
              const isSubmitted = submittedMatches[match.id];
              const predCount = getPredictionCount(match.id);

              return (
                <div key={match.id} className={`vote-card ${isLocked ? 'locked' : ''} ${isSubmitted ? 'submitted' : ''}`}>
                  <div className="vote-card-header">
                    <span className="vote-match-num">Match {match.matchNumber}</span>
                    <div className="vote-card-meta">
                      {predCount > 0 && (
                        <span className="vote-count">{predCount} votes</span>
                      )}
                      <span className="vote-match-time">{formatMatchTime(match.time)}</span>
                    </div>
                  </div>

                  <div className="vote-card-teams">
                    <div className="vote-team">
                      {homeTeam?.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="vote-team-logo" />}
                      <span>{homeTeam?.shortName}</span>
                    </div>
                    <span className="vote-vs">vs</span>
                    <div className="vote-team">
                      {awayTeam?.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="vote-team-logo" />}
                      <span>{awayTeam?.shortName}</span>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <div className="vote-success">
                      <span className="success-icon">✓</span> Vote Submitted!
                    </div>
                  ) : isLocked ? (
                    <div className="vote-locked">
                      <span>🔒</span> Voting Closed
                    </div>
                  ) : (
                    <>
                      <select
                        className="vote-player-select"
                        value={matchSelections[match.id] || ''}
                        onChange={(e) => setMatchSelections(prev => ({ ...prev, [match.id]: e.target.value }))}
                      >
                        <option value="">Who will score the most goals?</option>
                        {players.map(player => (
                          <option key={`${match.id}-${player.name}`} value={player.name}>
                            {player.name} ({player.teamShort})
                          </option>
                        ))}
                      </select>

                      <button
                        className="vote-submit-btn"
                        onClick={() => handleSubmitForMatch(match)}
                        disabled={!matchSelections[match.id] || !userName || isSubmitting}
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

      {/* Recent Predictions */}
      {predictions.length > 0 && (
        <section className="recent-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h2 className="section-title">RECENT PREDICTIONS</h2>
            <span className="section-badge">{predictions.length}</span>
          </div>

          <div className="predictions-list">
            {predictions.slice(0, 10).map(pred => (
              <div key={pred.id} className="prediction-item">
                <div className="prediction-user">
                  <span className="user-avatar">{pred.userName?.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{pred.userName}</span>
                </div>
                <div className="prediction-detail">
                  {isMatchStarted(pred.matchId) ? (
                    <span className="predicted-player">{pred.predictedPlayer}</span>
                  ) : (
                    <span className="predicted-player hidden-vote">Hidden</span>
                  )}
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
