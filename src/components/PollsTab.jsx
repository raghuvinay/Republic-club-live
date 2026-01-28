import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import { submitPrediction, deleteAllPredictions } from '../firebase';
import { formatMatchDate, formatMatchTime } from '../data/schedule';
import './PollsTab.css';

const PollsTab = () => {
  const { getUpcomingMatches, predictions, matches, isAdmin } = useApp();

  const [userName, setUserName] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const upcomingMatches = useMemo(() => getUpcomingMatches(), [getUpcomingMatches]);

  // Get players for selected match
  const availablePlayers = useMemo(() => {
    if (!selectedMatch) return [];

    const match = upcomingMatches.find(m => m.id === selectedMatch);
    if (!match) return [];

    const homeTeam = TEAMS[match.home];
    const awayTeam = TEAMS[match.away];

    const players = [];

    if (homeTeam) {
      homeTeam.players.forEach(p => {
        players.push({ name: p, team: match.home, teamName: homeTeam.name });
      });
    }

    if (awayTeam) {
      awayTeam.players.forEach(p => {
        players.push({ name: p, team: match.away, teamName: awayTeam.name });
      });
    }

    return players;
  }, [selectedMatch, upcomingMatches]);

  // Check if selected match has locked predictions
  const isMatchLocked = useMemo(() => {
    if (!selectedMatch) return false;
    const match = matches.find(m => m.id === selectedMatch);
    return match?.predictionsLocked === true;
  }, [selectedMatch, matches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName.trim()) {
      setError('Please enter your Scapia email');
      return;
    }

    if (!userName.trim().endsWith('@scapia.cards')) {
      setError('Please use your Scapia email (@scapia.cards)');
      return;
    }

    if (!selectedMatch) {
      setError('Please select a match');
      return;
    }

    if (!selectedPlayer) {
      setError('Please select a player');
      return;
    }

    // Check if predictions are locked
    const matchData = matches.find(m => m.id === selectedMatch);
    if (matchData?.predictionsLocked) {
      setError('Predictions are locked for this match (2 PM cutoff)');
      return;
    }

    setSubmitting(true);

    try {
      const player = availablePlayers.find(p => p.name === selectedPlayer);
      const match = upcomingMatches.find(m => m.id === selectedMatch);

      await submitPrediction({
        userName: userName.trim(),
        matchId: selectedMatch,
        matchNumber: match?.matchNumber,
        predictedPlayer: selectedPlayer,
        predictedTeam: player?.team,
        predictedTeamName: player?.teamName
      });

      setSubmitted(true);
      setUserName('');
      setSelectedMatch('');
      setSelectedPlayer('');

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit prediction. Please try again.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="tab-content">
      {/* Rules Section */}
      <section className="rules-section animate-slide-up">
        <div className="rules-card">
          <div className="rules-header">
            <span className="rules-icon">🏆</span>
            <h3>Man of the Match Prediction</h3>
          </div>
          <div className="rules-structured">
            <div className="rule-group">
              <h4 className="rule-group-title">How to Win</h4>
              <ul className="rules-list">
                <li>Predict who will score the <strong>most goals</strong> in the match</li>
                <li>Prize pool: <strong>1000 coins</strong> per match</li>
                <li>Multiple winners split the prize equally</li>
              </ul>
            </div>
            <div className="rule-group">
              <h4 className="rule-group-title">Tie-breakers</h4>
              <ul className="rules-list">
                <li>If tied on goals, player from <strong>winning team</strong> wins</li>
                <li>If match is a draw, <strong>referee decides</strong> MoM</li>
              </ul>
            </div>
            <div className="rule-group">
              <h4 className="rule-group-title">Terms & Conditions</h4>
              <ul className="rules-list">
                <li>Only your <strong>first entry</strong> per match counts</li>
                <li>Predictions lock at <strong>2:00 PM</strong> on matchday</li>
              </ul>
            </div>
          </div>
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

      {/* Prediction Form */}
      <section className="poll-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <h2 className="section-title">MAKE YOUR PREDICTION</h2>
        </div>

        {submitted && (
          <div className="success-message animate-scale-in">
            <span className="success-icon">✓</span>
            Prediction submitted successfully!
          </div>
        )}

        {error && (
          <div className="error-message animate-scale-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="poll-form">
          <div className="form-group">
            <label htmlFor="userName">Scapia Email</label>
            <input
              type="email"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value.toLowerCase())}
              placeholder="yourname@scapia.cards"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="matchSelect">Select Match</label>
            <select
              id="matchSelect"
              value={selectedMatch}
              onChange={(e) => {
                setSelectedMatch(e.target.value);
                setSelectedPlayer('');
              }}
            >
              <option value="">-- Choose a match --</option>
              {upcomingMatches.map(match => {
                const homeTeam = TEAMS[match.home];
                const awayTeam = TEAMS[match.away];
                const locked = match.predictionsLocked;
                return (
                  <option key={match.id} value={match.id} disabled={locked}>
                    M{match.matchNumber}: {homeTeam?.shortName} vs {awayTeam?.shortName} ({formatMatchDate(match.date)}){locked ? ' [LOCKED]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedMatch && (
            <div className="form-group animate-fade-in">
              <label htmlFor="playerSelect">Man of the Match</label>
              <select
                id="playerSelect"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                <option value="">-- Choose a player --</option>
                {availablePlayers.map(player => (
                  <option key={`${player.name}-${player.team}`} value={player.name}>
                    {player.name} ({player.teamName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={submitting || !userName || !selectedMatch || !selectedPlayer || isMatchLocked}
          >
            {submitting ? (
              <span className="button-loading">
                <span className="loading-spinner small"></span>
                Submitting...
              </span>
            ) : (
              'Submit Prediction'
            )}
          </button>
        </form>
      </section>

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
