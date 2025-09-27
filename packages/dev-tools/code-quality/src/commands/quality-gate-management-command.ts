#!/usr/bin/env node
/**
 * 🦊 Quality Gate Management Command Handler
 *
 * *whiskers twitch with intelligence* Handles quality gate management
 * operations including creation, updates, and configuration.
 */

import { DatabaseQualityGateManager } from "../DatabaseQualityGateManager";

export interface QualityGateManagementOptions {
  project: string;
  action: string;
  gateId?: string;
  name?: string;
  environment?: string;
  description?: string;
  enabled?: boolean;
  backendUrl?: string;
  apiKey?: string;
}

function displayQualityGate(gate: any): void {
  console.log(`\n🦊 ${gate.name} (${gate.gate_id})`);
  console.log(`   Environment: ${gate.environment}`);
  console.log(`   Status: ${gate.enabled ? "✅ Enabled" : "❌ Disabled"}`);
  console.log(`   Default: ${gate.is_default ? "⭐ Yes" : "No"}`);
  if (gate.description) {
    console.log(`   Description: ${gate.description}`);
  }
  console.log(`   Conditions: ${gate.conditions.length}`);
  
  if (gate.conditions.length > 0) {
    console.log("   Conditions:");
    for (const condition of gate.conditions) {
      const status = condition.enabled ? "✅" : "❌";
      console.log(`     ${status} ${condition.metric} ${condition.operator} ${condition.threshold}`);
      if (condition.description) {
        console.log(`       ${condition.description}`);
      }
    }
  }
}

function displayEvaluationStats(stats: any): void {
  console.log(`\n📊 Quality Gate Statistics`);
  console.log(`   Total Evaluations: ${stats.totalEvaluations}`);
  console.log(`   Pass Rate: ${stats.passedRate.toFixed(1)}%`);
  console.log(`   Fail Rate: ${stats.failedRate.toFixed(1)}%`);
  console.log(`   Warning Rate: ${stats.warningRate.toFixed(1)}%`);
  console.log(`   Average Score: ${stats.averageScore.toFixed(1)}%`);
}

export async function handleQualityGateManagementCommand(options: QualityGateManagementOptions): Promise<void> {
  try {
    const backendUrl = options.backendUrl || process.env.REYNARD_BACKEND_URL || "http://localhost:8000";
    const apiKey = options.apiKey || process.env.REYNARD_API_KEY;
    
    const qualityGateManager = new DatabaseQualityGateManager(backendUrl, apiKey);
    
    // Check connectivity to backend
    const isConnected = await qualityGateManager.checkConnectivity();
    if (!isConnected) {
      console.error("❌ Could not connect to Reynard backend");
      console.error("   Please ensure the backend is running and REYNARD_BACKEND_URL is set correctly");
      process.exit(1);
    }

    console.log("🦊 Quality Gate Management");
    console.log("==========================");

    switch (options.action) {
      case "list":
        await handleListGates(qualityGateManager, options);
        break;
        
      case "show":
        await handleShowGate(qualityGateManager, options);
        break;
        
      case "create":
        await handleCreateGate(qualityGateManager, options);
        break;
        
      case "update":
        await handleUpdateGate(qualityGateManager, options);
        break;
        
      case "delete":
        await handleDeleteGate(qualityGateManager, options);
        break;
        
      case "init":
        await handleInitializeGates(qualityGateManager, options);
        break;
        
      case "stats":
        await handleShowStats(qualityGateManager, options);
        break;
        
      case "history":
        await handleShowHistory(qualityGateManager, options);
        break;
        
      default:
        console.error(`❌ Unknown action: ${options.action}`);
        console.log("Available actions: list, show, create, update, delete, init, stats, history");
        process.exit(1);
    }
    
  } catch (error: any) {
    console.error("❌ Quality gate management failed:", error.message);
    process.exit(1);
  }
}

async function handleListGates(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  console.log("📋 Quality Gates:");
  
  const gates = await manager.getQualityGates();
  
  if (gates.length === 0) {
    console.log("   No quality gates found. Run 'init' to create default gates.");
    return;
  }
  
  for (const gate of gates) {
    displayQualityGate(gate);
  }
}

async function handleShowGate(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  if (!options.gateId) {
    console.error("❌ Gate ID is required for 'show' action");
    process.exit(1);
  }
  
  const gate = await manager.getQualityGate(options.gateId);
  if (!gate) {
    console.error(`❌ Quality gate '${options.gateId}' not found`);
    process.exit(1);
  }
  
  displayQualityGate(gate);
}

async function handleCreateGate(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  if (!options.gateId || !options.name || !options.environment) {
    console.error("❌ Gate ID, name, and environment are required for 'create' action");
    process.exit(1);
  }
  
  const gateData = {
    id: options.gateId,
    name: options.name,
    environment: options.environment as any,
    description: options.description,
    enabled: options.enabled !== false,
    conditions: []
  };
  
  await manager.addQualityGate(gateData);
  console.log(`✅ Created quality gate '${options.gateId}'`);
}

async function handleUpdateGate(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  if (!options.gateId) {
    console.error("❌ Gate ID is required for 'update' action");
    process.exit(1);
  }
  
  const updates: any = {};
  if (options.name) updates.name = options.name;
  if (options.description) updates.description = options.description;
  if (options.environment) updates.environment = options.environment;
  if (options.enabled !== undefined) updates.enabled = options.enabled;
  
  if (Object.keys(updates).length === 0) {
    console.error("❌ No updates specified");
    process.exit(1);
  }
  
  await manager.updateQualityGate(options.gateId, updates);
  console.log(`✅ Updated quality gate '${options.gateId}'`);
}

async function handleDeleteGate(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  if (!options.gateId) {
    console.error("❌ Gate ID is required for 'delete' action");
    process.exit(1);
  }
  
  await manager.removeQualityGate(options.gateId);
  console.log(`✅ Deleted quality gate '${options.gateId}'`);
}

async function handleInitializeGates(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  console.log("🚀 Initializing default Reynard quality gates...");
  
  await manager.createReynardQualityGates();
  
  console.log("✅ Default quality gates initialized successfully");
  console.log("   Created gates:");
  console.log("   - reynard-development (Development environment)");
  console.log("   - reynard-production (Production environment)");
  console.log("   - reynard-modularity (Modularity standards)");
}

async function handleShowStats(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  const stats = await manager.getEvaluationStats(
    options.gateId,
    options.environment,
    30 // Last 30 days
  );
  
  displayEvaluationStats(stats);
}

async function handleShowHistory(manager: DatabaseQualityGateManager, options: QualityGateManagementOptions): Promise<void> {
  console.log("📜 Quality Gate Evaluation History:");
  
  const history = await manager.getEvaluationHistory(
    options.gateId,
    options.environment,
    20 // Last 20 evaluations
  );
  
  if (history.length === 0) {
    console.log("   No evaluation history found.");
    return;
  }
  
  for (const evaluation of history) {
    const statusIcon = evaluation.status === "PASSED" ? "✅" : 
                      evaluation.status === "WARN" ? "⚠️" : "❌";
    
    console.log(`\n${statusIcon} ${evaluation.gateName} (${evaluation.evaluationId})`);
    console.log(`   Environment: ${evaluation.environment}`);
    console.log(`   Score: ${evaluation.overallScore.toFixed(1)}%`);
    console.log(`   Passed: ${evaluation.passedConditions}/${evaluation.totalConditions}`);
    console.log(`   Date: ${new Date(evaluation.evaluatedAt).toLocaleString()}`);
  }
}
