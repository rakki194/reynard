/**
 * การแปลภาษาไทยพื้นฐานสำหรับเฟรมเวิร์ก Reynard
 */
export const coreTranslations = {
  // ข้อผิดพลาดการเชื่อมต่อและ API
  connection: {
    failed: "การเชื่อมต่อล้มเหลว",
  },

  network: {
    error: "ข้อผิดพลาดเครือข่าย",
  },

  request: {
    aborted: "คำขอถูกยกเลิก",
  },

  // การรับรองตัวตนและความปลอดภัย
  bearer: {
    token: "โทเค็น Bearer",
    "test-key": "คีย์ทดสอบ Bearer",
    "new-key": "คีย์ใหม่ Bearer",
  },

  // การแจ้งเตือน
  notifications: {
    title: "การแจ้งเตือน",
    dismiss: "ยกเลิก",
    dismissAll: "ยกเลิกทั้งหมด",
    markAsRead: "ทำเครื่องหมายว่าอ่านแล้ว",
    markAllAsRead: "ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว",
    noNotifications: "ไม่มีการแจ้งเตือน",
    error: "ข้อผิดพลาด",
    success: "สำเร็จ",
    warning: "คำเตือน",
    info: "ข้อมูล",
    test: "การแจ้งเตือนทดสอบ",
    "test-1": "การแจ้งเตือนทดสอบ 1",
    "test-2": "การแจ้งเตือนทดสอบ 2",
    first: "การแจ้งเตือนแรก",
    second: "การแจ้งเตือนที่สอง",
    message: "ข้อความทดสอบ",
    "default-message": "ข้อความเริ่มต้น",
    "first-message": "ข้อความแรก",
    "second-message": "ข้อความที่สอง",
    "auto-dismiss": "ยกเลิกอัตโนมัติ",
    "error-message": "ข้อความข้อผิดพลาด",
    "no-group-message": "ข้อความไม่มีกลุ่ม",
    "upload-progress": "ความคืบหน้าการอัปโหลด",
    "progress-test": "การทดสอบความคืบหน้า",
    "progress-test-2": "การทดสอบความคืบหน้า 2",
    "custom-duration": "ระยะเวลาที่กำหนดเอง",
    "group-message": "ข้อความกลุ่ม",
    "regular-message": "ข้อความปกติ",
    "created-notification": "การแจ้งเตือนที่สร้างขึ้น",
    "first-grouped": "กลุ่มแรก",
    "second-grouped": "กลุ่มที่สอง",
  },

  // ข้อความการตรวจสอบ
  validation: {
    required: "ฟิลด์นี้จำเป็น",
    invalid: "ค่าไม่ถูกต้อง",
    tooShort: "ค่าสั้นเกินไป",
    tooLong: "ค่ายาวเกินไป",
    invalidEmail: "ที่อยู่อีเมลไม่ถูกต้อง",
    invalidUrl: "URL ไม่ถูกต้อง",
    invalidNumber: "หมายเลขไม่ถูกต้อง",
    minValue: "ค่าเล็กเกินไป",
    maxValue: "ค่าใหญ่เกินไป",
    "invalid-input-type": "ประเภทอินพุตไม่ถูกต้อง",
    "does-not-match-pattern": "อินพุตไม่ตรงกับรูปแบบที่ต้องการ",
  },

  // การตรวจสอบรหัสผ่าน
  password: {
    "must-be-at-least-8-characters-long": "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    "must-contain-at-least-one-uppercase-letter": "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัว",
    "must-contain-at-least-one-lowercase-letter": "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อยหนึ่งตัว",
    "must-contain-at-least-one-number": "รหัสผ่านต้องมีตัวเลขอย่างน้อยหนึ่งตัว",
    "must-contain-at-least-one-special-character": "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งตัว",
  },

  // การตรวจสอบความปลอดภัย
  security: {
    "at-least-one-character-type-must-be-included": "ต้องรวมประเภทอักขระอย่างน้อยหนึ่งประเภท",
    "input-contains-potentially-dangerous-html": "อินพุตมี HTML ที่อาจเป็นอันตราย",
    "input-contains-potentially-dangerous-sql-patterns": "อินพุตมีรูปแบบ SQL ที่อาจเป็นอันตราย",
    "input-contains-potentially-dangerous-xss-patterns": "อินพุตมีรูปแบบ XSS ที่อาจเป็นอันตราย",
    "input-contains-path-traversal-patterns": "อินพุตมีรูปแบบการข้ามเส้นทาง",
    "input-contains-windows-reserved-names": "อินพุตมีชื่อที่สงวนไว้ของ Windows",
    "input-contains-executable-file-extensions": "อินพุตมีนามสกุลไฟล์ที่ปฏิบัติการได้",
    "input-contains-null-bytes": "อินพุตมีไบต์ null",
    "input-contains-hidden-files": "อินพุตมีไฟล์ที่ซ่อนอยู่",
    "input-contains-javascript-file-extensions": "อินพุตมีนามสกุลไฟล์ JavaScript",
  },

  // การดำเนินการแบบอะซิงโครนัส
  async: {
    "operation-timed-out": "การดำเนินการหมดเวลา",
    "custom-timeout": "การหมดเวลาที่กำหนดเอง",
    "original-error": "ข้อผิดพลาดเดิม",
    "first-failure": "ความล้มเหลวครั้งแรก",
    "second-failure": "ความล้มเหลวครั้งที่สอง",
    "persistent-failure": "ความล้มเหลวอย่างต่อเนื่อง",
    "function-failed": "ฟังก์ชันล้มเหลว",
    "mapper-failed": "แมปเปอร์ล้มเหลว",
    "concurrency-must-be-greater-than-0": "การทำงานพร้อมกันต้องมากกว่า 0",
    "polling-timeout-reached": "ถึงการหมดเวลาการสำรวจ",
  },

  // การโหลดโมดูล
  module: {
    "is-null": "โมดูลเป็น null",
    "invalid-structure": "โครงสร้างโมดูลไม่ถูกต้อง",
    "load-failed": "การโหลดล้มเหลว",
    "loading-failed": "การโหลดล้มเหลว",
  },

  // การจัดเก็บและการจัดลำดับ
  storage: {
    "potentially-dangerous-json-detected": "ตรวจพบ JSON ที่อาจเป็นอันตราย",
    "failed-to-parse-json-from-localstorage": "ไม่สามารถแยกวิเคราะห์ JSON จาก localStorage:",
    "error-parsing-storage-event": "ข้อผิดพลาดในการแยกวิเคราะห์เหตุการณ์การจัดเก็บสำหรับคีย์",
  },

  // การทดสอบและการพัฒนา
  test: {
    error: "ข้อผิดพลาดการทดสอบ",
    message: "ข้อความทดสอบ",
    notification: "การแจ้งเตือนทดสอบ",
    "notification-1": "การแจ้งเตือนทดสอบ 1",
    "notification-2": "การแจ้งเตือนทดสอบ 2",
  },

  // ข้อผิดพลาดทั่วไป
  errors: {
    "string-error": "ข้อผิดพลาดสตริง",
    "crypto-error": "ข้อผิดพลาดการเข้ารหัส",
    "some-error": "ข้อผิดพลาดบางอย่าง",
  },

  // ตัวจัดรูปแบบและเครื่องมือ
  formatters: {
    "hello-world": "สวัสดีโลก",
  },

  // วันที่และเวลา
  dateTime: {
    now: "ตอนนี้",
    today: "วันนี้",
    yesterday: "เมื่อวาน",
    tomorrow: "พรุ่งนี้",
    format: "รูปแบบ",
    timezone: "เขตเวลา",
  },

  // การทดสอบการรวม
  integration: {
    "session-and-api-key-generation": "การสร้างเซสชันและคีย์ API",
    "authentication-and-input-validation-integration": "การรวมการรับรองตัวตนและการตรวจสอบอินพุต",
    "performance-and-security-integration": "การรวมประสิทธิภาพและความปลอดภัย",
  },
};
