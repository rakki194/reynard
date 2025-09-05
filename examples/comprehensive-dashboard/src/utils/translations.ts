import type { Locale, Translations } from "@reynard/core";

// Translation loader that dynamically imports translation files
export const loadTranslations = async (
  locale: Locale,
): Promise<Translations> => {
  try {
    // In a real app, these would be loaded from separate files or a translation service
    const translations: Record<string, Translations> = {
      en: {
        // Navigation
        "nav.dashboard": "Dashboard",
        "nav.charts": "Charts",
        "nav.components": "Components",
        "nav.gallery": "Gallery",
        "nav.auth": "Authentication",
        "nav.settings": "Settings",

        // Dashboard
        "dashboard.title": "Dashboard",
        "dashboard.welcome": "Welcome to Reynard Dashboard",
        "dashboard.overview": "Overview",
        "dashboard.stats": "Statistics",
        "dashboard.recentActivity": "Recent Activity",

        // Analytics
        "analytics.title": "Analytics",
        "analytics.visitors": "Visitors",
        "analytics.pageViews": "Page Views",
        "analytics.revenue": "Revenue",
        "analytics.conversionRate": "Conversion Rate",

        // Users
        "users.title": "User Management",
        "users.total": "Total Users",
        "users.active": "Active Users",
        "users.newToday": "New Today",
        "users.addUser": "Add User",
        "users.name": "Name",
        "users.email": "Email",
        "users.role": "Role",
        "users.status": "Status",
        "users.actions": "Actions",

        // Gallery
        "gallery.title": "Gallery",
        "gallery.upload": "Upload Files",
        "gallery.search": "Search files...",
        "gallery.filter": "Filter",
        "gallery.sort": "Sort",
        "gallery.view": "View",

        // Settings
        "settings.title": "Settings",
        "settings.save": "Save Changes",
        "settings.reset": "Reset to Defaults",
        "settings.import": "Import",
        "settings.export": "Export",

        // Auth
        "auth.login": "Login",
        "auth.logout": "Logout",
        "auth.username": "Username",
        "auth.password": "Password",
        "auth.forgotPassword": "Forgot Password?",
        "auth.rememberMe": "Remember Me",

        // Common
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.delete": "Delete",
        "common.edit": "Edit",
        "common.view": "View",
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "common.search": "Search",
        "common.filter": "Filter",
        "common.sort": "Sort",
        "common.refresh": "Refresh",
      },
      es: {
        // Navigation
        "nav.dashboard": "Panel de Control",
        "nav.analytics": "Analíticas",
        "nav.users": "Usuarios",
        "nav.gallery": "Galería",
        "nav.settings": "Configuración",

        // Dashboard
        "dashboard.title": "Panel de Control",
        "dashboard.welcome": "Bienvenido al Panel de Reynard",
        "dashboard.overview": "Resumen",
        "dashboard.stats": "Estadísticas",
        "dashboard.recentActivity": "Actividad Reciente",

        // Analytics
        "analytics.title": "Analíticas",
        "analytics.visitors": "Visitantes",
        "analytics.pageViews": "Vistas de Página",
        "analytics.revenue": "Ingresos",
        "analytics.conversionRate": "Tasa de Conversión",

        // Users
        "users.title": "Gestión de Usuarios",
        "users.total": "Total de Usuarios",
        "users.active": "Usuarios Activos",
        "users.newToday": "Nuevos Hoy",
        "users.addUser": "Agregar Usuario",
        "users.name": "Nombre",
        "users.email": "Correo",
        "users.role": "Rol",
        "users.status": "Estado",
        "users.actions": "Acciones",

        // Gallery
        "gallery.title": "Galería",
        "gallery.upload": "Subir Archivos",
        "gallery.search": "Buscar archivos...",
        "gallery.filter": "Filtrar",
        "gallery.sort": "Ordenar",
        "gallery.view": "Ver",

        // Settings
        "settings.title": "Configuración",
        "settings.save": "Guardar Cambios",
        "settings.reset": "Restablecer",
        "settings.import": "Importar",
        "settings.export": "Exportar",

        // Auth
        "auth.login": "Iniciar Sesión",
        "auth.logout": "Cerrar Sesión",
        "auth.username": "Usuario",
        "auth.password": "Contraseña",
        "auth.forgotPassword": "¿Olvidaste tu contraseña?",
        "auth.rememberMe": "Recordarme",

        // Common
        "common.save": "Guardar",
        "common.cancel": "Cancelar",
        "common.delete": "Eliminar",
        "common.edit": "Editar",
        "common.view": "Ver",
        "common.loading": "Cargando...",
        "common.error": "Error",
        "common.success": "Éxito",
        "common.search": "Buscar",
        "common.filter": "Filtrar",
        "common.sort": "Ordenar",
        "common.refresh": "Actualizar",
      },
      fr: {
        // Navigation
        "nav.dashboard": "Tableau de Bord",
        "nav.analytics": "Analytiques",
        "nav.users": "Utilisateurs",
        "nav.gallery": "Galerie",
        "nav.settings": "Paramètres",

        // Dashboard
        "dashboard.title": "Tableau de Bord",
        "dashboard.welcome": "Bienvenue sur le Tableau de Bord Reynard",
        "dashboard.overview": "Aperçu",
        "dashboard.stats": "Statistiques",
        "dashboard.recentActivity": "Activité Récente",

        // Analytics
        "analytics.title": "Analytiques",
        "analytics.visitors": "Visiteurs",
        "analytics.pageViews": "Pages Vues",
        "analytics.revenue": "Revenus",
        "analytics.conversionRate": "Taux de Conversion",

        // Users
        "users.title": "Gestion des Utilisateurs",
        "users.total": "Total des Utilisateurs",
        "users.active": "Utilisateurs Actifs",
        "users.newToday": "Nouveaux Aujourd'hui",
        "users.addUser": "Ajouter Utilisateur",
        "users.name": "Nom",
        "users.email": "Email",
        "users.role": "Rôle",
        "users.status": "Statut",
        "users.actions": "Actions",

        // Gallery
        "gallery.title": "Galerie",
        "gallery.upload": "Télécharger des Fichiers",
        "gallery.search": "Rechercher des fichiers...",
        "gallery.filter": "Filtrer",
        "gallery.sort": "Trier",
        "gallery.view": "Voir",

        // Settings
        "settings.title": "Paramètres",
        "settings.save": "Sauvegarder les Changements",
        "settings.reset": "Remettre à Zéro",
        "settings.import": "Importer",
        "settings.export": "Exporter",

        // Auth
        "auth.login": "Connexion",
        "auth.logout": "Déconnexion",
        "auth.username": "Nom d'utilisateur",
        "auth.password": "Mot de passe",
        "auth.forgotPassword": "Mot de passe oublié ?",
        "auth.rememberMe": "Se souvenir de moi",

        // Common
        "common.save": "Sauvegarder",
        "common.cancel": "Annuler",
        "common.delete": "Supprimer",
        "common.edit": "Modifier",
        "common.view": "Voir",
        "common.loading": "Chargement...",
        "common.error": "Erreur",
        "common.success": "Succès",
        "common.search": "Rechercher",
        "common.filter": "Filtrer",
        "common.sort": "Trier",
        "common.refresh": "Actualiser",
      },
    };

    return translations[locale] || translations["en"];
  } catch (error) {
    console.error("Failed to load translations for", locale, error);
    // Fallback to English
    return loadTranslations("en");
  }
};
