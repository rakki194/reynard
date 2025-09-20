/**
 * Traductions françaises de base pour le framework Reynard
 */
export const coreTranslations = {
  // Erreurs de connexion et API
  connection: {
    failed: "Connexion échouée",
  },

  network: {
    error: "Erreur réseau",
  },

  request: {
    aborted: "Requête abandonnée",
  },

  // Authentification et sécurité
  bearer: {
    token: "Token Bearer",
    "test-key": "Clé de test Bearer",
    "new-key": "Nouvelle clé Bearer",
  },

  // Notifications
  notifications: {
    title: "Notifications",
    dismiss: "Rejeter",
    dismissAll: "Rejeter tout",
    markAsRead: "Marquer comme lu",
    markAllAsRead: "Marquer tout comme lu",
    noNotifications: "Aucune notification",
    error: "Erreur",
    success: "Succès",
    warning: "Avertissement",
    info: "Information",
    test: "Notification de test",
    "test-1": "Notification de test 1",
    "test-2": "Notification de test 2",
    first: "Première notification",
    second: "Deuxième notification",
    message: "Message de test",
    "default-message": "Message par défaut",
    "first-message": "Premier message",
    "second-message": "Deuxième message",
    "auto-dismiss": "Rejet automatique",
    "error-message": "Message d'erreur",
    "no-group-message": "Message sans groupe",
    "upload-progress": "Progrès de téléchargement",
    "progress-test": "Test de progression",
    "progress-test-2": "Test de progression 2",
    "custom-duration": "Durée personnalisée",
    "group-message": "Message de groupe",
    "regular-message": "Message régulier",
    "created-notification": "Notification créée",
    "first-grouped": "Premier groupé",
    "second-grouped": "Deuxième groupé",
  },

  // Messages de validation
  validation: {
    required: "Ce champ est requis",
    invalid: "Valeur invalide",
    tooShort: "La valeur est trop courte",
    tooLong: "La valeur est trop longue",
    invalidEmail: "Adresse e-mail invalide",
    invalidUrl: "URL invalide",
    invalidNumber: "Numéro invalide",
    minValue: "La valeur est trop petite",
    maxValue: "La valeur est trop grande",
    "invalid-input-type": "Type d'entrée invalide",
    "does-not-match-pattern": "L'entrée ne correspond pas au modèle requis",
  },

  // Validation de mot de passe
  password: {
    "must-be-at-least-8-characters-long": "Le mot de passe doit contenir au moins 8 caractères",
    "must-contain-at-least-one-uppercase-letter": "Le mot de passe doit contenir au moins une lettre majuscule",
    "must-contain-at-least-one-lowercase-letter": "Le mot de passe doit contenir au moins une lettre minuscule",
    "must-contain-at-least-one-number": "Le mot de passe doit contenir au moins un chiffre",
    "must-contain-at-least-one-special-character": "Le mot de passe doit contenir au moins un caractère spécial",
  },

  // Validation de sécurité
  security: {
    "at-least-one-character-type-must-be-included": "Au moins un type de caractère doit être inclus",
    "input-contains-potentially-dangerous-html": "L'entrée contient du HTML potentiellement dangereux",
    "input-contains-potentially-dangerous-sql-patterns": "L'entrée contient des modèles SQL potentiellement dangereux",
    "input-contains-potentially-dangerous-xss-patterns": "L'entrée contient des modèles XSS potentiellement dangereux",
    "input-contains-path-traversal-patterns": "L'entrée contient des modèles de traversée de chemin",
    "input-contains-windows-reserved-names": "L'entrée contient des noms réservés Windows",
    "input-contains-executable-file-extensions": "L'entrée contient des extensions de fichiers exécutables",
    "input-contains-null-bytes": "L'entrée contient des octets nuls",
    "input-contains-hidden-files": "L'entrée contient des fichiers cachés",
    "input-contains-javascript-file-extensions": "L'entrée contient des extensions de fichiers JavaScript",
  },

  // Opérations asynchrones
  async: {
    "operation-timed-out": "L'opération a expiré",
    "custom-timeout": "Délai d'attente personnalisé",
    "original-error": "Erreur originale",
    "first-failure": "Premier échec",
    "second-failure": "Deuxième échec",
    "persistent-failure": "Échec persistant",
    "function-failed": "La fonction a échoué",
    "mapper-failed": "Le mapper a échoué",
    "concurrency-must-be-greater-than-0": "La concurrence doit être supérieure à 0",
    "polling-timeout-reached": "Délai d'attente de sondage atteint",
  },

  // Chargement de modules
  module: {
    "is-null": "Le module est null",
    "invalid-structure": "Structure de module invalide",
    "load-failed": "Le chargement a échoué",
    "loading-failed": "Le chargement a échoué",
  },

  // Stockage et sérialisation
  storage: {
    "potentially-dangerous-json-detected": "JSON potentiellement dangereux détecté",
    "failed-to-parse-json-from-localstorage": "Échec de l'analyse JSON depuis localStorage:",
    "error-parsing-storage-event": "Erreur lors de l'analyse de l'événement de stockage pour la clé",
  },

  // Test et développement
  test: {
    error: "Erreur de test",
    message: "Message de test",
    notification: "Notification de test",
    "notification-1": "Notification de test 1",
    "notification-2": "Notification de test 2",
  },

  // Erreurs générales
  errors: {
    "string-error": "Erreur de chaîne",
    "crypto-error": "Erreur cryptographique",
    "some-error": "Une erreur",
  },

  // Formateurs et utilitaires
  formatters: {
    "hello-world": "Bonjour le monde",
  },

  // Date et heure
  dateTime: {
    now: "Maintenant",
    today: "Aujourd'hui",
    yesterday: "Hier",
    tomorrow: "Demain",
    format: "Format",
    timezone: "Fuseau horaire",
  },

  // Tests d'intégration
  integration: {
    "session-and-api-key-generation": "Génération de session et clé API",
    "authentication-and-input-validation-integration": "Intégration d'authentification et validation d'entrée",
    "performance-and-security-integration": "Intégration de performance et sécurité",
  },
};
