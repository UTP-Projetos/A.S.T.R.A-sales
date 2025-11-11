# 🗄️ Scripts SQL - Supabase

Scripts SQL para configurar o banco de dados do A.S.T.R.A CRM.

## 📋 Scripts Essenciais (Execute nesta ordem)

### **1. Criar Tabelas**
```sql
-- Execute: create-tables-and-policies.sql
-- Cria todas as tabelas necessárias
```

### **2. Adicionar Campos de Instância**
```sql
-- Execute: add-instance-name-field.sql
-- Adiciona campos para instância WhatsApp
```

### **3. Adicionar Campos de Onboarding**
```sql
-- Execute: add-onboarding-fields.sql
-- Adiciona campos de onboarding
```

### **4. Dados de Exemplo (Opcional)**
```sql
-- Execute: seed.sql
-- Adiciona dados de teste para desenvolvimento
```

### **5. Modo Desenvolvimento (Opcional)**
```sql
-- Execute: disable-rls.sql
-- Desabilita RLS para desenvolvimento local
-- ⚠️ Use apenas em desenvolvimento!
```

## 🔧 Scripts Adicionais

- **aplicar-rls-policies-simples.sql** - Aplicar políticas RLS (produção)
- **normalize-chat-history.sql** - Normalizar histórico de chat
- **fix-incomplete-messages.sql** - Corrigir mensagens incompletas

## 📚 Como Usar

1. Acesse o **SQL Editor** do Supabase
2. Cole o conteúdo do script desejado
3. Execute tudo de uma vez
4. Verifique se não houve erros

## ⚠️ Importante

- Execute os scripts na ordem indicada
- **NUNCA** execute `disable-rls.sql` em produção
- Faça backup antes de executar scripts em produção
