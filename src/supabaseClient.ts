// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhspxpdgjpsuqmomckif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoc3B4cGRnanBzdXFtb21ja2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzOTY4MTksImV4cCI6MjA0NDk3MjgxOX0.CRXD6svDt590i4W18jA5MYXGE1-qc30tGRDvW0WBn8c';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;