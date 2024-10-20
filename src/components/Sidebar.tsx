import React from 'react';
import { Link } from 'react-router-dom';
import { Home, PlusCircle, Briefcase, History, LogOut } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-semibold">Gestión Empresarial</h2>
      </div>
      <nav className="mt-6 flex-grow">
        <Link to="/" className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
          <Home size={20} className="inline-block mr-2" />
          Inicio
        </Link>
        <Link to="/setup" className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
          <PlusCircle size={20} className="inline-block mr-2" />
          Crear Empresa
        </Link>
        <Link to="/select" className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
          <Briefcase size={20} className="inline-block mr-2" />
          Seleccionar Empresa
        </Link>
        <Link to="/history" className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
          <History size={20} className="inline-block mr-2" />
          Historial
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded"
        >
          <LogOut size={20} className="mr-2" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;