/**
 * Bản dịch tiếng Việt cơ bản cho framework Reynard
 */
export const coreTranslations = {
  // Lỗi kết nối và API
  connection: {
    failed: "Kết nối thất bại",
  },

  network: {
    error: "Lỗi mạng",
  },

  request: {
    aborted: "Yêu cầu bị hủy",
  },

  // Xác thực và bảo mật
  bearer: {
    token: "Token Bearer",
    "test-key": "Khóa thử nghiệm Bearer",
    "new-key": "Khóa mới Bearer",
  },

  // Thông báo
  notifications: {
    title: "Thông báo",
    dismiss: "Bỏ qua",
    dismissAll: "Bỏ qua tất cả",
    markAsRead: "Đánh dấu đã đọc",
    markAllAsRead: "Đánh dấu tất cả đã đọc",
    noNotifications: "Không có thông báo",
    error: "Lỗi",
    success: "Thành công",
    warning: "Cảnh báo",
    info: "Thông tin",
    test: "Thông báo thử nghiệm",
    "test-1": "Thông báo thử nghiệm 1",
    "test-2": "Thông báo thử nghiệm 2",
    first: "Thông báo đầu tiên",
    second: "Thông báo thứ hai",
    message: "Tin nhắn thử nghiệm",
    "default-message": "Tin nhắn mặc định",
    "first-message": "Tin nhắn đầu tiên",
    "second-message": "Tin nhắn thứ hai",
    "auto-dismiss": "Tự động bỏ qua",
    "error-message": "Tin nhắn lỗi",
    "no-group-message": "Tin nhắn không nhóm",
    "upload-progress": "Tiến trình tải lên",
    "progress-test": "Thử nghiệm tiến trình",
    "progress-test-2": "Thử nghiệm tiến trình 2",
    "custom-duration": "Thời lượng tùy chỉnh",
    "group-message": "Tin nhắn nhóm",
    "regular-message": "Tin nhắn thông thường",
    "created-notification": "Thông báo đã tạo",
    "first-grouped": "Đầu tiên được nhóm",
    "second-grouped": "Thứ hai được nhóm",
  },

  // Thông báo xác thực
  validation: {
    required: "Trường này là bắt buộc",
    invalid: "Giá trị không hợp lệ",
    tooShort: "Giá trị quá ngắn",
    tooLong: "Giá trị quá dài",
    invalidEmail: "Địa chỉ email không hợp lệ",
    invalidUrl: "URL không hợp lệ",
    invalidNumber: "Số không hợp lệ",
    minValue: "Giá trị quá nhỏ",
    maxValue: "Giá trị quá lớn",
    "invalid-input-type": "Loại đầu vào không hợp lệ",
    "does-not-match-pattern": "Đầu vào không khớp với mẫu yêu cầu",
  },

  // Xác thực mật khẩu
  password: {
    "must-be-at-least-8-characters-long": "Mật khẩu phải có ít nhất 8 ký tự",
    "must-contain-at-least-one-uppercase-letter": "Mật khẩu phải chứa ít nhất một chữ hoa",
    "must-contain-at-least-one-lowercase-letter": "Mật khẩu phải chứa ít nhất một chữ thường",
    "must-contain-at-least-one-number": "Mật khẩu phải chứa ít nhất một số",
    "must-contain-at-least-one-special-character": "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
  },

  // Xác thực bảo mật
  security: {
    "at-least-one-character-type-must-be-included": "Phải bao gồm ít nhất một loại ký tự",
    "input-contains-potentially-dangerous-html": "Đầu vào chứa HTML có thể nguy hiểm",
    "input-contains-potentially-dangerous-sql-patterns": "Đầu vào chứa các mẫu SQL có thể nguy hiểm",
    "input-contains-potentially-dangerous-xss-patterns": "Đầu vào chứa các mẫu XSS có thể nguy hiểm",
    "input-contains-path-traversal-patterns": "Đầu vào chứa các mẫu duyệt đường dẫn",
    "input-contains-windows-reserved-names": "Đầu vào chứa tên dành riêng của Windows",
    "input-contains-executable-file-extensions": "Đầu vào chứa phần mở rộng tệp thực thi",
    "input-contains-null-bytes": "Đầu vào chứa byte null",
    "input-contains-hidden-files": "Đầu vào chứa tệp ẩn",
    "input-contains-javascript-file-extensions": "Đầu vào chứa phần mở rộng tệp JavaScript",
  },

  // Hoạt động bất đồng bộ
  async: {
    "operation-timed-out": "Hoạt động hết thời gian",
    "custom-timeout": "Thời gian chờ tùy chỉnh",
    "original-error": "Lỗi gốc",
    "first-failure": "Lỗi đầu tiên",
    "second-failure": "Lỗi thứ hai",
    "persistent-failure": "Lỗi liên tục",
    "function-failed": "Hàm thất bại",
    "mapper-failed": "Mapper thất bại",
    "concurrency-must-be-greater-than-0": "Đồng thời phải lớn hơn 0",
    "polling-timeout-reached": "Đã đạt thời gian chờ thăm dò",
  },

  // Tải mô-đun
  module: {
    "is-null": "Mô-đun là null",
    "invalid-structure": "Cấu trúc mô-đun không hợp lệ",
    "load-failed": "Tải thất bại",
    "loading-failed": "Tải thất bại",
  },

  // Lưu trữ và tuần tự hóa
  storage: {
    "potentially-dangerous-json-detected": "Phát hiện JSON có thể nguy hiểm",
    "failed-to-parse-json-from-localstorage": "Không thể phân tích JSON từ localStorage:",
    "error-parsing-storage-event": "Lỗi phân tích sự kiện lưu trữ cho khóa",
  },

  // Kiểm tra và phát triển
  test: {
    error: "Lỗi kiểm tra",
    message: "Tin nhắn kiểm tra",
    notification: "Thông báo kiểm tra",
    "notification-1": "Thông báo kiểm tra 1",
    "notification-2": "Thông báo kiểm tra 2",
  },

  // Lỗi chung
  errors: {
    "string-error": "Lỗi chuỗi",
    "crypto-error": "Lỗi mã hóa",
    "some-error": "Một số lỗi",
  },

  // Định dạng và tiện ích
  formatters: {
    "hello-world": "Xin chào thế giới",
  },

  // Ngày và giờ
  dateTime: {
    now: "Bây giờ",
    today: "Hôm nay",
    yesterday: "Hôm qua",
    tomorrow: "Ngày mai",
    format: "Định dạng",
    timezone: "Múi giờ",
  },

  // Kiểm tra tích hợp
  integration: {
    "session-and-api-key-generation": "Tạo phiên và khóa API",
    "authentication-and-input-validation-integration": "Tích hợp xác thực và xác thực đầu vào",
    "performance-and-security-integration": "Tích hợp hiệu suất và bảo mật",
  },
};
