import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window { qz?: any; }
}

export function useQZ() {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connect = useCallback(async () => {
    if (!window.qz) throw new Error('QZ Tray client not loaded (window.qz)');
    try {
      if (window.qz.websocket && window.qz.websocket.isActive && window.qz.websocket.isActive()) {
        setIsConnected(true);
        return;
      }
      await window.qz.websocket.connect();
      setIsConnected(true);
    } catch (e) {
      setIsConnected(false);
      throw e;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (window.qz && window.qz.websocket && window.qz.websocket.isActive && window.qz.websocket.isActive()) {
      try {
        await window.qz.websocket.disconnect();
      } catch {}
    }
    setIsConnected(false);
  }, []);

  const findPrinters = useCallback(async (): Promise<string[]> => {
    if (!window.qz) return [];
    try {
      const p = await window.qz.printers.find();
      if (Array.isArray(p)) return p;
      if (typeof p === 'string') return [p];
      return [];
    } catch {
      return [];
    }
  }, []);

  const printZPL = useCallback(async (zpl: string, printerName?: string) => {
    if (!window.qz) throw new Error('QZ Tray client not loaded (window.qz)');
    if (!zpl) throw new Error('ZPL string required');
    if (!printerName) {
      const found = await findPrinters();
      printerName = found[0];
    }
    if (!printerName) throw new Error('Printer name required');

    if (!isConnected) await connect();

    const config = window.qz.configs.create(printerName);
    return window.qz.print(config, [zpl]);
  }, [connect, findPrinters, isConnected]);

  useEffect(() => {
    return () => {
      if (window.qz && window.qz.websocket && window.qz.websocket.isActive && window.qz.websocket.isActive()) {
        window.qz.websocket.disconnect().catch(()=>{});
      }
    };
  }, []);

  return { isConnected, connect, disconnect, findPrinters, printZPL };
}
