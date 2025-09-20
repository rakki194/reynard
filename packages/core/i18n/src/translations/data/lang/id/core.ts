/**
 * Terjemahan bahasa Indonesia dasar untuk framework Reynard
 */
export const coreTranslations = {
  // Kesalahan koneksi dan API
  connection: {
    failed: "Koneksi gagal",
  },

  network: {
    error: "Kesalahan jaringan",
  },

  request: {
    aborted: "Permintaan dibatalkan",
  },

  // Autentikasi dan keamanan
  bearer: {
    token: "Token Bearer",
    "test-key": "Kunci uji Bearer",
    "new-key": "Kunci baru Bearer",
  },

  // Notifikasi
  notifications: {
    title: "Notifikasi",
    dismiss: "Tolak",
    dismissAll: "Tolak semua",
    markAsRead: "Tandai sebagai dibaca",
    markAllAsRead: "Tandai semua sebagai dibaca",
    noNotifications: "Tidak ada notifikasi",
    error: "Kesalahan",
    success: "Berhasil",
    warning: "Peringatan",
    info: "Informasi",
    test: "Notifikasi uji",
    "test-1": "Notifikasi uji 1",
    "test-2": "Notifikasi uji 2",
    first: "Notifikasi pertama",
    second: "Notifikasi kedua",
    message: "Pesan uji",
    "default-message": "Pesan default",
    "first-message": "Pesan pertama",
    "second-message": "Pesan kedua",
    "auto-dismiss": "Tolak otomatis",
    "error-message": "Pesan kesalahan",
    "no-group-message": "Pesan tanpa grup",
    "upload-progress": "Kemajuan unggah",
    "progress-test": "Uji kemajuan",
    "progress-test-2": "Uji kemajuan 2",
    "custom-duration": "Durasi kustom",
    "group-message": "Pesan grup",
    "regular-message": "Pesan biasa",
    "created-notification": "Notifikasi dibuat",
    "first-grouped": "Pertama dikelompokkan",
    "second-grouped": "Kedua dikelompokkan",
  },

  // Pesan validasi
  validation: {
    required: "Field ini wajib diisi",
    invalid: "Nilai tidak valid",
    tooShort: "Nilai terlalu pendek",
    tooLong: "Nilai terlalu panjang",
    invalidEmail: "Alamat email tidak valid",
    invalidUrl: "URL tidak valid",
    invalidNumber: "Nomor tidak valid",
    minValue: "Nilai terlalu kecil",
    maxValue: "Nilai terlalu besar",
    "invalid-input-type": "Tipe input tidak valid",
    "does-not-match-pattern": "Input tidak sesuai dengan pola yang diperlukan",
  },

  // Validasi kata sandi
  password: {
    "must-be-at-least-8-characters-long": "Kata sandi harus minimal 8 karakter",
    "must-contain-at-least-one-uppercase-letter": "Kata sandi harus mengandung minimal satu huruf besar",
    "must-contain-at-least-one-lowercase-letter": "Kata sandi harus mengandung minimal satu huruf kecil",
    "must-contain-at-least-one-number": "Kata sandi harus mengandung minimal satu angka",
    "must-contain-at-least-one-special-character": "Kata sandi harus mengandung minimal satu karakter khusus",
  },

  // Validasi keamanan
  security: {
    "at-least-one-character-type-must-be-included": "Minimal satu tipe karakter harus disertakan",
    "input-contains-potentially-dangerous-html": "Input mengandung HTML yang berpotensi berbahaya",
    "input-contains-potentially-dangerous-sql-patterns": "Input mengandung pola SQL yang berpotensi berbahaya",
    "input-contains-potentially-dangerous-xss-patterns": "Input mengandung pola XSS yang berpotensi berbahaya",
    "input-contains-path-traversal-patterns": "Input mengandung pola penelusuran jalur",
    "input-contains-windows-reserved-names": "Input mengandung nama cadangan Windows",
    "input-contains-executable-file-extensions": "Input mengandung ekstensi file yang dapat dieksekusi",
    "input-contains-null-bytes": "Input mengandung byte null",
    "input-contains-hidden-files": "Input mengandung file tersembunyi",
    "input-contains-javascript-file-extensions": "Input mengandung ekstensi file JavaScript",
  },

  // Operasi asinkron
  async: {
    "operation-timed-out": "Operasi habis waktu",
    "custom-timeout": "Timeout kustom",
    "original-error": "Kesalahan asli",
    "first-failure": "Kegagalan pertama",
    "second-failure": "Kegagalan kedua",
    "persistent-failure": "Kegagalan persisten",
    "function-failed": "Fungsi gagal",
    "mapper-failed": "Mapper gagal",
    "concurrency-must-be-greater-than-0": "Konkurensi harus lebih besar dari 0",
    "polling-timeout-reached": "Timeout polling tercapai",
  },

  // Memuat modul
  module: {
    "is-null": "Modul adalah null",
    "invalid-structure": "Struktur modul tidak valid",
    "load-failed": "Pemuatan gagal",
    "loading-failed": "Pemuatan gagal",
  },

  // Penyimpanan dan serialisasi
  storage: {
    "potentially-dangerous-json-detected": "JSON yang berpotensi berbahaya terdeteksi",
    "failed-to-parse-json-from-localstorage": "Gagal memparse JSON dari localStorage:",
    "error-parsing-storage-event": "Kesalahan memparse event penyimpanan untuk kunci",
  },

  // Uji dan pengembangan
  test: {
    error: "Kesalahan uji",
    message: "Pesan uji",
    notification: "Notifikasi uji",
    "notification-1": "Notifikasi uji 1",
    "notification-2": "Notifikasi uji 2",
  },

  // Kesalahan umum
  errors: {
    "string-error": "Kesalahan string",
    "crypto-error": "Kesalahan kripto",
    "some-error": "Beberapa kesalahan",
  },

  // Pemformat dan utilitas
  formatters: {
    "hello-world": "Halo dunia",
  },

  // Tanggal dan waktu
  dateTime: {
    now: "Sekarang",
    today: "Hari ini",
    yesterday: "Kemarin",
    tomorrow: "Besok",
    format: "Format",
    timezone: "Zona waktu",
  },

  // Uji integrasi
  integration: {
    "session-and-api-key-generation": "Generasi sesi dan kunci API",
    "authentication-and-input-validation-integration": "Integrasi autentikasi dan validasi input",
    "performance-and-security-integration": "Integrasi kinerja dan keamanan",
  },
};
