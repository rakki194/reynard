/**
 * Βασικές ελληνικές μεταφράσεις για το πλαίσιο Reynard
 */
export const coreTranslations = {
  // Σφάλματα σύνδεσης και API
  connection: {
    failed: "Η σύνδεση απέτυχε",
  },

  network: {
    error: "Σφάλμα δικτύου",
  },

  request: {
    aborted: "Το αίτημα ακυρώθηκε",
  },

  // Εξουσιοδότηση και ασφάλεια
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer κλειδί δοκιμής",
    "new-key": "Bearer νέο κλειδί",
  },

  // Ειδοποιήσεις
  notifications: {
    title: "Ειδοποιήσεις",
    dismiss: "Απόρριψη",
    dismissAll: "Απόρριψη όλων",
    markAsRead: "Σήμανση ως αναγνωσμένο",
    markAllAsRead: "Σήμανση όλων ως αναγνωσμένα",
    noNotifications: "Δεν υπάρχουν ειδοποιήσεις",
    error: "Σφάλμα",
    success: "Επιτυχία",
    warning: "Προειδοποίηση",
    info: "Πληροφορία",
    test: "Ειδοποίηση δοκιμής",
    "test-1": "Ειδοποίηση δοκιμής 1",
    "test-2": "Ειδοποίηση δοκιμής 2",
    first: "Πρώτη ειδοποίηση",
    second: "Δεύτερη ειδοποίηση",
    message: "Μήνυμα δοκιμής",
    "default-message": "Προεπιλεγμένο μήνυμα",
    "first-message": "Πρώτο μήνυμα",
    "second-message": "Δεύτερο μήνυμα",
    "auto-dismiss": "Αυτόματη απόρριψη",
    "error-message": "Μήνυμα σφάλματος",
    "no-group-message": "Μήνυμα χωρίς ομάδα",
    "upload-progress": "Πρόοδος ανεβάσματος",
    "progress-test": "Δοκιμή προόδου",
    "progress-test-2": "Δοκιμή προόδου 2",
    "custom-duration": "Προσαρμοσμένη διάρκεια",
    "group-message": "Μήνυμα ομάδας",
    "regular-message": "Κανονικό μήνυμα",
    "created-notification": "Δημιουργημένη ειδοποίηση",
    "first-grouped": "Πρώτο ομαδοποιημένο",
    "second-grouped": "Δεύτερο ομαδοποιημένο",
  },

  // Μηνύματα επαλήθευσης
  validation: {
    required: "Αυτό το πεδίο είναι υποχρεωτικό",
    invalid: "Μη έγκυρη τιμή",
    tooShort: "Η τιμή είναι πολύ σύντομη",
    tooLong: "Η τιμή είναι πολύ μεγάλη",
    invalidEmail: "Μη έγκυρη διεύθυνση email",
    invalidUrl: "Μη έγκυρη URL",
    invalidNumber: "Μη έγκυρος αριθμός",
    minValue: "Η τιμή είναι πολύ μικρή",
    maxValue: "Η τιμή είναι πολύ μεγάλη",
    "invalid-input-type": "Μη έγκυρος τύπος εισόδου",
    "does-not-match-pattern": "Η είσοδος δεν ταιριάζει με το απαιτούμενο μοτίβο",
  },

  // Επαλήθευση κωδικού πρόσβασης
  password: {
    "must-be-at-least-8-characters-long": "Ο κωδικός πρόσβασης πρέπει να είναι τουλάχιστον 8 χαρακτήρες",
    "must-contain-at-least-one-uppercase-letter":
      "Ο κωδικός πρόσβασης πρέπει να περιέχει τουλάχιστον ένα κεφαλαίο γράμμα",
    "must-contain-at-least-one-lowercase-letter": "Ο κωδικός πρόσβασης πρέπει να περιέχει τουλάχιστον ένα πεζό γράμμα",
    "must-contain-at-least-one-number": "Ο κωδικός πρόσβασης πρέπει να περιέχει τουλάχιστον έναν αριθμό",
    "must-contain-at-least-one-special-character":
      "Ο κωδικός πρόσβασης πρέπει να περιέχει τουλάχιστον έναν ειδικό χαρακτήρα",
  },

  // Επαλήθευση ασφαλείας
  security: {
    "at-least-one-character-type-must-be-included": "Πρέπει να συμπεριληφθεί τουλάχιστον ένας τύπος χαρακτήρα",
    "input-contains-potentially-dangerous-html": "Η είσοδος περιέχει πιθανώς επικίνδυνο HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Η είσοδος περιέχει πιθανώς επικίνδυνα SQL μοτίβα",
    "input-contains-potentially-dangerous-xss-patterns": "Η είσοδος περιέχει πιθανώς επικίνδυνα XSS μοτίβα",
    "input-contains-path-traversal-patterns": "Η είσοδος περιέχει μοτίβα διέλευσης διαδρομής",
    "input-contains-windows-reserved-names": "Η είσοδος περιέχει δεσμευμένα ονόματα Windows",
    "input-contains-executable-file-extensions": "Η είσοδος περιέχει επεκτάσεις εκτελέσιμων αρχείων",
    "input-contains-null-bytes": "Η είσοδος περιέχει null bytes",
    "input-contains-hidden-files": "Η είσοδος περιέχει κρυφά αρχεία",
    "input-contains-javascript-file-extensions": "Η είσοδος περιέχει επεκτάσεις αρχείων JavaScript",
  },

  // Ασύγχρονες λειτουργίες
  async: {
    "operation-timed-out": "Η λειτουργία έληξε",
    "custom-timeout": "Προσαρμοσμένο timeout",
    "original-error": "Αρχικό σφάλμα",
    "first-failure": "Πρώτη αποτυχία",
    "second-failure": "Δεύτερη αποτυχία",
    "persistent-failure": "Επίμονη αποτυχία",
    "function-failed": "Η λειτουργία απέτυχε",
    "mapper-failed": "Ο mapper απέτυχε",
    "concurrency-must-be-greater-than-0": "Η ταυτόχρονη εκτέλεση πρέπει να είναι μεγαλύτερη από 0",
    "polling-timeout-reached": "Επιτεύχθηκε timeout polling",
  },

  // Φόρτωση μονάδων
  module: {
    "is-null": "Η μονάδα είναι null",
    "invalid-structure": "Μη έγκυρη δομή μονάδας",
    "load-failed": "Η φόρτωση απέτυχε",
    "loading-failed": "Η φόρτωση απέτυχε",
  },

  // Αποθήκευση και σειριοποίηση
  storage: {
    "potentially-dangerous-json-detected": "Εντοπίστηκε πιθανώς επικίνδυνο JSON",
    "failed-to-parse-json-from-localstorage": "Αποτυχία ανάλυσης JSON από localStorage:",
    "error-parsing-storage-event": "Σφάλμα ανάλυσης συμβάντος αποθήκευσης για κλειδί",
  },

  // Δοκιμή και ανάπτυξη
  test: {
    error: "Σφάλμα δοκιμής",
    message: "Μήνυμα δοκιμής",
    notification: "Ειδοποίηση δοκιμής",
    "notification-1": "Ειδοποίηση δοκιμής 1",
    "notification-2": "Ειδοποίηση δοκιμής 2",
  },

  // Γενικά σφάλματα
  errors: {
    "string-error": "Σφάλμα συμβολοσειράς",
    "crypto-error": "Σφάλμα κρυπτογράφησης",
    "some-error": "Κάποιο σφάλμα",
  },

  // Μορφοποιητές και βοηθητικά
  formatters: {
    "hello-world": "Γεια σου κόσμε",
  },

  // Ημερομηνία και ώρα
  dateTime: {
    now: "Τώρα",
    today: "Σήμερα",
    yesterday: "Χθες",
    tomorrow: "Αύριο",
    format: "Μορφή",
    timezone: "Ζώνη ώρας",
  },

  // Δοκιμές ολοκλήρωσης
  integration: {
    "session-and-api-key-generation": "Δημιουργία συνεδρίας και κλειδιού API",
    "authentication-and-input-validation-integration": "Ολοκλήρωση εξουσιοδότησης και επαλήθευσης εισόδου",
    "performance-and-security-integration": "Ολοκλήρωση απόδοσης και ασφαλείας",
  },
};
