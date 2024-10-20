import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import { Building2, Briefcase, FolderKanban } from 'lucide-react';

const CompanySelector = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*');

        if (error) throw error;

        // Fetch employee count for each company
        const companiesWithEmployeesCount = await Promise.all(
          data.map(async (company) => {
            const { count, error: countError } = await supabase
              .from('employees')
              .select('*', { count: 'exact' })
              .eq('company_id', company.id);
        
            if (countError) throw countError;
        
            return {
              ...company,
              employees_count: count !== null ? count : 0,
            };
          })
        );        

        setCompanies(companiesWithEmployeesCount || []);
      } catch (error) {
        console.error('Error al obtener empresas:', error);
        alert('Error al cargar las empresas. Por favor, inténtelo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Seleccionar Empresa</h2>
      {companies.length === 0 ? (
        <p className="text-gray-600">No hay empresas creadas. Por favor, crea una nueva empresa primero.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company.id}
              to={`/company/${company.id}`}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center mb-4">
                {company.type === 'empresa' && <Building2 size={24} className="text-blue-600 mr-2" />}
                {company.type === 'negocio' && <Briefcase size={24} className="text-green-600 mr-2" />}
                {company.type === 'proyecto' && <FolderKanban size={24} className="text-purple-600 mr-2" />}
                <h3 className="text-xl font-semibold text-gray-800">{company.name}</h3>
              </div>
              <p className="text-sm text-gray-600 capitalize">{company.type}</p>
              <p className="text-sm text-gray-600 mt-2">{company.employees_count} empleados</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
