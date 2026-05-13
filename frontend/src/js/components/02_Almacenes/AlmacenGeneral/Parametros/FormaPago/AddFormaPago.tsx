import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { AppDispatch } from '@/store/store';
import { addFormaPago, getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { setListFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoReducer';
import { FormasPago } from '@/@types/fiscalTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';

interface AddFormaPagoProps {
	isOpen: boolean;
	onClose: () => void;
}

Modal.setAppElement('#root');

const AddFormaPago: React.FC<AddFormaPagoProps> = ({ isOpen, onClose }) => {
	const dispatch = useDispatch<AppDispatch>();

	const [descripcionFormaPago, setDescripcionFormaPago] = useState<string>('');

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const nuevaFormaPago: FormasPago = {
				descripcion_formaspago: descripcionFormaPago,
			};

			const resultAction = await dispatch(addFormaPago(nuevaFormaPago)).unwrap();

			if (resultAction.success) {
				const formasActualizadas = await dispatch(getFormasPago()).unwrap();

				if (formasActualizadas.success) {
					dispatch(setListFormasPago(formasActualizadas.formasPago ?? []));
				}

				setDescripcionFormaPago('');

				Swal.fire({
					icon: 'success',
					title: 'Forma de pago añadida',
					text: 'La forma de pago ha sido añadida exitosamente.',
					confirmButtonText: 'OK',
				});

				onClose();
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: resultAction.message || 'No se pudo añadir la forma de pago.',
					confirmButtonText: 'OK',
				});
			}
		} catch (error) {
			console.error('Error al agregar la forma de pago: ', error);

			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Hubo un problema al añadir la forma de pago. Por favor, inténtalo de nuevo.',
				confirmButtonText: 'OK',
			});
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			contentLabel="Añadir Nueva Forma de Pago"
			className="modalFormaPago"
		>
			<div className="mainDiv_modalFormaPago">
				<h2>Añadir Nueva Forma de Pago</h2>

				<form className="formFormaPago" onSubmit={handleSubmit}>
					<div className="dataInputs_FormaPago">
						<label>
							*Descripción de la Forma de Pago:
							<input
								type="text"
								value={descripcionFormaPago}
								onChange={(e) => setDescripcionFormaPago(e.target.value)}
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

export default AddFormaPago;
