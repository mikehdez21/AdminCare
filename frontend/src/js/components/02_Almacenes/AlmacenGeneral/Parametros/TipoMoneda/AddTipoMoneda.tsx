import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { TiposMoneda } from '@/@types/fiscalTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { AppDispatch } from '@/store/store';
import { addTipoMoneda, getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';
import { setListTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaReducer';

//Styles
import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoMoneda/modalTiposMoneda.css';

interface AddTipoMonedaProps {
	isOpen: boolean;
	onClose: () => void;
}

Modal.setAppElement('#root');

const AddTipoMoneda: React.FC<AddTipoMonedaProps> = ({ isOpen, onClose }) => {
	const dispatch = useDispatch<AppDispatch>();
	const [descripcionTipoMoneda, setDescripcionTipoMoneda] = useState<string>('');

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const nuevoTipoMoneda: TiposMoneda = {
				descripcion_tipomoneda: descripcionTipoMoneda,
			};

			const resultAction = await dispatch(addTipoMoneda(nuevoTipoMoneda)).unwrap();

			if (resultAction.success) {
				const tiposActualizados = await dispatch(getTiposMoneda()).unwrap();

				if (tiposActualizados.success) {
					dispatch(setListTiposMoneda(tiposActualizados.tiposMoneda ?? []));
				}

				setDescripcionTipoMoneda('');

				Swal.fire({
					icon: 'success',
					title: 'Tipo de moneda añadido',
					text: 'El tipo de moneda ha sido añadido exitosamente.',
					confirmButtonText: 'OK',
				});

				onClose();
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: resultAction.message || 'No se pudo añadir el tipo de moneda.',
					confirmButtonText: 'OK',
				});
			}
		} catch (error) {
			console.error('Error al agregar el tipo de moneda: ', error);

			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Hubo un problema al añadir el tipo de moneda. Por favor, inténtalo de nuevo.',
				confirmButtonText: 'OK',
			});
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			contentLabel="Añadir Nuevo Tipo de Moneda"
			className="modalTipoMoneda"
		>
			<div className="mainDiv_modalTipoMoneda">
				<h2>Añadir Nuevo Tipo de Moneda</h2>

				<form className="formTipoMoneda" onSubmit={handleSubmit}>
					<div className="dataInputs_TipoMoneda">
						<label>
							*Descripción del Tipo de Moneda:
							<input
								type="text"
								value={descripcionTipoMoneda}
								onChange={(e) => setDescripcionTipoMoneda(e.target.value)}
								required
							/>
						</label>

						<ModalButtons
							buttons={[
								{
									text: 'Guardar',
									type: 'submit',
									className: 'button_addedit',
								},
								{
									text: 'Cancelar',
									type: 'button',
									className: 'button_close',
									onClick: onClose,
								},
							]}
						/>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default AddTipoMoneda;
