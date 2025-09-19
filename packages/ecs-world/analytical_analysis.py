#!/usr/bin/env python3
"""
Analytical Analysis of ECS World Evolution Results

Deep statistical and mathematical analysis of the simulation results to extract
meaningful insights about evolutionary patterns, genetic dynamics, and emergent behaviors.

Author: Wit-Prime-13 (Fox Specialist)
"""

import json
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from scipy.optimize import curve_fit
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')


class ECSWorldAnalyticalAnalyzer:
    """Advanced analytical analysis of ECS world evolution data."""
    
    def __init__(self, data_file: str):
        """Initialize with simulation data."""
        with open(data_file, 'r') as f:
            self.data = json.load(f)
        
        self.generations = list(range(len(self.data["statistics"]["population_over_time"])))
        self.population_data = self.data["statistics"]["population_over_time"]
        self.diversity_data = self.data["statistics"]["genetic_diversity"]
        self.trait_names = [
            "dominance", "loyalty", "cunning", "aggression", 
            "intelligence", "creativity", "playfulness", "patience"
        ]
    
    def analyze_population_growth_dynamics(self) -> Dict[str, Any]:
        """Analyze population growth using mathematical models."""
        print("📈 Analyzing Population Growth Dynamics...")
        
        # Convert to numpy arrays
        generations = np.array(self.generations)
        population = np.array(self.population_data)
        
        # 1. Linear Growth Analysis
        linear_slope, linear_intercept, linear_r, linear_p, linear_std_err = stats.linregress(generations, population)
        
        # 2. Exponential Growth Analysis
        # Fit exponential model: P(t) = P0 * e^(rt)
        def exponential_model(t, P0, r):
            return P0 * np.exp(r * t)
        
        try:
            exp_params, exp_cov = curve_fit(exponential_model, generations, population, p0=[population[0], 0.1])
            exp_P0, exp_r = exp_params
            exp_predicted = exponential_model(generations, exp_P0, exp_r)
            exp_r_squared = 1 - np.sum((population - exp_predicted)**2) / np.sum((population - np.mean(population))**2)
        except:
            exp_r_squared = 0
            exp_r = 0
        
        # 3. Logistic Growth Analysis
        # Fit logistic model: P(t) = K / (1 + ((K-P0)/P0) * e^(-rt))
        def logistic_model(t, K, P0, r):
            return K / (1 + ((K - P0) / P0) * np.exp(-r * t))
        
        try:
            log_params, log_cov = curve_fit(logistic_model, generations, population, 
                                          p0=[population[-1] * 1.5, population[0], 0.1],
                                          maxfev=10000)
            log_K, log_P0, log_r = log_params
            log_predicted = logistic_model(generations, log_K, log_P0, log_r)
            log_r_squared = 1 - np.sum((population - log_predicted)**2) / np.sum((population - np.mean(population))**2)
        except:
            log_r_squared = 0
            log_r = 0
            log_K = 0
        
        # 4. Growth Rate Analysis
        growth_rates = np.diff(population) / population[:-1]
        avg_growth_rate = np.mean(growth_rates)
        growth_rate_volatility = np.std(growth_rates)
        
        # 5. Doubling Time Analysis
        if avg_growth_rate > 0:
            doubling_time = np.log(2) / avg_growth_rate
        else:
            doubling_time = float('inf')
        
        analysis = {
            "linear_model": {
                "slope": linear_slope,
                "intercept": linear_intercept,
                "r_squared": linear_r**2,
                "p_value": linear_p,
                "std_error": linear_std_err
            },
            "exponential_model": {
                "growth_rate": exp_r,
                "initial_population": exp_P0,
                "r_squared": exp_r_squared
            },
            "logistic_model": {
                "carrying_capacity": log_K,
                "initial_population": log_P0,
                "growth_rate": log_r,
                "r_squared": log_r_squared
            },
            "growth_metrics": {
                "average_growth_rate": avg_growth_rate,
                "growth_rate_volatility": growth_rate_volatility,
                "doubling_time": doubling_time,
                "total_growth_factor": population[-1] / population[0]
            }
        }
        
        print(f"   Linear R²: {linear_r**2:.4f}")
        print(f"   Exponential R²: {exp_r_squared:.4f}")
        print(f"   Logistic R²: {log_r_squared:.4f}")
        print(f"   Average Growth Rate: {avg_growth_rate:.4f}")
        print(f"   Doubling Time: {doubling_time:.2f} generations")
        
        return analysis
    
    def analyze_genetic_diversity_evolution(self) -> Dict[str, Any]:
        """Analyze genetic diversity evolution patterns."""
        print("🧬 Analyzing Genetic Diversity Evolution...")
        
        generations = np.array(self.generations)
        diversity = np.array(self.diversity_data)
        
        # 1. Diversity Decay Analysis
        # Fit exponential decay: D(t) = D0 * e^(-λt)
        def decay_model(t, D0, decay_rate):
            return D0 * np.exp(-decay_rate * t)
        
        try:
            decay_params, decay_cov = curve_fit(decay_model, generations, diversity, p0=[diversity[0], 0.01])
            decay_D0, decay_rate = decay_params
            decay_predicted = decay_model(generations, decay_D0, decay_rate)
            decay_r_squared = 1 - np.sum((diversity - decay_predicted)**2) / np.sum((diversity - np.mean(diversity))**2)
        except:
            decay_r_squared = 0
            decay_rate = 0
        
        # 2. Diversity Rate Analysis
        diversity_rates = np.diff(diversity)
        avg_diversity_change = np.mean(diversity_rates)
        diversity_volatility = np.std(diversity_rates)
        
        # 3. Convergence Analysis
        # Calculate how quickly diversity approaches its final value
        final_diversity = diversity[-1]
        convergence_threshold = 0.01
        convergence_generation = None
        
        for i, d in enumerate(diversity):
            if abs(d - final_diversity) < convergence_threshold:
                convergence_generation = i
                break
        
        # 4. Diversity Stability Analysis
        diversity_stability = 1 - (np.std(diversity) / np.mean(diversity))
        
        analysis = {
            "decay_model": {
                "initial_diversity": decay_D0,
                "decay_rate": decay_rate,
                "r_squared": decay_r_squared,
                "half_life": np.log(2) / decay_rate if decay_rate > 0 else float('inf')
            },
            "diversity_metrics": {
                "initial_diversity": diversity[0],
                "final_diversity": diversity[-1],
                "total_change": diversity[-1] - diversity[0],
                "relative_change": (diversity[-1] - diversity[0]) / diversity[0],
                "average_change_rate": avg_diversity_change,
                "diversity_volatility": diversity_volatility,
                "diversity_stability": diversity_stability
            },
            "convergence": {
                "convergence_generation": convergence_generation,
                "convergence_threshold": convergence_threshold,
                "final_diversity": final_diversity
            }
        }
        
        print(f"   Decay Rate: {decay_rate:.6f}")
        print(f"   Half-life: {analysis['decay_model']['half_life']:.2f} generations")
        print(f"   Total Change: {analysis['diversity_metrics']['total_change']:.4f}")
        print(f"   Diversity Stability: {diversity_stability:.4f}")
        
        return analysis
    
    def analyze_trait_evolution_patterns(self) -> Dict[str, Any]:
        """Analyze trait evolution using advanced statistical methods."""
        print("🎯 Analyzing Trait Evolution Patterns...")
        
        trait_analysis = {}
        
        for trait in self.trait_names:
            means = np.array(self.data["statistics"]["trait_evolution"][trait]["mean_over_time"])
            stds = np.array(self.data["statistics"]["trait_evolution"][trait]["std_over_time"])
            generations = np.array(self.generations)
            
            # 1. Trend Analysis
            slope, intercept, r_value, p_value, std_err = stats.linregress(generations, means)
            
            # 2. Variance Evolution
            var_slope, var_intercept, var_r, var_p, var_std_err = stats.linregress(generations, stds)
            
            # 3. Trait Stability Analysis
            trait_stability = 1 - (np.std(means) / np.mean(means))
            
            # 4. Evolution Rate Analysis
            trait_changes = np.diff(means)
            avg_evolution_rate = np.mean(trait_changes)
            evolution_volatility = np.std(trait_changes)
            
            # 5. Trait Correlation with Generation
            trait_generation_corr = np.corrcoef(generations, means)[0, 1]
            
            # 6. Variance Correlation with Generation
            variance_generation_corr = np.corrcoef(generations, stds)[0, 1]
            
            trait_analysis[trait] = {
                "trend_analysis": {
                    "slope": slope,
                    "intercept": intercept,
                    "r_squared": r_value**2,
                    "p_value": p_value,
                    "std_error": std_err,
                    "correlation": trait_generation_corr
                },
                "variance_evolution": {
                    "variance_slope": var_slope,
                    "variance_correlation": variance_generation_corr,
                    "variance_p_value": var_p
                },
                "evolution_metrics": {
                    "initial_value": means[0],
                    "final_value": means[-1],
                    "total_change": means[-1] - means[0],
                    "relative_change": (means[-1] - means[0]) / means[0],
                    "average_evolution_rate": avg_evolution_rate,
                    "evolution_volatility": evolution_volatility,
                    "trait_stability": trait_stability
                }
            }
        
        # 7. Cross-trait Analysis
        trait_correlations = {}
        trait_means_matrix = np.array([
            self.data["statistics"]["trait_evolution"][trait]["mean_over_time"] 
            for trait in self.trait_names
        ])
        
        trait_correlation_matrix = np.corrcoef(trait_means_matrix)
        
        for i, trait1 in enumerate(self.trait_names):
            trait_correlations[trait1] = {}
            for j, trait2 in enumerate(self.trait_names):
                if i != j:
                    trait_correlations[trait1][trait2] = trait_correlation_matrix[i, j]
        
        analysis = {
            "individual_traits": trait_analysis,
            "cross_trait_correlations": trait_correlations,
            "trait_correlation_matrix": trait_correlation_matrix.tolist()
        }
        
        # Print summary
        print("   Trait Evolution Summary:")
        for trait, data in trait_analysis.items():
            change = data["evolution_metrics"]["total_change"]
            trend = "increasing" if change > 0 else "decreasing"
            print(f"     {trait.capitalize()}: {change:+.4f} ({trend})")
        
        return analysis
    
    def analyze_breeding_dynamics(self) -> Dict[str, Any]:
        """Analyze breeding patterns and compatibility dynamics."""
        print("💕 Analyzing Breeding Dynamics...")
        
        breeding_events = self.data["statistics"]["breeding_events"]
        compatibility_scores = np.array(self.data["statistics"]["compatibility_scores"])
        
        # 1. Compatibility Distribution Analysis
        compatibility_stats = {
            "mean": np.mean(compatibility_scores),
            "median": np.median(compatibility_scores),
            "std": np.std(compatibility_scores),
            "min": np.min(compatibility_scores),
            "max": np.max(compatibility_scores),
            "skewness": stats.skew(compatibility_scores),
            "kurtosis": stats.kurtosis(compatibility_scores)
        }
        
        # 2. Breeding Success by Generation
        breeding_by_generation = {}
        for event in breeding_events:
            gen = event["generation"]
            if gen not in breeding_by_generation:
                breeding_by_generation[gen] = []
            breeding_by_generation[gen].append(event["compatibility"])
        
        generation_analysis = {}
        for gen, scores in breeding_by_generation.items():
            generation_analysis[gen] = {
                "breeding_count": len(scores),
                "avg_compatibility": np.mean(scores),
                "compatibility_std": np.std(scores),
                "min_compatibility": np.min(scores),
                "max_compatibility": np.max(scores)
            }
        
        # 3. Compatibility Trend Analysis
        generation_numbers = list(generation_analysis.keys())
        avg_compatibilities = [generation_analysis[gen]["avg_compatibility"] for gen in generation_numbers]
        
        if len(generation_numbers) > 1:
            compat_slope, compat_intercept, compat_r, compat_p, compat_std_err = stats.linregress(generation_numbers, avg_compatibilities)
        else:
            compat_slope = compat_r = compat_p = 0
        
        # 4. Breeding Efficiency Analysis
        total_breeding_attempts = len(compatibility_scores)
        successful_breedings = len(breeding_events)
        breeding_efficiency = successful_breedings / total_breeding_attempts if total_breeding_attempts > 0 else 0
        
        analysis = {
            "compatibility_distribution": compatibility_stats,
            "generation_analysis": generation_analysis,
            "compatibility_trend": {
                "slope": compat_slope,
                "correlation": compat_r,
                "p_value": compat_p,
                "std_error": compat_std_err
            },
            "breeding_efficiency": {
                "total_attempts": total_breeding_attempts,
                "successful_breedings": successful_breedings,
                "efficiency": breeding_efficiency
            }
        }
        
        print(f"   Average Compatibility: {compatibility_stats['mean']:.3f}")
        print(f"   Compatibility Range: {compatibility_stats['min']:.3f} - {compatibility_stats['max']:.3f}")
        print(f"   Breeding Efficiency: {breeding_efficiency:.2%}")
        print(f"   Compatibility Trend: {compat_slope:+.6f} per generation")
        
        return analysis
    
    def analyze_spirit_competition(self) -> Dict[str, Any]:
        """Analyze spirit competition and evolutionary success."""
        print("🦊 Analyzing Spirit Competition...")
        
        spirits = self.data["metadata"]["spirits"]
        spirit_analysis = {}
        
        # 1. Population Growth Analysis by Spirit
        for spirit in spirits:
            initial_count = 0
            final_count = 0
            breeding_events = 0
            population_over_time = []
            
            for gen in self.data["generations"]:
                count = sum(1 for agent in gen["agents"] if agent["spirit"] == spirit)
                population_over_time.append(count)
                if gen["generation"] == 0:
                    initial_count = count
                elif gen["generation"] == len(self.data["generations"]) - 1:
                    final_count = count
            
            # Count breeding events for this spirit
            for event in self.data["statistics"]["breeding_events"]:
                # Check if either parent was this spirit
                for gen in self.data["generations"]:
                    for agent in gen["agents"]:
                        if agent["id"] == event["parent1"] and agent["spirit"] == spirit:
                            breeding_events += 1
                        elif agent["id"] == event["parent2"] and agent["spirit"] == spirit:
                            breeding_events += 1
            
            # Calculate growth metrics
            growth_rate = (final_count - initial_count) / initial_count if initial_count > 0 else 0
            avg_population = np.mean(population_over_time)
            population_volatility = np.std(population_over_time)
            
            # Calculate breeding efficiency
            breeding_efficiency = breeding_events / avg_population if avg_population > 0 else 0
            
            spirit_analysis[spirit] = {
                "initial_population": initial_count,
                "final_population": final_count,
                "growth_rate": growth_rate,
                "breeding_events": breeding_events,
                "breeding_efficiency": breeding_efficiency,
                "avg_population": avg_population,
                "population_volatility": population_volatility,
                "population_over_time": population_over_time
            }
        
        # 2. Spirit Competition Analysis
        spirit_rankings = sorted(spirit_analysis.items(), key=lambda x: x[1]["final_population"], reverse=True)
        
        # 3. Competitive Advantage Analysis
        competitive_analysis = {}
        for spirit, data in spirit_analysis.items():
            competitive_advantage = data["growth_rate"] - np.mean([s[1]["growth_rate"] for s in spirit_rankings])
            competitive_analysis[spirit] = {
                "competitive_advantage": competitive_advantage,
                "rank": next(i for i, (s, _) in enumerate(spirit_rankings) if s == spirit) + 1
            }
        
        analysis = {
            "spirit_performance": spirit_analysis,
            "spirit_rankings": spirit_rankings,
            "competitive_analysis": competitive_analysis
        }
        
        print("   Spirit Performance Rankings:")
        for i, (spirit, data) in enumerate(spirit_rankings):
            print(f"     {i+1}. {spirit.capitalize()}: {data['final_population']} agents ({data['growth_rate']:+.1%} growth)")
        
        return analysis
    
    def perform_comprehensive_analysis(self) -> Dict[str, Any]:
        """Perform comprehensive analytical analysis."""
        print("🔬 Performing Comprehensive Analytical Analysis...")
        print("=" * 60)
        
        analysis = {
            "population_dynamics": self.analyze_population_growth_dynamics(),
            "genetic_diversity": self.analyze_genetic_diversity_evolution(),
            "trait_evolution": self.analyze_trait_evolution_patterns(),
            "breeding_dynamics": self.analyze_breeding_dynamics(),
            "spirit_competition": self.analyze_spirit_competition()
        }
        
        # Generate overall conclusions
        conclusions = self.generate_analytical_conclusions(analysis)
        analysis["conclusions"] = conclusions
        
        return analysis
    
    def generate_analytical_conclusions(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate analytical conclusions from the analysis."""
        print("\n🎯 Generating Analytical Conclusions...")
        
        conclusions = {
            "population_growth_model": "unknown",
            "genetic_diversity_pattern": "unknown",
            "trait_evolution_drivers": [],
            "breeding_success_factors": [],
            "spirit_competition_insights": [],
            "evolutionary_pressures": [],
            "system_dynamics": {}
        }
        
        # 1. Determine best population growth model
        pop_models = analysis["population_dynamics"]
        model_r_squared = {
            "linear": pop_models["linear_model"]["r_squared"],
            "exponential": pop_models["exponential_model"]["r_squared"],
            "logistic": pop_models["logistic_model"]["r_squared"]
        }
        best_model = max(model_r_squared, key=model_r_squared.get)
        conclusions["population_growth_model"] = best_model
        
        # 2. Analyze genetic diversity pattern
        diversity_analysis = analysis["genetic_diversity"]
        if diversity_analysis["decay_model"]["r_squared"] > 0.8:
            conclusions["genetic_diversity_pattern"] = "exponential_decay"
        elif diversity_analysis["diversity_metrics"]["total_change"] < -0.05:
            conclusions["genetic_diversity_pattern"] = "convergence"
        else:
            conclusions["genetic_diversity_pattern"] = "stable"
        
        # 3. Identify trait evolution drivers
        trait_analysis = analysis["trait_evolution"]["individual_traits"]
        significant_traits = []
        for trait, data in trait_analysis.items():
            if abs(data["evolution_metrics"]["total_change"]) > 0.01:
                significant_traits.append({
                    "trait": trait,
                    "change": data["evolution_metrics"]["total_change"],
                    "trend": "increasing" if data["evolution_metrics"]["total_change"] > 0 else "decreasing"
                })
        
        conclusions["trait_evolution_drivers"] = significant_traits
        
        # 4. Analyze breeding success factors
        breeding_analysis = analysis["breeding_dynamics"]
        if breeding_analysis["breeding_efficiency"]["efficiency"] > 0.8:
            conclusions["breeding_success_factors"].append("high_compatibility_threshold")
        if breeding_analysis["compatibility_trend"]["slope"] > 0:
            conclusions["breeding_success_factors"].append("increasing_compatibility_over_time")
        
        # 5. Spirit competition insights
        spirit_analysis = analysis["spirit_competition"]
        top_spirit = spirit_analysis["spirit_rankings"][0]
        conclusions["spirit_competition_insights"].append(f"{top_spirit[0].capitalize()} was most successful")
        
        # 6. Identify evolutionary pressures
        if any(t["change"] > 0.01 for t in significant_traits if t["trait"] in ["intelligence", "cunning"]):
            conclusions["evolutionary_pressures"].append("strategic_thinking_selection")
        if any(t["change"] < -0.01 for t in significant_traits if t["trait"] in ["loyalty", "patience"]):
            conclusions["evolutionary_pressures"].append("independence_selection")
        
        # 7. System dynamics
        conclusions["system_dynamics"] = {
            "growth_type": best_model,
            "diversity_trend": conclusions["genetic_diversity_pattern"],
            "evolutionary_stability": "stable" if len(significant_traits) < 4 else "dynamic",
            "competitive_balance": "balanced" if len(spirit_analysis["spirit_rankings"]) > 3 else "dominated"
        }
        
        print(f"   Population Growth Model: {best_model}")
        print(f"   Genetic Diversity Pattern: {conclusions['genetic_diversity_pattern']}")
        print(f"   Significant Trait Changes: {len(significant_traits)}")
        print(f"   Evolutionary Pressures: {len(conclusions['evolutionary_pressures'])}")
        
        return conclusions
    
    def save_analytical_report(self, analysis: Dict[str, Any], output_file: str = "analytical_analysis_report.json"):
        """Save the analytical analysis report."""
        output_path = Path("temp_simulation_data") / output_file
        with open(output_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        print(f"📊 Analytical analysis report saved to: {output_path}")
        return output_path


def main():
    """Run the analytical analysis."""
    print("🔬 ECS World Analytical Analysis")
    print("=" * 50)
    
    data_file = "temp_simulation_data/evolution_simulation_data.json"
    if not Path(data_file).exists():
        print(f"❌ Simulation data file not found: {data_file}")
        return
    
    analyzer = ECSWorldAnalyticalAnalyzer(data_file)
    analysis = analyzer.perform_comprehensive_analysis()
    
    # Save the analysis
    report_path = analyzer.save_analytical_report(analysis)
    
    print(f"\n🎉 Analytical analysis completed!")
    print(f"📊 Report saved to: {report_path}")
    
    return analysis


if __name__ == "__main__":
    main()
