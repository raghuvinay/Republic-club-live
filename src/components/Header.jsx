import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import PinModal from './PinModal';
import './Header.css';

const Header = () => {
  const { isAdmin, logoutAdmin } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleVersionClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setShowPinModal(true);
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <img
              src="https://res.cloudinary.com/scapiacards/image/upload/q_85/v1769249500/spitha_prod_uploads/2026_01/logo_1769249499164.webp"
              alt="Scapia Offside"
              className="header-logo"
            />
            <div className="header-title-group">
              <h1 className="header-title">SCAPIA OFFSIDE</h1>
              <span className="header-year">2026</span>
            </div>
          </div>

          <div className="header-actions">
            {isAdmin && (
              <button className="admin-badge" onClick={logoutAdmin}>
                ADMIN
              </button>
            )}
            <span className="version-tag" onClick={handleVersionClick}>v1.0</span>
          </div>
        </div>

        {isAdmin && (
          <div className="admin-banner">
            Admin Mode Active - You can edit matches
          </div>
        )}
      </header>

      {showPinModal && <PinModal onClose={() => setShowPinModal(false)} />}
    </>
  );
};

export default Header;