/**
 * الترجمات الأساسية العربية لإطار عمل Reynard
 */
export const coreTranslations = {
  // أخطاء الاتصال وواجهة برمجة التطبيقات
  connection: {
    failed: "فشل الاتصال",
  },

  network: {
    error: "خطأ في الشبكة",
  },

  request: {
    aborted: "تم إلغاء الطلب",
  },

  // المصادقة والأمان
  bearer: {
    token: "رمز Bearer",
    "test-key": "مفتاح اختبار Bearer",
    "new-key": "مفتاح جديد Bearer",
  },

  // الإشعارات
  notifications: {
    title: "الإشعارات",
    dismiss: "رفض",
    dismissAll: "رفض الكل",
    markAsRead: "وضع علامة كمقروء",
    markAllAsRead: "وضع علامة على الكل كمقروء",
    noNotifications: "لا توجد إشعارات",
    error: "خطأ",
    success: "نجح",
    warning: "تحذير",
    info: "معلومات",
    test: "إشعار اختبار",
    "test-1": "إشعار اختبار 1",
    "test-2": "إشعار اختبار 2",
    first: "الإشعار الأول",
    second: "الإشعار الثاني",
    message: "رسالة اختبار",
    "default-message": "رسالة افتراضية",
    "first-message": "الرسالة الأولى",
    "second-message": "الرسالة الثانية",
    "auto-dismiss": "رفض تلقائي",
    "error-message": "رسالة خطأ",
    "no-group-message": "رسالة بدون مجموعة",
    "upload-progress": "تقدم التحميل",
    "progress-test": "اختبار التقدم",
    "progress-test-2": "اختبار التقدم 2",
    "custom-duration": "مدة مخصصة",
    "group-message": "رسالة المجموعة",
    "regular-message": "رسالة عادية",
    "created-notification": "إشعار تم إنشاؤه",
    "first-grouped": "أول مجمع",
    "second-grouped": "ثاني مجمع",
  },

  // رسائل التحقق
  validation: {
    required: "هذا الحقل مطلوب",
    invalid: "قيمة غير صحيحة",
    tooShort: "القيمة قصيرة جداً",
    tooLong: "القيمة طويلة جداً",
    invalidEmail: "عنوان بريد إلكتروني غير صحيح",
    invalidUrl: "رابط غير صحيح",
    invalidNumber: "رقم غير صحيح",
    minValue: "القيمة صغيرة جداً",
    maxValue: "القيمة كبيرة جداً",
    "invalid-input-type": "نوع الإدخال غير صحيح",
    "does-not-match-pattern": "الإدخال لا يطابق النمط المطلوب",
  },

  // التحقق من كلمة المرور
  password: {
    "must-be-at-least-8-characters-long": "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
    "must-contain-at-least-one-uppercase-letter": "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل",
    "must-contain-at-least-one-lowercase-letter": "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل",
    "must-contain-at-least-one-number": "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل",
    "must-contain-at-least-one-special-character": "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل",
  },

  // التحقق من الأمان
  security: {
    "at-least-one-character-type-must-be-included": "يجب تضمين نوع حرف واحد على الأقل",
    "input-contains-potentially-dangerous-html": "الإدخال يحتوي على HTML محتمل الخطورة",
    "input-contains-potentially-dangerous-sql-patterns": "الإدخال يحتوي على أنماط SQL محتملة الخطورة",
    "input-contains-potentially-dangerous-xss-patterns": "الإدخال يحتوي على أنماط XSS محتملة الخطورة",
    "input-contains-path-traversal-patterns": "الإدخال يحتوي على أنماط اجتياز المسار",
    "input-contains-windows-reserved-names": "الإدخال يحتوي على أسماء محجوزة في Windows",
    "input-contains-executable-file-extensions": "الإدخال يحتوي على امتدادات ملفات قابلة للتنفيذ",
    "input-contains-null-bytes": "الإدخال يحتوي على بايتات فارغة",
    "input-contains-hidden-files": "الإدخال يحتوي على ملفات مخفية",
    "input-contains-javascript-file-extensions": "الإدخال يحتوي على امتدادات ملفات JavaScript",
  },

  // العمليات غير المتزامنة
  async: {
    "operation-timed-out": "انتهت مهلة العملية",
    "custom-timeout": "مهلة مخصصة",
    "original-error": "خطأ أصلي",
    "first-failure": "الفشل الأول",
    "second-failure": "الفشل الثاني",
    "persistent-failure": "فشل مستمر",
    "function-failed": "فشلت الوظيفة",
    "mapper-failed": "فشل المعالج",
    "concurrency-must-be-greater-than-0": "يجب أن يكون التزامن أكبر من 0",
    "polling-timeout-reached": "تم الوصول إلى مهلة الاستطلاع",
  },

  // تحميل الوحدات
  module: {
    "is-null": "الوحدة فارغة",
    "invalid-structure": "هيكل وحدة غير صحيح",
    "load-failed": "فشل التحميل",
    "loading-failed": "فشل التحميل",
  },

  // التخزين والتسلسل
  storage: {
    "potentially-dangerous-json-detected": "تم اكتشاف JSON محتمل الخطورة",
    "failed-to-parse-json-from-localstorage": "فشل في تحليل JSON من localStorage:",
    "error-parsing-storage-event": "خطأ في تحليل حدث التخزين للمفتاح",
  },

  // الاختبار والتطوير
  test: {
    error: "خطأ اختبار",
    message: "رسالة اختبار",
    notification: "إشعار اختبار",
    "notification-1": "إشعار اختبار 1",
    "notification-2": "إشعار اختبار 2",
  },

  // الأخطاء العامة
  errors: {
    "string-error": "خطأ نصي",
    "crypto-error": "خطأ تشفير",
    "some-error": "خطأ ما",
  },

  // المنسقات والأدوات
  formatters: {
    "hello-world": "مرحباً بالعالم",
  },

  // التاريخ والوقت
  dateTime: {
    now: "الآن",
    today: "اليوم",
    yesterday: "أمس",
    tomorrow: "غداً",
    format: "تنسيق",
    timezone: "المنطقة الزمنية",
  },

  // اختبارات التكامل
  integration: {
    "session-and-api-key-generation": "إنشاء الجلسة ومفتاح واجهة برمجة التطبيقات",
    "authentication-and-input-validation-integration": "تكامل المصادقة والتحقق من الإدخال",
    "performance-and-security-integration": "تكامل الأداء والأمان",
  },
};
