import React from 'react';

interface LoginMessagesProps {
  showMessage: boolean;
  message: string;
  setShowMessage: React.Dispatch<React.SetStateAction<boolean>>;
  isSuccess: boolean; // Nueva propiedad para el estado de éxito
}

const LoginMessages: React.FC<LoginMessagesProps> = ({
  showMessage,
  message,
  setShowMessage,
  isSuccess, // Recibir el estado de éxito
}) => {
  return (
    <div className='messagesLogin'>
      {showMessage && (
        <div className={`loginMessageBox ${isSuccess ? 'success' : 'error'}`}>
          <p className="loginMessage">{message}</p>
          <div className={`loginMessageIcon ${isSuccess ? 'success' : 'error'}`} onClick={() => setShowMessage(false)}><div>✖</div></div>
        </div>
      )}
    </div>
  );
};

export default LoginMessages;
