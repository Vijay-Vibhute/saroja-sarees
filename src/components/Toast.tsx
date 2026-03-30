import React, { useEffect } from 'react';

type Props = {
  message: string;
  actionText1: string;
  actionText2: string;
  onAction1: () => void;
  onAction2: () => void;
  onClose: () => void;
};

export default function Toast({ message, actionText1, actionText2, onAction1, onAction2, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <p>{message}</p>
      <div className="toast-actions">
        <button onClick={onAction1} className="toast-btn toast-btn-primary">{actionText1}</button>
        <button onClick={onAction2} className="toast-btn toast-btn-secondary">{actionText2}</button>
      </div>
    </div>
  );
}
