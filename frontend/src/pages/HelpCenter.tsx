export default function HelpCenter() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-10 text-text">
      <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Centro de ayuda</h1>
        <p className="text-mutedText mb-6">Encuentra respuestas a preguntas frecuentes sobre compras, envíos, pagos y soporte técnico.</p>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>¿Cómo hago seguimiento de mi pedido?</li>
          <li>¿Qué métodos de pago aceptan?</li>
          <li>¿Cómo usar un cupón de descuento?</li>
          <li>¿Cómo solicitar soporte técnico?</li>
        </ul>
      </div>
    </div>
  );
}


