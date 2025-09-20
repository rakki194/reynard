/**
 * Reynard框架的中文基础翻译
 */
export const coreTranslations = {
  // 连接和API错误
  connection: {
    failed: "连接失败",
  },

  network: {
    error: "网络错误",
  },

  request: {
    aborted: "请求已中止",
  },

  // 身份验证和安全
  bearer: {
    token: "Bearer令牌",
    "test-key": "Bearer测试密钥",
    "new-key": "Bearer新密钥",
  },

  // 通知
  notifications: {
    title: "通知",
    dismiss: "忽略",
    dismissAll: "忽略全部",
    markAsRead: "标记为已读",
    markAllAsRead: "标记全部为已读",
    noNotifications: "无通知",
    error: "错误",
    success: "成功",
    warning: "警告",
    info: "信息",
    test: "测试通知",
    "test-1": "测试通知1",
    "test-2": "测试通知2",
    first: "第一个通知",
    second: "第二个通知",
    message: "测试消息",
    "default-message": "默认消息",
    "first-message": "第一条消息",
    "second-message": "第二条消息",
    "auto-dismiss": "自动忽略",
    "error-message": "错误消息",
    "no-group-message": "无组消息",
    "upload-progress": "上传进度",
    "progress-test": "进度测试",
    "progress-test-2": "进度测试2",
    "custom-duration": "自定义持续时间",
    "group-message": "组消息",
    "regular-message": "常规消息",
    "created-notification": "已创建通知",
    "first-grouped": "第一个分组",
    "second-grouped": "第二个分组",
  },

  // 验证消息
  validation: {
    required: "此字段为必填项",
    invalid: "无效值",
    tooShort: "值太短",
    tooLong: "值太长",
    invalidEmail: "无效的电子邮件地址",
    invalidUrl: "无效的URL",
    invalidNumber: "无效数字",
    minValue: "值太小",
    maxValue: "值太大",
    "invalid-input-type": "无效的输入类型",
    "does-not-match-pattern": "输入不匹配所需模式",
  },

  // 密码验证
  password: {
    "must-be-at-least-8-characters-long": "密码必须至少8个字符",
    "must-contain-at-least-one-uppercase-letter": "密码必须包含至少一个大写字母",
    "must-contain-at-least-one-lowercase-letter": "密码必须包含至少一个小写字母",
    "must-contain-at-least-one-number": "密码必须包含至少一个数字",
    "must-contain-at-least-one-special-character": "密码必须包含至少一个特殊字符",
  },

  // 安全验证
  security: {
    "at-least-one-character-type-must-be-included": "必须包含至少一种字符类型",
    "input-contains-potentially-dangerous-html": "输入包含潜在危险的HTML",
    "input-contains-potentially-dangerous-sql-patterns": "输入包含潜在危险的SQL模式",
    "input-contains-potentially-dangerous-xss-patterns": "输入包含潜在危险的XSS模式",
    "input-contains-path-traversal-patterns": "输入包含路径遍历模式",
    "input-contains-windows-reserved-names": "输入包含Windows保留名称",
    "input-contains-executable-file-extensions": "输入包含可执行文件扩展名",
    "input-contains-null-bytes": "输入包含空字节",
    "input-contains-hidden-files": "输入包含隐藏文件",
    "input-contains-javascript-file-extensions": "输入包含JavaScript文件扩展名",
  },

  // 异步操作
  async: {
    "operation-timed-out": "操作超时",
    "custom-timeout": "自定义超时",
    "original-error": "原始错误",
    "first-failure": "第一次失败",
    "second-failure": "第二次失败",
    "persistent-failure": "持续失败",
    "function-failed": "函数失败",
    "mapper-failed": "映射器失败",
    "concurrency-must-be-greater-than-0": "并发数必须大于0",
    "polling-timeout-reached": "轮询超时已到达",
  },

  // 模块加载
  module: {
    "is-null": "模块为null",
    "invalid-structure": "无效的模块结构",
    "load-failed": "加载失败",
    "loading-failed": "加载失败",
  },

  // 存储和序列化
  storage: {
    "potentially-dangerous-json-detected": "检测到潜在危险的JSON",
    "failed-to-parse-json-from-localstorage": "从localStorage解析JSON失败：",
    "error-parsing-storage-event": "解析存储事件时出错，键为",
  },

  // 测试和开发
  test: {
    error: "测试错误",
    message: "测试消息",
    notification: "测试通知",
    "notification-1": "测试通知1",
    "notification-2": "测试通知2",
  },

  // 一般错误
  errors: {
    "string-error": "字符串错误",
    "crypto-error": "加密错误",
    "some-error": "某些错误",
  },

  // 格式化器和工具
  formatters: {
    "hello-world": "你好世界",
  },

  // 日期和时间
  dateTime: {
    now: "现在",
    today: "今天",
    yesterday: "昨天",
    tomorrow: "明天",
    format: "格式",
    timezone: "时区",
  },

  // 集成测试
  integration: {
    "session-and-api-key-generation": "会话和API密钥生成",
    "authentication-and-input-validation-integration": "身份验证和输入验证集成",
    "performance-and-security-integration": "性能和安全集成",
  },
};
