import fs from 'node:fs';
import path from 'node:path';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_DIR = 'logs';
const LOG_FILE = path.join(LOG_DIR, 'test-run.log');
const DEBUG_ENABLED = process.env.DEBUG === 'true';

function write(level: LogLevel, message: string): void {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;

  if (level === 'ERROR') {
    console.error(line);
  } else if (level === 'WARN') {
    console.warn(line);
  } else {
    console.log(line);
  }

  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, `${line}\n`);
}

/**
 * The only place in the framework that should call console.log/warn/error
 * directly. Every other file calls Logger.debug/info/warn/error instead, so
 * output has one consistent format and — in addition to the console — is
 * captured in logs/test-run.log for CI artifact archiving.
 *
 * DEBUG is silenced unless DEBUG=true is set, keeping normal runs readable
 * while still allowing full step-by-step tracing when actually debugging.
 */
export class Logger {
  static debug(message: string): void {
    if (DEBUG_ENABLED) {
      write('DEBUG', message);
    }
  }

  static info(message: string): void {
    write('INFO', message);
  }

  static warn(message: string): void {
    write('WARN', message);
  }

  static error(message: string): void {
    write('ERROR', message);
  }
}
