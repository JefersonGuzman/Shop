export default function Returns() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-10 text-text">
      <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Garantías y devoluciones</h1>
        <p className="text-mutedText mb-6">Consulta nuestra política de garantías y devoluciones. Si tu producto presenta fallas, te ayudaremos a gestionarlo.</p>
        <h2 className="text-lg font-semibold mb-2">Plazos</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>Devolución: 7 días desde la entrega si el producto está en perfecto estado.</li>
          <li>Garantía: según cobertura del fabricante (usualmente 12 meses).</li>
        </ul>
      </div>
    </div>
  );
}


