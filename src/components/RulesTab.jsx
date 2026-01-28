import { useState } from 'react';
import './RulesTab.css';

const RulesTab = () => {
  const [expandedSection, setExpandedSection] = useState('format');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="tab-content">
      {/* Quick Reference Cards */}
      <section className="quick-ref-section animate-slide-up">
        <div className="quick-ref-grid">
          <div className="quick-ref-card">
            <span className="quick-ref-icon">⏱️</span>
            <span className="quick-ref-value">24 min</span>
            <span className="quick-ref-label">Match Duration</span>
          </div>
          <div className="quick-ref-card">
            <span className="quick-ref-icon">👥</span>
            <span className="quick-ref-value">5v5</span>
            <span className="quick-ref-label">Players</span>
          </div>
          <div className="quick-ref-card">
            <span className="quick-ref-icon">🔄</span>
            <span className="quick-ref-value">2</span>
            <span className="quick-ref-label">Substitutes</span>
          </div>
          <div className="quick-ref-card highlight">
            <span className="quick-ref-icon">🚫</span>
            <span className="quick-ref-value">NO</span>
            <span className="quick-ref-label">Offside</span>
          </div>
        </div>
      </section>

      {/* Accordion Sections */}
      <section className="rules-accordion animate-slide-up" style={{ animationDelay: '0.05s' }}>

        {/* Tournament Format */}
        <div className={`accordion-item ${expandedSection === 'format' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('format')}>
            <div className="accordion-title">
              <span className="accordion-icon">⚽</span>
              <span>Tournament Format</span>
            </div>
            <span className="accordion-arrow">▼</span>
          </button>
          <div className="accordion-content">
            <ul className="rules-list-new">
              <li><strong>League Matches:</strong> 12 games</li>
              <li><strong>Final:</strong> 1 game (Top 2 teams)</li>
              <li><strong>Match Duration:</strong> 2 halves of 12 minutes each</li>
              <li><strong>Timekeeping:</strong> Clock stops for all stoppages</li>
            </ul>
          </div>
        </div>

        {/* Points System */}
        <div className={`accordion-item ${expandedSection === 'points' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('points')}>
            <div className="accordion-title">
              <span className="accordion-icon">🏆</span>
              <span>Points & Tie-Breakers</span>
            </div>
            <span className="accordion-arrow">▼</span>
          </button>
          <div className="accordion-content">
            <div className="points-display">
              <div className="point-item win">
                <span className="point-val">3</span>
                <span className="point-lbl">Win</span>
              </div>
              <div className="point-item draw">
                <span className="point-val">1</span>
                <span className="point-lbl">Draw</span>
              </div>
              <div className="point-item loss">
                <span className="point-val">0</span>
                <span className="point-lbl">Loss</span>
              </div>
            </div>
            <div className="tiebreaker-list">
              <span className="tb-title">Tie-Breakers (in order):</span>
              <ol>
                <li>Goal Difference</li>
                <li>Head-to-Head Result</li>
                <li>Goals Scored</li>
                <li>Penalty Kick-Outs</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Fouls & Cards */}
        <div className={`accordion-item ${expandedSection === 'fouls' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('fouls')}>
            <div className="accordion-title">
              <span className="accordion-icon">🟨</span>
              <span>Fouls & Cards</span>
            </div>
            <span className="accordion-arrow">▼</span>
          </button>
          <div className="accordion-content">
            <div className="card-section yellow">
              <span className="card-badge yellow">YELLOW</span>
              <ul>
                <li>Any physical foul</li>
                <li>Deliberate handball</li>
                <li><strong>Any sliding challenge</strong> (automatic)</li>
                <li>Cynical fouls (shirt pulling, obstruction)</li>
              </ul>
            </div>
            <div className="card-section red">
              <span className="card-badge red">RED</span>
              <ul>
                <li>Second yellow card</li>
                <li>Team plays <strong>4v5</strong> for rest of match</li>
                <li>Suspension doesn't carry forward</li>
                <li>Straight red only for dangerous play</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Penalty Kicks */}
        <div className={`accordion-item ${expandedSection === 'penalty' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('penalty')}>
            <div className="accordion-title">
              <span className="accordion-icon">🥅</span>
              <span>Penalty Kicks</span>
            </div>
            <span className="accordion-arrow">▼</span>
          </button>
          <div className="accordion-content">
            <ul className="rules-list-new">
              <li><strong>One step only</strong> - no run-up allowed</li>
              <li><strong>One shot only</strong> - no rebounds, no retakes</li>
              <li>All players must remain behind the kicker</li>
              <li><strong>Shootouts:</strong> 5 players take one kick each</li>
            </ul>
          </div>
        </div>

        {/* Substitutions */}
        <div className={`accordion-item ${expandedSection === 'subs' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('subs')}>
            <div className="accordion-title">
              <span className="accordion-icon">🔄</span>
              <span>Substitutions</span>
            </div>
            <span className="accordion-arrow">▼</span>
          </button>
          <div className="accordion-content">
            <ul className="rules-list-new">
              <li><strong>Rolling substitutions</strong> allowed</li>
              <li>Wait for referee's signal to re-enter</li>
              <li>Enter from <strong>your own half</strong></li>
              <li>If advantage gained: goal kick to opposition</li>
            </ul>
          </div>
        </div>

        {/* General Play */}
        <div className={`accordion-item ${expandedSection === 'general' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('general')}>
            <div className="accordion-title">
              <span className="accordion-icon">📋</span>
              <span>General Play Rules</span>
            </div>
            <span className="accordion-arrow">▼</span>
          </button>
          <div className="accordion-content">
            <ul className="rules-list-new">
              <li>Match starts with a <strong>goal kick</strong></li>
              <li>After every goal: goal kick restart</li>
              <li><strong>No offside</strong> rule</li>
              <li>Cannot score directly from kick-ins, goal kicks, or free kicks</li>
              <li><strong>No throw-ins</strong> - kick-ins only</li>
              <li>Ball placed on ground for all restarts</li>
            </ul>
          </div>
        </div>

      </section>

      {/* Poll Rules - Highlight Card */}
      <section className="rules-page-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rules-page-card highlight-card">
          <div className="rules-page-header">
            <span className="rules-page-icon">🎯</span>
            <h3>Man of the Match Prediction</h3>
            <span className="prize-tag">WIN 1000 COINS</span>
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
                Predictions lock at <strong>2:00 PM</strong> on matchday
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-number">3</span>
              <div className="rule-text">
                Multiple winners <strong>share the prize</strong> equally
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
                Draw match: <strong>Referee decides</strong> Man of the Match
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Play */}
      <section className="fair-play-section animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="fair-play-card">
          <span className="fair-play-icon">🤝</span>
          <p>Play fair. Referee's decision is <strong>final</strong>.</p>
        </div>
      </section>
    </div>
  );
};

export default RulesTab;
