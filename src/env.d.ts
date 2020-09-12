declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_SECRET_KEY: string;
    readonly APP_PORT: string;
    readonly APP_SERVICE_KEY: string;
    readonly APP_REDIS_DB: string;
    readonly APP_VK_LANGUAGE:
      | 'ru'
      | 'uk'
      | 'be'
      | 'en'
      | 'es'
      | 'fi'
      | 'de'
      | 'it';
  }
}
