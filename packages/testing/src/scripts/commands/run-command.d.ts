#!/usr/bin/env node
/**
 * Run Command - Execute i18n tests for all packages
 */
import { Command } from "commander";
export interface RunCommandOptions {
    packages?: string[];
    output?: string;
    report?: string;
    failFast?: boolean;
    verbose?: boolean;
}
export declare const createRunCommand: () => Command;
