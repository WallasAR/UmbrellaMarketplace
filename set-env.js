const fs = require('fs');
const targetPath = './src/environments/environment.ts';

const apiUrl = process.env.API_URL || 'https://umbrellacorp-api.onrender.com/api';
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Available environment variable keys:', Object.keys(process.env).join(', '));

if (!supabaseUrl || !supabaseKey) {
  console.error('\\n❌ ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is missing from the build environment!');
  console.error('Please add these variables in Vercel > Project Settings > Environment Variables.');
  console.error('Make sure they are assigned to the "Production" and "Preview" environments.\\n');
  process.exit(1);
}

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`✅ Environment variables successfully injected into ${targetPath}`);
