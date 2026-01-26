import { TEAMS } from '../data/teams';
import './Modal.css';
import './GoalModal.css';

const GoalModal = ({ teamId, isHome, onSelect, onClose }) => {
  const team = TEAMS[teamId];

  if (!team) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content goal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Who Scored?</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="goal-modal-content">
          <div className="goal-team-header">
            <img src={team.logo} alt={team.name} className="goal-team-logo" />
            <span className="goal-team-name">{team.name}</span>
          </div>

          <div className="player-grid">
            {team.players.map(player => (
              <button
                key={player}
                className="player-btn"
                onClick={() => onSelect(player, teamId)}
              >
                <span className="player-initial">{player.charAt(0)}</span>
                <span className="player-name">{player}</span>
              </button>
            ))}

            <button
              className="player-btn own-goal"
              onClick={() => onSelect('Own Goal', teamId)}
            >
              <span className="player-initial">OG</span>
              <span className="player-name">Own Goal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
