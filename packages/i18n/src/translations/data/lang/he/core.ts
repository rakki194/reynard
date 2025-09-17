/**
 * תרגומים עבריים בסיסיים למסגרת Reynard
 */
export const coreTranslations = {
  // שגיאות חיבור ו-API
  connection: {
    failed: "החיבור נכשל",
  },

  network: {
    error: "שגיאת רשת",
  },

  request: {
    aborted: "הבקשה בוטלה",
  },

  // אימות ואבטחה
  bearer: {
    token: "אסימון Bearer",
    "test-key": "מפתח בדיקה Bearer",
    "new-key": "מפתח חדש Bearer",
  },

  // התראות
  notifications: {
    title: "התראות",
    dismiss: "דחה",
    dismissAll: "דחה הכל",
    markAsRead: "סמן כנקרא",
    markAllAsRead: "סמן הכל כנקרא",
    noNotifications: "אין התראות",
    error: "שגיאה",
    success: "הצלחה",
    warning: "אזהרה",
    info: "מידע",
    test: "התראת בדיקה",
    "test-1": "התראת בדיקה 1",
    "test-2": "התראת בדיקה 2",
    first: "התראה ראשונה",
    second: "התראה שנייה",
    message: "הודעת בדיקה",
    "default-message": "הודעה ברירת מחדל",
    "first-message": "הודעה ראשונה",
    "second-message": "הודעה שנייה",
    "auto-dismiss": "דחייה אוטומטית",
    "error-message": "הודעת שגיאה",
    "no-group-message": "הודעה ללא קבוצה",
    "upload-progress": "התקדמות העלאה",
    "progress-test": "בדיקת התקדמות",
    "progress-test-2": "בדיקת התקדמות 2",
    "custom-duration": "משך זמן מותאם אישית",
    "group-message": "הודעת קבוצה",
    "regular-message": "הודעה רגילה",
    "created-notification": "התראה שנוצרה",
    "first-grouped": "ראשון מקובץ",
    "second-grouped": "שני מקובץ",
  },

  // הודעות אימות
  validation: {
    required: "שדה זה נדרש",
    invalid: "ערך לא תקין",
    tooShort: "הערך קצר מדי",
    tooLong: "הערך ארוך מדי",
    invalidEmail: "כתובת אימייל לא תקינה",
    invalidUrl: "כתובת URL לא תקינה",
    invalidNumber: "מספר לא תקין",
    minValue: "הערך קטן מדי",
    maxValue: "הערך גדול מדי",
    "invalid-input-type": "סוג קלט לא תקין",
    "does-not-match-pattern": "הקלט אינו תואם לתבנית הנדרשת",
  },

  // אימות סיסמה
  password: {
    "must-be-at-least-8-characters-long": "הסיסמה חייבת להכיל לפחות 8 תווים",
    "must-contain-at-least-one-uppercase-letter": "הסיסמה חייבת להכיל לפחות אות גדולה אחת",
    "must-contain-at-least-one-lowercase-letter": "הסיסמה חייבת להכיל לפחות אות קטנה אחת",
    "must-contain-at-least-one-number": "הסיסמה חייבת להכיל לפחות מספר אחד",
    "must-contain-at-least-one-special-character": "הסיסמה חייבת להכיל לפחות תו מיוחד אחד",
  },

  // אימות אבטחה
  security: {
    "at-least-one-character-type-must-be-included": "חייב להיות כלול לפחות סוג תו אחד",
    "input-contains-potentially-dangerous-html": "הקלט מכיל HTML שעלול להיות מסוכן",
    "input-contains-potentially-dangerous-sql-patterns": "הקלט מכיל דפוסי SQL שעלולים להיות מסוכנים",
    "input-contains-potentially-dangerous-xss-patterns": "הקלט מכיל דפוסי XSS שעלולים להיות מסוכנים",
    "input-contains-path-traversal-patterns": "הקלט מכיל דפוסי מעבר נתיב",
    "input-contains-windows-reserved-names": "הקלט מכיל שמות שמורים של Windows",
    "input-contains-executable-file-extensions": "הקלט מכיל סיומות קבצים הניתנים לביצוע",
    "input-contains-null-bytes": "הקלט מכיל בתים ריקים",
    "input-contains-hidden-files": "הקלט מכיל קבצים מוסתרים",
    "input-contains-javascript-file-extensions": "הקלט מכיל סיומות קבצי JavaScript",
  },

  // פעולות אסינכרוניות
  async: {
    "operation-timed-out": "הפעולה פגה",
    "custom-timeout": "פג זמן מותאם אישית",
    "original-error": "שגיאה מקורית",
    "first-failure": "כשל ראשון",
    "second-failure": "כשל שני",
    "persistent-failure": "כשל מתמשך",
    "function-failed": "הפונקציה נכשלה",
    "mapper-failed": "ה-mapper נכשל",
    "concurrency-must-be-greater-than-0": "המקבילות חייבת להיות גדולה מ-0",
    "polling-timeout-reached": "פג זמן הבדיקה",
  },

  // טעינת מודולים
  module: {
    "is-null": "המודול הוא null",
    "invalid-structure": "מבנה מודול לא תקין",
    "load-failed": "הטעינה נכשלה",
    "loading-failed": "הטעינה נכשלה",
  },

  // אחסון וסריאליזציה
  storage: {
    "potentially-dangerous-json-detected": "זוהה JSON שעלול להיות מסוכן",
    "failed-to-parse-json-from-localstorage": "נכשל בניתוח JSON מ-localStorage:",
    "error-parsing-storage-event": "שגיאה בניתוח אירוע אחסון עבור מפתח",
  },

  // בדיקה ופיתוח
  test: {
    error: "שגיאת בדיקה",
    message: "הודעת בדיקה",
    notification: "התראת בדיקה",
    "notification-1": "התראת בדיקה 1",
    "notification-2": "התראת בדיקה 2",
  },

  // שגיאות כלליות
  errors: {
    "string-error": "שגיאת מחרוזת",
    "crypto-error": "שגיאת הצפנה",
    "some-error": "איזו שגיאה",
  },

  // מעצבים וכלי עזר
  formatters: {
    "hello-world": "שלום עולם",
  },

  // תאריך ושעה
  dateTime: {
    now: "עכשיו",
    today: "היום",
    yesterday: "אתמול",
    tomorrow: "מחר",
    format: "פורמט",
    timezone: "אזור זמן",
  },

  // בדיקות אינטגרציה
  integration: {
    "session-and-api-key-generation": "יצירת הפעלה ומפתח API",
    "authentication-and-input-validation-integration": "אינטגרציה של אימות ואימות קלט",
    "performance-and-security-integration": "אינטגרציה של ביצועים ואבטחה",
  },
};
