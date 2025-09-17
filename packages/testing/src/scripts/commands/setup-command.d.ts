#!/usr/bin/env node
/**
 * Setup Command - Set up i18n test files for all packages
 */
import { Command } from "commander";
export interface SetupCommandOptions {
    force?: boolean;
}
export declare const createSetupCommand: () => Command;
