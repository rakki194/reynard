/**
 * Perus suomenkieliset käännökset Reynard-kehykselle
 */
export const coreTranslations = {
  // Yhteyden ja API:n virheet
  connection: {
    failed: "Yhteys epäonnistui",
  },

  network: {
    error: "Verkkovirhe",
  },

  request: {
    aborted: "Pyyntö keskeytetty",
  },

  // Tunnistautuminen ja turvallisuus
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer testiavain",
    "new-key": "Bearer uusi avain",
  },

  // Ilmoitukset
  notifications: {
    title: "Ilmoitukset",
    dismiss: "Hylkää",
    dismissAll: "Hylkää kaikki",
    markAsRead: "Merkitse luetuksi",
    markAllAsRead: "Merkitse kaikki luetuksi",
    noNotifications: "Ei ilmoituksia",
    error: "Virhe",
    success: "Onnistui",
    warning: "Varoitus",
    info: "Tiedote",
    test: "Testi-ilmoitus",
    "test-1": "Testi-ilmoitus 1",
    "test-2": "Testi-ilmoitus 2",
    first: "Ensimmäinen ilmoitus",
    second: "Toinen ilmoitus",
    message: "Testiviesti",
    "default-message": "Oletusviesti",
    "first-message": "Ensimmäinen viesti",
    "second-message": "Toinen viesti",
    "auto-dismiss": "Automaattinen hylkääminen",
    "error-message": "Virheviesti",
    "no-group-message": "Viesti ilman ryhmää",
    "upload-progress": "Latauksen edistyminen",
    "progress-test": "Edistymisen testi",
    "progress-test-2": "Edistymisen testi 2",
    "custom-duration": "Mukautettu kesto",
    "group-message": "Ryhmäviesti",
    "regular-message": "Tavallinen viesti",
    "created-notification": "Luotu ilmoitus",
    "first-grouped": "Ensimmäinen ryhmitelty",
    "second-grouped": "Toinen ryhmitelty",
  },

  // Validoinnin viestit
  validation: {
    required: "Tämä kenttä on pakollinen",
    invalid: "Virheellinen arvo",
    tooShort: "Arvo on liian lyhyt",
    tooLong: "Arvo on liian pitkä",
    invalidEmail: "Virheellinen sähköpostiosoite",
    invalidUrl: "Virheellinen URL",
    invalidNumber: "Virheellinen numero",
    minValue: "Arvo on liian pieni",
    maxValue: "Arvo on liian suuri",
    "invalid-input-type": "Virheellinen syötetyyppi",
    "does-not-match-pattern": "Syöte ei vastaa vaadittua mallia",
  },

  // Salasanan validointi
  password: {
    "must-be-at-least-8-characters-long": "Salasanan tulee olla vähintään 8 merkkiä",
    "must-contain-at-least-one-uppercase-letter": "Salasanan tulee sisältää vähintään yksi iso kirjain",
    "must-contain-at-least-one-lowercase-letter": "Salasanan tulee sisältää vähintään yksi pieni kirjain",
    "must-contain-at-least-one-number": "Salasanan tulee sisältää vähintään yksi numero",
    "must-contain-at-least-one-special-character": "Salasanan tulee sisältää vähintään yksi erikoismerkki",
  },

  // Turvallisuuden validointi
  security: {
    "at-least-one-character-type-must-be-included": "Vähintään yksi merkkityyppi on sisällytettävä",
    "input-contains-potentially-dangerous-html": "Syöte sisältää mahdollisesti vaarallista HTML:ää",
    "input-contains-potentially-dangerous-sql-patterns": "Syöte sisältää mahdollisesti vaarallisia SQL-malleja",
    "input-contains-potentially-dangerous-xss-patterns": "Syöte sisältää mahdollisesti vaarallisia XSS-malleja",
    "input-contains-path-traversal-patterns": "Syöte sisältää polun läpikulku-malleja",
    "input-contains-windows-reserved-names": "Syöte sisältää Windowsin varattuja nimiä",
    "input-contains-executable-file-extensions": "Syöte sisältää suoritettavien tiedostojen päätteitä",
    "input-contains-null-bytes": "Syöte sisältää null-baitteja",
    "input-contains-hidden-files": "Syöte sisältää piilotettuja tiedostoja",
    "input-contains-javascript-file-extensions": "Syöte sisältää JavaScript-tiedostojen päätteitä",
  },

  // Asynkroniset toiminnot
  async: {
    "operation-timed-out": "Toiminto aikakatkaistu",
    "custom-timeout": "Mukautettu aikakatkaisu",
    "original-error": "Alkuperäinen virhe",
    "first-failure": "Ensimmäinen epäonnistuminen",
    "second-failure": "Toinen epäonnistuminen",
    "persistent-failure": "Pysyvä epäonnistuminen",
    "function-failed": "Funktio epäonnistui",
    "mapper-failed": "Mapper epäonnistui",
    "concurrency-must-be-greater-than-0": "Rinnakkaisuuden tulee olla suurempi kuin 0",
    "polling-timeout-reached": "Kyselyjen aikakatkaisu saavutettu",
  },

  // Moduulien lataaminen
  module: {
    "is-null": "Moduuli on null",
    "invalid-structure": "Virheellinen moduulin rakenne",
    "load-failed": "Lataus epäonnistui",
    "loading-failed": "Lataus epäonnistui",
  },

  // Tallennus ja serialisointi
  storage: {
    "potentially-dangerous-json-detected": "Mahdollisesti vaarallinen JSON havaittu",
    "failed-to-parse-json-from-localstorage": "JSON:n jäsentäminen localStorage:sta epäonnistui:",
    "error-parsing-storage-event": "Virhe tallennustapahtuman jäsentämisessä avaimelle",
  },

  // Testi ja kehitys
  test: {
    error: "Testivirhe",
    message: "Testiviesti",
    notification: "Testi-ilmoitus",
    "notification-1": "Testi-ilmoitus 1",
    "notification-2": "Testi-ilmoitus 2",
  },

  // Yleiset virheet
  errors: {
    "string-error": "Merkkijonovirhe",
    "crypto-error": "Kryptovirhe",
    "some-error": "Jokin virhe",
  },

  // Muotoilijat ja apuvälineet
  formatters: {
    "hello-world": "Hei maailma",
  },

  // Päivämäärä ja aika
  dateTime: {
    now: "Nyt",
    today: "Tänään",
    yesterday: "Eilen",
    tomorrow: "Huomenna",
    format: "Muoto",
    timezone: "Aikavyöhyke",
  },

  // Integraatiotestit
  integration: {
    "session-and-api-key-generation": "Istunnon ja API-avaimen generointi",
    "authentication-and-input-validation-integration": "Tunnistautumisen ja syötteen validoinnin integraatio",
    "performance-and-security-integration": "Suorituskyvyn ja turvallisuuden integraatio",
  },
};
