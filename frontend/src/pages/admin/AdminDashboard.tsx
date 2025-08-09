export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="font-semibold">Productos</h3>
          <p className="text-secondary">Resumen general</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="font-semibold">Usuarios</h3>
          <p className="text-secondary">Nuevos registrados</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="font-semibold">Chat</h3>
          <p className="text-secondary">Interacciones recientes</p>
        </div>
      </div>
    </div>
  );
}


