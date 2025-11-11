# 📊 Análise Comparativa: Funcionalidades ASTRA v2 vs Projeto Atual

**Data da Análise:** 2025-01-28  
**Analista:** Vilmar (Engenheiro de Software Sênior)  
**Documento Base:** FuncionalidadesdasLinhasASTRAv2.md

---

## 🎯 Resumo Executivo

O projeto atual **A.S.T.R.A Sales CRM** está focado principalmente na linha **ASTRA Sales**, com implementação parcial de funcionalidades básicas. As linhas **ASTRA Finance** e **ASTRA Insight** ainda não foram iniciadas.

**Status Geral:**
- ✅ **ASTRA Sales:** ~15% implementado (funcionalidades básicas)
- ❌ **ASTRA Finance:** 0% implementado
- ❌ **ASTRA Insight:** 0% implementado
- ⚠️ **Funcionalidades Transversais:** ~20% implementado

---

## 📋 ASTRA Sales - Atendimento e Vendas

### ✅ **FUNCIONALIDADES IMPLEMENTADAS**

#### 1. **Infraestrutura Básica de WhatsApp**
- ✅ Integração com Evolution API
- ✅ Criação de instâncias WhatsApp
- ✅ Conexão via QR Code
- ✅ Webhooks para receber mensagens
- ✅ Envio de mensagens via API (`/api/messages/send`)
- ✅ Histórico de conversas (tabela `n8nchathistories`)

#### 2. **Gestão de Clientes (Básica)**
- ✅ Listagem de clientes (`/clientes`)
- ✅ Visualização de detalhes do cliente (`/clientes/[id]`)
- ✅ Busca de clientes (nome, email, telefone)
- ✅ Filtros por status de lead
- ✅ Ativação/Desativação de bot por cliente
- ✅ Status de lead no CRM (Novo Contato, Contato em Andamento, etc.)

#### 3. **Sistema de Agendamentos (Estrutura Básica)**
- ✅ Tabela `Schedules` no banco de dados
- ✅ Listagem de agendamentos (`/agendamentos`)
- ✅ Visualização de detalhes (`/agendamentos/[id]`)
- ✅ Filtros por status (Pendente, Confirmado, Cancelado, Realizado)
- ✅ Tipos de agendamento (Hospedagem, Ingresso, Atividade)
- ✅ Campo JSON para notas customizadas (`appointmentNotes`)

#### 4. **Dashboard e Visualização**
- ✅ Dashboard principal com métricas básicas
- ✅ Gráfico de vendas (SalesChart)
- ✅ Gráfico de funil de leads (LeadFunnelChart)
- ✅ Status da Amanda (agente IA)
- ✅ Lista de clientes recentes

#### 5. **Onboarding**
- ✅ Fluxo de onboarding (`/onboarding`)
- ✅ Verificação da Amanda
- ✅ Conexão WhatsApp via QR Code
- ✅ Feedback visual de progresso

#### 6. **Autenticação e Segurança Básica**
- ✅ Login e cadastro de usuários
- ✅ Autenticação via Supabase Auth
- ✅ Proteção de rotas (middleware)
- ✅ Rate limiting parcial (4 de 20 APIs)
- ✅ Validação de env vars com Zod

#### 7. **Integração n8n (Multiagente)**
- ✅ Webhooks padronizados
- ✅ Multi-agentes (Coordinator, CRM, Scheduling, Booking, Pricing)
- ✅ Chat Memory (PostgreSQL)
- ✅ Histórico de conversas

---

### ❌ **FUNCIONALIDADES NÃO IMPLEMENTADAS**

#### 1. **Atendimento Conversacional Inteligente**
- ❌ Processamento de linguagem natural avançado
- ❌ Interpretação de mensagens de áudio
- ❌ Manutenção de contexto conversacional profundo
- ❌ Personalidade adaptativa do agente
- ❌ Análise de sentimento do cliente

