import React from 'react';

import '@styles/00_Utils/ModalButtons.css';

interface ButtonProps {
  text: string;
  type?: 'submit' | 'button' | 'reset';
  className: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface ModalButtonsProps {
  buttons: ButtonProps[];
}

const ModalButtons: React.FC<ModalButtonsProps> = ({ buttons }) => {
  return (
    <div className="modal_buttons">
      {buttons.map((button, index) => (
        <button
          key={index}
          type={button.type || 'button'}
          className={button.className}
          onClick={button.onClick}
          disabled={button.disabled || false}
        >
          {button.text}
        </button>
      ))}
    </div>
  );
};

export default ModalButtons;