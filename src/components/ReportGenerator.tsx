import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileDown } from 'lucide-react';

const ReportGenerator = ({ companies, history }) => {
  const generateEmployeeReport = (company, status) => {
    const doc = new jsPDF();
    const employees = company.employees.filter(e => e.isActive === (status === 'active'));
    
    doc.setFontSize(18);
    doc.text(`Reporte de Empleados ${status === 'active' ? 'Activos' : 'Inactivos'} - ${company.name}`, 14, 22);
    
    const tableColumn = ["Nombre", "Apellido", "Email", ...company.fields.filter(f => !['nombre', 'apellido', 'email'].includes(f))];
    const tableRows = employees.map(employee => [
      employee.nombre,
      employee.apellido,
      employee.email,
      ...company.fields
        .filter(f => !['nombre', 'apellido', 'email'].includes(f))
        .map(f => employee[f] || '')
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`reporte_empleados_${status}_${company.name}.pdf`);
  };

  const generateHistoryReport = (company) => {
    const doc = new jsPDF();
    const companyHistory = history.filter(h => h.companyId === company.id);
    
    doc.setFontSize(18);
    doc.text(`Historial de Altas y Bajas - ${company.name}`, 14, 22);
    
    const tableColumn = ["Fecha", "Empleado", "Acción"];
    const tableRows = companyHistory.map(entry => {
      const employee = company.employees.find(e => e.id === entry.employeeId);
      return [
        new Date(entry.date).toLocaleDateString(),
        `${employee?.nombre || ''} ${employee?.apellido || ''}`,
        entry.action === 'alta' ? 'Alta' : entry.action === 'baja' ? 'Baja' : 'Reactivación'
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`historial_${company.name}.pdf`);
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Generar Reportes</h3>
      {companies.map(company => (
        <div key={company.id} className="mb-4 p-4 bg-white rounded-lg shadow">
          <h4 className="text-lg font-medium mb-2">{company.name}</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => generateEmployeeReport(company, 'active')}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <FileDown size={16} className="mr-2" />
              Empleados Activos
            </button>
            <button
              onClick={() => generateEmployeeReport(company, 'inactive')}
              className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <FileDown size={16} className="mr-2" />
              Empleados Inactivos
            </button>
            <button
              onClick={() => generateHistoryReport(company)}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FileDown size={16} className="mr-2" />
              Historial
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportGenerator;