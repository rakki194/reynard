/**
 * Arabic translations for Reynard framework
 * الترجمات العربية
 */

import type { Translations } from "../types";

export default {
  common: {
    // Basic actions
    close: "إغلاق",
    delete: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    edit: "تحرير",
    add: "إضافة",
    remove: "إزالة",
    loading: "جارٍ التحميل...",
    error: "خطأ",
    success: "نجاح",
    confirm: "تأكيد",
    download: "تحميل",
    upload: "رفع",
    ok: "موافق",
    open: "فتح",
    copy: "نسخ",
    warning: "تحذير",
    info: "معلومات",
    update: "تحديث",
    clear: "مسح",

    // Navigation
    home: "الرئيسية",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",

    // Data
    path: "المسار",
    size: "الحجم",
    date: "التاريخ",
    name: "الاسم",
    type: "النوع",
    actions: "الإجراءات",
    search: "بحث",
    filter: "تصفية",
    apply: "تطبيق",
    reset: "إعادة تعيين",
    selected: "محدد",
    all: "الكل",
    none: "لا شيء",
    notFound: "غير موجود",

    // UI elements
    toggleTheme: "تغيير السمة",
    theme: "السمة",
    language: "اللغة",
    description: "الوصف",
    settings: "الإعدادات",
    help: "المساعدة",
    about: "حول",
  },

  themes: {
    light: "فاتح",
    gray: "رمادي",
    dark: "داكن",
    banana: "موز",
    strawberry: "فراولة",
    peanut: "فول سوداني",
    "high-contrast-black": "أسود عالي التباين",
    "high-contrast-inverse": "عكسي عالي التباين",
  },

  core: {
    notifications: {
      title: "الإشعارات",
      dismiss: "إغلاق",
      dismissAll: "إغلاق الكل",
      markAsRead: "تعيين كمقروء",
      markAllAsRead: "تعيين الكل كمقروء",
      noNotifications: "لا توجد إشعارات",
      error: "خطأ",
      success: "نجاح",
      warning: "تحذير",
      info: "معلومات",
    },
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
    },
    dateTime: {
      now: "الآن",
      today: "اليوم",
      yesterday: "أمس",
      tomorrow: "غداً",
      format: "التنسيق",
      timezone: "المنطقة الزمنية",
    },
  },

  components: {
    modal: {
      close: "إغلاق",
      confirm: "تأكيد",
      cancel: "إلغاء",
    },
    tabs: {
      next: "التبويب التالي",
      previous: "التبويب السابق",
    },
    dropdown: {
      select: "اختيار",
      clear: "مسح",
      search: "بحث",
      noResults: "لا توجد نتائج",
    },
    tooltip: {
      show: "إظهار التلميح",
      hide: "إخفاء التلميح",
    },
  },

  gallery: {
    upload: {
      title: "رفع الملفات",
      dragDrop: "اسحب وأفلت الملفات هنا",
      selectFiles: "اختيار الملفات",
      progress: "جاري الرفع...",
      complete: "تم الرفع بنجاح",
      failed: "فشل الرفع",
      cancel: "إلغاء الرفع",
    },
    file: {
      name: "الاسم",
      size: "الحجم",
      date: "التاريخ",
      type: "النوع",
      actions: "الإجراءات",
      delete: "حذف",
      rename: "إعادة تسمية",
      move: "نقل",
      copy: "نسخ",
      download: "تحميل",
    },
    folder: {
      create: "إنشاء مجلد",
      delete: "حذف المجلد",
      rename: "إعادة تسمية المجلد",
      move: "نقل المجلد",
      empty: "مجلد فارغ",
    },
    view: {
      grid: "عرض الشبكة",
      list: "عرض القائمة",
      thumbnail: "عرض المصغرات",
      details: "عرض التفاصيل",
    },
    sort: {
      name: "ترتيب حسب الاسم",
      date: "ترتيب حسب التاريخ",
      size: "ترتيب حسب الحجم",
      type: "ترتيب حسب النوع",
      ascending: "تصاعدي",
      descending: "تنازلي",
    },
  },

  charts: {
    types: {
      line: "مخطط خطي",
      bar: "مخطط أعمدة",
      pie: "مخطط دائري",
      area: "مخطط مساحي",
      scatter: "مخطط مبعثر",
      histogram: "مخطط توزيع",
    },
    axes: {
      x: "المحور السيني",
      y: "المحور الصادي",
      value: "القيمة",
      category: "الفئة",
      time: "الوقت",
    },
    legend: {
      show: "إظهار المفتاح",
      hide: "إخفاء المفتاح",
      position: "موضع المفتاح",
    },
    tooltip: {
      show: "إظهار التلميح",
      hide: "إخفاء التلميح",
    },
    data: {
      noData: "لا توجد بيانات",
      loading: "جاري تحميل البيانات...",
      error: "خطأ في تحميل البيانات",
    },
  },

  auth: {
    login: {
      title: "تسجيل الدخول",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      remember: "تذكرني",
      forgot: "نسيت كلمة المرور؟",
      submit: "تسجيل الدخول",
      success: "تم تسجيل الدخول بنجاح",
      failed: "فشل تسجيل الدخول",
    },
    register: {
      title: "إنشاء حساب",
      username: "اسم المستخدم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      submit: "إنشاء الحساب",
      success: "تم إنشاء الحساب بنجاح",
      failed: "فشل إنشاء الحساب",
    },
    logout: {
      title: "تسجيل الخروج",
      confirm: "هل أنت متأكد من تسجيل الخروج؟",
      success: "تم تسجيل الخروج بنجاح",
    },
    profile: {
      title: "الملف الشخصي",
      edit: "تحرير الملف الشخصي",
      save: "حفظ التغييرات",
      cancel: "إلغاء",
    },
  },

  chat: {
    message: {
      send: "إرسال رسالة",
      type: "اكتب رسالة...",
      placeholder: "اكتب رسالتك هنا",
      sent: "تم إرسال الرسالة",
      received: "تم استلام الرسالة",
      failed: "فشل إرسال الرسالة",
    },
    room: {
      create: "إنشاء غرفة",
      join: "الانضمام للغرفة",
      leave: "مغادرة الغرفة",
      delete: "حذف الغرفة",
      name: "اسم الغرفة",
      description: "وصف الغرفة",
    },
    user: {
      online: "متصل",
      offline: "غير متصل",
      typing: "يكتب...",
      away: "غائب",
    },
    p2p: {
      connect: "اتصال",
      disconnect: "قطع الاتصال",
      connected: "متصل",
      disconnected: "غير متصل",
    },
  },

  monaco: {
    editor: {
      save: "حفظ",
      format: "تنسيق الكود",
      find: "بحث",
      replace: "استبدال",
      undo: "تراجع",
      redo: "إعادة",
      cut: "قص",
      copy: "نسخ",
      paste: "لصق",
      selectAll: "تحديد الكل",
    },
    language: {
      select: "اختيار اللغة",
      detect: "كشف اللغة",
    },
    theme: {
      select: "اختيار السمة",
      light: "السمة الفاتحة",
      dark: "السمة الداكنة",
    },
    settings: {
      title: "إعدادات المحرر",
      fontSize: "حجم الخط",
      tabSize: "حجم المسافة البادئة",
      wordWrap: "التفاف النص",
      minimap: "الخريطة المصغرة",
      lineNumbers: "أرقام الأسطر",
    },
  },
} as const satisfies Translations;
