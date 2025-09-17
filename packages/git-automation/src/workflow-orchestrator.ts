/**
 * 🦊 Git Workflow Orchestrator
 * 
 * High-level orchestrator that coordinates all Git automation components
 * to provide a streamlined workflow experience.
 */

import { JunkFileDetector } from './junk-detector.js';
import { ChangeAnalyzer } from './change-analyzer.js';
import { CommitMessageGenerator } from './commit-generator.js';
import { ChangelogManager } from './changelog-manager.js';
import { VersionManager } from './version-manager.js';
import type { JunkDetectionResult } from './junk-detector.js';
import type { ChangeAnalysisResult } from './change-analyzer.js';
import type { CommitMessage } from './commit-generator.js';
import type { VersionInfo } from './version-manager.js';
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export interface WorkflowOptions {
  skipJunkDetection: boolean;
  skipChangeAnalysis: boolean;
  skipCommitGeneration: boolean;
  skipVersionBump: boolean;
  skipChangelogUpdate: boolean;
  skipGitTag: boolean;
  dryRun: boolean;
  autoConfirm: boolean;
  commitMessage?: string;
  versionBumpType?: 'major' | 'minor' | 'patch';
}

export interface WorkflowResult {
  success: boolean;
  steps: {
    junkDetection: { completed: boolean; result?: JunkDetectionResult };
    changeAnalysis: { completed: boolean; result?: ChangeAnalysisResult };
    commitMessage: { completed: boolean; result?: CommitMessage };
    versionBump: { completed: boolean; result?: VersionInfo };
    changelogUpdate: { completed: boolean };
    gitOperations: { completed: boolean };
  };
  errors: string[];
}

export class GitWorkflowOrchestrator {
  private readonly junkDetector: JunkFileDetector;
  private readonly changeAnalyzer: ChangeAnalyzer;
  private readonly commitGenerator: CommitMessageGenerator;
  private readonly changelogManager: ChangelogManager;
  private readonly versionManager: VersionManager;
  private readonly workingDir: string;

  constructor(workingDir: string = '.') {
    this.workingDir = workingDir;
    this.junkDetector = new JunkFileDetector();
    this.changeAnalyzer = new ChangeAnalyzer();
    this.commitGenerator = new CommitMessageGenerator();
    this.changelogManager = new ChangelogManager(workingDir);
    this.versionManager = new VersionManager(workingDir);
  }

  /**
   * Execute the complete Git workflow
   */
  async executeWorkflow(options: Partial<WorkflowOptions> = {}): Promise<WorkflowResult> {
    const opts: WorkflowOptions = {
      skipJunkDetection: false,
      skipChangeAnalysis: false,
      skipCommitGeneration: false,
      skipVersionBump: false,
      skipChangelogUpdate: false,
      skipGitTag: false,
      dryRun: false,
      autoConfirm: false,
      ...options
    };

    const result: WorkflowResult = {
      success: false,
      steps: {
        junkDetection: { completed: false },
        changeAnalysis: { completed: false },
        commitMessage: { completed: false },
        versionBump: { completed: false },
        changelogUpdate: { completed: false },
        gitOperations: { completed: false }
      },
      errors: []
    };

    try {
      console.log(chalk.blue('🦊 Starting Reynard Git Workflow Automation'));
      console.log(chalk.blue('='.repeat(50)));

      // Step 1: Junk File Detection
      if (!opts.skipJunkDetection) {
        result.steps.junkDetection = await this.executeJunkDetection(opts);
        if (!result.steps.junkDetection.completed) {
          result.errors.push('Junk file detection failed');
          return result;
        }
      }

      // Step 2: Change Analysis
      if (!opts.skipChangeAnalysis) {
        result.steps.changeAnalysis = await this.executeChangeAnalysis(opts);
        if (!result.steps.changeAnalysis.completed) {
          result.errors.push('Change analysis failed');
          return result;
        }
      }

      // Step 3: Commit Message Generation
      if (!opts.skipCommitGeneration && result.steps.changeAnalysis.result) {
        result.steps.commitMessage = await this.executeCommitGeneration(
          result.steps.changeAnalysis.result,
          opts
        );
        if (!result.steps.commitMessage.completed) {
          result.errors.push('Commit message generation failed');
          return result;
        }
      }

      // Step 4: Version Bump
      if (!opts.skipVersionBump && result.steps.changeAnalysis.result) {
        result.steps.versionBump = await this.executeVersionBump(
          result.steps.changeAnalysis.result,
          opts
        );
        if (!result.steps.versionBump.completed) {
          result.errors.push('Version bump failed');
          return result;
        }
      }

      // Step 5: Changelog Update
      if (!opts.skipChangelogUpdate && result.steps.versionBump.result) {
        result.steps.changelogUpdate = await this.executeChangelogUpdate(
          result.steps.versionBump.result,
          opts
        );
        if (!result.steps.changelogUpdate.completed) {
          result.errors.push('Changelog update failed');
          return result;
        }
      }

      // Step 6: Git Operations
      if (!opts.dryRun) {
        result.steps.gitOperations = await this.executeGitOperations(
          opts,
          result.steps.commitMessage.result,
          result.steps.versionBump.result
        );
        if (!result.steps.gitOperations.completed) {
          result.errors.push('Git operations failed');
          return result;
        }
      }

      result.success = true;
      console.log(chalk.green('\n✅ Git workflow completed successfully!'));
      
      return result;
    } catch (error) {
      result.errors.push(`Workflow execution failed: ${error}`);
      console.log(chalk.red('\n❌ Git workflow failed!'));
      return result;
    }
  }

