// redirectByRole.ts
import { NavigateFunction } from 'react-router-dom';

const redirectByRole = (role: string | null, navigate: NavigateFunction) => {

  if (!role) {
    console.log('El rol es nulo o indefinido');
    navigate('/'); // Redirige a la ruta predeterminada si el rol es nulo
    return;
  }

  switch (role) {
    case '"Admin"':
      navigate('/admin');
      break;

    default:
      navigate('/home'); // Ruta predeterminada si el rol no coincide
      break;

  }
};

export default redirectByRole;
