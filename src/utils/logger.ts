// src/utils/logger.ts

class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev =
      process.env.NODE_ENV === "development" ||
      (typeof __DEV__ !== "undefined" && __DEV__);
  }

  private getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private formatLog(args: unknown[]): [string, ...unknown[]] {
    if (
      typeof args[0] === "string" &&
      args.length === 2 &&
      typeof args[1] === "object" &&
      args[1] !== null
    ) {
      // [methodName, paramsObject]
      return [
        `[Logger][${this.getTimestamp()}] ${args[0] as string}:`,
        JSON.stringify(args[1], null, 2),
      ];
    }
    // fallback
    return [`[Logger][${this.getTimestamp()}]`, ...args];
  }

  log(...args: unknown[]) {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.log(...this.formatLog(args));
    }
  }

  warn(...args: unknown[]) {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.warn(...this.formatLog(args));
    }
  }

  error(...args: unknown[]) {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.error(...this.formatLog(args));
    }
  }
}

export const logger = new Logger();
