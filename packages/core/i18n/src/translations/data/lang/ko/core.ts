/**
 * Reynard 프레임워크를 위한 기본 한국어 번역
 */
export const coreTranslations = {
  // 연결 및 API 오류
  connection: {
    failed: "연결 실패",
  },

  network: {
    error: "네트워크 오류",
  },

  request: {
    aborted: "요청이 중단됨",
  },

  // 인증 및 보안
  bearer: {
    token: "Bearer 토큰",
    "test-key": "Bearer 테스트 키",
    "new-key": "Bearer 새 키",
  },

  // 알림
  notifications: {
    title: "알림",
    dismiss: "해제",
    dismissAll: "모두 해제",
    markAsRead: "읽음으로 표시",
    markAllAsRead: "모두 읽음으로 표시",
    noNotifications: "알림 없음",
    error: "오류",
    success: "성공",
    warning: "경고",
    info: "정보",
    test: "테스트 알림",
    "test-1": "테스트 알림 1",
    "test-2": "테스트 알림 2",
    first: "첫 번째 알림",
    second: "두 번째 알림",
    message: "테스트 메시지",
    "default-message": "기본 메시지",
    "first-message": "첫 번째 메시지",
    "second-message": "두 번째 메시지",
    "auto-dismiss": "자동 해제",
    "error-message": "오류 메시지",
    "no-group-message": "그룹 없는 메시지",
    "upload-progress": "업로드 진행률",
    "progress-test": "진행률 테스트",
    "progress-test-2": "진행률 테스트 2",
    "custom-duration": "사용자 정의 지속 시간",
    "group-message": "그룹 메시지",
    "regular-message": "일반 메시지",
    "created-notification": "생성된 알림",
    "first-grouped": "첫 번째 그룹화",
    "second-grouped": "두 번째 그룹화",
  },

  // 유효성 검사 메시지
  validation: {
    required: "이 필드는 필수입니다",
    invalid: "유효하지 않은 값",
    tooShort: "값이 너무 짧습니다",
    tooLong: "값이 너무 깁니다",
    invalidEmail: "유효하지 않은 이메일 주소",
    invalidUrl: "유효하지 않은 URL",
    invalidNumber: "유효하지 않은 숫자",
    minValue: "값이 너무 작습니다",
    maxValue: "값이 너무 큽니다",
    "invalid-input-type": "유효하지 않은 입력 유형",
    "does-not-match-pattern": "입력이 필요한 패턴과 일치하지 않습니다",
  },

  // 비밀번호 유효성 검사
  password: {
    "must-be-at-least-8-characters-long": "비밀번호는 최소 8자 이상이어야 합니다",
    "must-contain-at-least-one-uppercase-letter": "비밀번호는 최소 하나의 대문자를 포함해야 합니다",
    "must-contain-at-least-one-lowercase-letter": "비밀번호는 최소 하나의 소문자를 포함해야 합니다",
    "must-contain-at-least-one-number": "비밀번호는 최소 하나의 숫자를 포함해야 합니다",
    "must-contain-at-least-one-special-character": "비밀번호는 최소 하나의 특수 문자를 포함해야 합니다",
  },

  // 보안 유효성 검사
  security: {
    "at-least-one-character-type-must-be-included": "최소 하나의 문자 유형이 포함되어야 합니다",
    "input-contains-potentially-dangerous-html": "입력에 잠재적으로 위험한 HTML이 포함되어 있습니다",
    "input-contains-potentially-dangerous-sql-patterns": "입력에 잠재적으로 위험한 SQL 패턴이 포함되어 있습니다",
    "input-contains-potentially-dangerous-xss-patterns": "입력에 잠재적으로 위험한 XSS 패턴이 포함되어 있습니다",
    "input-contains-path-traversal-patterns": "입력에 경로 순회 패턴이 포함되어 있습니다",
    "input-contains-windows-reserved-names": "입력에 Windows 예약 이름이 포함되어 있습니다",
    "input-contains-executable-file-extensions": "입력에 실행 가능한 파일 확장자가 포함되어 있습니다",
    "input-contains-null-bytes": "입력에 null 바이트가 포함되어 있습니다",
    "input-contains-hidden-files": "입력에 숨겨진 파일이 포함되어 있습니다",
    "input-contains-javascript-file-extensions": "입력에 JavaScript 파일 확장자가 포함되어 있습니다",
  },

  // 비동기 작업
  async: {
    "operation-timed-out": "작업 시간 초과",
    "custom-timeout": "사용자 정의 시간 초과",
    "original-error": "원본 오류",
    "first-failure": "첫 번째 실패",
    "second-failure": "두 번째 실패",
    "persistent-failure": "지속적인 실패",
    "function-failed": "함수 실패",
    "mapper-failed": "매퍼 실패",
    "concurrency-must-be-greater-than-0": "동시성은 0보다 커야 합니다",
    "polling-timeout-reached": "폴링 시간 초과 도달",
  },

  // 모듈 로딩
  module: {
    "is-null": "모듈이 null입니다",
    "invalid-structure": "유효하지 않은 모듈 구조",
    "load-failed": "로딩 실패",
    "loading-failed": "로딩 실패",
  },

  // 저장소 및 직렬화
  storage: {
    "potentially-dangerous-json-detected": "잠재적으로 위험한 JSON이 감지됨",
    "failed-to-parse-json-from-localstorage": "localStorage에서 JSON 파싱 실패:",
    "error-parsing-storage-event": "키에 대한 저장소 이벤트 파싱 오류",
  },

  // 테스트 및 개발
  test: {
    error: "테스트 오류",
    message: "테스트 메시지",
    notification: "테스트 알림",
    "notification-1": "테스트 알림 1",
    "notification-2": "테스트 알림 2",
  },

  // 일반 오류
  errors: {
    "string-error": "문자열 오류",
    "crypto-error": "암호화 오류",
    "some-error": "일부 오류",
  },

  // 포맷터 및 유틸리티
  formatters: {
    "hello-world": "안녕하세요 세계",
  },

  // 날짜 및 시간
  dateTime: {
    now: "지금",
    today: "오늘",
    yesterday: "어제",
    tomorrow: "내일",
    format: "형식",
    timezone: "시간대",
  },

  // 통합 테스트
  integration: {
    "session-and-api-key-generation": "세션 및 API 키 생성",
    "authentication-and-input-validation-integration": "인증 및 입력 유효성 검사 통합",
    "performance-and-security-integration": "성능 및 보안 통합",
  },
};
