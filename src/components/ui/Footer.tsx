import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-xs text-gray-500 font-medium text-center md:text-left">
            <p>© 2026 S&A CHILE - CENTRO DE HERRAMIENTAS. TODOS LOS DERECHOS RESERVADOS.</p>
            <div className="mt-2 flex justify-center md:justify-start space-x-4">
              <a href="#docs" onClick={(e) => e.preventDefault()} className="text-gray-600 hover:text-[#002395] underline transition-colors">
                Documentación
              </a>
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-gray-600 hover:text-[#002395] underline transition-colors">
                Política de Privacidad
              </a>
              <a href="#support" onClick={(e) => e.preventDefault()} className="text-gray-600 hover:text-[#002395] underline transition-colors">
                Soporte Técnico
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
              Desarrollado por
            </span>
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-gray-400 hover:text-[#002395] transition-colors cursor-pointer">
                S&A
              </span>
              <span className="ml-1 text-xs font-bold text-gray-400">
                CHILE
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
