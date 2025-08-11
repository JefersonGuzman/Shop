export default function Contact() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-10 text-text">
      <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Contactar</h1>
        <p className="text-mutedText mb-6">¿Tienes dudas o necesitas soporte? Déjanos tu mensaje y te responderemos.</p>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="h-10 px-3 rounded-md border border-border" placeholder="Nombre" />
          <input className="h-10 px-3 rounded-md border border-border" placeholder="Correo" type="email" />
          <textarea className="md:col-span-2 h-32 px-3 py-2 rounded-md border border-border" placeholder="Mensaje" />
          <div className="md:col-span-2">
            <button type="button" className="h-10 px-5 rounded-md bg-black text-white">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
}


