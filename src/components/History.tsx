import { useState, useEffect, useMemo } from 'react';
import supabase from '../supabaseClient';
import { Search, Calendar, Building2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface EmployeeField {
  field_name: string;
  field_value: string;
}

interface Employee {
  id: string;
  employee_fields: EmployeeField[];
}

interface HistoryEntry {
  id: string;
  company_id: string;
  employee_id: string;
  action: string;
  date: string;
  employees: Employee;
}

const History = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: historyData, error: historyError } = await supabase
          .from('history')
          .select('*, employees (id, employee_fields(*)), companies (id, name)');

        if (historyError) throw historyError;

        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name');

        if (companiesError) throw companiesError;

        setHistory(historyData || []);
        setCompanies(companiesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAndSortedHistory = useMemo(() => {
    return history
      .filter(entry => {
        const company = companies.find(c => c.id === entry.company_id);
        const employeeName = entry.employees?.employee_fields?.find(f => f.field_name === 'nombre')?.field_value || '';
        const companyName = company?.name || '';

        return (
          (companyFilter === '' || entry.company_id === companyFilter) &&
          (searchTerm === '' ||
            employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            companyName.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (startDate === '' || new Date(entry.date) >= new Date(startDate)) &&
          (endDate === '' || new Date(entry.date) <= new Date(endDate))
        );
      })
      .sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [history, companies, searchTerm, companyFilter, startDate, endDate, sortOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'alta': return 'Alta';
      case 'baja': return 'Baja';
      case 'reactivacion': return 'Reactivación';
      default: return action;
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Historial</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center bg-white rounded-lg shadow-md p-2">
          <Search className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nombre o empresa"
            className="w-full focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-white rounded-lg shadow-md p-2">
          <Building2 className="text-gray-400 mr-2" />
          <select
            className="w-full focus:outline-none"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">Todas las empresas</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center bg-white rounded-lg shadow-md p-2">
          <Calendar className="text-gray-400 mr-2" />
          <input
            type="date"
            className="w-full focus:outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-white rounded-lg shadow-md p-2">
          <Calendar className="text-gray-400 mr-2" />
          <input
            type="date"
            className="w-full focus:outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                Fecha {sortOrder === 'asc' ? '↑' : '↓'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Cargando historial...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredAndSortedHistory.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron registros.
                </td>
              </tr>
            ) : (
              filteredAndSortedHistory.map((entry) => {
                const company = companies.find(c => c.id === entry.company_id);
                const employeeName = entry.employees?.employee_fields?.find(f => f.field_name === 'nombre')?.field_value || 'Empleado no encontrado';
                return (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company?.name || 'Empresa no encontrada'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employeeName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getActionText(entry.action)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.date)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;