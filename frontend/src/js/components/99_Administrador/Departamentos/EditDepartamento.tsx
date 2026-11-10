import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { Departamentos } from '@/@types/mainTypes';
import { editDepartamento } from '@/store/administrador/Departamentos/departamentosActions';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Departamentos/modalDepartamentos.css'


interface EditDepartamentoProps {
  isOpen: boolean;
  onClose: () => void;
  departamentoToEdit: Departamentos | null;
}

Modal.setAppElement('#root');

const EditDepartamento: React.FC<EditDepartamentoProps> = ({ isOpen, onClose, departamentoToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  const [nombreDepartamento, setNombreDepartamento] = useState<string>('');
  const [descripcionDepartamento, setDescripcionDepartamento] = useState<string>('');
  const [atiendePacientes, setAtiendePacientes] = useState<boolean>(false);
  const [atiendeHelpdesk, setAtiendeHelpdesk] = useState<boolean>(false);
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);

  useEffect(() => {
    if (departamentoToEdit) {
      setNombreDepartamento(departamentoToEdit.nombre_departamento);
      setDescripcionDepartamento(departamentoToEdit.descripcion);
      setAtiendePacientes(departamentoToEdit.atiende_pacientes);
      setAtiendeHelpdesk(departamentoToEdit.atiende_helpdesk ?? false);
      setEstatusActivo(departamentoToEdit.estatus_activo);
    }
  }, [departamentoToEdit]); // Solo se ejecuta cuando departamentoToEdit cambia

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

      const departamentoEditado: Departamentos = {
        id_departamento: departamentoToEdit?.id_departamento, // Mantener el ID del departamento
        nombre_departamento: nombreDepartamento,
        descripcion: descripcionDepartamento,
        atiende_pacientes: atiendePacientes,
        atiende_helpdesk: atiendeHelpdesk,
        estatus_activo: estatusActivo


      };

      const formData = new FormData();

      formData.append('id_departamento', departamentoEditado.id_departamento!.toString());
      formData.append('nombre_departamento', departamentoEditado.nombre_departamento);
      formData.append('descripcion', departamentoEditado.descripcion);
      formData.append('atiende_pacientes', departamentoEditado.atiende_pacientes ? '1' : '0');
      formData.append('atiende_helpdesk', departamentoEditado.atiende_helpdesk ? '1' : '0');
      formData.append('estatus_activo', departamentoEditado.estatus_activo ? '1' : '0');


      console.log('dataDepartamento_Enviada: ', departamentoToEdit)
      const resultAction = await dispatch(editDepartamento(departamentoEditado)).unwrap();
      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        setNombreDepartamento('')
        setDescripcionDepartamento('')

        Swal.fire({
          icon: 'success',
          title: 'Departamento Editado',
          text: 'El departamento ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición

        return;
      }

      Swal.fire({
        icon: 'error',
        title: 'No se pudo editar el departamento',
        text: resultAction.message || 'Hubo un problema al editar el departamento.',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error al editar el departamento:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el departamento. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };



  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modalDepartamentos"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalDepartamentos" >
        <h2>Editar Departamento</h2>
        <form onSubmit={handleSubmit} className="formDepartamentos">

          <div className='dataInputs_Departamentos'>

            <section className='leftDiv_Inputs'>

              <label>
                      *Departamento:
                <input
                  type="text"
                  value={nombreDepartamento}
                  id='nombreDepartamento'
                  name='nombreDepartamento'
                  onChange={(e) => setNombreDepartamento(e.target.value)}
                  placeholder='Nombre del Departamento'
                  required
                />
              </label>

              <label>
                  *Descripción
                <input
                  type="text"
                  value={descripcionDepartamento}
                  id='descripcionDepartamento'
                  name='descripcionDepartamento'
                  onChange={(e) => setDescripcionDepartamento(e.target.value)}
                  placeholder='Descripción del Departamento'
                  required
                />
              </label>

            </section>

            <section className='rightDiv_Inputs'>

              <label>
                  *Atiende Pacientes
                <input
                  type="checkbox"
                  checked={atiendePacientes}
                  id='atiendePacientes'
                  name='atiendePacientes'
                  onChange={(e) => setAtiendePacientes(e.target.checked)}
                  placeholder='Atiende Pacientes'
                />
              </label>

              <label>
                  *Atiende Helpdesk
                <input
                  type="checkbox"
                  checked={atiendeHelpdesk}
                  id='atiendeHelpdesk'
                  name='atiendeHelpdesk'
                  onChange={(e) => setAtiendeHelpdesk(e.target.checked)}
                  placeholder='Atiende Helpdesk'
                />
              </label>

              <label>
                  *Estatus Activo
                <input
                  type="checkbox"
                  checked={estatusActivo}
                  id='estatusActivo'
                  name='estatusActivo'
                  onChange={(e) => setEstatusActivo(e.target.checked)}
                  placeholder='Estatus Activo'
                />
              </label>

            </section>

          </div>

          <ModalButtons
            buttons={[
              {
                text: 'Guardar',
                type: 'submit',
                className: 'button_addedit'
              },
              {
                text: 'Cancelar',
                type: 'button',
                className: 'button_close',
                onClick: onClose
              }
            ]}
          />

        </form>

      </div>
    </Modal>
  );
};

export default EditDepartamento;
