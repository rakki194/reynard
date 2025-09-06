/**
 * Russian translations for Reynard framework
 * Русские переводы
 */

import type { Translations } from '../types';

export default {
  common: {
    // Basic actions
    close: 'Закрыть',
    delete: 'Удалить',
    cancel: 'Отмена',
    save: 'Сохранить',
    edit: 'Редактировать',
    add: 'Добавить',
    remove: 'Удалить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    confirm: 'Подтвердить',
    download: 'Скачать',
    upload: 'Загрузить',
    ok: 'ОК',
    open: 'Открыть',
    copy: 'Копировать',
    warning: 'Предупреждение',
    info: 'Информация',
    update: 'Обновить',
    clear: 'Очистить',
    
    // Navigation
    home: 'Главная',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    
    // Data
    path: 'Путь',
    size: 'Размер',
    date: 'Дата',
    name: 'Имя',
    type: 'Тип',
    actions: 'Действия',
    search: 'Поиск',
    filter: 'Фильтр',
    apply: 'Применить',
    reset: 'Сбросить',
    selected: 'Выбрано',
    all: 'Все',
    none: 'Нет',
    notFound: 'Не найдено',
    
    // UI elements
    toggleTheme: 'Переключить тему',
    theme: 'Тема',
    language: 'Язык',
    description: 'Описание',
    settings: 'Настройки',
    help: 'Помощь',
    about: 'О программе',
  },

  themes: {
    light: 'Светлая',
    gray: 'Серая',
    dark: 'Тёмная',
    banana: 'Банановая',
    strawberry: 'Клубничная',
    peanut: 'Арахисовая',
    'high-contrast-black': 'Высокий контраст чёрный',
    'high-contrast-inverse': 'Высокий контраст инверсный',
  },

  core: {
    notifications: {
      title: 'Уведомления',
      dismiss: 'Закрыть',
      dismissAll: 'Закрыть все',
      markAsRead: 'Отметить как прочитанное',
      markAllAsRead: 'Отметить все как прочитанные',
      noNotifications: 'Нет уведомлений',
      error: 'Ошибка',
      success: 'Успех',
      warning: 'Предупреждение',
      info: 'Информация',
    },
    validation: {
      required: 'Это поле обязательно',
      invalid: 'Неверное значение',
      tooShort: 'Значение слишком короткое',
      tooLong: 'Значение слишком длинное',
      invalidEmail: 'Неверный адрес электронной почты',
      invalidUrl: 'Неверный URL',
      invalidNumber: 'Неверное число',
      minValue: 'Значение слишком маленькое',
      maxValue: 'Значение слишком большое',
    },
    dateTime: {
      now: 'Сейчас',
      today: 'Сегодня',
      yesterday: 'Вчера',
      tomorrow: 'Завтра',
      format: 'Формат',
      timezone: 'Часовой пояс',
    },
  },

  components: {
    modal: {
      close: 'Закрыть',
      confirm: 'Подтвердить',
      cancel: 'Отмена',
    },
    tabs: {
      next: 'Следующая вкладка',
      previous: 'Предыдущая вкладка',
    },
    dropdown: {
      select: 'Выбрать',
      clear: 'Очистить',
      search: 'Поиск',
      noResults: 'Результаты не найдены',
    },
    tooltip: {
      show: 'Показать подсказку',
      hide: 'Скрыть подсказку',
    },
  },

  gallery: {
    upload: {
      title: 'Загрузить файлы',
      dragDrop: 'Перетащите файлы сюда',
      selectFiles: 'Выбрать файлы',
      progress: 'Загрузка...',
      complete: 'Загрузка завершена',
      failed: 'Ошибка загрузки',
      cancel: 'Отменить загрузку',
    },
    file: {
      name: 'Имя',
      size: 'Размер',
      date: 'Дата',
      type: 'Тип',
      actions: 'Действия',
      delete: 'Удалить',
      rename: 'Переименовать',
      move: 'Переместить',
      copy: 'Копировать',
      download: 'Скачать',
    },
    folder: {
      create: 'Создать папку',
      delete: 'Удалить папку',
      rename: 'Переименовать папку',
      move: 'Переместить папку',
      empty: 'Пустая папка',
    },
    view: {
      grid: 'Сетка',
      list: 'Список',
      thumbnail: 'Миниатюры',
      details: 'Детали',
    },
    sort: {
      name: 'Сортировать по имени',
      date: 'Сортировать по дате',
      size: 'Сортировать по размеру',
      type: 'Сортировать по типу',
      ascending: 'По возрастанию',
      descending: 'По убыванию',
    },
  },

  charts: {
    types: {
      line: 'Линейный график',
      bar: 'Столбчатая диаграмма',
      pie: 'Круговая диаграмма',
      area: 'Диаграмма с областями',
      scatter: 'Точечная диаграмма',
      histogram: 'Гистограмма',
    },
    axes: {
      x: 'Ось X',
      y: 'Ось Y',
      value: 'Значение',
      category: 'Категория',
      time: 'Время',
    },
    legend: {
      show: 'Показать легенду',
      hide: 'Скрыть легенду',
      position: 'Позиция легенды',
    },
    tooltip: {
      show: 'Показать подсказку',
      hide: 'Скрыть подсказку',
    },
    data: {
      noData: 'Нет данных',
      loading: 'Загрузка данных...',
      error: 'Ошибка загрузки данных',
    },
  },

  auth: {
    login: {
      title: 'Вход',
      username: 'Имя пользователя',
      password: 'Пароль',
      remember: 'Запомнить меня',
      forgot: 'Забыли пароль?',
      submit: 'Войти',
      success: 'Вход выполнен успешно',
      failed: 'Ошибка входа',
    },
    register: {
      title: 'Регистрация',
      username: 'Имя пользователя',
      email: 'Электронная почта',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      submit: 'Зарегистрироваться',
      success: 'Регистрация прошла успешно',
      failed: 'Ошибка регистрации',
    },
    logout: {
      title: 'Выход',
      confirm: 'Вы уверены, что хотите выйти?',
      success: 'Выход выполнен успешно',
    },
    profile: {
      title: 'Профиль',
      edit: 'Редактировать профиль',
      save: 'Сохранить изменения',
      cancel: 'Отмена',
    },
  },

  chat: {
    message: {
      send: 'Отправить сообщение',
      type: 'Введите сообщение...',
      placeholder: 'Введите ваше сообщение здесь',
      sent: 'Сообщение отправлено',
      received: 'Сообщение получено',
      failed: 'Ошибка отправки сообщения',
    },
    room: {
      create: 'Создать комнату',
      join: 'Присоединиться к комнате',
      leave: 'Покинуть комнату',
      delete: 'Удалить комнату',
      name: 'Название комнаты',
      description: 'Описание комнаты',
    },
    user: {
      online: 'В сети',
      offline: 'Не в сети',
      typing: 'Печатает...',
      away: 'Отошёл',
    },
    p2p: {
      connect: 'Подключиться',
      disconnect: 'Отключиться',
      connected: 'Подключено',
      disconnected: 'Отключено',
    },
  },

  monaco: {
    editor: {
      save: 'Сохранить',
      format: 'Форматировать код',
      find: 'Найти',
      replace: 'Заменить',
      undo: 'Отменить',
      redo: 'Повторить',
      cut: 'Вырезать',
      copy: 'Копировать',
      paste: 'Вставить',
      selectAll: 'Выбрать всё',
    },
    language: {
      select: 'Выбрать язык',
      detect: 'Определить язык',
    },
    theme: {
      select: 'Выбрать тему',
      light: 'Светлая тема',
      dark: 'Тёмная тема',
    },
    settings: {
      title: 'Настройки редактора',
      fontSize: 'Размер шрифта',
      tabSize: 'Размер табуляции',
      wordWrap: 'Перенос строк',
      minimap: 'Мини-карта',
      lineNumbers: 'Номера строк',
    },
  },
} as const satisfies Translations;
