import type { AppConfig } from './config.js';

export const APP_CONFIG = Symbol('APP_CONFIG');

export type AppConfigToken = typeof APP_CONFIG;

export type AppConfigProvider = AppConfig;
