import { useApp } from '../contexts/AppContext';
import './BottomNav.css';

const BottomNav = () => {
  const { activeTab, setActiveTab, matches } = useApp();

  const liveCount = matches.filter(m => m.status === 'live').length;

  const tabs = [
    {
      id: 'matches',
      label: 'Matches',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
        </svg>
      ),
      badge: liveCount > 0 ? liveCount : null
    },
    {
      id: 'table',
      label: 'Table',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/>
        </svg>
      )
    },
    {
      id: 'polls',
      label: 'Polls',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      )
    },
    {
      id: 'rules',
      label: 'Rules',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    }
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-content">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="nav-icon-wrapper">
              <span className="nav-icon">{tab.icon}</span>
              {tab.badge && (
                <span className="nav-badge">{tab.badge}</span>
              )}
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
