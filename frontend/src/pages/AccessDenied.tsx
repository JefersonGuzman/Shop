import { Link } from 'react-router-dom';

type Props = {
  reason?: 'no-auth' | 'no-permission';
};

export default function AccessDenied({ reason = 'no-permission' }: Props) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-text">
      <div className="max-w-md w-full text-center p-6">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-xl font-semibold mb-2">No tienes acceso a esta ruta</h1>
        <p className="text-mutedText mb-6">
          {reason === 'no-auth'
            ? 'Debes iniciar sesión para acceder a este contenido.'
            : 'Tu cuenta no tiene permisos para ver esta sección.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="px-4 h-10 rounded-md bg-black text-white flex items-center">Volver al inicio</Link>
          <Link to="/login" className="px-4 h-10 rounded-md border border-border flex items-center">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}


