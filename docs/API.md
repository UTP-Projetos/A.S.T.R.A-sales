# 🔌 Documentação da API - CRM Caverá

## 📋 Endpoints Disponíveis

### **🔐 Autenticação**

#### `GET /api/test-supabase`
- **Descrição**: Testa conectividade com Supabase
- **Resposta**: `{ "success": true, "message": "Supabase conectado com sucesso" }`

#### `POST /api/logout`
- **Descrição**: Logout do usuário
- **Autenticação**: Requerida
- **Resposta**: `{ "success": true, "message": "Logout realizado com sucesso" }`

### **🤖 Evolution API (Amanda)**

#### `GET /api/evolution/check-amanda`
- **Descrição**: Verifica status da Amanda
- **Autenticação**: Requerida
- **Resposta**: 
```json
{
  "success": true,
  "amanda": {
    "configured": boolean,
    "connected": boolean,
    "instanceName": string,
    "whatsappPhone": string
  }
}
```

#### `GET /api/evolution/get-qr`
- **Descrição**: Obtém QR Code para conectar WhatsApp
- **Autenticação**: Requerida
- **Resposta**:
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "instanceName": "amanda-123-1234567890",
  "code": "string",
  "pairingCode": "string"
}
```

#### `POST /api/evolution/setup-amanda`
- **Descrição**: Configura a Amanda automaticamente
- **Autenticação**: Requerida
- **Resposta**:
```json
{
  "success": true,
  "message": "Amanda configurada com sucesso",
  "company": {
    "id": "uuid",
    "name": "string",
    "instanceName": "string"
  }
}
```

#### `GET /api/evolution/check-connection`
- **Descrição**: Verifica status da conexão WhatsApp
- **Autenticação**: Requerida
- **Resposta**:
```json
{
  "connected": boolean,
  "status": "open|close|connecting",
  "instanceName": "string"
}
```

#### `POST /api/evolution/create-instance`
- **Descrição**: Cria nova instância da Amanda
- **Autenticação**: Requerida
- **Body**: `{ "instanceName": "string" }`
- **Resposta**:
```json
{
  "success": true,
  "instanceName": "string",
  "hash": "string"
}
```

#### `POST /api/evolution/complete-onboarding`
- **Descrição**: Completa o processo de onboarding
- **Autenticação**: Requerida
- **Resposta**:
```json
{
  "success": true,
  "message": "Onboarding concluído com sucesso"
}
```

## 🔧 Configuração

### **Variáveis de Ambiente Necessárias**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Evolution API
NEXT_PUBLIC_EVOLUTION_API_URL=your_evolution_api_url
EVOLUTION_API_KEY=your_evolution_api_key

# n8n Webhooks
N8N_WEBHOOK_BASE_URL=your_n8n_webhook_url
```

### **Autenticação**

Todas as APIs protegidas requerem autenticação via Supabase. O middleware redireciona para `/login` se não autenticado.

## 📊 Códigos de Status

- **200**: Sucesso
- **307**: Redirecionamento (não autenticado)
- **401**: Não autenticado
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## 🔍 Exemplos de Uso

### **Verificar Status da Amanda**
```javascript
const response = await fetch('/api/evolution/check-amanda');
const data = await response.json();
console.log('Amanda configurada:', data.amanda.configured);
```

### **Obter QR Code**
```javascript
const response = await fetch('/api/evolution/get-qr');
const data = await response.json();
if (data.qrCode) {
  // Exibir QR Code
  document.getElementById('qr-image').src = data.qrCode;
}
```

### **Configurar Amanda**
```javascript
const response = await fetch('/api/evolution/setup-amanda', {
  method: 'POST'
});
const data = await response.json();
console.log('Amanda configurada:', data.success);
```
