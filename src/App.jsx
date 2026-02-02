import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MatchesTab from './components/MatchesTab';
import TableTab from './components/TableTab';
import PollsTab from './components/PollsTab';
import RulesTab from './components/RulesTab';
import TrophyTab from './components/TrophyTab';
import './App.css';

const AppContent = () => {
  const { activeTab, loading } = useApp();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">LOADING SCAPIA OFFSIDE...</span>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        {activeTab === 'trophy' && <TrophyTab />}
        {activeTab === 'matches' && <MatchesTab />}
        {activeTab === 'table' && <TableTab />}
        {activeTab === 'polls' && <PollsTab />}
        {activeTab === 'rules' && <RulesTab />}
      </main>

      <BottomNav />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
