import { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import './Modal.css';

const PinModal = ({ onClose }) => {
  const { loginAdmin } = useApp();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all filled
    if (value && index === 3) {
      const fullPin = newPin.join('');
      setTimeout(() => {
        if (loginAdmin(fullPin)) {
          onClose();
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin(['', '', '', '']);
            inputRefs[0].current?.focus();
          }, 500);
        }
      }, 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pasted)) {
      const newPin = pasted.split('').concat(['', '', '', '']).slice(0, 4);
      setPin(newPin);
      if (newPin[3]) {
        setTimeout(() => {
          if (loginAdmin(newPin.join(''))) {
            onClose();
          } else {
            setError(true);
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin(['', '', '', '']);
              inputRefs[0].current?.focus();
            }, 500);
          }
        }, 100);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content pin-modal ${shake ? 'shake' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Admin Access</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="pin-content">
          <p className="pin-label">Enter 4-digit PIN</p>

          <div className="pin-inputs" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`pin-input ${error ? 'error' : ''}`}
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <p className="pin-error">Incorrect PIN. Try again.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinModal;