#### 2. **Qualificação Automática de Leads**
- ❌ Coleta automática de informações durante conversa
- ❌ Aplicação de frameworks (BANT, CHAMP)
- ❌ Pontuação automática de leads
- ❌ Categorização (quentes, mornos, frios)
- ❌ Enriquecimento com dados públicos
- ❌ Histórico de interações anteriores

#### 3. **Gestão de Pipeline Conversacional**
- ❌ Acompanhamento automático de etapas do funil
- ❌ Atualização automática de status
- ❌ Identificação de gargalos
- ❌ Mensagens de reengajamento personalizadas
- ❌ Priorização de follow-ups por probabilidade

#### 4. **Agendamento Inteligente (Avançado)**
- ❌ Integração com calendários (Google Calendar, Outlook)
- ❌ Sugestão automática de horários
- ❌ Confirmação automática de reuniões
- ❌ Lembretes automáticos antes de compromissos
- ❌ Reagendamento autônomo
- ❌ Consideração de fusos horários
- ❌ Motor de validação de disponibilidade
- ❌ Prevenção de sobreposições
- ❌ Lista de espera inteligente
- ❌ Otimização de recursos escassos
- ❌ Cálculo automático de valores/preços
- ❌ Tarifas diferenciadas por horário
- ❌ Gestão de recorrências

#### 5. **Handoff Humanizado**
- ❌ Identificação de momentos críticos
- ❌ Transferência com contexto completo
- ❌ Resumo automático da interação
- ❌ Notificações discretas para vendedores
- ❌ Painel de acompanhamento em tempo real
- ❌ Sistema de pontuação de urgência
- ❌ Modo "supervisão sugerida" (copiloto de vendas)
- ❌ Feedback estruturado pós-handoff

#### 6. **Catálogo de Produtos Dinâmico**
- ❌ Apresentação conversacional de produtos
- ❌ Imagens e vídeos de produtos
- ❌ Recomendações personalizadas
- ❌ Base de conhecimento estruturada
- ❌ Respostas a dúvidas técnicas

#### 7. **Processamento de Pedidos**
- ❌ Coleta de informações via conversa
- ❌ Validação automática de dados
- ❌ Cálculo automático de valores
- ❌ Geração de propostas comerciais
- ❌ Envio de propostas por WhatsApp/email
- ❌ Acompanhamento de aprovações
- ❌ Transformação de propostas em pedidos

#### 8. **Gestão de Objeções**
- ❌ Identificação de objeções comuns
- ❌ Biblioteca de respostas otimizadas
- ❌ Escalação de objeções complexas
- ❌ Sugestões de abordagem para vendedores
- ❌ Aprendizado com interações bem-sucedidas

#### 9. **Campanhas e Broadcasts Inteligentes**
- ❌ Mensagens em massa personalizadas
- ❌ Respeito à janela de 24h do WhatsApp
- ❌ Segmentação de audiências
- ❌ A/B testing de mensagens
- ❌ Otimização automática

#### 10. **Integrações Nativas**
- ❌ Integração com CRMs (RD Station, HubSpot, Pipedrive)
- ❌ Sincronização bidirecional de dados
- ❌ Integração com plataformas de pagamento
- ❌ Integração com sistemas de estoque

#### 11. **Gestão de Relacionamento Pós-Venda**
- ❌ Engajamento contínuo pós-conversão
- ❌ Mensagens de acompanhamento personalizadas
- ❌ Coleta de feedback estruturado
- ❌ Detecção de sinais de insatisfação
- ❌ Protocolos de retenção
- ❌ Transformação em promotores (avaliações, depoimentos)
- ❌ Programas de fidelidade conversacionais

#### 12. **Motor de Negociação Inteligente**
- ❌ Negociações de preço dentro de parâmetros
- ❌ Descontos progressivos baseados em regras
- ❌ Identificação de oportunidades de bundle
- ❌ Táticas de ancoragem
- ❌ Escassez e urgência ética
- ❌ Registro de padrões de negociação

#### 13. **Sistema de Referências e Indicações**
- ❌ Gestão automatizada de programas de indicação
- ❌ Rastreamento de origem de leads indicados
- ❌ Atribuição de créditos e recompensas
- ❌ Atualizações automáticas para indicadores
- ❌ Identificação de clientes com potencial de indicação
- ❌ Links personalizados de compartilhamento

#### 14. **Gestão de Eventos e Webinars**
- ❌ Promoção de eventos via conversas
- ❌ Gestão de inscrições
- ❌ Envio de confirmações e lembretes
- ❌ Coleta de informações pré-evento
- ❌ Envio de materiais durante evento
- ❌ Follow-up pós-evento estruturado
- ❌ Medição de ROI de eventos

#### 15. **Central de Conhecimento Conversacional**
- ❌ FAQ inteligente em linguagem natural
- ❌ Aprendizado com interações
- ❌ Identificação de gaps na base de conhecimento
- ❌ Sugestões proativas de conteúdos relacionados
- ❌ Atualização via interface conversacional
- ❌ Rastreamento de dúvidas frequentes

---

## 💰 ASTRA Finance - Assistente Financeira

### ❌ **TODAS AS FUNCIONALIDADES NÃO IMPLEMENTADAS**

#### 1. **Captura Multimodal de Transações**
- ❌ Registro via WhatsApp (texto)
- ❌ Transcrição de áudio para lançamentos
- ❌ OCR para fotos de recibos/notas fiscais

#### 2. **Categorização Inteligente**
- ❌ Categorização automática baseada em ML
- ❌ Sugestão de subcategorias
- ❌ Aprendizado com correções do usuário
- ❌ Categorias personalizadas

#### 3. **Conciliação Bancária Automatizada**
- ❌ Integração Open Finance
- ❌ Importação automática de transações
- ❌ Conciliação com lançamentos manuais
- ❌ Detecção de discrepâncias
- ❌ Separação transações pessoais/empresariais
- ❌ Detecção de duplicidades
- ❌ Reconciliação de valores aproximados

#### 4. **Fluxo de Caixa em Tempo Real**
- ❌ Saldo atualizado instantaneamente
- ❌ Visão consolidada de contas
- ❌ Projeção de saldo futuro

#### 5. **Gestão de Contas a Pagar e Receber**
- ❌ Registro de compromissos futuros
- ❌ Lembretes automáticos
- ❌ Controle de pagamentos parcelados/recorrentes
- ❌ Gestão de "fiado" e vendas a prazo
- ❌ Cobranças automatizadas personalizadas

#### 6. **Emissão Simplificada de Notas Fiscais**
- ❌ Fluxo conversacional para NFS-e
- ❌ Preenchimento automático de dados
- ❌ Integração com prefeituras brasileiras
- ❌ Histórico de notas emitidas

#### 7. **Cálculo e Gestão de Impostos (MEI)**
- ❌ Cálculo automático do DAS mensal
- ❌ Geração de guia de pagamento
- ❌ Alertas sobre limite de faturamento anual
- ❌ Preparação de relatório anual (DASN-SIMEI)

#### 8. **Relatórios Visuais e Consultas Rápidas**
- ❌ Relatórios via WhatsApp em linguagem natural
- ❌ Gráficos simples e compreensíveis
- ❌ Resumos periódicos automáticos

#### 9. **Dashboard Web Completo**
- ❌ Visualização ampla do fluxo de caixa
- ❌ Gráficos interativos
- ❌ Filtros avançados
- ❌ Exportação PDF/Excel
- ❌ Indicadores-chave destacados

#### 10. **Gestão de Clientes e Fornecedores**
- ❌ Cadastro centralizado
- ❌ Histórico completo de transações
- ❌ Informações fiscais
- ❌ Identificação de melhores clientes/fornecedores

#### 11. **Gestão de Múltiplas Entidades e Centros de Custo**
- ❌ Gestão de múltiplos negócios/CNPJs
- ❌ Separação por entidade legal
- ❌ Centros de custo customizáveis
- ❌ Transferências entre entidades
- ❌ Relatórios comparativos

#### 12. **Planejamento e Controle Orçamentário**
- ❌ Criação de orçamentos via conversa
- ❌ Acompanhamento em tempo real
- ❌ Alertas de limites orçamentários
- ❌ Sugestões de ajustes
- ❌ Aprovação de despesas acima de limites
- ❌ Análise de variações

#### 13. **Gestão de Contratos e Recorrências**
- ❌ Registro de contratos
- ❌ Automação de lançamentos recorrentes
- ❌ Alertas de vencimentos
- ❌ Cálculo de reajustes automáticos
- ❌ Rastreamento de renegociações
- ❌ Gestão de garantias e depósitos

#### 14. **Antecipação de Recebíveis e Crédito**
- ❌ Integração com plataformas de antecipação
- ❌ Cálculo de custos efetivos
- ❌ Comparação de ofertas de crédito
- ❌ Simulação de impacto no fluxo de caixa
- ❌ Monitoramento de saúde financeira

#### 15. **Gestão Fiscal Avançada**
- ❌ Cálculo de impostos por regime tributário
- ❌ Simulação de mudanças de regime
- ❌ Preparação de documentação fiscal
- ❌ Identificação de oportunidades de planejamento tributário
- ❌ Calendário fiscal completo

#### 16. **Módulo de Investimentos Pessoais**
- ❌ Registro de investimentos pessoais
- ❌ Consolidação de saldos e rentabilidades
- ❌ Integração com corretoras
- ❌ Cálculo de rentabilidade real
- ❌ Sugestões de rebalanceamento
- ❌ Alertas de vencimentos
- ❌ Separação patrimônio pessoal/empresarial

---

## 📈 ASTRA Insight - Inteligência e Análise

### ❌ **TODAS AS FUNCIONALIDADES NÃO IMPLEMENTADAS**

#### 1. **Análise de Lucratividade Profunda**
- ❌ Cálculo de margem de contribuição por produto
- ❌ Identificação de produtos campeões/problemáticos
- ❌ Recomendações de ajuste de preço
- ❌ Simulação de impacto de mudanças

#### 2. **Projeções e Previsões Financeiras**
- ❌ Projeção de fluxo de caixa futuro
- ❌ Previsão de receitas baseada em pipeline
- ❌ Antecipação de necessidades de capital de giro
- ❌ Simulação de cenários (otimista, realista, pessimista)

#### 3. **Alertas Proativos e Inteligentes**
- ❌ Notificações sobre despesas atípicas
- ❌ Avisos de risco de déficit
- ❌ Identificação de oportunidades de economia
- ❌ Alertas sobre limites fiscais
- ❌ Detecção de padrões de inadimplência

#### 4. **Análise de Desempenho de Vendas**
- ❌ Acompanhamento de métricas de conversão
- ❌ Identificação de gargalos
- ❌ Análise de performance individual de vendedores
- ❌ Comparação com períodos anteriores

#### 5. **Segmentação e Análise de Clientes**
- ❌ Classificação RFM (Recência, Frequência, Valor)
- ❌ Identificação de clientes em risco de churn
- ❌ Detecção de padrões de compra
- ❌ Cálculo de LTV e CAC

#### 6. **Controle Inteligente de Estoque**
- ❌ Monitoramento de giro de estoque
- ❌ Previsão de necessidade de reposição
- ❌ Cálculo de ponto de pedido ideal
- ❌ Alertas sobre produtos próximos do vencimento

#### 7. **Benchmarking e Indicadores Setoriais**
- ❌ Comparação com médias do setor
- ❌ Indicadores-chave específicos da vertical
- ❌ Sugestões de metas realistas

#### 8. **Recomendações Acionáveis Personalizadas**
- ❌ Insights semanais priorizados
- ❌ Sugestões de ações concretas
- ❌ Explicação didática do raciocínio
- ❌ Acompanhamento de implementação

#### 9. **Automações Baseadas em Regras**
- ❌ Workflows automáticos acionados por eventos
- ❌ Automação de tarefas recorrentes
- ❌ Integração cross-funcional entre linhas ASTRA

#### 10. **Dashboards Executivos Customizáveis**
- ❌ Visões pré-configuradas por tipo de negócio
- ❌ Personalização de widgets e métricas
- ❌ Resumo executivo diário/semanal
- ❌ Compartilhamento de dashboards

#### 11. **Análise de Sazonalidade e Tendências**
- ❌ Identificação de padrões sazonais
- ❌ Antecipação de picos e vales
- ❌ Detecção de tendências de crescimento/declínio
- ❌ Correlação com eventos externos

#### 12. **Integrações para Enriquecimento de Dados**
- ❌ Conexão com marketplaces e e-commerce
- ❌ Integração com sistemas de gestão
- ❌ Importação de dados de campanhas de marketing
- ❌ Conexão com fontes customizadas via API

#### 13. **Análise de Concorrência e Posicionamento**
- ❌ Monitoramento de preços de concorrentes
- ❌ Comparação de posicionamento de preços
- ❌ Análise de diferenciais competitivos
- ❌ Identificação de oportunidades de nicho
- ❌ Rastreamento de movimentações competitivas

#### 14. **Simulador de Cenários Avançado**
- ❌ Modelagem de decisões estratégicas complexas
- ❌ Simulação de impacto financeiro
- ❌ Análise de sensibilidade
- ❌ Comparação de múltiplos cenários

#### 15. **Análise de Eficiência Operacional**
- ❌ Identificação de gargalos em processos
- ❌ Cálculo de produtividade
- ❌ Detecção de desperdícios
- ❌ Sugestões de automações
- ❌ Benchmarking de eficiência

#### 16. **Motor de Precificação Dinâmica**
- ❌ Análise de elasticidade de preço
- ❌ Sugestões de ajustes de preço
- ❌ Identificação de oportunidades de precificação premium
- ❌ Recomendações de estratégias de desconto
- ❌ Simulação de impacto de mudanças de preço

#### 17. **Análise de Portfólio e Mix de Produtos**
- ❌ Classificação em matriz BCG
- ❌ Identificação de produtos complementares
- ❌ Análise de canibalização
- ❌ Recomendações de descontinuação
- ❌ Sugestões de expansão de linha

#### 18. **Análise de Jornada do Cliente**
- ❌ Mapeamento completo da jornada
- ❌ Cálculo de tempo médio por etapa
- ❌ Identificação de canais de aquisição eficientes
- ❌ Correlação de ações de marketing com demanda
- ❌ Segmentação de jornadas por persona

#### 19. **Sistema de Metas e OKRs**
- ❌ Definição de objetivos estratégicos
- ❌ Acompanhamento de progresso em tempo real
- ❌ Atualizações periódicas sobre status
- ❌ Identificação de correlações
- ❌ Sugestões de ajustes
- ❌ Cascateamento de objetivos

#### 20. **Análise de Risco e Compliance**
- ❌ Identificação de riscos financeiros
- ❌ Monitoramento de indicadores de saúde financeira
- ❌ Verificação de conformidade
- ❌ Análise de exposição cambial
- ❌ Detecção de padrões de fraude

---

## 🔄 Funcionalidades Transversais (Todas as Linhas)

### ✅ **FUNCIONALIDADES IMPLEMENTADAS**

#### 1. **Segurança e Conformidade (Parcial)**
- ✅ Criptografia de dados em trânsito (HTTPS)
- ✅ Autenticação básica (Supabase Auth)
- ✅ Validação de variáveis de ambiente
- ✅ Rate limiting parcial (4 de 20 APIs)
- ✅ Logger sanitizado (implementado parcialmente)

#### 2. **Onboarding Conversacional (Básico)**
- ✅ Processo de cadastro guiado
- ✅ Configuração inicial básica
- ✅ Fluxo de onboarding visual

#### 3. **Suporte Multicanal (Parcial)**
- ✅ Atendimento via WhatsApp (estrutura básica)
- ✅ Dashboard web responsivo
- ⚠️ Tempo de resposta não otimizado (< 3s)

#### 4. **Governança e Controle (Mínimo)**
- ⚠️ Controle de acesso básico (autenticação)
- ❌ Regras de negócio personalizadas
- ❌ Sistema de aprovações
- ❌ Níveis de permissão granular
- ❌ Revisão de ações automáticas

---

### ❌ **FUNCIONALIDADES NÃO IMPLEMENTADAS**

#### 1. **Segurança e Conformidade (Avançado)**
- ❌ Criptografia de dados em repouso completa
- ❌ Conformidade total com LGPD
- ❌ Consentimento explícito
- ❌ Portabilidade de dados
- ❌ Direito ao esquecimento
- ❌ Autenticação multifator (2FA)
- ❌ Logs de auditoria completos
- ❌ Rastreabilidade de todas as operações

#### 2. **Onboarding Conversacional (Avançado)**
- ❌ Tutorial interativo
- ❌ Migração assistida de dados
- ❌ Configuração personalizada baseada em tipo de negócio
- ❌ Ensino de funcionalidades através de casos de uso

#### 3. **Personalização e Aprendizado**
- ❌ Sistema de aprendizado de preferências
- ❌ Adaptação de respostas e sugestões
- ❌ Configuração de tom de voz dos agentes
- ❌ Ajuste de nível de detalhe das respostas
- ❌ Reconhecimento de contexto de negócio específico

#### 4. **Suporte Multicanal (Completo)**
- ❌ Central de ajuda integrada
- ❌ Tutoriais, FAQs e vídeos explicativos
- ❌ Suporte humano via chat/videochamada

#### 5. **Governança e Controle (Avançado)**
- ❌ Definição de regras de negócio personalizadas
- ❌ Sistema de aprovações para transações
- ❌ Controle de acesso por usuário com níveis de permissão
- ❌ Revisão e correção de ações automáticas

#### 6. **Ecossistema de Integrações Marketplace**
- ❌ Marketplace de integrações
- ❌ SDK e documentação para desenvolvedores
- ❌ Sistema de certificação de integrações
- ❌ Descoberta e instalação via WhatsApp
- ❌ Compartilhamento seguro de dados entre integrações

#### 7. **Motor de Automações No-Code**
- ❌ Criação de automações via interface conversacional
- ❌ Interface visual drag-and-drop
- ❌ Biblioteca de templates de automação
- ❌ Lógica condicional, loops e ações encadeadas
- ❌ Agendamento de automações
- ❌ Log detalhado de execuções
- ❌ Sugestões proativas de automações

#### 8. **Sistema de Colaboração Multi-Usuário**
- ❌ Múltiplos usuários por conta
- ❌ Permissões granulares por módulo
- ❌ Aprovações em múltiplos níveis
- ❌ Feed de atividades
- ❌ Delegação temporária de permissões
- ❌ Comunicação interna (comentários, menções)
- ❌ Rastreamento de contribuições individuais

#### 9. **Assistente de Migração e Importação**
- ❌ Guia conversacional de migração
- ❌ Mapeamento automático de campos
- ❌ Validação de dados importados
- ❌ Importação incremental
- ❌ Versionamento de dados importados
- ❌ Relatório detalhado de migração

#### 10. **Modo Offline e Sincronização**
- ❌ Registro offline de transações
- ❌ Armazenamento local de dados críticos
- ❌ Sincronização automática
- ❌ Resolução inteligente de conflitos
- ❌ Alertas sobre operações pendentes
- ❌ Priorização de sincronização

#### 11. **Sistema de Gamificação e Engajamento**
- ❌ Conquistas e badges
- ❌ Desafios personalizados
- ❌ Competições amigáveis entre usuários
- ❌ Score de saúde financeira/eficiência
- ❌ Celebração de vitórias e marcos

#### 12. **Central de Educação Contextual**
- ❌ Conteúdo educacional micro-learning via WhatsApp
- ❌ Trilhas de aprendizado personalizadas
- ❌ Explicação de conceitos financeiros/comerciais
- ❌ Calculadoras educacionais interativas
- ❌ Conexão com especialistas/comunidade

---

## 📊 Estatísticas de Implementação

### **Por Linha ASTRA:**

| Linha | Funcionalidades Totais | Implementadas | Pendentes | % Completo |
|-------|----------------------|---------------|-----------|------------|
| **ASTRA Sales** | 15 módulos principais | ~3 módulos básicos | 12 módulos | ~15% |
| **ASTRA Finance** | 16 módulos principais | 0 módulos | 16 módulos | 0% |
| **ASTRA Insight** | 20 módulos principais | 0 módulos | 20 módulos | 0% |
| **Transversais** | 12 módulos principais | ~2 módulos básicos | 10 módulos | ~20% |
| **TOTAL** | **63 módulos** | **~5 módulos** | **58 módulos** | **~8%** |

### **Por Categoria de Funcionalidade:**

| Categoria | Implementadas | Pendentes | % Completo |
|----------|---------------|-----------|------------|
| **Infraestrutura** | 7 | 5 | 58% |
| **Frontend** | 8 | 25 | 24% |
| **Backend/API** | 12 | 30 | 29% |
| **Integrações** | 2 | 15 | 12% |
| **IA/ML** | 1 | 20 | 5% |
| **Analytics** | 0 | 20 | 0% |
| **Financeiro** | 0 | 16 | 0% |

---

## 🎯 Prioridades Recomendadas

### **🔴 Crítico (MVP Sales)**
1. **Qualificação Automática de Leads** - Essencial para conversão
2. **Gestão de Pipeline Conversacional** - Core do CRM
3. **Agendamento Inteligente (Avançado)** - Diferencial competitivo
4. **Handoff Humanizado** - Necessário para escalar
5. **Processamento de Pedidos** - Fechamento de vendas

### **🟡 Importante (Próximas Sprints)**
6. **Catálogo de Produtos Dinâmico**
7. **Gestão de Objeções**
8. **Campanhas e Broadcasts Inteligentes**
9. **Motor de Negociação Inteligente**
10. **Central de Conhecimento Conversacional**

### **🟢 Desejável (Roadmap Futuro)**
11. **Gestão de Relacionamento Pós-Venda**
12. **Sistema de Referências e Indicações**
13. **Gestão de Eventos e Webinars**
14. **Integrações Nativas (CRMs, Pagamentos)**
15. **ASTRA Finance** (linha completa)
16. **ASTRA Insight** (linha completa)

---

## 📝 Observações Importantes

1. **Foco Atual:** O projeto está 100% focado em **ASTRA Sales**, com implementação básica de infraestrutura e gestão de clientes/agendamentos.

2. **Gap Crítico:** A maior parte das funcionalidades de **IA conversacional** e **automação inteligente** ainda não foi implementada. O sistema atual depende do n8n para processamento de mensagens.

3. **Arquitetura:** A base está sólida (Next.js, Supabase, Evolution API), mas falta implementar a camada de **orquestração inteligente de agentes** descrita no documento.

4. **Dados Compartilhados:** Não há implementação de **data lake centralizado** ou **event sourcing** mencionados nas considerações de arquitetura.

5. **Precificação Modular:** Não há sistema de módulos/bundles implementado - o projeto atual é monolítico focado em Sales.

---

## 🔄 Próximos Passos Sugeridos

1. **Completar MVP Sales:** Focar nas 5 funcionalidades críticas listadas acima
2. **Implementar Orquestrador de Agentes:** Base para todas as funcionalidades de IA
3. **Criar Data Layer Compartilhado:** Preparar para ASTRA Finance e Insight
4. **Modularizar Arquitetura:** Permitir ativação/desativação de módulos
5. **Expandir para Finance:** Começar com captura multimodal e categorização

---

**Documento gerado automaticamente pela análise comparativa entre FuncionalidadesdasLinhasASTRAv2.md e o código-fonte do projeto atual.**

