#!/usr/bin/env node
/**
 * ESLint Command - Run ESLint with i18n rules on all packages
 */
import { Command } from "commander";
export interface ESLintCommandOptions {
    fix?: boolean;
    format?: string;
}
export declare const createESLintCommand: () => Command;
