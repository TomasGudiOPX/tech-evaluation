import { FormEvent, useEffect } from 'react';
import type { AuthMode } from '../types';
import { AuthPanel } from './AuthPanel';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isBusy: boolean;
  error?: string;
  authenticate: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function AuthModal({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  isBusy,
  error,
  authenticate,
}: AuthModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close authentication modal">
          &times;
        </button>

        <AuthPanel
          authMode={authMode}
          setAuthMode={setAuthMode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isBusy={isBusy}
          error={error}
          authenticate={authenticate}
        />
      </div>
    </div>
  );
}
