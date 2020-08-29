declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_SECRET_KEY: string;
    readonly APP_PORT: string;
  }
}
