/**
 * NLWeb Tool Management
 *
 * Tool management for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
import { NLWebTool } from "../types/index.js";
/**
 * Create get tools action
 */
export declare function createGetToolsAction(state: NLWebState, baseUrl: string, requestTimeout: number): () => Promise<void>;
/**
 * Create register tool action
 */
export declare function createRegisterToolAction(state: NLWebState, baseUrl: string, requestTimeout: number, getTools: () => Promise<void>): (tool: NLWebTool) => Promise<void>;
/**
 * Create unregister tool action
 */
export declare function createUnregisterToolAction(state: NLWebState, baseUrl: string, requestTimeout: number, getTools: () => Promise<void>): (name: string) => Promise<void>;
