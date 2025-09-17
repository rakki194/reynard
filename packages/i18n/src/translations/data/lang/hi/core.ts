/**
 * Reynard फ्रेमवर्क के लिए मूल हिंदी अनुवाद
 */
export const coreTranslations = {
  // कनेक्शन और API त्रुटियां
  connection: {
    failed: "कनेक्शन विफल",
  },

  network: {
    error: "नेटवर्क त्रुटि",
  },

  request: {
    aborted: "अनुरोध रद्द",
  },

  // प्रमाणीकरण और सुरक्षा
  bearer: {
    token: "Bearer टोकन",
    "test-key": "Bearer परीक्षण कुंजी",
    "new-key": "Bearer नई कुंजी",
  },

  // सूचनाएं
  notifications: {
    title: "सूचनाएं",
    dismiss: "खारिज करें",
    dismissAll: "सभी खारिज करें",
    markAsRead: "पढ़ा गया चिह्नित करें",
    markAllAsRead: "सभी को पढ़ा गया चिह्नित करें",
    noNotifications: "कोई सूचना नहीं",
    error: "त्रुटि",
    success: "सफलता",
    warning: "चेतावनी",
    info: "जानकारी",
    test: "परीक्षण सूचना",
    "test-1": "परीक्षण सूचना 1",
    "test-2": "परीक्षण सूचना 2",
    first: "पहली सूचना",
    second: "दूसरी सूचना",
    message: "परीक्षण संदेश",
    "default-message": "डिफ़ॉल्ट संदेश",
    "first-message": "पहला संदेश",
    "second-message": "दूसरा संदेश",
    "auto-dismiss": "स्वचालित खारिज",
    "error-message": "त्रुटि संदेश",
    "no-group-message": "समूह रहित संदेश",
    "upload-progress": "अपलोड प्रगति",
    "progress-test": "प्रगति परीक्षण",
    "progress-test-2": "प्रगति परीक्षण 2",
    "custom-duration": "कस्टम अवधि",
    "group-message": "समूह संदेश",
    "regular-message": "नियमित संदेश",
    "created-notification": "बनाई गई सूचना",
    "first-grouped": "पहला समूहीकृत",
    "second-grouped": "दूसरा समूहीकृत",
  },

  // सत्यापन संदेश
  validation: {
    required: "यह फ़ील्ड आवश्यक है",
    invalid: "अमान्य मान",
    tooShort: "मान बहुत छोटा है",
    tooLong: "मान बहुत लंबा है",
    invalidEmail: "अमान्य ईमेल पता",
    invalidUrl: "अमान्य URL",
    invalidNumber: "अमान्य संख्या",
    minValue: "मान बहुत छोटा है",
    maxValue: "मान बहुत बड़ा है",
    "invalid-input-type": "अमान्य इनपुट प्रकार",
    "does-not-match-pattern": "इनपुट आवश्यक पैटर्न से मेल नहीं खाता",
  },

  // पासवर्ड सत्यापन
  password: {
    "must-be-at-least-8-characters-long": "पासवर्ड कम से कम 8 अक्षर का होना चाहिए",
    "must-contain-at-least-one-uppercase-letter": "पासवर्ड में कम से कम एक बड़ा अक्षर होना चाहिए",
    "must-contain-at-least-one-lowercase-letter": "पासवर्ड में कम से कम एक छोटा अक्षर होना चाहिए",
    "must-contain-at-least-one-number": "पासवर्ड में कम से कम एक संख्या होनी चाहिए",
    "must-contain-at-least-one-special-character": "पासवर्ड में कम से कम एक विशेष वर्ण होना चाहिए",
  },

  // सुरक्षा सत्यापन
  security: {
    "at-least-one-character-type-must-be-included": "कम से कम एक वर्ण प्रकार शामिल होना चाहिए",
    "input-contains-potentially-dangerous-html": "इनपुट में संभावित खतरनाक HTML है",
    "input-contains-potentially-dangerous-sql-patterns": "इनपुट में संभावित खतरनाक SQL पैटर्न हैं",
    "input-contains-potentially-dangerous-xss-patterns": "इनपुट में संभावित खतरनाक XSS पैटर्न हैं",
    "input-contains-path-traversal-patterns": "इनपुट में पथ ट्रैवर्सल पैटर्न हैं",
    "input-contains-windows-reserved-names": "इनपुट में Windows आरक्षित नाम हैं",
    "input-contains-executable-file-extensions": "इनपुट में निष्पादन योग्य फ़ाइल एक्सटेंशन हैं",
    "input-contains-null-bytes": "इनपुट में null बाइट्स हैं",
    "input-contains-hidden-files": "इनपुट में छुपी हुई फ़ाइलें हैं",
    "input-contains-javascript-file-extensions": "इनपुट में JavaScript फ़ाइल एक्सटेंशन हैं",
  },

  // अतुल्यकालिक संचालन
  async: {
    "operation-timed-out": "संचालन समय समाप्त",
    "custom-timeout": "कस्टम टाइमआउट",
    "original-error": "मूल त्रुटि",
    "first-failure": "पहली विफलता",
    "second-failure": "दूसरी विफलता",
    "persistent-failure": "लगातार विफलता",
    "function-failed": "फ़ंक्शन विफल",
    "mapper-failed": "मैपर विफल",
    "concurrency-must-be-greater-than-0": "समवर्तिता 0 से अधिक होनी चाहिए",
    "polling-timeout-reached": "पोलिंग टाइमआउट पहुंचा",
  },

  // मॉड्यूल लोडिंग
  module: {
    "is-null": "मॉड्यूल null है",
    "invalid-structure": "अमान्य मॉड्यूल संरचना",
    "load-failed": "लोडिंग विफल",
    "loading-failed": "लोडिंग विफल",
  },

  // भंडारण और क्रमबद्धता
  storage: {
    "potentially-dangerous-json-detected": "संभावित खतरनाक JSON का पता चला",
    "failed-to-parse-json-from-localstorage": "localStorage से JSON पार्स करने में विफल:",
    "error-parsing-storage-event": "कुंजी के लिए भंडारण घटना पार्स करने में त्रुटि",
  },

  // परीक्षण और विकास
  test: {
    error: "परीक्षण त्रुटि",
    message: "परीक्षण संदेश",
    notification: "परीक्षण सूचना",
    "notification-1": "परीक्षण सूचना 1",
    "notification-2": "परीक्षण सूचना 2",
  },

  // सामान्य त्रुटियां
  errors: {
    "string-error": "स्ट्रिंग त्रुटि",
    "crypto-error": "क्रिप्टो त्रुटि",
    "some-error": "कोई त्रुटि",
  },

  // फॉर्मेटर और उपयोगिताएं
  formatters: {
    "hello-world": "नमस्ते दुनिया",
  },

  // दिनांक और समय
  dateTime: {
    now: "अभी",
    today: "आज",
    yesterday: "कल",
    tomorrow: "कल",
    format: "प्रारूप",
    timezone: "समय क्षेत्र",
  },

  // एकीकरण परीक्षण
  integration: {
    "session-and-api-key-generation": "सत्र और API कुंजी जेनरेशन",
    "authentication-and-input-validation-integration": "प्रमाणीकरण और इनपुट सत्यापन एकीकरण",
    "performance-and-security-integration": "प्रदर्शन और सुरक्षा एकीकरण",
  },
};
