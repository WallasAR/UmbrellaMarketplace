const fs = require('fs');
const targetPath = './src/environments/environment.ts';
const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || 'https://umbrellacorp-api.onrender.com/api'}',
  supabaseUrl: '${process.env.SUPABASE_URL || ''}',
  supabaseKey: '${process.env.SUPABASE_ANON_KEY || ''}'
};
`;
fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment variables injected into ${targetPath}`);
