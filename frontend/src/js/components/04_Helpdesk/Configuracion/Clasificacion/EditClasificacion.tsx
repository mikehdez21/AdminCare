import React, { useEffect, useMemo, useState } from 'react';
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
  entidad: Record<string, unknown> | null;
  departamentos: HelpdeskDepartamento[];
  onEditado?: () => void;
}

/** Rellena el formulario con la fila: cada campo del esquema toma su columna. */
function valoresDe(campos: ReturnType<typeof esquemaDe>['campos'], entidad: Record<string, unknown>) {
  const base: Record<string, unknown> = {};

  for (const campo of campos) {
    base[campo.nombre] = entidad[campo.nombre] ?? campo.valorInicial ?? '';
  }

  return base;
}

const EditClasificacion: React.FC<Props> = ({ isOpen, onClose, nivel, entidad, departamentos, onEditado }) => {
  const dispatch = useDispatch<AppDispatch>();

  /**
   * Memorizado, y no por gusto: `esquemaDe` construye un objeto nuevo en cada
   * llamada, así que sin esto la referencia cambia en cada render.
   *
   * El efecto de abajo depende de `esquema` para rellenar el formulario, y con la
   * referencia inestable se ejecutaba en cada render: escribías un carácter, el
   * estado cambiaba, se re-renderizaba y `setValores` volvía a sembrar los valores
   * originales de la fila. Se veía como el campo que se borraba solo y como que
   * los desplegables no tomaran la selección.
   *
   * Solo el nivel de categoría construye el esquema; subcategoría y título
   * devuelven una constante y por eso nunca sufrían el síntoma.
   *
   * `departamentos` viene del store con referencia estable, así que el memo no se
   * invalida en cada render del padre.
   */
  const esquema = useMemo(() => esquemaDe(nivel, departamentos), [nivel, departamentos]);

  const [valores, setValores] = useState<Record<string, unknown>>({});
  const [enviando, setEnviando] = useState(false);

  // Se rellena cada vez que cambia la entidad, no solo al montar: si el control
  // reutiliza el modal para otra fila, mostraría los valores anteriores.
  useEffect(() => {
    if (!entidad) return;

    setValores(valoresDe(esquema.campos, entidad));
  }, [entidad, esquema]);

  if (!entidad) return null;

  const fijar = (campo: string, valor: unknown) => setValores((v) => ({ ...v, [campo]: valor }));

  const campoVacio = esquema.campos.find((campo) => campo.requerido && !String(valores[campo.nombre] ?? '').trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (campoVacio) {
      Swal.fire({ icon: 'warning', title: 'Falta un campo', text: `Escriba ${campoVacio.etiqueta.toLowerCase()}.` });

      return;
    }

    setEnviando(true);

    try {
      // El padre no se reenvía: el backend lo resuelve desde la fila cuando no
      // viene en el payload, y mandarlo haría validar el nombre contra el padre
      // equivocado si alguien cambiara el id a mano.
      const cuerpo = { ...valores };

      if (cuerpo.id_departamento_default === '') cuerpo.id_departamento_default = null;

      const resultado = await accionesDe(nivel).actualizar(dispatch, Number(entidad[esquema.idCampo]), cuerpo);

      if (!resultado.success) {
        Swal.fire({ icon: 'error', title: `No se pudo actualizar la ${esquema.singular.toLowerCase()}`, text: resultado.message });

        return;
      }

      Swal.fire({ icon: 'success', title: `${esquema.singular} actualizada`, timer: 1000, showConfirmButton: false });
      onEditado?.();
      onClose();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error instanceof Error ? error.message : 'Error inesperado' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Editar {esquema.singular.toLowerCase()}</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <CamposEsquema campos={esquema.campos} valores={valores} onCambio={fijar} />

          <ModalButtons
            buttons={[
              { text: 'Guardar', type: 'submit', className: 'button_addedit' },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: onClose },
            ]}
          />
        </form>

        {enviando && <p className='enviandoNota'>Guardando…</p>}
      </div>
    </Modal>
  );
};

export default EditClasificacion;