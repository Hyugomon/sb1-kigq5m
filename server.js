import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all companies
app.get('/api/companies', async (req, res) => {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  for (let company of companies) {
    const { data: fields } = await supabase
      .from('company_fields')
      .select('field_name')
      .eq('company_id', company.id);

    company.fields = fields.map(f => f.field_name);

    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', company.id);

    company.employees = employees;

    for (let employee of company.employees) {
      const { data: employeeFields } = await supabase
        .from('employee_fields')
        .select('field_name, field_value')
        .eq('employee_id', employee.id);

      employeeFields.forEach(field => {
        employee[field.field_name] = field.field_value;
      });
    }
  }

  res.json(companies);
});

// Add a new company
app.post('/api/companies', async (req, res) => {
  const { id, name, type, fields } = req.body;

  const { error: companyError } = await supabase
    .from('companies')
    .insert({ id, name, type });

  if (companyError) {
    return res.status(500).json({ error: companyError.message });
  }

  for (let field of fields) {
    const { error: fieldError } = await supabase
      .from('company_fields')
      .insert({ company_id: id, field_name: field });

    if (fieldError) {
      return res.status(500).json({ error: fieldError.message });
    }
  }

  res.json({ message: 'Company added successfully' });
});

// Add a new employee
app.post('/api/employees', async (req, res) => {
  const { id, companyId, isActive, ...fields } = req.body;

  const { error: employeeError } = await supabase
    .from('employees')
    .insert({ id, company_id: companyId, is_active: isActive });

  if (employeeError) {
    return res.status(500).json({ error: employeeError.message });
  }

  for (let [key, value] of Object.entries(fields)) {
    const { error: fieldError } = await supabase
      .from('employee_fields')
      .insert({ employee_id: id, field_name: key, field_value: value });

    if (fieldError) {
      return res.status(500).json({ error: fieldError.message });
    }
  }

  res.json({ message: 'Employee added successfully' });
});

// Toggle employee status
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const { error } = await supabase
    .from('employees')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Employee status updated successfully' });
});

// Get all history entries
app.get('/api/history', async (req, res) => {
  const { data: history, error } = await supabase
    .from('history')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(history);
});

// Add a new history entry
app.post('/api/history', async (req, res) => {
  const { id, companyId, employeeId, action, date } = req.body;

  const { error } = await supabase
    .from('history')
    .insert({ id, company_id: companyId, employee_id: employeeId, action, date });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'History entry added successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});