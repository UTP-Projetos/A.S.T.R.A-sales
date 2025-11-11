# 📁 Scripts SQL - Supabase

Este diretório contém todos os scripts SQL necessários para configurar o banco de dados do A.S.T.R.A CRM.

---

## 🚀 Para Novo Projeto (Primeira Vez)

Execute os scripts **nesta ordem** no SQL Editor do Supabase:

### **1. Criar Tabelas e Policies** ⏰ 2min
```sql
-- Arquivo: create-tables-and-policies.sql
-- Cria todas as tabelas e aplica RLS policies básicas
```

### **2. Adicionar Campos de Instância** ⏰ 30s
```sql
-- Arquivo: add-instance-name-field.sql
-- Adiciona campos instanceName e instanceId
```

### **3. Adicionar Campos de Onboarding** ⏰ 30s
```sql
-- Arquivo: add-onboarding-fields.sql
-- Adiciona campos whatsappConnected, webhookConfigured, onboardingCompleted
```

### **4. Popular com Dados de Exemplo** ⏰ 30s (OPCIONAL)
```sql
-- Arquivo: seed.sql
-- Adiciona dados de exemplo para testar o sistema
```

✅ **Pronto!** Seu banco está configurado.

---

## 🔄 Para Projeto Existente (Atualizar)

Se você já tem o projeto rodando e quer aplicar correções:

### **1. Aplicar RLS Policies Corrigidas** ⏰ 1min
```sql
-- Arquivo: aplicar-rls-policies.sql
-- Aplica políticas de segurança corrigidas
-- IMPORTANTE: Leia ANALISE_PROBLEMAS_RLS.md antes
```

### **2. Corrigir Dados Inconsistentes** ⏰ 1min
```sql
-- Arquivo: fix-data-based-on-n8n-workflow.sql
-- Corrige telefones sem DDD, user_id vazio, etc
```

### **3. Normalizar Histórico de Chat** ⏰ 30s (OPCIONAL)
```sql
-- Arquivo: normalize-chat-history.sql
-- Normaliza telefones no histórico de conversas
```

---

## 📋 Lista de Arquivos

### **Scripts Principais (usar)**
| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `create-tables-and-policies.sql` | Cria todas as tabelas + RLS | Novo projeto |
| `aplicar-rls-policies.sql` | Aplica RLS corrigidas | Atualizar projeto |
| `add-instance-name-field.sql` | Adiciona campos de instância | Novo projeto |
| `add-onboarding-fields.sql` | Adiciona campos de onboarding | Novo projeto |
| `seed.sql` | Dados de exemplo | Desenvolvimento |
| `fix-data-based-on-n8n-workflow.sql` | Corrige dados inconsistentes | Atualizar projeto |

### **Scripts de Correção (opcional)**
| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `normalize-chat-history.sql` | Normaliza telefones no chat | Se tiver telefones sem DDD |
| `fix-incomplete-messages.sql` | Corrige mensagens incompletas | Se tiver mensagens quebradas |

### **Scripts Alternativos (não usar)**
| Arquivo | Descrição | Motivo |
|---------|-----------|--------|
| `aplicar-rls-policies-simples.sql` | RLS permissivas | ⚠️ Sem isolamento multi-tenant |
| `rls-policies.sql` | RLS antigas | ⚠️ Desatualizado |
| `rls-policies-completo.sql` | RLS completas | ⚠️ Use `aplicar-rls-policies.sql` |
| `rls-policies-replicar.sql` | RLS para replicar | ⚠️ Desatualizado |
| `rls-policies-fix.sql` | Fix de RLS | ⚠️ Desatualizado |
| `rls-chat-history.sql` | RLS do chat | ⚠️ Já incluído em `aplicar-rls-policies.sql` |

### **Documentação**
| Arquivo | Descrição |
|---------|-----------|
| `ANALISE_PROBLEMAS_RLS.md` | Análise detalhada de problemas de RLS |

---

## ⚠️ Avisos Importantes

### **1. Execute TODOS os scripts de uma vez**
Não execute linha por linha. Copie todo o arquivo e execute de uma vez no SQL Editor.

### **2. Ordem importa**
Para novo projeto, execute na ordem mostrada acima. Não pule etapas.

### **3. Backup antes de atualizar**
Se for atualizar projeto existente, faça backup do banco antes de executar correções.

### **4. RLS Policies**
Leia `ANALISE_PROBLEMAS_RLS.md` antes de aplicar RLS policies para entender os problemas e soluções.

---

## 🧪 Como Verificar

Após executar os scripts, verifique se tudo está correto:

```sql
-- Verificar se tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('Client', 'Company', 'Schedules', 'n8nchathistories');

-- Verificar se RLS está habilitada
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar policies aplicadas
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Deve retornar:
- ✅ 4 tabelas criadas
- ✅ RLS habilitada em todas
- ✅ Policies aplicadas em cada tabela

---

## 🆘 Troubleshooting

### **Erro: `relation "Client" does not exist`**
→ Execute `create-tables-and-policies.sql` primeiro

### **Erro: `operator does not exist: bigint = text`**
→ Use `aplicar-rls-policies.sql` (versão corrigida)

### **Erro: `column "instanceName" does not exist`**
→ Execute `add-instance-name-field.sql`

### **Tabelas vazias no dashboard**
→ Execute `seed.sql` para adicionar dados de exemplo

---

## 📚 Mais Informações

- [Documentação Supabase](https://supabase.com/docs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [ANALISE_PROBLEMAS_RLS.md](./ANALISE_PROBLEMAS_RLS.md) - Análise completa de problemas

---

**Última Atualização:** 06/11/2025  
**Mantido por:** Equipe A.S.T.R.A
