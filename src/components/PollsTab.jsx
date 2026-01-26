import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import { submitPrediction } from '../firebase';
import { formatMatchDate, formatMatchTime } from '../data/schedule';
import './PollsTab.css';

const PollsTab = () => {
  const { getUpcomingMatches, predictions } = useApp();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName.trim()) {
      setError('Please enter your name');
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

  // Count predictions by player for current selected match
  const predictionCounts = useMemo(() => {
    if (!selectedMatch) return {};

    const counts = {};
    predictions
      .filter(p => p.matchId === selectedMatch)
      .forEach(p => {
        counts[p.predictedPlayer] = (counts[p.predictedPlayer] || 0) + 1;
      });

    return counts;
  }, [selectedMatch, predictions]);

  return (
    <div className="tab-content">
      {/* Rules Section */}
      <section className="rules-section animate-slide-up">
        <div className="rules-card">
          <div className="rules-header">
            <span className="rules-icon">🏆</span>
            <h3>First Goal Scorer Prediction</h3>
          </div>
          <ul className="rules-list">
            <li>Predict who will score the <strong>first goal</strong> of the match</li>
            <li>Winner receives <strong>1000 coins</strong></li>
            <li>Tie-breaker: Prediction from winning team wins</li>
          </ul>
        </div>
      </section>

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
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
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
                return (
                  <option key={match.id} value={match.id}>
                    M{match.matchNumber}: {homeTeam?.shortName} vs {awayTeam?.shortName} ({formatMatchDate(match.date)})
                  </option>
                );
              })}
            </select>
          </div>

          {selectedMatch && (
            <div className="form-group animate-fade-in">
              <label htmlFor="playerSelect">First Goal Scorer</label>
              <select
                id="playerSelect"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                <option value="">-- Choose a player --</option>
                {availablePlayers.map(player => (
                  <option key={`${player.name}-${player.team}`} value={player.name}>
                    {player.name} ({player.teamName})
                    {predictionCounts[player.name] ? ` - ${predictionCounts[player.name]} votes` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={submitting || !userName || !selectedMatch || !selectedPlayer}
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
    </div>
  );
};

export default PollsTab;
