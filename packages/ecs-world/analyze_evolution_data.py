#!/usr/bin/env python3
"""
Evolution Data Analysis

Analyzes the JSON data from the big evolution simulation and draws conclusions
about how the ECS world evolves over time.

Author: Wit-Prime-13 (Fox Specialist)
"""

import json
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from typing import Dict, List, Any
import statistics


class EvolutionAnalyzer:
    """Analyzes evolution simulation data and draws conclusions."""
    
    def __init__(self, json_file_path: str):
        """
        Initialize the analyzer with simulation data.
        
        Args:
            json_file_path: Path to the JSON simulation data file
        """
        self.json_file_path = Path(json_file_path)
        with open(self.json_file_path, 'r') as f:
            self.data = json.load(f)
        
        self.trait_names = [
            "dominance", "loyalty", "cunning", "aggression", 
            "intelligence", "creativity", "playfulness", "patience"
        ]
    
    def analyze_population_dynamics(self) -> Dict[str, Any]:
        """Analyze population dynamics over time."""
        print("📊 Analyzing Population Dynamics...")
        
        population_data = self.data["statistics"]["population_over_time"]
        generations = list(range(len(population_data)))
        
        analysis = {
            "initial_population": population_data[0],
            "final_population": population_data[-1],
            "max_population": max(population_data),
            "min_population": min(population_data),
            "population_growth_rate": (population_data[-1] - population_data[0]) / population_data[0] if population_data[0] > 0 else 0,
            "population_stability": np.std(population_data) / np.mean(population_data) if np.mean(population_data) > 0 else 0,
            "generations": len(population_data)
        }
        
        # Calculate growth phases
        if len(population_data) > 2:
            growth_rates = []
            for i in range(1, len(population_data)):
                growth_rate = (population_data[i] - population_data[i-1]) / population_data[i-1] if population_data[i-1] > 0 else 0
                growth_rates.append(growth_rate)
            
            analysis["average_growth_rate"] = np.mean(growth_rates)
            analysis["growth_rate_volatility"] = np.std(growth_rates)
        
        print(f"   Initial Population: {analysis['initial_population']}")
        print(f"   Final Population: {analysis['final_population']}")
        print(f"   Population Growth Rate: {analysis['population_growth_rate']:.2%}")
        print(f"   Population Stability: {analysis['population_stability']:.3f}")
        
        return analysis
    
    def analyze_genetic_diversity(self) -> Dict[str, Any]:
        """Analyze genetic diversity evolution."""
        print("🧬 Analyzing Genetic Diversity...")
        
        diversity_data = self.data["statistics"]["genetic_diversity"]
        generations = list(range(len(diversity_data)))
        
        analysis = {
            "initial_diversity": diversity_data[0],
            "final_diversity": diversity_data[-1],
            "max_diversity": max(diversity_data),
            "min_diversity": min(diversity_data),
            "diversity_trend": "increasing" if diversity_data[-1] > diversity_data[0] else "decreasing",
            "diversity_change": diversity_data[-1] - diversity_data[0],
            "diversity_volatility": np.std(diversity_data)
        }
        
        # Calculate diversity phases
        if len(diversity_data) > 2:
            diversity_changes = []
            for i in range(1, len(diversity_data)):
                change = diversity_data[i] - diversity_data[i-1]
                diversity_changes.append(change)
            
            analysis["average_diversity_change"] = np.mean(diversity_changes)
            analysis["diversity_stability"] = 1 - (np.std(diversity_changes) / abs(np.mean(diversity_changes))) if np.mean(diversity_changes) != 0 else 0
        
        print(f"   Initial Diversity: {analysis['initial_diversity']:.3f}")
        print(f"   Final Diversity: {analysis['final_diversity']:.3f}")
        print(f"   Diversity Trend: {analysis['diversity_trend']}")
        print(f"   Diversity Change: {analysis['diversity_change']:+.3f}")
        
        return analysis
    
    def analyze_trait_evolution(self) -> Dict[str, Any]:
        """Analyze trait evolution patterns."""
        print("🎯 Analyzing Trait Evolution...")
        
        analysis = {}
        
        for trait in self.trait_names:
            trait_data = self.data["statistics"]["trait_evolution"][trait]
            means = trait_data["mean_over_time"]
            stds = trait_data["std_over_time"]
            
            trait_analysis = {
                "initial_mean": means[0],
                "final_mean": means[-1],
                "mean_change": means[-1] - means[0],
                "max_mean": max(means),
                "min_mean": min(means),
                "mean_trend": "increasing" if means[-1] > means[0] else "decreasing",
                "initial_variance": stds[0],
                "final_variance": stds[-1],
                "variance_change": stds[-1] - stds[0],
                "variance_trend": "increasing" if stds[-1] > stds[0] else "decreasing"
            }
            
            # Calculate trait stability
            trait_analysis["stability"] = 1 - (np.std(means) / np.mean(means)) if np.mean(means) > 0 else 0
            
            # Calculate evolution rate
            if len(means) > 1:
                evolution_rates = []
                for i in range(1, len(means)):
                    rate = (means[i] - means[i-1]) / means[i-1] if means[i-1] > 0 else 0
                    evolution_rates.append(rate)
                trait_analysis["average_evolution_rate"] = np.mean(evolution_rates)
                trait_analysis["evolution_volatility"] = np.std(evolution_rates)
            
            analysis[trait] = trait_analysis
            
            print(f"   {trait.capitalize()}: {trait_analysis['mean_change']:+.3f} ({trait_analysis['mean_trend']})")
        
        return analysis
    
    def analyze_breeding_patterns(self) -> Dict[str, Any]:
        """Analyze breeding and compatibility patterns."""
        print("💕 Analyzing Breeding Patterns...")
        
        breeding_events = self.data["statistics"]["breeding_events"]
        compatibility_scores = self.data["statistics"]["compatibility_scores"]
        
        analysis = {
            "total_breeding_events": len(breeding_events),
            "average_compatibility": np.mean(compatibility_scores) if compatibility_scores else 0,
            "compatibility_std": np.std(compatibility_scores) if compatibility_scores else 0,
            "min_compatibility": min(compatibility_scores) if compatibility_scores else 0,
            "max_compatibility": max(compatibility_scores) if compatibility_scores else 0,
            "breeding_success_rate": len(breeding_events) / len(compatibility_scores) if compatibility_scores else 0
        }
        
        # Analyze breeding by generation
        breeding_by_generation = {}
        for event in breeding_events:
            gen = event["generation"]
            if gen not in breeding_by_generation:
                breeding_by_generation[gen] = []
            breeding_by_generation[gen].append(event["compatibility"])
        
        analysis["breeding_by_generation"] = {
            gen: {
                "count": len(compatibilities),
                "average_compatibility": np.mean(compatibilities),
                "compatibility_range": max(compatibilities) - min(compatibilities)
            }
            for gen, compatibilities in breeding_by_generation.items()
        }
        
        print(f"   Total Breeding Events: {analysis['total_breeding_events']}")
        print(f"   Average Compatibility: {analysis['average_compatibility']:.3f}")
        print(f"   Breeding Success Rate: {analysis['breeding_success_rate']:.2%}")
        
        return analysis
    
    def analyze_mutation_patterns(self) -> Dict[str, Any]:
        """Analyze mutation patterns and effects."""
        print("🧪 Analyzing Mutation Patterns...")
        
        mutation_counts = []
        for gen in self.data["generations"]:
            for agent in gen["agents"]:
                mutation_counts.append(agent["mutation_count"])
        
        analysis = {
            "total_mutations": sum(mutation_counts),
            "average_mutations_per_agent": np.mean(mutation_counts) if mutation_counts else 0,
            "max_mutations": max(mutation_counts) if mutation_counts else 0,
            "mutation_distribution": {
                "0": mutation_counts.count(0),
                "1": mutation_counts.count(1),
                "2": mutation_counts.count(2),
                "3+": sum(1 for count in mutation_counts if count >= 3)
            }
        }
        
        # Analyze mutation effects on traits
        mutation_effects = {}
        for trait in self.trait_names:
            trait_by_mutations = {0: [], 1: [], 2: [], 3: []}
            
            for gen in self.data["generations"]:
                for agent in gen["agents"]:
                    mutation_count = min(agent["mutation_count"], 3)
                    trait_value = agent["traits"].get(trait, 0)
                    trait_by_mutations[mutation_count].append(trait_value)
            
            mutation_effects[trait] = {
                str(mut_count): {
                    "mean": np.mean(values) if values else 0,
                    "std": np.std(values) if values else 0,
                    "count": len(values)
                }
                for mut_count, values in trait_by_mutations.items()
            }
        
        analysis["mutation_effects"] = mutation_effects
        
        print(f"   Total Mutations: {analysis['total_mutations']}")
        print(f"   Average Mutations per Agent: {analysis['average_mutations_per_agent']:.2f}")
        print(f"   Max Mutations: {analysis['max_mutations']}")
        
        return analysis
    
    def analyze_spirit_evolution(self) -> Dict[str, Any]:
        """Analyze how different spirits evolve and compete."""
        print("🦊 Analyzing Spirit Evolution...")
        
        spirits = self.data["metadata"]["spirits"]
        spirit_analysis = {}
        
        for spirit in spirits:
            spirit_data = {
                "initial_count": 0,
                "final_count": 0,
                "max_count": 0,
                "count_over_time": [],
                "average_traits": {},
                "breeding_success": 0
            }
            
            # Count spirits over time
            for gen in self.data["generations"]:
                count = sum(1 for agent in gen["agents"] if agent["spirit"] == spirit)
                spirit_data["count_over_time"].append(count)
                spirit_data["max_count"] = max(spirit_data["max_count"], count)
            
            spirit_data["initial_count"] = spirit_data["count_over_time"][0]
            spirit_data["final_count"] = spirit_data["count_over_time"][-1]
            
            # Calculate average traits for this spirit
            for trait in self.trait_names:
                trait_values = []
                for gen in self.data["generations"]:
                    for agent in gen["agents"]:
                        if agent["spirit"] == spirit:
                            trait_values.append(agent["traits"].get(trait, 0))
                spirit_data["average_traits"][trait] = np.mean(trait_values) if trait_values else 0
            
            # Count breeding success
            for event in self.data["statistics"]["breeding_events"]:
                # Check if either parent was this spirit
                parent1_spirit = None
                parent2_spirit = None
                
                for gen in self.data["generations"]:
                    for agent in gen["agents"]:
                        if agent["id"] == event["parent1"]:
                            parent1_spirit = agent["spirit"]
                        if agent["id"] == event["parent2"]:
                            parent2_spirit = agent["spirit"]
                
                if parent1_spirit == spirit or parent2_spirit == spirit:
                    spirit_data["breeding_success"] += 1
            
            spirit_analysis[spirit] = spirit_data
            
            print(f"   {spirit.capitalize()}: {spirit_data['initial_count']} → {spirit_data['final_count']} (breeding: {spirit_data['breeding_success']})")
        
        return spirit_analysis
    
    def generate_conclusions(self) -> Dict[str, Any]:
        """Generate comprehensive conclusions about the evolution."""
        print("\n🎯 Generating Evolution Conclusions...")
        
        # Run all analyses
        population_analysis = self.analyze_population_dynamics()
        diversity_analysis = self.analyze_genetic_diversity()
        trait_analysis = self.analyze_trait_evolution()
        breeding_analysis = self.analyze_breeding_patterns()
        mutation_analysis = self.analyze_mutation_patterns()
        spirit_analysis = self.analyze_spirit_evolution()
        
        conclusions = {
            "overall_evolution_summary": {
                "population_growth": population_analysis["population_growth_rate"],
                "genetic_diversity_trend": diversity_analysis["diversity_trend"],
                "total_breeding_events": breeding_analysis["total_breeding_events"],
                "average_mutations_per_agent": mutation_analysis["average_mutations_per_agent"]
            },
            "key_findings": [],
            "evolution_patterns": {},
            "recommendations": []
        }
        
        # Generate key findings
        if population_analysis["population_growth_rate"] > 0.1:
            conclusions["key_findings"].append("Population experienced significant growth")
        elif population_analysis["population_growth_rate"] < -0.1:
            conclusions["key_findings"].append("Population experienced significant decline")
        else:
            conclusions["key_findings"].append("Population remained relatively stable")
        
        if diversity_analysis["diversity_trend"] == "increasing":
            conclusions["key_findings"].append("Genetic diversity increased over time")
        else:
            conclusions["key_findings"].append("Genetic diversity decreased over time")
        
        # Analyze trait evolution patterns
        trait_trends = []
        for trait, analysis in trait_analysis.items():
            if abs(analysis["mean_change"]) > 0.05:
                trend = "increased" if analysis["mean_change"] > 0 else "decreased"
                trait_trends.append(f"{trait} {trend} significantly")
        
        if trait_trends:
            conclusions["key_findings"].append(f"Notable trait changes: {', '.join(trait_trends)}")
        
        # Analyze spirit competition
        spirit_success = [(spirit, data["final_count"] - data["initial_count"]) 
                         for spirit, data in spirit_analysis.items()]
        spirit_success.sort(key=lambda x: x[1], reverse=True)
        
        if spirit_success[0][1] > 0:
            conclusions["key_findings"].append(f"{spirit_success[0][0].capitalize()} was the most successful spirit")
        
        # Evolution patterns
        conclusions["evolution_patterns"] = {
            "population_dynamics": "stable" if population_analysis["population_stability"] < 0.2 else "volatile",
            "genetic_diversity": diversity_analysis["diversity_trend"],
            "trait_evolution": "significant" if any(abs(analysis["mean_change"]) > 0.05 for analysis in trait_analysis.values()) else "minimal",
            "breeding_success": "high" if breeding_analysis["breeding_success_rate"] > 0.7 else "moderate" if breeding_analysis["breeding_success_rate"] > 0.4 else "low"
        }
        
        # Generate recommendations
        if diversity_analysis["diversity_trend"] == "decreasing":
            conclusions["recommendations"].append("Consider increasing mutation rates to maintain genetic diversity")
        
        if breeding_analysis["breeding_success_rate"] < 0.5:
            conclusions["recommendations"].append("Consider lowering compatibility thresholds to increase breeding")
        
        if population_analysis["population_stability"] > 0.3:
            conclusions["recommendations"].append("Population is highly volatile - consider implementing population control mechanisms")
        
        return conclusions
    
    def save_analysis_report(self, output_file: str = "evolution_analysis_report.json"):
        """Save the complete analysis report."""
        conclusions = self.generate_conclusions()
        
        # Combine all analyses
        full_report = {
            "simulation_metadata": self.data["metadata"],
            "population_analysis": self.analyze_population_dynamics(),
            "genetic_diversity_analysis": self.analyze_genetic_diversity(),
            "trait_evolution_analysis": self.analyze_trait_evolution(),
            "breeding_patterns_analysis": self.analyze_breeding_patterns(),
            "mutation_patterns_analysis": self.analyze_mutation_patterns(),
            "spirit_evolution_analysis": self.analyze_spirit_evolution(),
            "conclusions": conclusions
        }
        
        output_path = self.json_file_path.parent / output_file
        with open(output_path, 'w') as f:
            json.dump(full_report, f, indent=2)
        
        print(f"📊 Analysis report saved to: {output_path}")
        return output_path


def main():
    """Run the evolution data analysis."""
    print("🦊 ECS World Evolution Data Analysis")
    print("=" * 50)
    
    # Look for the simulation data file
    data_file = Path("temp_simulation_data/evolution_simulation_data.json")
    
    if not data_file.exists():
        print(f"❌ Simulation data file not found: {data_file}")
        print("Please run the big_evolution_simulation.py first.")
        return
    
    # Create analyzer and run analysis
    analyzer = EvolutionAnalyzer(data_file)
    
    # Generate and save analysis report
    report_path = analyzer.save_analysis_report()
    
    print(f"\n🎉 Analysis completed successfully!")
    print(f"📊 Report saved to: {report_path}")
    
    return analyzer


if __name__ == "__main__":
    main()
