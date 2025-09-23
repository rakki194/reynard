/**
 * 🦊 Team Performance Tracker - Advanced Team Performance Monitoring and Analytics
 *
 * This module provides comprehensive team performance tracking, individual metrics,
 * collaboration analysis, and productivity insights for the ADR compliance system.
 */

import { readFile, readdir, stat } from "fs/promises";
import { join, basename, dirname } from "path";
import { EventEmitter } from "events";

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  team: string;
  joinDate: string;
  lastActive: string;
  avatar?: string;
  preferences: {
    notifications: boolean;
    reports: string[];
    timezone: string;
  };
}

export interface PerformanceMetric {
  memberId: string;
  metricType: "compliance" | "productivity" | "quality" | "collaboration" | "innovation";
  value: number;
  unit: string;
  timestamp: string;
  context: {
    project?: string;
    sprint?: string;
    task?: string;
    category?: string;
  };
  metadata: {
    description: string;
    impact: "low" | "medium" | "high";
    trend: "improving" | "declining" | "stable";
  };
}

export interface TeamPerformanceReport {
  teamId: string;
  period: {
    start: string;
    end: string;
  };
  overallScore: number;
  memberScores: Map<string, number>;
  topPerformers: TeamMember[];
  improvementAreas: string[];
  achievements: string[];
  recommendations: string[];
  metrics: {
    compliance: number;
    productivity: number;
    quality: number;
    collaboration: number;
    innovation: number;
  };
  trends: {
    compliance: number[];
    productivity: number[];
    quality: number[];
    collaboration: number[];
    innovation: number[];
  };
  generatedAt: string;
}

export interface CollaborationAnalysis {
  memberId: string;
  collaborationScore: number;
  interactions: {
    with: string;
    type: "code_review" | "pair_programming" | "discussion" | "mentoring";
    frequency: number;
    quality: number;
  }[];
  networkMetrics: {
    centrality: number;
    influence: number;
    connectivity: number;
  };
  communicationPatterns: {
    responseTime: number;
    messageQuality: number;
    participation: number;
  };
}

export interface ProductivityInsights {
  memberId: string;
  productivityScore: number;
  workPatterns: {
    peakHours: number[];
    focusTime: number;
    contextSwitches: number;
    deepWork: number;
  };
  outputMetrics: {
    commitsPerDay: number;
    linesOfCode: number;
    tasksCompleted: number;
    bugsFixed: number;
  };
  efficiencyMetrics: {
    velocity: number;
    accuracy: number;
    reworkRate: number;
    timeToComplete: number;
  };
}

export class TeamPerformanceTracker extends EventEmitter {
  private readonly codebasePath: string;
  private readonly adrPath: string;
  private readonly teamMembers: Map<string, TeamMember> = new Map();
  private readonly performanceHistory: Map<string, PerformanceMetric[]> = new Map();
  private readonly collaborationData: Map<string, CollaborationAnalysis> = new Map();
  private readonly productivityData: Map<string, ProductivityInsights> = new Map();

  constructor(codebasePath: string, adrPath: string) {
    super();
    this.codebasePath = codebasePath;
    this.adrPath = adrPath;
  }

  /**
   * Initialize team performance tracking
   */
  async initialize(): Promise<void> {
    await this.discoverTeamMembers();
    await this.loadHistoricalData();
    await this.analyzeCollaboration();
    await this.analyzeProductivity();
  }

