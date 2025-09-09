/**
 * French translations for Reynard framework
 * Traductions françaises
 */

import type { Translations } from "../types";

export default {
  common: {
    // Basic actions
    close: "Fermer",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    edit: "Modifier",
    add: "Ajouter",
    remove: "Supprimer",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    confirm: "Confirmer",
    download: "Télécharger",
    upload: "Téléverser",
    ok: "OK",
    open: "Ouvrir",
    copy: "Copier",
    warning: "Avertissement",
    info: "Information",
    update: "Mettre à jour",
    clear: "Effacer",

    // Navigation
    home: "Accueil",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",

    // Data
    path: "Chemin",
    size: "Taille",
    date: "Date",
    name: "Nom",
    type: "Type",
    actions: "Actions",
    search: "Rechercher",
    filter: "Filtrer",
    apply: "Appliquer",
    reset: "Réinitialiser",
    selected: "Sélectionné",
    all: "Tout",
    none: "Aucun",
    notFound: "Non trouvé",

    // UI elements
    toggleTheme: "Changer le thème",
    theme: "Thème",
    language: "Langue",
    description: "Description",
    settings: "Paramètres",
    help: "Aide",
    about: "À propos",
  },

  themes: {
    light: "Clair",
    gray: "Gris",
    dark: "Sombre",
    banana: "Banane",
    strawberry: "Fraise",
    peanut: "Cacahuète",
    "high-contrast-black": "Noir à contraste élevé",
    "high-contrast-inverse": "Inverse à contraste élevé",
  },

  core: {
    notifications: {
      title: "Notifications",
      dismiss: "Ignorer",
      dismissAll: "Tout ignorer",
      markAsRead: "Marquer comme lu",
      markAllAsRead: "Tout marquer comme lu",
      noNotifications: "Aucune notification",
      error: "Erreur",
      success: "Succès",
      warning: "Avertissement",
      info: "Information",
    },
    validation: {
      required: "Ce champ est requis",
      invalid: "Valeur invalide",
      tooShort: "Valeur trop courte",
      tooLong: "Valeur trop longue",
      invalidEmail: "Adresse e-mail invalide",
      invalidUrl: "URL invalide",
      invalidNumber: "Nombre invalide",
      minValue: "Valeur trop petite",
      maxValue: "Valeur trop grande",
    },
    dateTime: {
      now: "Maintenant",
      today: "Aujourd'hui",
      yesterday: "Hier",
      tomorrow: "Demain",
      format: "Format",
      timezone: "Fuseau horaire",
    },
  },

  components: {
    modal: {
      close: "Fermer",
      confirm: "Confirmer",
      cancel: "Annuler",
    },
    tabs: {
      next: "Onglet suivant",
      previous: "Onglet précédent",
    },
    dropdown: {
      select: "Sélectionner",
      clear: "Effacer",
      search: "Rechercher",
      noResults: "Aucun résultat",
    },
    tooltip: {
      show: "Afficher l'info-bulle",
      hide: "Masquer l'info-bulle",
    },
  },

  gallery: {
    upload: {
      title: "Téléverser des fichiers",
      dragDrop: "Glisser-déposer les fichiers ici",
      selectFiles: "Sélectionner des fichiers",
      progress: "Téléversement en cours...",
      complete: "Téléversement terminé",
      failed: "Échec du téléversement",
      cancel: "Annuler le téléversement",
    },
    file: {
      name: "Nom",
      size: "Taille",
      date: "Date",
      type: "Type",
      actions: "Actions",
      delete: "Supprimer",
      rename: "Renommer",
      move: "Déplacer",
      copy: "Copier",
      download: "Télécharger",
    },
    folder: {
      create: "Créer un dossier",
      delete: "Supprimer le dossier",
      rename: "Renommer le dossier",
      move: "Déplacer le dossier",
      empty: "Dossier vide",
    },
    view: {
      grid: "Vue grille",
      list: "Vue liste",
      thumbnail: "Vue miniatures",
      details: "Vue détails",
    },
    sort: {
      name: "Trier par nom",
      date: "Trier par date",
      size: "Trier par taille",
      type: "Trier par type",
      ascending: "Croissant",
      descending: "Décroissant",
    },
  },

  charts: {
    types: {
      line: "Graphique linéaire",
      bar: "Graphique en barres",
      pie: "Graphique circulaire",
      area: "Graphique en aires",
      scatter: "Nuage de points",
      histogram: "Histogramme",
    },
    axes: {
      x: "Axe X",
      y: "Axe Y",
      value: "Valeur",
      category: "Catégorie",
      time: "Temps",
    },
    legend: {
      show: "Afficher la légende",
      hide: "Masquer la légende",
      position: "Position de la légende",
    },
    tooltip: {
      show: "Afficher l'info-bulle",
      hide: "Masquer l'info-bulle",
    },
    data: {
      noData: "Aucune donnée",
      loading: "Chargement des données...",
      error: "Erreur de chargement des données",
    },
  },

  auth: {
    login: {
      title: "Connexion",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      remember: "Se souvenir de moi",
      forgot: "Mot de passe oublié ?",
      submit: "Se connecter",
      success: "Connexion réussie",
      failed: "Échec de la connexion",
    },
    register: {
      title: "S'inscrire",
      username: "Nom d'utilisateur",
      email: "E-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      submit: "S'inscrire",
      success: "Inscription réussie",
      failed: "Échec de l'inscription",
    },
    logout: {
      title: "Déconnexion",
      confirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
      success: "Déconnexion réussie",
    },
    profile: {
      title: "Profil",
      edit: "Modifier le profil",
      save: "Enregistrer les modifications",
      cancel: "Annuler",
    },
  },

  chat: {
    message: {
      send: "Envoyer un message",
      type: "Tapez un message...",
      placeholder: "Tapez votre message ici",
      sent: "Message envoyé",
      received: "Message reçu",
      failed: "Échec de l'envoi du message",
    },
    room: {
      create: "Créer une salle",
      join: "Rejoindre la salle",
      leave: "Quitter la salle",
      delete: "Supprimer la salle",
      name: "Nom de la salle",
      description: "Description de la salle",
    },
    user: {
      online: "En ligne",
      offline: "Hors ligne",
      typing: "En train de taper...",
      away: "Absent",
    },
    p2p: {
      connect: "Se connecter",
      disconnect: "Se déconnecter",
      connected: "Connecté",
      disconnected: "Déconnecté",
    },
  },

  monaco: {
    editor: {
      save: "Enregistrer",
      format: "Formater le code",
      find: "Rechercher",
      replace: "Remplacer",
      undo: "Annuler",
      redo: "Refaire",
      cut: "Couper",
      copy: "Copier",
      paste: "Coller",
      selectAll: "Tout sélectionner",
    },
    language: {
      select: "Sélectionner la langue",
      detect: "Détecter la langue",
    },
    theme: {
      select: "Sélectionner le thème",
      light: "Thème clair",
      dark: "Thème sombre",
    },
    settings: {
      title: "Paramètres de l'éditeur",
      fontSize: "Taille de police",
      tabSize: "Taille de tabulation",
      wordWrap: "Retour à la ligne",
      minimap: "Minimap",
      lineNumbers: "Numéros de ligne",
    },
  },
} as const satisfies Translations;
