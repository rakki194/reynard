/**
 * Reynard framework için temel Türkçe çeviriler
 */
export const coreTranslations = {
  // Bağlantı ve API hataları
  connection: {
    failed: "Bağlantı başarısız",
  },

  network: {
    error: "Ağ hatası",
  },

  request: {
    aborted: "İstek iptal edildi",
  },

  // Kimlik doğrulama ve güvenlik
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer test anahtarı",
    "new-key": "Bearer yeni anahtar",
  },

  // Bildirimler
  notifications: {
    title: "Bildirimler",
    dismiss: "Reddet",
    dismissAll: "Tümünü reddet",
    markAsRead: "Okundu olarak işaretle",
    markAllAsRead: "Tümünü okundu olarak işaretle",
    noNotifications: "Bildirim yok",
    error: "Hata",
    success: "Başarılı",
    warning: "Uyarı",
    info: "Bilgi",
    test: "Test bildirimi",
    "test-1": "Test bildirimi 1",
    "test-2": "Test bildirimi 2",
    first: "İlk bildirim",
    second: "İkinci bildirim",
    message: "Test mesajı",
    "default-message": "Varsayılan mesaj",
    "first-message": "İlk mesaj",
    "second-message": "İkinci mesaj",
    "auto-dismiss": "Otomatik reddetme",
    "error-message": "Hata mesajı",
    "no-group-message": "Grup olmayan mesaj",
    "upload-progress": "Yükleme ilerlemesi",
    "progress-test": "İlerleme testi",
    "progress-test-2": "İlerleme testi 2",
    "custom-duration": "Özel süre",
    "group-message": "Grup mesajı",
    "regular-message": "Normal mesaj",
    "created-notification": "Oluşturulan bildirim",
    "first-grouped": "İlk gruplandırılmış",
    "second-grouped": "İkinci gruplandırılmış",
  },

  // Doğrulama mesajları
  validation: {
    required: "Bu alan zorunludur",
    invalid: "Geçersiz değer",
    tooShort: "Değer çok kısa",
    tooLong: "Değer çok uzun",
    invalidEmail: "Geçersiz e-posta adresi",
    invalidUrl: "Geçersiz URL",
    invalidNumber: "Geçersiz numara",
    minValue: "Değer çok küçük",
    maxValue: "Değer çok büyük",
    "invalid-input-type": "Geçersiz giriş türü",
    "does-not-match-pattern": "Giriş gerekli desenle eşleşmiyor",
  },

  // Şifre doğrulama
  password: {
    "must-be-at-least-8-characters-long": "Şifre en az 8 karakter olmalıdır",
    "must-contain-at-least-one-uppercase-letter": "Şifre en az bir büyük harf içermelidir",
    "must-contain-at-least-one-lowercase-letter": "Şifre en az bir küçük harf içermelidir",
    "must-contain-at-least-one-number": "Şifre en az bir rakam içermelidir",
    "must-contain-at-least-one-special-character": "Şifre en az bir özel karakter içermelidir",
  },

  // Güvenlik doğrulama
  security: {
    "at-least-one-character-type-must-be-included": "En az bir karakter türü dahil edilmelidir",
    "input-contains-potentially-dangerous-html": "Giriş potansiyel olarak tehlikeli HTML içeriyor",
    "input-contains-potentially-dangerous-sql-patterns": "Giriş potansiyel olarak tehlikeli SQL desenleri içeriyor",
    "input-contains-potentially-dangerous-xss-patterns": "Giriş potansiyel olarak tehlikeli XSS desenleri içeriyor",
    "input-contains-path-traversal-patterns": "Giriş yol geçiş desenleri içeriyor",
    "input-contains-windows-reserved-names": "Giriş Windows ayrılmış isimleri içeriyor",
    "input-contains-executable-file-extensions": "Giriş çalıştırılabilir dosya uzantıları içeriyor",
    "input-contains-null-bytes": "Giriş null baytları içeriyor",
    "input-contains-hidden-files": "Giriş gizli dosyalar içeriyor",
    "input-contains-javascript-file-extensions": "Giriş JavaScript dosya uzantıları içeriyor",
  },

  // Asenkron işlemler
  async: {
    "operation-timed-out": "İşlem zaman aşımına uğradı",
    "custom-timeout": "Özel zaman aşımı",
    "original-error": "Orijinal hata",
    "first-failure": "İlk başarısızlık",
    "second-failure": "İkinci başarısızlık",
    "persistent-failure": "Kalıcı başarısızlık",
    "function-failed": "Fonksiyon başarısız",
    "mapper-failed": "Mapper başarısız",
    "concurrency-must-be-greater-than-0": "Eşzamanlılık 0'dan büyük olmalıdır",
    "polling-timeout-reached": "Yoklama zaman aşımına ulaşıldı",
  },

  // Modül yükleme
  module: {
    "is-null": "Modül null",
    "invalid-structure": "Geçersiz modül yapısı",
    "load-failed": "Yükleme başarısız",
    "loading-failed": "Yükleme başarısız",
  },

  // Depolama ve serileştirme
  storage: {
    "potentially-dangerous-json-detected": "Potansiyel olarak tehlikeli JSON tespit edildi",
    "failed-to-parse-json-from-localstorage": "localStorage'dan JSON ayrıştırılamadı:",
    "error-parsing-storage-event": "Anahtar için depolama olayını ayrıştırırken hata",
  },

  // Test ve geliştirme
  test: {
    error: "Test hatası",
    message: "Test mesajı",
    notification: "Test bildirimi",
    "notification-1": "Test bildirimi 1",
    "notification-2": "Test bildirimi 2",
  },

  // Genel hatalar
  errors: {
    "string-error": "Dize hatası",
    "crypto-error": "Şifreleme hatası",
    "some-error": "Bir hata",
  },

  // Biçimlendiriciler ve yardımcılar
  formatters: {
    "hello-world": "Merhaba dünya",
  },

  // Tarih ve saat
  dateTime: {
    now: "Şimdi",
    today: "Bugün",
    yesterday: "Dün",
    tomorrow: "Yarın",
    format: "Biçim",
    timezone: "Saat dilimi",
  },

  // Entegrasyon testleri
  integration: {
    "session-and-api-key-generation": "Oturum ve API anahtarı oluşturma",
    "authentication-and-input-validation-integration": "Kimlik doğrulama ve giriş doğrulama entegrasyonu",
    "performance-and-security-integration": "Performans ve güvenlik entegrasyonu",
  },
};