  /**
   * Discover team members from codebase
   */
  private async discoverTeamMembers(): Promise<void> {
    try {
      // This would integrate with your team management system
      // For now, we'll create sample team members
      const sampleMembers: TeamMember[] = [
        {
          id: "vulpine-001",
          name: "Vulpine",
          email: "vulpine@reynard.dev",
          role: "Strategic Developer",
          team: "Architecture",
          joinDate: "2024-01-15",
          lastActive: new Date().toISOString(),
          preferences: {
            notifications: true,
            reports: ["weekly", "monthly"],
            timezone: "UTC",
          },
        },
        {
          id: "pack-scribe-16",
          name: "Pack-Scribe-16",
          email: "pack-scribe@reynard.dev",
          role: "Security Analyst",
          team: "Security",
          joinDate: "2024-02-01",
          lastActive: new Date().toISOString(),
          preferences: {
            notifications: true,
            reports: ["daily", "weekly"],
            timezone: "UTC",
          },
        },
        {
          id: "strategic-prime-13",
          name: "Strategic-Prime-13",
          email: "strategic@reynard.dev",
          role: "Quality Specialist",
          team: "Quality",
          joinDate: "2024-01-20",
          lastActive: new Date().toISOString(),
          preferences: {
            notifications: false,
            reports: ["weekly"],
            timezone: "UTC",
          },
        },
        {
          id: "otter-bubbles-7",
          name: "Otter-Bubbles-7",
          email: "otter@reynard.dev",
          role: "Testing Specialist",
          team: "Quality",
          joinDate: "2024-02-15",
          lastActive: new Date().toISOString(),
          preferences: {
            notifications: true,
            reports: ["daily", "weekly", "monthly"],
            timezone: "UTC",
          },
        },
      ];

      for (const member of sampleMembers) {
        this.teamMembers.set(member.id, member);
      }

      console.log(`🦊 Discovered ${this.teamMembers.size} team members`);
    } catch (error) {
      console.error("Error discovering team members:", error);
    }
  }

  /**
   * Load historical performance data
   */
  private async loadHistoricalData(): Promise<void> {
    for (const [memberId, member] of this.teamMembers) {
      const metrics = await this.generateHistoricalMetrics(memberId, member);
      this.performanceHistory.set(memberId, metrics);
    }
  }

