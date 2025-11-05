import React, { useState } from 'react'
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { Roles } from '@/@types/mainTypes';
import { addRol, getRoles } from '@/store/Roles/rolesActions';
import { setListRoles } from '@/store/Roles/rolesReducer';
import Swal from 'sweetalert2';

import '@styles/99_Administrador/addeditdelete_adminEntities.css'


interface AddRolesProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');


const AddRolesControl: React.FC<AddRolesProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [nombreRol, setNombreRol] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const nuevoRol: Roles = {
        name: nombreRol,
      }

      const formData = new FormData();

      formData.append('nombre_rol', nuevoRol.name);
      formData.append('guard_name', 'web');


      const resultAction = await dispatch(addRol(nuevoRol)).unwrap();

      if (resultAction.success){
        const rolesActualizados = await dispatch(getRoles()).unwrap();

        if(rolesActualizados.success){
          dispatch(setListRoles(rolesActualizados.roles!));
          setNombreRol('')

          console.log('Rol agregado y lista recargada:', rolesActualizados.roles);

        } else 
          console.log('Error al agregar el rol: ', resultAction.message)
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Rol Añadida',
        text: 'El Rol ha sido añadido exitosamente.',
        confirmButtonText: 'OK',
    
      });
      onClose(); // Cerrar modal al completar el envío

    } catch (error) {
      console.error('Error al agregar el Rol: ', error);
        
      // Mostrar SweetAlert para error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el Rol. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
          
  };

  const customModalStyle_Rol = {
    content: {
      width: '400px'
    }
  }
      
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modal_CRUD_AdminEntity"
      overlayClassName="modal_OverlayCRUD_AdminEntity"
      style={customModalStyle_Rol}
    >

      <div className="modal_Content_Admin" >
        <h2>Añadir Rol</h2>

        <div className='mainInputs_addedit_AdminEntity'>
        
          <form onSubmit={handleSubmit} className="Form_AdminEntity">
                    
            <div className='dataInputs'>
                    
              <div className='leftDiv_Inputs'>
        
                <label>
                      *Rol:
                  <input 
                    type="text" 
                    value={nombreRol} 
                    id='nombreRol'
                    name='nombreRol'
                    onChange={(e) => setNombreRol(e.target.value)} 
                    placeholder='Nombre del Rol'
                    required 
                  />
                </label>

                
              </div>
        
            </div>
        
        
            <div className="modal_buttons">
              <button type="submit" className="button_addedit">Añadir</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>
        
          </form>
        
        
        </div>

      </div>

    </Modal>
  )
}

export default AddRolesControl