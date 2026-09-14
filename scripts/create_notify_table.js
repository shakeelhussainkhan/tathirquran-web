require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function create() {
  // Test if table already exists
  const { error: checkError } = await sb.from('notify_signups').select('id').limit(1);

  if (!checkError) {
    console.log('✓ notify_signups table already exists');
    return;
  }

  if (checkError.code !== '42P01') {
    console.error('Unexpected error checking table:', checkError.message);
    return;
  }

  // Table does not exist — try to create via rpc
  const { error } = await sb.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS notify_signups (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (error) {
    console.log('✗ Could not auto-create table. Create it manually in Supabase dashboard SQL editor:');
    console.log('');
    console.log('CREATE TABLE notify_signups (');
    console.log('  id SERIAL PRIMARY KEY,');
    console.log('  email TEXT UNIQUE NOT NULL,');
    console.log('  created_at TIMESTAMPTZ DEFAULT NOW()');
    console.log(');');
  } else {
    console.log('✓ notify_signups table created');
  }
}

create().catch(console.error);
