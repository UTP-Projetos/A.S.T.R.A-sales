#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Setup do A.S.T.R.A CRM\n');
console.log('Este script vai configurar o projeto para você.\n');

const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', 'env.example');

// Verificar se .env.local existe
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  O arquivo .env.local já existe!\n');
  
  rl.question('Deseja sobrescrever? (s/N): ', (answer) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
      copyEnvFile();
    } else {
      console.log('\n✅ Mantendo .env.local existente.');
      finish();
    }
  });
} else {
  copyEnvFile();
}

function copyEnvFile() {
  try {
    if (!fs.existsSync(envExamplePath)) {
      console.error('\n❌ Erro: env.example não encontrado!');
      process.exit(1);
    }

    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('\n✅ Arquivo .env.local criado com sucesso!');
    
    console.log('\n📝 Próximos passos:');
    console.log('1. Abra o arquivo .env.local');
    console.log('2. Configure as variáveis de ambiente:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL (obrigatório)');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY (obrigatório)');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY (obrigatório)');
    console.log('   - NEXT_PUBLIC_EVOLUTION_API_URL (obrigatório)');
    console.log('   - EVOLUTION_API_KEY (obrigatório)');
    console.log('   - N8N_WEBHOOK_BASE_URL (opcional)');
    console.log('\n3. Execute: npm run dev');
    console.log('\n📚 Consulte SETUP.md para mais informações\n');
    
    finish();
  } catch (error) {
    console.error('\n❌ Erro ao criar .env.local:', error.message);
    process.exit(1);
  }
}

function finish() {
  rl.close();
  process.exit(0);
}