  /**
   * Execute junk file detection step
   */
  private async executeJunkDetection(opts: WorkflowOptions): Promise<{ completed: boolean; result?: JunkDetectionResult }> {
    const spinner = ora('🔍 Detecting junk files...').start();
    
    try {
      const result = await this.junkDetector.detectJunkFiles(this.workingDir);
      
      if (result.hasJunk) {
        spinner.warn('Junk files detected');
        this.junkDetector.displayResults(result);
        
        if (!opts.autoConfirm) {
          const { proceed } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'proceed',
              message: 'Junk files detected. Do you want to proceed anyway?',
              default: false
            }
          ]);
          
          if (!proceed) {
            return { completed: false };
          }
        }
      } else {
        spinner.succeed('No junk files detected');
      }
      
      return { completed: true, result };
    } catch (error) {
      spinner.fail('Junk file detection failed');
      throw error;
    }
  }

  /**
   * Execute change analysis step
   */
  private async executeChangeAnalysis(opts: WorkflowOptions): Promise<{ completed: boolean; result?: ChangeAnalysisResult }> {
    const spinner = ora('📊 Analyzing changes...').start();
    
    try {
      const result = await this.changeAnalyzer.analyzeChanges(this.workingDir);
      
      if (result.totalFiles === 0) {
        spinner.warn('No changes detected');
        return { completed: false };
      }
      
      spinner.succeed(`Analyzed ${result.totalFiles} changed files`);
      this.changeAnalyzer.displayResults(result);
      
      return { completed: true, result };
    } catch (error) {
      spinner.fail('Change analysis failed');
      throw error;
    }
  }

  /**
   * Execute commit message generation step
   */
  private async executeCommitGeneration(
    analysis: ChangeAnalysisResult,
    opts: WorkflowOptions
  ): Promise<{ completed: boolean; result?: CommitMessage }> {
    const spinner = ora('📝 Generating commit message...').start();
    
    try {
      const result = this.commitGenerator.generateCommitMessage(analysis);
      
      spinner.succeed('Commit message generated');
      this.commitGenerator.displayCommitMessage(result);
      
      // Allow user to edit the message if not auto-confirming
      if (!opts.autoConfirm) {
        const { useGenerated } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'useGenerated',
            message: 'Use this commit message?',
            default: true
          }
        ]);
        
        if (!useGenerated) {
          const { customMessage } = await inquirer.prompt([
            {
              type: 'input',
              name: 'customMessage',
              message: 'Enter custom commit message:',
              validate: (input) => input.trim().length > 0 || 'Commit message cannot be empty'
            }
          ]);
          
          result.fullMessage = customMessage;
        }
      }
      
      return { completed: true, result };
    } catch (error) {
      spinner.fail('Commit message generation failed');
      throw error;
    }
  }

  /**
   * Execute version bump step
   */
  private async executeVersionBump(
    analysis: ChangeAnalysisResult,
    opts: WorkflowOptions
  ): Promise<{ completed: boolean; result?: VersionInfo }> {
    const spinner = ora('📦 Calculating version bump...').start();
    
    try {
      const currentVersion = await this.versionManager.getCurrentVersion();
      const bumpType = opts.versionBumpType || analysis.versionBumpType;
      const nextVersion = this.versionManager.calculateNextVersion(currentVersion, bumpType);
      
      const result: VersionInfo = {
        current: currentVersion,
        next: nextVersion,
        bumpType
      };
      
      spinner.succeed(`Version bump: ${currentVersion} → ${nextVersion} (${bumpType})`);
      this.versionManager.displayVersionInfo(result);
      
      // Confirm version bump if not auto-confirming
      if (!opts.autoConfirm) {
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: `Proceed with ${bumpType} version bump to ${nextVersion}?`,
            default: true
          }
        ]);
        
        if (!proceed) {
          return { completed: false };
        }
      }
      
      // Update version
      await this.versionManager.updateVersion(nextVersion);
      
      return { completed: true, result };
    } catch (error) {
      spinner.fail('Version bump failed');
      throw error;
    }
  }

  /**
   * Execute changelog update step
   */
  private async executeChangelogUpdate(
    versionInfo: VersionInfo,
    opts: WorkflowOptions
  ): Promise<{ completed: boolean }> {
    const spinner = ora('📚 Updating changelog...').start();
    
    try {
      const currentDate = this.changelogManager.getCurrentDate();
      await this.changelogManager.promoteUnreleasedToRelease(versionInfo.next, currentDate);
      
      spinner.succeed('Changelog updated');
      return { completed: true };
    } catch (error) {
      spinner.fail('Changelog update failed');
      throw error;
    }
  }

  /**
   * Execute Git operations step
   */
  private async executeGitOperations(
    opts: WorkflowOptions,
    commitMessage?: CommitMessage,
    versionInfo?: VersionInfo
  ): Promise<{ completed: boolean }> {
    const spinner = ora('🚀 Executing Git operations...').start();
    
    try {
      // Stage all changes
      await execa('git', ['add', '.'], { cwd: this.workingDir });
      
      // Commit changes
      if (commitMessage) {
        await execa('git', ['commit', '-m', commitMessage.fullMessage], {
          cwd: this.workingDir
        });
      }
      
      // Create and push Git tag
      if (versionInfo && !opts.skipGitTag) {
        const releaseNotes = await this.versionManager.generateReleaseNotes(versionInfo.next);
        await this.versionManager.createGitTag(versionInfo.next, releaseNotes);
        await this.versionManager.pushGitTag(versionInfo.next);
      }
      
      // Push commits
      await execa('git', ['push', 'origin', 'main'], { cwd: this.workingDir });
      
      spinner.succeed('Git operations completed');
      return { completed: true };
    } catch (error) {
      spinner.fail('Git operations failed');
      throw error;
    }
  }

  /**
   * Display workflow summary
   */
  displayWorkflowSummary(result: WorkflowResult): void {
    console.log(chalk.blue('\n📋 Workflow Summary:'));
    console.log(chalk.blue('='.repeat(30)));
    
    const steps = [
      { name: 'Junk Detection', completed: result.steps.junkDetection.completed },
      { name: 'Change Analysis', completed: result.steps.changeAnalysis.completed },
      { name: 'Commit Generation', completed: result.steps.commitMessage.completed },
      { name: 'Version Bump', completed: result.steps.versionBump.completed },
      { name: 'Changelog Update', completed: result.steps.changelogUpdate.completed },
      { name: 'Git Operations', completed: result.steps.gitOperations.completed }
    ];
    
    for (const step of steps) {
      const status = step.completed ? '✅' : '❌';
      const color = step.completed ? 'green' : 'red';
      console.log(chalk[color](`${status} ${step.name}`));
    }
    
    if (result.errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'));
      for (const error of result.errors) {
        console.log(chalk.red(`  - ${error}`));
      }
    }
  }

  /**
   * Execute quick workflow with auto-confirm
   */
  async quickWorkflow(workingDir?: string): Promise<WorkflowResult> {
    return this.executeWorkflow({
      skipJunkDetection: false,
      skipChangeAnalysis: false,
      skipCommitGeneration: false,
      skipVersionBump: false,
      skipChangelogUpdate: false,
      skipGitTag: false,
      autoConfirm: true,
      dryRun: false,
    });
  }

  /**
   * Get workflow status information
   */
  getWorkflowStatus(): {
    workingDirectory: string;
    components: string[];
    capabilities: string[];
  } {
    return {
      workingDirectory: this.workingDir,
      components: [
        'JunkFileDetector',
        'ChangeAnalyzer',
        'CommitMessageGenerator',
        'ChangelogManager',
        'VersionManager'
      ],
      capabilities: [
        'junk_file_detection',
        'change_analysis',
        'commit_message_generation',
        'changelog_management',
        'version_management',
        'git_tag_management'
      ]
    };
  }
}
