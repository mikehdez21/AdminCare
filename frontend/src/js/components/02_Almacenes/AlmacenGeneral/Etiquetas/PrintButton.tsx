import React from 'react';
import { useQZ } from '@/hooks/useQZ';

interface Props {
  zpl: string;
  printerName?: string;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

const PrintButton: React.FC<Props> = ({ zpl, printerName, onSuccess, onError }) => {
  const { isConnected, connect, printZPL } = useQZ();

  const handleClick = async () => {
    try {
      if (!isConnected) await connect();
      await printZPL(zpl, printerName);
      onSuccess && onSuccess();
    } catch (err: any) {
      onError && onError(err);
    }
  };

  return (
    <button onClick={handleClick} className="btnImprimirZebra">
      Imprimir etiqueta (local)
    </button>
  );
};

export default PrintButton;
