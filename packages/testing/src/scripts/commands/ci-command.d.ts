#!/usr/bin/env node
/**
 * CI Command - Run i18n checks suitable for CI/CD
 */
import { Command } from "commander";
export interface CICommandOptions {
    failOnHardcoded?: boolean;
    failOnMissing?: boolean;
    failOnRtl?: boolean;
    coverageThreshold?: string;
}
export declare const createCICommand: () => Command;
