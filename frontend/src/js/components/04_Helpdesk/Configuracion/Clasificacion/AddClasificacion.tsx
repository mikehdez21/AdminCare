import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskDepartamento } from '@/@types/HelpdeskTypes/ticketTypes';
import type { NivelClasificacion } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch } from '@/store/store';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import CamposEsquema from './CamposEsquema';
import { accionesDe, esquemaDe } from './esquemaClasificacion';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nivel: NivelClasificacion;
  /**
   * Id del padre al que pertenece lo nuevo. No se edita, se fija al crear.
   * Opcional porque la categoría no tiene padre: es la raíz de la cadena.
   */
  idPadre?: number;
  departamentos: HelpdeskDepartamento[];
  onCreado?: () => void;
}

/**
 * Alta de cualquiera de los tres niveles. El formulario sale del esquema del
 * nivel, así que no hay un componente por nivel: lo que cambia son los campos.
 */
const AddClasificacion: React.FC<Props> = ({ isOpen, onClose, nivel, idPadre, departamentos, onCreado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const esquema = esquemaDe(nivel, departamentos);
  const [valores, setValores] = useState<Record<string, unknown>>({});
  const [enviando, setEnviando] = useState(false);

  const fijar = (campo: string, valor: unknown) => setValores((v) => ({ ...v, [campo]: valor }));

  const inicial = () => {
    const base: Record<string, unknown> = {};

    for (const campo of esquema.campos) {
      base[campo.nombre] = campo.valorInicial ?? '';
    }

    return base;
  };

  const cerrar = () => {
    setValores(inicial());
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vacio = esquema.campos.find((c) => c.requerido && !String(valores[c.nombre] ?? '').trim());

    if (vacio) {
      Swal.fire({ icon: 'warning', title: 'Falta un campo', text: `Escriba ${vacio.etiqueta.toLowerCase()}.` });

      return;
    }

    setEnviando(true);

    try {
      // El padre no se edita desde aquí: la subcategoría pertenece a su categoría
      // y el título a su subcategoría. La categoría no tiene, y por eso `idPadre`
      // solo se manda si el nivel lo declara.
      const cuerpo = { ...valores, ...(esquema.padreCampo && idPadre !== undefined ? { [esquema.padreCampo]: idPadre } : {}) };

      if (cuerpo.id_departamento_default === '') cuerpo.id_departamento_default = null;

      const resultado = await accionesDe(nivel).crear(dispatch, cuerpo);

      if (!resultado.success) {
        Swal.fire({ icon: 'error', title: `No se pudo crear la ${esquema.singular.toLowerCase()}`, text: resultado.message });

        return;
      }

      Swal.fire({ icon: 'success', title: `${esquema.singular} creada`, timer: 1000, showConfirmButton: false });
      setValores(inicial());
      onCreado?.();
      onClose();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error instanceof Error ? error.message : 'Error inesperado' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={cerrar} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Nueva {esquema.singular.toLowerCase()}</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <CamposEsquema campos={esquema.campos} valores={valores} onCambio={fijar} />

          <ModalButtons
            buttons={[
              { text: 'Guardar', type: 'submit', className: 'button_addedit' },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: cerrar },
            ]}
          />
        </form>

        {enviando && <p className='enviandoNota'>Guardando…</p>}
      </div>
    </Modal>
  );
};

export default AddClasificacion;