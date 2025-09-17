#!/usr/bin/env node
/**
 * List Command - List all packages and their i18n configuration
 */
import { Command } from "commander";
export interface ListCommandOptions {
    enabledOnly?: boolean;
}
export declare const createListCommand: () => Command;
