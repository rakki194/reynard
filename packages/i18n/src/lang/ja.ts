/**
 * Japanese translations for Reynard framework
 * 日本語翻訳
 */

import type { Translations } from '../types';

export default {
  common: {
    // Basic actions
    close: '閉じる',
    delete: '削除',
    cancel: 'キャンセル',
    save: '保存',
    edit: '編集',
    add: '追加',
    remove: '削除',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    confirm: '確認',
    download: 'ダウンロード',
    upload: 'アップロード',
    ok: 'OK',
    open: '開く',
    copy: 'コピー',
    warning: '警告',
    info: '情報',
    update: '更新',
    clear: 'クリア',
    
    // Navigation
    home: 'ホーム',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    
    // Data
    path: 'パス',
    size: 'サイズ',
    date: '日付',
    name: '名前',
    type: '種類',
    actions: 'アクション',
    search: '検索',
    filter: 'フィルター',
    apply: '適用',
    reset: 'リセット',
    selected: '選択済み',
    all: 'すべて',
    none: 'なし',
    notFound: '見つかりません',
    
    // UI elements
    toggleTheme: 'テーマを切り替え',
    theme: 'テーマ',
    language: '言語',
    description: '説明',
    settings: '設定',
    help: 'ヘルプ',
    about: 'について',
  },

  themes: {
    light: 'ライト',
    gray: 'グレー',
    dark: 'ダーク',
    banana: 'バナナ',
    strawberry: 'ストロベリー',
    peanut: 'ピーナッツ',
    'high-contrast-black': 'ハイコントラスト ブラック',
    'high-contrast-inverse': 'ハイコントラスト インバース',
  },

  core: {
    notifications: {
      title: '通知',
      dismiss: '閉じる',
      dismissAll: 'すべて閉じる',
      markAsRead: '既読にする',
      markAllAsRead: 'すべて既読にする',
      noNotifications: '通知はありません',
      error: 'エラー',
      success: '成功',
      warning: '警告',
      info: '情報',
    },
    validation: {
      required: 'この項目は必須です',
      invalid: '無効な値です',
      tooShort: '値が短すぎます',
      tooLong: '値が長すぎます',
      invalidEmail: '無効なメールアドレスです',
      invalidUrl: '無効なURLです',
      invalidNumber: '無効な数値です',
      minValue: '値が小さすぎます',
      maxValue: '値が大きすぎます',
    },
    dateTime: {
      now: '今',
      today: '今日',
      yesterday: '昨日',
      tomorrow: '明日',
      format: '形式',
      timezone: 'タイムゾーン',
    },
  },

  components: {
    modal: {
      close: '閉じる',
      confirm: '確認',
      cancel: 'キャンセル',
    },
    tabs: {
      next: '次のタブ',
      previous: '前のタブ',
    },
    dropdown: {
      select: '選択',
      clear: 'クリア',
      search: '検索',
      noResults: '結果が見つかりません',
    },
    tooltip: {
      show: 'ツールチップを表示',
      hide: 'ツールチップを非表示',
    },
  },

  gallery: {
    upload: {
      title: 'ファイルをアップロード',
      dragDrop: 'ファイルをここにドラッグ&ドロップ',
      selectFiles: 'ファイルを選択',
      progress: 'アップロード中...',
      complete: 'アップロード完了',
      failed: 'アップロード失敗',
      cancel: 'アップロードをキャンセル',
    },
    file: {
      name: '名前',
      size: 'サイズ',
      date: '日付',
      type: '種類',
      actions: 'アクション',
      delete: '削除',
      rename: '名前を変更',
      move: '移動',
      copy: 'コピー',
      download: 'ダウンロード',
    },
    folder: {
      create: 'フォルダを作成',
      delete: 'フォルダを削除',
      rename: 'フォルダ名を変更',
      move: 'フォルダを移動',
      empty: '空のフォルダ',
    },
    view: {
      grid: 'グリッド表示',
      list: 'リスト表示',
      thumbnail: 'サムネイル表示',
      details: '詳細表示',
    },
    sort: {
      name: '名前で並び替え',
      date: '日付で並び替え',
      size: 'サイズで並び替え',
      type: '種類で並び替え',
      ascending: '昇順',
      descending: '降順',
    },
  },

  charts: {
    types: {
      line: '折れ線グラフ',
      bar: '棒グラフ',
      pie: '円グラフ',
      area: 'エリアグラフ',
      scatter: '散布図',
      histogram: 'ヒストグラム',
    },
    axes: {
      x: 'X軸',
      y: 'Y軸',
      value: '値',
      category: 'カテゴリ',
      time: '時間',
    },
    legend: {
      show: '凡例を表示',
      hide: '凡例を非表示',
      position: '凡例の位置',
    },
    tooltip: {
      show: 'ツールチップを表示',
      hide: 'ツールチップを非表示',
    },
    data: {
      noData: 'データがありません',
      loading: 'データを読み込み中...',
      error: 'データの読み込みエラー',
    },
  },

  auth: {
    login: {
      title: 'ログイン',
      username: 'ユーザー名',
      password: 'パスワード',
      remember: 'ログイン状態を保持',
      forgot: 'パスワードを忘れた場合',
      submit: 'ログイン',
      success: 'ログイン成功',
      failed: 'ログイン失敗',
    },
    register: {
      title: '新規登録',
      username: 'ユーザー名',
      email: 'メールアドレス',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      submit: '登録',
      success: '登録成功',
      failed: '登録失敗',
    },
    logout: {
      title: 'ログアウト',
      confirm: 'ログアウトしますか？',
      success: 'ログアウト成功',
    },
    profile: {
      title: 'プロフィール',
      edit: 'プロフィールを編集',
      save: '変更を保存',
      cancel: 'キャンセル',
    },
  },

  chat: {
    message: {
      send: 'メッセージを送信',
      type: 'メッセージを入力...',
      placeholder: 'メッセージをここに入力',
      sent: 'メッセージを送信しました',
      received: 'メッセージを受信しました',
      failed: 'メッセージの送信に失敗しました',
    },
    room: {
      create: 'ルームを作成',
      join: 'ルームに参加',
      leave: 'ルームを退出',
      delete: 'ルームを削除',
      name: 'ルーム名',
      description: 'ルームの説明',
    },
    user: {
      online: 'オンライン',
      offline: 'オフライン',
      typing: '入力中...',
      away: '離席中',
    },
    p2p: {
      connect: '接続',
      disconnect: '切断',
      connected: '接続済み',
      disconnected: '切断済み',
    },
  },

  monaco: {
    editor: {
      save: '保存',
      format: 'コードをフォーマット',
      find: '検索',
      replace: '置換',
      undo: '元に戻す',
      redo: 'やり直し',
      cut: '切り取り',
      copy: 'コピー',
      paste: '貼り付け',
      selectAll: 'すべて選択',
    },
    language: {
      select: '言語を選択',
      detect: '言語を検出',
    },
    theme: {
      select: 'テーマを選択',
      light: 'ライトテーマ',
      dark: 'ダークテーマ',
    },
    settings: {
      title: 'エディター設定',
      fontSize: 'フォントサイズ',
      tabSize: 'タブサイズ',
      wordWrap: 'ワードラップ',
      minimap: 'ミニマップ',
      lineNumbers: '行番号',
    },
  },
} as const satisfies Translations;
