import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import qz from 'qz-tray';
import { API_BASE_URL } from '@/variableApi';

declare global {
  interface Window { qz?: any; }
}

export function useQZ() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const initializedRef = useRef(false);

  const setupSecurity = useCallback(() => {
    if (initializedRef.current) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.qz = qz;
    }

    qz.security.setCertificatePromise((resolve, reject) => {
      axios.get(`${API_BASE_URL}/api/HSS1/qz/certificate`, {
        withCredentials: true,
        responseType: 'text',
        headers: { Accept: 'text/plain' },
      })
        .then((response) => resolve(typeof response.data === 'string' ? response.data : String(response.data)))
        .catch((error) => reject(error?.response?.data?.message || error?.message || 'Error cargando certificado QZ'));
    });

    qz.security.setSignatureAlgorithm('SHA512');
    qz.security.setSignaturePromise((toSign: string | string[]) => {
      return (resolve, reject) => {
        axios.post(`${API_BASE_URL}/api/HSS1/qz/sign`, {
          request: toSign,
        }, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
        })
          .then((response) => resolve(typeof response.data === 'string' ? response.data : String(response.data)))
          .catch((error) => reject(error?.response?.data?.message || error?.message || 'Error firmando mensaje QZ'));
      };
    });

    initializedRef.current = true;
  }, []);

  const connect = useCallback(async () => {
    setupSecurity();

    try {
      if (qz.websocket && qz.websocket.isActive && qz.websocket.isActive()) {
        setIsConnected(true);
        return;
      }

      await qz.websocket.connect();
      setIsConnected(true);
    } catch (e) {
      setIsConnected(false);
      throw e;
    }
  }, [setupSecurity]);

  const disconnect = useCallback(async () => {
    if (window.qz && window.qz.websocket && window.qz.websocket.isActive && window.qz.websocket.isActive()) {
      try {
        await window.qz.websocket.disconnect();
      } catch {}
    }
    setIsConnected(false);
  }, []);

  const findPrinters = useCallback(async (): Promise<string[]> => {
    setupSecurity();

    if (!qz) return [];
    try {
      const p = await qz.printers.find();
      if (Array.isArray(p)) return p;
      if (typeof p === 'string') return [p];
      return [];
    } catch {
      return [];
    }
  }, [setupSecurity]);

  const printZPL = useCallback(async (zpl: string, printerName?: string) => {
    setupSecurity();

    if (!qz) throw new Error('QZ Tray client not loaded (window.qz)');
    if (!zpl) throw new Error('ZPL string required');
    if (!printerName) {
      const found = await findPrinters();
      printerName = found[0];
    }
    if (!printerName) throw new Error('Printer name required');

    if (!isConnected) await connect();

    const config = qz.configs.create(printerName);
    return qz.print(config, [zpl]);
  }, [connect, findPrinters, isConnected, setupSecurity]);

  useEffect(() => {
    setupSecurity();

    return () => {
      if (qz && qz.websocket && qz.websocket.isActive && qz.websocket.isActive()) {
        qz.websocket.disconnect().catch(() => {});
      }
    };
  }, [setupSecurity]);

  return { isConnected, connect, disconnect, findPrinters, printZPL };
}
