/**
 * Reynardフレームワークの基本日本語翻訳
 */
export const coreTranslations = {
  // 接続とAPIエラー
  connection: {
    failed: "接続に失敗しました",
  },

  network: {
    error: "ネットワークエラー",
  },

  request: {
    aborted: "リクエストが中止されました",
  },

  // 認証とセキュリティ
  bearer: {
    token: "Bearerトークン",
    "test-key": "Bearerテストキー",
    "new-key": "Bearer新しいキー",
  },

  // 通知
  notifications: {
    title: "通知",
    dismiss: "却下",
    dismissAll: "すべて却下",
    markAsRead: "既読にする",
    markAllAsRead: "すべて既読にする",
    noNotifications: "通知はありません",
    error: "エラー",
    success: "成功",
    warning: "警告",
    info: "情報",
    test: "テスト通知",
    "test-1": "テスト通知1",
    "test-2": "テスト通知2",
    first: "最初の通知",
    second: "2番目の通知",
    message: "テストメッセージ",
    "default-message": "デフォルトメッセージ",
    "first-message": "最初のメッセージ",
    "second-message": "2番目のメッセージ",
    "auto-dismiss": "自動却下",
    "error-message": "エラーメッセージ",
    "no-group-message": "グループなしメッセージ",
    "upload-progress": "アップロード進捗",
    "progress-test": "進捗テスト",
    "progress-test-2": "進捗テスト2",
    "custom-duration": "カスタム期間",
    "group-message": "グループメッセージ",
    "regular-message": "通常メッセージ",
    "created-notification": "作成された通知",
    "first-grouped": "最初のグループ化",
    "second-grouped": "2番目のグループ化",
  },

  // バリデーションメッセージ
  validation: {
    required: "このフィールドは必須です",
    invalid: "無効な値",
    tooShort: "値が短すぎます",
    tooLong: "値が長すぎます",
    invalidEmail: "無効なメールアドレス",
    invalidUrl: "無効なURL",
    invalidNumber: "無効な番号",
    minValue: "値が小さすぎます",
    maxValue: "値が大きすぎます",
    "invalid-input-type": "無効な入力タイプ",
    "does-not-match-pattern": "入力が要求されたパターンに一致しません",
  },

  // パスワードバリデーション
  password: {
    "must-be-at-least-8-characters-long": "パスワードは8文字以上である必要があります",
    "must-contain-at-least-one-uppercase-letter": "パスワードには少なくとも1つの大文字が含まれている必要があります",
    "must-contain-at-least-one-lowercase-letter": "パスワードには少なくとも1つの小文字が含まれている必要があります",
    "must-contain-at-least-one-number": "パスワードには少なくとも1つの数字が含まれている必要があります",
    "must-contain-at-least-one-special-character": "パスワードには少なくとも1つの特殊文字が含まれている必要があります",
  },

  // セキュリティバリデーション
  security: {
    "at-least-one-character-type-must-be-included": "少なくとも1つの文字タイプが含まれている必要があります",
    "input-contains-potentially-dangerous-html": "入力に潜在的に危険なHTMLが含まれています",
    "input-contains-potentially-dangerous-sql-patterns": "入力に潜在的に危険なSQLパターンが含まれています",
    "input-contains-potentially-dangerous-xss-patterns": "入力に潜在的に危険なXSSパターンが含まれています",
    "input-contains-path-traversal-patterns": "入力にパストラバーサルパターンが含まれています",
    "input-contains-windows-reserved-names": "入力にWindows予約名が含まれています",
    "input-contains-executable-file-extensions": "入力に実行可能ファイル拡張子が含まれています",
    "input-contains-null-bytes": "入力にnullバイトが含まれています",
    "input-contains-hidden-files": "入力に隠しファイルが含まれています",
    "input-contains-javascript-file-extensions": "入力にJavaScriptファイル拡張子が含まれています",
  },

  // 非同期操作
  async: {
    "operation-timed-out": "操作がタイムアウトしました",
    "custom-timeout": "カスタムタイムアウト",
    "original-error": "元のエラー",
    "first-failure": "最初の失敗",
    "second-failure": "2番目の失敗",
    "persistent-failure": "永続的な失敗",
    "function-failed": "関数が失敗しました",
    "mapper-failed": "マッパーが失敗しました",
    "concurrency-must-be-greater-than-0": "並行性は0より大きくなければなりません",
    "polling-timeout-reached": "ポーリングタイムアウトに達しました",
  },

  // モジュール読み込み
  module: {
    "is-null": "モジュールがnullです",
    "invalid-structure": "無効なモジュール構造",
    "load-failed": "読み込みに失敗しました",
    "loading-failed": "読み込みに失敗しました",
  },

  // ストレージとシリアライゼーション
  storage: {
    "potentially-dangerous-json-detected": "潜在的に危険なJSONが検出されました",
    "failed-to-parse-json-from-localstorage": "localStorageからJSONの解析に失敗しました:",
    "error-parsing-storage-event": "キーのストレージイベント解析エラー",
  },

  // テストと開発
  test: {
    error: "テストエラー",
    message: "テストメッセージ",
    notification: "テスト通知",
    "notification-1": "テスト通知1",
    "notification-2": "テスト通知2",
  },

  // 一般的なエラー
  errors: {
    "string-error": "文字列エラー",
    "crypto-error": "暗号化エラー",
    "some-error": "何らかのエラー",
  },

  // フォーマッターとユーティリティ
  formatters: {
    "hello-world": "こんにちは世界",
  },

  // 日付と時刻
  dateTime: {
    now: "今",
    today: "今日",
    yesterday: "昨日",
    tomorrow: "明日",
    format: "フォーマット",
    timezone: "タイムゾーン",
  },

  // 統合テスト
  integration: {
    "session-and-api-key-generation": "セッションとAPIキーの生成",
    "authentication-and-input-validation-integration": "認証と入力バリデーションの統合",
    "performance-and-security-integration": "パフォーマンスとセキュリティの統合",
  },
};
