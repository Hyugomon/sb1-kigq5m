import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import ReportGenerator from './ReportGenerator';

const Dashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies data
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*, company_fields(*), employees(*)');

        if (companiesError) throw companiesError;

        // Calculate the number of employees for each company
        const companiesWithEmployeeCount = companiesData.map(company => ({
          ...company,
          employees_count: company.employees ? company.employees.length : 0,
        }));

        // Fetch history data
        const { data: historyData, error: historyError } = await supabase
          .from('history')
          .select('*');

        if (historyError) throw historyError;

        setCompanies(companiesWithEmployeeCount || []);
        setHistory(historyData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      <ReportGenerator companies={companies} history={history} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Resumen de Empresas</h2>
          <p className="text-3xl font-bold">{companies.length}</p>
          <p className="text-gray-600">Total de empresas registradas</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Total de Empleados</h2>
          <p className="text-3xl font-bold">
            {companies.reduce((total, company) => total + (company.employees_count || 0), 0)}
          </p>
          <p className="text-gray-600">Empleados en todas las empresas</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
          <p className="text-3xl font-bold">{history.length}</p>
          <p className="text-gray-600">Registros en el historial</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;