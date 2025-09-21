/**
 * 🦊 Vitest Config Generator Logger
 * Simple logging utility for the Vitest configuration generator
 */

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

export class VitestConfigLogger implements Logger {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  error(message: string): void {
    console.error(`❌ ${message}`);
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(`🔍 ${message}`);
    }
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }
}