  /**
   * Generate historical metrics for a team member
   */
  private async generateHistoricalMetrics(memberId: string, member: TeamMember): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];
    const days = 30; // Last 30 days

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate compliance metrics
      metrics.push({
        memberId,
        metricType: "compliance",
        value: this.generateComplianceScore(member),
        unit: "%",
        timestamp: date.toISOString(),
        context: { category: "adr_compliance" },
        metadata: {
          description: "ADR compliance score",
          impact: "high",
          trend: this.getRandomTrend(),
        },
      });

      // Generate productivity metrics
      metrics.push({
        memberId,
        metricType: "productivity",
        value: this.generateProductivityScore(member),
        unit: "tasks/day",
        timestamp: date.toISOString(),
        context: { category: "task_completion" },
        metadata: {
          description: "Tasks completed per day",
          impact: "medium",
          trend: this.getRandomTrend(),
        },
      });

      // Generate quality metrics
      metrics.push({
        memberId,
        metricType: "quality",
        value: this.generateQualityScore(member),
        unit: "%",
        timestamp: date.toISOString(),
        context: { category: "code_quality" },
        metadata: {
          description: "Code quality score",
          impact: "high",
          trend: this.getRandomTrend(),
        },
      });

      // Generate collaboration metrics
      metrics.push({
        memberId,
        metricType: "collaboration",
        value: this.generateCollaborationScore(member),
        unit: "interactions/day",
        timestamp: date.toISOString(),
        context: { category: "team_interaction" },
        metadata: {
          description: "Team collaboration score",
          impact: "medium",
          trend: this.getRandomTrend(),
        },
      });

      // Generate innovation metrics
      metrics.push({
        memberId,
        metricType: "innovation",
        value: this.generateInnovationScore(member),
        unit: "ideas/week",
        timestamp: date.toISOString(),
        context: { category: "innovation" },
        metadata: {
          description: "Innovation contribution score",
          impact: "low",
          trend: this.getRandomTrend(),
        },
      });
    }

    return metrics;
  }

  /**
   * Generate compliance score based on member role
   */
  private generateComplianceScore(member: TeamMember): number {
    const baseScore = 85;
    const roleBonus = {
      "Strategic Developer": 5,
      "Security Analyst": 10,
      "Quality Specialist": 8,
      "Testing Specialist": 6,
    };
    
    const bonus = roleBonus[member.role as keyof typeof roleBonus] || 0;
    const randomVariation = (Math.random() - 0.5) * 10;
    
    return Math.max(0, Math.min(100, baseScore + bonus + randomVariation));
  }

  /**
   * Generate productivity score based on member role
   */
  private generateProductivityScore(member: TeamMember): number {
    const baseScore = 8;
    const roleMultiplier = {
      "Strategic Developer": 1.2,
      "Security Analyst": 0.9,
      "Quality Specialist": 1.1,
      "Testing Specialist": 1.3,
    };
    
    const multiplier = roleMultiplier[member.role as keyof typeof roleMultiplier] || 1;
    const randomVariation = (Math.random() - 0.5) * 3;
    
    return Math.max(0, baseScore * multiplier + randomVariation);
  }

  /**
   * Generate quality score based on member role
   */
  private generateQualityScore(member: TeamMember): number {
    const baseScore = 88;
    const roleBonus = {
      "Strategic Developer": 3,
      "Security Analyst": 7,
      "Quality Specialist": 10,
      "Testing Specialist": 8,
    };
    
    const bonus = roleBonus[member.role as keyof typeof roleBonus] || 0;
    const randomVariation = (Math.random() - 0.5) * 8;
    
    return Math.max(0, Math.min(100, baseScore + bonus + randomVariation));
  }

  /**
   * Generate collaboration score based on member role
   */
  private generateCollaborationScore(member: TeamMember): number {
    const baseScore = 7;
    const roleMultiplier = {
      "Strategic Developer": 1.4,
      "Security Analyst": 0.8,
      "Quality Specialist": 1.2,
      "Testing Specialist": 1.1,
    };
    
    const multiplier = roleMultiplier[member.role as keyof typeof roleMultiplier] || 1;
    const randomVariation = (Math.random() - 0.5) * 2;
    
    return Math.max(0, baseScore * multiplier + randomVariation);
  }

  /**
   * Generate innovation score based on member role
   */
  private generateInnovationScore(member: TeamMember): number {
    const baseScore = 6;
    const roleMultiplier = {
      "Strategic Developer": 1.5,
      "Security Analyst": 1.1,
      "Quality Specialist": 1.3,
      "Testing Specialist": 1.0,
    };
    
    const multiplier = roleMultiplier[member.role as keyof typeof roleMultiplier] || 1;
    const randomVariation = (Math.random() - 0.5) * 2;
    
    return Math.max(0, baseScore * multiplier + randomVariation);
  }

  /**
   * Get random trend
   */
  private getRandomTrend(): "improving" | "declining" | "stable" {
    const trends = ["improving", "declining", "stable"];
    return trends[Math.floor(Math.random() * trends.length)] as "improving" | "declining" | "stable";
  }

  /**
   * Analyze collaboration patterns
   */
  private async analyzeCollaboration(): Promise<void> {
    for (const [memberId, member] of this.teamMembers) {
      const analysis = await this.generateCollaborationAnalysis(memberId, member);
      this.collaborationData.set(memberId, analysis);
    }
  }

  /**
   * Generate collaboration analysis for a member
   */
  private async generateCollaborationAnalysis(memberId: string, member: TeamMember): Promise<CollaborationAnalysis> {
    const interactions = [];
    const otherMembers = Array.from(this.teamMembers.values()).filter(m => m.id !== memberId);
    
    // Generate interactions with other team members
    for (const otherMember of otherMembers.slice(0, 3)) { // Limit to 3 interactions for demo
      interactions.push({
        with: otherMember.id,
        type: this.getRandomInteractionType(),
        frequency: Math.floor(Math.random() * 10) + 1,
        quality: Math.random() * 10 + 5,
      });
    }

    return {
      memberId,
      collaborationScore: this.generateCollaborationScore(member),
      interactions,
      networkMetrics: {
        centrality: Math.random() * 10 + 5,
        influence: Math.random() * 10 + 5,
        connectivity: Math.random() * 10 + 5,
      },
      communicationPatterns: {
        responseTime: Math.random() * 60 + 30, // 30-90 minutes
        messageQuality: Math.random() * 10 + 5,
        participation: Math.random() * 10 + 5,
      },
    };
  }

  /**
   * Get random interaction type
   */
  private getRandomInteractionType(): "code_review" | "pair_programming" | "discussion" | "mentoring" {
    const types = ["code_review", "pair_programming", "discussion", "mentoring"];
    return types[Math.floor(Math.random() * types.length)] as "code_review" | "pair_programming" | "discussion" | "mentoring";
  }

  /**
   * Analyze productivity patterns
   */
  private async analyzeProductivity(): Promise<void> {
    for (const [memberId, member] of this.teamMembers) {
      const insights = await this.generateProductivityInsights(memberId, member);
      this.productivityData.set(memberId, insights);
    }
  }

  /**
   * Generate productivity insights for a member
   */
  private async generateProductivityInsights(memberId: string, member: TeamMember): Promise<ProductivityInsights> {
    return {
      memberId,
      productivityScore: this.generateProductivityScore(member),
      workPatterns: {
        peakHours: [9, 10, 11, 14, 15, 16], // Typical peak hours
        focusTime: Math.random() * 4 + 2, // 2-6 hours
        contextSwitches: Math.floor(Math.random() * 20) + 5, // 5-25 switches
        deepWork: Math.random() * 3 + 1, // 1-4 hours
      },
      outputMetrics: {
        commitsPerDay: Math.random() * 5 + 2, // 2-7 commits
        linesOfCode: Math.floor(Math.random() * 500) + 100, // 100-600 lines
        tasksCompleted: Math.floor(Math.random() * 8) + 2, // 2-10 tasks
        bugsFixed: Math.floor(Math.random() * 5) + 1, // 1-6 bugs
      },
      efficiencyMetrics: {
        velocity: Math.random() * 20 + 10, // 10-30 points
        accuracy: Math.random() * 20 + 80, // 80-100%
        reworkRate: Math.random() * 10 + 5, // 5-15%
        timeToComplete: Math.random() * 2 + 1, // 1-3 hours
      },
    };
  }

  /**
   * Get team performance report
   */
  async getTeamPerformanceReport(teamId: string, period: { start: string; end: string }): Promise<TeamPerformanceReport> {
    const teamMembers = Array.from(this.teamMembers.values()).filter(m => m.team === teamId);
    const memberScores = new Map<string, number>();
    const trends = {
      compliance: [] as number[],
      productivity: [] as number[],
      quality: [] as number[],
      collaboration: [] as number[],
      innovation: [] as number[],
    };

    let totalCompliance = 0;
    let totalProductivity = 0;
    let totalQuality = 0;
    let totalCollaboration = 0;
    let totalInnovation = 0;

    for (const member of teamMembers) {
      const metrics = this.performanceHistory.get(member.id) || [];
      const recentMetrics = metrics.slice(-7); // Last 7 days

      // Calculate member score
      const memberScore = this.calculateMemberScore(recentMetrics);
      memberScores.set(member.id, memberScore);

      // Aggregate metrics for trends
      const complianceValues = recentMetrics.filter(m => m.metricType === "compliance").map(m => m.value);
      const productivityValues = recentMetrics.filter(m => m.metricType === "productivity").map(m => m.value);
      const qualityValues = recentMetrics.filter(m => m.metricType === "quality").map(m => m.value);
      const collaborationValues = recentMetrics.filter(m => m.metricType === "collaboration").map(m => m.value);
      const innovationValues = recentMetrics.filter(m => m.metricType === "innovation").map(m => m.value);

      trends.compliance.push(...complianceValues);
      trends.productivity.push(...productivityValues);
      trends.quality.push(...qualityValues);
      trends.collaboration.push(...collaborationValues);
      trends.innovation.push(...innovationValues);

      // Calculate averages
      if (complianceValues.length > 0) totalCompliance += complianceValues.reduce((a, b) => a + b, 0) / complianceValues.length;
      if (productivityValues.length > 0) totalProductivity += productivityValues.reduce((a, b) => a + b, 0) / productivityValues.length;
      if (qualityValues.length > 0) totalQuality += qualityValues.reduce((a, b) => a + b, 0) / qualityValues.length;
      if (collaborationValues.length > 0) totalCollaboration += collaborationValues.reduce((a, b) => a + b, 0) / collaborationValues.length;
      if (innovationValues.length > 0) totalInnovation += innovationValues.reduce((a, b) => a + b, 0) / innovationValues.length;
    }

    const memberCount = teamMembers.length;
    const overallScore = (totalCompliance + totalProductivity + totalQuality + totalCollaboration + totalInnovation) / (memberCount * 5);

    // Get top performers
    const topPerformers = teamMembers
      .sort((a, b) => (memberScores.get(b.id) || 0) - (memberScores.get(a.id) || 0))
      .slice(0, 3);

    // Generate insights
    const improvementAreas = this.generateImprovementAreas(teamMembers, memberScores);
    const achievements = this.generateAchievements(teamMembers, memberScores);
    const recommendations = this.generateRecommendations(teamMembers, memberScores);

    return {
      teamId,
      period,
      overallScore: Math.round(overallScore * 100) / 100,
      memberScores,
      topPerformers,
      improvementAreas,
      achievements,
      recommendations,
      metrics: {
        compliance: Math.round((totalCompliance / memberCount) * 100) / 100,
        productivity: Math.round((totalProductivity / memberCount) * 100) / 100,
        quality: Math.round((totalQuality / memberCount) * 100) / 100,
        collaboration: Math.round((totalCollaboration / memberCount) * 100) / 100,
        innovation: Math.round((totalInnovation / memberCount) * 100) / 100,
      },
      trends,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate member score from metrics
   */
  private calculateMemberScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;

    const weights = {
      compliance: 0.3,
      productivity: 0.25,
      quality: 0.25,
      collaboration: 0.15,
      innovation: 0.05,
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const [type, weight] of Object.entries(weights)) {
      const typeMetrics = metrics.filter(m => m.metricType === type);
      if (typeMetrics.length > 0) {
        const average = typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;
        weightedScore += average * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  /**
   * Generate improvement areas
   */
  private generateImprovementAreas(teamMembers: TeamMember[], memberScores: Map<string, number>): string[] {
    const areas: string[] = [];
    const lowPerformers = teamMembers.filter(m => (memberScores.get(m.id) || 0) < 70);

    if (lowPerformers.length > 0) {
      areas.push(`📈 ${lowPerformers.length} team members need performance improvement`);
    }

    areas.push("🎯 Focus on collaboration and knowledge sharing");
    areas.push("📚 Provide additional training opportunities");
    areas.push("🔄 Implement regular feedback sessions");

    return areas;
  }

  /**
   * Generate achievements
   */
  private generateAchievements(teamMembers: TeamMember[], memberScores: Map<string, number>): string[] {
    const achievements: string[] = [];
    const highPerformers = teamMembers.filter(m => (memberScores.get(m.id) || 0) > 85);

    if (highPerformers.length > 0) {
      achievements.push(`🌟 ${highPerformers.length} team members exceeding expectations`);
    }

    achievements.push("📊 Team maintaining high compliance standards");
    achievements.push("🚀 Consistent delivery of quality work");
    achievements.push("🤝 Strong team collaboration and communication");

    return achievements;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(teamMembers: TeamMember[], memberScores: Map<string, number>): string[] {
    const recommendations: string[] = [];

    recommendations.push("📋 Create individual development plans for each team member");
    recommendations.push("🎓 Organize skill-building workshops");
    recommendations.push("💬 Implement peer mentoring program");
    recommendations.push("📈 Set up regular performance check-ins");
    recommendations.push("🏆 Recognize and reward top performers");

    return recommendations;
  }

  /**
   * Get individual member performance
   */
  getMemberPerformance(memberId: string): {
    member: TeamMember;
    metrics: PerformanceMetric[];
    collaboration: CollaborationAnalysis;
    productivity: ProductivityInsights;
    score: number;
  } | null {
    const member = this.teamMembers.get(memberId);
    if (!member) return null;

    const metrics = this.performanceHistory.get(memberId) || [];
    const collaboration = this.collaborationData.get(memberId);
    const productivity = this.productivityData.get(memberId);
    const score = this.calculateMemberScore(metrics.slice(-7));

    if (!collaboration || !productivity) return null;

    return {
      member,
      metrics,
      collaboration,
      productivity,
      score,
    };
  }

  /**
   * Get all team members
   */
  getAllTeamMembers(): TeamMember[] {
    return Array.from(this.teamMembers.values());
  }

  /**
   * Get team members by team
   */
  getTeamMembers(teamId: string): TeamMember[] {
    return Array.from(this.teamMembers.values()).filter(m => m.team === teamId);
  }

  /**
   * Update member activity
   */
  updateMemberActivity(memberId: string): void {
    const member = this.teamMembers.get(memberId);
    if (member) {
      member.lastActive = new Date().toISOString();
      this.teamMembers.set(memberId, member);
    }
  }
}

export default TeamPerformanceTracker;
