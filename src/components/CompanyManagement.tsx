import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient'; // Importamos el cliente Supabase ya configurado
import { UserPlus, CheckCircle, XCircle } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  type: string;
  fields: string[];
  employees: Employee[];
}

interface Employee {
  id: string;
  is_active: boolean;
  fields: { [key: string]: string };
}

const CompanyManagement = () => {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [showInactiveEmployees, setShowInactiveEmployees] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();

        if (companyError) throw companyError;

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('company_fields')
          .select('field_name')
          .eq('company_id', id);

        if (fieldsError) throw fieldsError;

        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('id, is_active')
          .eq('company_id', id);

        if (employeesError) throw employeesError;

        const employeesWithFields = await Promise.all(
          employeesData.map(async (employee) => {
            const { data: employeeFieldsData, error: employeeFieldsError } = await supabase
              .from('employee_fields')
              .select('*')
              .eq('employee_id', employee.id);

            if (employeeFieldsError) throw employeeFieldsError;

            const fields = employeeFieldsData.reduce((acc, field) => {
              acc[field.field_name] = field.field_value;
              return acc;
            }, {} as { [key: string]: string });

            return { ...employee, fields };
          })
        );

        setCompany({
          ...companyData,
          fields: fieldsData.map((field) => field.field_name),
          employees: employeesWithFields,
        });
      } catch (error) {
        console.error('Error al obtener la empresa:', error);
        setError('Error al cargar la información de la empresa. Por favor, inténtelo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
  
    try {
      // Insertar el nuevo empleado
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert([{ company_id: company.id, is_active: true }])
        .select()
        .single();
  
      if (employeeError) throw employeeError;
  
      const employeeId = employeeData.id;
  
      // Insertar los campos del empleado
      const fieldsToInsert = Object.keys(formData).map((field_name) => ({
        employee_id: employeeId,
        field_name,
        field_value: formData[field_name],
      }));
  
      const { error: employeeFieldsError } = await supabase
        .from('employee_fields')
        .insert(fieldsToInsert);
  
      if (employeeFieldsError) throw employeeFieldsError;
  
      // Registrar la acción de "Alta inicial" en la tabla `history`
      if (employeeId && company.id) {
        console.log('Datos para historial al añadir empleado:', {
          employee_id: employeeId,
          company_id: company.id,
          action: 'Alta inicial',
          date: new Date(),
        });
  
        const { error: historyError } = await supabase
          .from('history')
          .insert([{
            employee_id: employeeId,
            company_id: company.id,
            action: 'alta inicial',
            date: new Date(),
          }]);
  
        if (historyError) {
          console.error('Error al insertar en la tabla history al añadir empleado:', historyError);
          throw historyError;
        } else {
          console.log("Registro del historial realizado correctamente");
        }
      }
  
      // Agregar el nuevo empleado al estado actual
      setCompany({
        ...company,
        employees: [
          ...company.employees,
          { id: employeeId, is_active: true, fields: formData },
        ],
      });
      setFormData({});
      setShowForm(false);
    } catch (error) {
      console.error('Error al añadir empleado:', error);
      alert('Error al añadir el empleado. Por favor, inténtelo de nuevo.');
    }
  };  

  const handleToggleEmployeeStatus = async (employeeId: string) => {
    if (!company) return;
  
    try {
      const employeeToUpdate = company.employees.find((e) => e.id === employeeId);
      if (!employeeToUpdate) return;
  
      // Cambiar el estado del empleado
      const { error } = await supabase
        .from('employees')
        .update({ is_active: !employeeToUpdate.is_active })
        .eq('id', employeeId);
  
      if (error) throw error;
  
      // Registrar el cambio en la tabla `history`
      const action = employeeToUpdate.is_active ? 'baja' : 'reactivacion';
  
      if (employeeId && company.id) {
        console.log('Datos para historial al cambiar estado:', {
          employee_id: employeeId,
          company_id: company.id,
          action: action,
          date: new Date(),
        });
  
        const { error: historyError } = await supabase
          .from('history')
          .insert([{
            employee_id: employeeId,
            company_id: company.id,
            action: action,
            date: new Date(), // Usar `new Date()` directamente
          }]);
  
        if (historyError) {
          console.error('Error al insertar en la tabla history:', historyError);
          throw historyError;
        } else {
          console.log("Registro del historial realizado correctamente");
        }
      } else {
        console.error('employeeId o companyId no están definidos.');
      }
  
      // Actualizar el estado en el frontend
      setCompany({
        ...company,
        employees: company.employees.map((e) =>
          e.id === employeeId ? { ...e, is_active: !e.is_active } : e
        ),
      });
    } catch (error) {
      console.error('Error al actualizar el estado del empleado o registrar en el historial:', error);
      alert('Error al actualizar el estado del empleado. Por favor, inténtelo de nuevo.');
    }
  };
  

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!company) {
    return <div className="p-8">Empresa no encontrada</div>;
  }

  const activeEmployees = company.employees.filter((e) => e.is_active);
  const inactiveEmployees = company.employees.filter((e) => !e.is_active);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Gestión de {company.name}
      </h2>
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus size={20} className="mr-2" />
          {showForm ? 'Cancelar' : 'Añadir Empleado'}
        </button>
        <button
          onClick={() => setShowInactiveEmployees(!showInactiveEmployees)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          {showInactiveEmployees ? 'Ocultar Inactivos' : 'Mostrar Inactivos'}
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 mb-6"
        >
          {company.fields.map((field) => (
            <div key={field} className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor={field}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Añadir Empleado
          </button>
        </form>
      )}
      
      {/* Siempre mostrar la tabla de empleados */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {company.employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay empleados registrados.
                </td>
              </tr>
            ) : (
              company.employees
                .filter((employee) => showInactiveEmployees || employee.is_active)
                .map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.fields.nombre || 'Nombre no disponible'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleEmployeeStatus(employee.id)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${
                          employee.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {employee.is_active ? <XCircle size={16} className="mr-1" /> : <CheckCircle size={16} className="mr-1" />}
                        {employee.is_active ? 'Dar de baja' : 'Dar de alta'}
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyManagement;