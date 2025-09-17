/**
 * Traduções básicas em português para o framework Reynard
 */
export const coreTranslations = {
  // Erros de conexão e API
  connection: {
    failed: "Conexão falhou",
  },

  network: {
    error: "Erro de rede",
  },

  request: {
    aborted: "Solicitação cancelada",
  },

  // Autenticação e segurança
  bearer: {
    token: "Token Bearer",
    "test-key": "Chave de teste Bearer",
    "new-key": "Nova chave Bearer",
  },

  // Notificações
  notifications: {
    title: "Notificações",
    dismiss: "Descartar",
    dismissAll: "Descartar todas",
    markAsRead: "Marcar como lida",
    markAllAsRead: "Marcar todas como lidas",
    noNotifications: "Nenhuma notificação",
    error: "Erro",
    success: "Sucesso",
    warning: "Aviso",
    info: "Informação",
    test: "Notificação de teste",
    "test-1": "Notificação de teste 1",
    "test-2": "Notificação de teste 2",
    first: "Primeira notificação",
    second: "Segunda notificação",
    message: "Mensagem de teste",
    "default-message": "Mensagem padrão",
    "first-message": "Primeira mensagem",
    "second-message": "Segunda mensagem",
    "auto-dismiss": "Descartar automaticamente",
    "error-message": "Mensagem de erro",
    "no-group-message": "Mensagem sem grupo",
    "upload-progress": "Progresso do upload",
    "progress-test": "Teste de progresso",
    "progress-test-2": "Teste de progresso 2",
    "custom-duration": "Duração personalizada",
    "group-message": "Mensagem do grupo",
    "regular-message": "Mensagem regular",
    "created-notification": "Notificação criada",
    "first-grouped": "Primeiro agrupado",
    "second-grouped": "Segundo agrupado",
  },

  // Mensagens de validação
  validation: {
    required: "Este campo é obrigatório",
    invalid: "Valor inválido",
    tooShort: "Valor muito curto",
    tooLong: "Valor muito longo",
    invalidEmail: "Endereço de email inválido",
    invalidUrl: "URL inválida",
    invalidNumber: "Número inválido",
    minValue: "Valor muito pequeno",
    maxValue: "Valor muito grande",
    "invalid-input-type": "Tipo de entrada inválido",
    "does-not-match-pattern": "Entrada não corresponde ao padrão necessário",
  },

  // Validação de senha
  password: {
    "must-be-at-least-8-characters-long": "A senha deve ter pelo menos 8 caracteres",
    "must-contain-at-least-one-uppercase-letter": "A senha deve conter pelo menos uma letra maiúscula",
    "must-contain-at-least-one-lowercase-letter": "A senha deve conter pelo menos uma letra minúscula",
    "must-contain-at-least-one-number": "A senha deve conter pelo menos um número",
    "must-contain-at-least-one-special-character": "A senha deve conter pelo menos um caractere especial",
  },

  // Validação de segurança
  security: {
    "at-least-one-character-type-must-be-included": "Pelo menos um tipo de caractere deve ser incluído",
    "input-contains-potentially-dangerous-html": "Entrada contém HTML potencialmente perigoso",
    "input-contains-potentially-dangerous-sql-patterns": "Entrada contém padrões SQL potencialmente perigosos",
    "input-contains-potentially-dangerous-xss-patterns": "Entrada contém padrões XSS potencialmente perigosos",
    "input-contains-path-traversal-patterns": "Entrada contém padrões de travessia de caminho",
    "input-contains-windows-reserved-names": "Entrada contém nomes reservados do Windows",
    "input-contains-executable-file-extensions": "Entrada contém extensões de arquivos executáveis",
    "input-contains-null-bytes": "Entrada contém bytes nulos",
    "input-contains-hidden-files": "Entrada contém arquivos ocultos",
    "input-contains-javascript-file-extensions": "Entrada contém extensões de arquivos JavaScript",
  },

  // Operações assíncronas
  async: {
    "operation-timed-out": "Operação expirou",
    "custom-timeout": "Timeout personalizado",
    "original-error": "Erro original",
    "first-failure": "Primeira falha",
    "second-failure": "Segunda falha",
    "persistent-failure": "Falha persistente",
    "function-failed": "Função falhou",
    "mapper-failed": "Mapper falhou",
    "concurrency-must-be-greater-than-0": "Concorrência deve ser maior que 0",
    "polling-timeout-reached": "Timeout de polling atingido",
  },

  // Carregamento de módulos
  module: {
    "is-null": "Módulo é null",
    "invalid-structure": "Estrutura de módulo inválida",
    "load-failed": "Carregamento falhou",
    "loading-failed": "Carregamento falhou",
  },

  // Armazenamento e serialização
  storage: {
    "potentially-dangerous-json-detected": "JSON potencialmente perigoso detectado",
    "failed-to-parse-json-from-localstorage": "Falha ao analisar JSON do localStorage:",
    "error-parsing-storage-event": "Erro ao analisar evento de armazenamento para chave",
  },

  // Teste e desenvolvimento
  test: {
    error: "Erro de teste",
    message: "Mensagem de teste",
    notification: "Notificação de teste",
    "notification-1": "Notificação de teste 1",
    "notification-2": "Notificação de teste 2",
  },

  // Erros gerais
  errors: {
    "string-error": "Erro de string",
    "crypto-error": "Erro criptográfico",
    "some-error": "Algum erro",
  },

  // Formatadores e utilitários
  formatters: {
    "hello-world": "Olá mundo",
  },

  // Data e hora
  dateTime: {
    now: "Agora",
    today: "Hoje",
    yesterday: "Ontem",
    tomorrow: "Amanhã",
    format: "Formato",
    timezone: "Fuso horário",
  },

  // Testes de integração
  integration: {
    "session-and-api-key-generation": "Geração de sessão e chave API",
    "authentication-and-input-validation-integration": "Integração de autenticação e validação de entrada",
    "performance-and-security-integration": "Integração de desempenho e segurança",
  },
};
