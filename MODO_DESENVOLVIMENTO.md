# 🛠️ Modo Desenvolvimento - Acesso Sem Bloqueios

Este documento explica como configurar o projeto para **desenvolvimento colaborativo** sem bloqueios de autenticação, políticas RLS e outras restrições.

---

## 🎯 Objetivo

Facilitar o trabalho colaborativo removendo:
- ✅ Bloqueios de autenticação
- ✅ Políticas RLS (Row Level Security)
- ✅ Validações de cadastro restritivas
- ✅ Redirecionamentos forçados para login

---

## ⚙️ Configuração

### **1. Habilitar Modo Desenvolvimento**

No arquivo `.env.local`, adicione:

```env
# Modo Desenvolvimento (DESABILITAR AUTENTICAÇÃO E RLS)
DISABLE_AUTH=true
```

### **2. Desabilitar RLS no Banco de Dados**

Execute o script SQL no Supabase:

1. Acesse o **SQL Editor** do Supabase
2. Execute o arquivo: `supabase/disable-rls.sql`
3. Isso remove todas as políticas RLS e permite acesso direto às tabelas

### **3. Reiniciar o Servidor**

```bash
npm run dev
```

---

## ✅ O Que Muda

### **Antes (Modo Produção):**
- ❌ Precisa fazer login para acessar qualquer página
- ❌ APIs exigem autenticação
- ❌ RLS bloqueia acesso direto ao banco
- ❌ Cadastro exige validação de email

### **Depois (Modo Desenvolvimento):**
- ✅ Acesso direto a todas as páginas sem login
- ✅ APIs funcionam sem autenticação
- ✅ Acesso direto ao banco de dados (sem RLS)
- ✅ Cadastro simplificado

---

## 🔧 Como Funciona

### **Middleware**
O middleware verifica a variável `DISABLE_AUTH`:
- Se `true`: Permite acesso a todas as rotas sem autenticação
- Se `false`: Comportamento normal (exige autenticação)

### **APIs**
As APIs usam o helper `auth-helper.ts`:
- Em modo dev: Retorna primeira empresa do banco
- Em modo produção: Busca empresa do usuário autenticado

### **Banco de Dados**
Com RLS desabilitado:
- Qualquer query funciona diretamente
- Não precisa de autenticação
- Acesso total às tabelas

---

## ⚠️ ATENÇÕES IMPORTANTES

### **🚨 NUNCA use em Produção!**

```env
# ❌ NUNCA faça isso em produção:
DISABLE_AUTH=true
```

### **🔒 Segurança**

- Este modo **remove todas as proteções de segurança**
- Use **APENAS** em ambiente de desenvolvimento local
- **NUNCA** commite `.env.local` com `DISABLE_AUTH=true`
- O arquivo `.env.local` já está no `.gitignore`

### **📝 Boas Práticas**

1. **Sempre verifique** se está em modo dev antes de commitar
2. **Use variáveis de ambiente** diferentes para dev/prod
3. **Documente** quando usar modo dev em PRs
4. **Teste** em modo produção antes de fazer deploy

---

## 🧪 Testando

### **1. Verificar se está em modo dev:**

Acesse qualquer rota protegida (ex: `/`) sem fazer login:
- ✅ Se carregar: Modo dev ativo
- ❌ Se redirecionar para login: Modo produção

### **2. Testar APIs:**

```bash
# Deve funcionar sem autenticação em modo dev
curl http://localhost:3000/api/evolution/check-amanda
```

### **3. Testar Banco de Dados:**

No Supabase SQL Editor:
```sql
-- Deve retornar dados sem erro
SELECT * FROM "Company";
```

---

## 🔄 Voltar para Modo Produção

### **1. Desabilitar Modo Dev**

No `.env.local`:
```env
DISABLE_AUTH=false
```

### **2. Reabilitar RLS (Opcional)**

Execute o script:
```sql
-- Execute: supabase/aplicar-rls-policies-simples.sql
```

### **3. Reiniciar Servidor**

```bash
npm run dev
```

---

## 📚 Arquivos Modificados

- ✅ `middleware.ts` - Verifica `DISABLE_AUTH`
- ✅ `lib/auth-helper.ts` - Helper para autenticação condicional
- ✅ `env.example` - Documenta `DISABLE_AUTH`
- ✅ `supabase/disable-rls.sql` - Script para desabilitar RLS

---

## 🎯 Casos de Uso

### **Desenvolvimento Local**
- Trabalhar sem precisar criar conta
- Testar funcionalidades rapidamente
- Colaborar sem bloqueios

### **Testes Automatizados**
- Rodar testes sem mock de autenticação
- Testar APIs diretamente
- Popular banco de dados facilmente

### **Onboarding de Novos Devs**
- Começar a trabalhar imediatamente
- Não precisa configurar autenticação
- Foco no código, não em setup

---

## ❓ FAQ

**P: Posso usar em staging?**
R: Não recomendado. Use apenas em desenvolvimento local.

**P: E se eu esquecer de desabilitar antes do deploy?**
R: O build falhará se `DISABLE_AUTH=true` estiver no código, mas é melhor verificar manualmente.

**P: Como saber se estou em modo dev?**
R: Verifique a variável `DISABLE_AUTH` no `.env.local` ou tente acessar `/` sem login.

**P: Posso commitar `.env.local`?**
R: Não! O arquivo já está no `.gitignore` por segurança.

---

**Última Atualização:** 2025-01-28

