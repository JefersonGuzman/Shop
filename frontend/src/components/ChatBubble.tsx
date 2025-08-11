import { useState } from 'react';
import Portal from './Portal';
import App from '../App';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Abrir chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-black text-white shadow-lg hover:bg-black/90 flex items-center justify-center"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 21l1.5-4.5A8.5 8.5 0 1 1 12 20H6l-2 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] md:w-[640px] bg-white border-l border-border shadow-card flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border bg-white">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-amber-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.39 4.84L20 7.27l-3.64 3.55L17.77 18 12 15.27 6.23 18l1.41-7.18L4 7.27l5.61-.43L12 2z"/></svg>
                  </span>
                  Hablar con IA
                </div>
                <button className="text-sm text-mutedText hover:text-text" onClick={() => setOpen(false)}>Cerrar</button>
              </div>
              <div className="flex-1 overflow-hidden">
                <App />
              </div>
            </aside>
          </div>
        </Portal>
      )}
    </>
  );
}


