import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { Building2, Briefcase, FolderKanban, PlusCircle, XCircle } from 'lucide-react';

const CompanySetup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('empresa');
  const [fields, setFields] = useState(['nombre', 'apellido', 'email']);
  const [newField, setNewField] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCompany = {
      name,
      type,
    };

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([newCompany])
        .select();

      if (error) throw error;

      const companyId = data[0].id;
      const companyFields = fields.map((field) => ({
        company_id: companyId,
        field_name: field,
      }));

      const { error: fieldsError } = await supabase
        .from('company_fields')
        .insert(companyFields);

      if (fieldsError) throw fieldsError;

      navigate('/select');
    } catch (error) {
      console.error('Error al añadir empresa:', error);
      alert('Error al crear la empresa. Por favor, inténtelo de nuevo.');
    }
  };

  const addField = () => {
    if (newField && !fields.includes(newField)) {
      setFields([...fields, newField]);
      setNewField('');
    }
  };

  const removeField = (field) => {
    setFields(fields.filter(f => f !== field));
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Crear Nueva Empresa</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
            Tipo
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="empresa">Empresa</option>
            <option value="negocio">Negocio</option>
            <option value="proyecto">Proyecto</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campos personalizados
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
              placeholder="Nuevo campo"
            />
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle size={20} />
            </button>
          </div>
          <ul className="space-y-2">
            {fields.map((field) => (
              <li key={field} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                <span className="text-sm text-gray-700">{field}</span>
                <button
                  type="button"
                  onClick={() => removeField(field)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XCircle size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {type === 'empresa' && <Building2 size={20} className="mr-2" />}
          {type === 'negocio' && <Briefcase size={20} className="mr-2" />}
          {type === 'proyecto' && <FolderKanban size={20} className="mr-2" />}
          Crear {type}
        </button>
      </form>
    </div>
  );
};

export default CompanySetup;