import React from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { AppDispatch } from '@/store/store';
import { deleteTipoMoneda, getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';
import { setListTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaReducer';
import { TiposMoneda } from '@/@types/fiscalTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoMoneda/modalTiposMoneda.css';

interface DeleteTipoMonedaProps {
	isOpen: boolean;
	onClose: () => void;
	tipoMonedaToDelete: TiposMoneda | null;
}

Modal.setAppElement('#root');

const DeleteTipoMoneda: React.FC<DeleteTipoMonedaProps> = ({ isOpen, onClose, tipoMonedaToDelete }) => {
	const dispatch = useDispatch<AppDispatch>();

	const handleDelete = async () => {
		try {
			const resultAction = await dispatch(deleteTipoMoneda(tipoMonedaToDelete!)).unwrap();

			if (resultAction.success) {
				const tiposActualizados = await dispatch(getTiposMoneda()).unwrap();
				if (tiposActualizados.success) {
					dispatch(setListTiposMoneda(tiposActualizados.tiposMoneda ?? []));
				}

				Swal.fire({
					icon: 'success',
					title: 'Tipo de moneda eliminado',
					text: 'El tipo de moneda ha sido eliminado exitosamente.',
					confirmButtonText: 'OK',
				});

				onClose();
				return;
			}

			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: resultAction.message || 'No se pudo eliminar el tipo de moneda.',
				confirmButtonText: 'OK',
			});
		} catch (error) {
			console.error('Error al eliminar el tipo de moneda:', error);
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Hubo un problema al eliminar el tipo de moneda. Por favor, inténtalo de nuevo.',
				confirmButtonText: 'OK',
			});
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			contentLabel="Eliminar Tipo de Moneda"
			className="modalTipoMoneda"
		>
			<div className="mainDiv_modalTipoMoneda">
				<h2>Eliminar Tipo de Moneda</h2>

				<div className='divDeleteTipoMoneda'>
					<p>
						¿Quiere eliminar el tipo de moneda <br /> <strong>{tipoMonedaToDelete?.descripcion_tipomoneda}</strong>?
					</p>
				</div>

				<ModalButtons
					buttons={[
						{
							text: 'Eliminar',
							type: 'button',
							className: 'button_delete',
							onClick: handleDelete,
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
		</Modal>
	);
};

export default DeleteTipoMoneda;
