import React from 'react';
import ReactModal from 'react-modal';

import '@styles/00_Utils/ui/Modal.css';

// Llamar setAppElement UNA sola vez a nivel de módulo (no por instancia)
ReactModal.setAppElement('#root');

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  /** className opcional. Si se omite, se aplica la clase base 'ui-modal'
   *  (basada en las variables --modal-* de resources/css/app.css).
   *  Si se pasa un className (p. ej. 'modalComponent_AlmacenAF'),
   *  se respeta tal cual para NO romper los estilos existentes. */
  className?: string;
  contentLabel?: string;
  ariaHideApp?: boolean;
  /** Passthrough de react-modal. Si se omiten, aplican los defaults de react-modal
   *  (ESC cierra y el clic en overlay cierra), preservando el comportamiento previo. */
  shouldCloseOnEsc?: boolean;
  shouldCloseOnOverlayClick?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  className = '',
  contentLabel,
  ariaHideApp = true,
  shouldCloseOnEsc,
  shouldCloseOnOverlayClick,
  children,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={className || 'ui-modal'}
      contentLabel={contentLabel}
      ariaHideApp={ariaHideApp}
      shouldCloseOnEsc={shouldCloseOnEsc}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;