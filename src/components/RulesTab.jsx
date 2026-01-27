import './RulesTab.css';

const RulesTab = () => {
  return (
    <div className="tab-content">
      {/* Tournament Format */}
      <section className="rules-page-section animate-slide-up">
        <div className="rules-page-card">
          <div className="rules-page-header">
            <span className="rules-page-icon">⚽</span>
            <h3>Tournament Format</h3>
          </div>
          <div className="rules-page-content">
            <div className="rule-item">
              <span className="rule-number">1</span>
              <div className="rule-text">
                <strong>Group Stage:</strong> All 4 teams play each other (6 matches per team)
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-number">2</span>
              <div className="rule-text">
                <strong>Final:</strong> Top 2 teams qualify for the final match
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-number">3</span>
              <div className="rule-text">
                <strong>Match Duration:</strong> As per tournament regulations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Points System */}
      <section className="rules-page-section animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="rules-page-card">
          <div className="rules-page-header">
            <span className="rules-page-icon">🏆</span>
            <h3>Points System</h3>
          </div>
          <div className="points-grid">
            <div className="points-item">
              <span className="points-value">3</span>
              <span className="points-label">Win</span>
            </div>
            <div className="points-item">
              <span className="points-value">1</span>
              <span className="points-label">Draw</span>
            </div>
            <div className="points-item">
              <span className="points-value">0</span>
              <span className="points-label">Loss</span>
            </div>
          </div>
          <div className="rules-page-content">
            <div className="rule-item">
              <span className="rule-number">TB</span>
              <div className="rule-text">
                <strong>Tie-breaker order:</strong> Points &rarr; Goal Difference &rarr; Goals Scored
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Poll Rules */}
      <section className="rules-page-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rules-page-card highlight-card">
          <div className="rules-page-header">
            <span className="rules-page-icon">🎯</span>
            <h3>Man of the Match Prediction</h3>
          </div>
          <div className="rules-page-content">
            <div className="rule-item">
              <span className="rule-number">1</span>
              <div className="rule-text">
                Predict who will score the <strong>most goals</strong> in each match
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-number">2</span>
              <div className="rule-text">
                Prize pool: <strong>1000 coins</strong> per match
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-number">3</span>
              <div className="rule-text">
                Multiple winners share the prize equally
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-number">4</span>
              <div className="rule-text">
                Tie-breaker: Player from <strong>winning team</strong> wins
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-number">5</span>
              <div className="rule-text">
                If match is a draw, <strong>referee decides</strong> Man of the Match
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="rules-page-section animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="rules-page-card terms-card">
          <div className="rules-page-header">
            <span className="rules-page-icon">📋</span>
            <h3>Terms & Conditions</h3>
          </div>
          <div className="rules-page-content">
            <div className="rule-item">
              <span className="rule-bullet"></span>
              <div className="rule-text">
                Only your <strong>first entry</strong> per match will be considered
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-bullet"></span>
              <div className="rule-text">
                Predictions lock at <strong>2:00 PM</strong> on matchday (admin controlled)
              </div>
            </div>
            <div className="rule-item warning">
              <span className="rule-bullet warning"></span>
              <div className="rule-text">
                <strong>Players & managers</strong> are NOT allowed to participate in polls
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-bullet"></span>
              <div className="rule-text">
                Winners are announced after Man of the Match is confirmed
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-bullet"></span>
              <div className="rule-text">
                Admin decision on all matters is final
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Play */}
      <section className="rules-page-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="rules-page-card">
          <div className="rules-page-header">
            <span className="rules-page-icon">🤝</span>
            <h3>Fair Play</h3>
          </div>
          <div className="rules-page-content">
            <div className="rule-item">
              <span className="rule-bullet"></span>
              <div className="rule-text">
                Respect all players, referees, and spectators
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-bullet"></span>
              <div className="rule-text">
                No abusive language or unsportsmanlike conduct
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-bullet"></span>
              <div className="rule-text">
                Play in the spirit of the game
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RulesTab;
