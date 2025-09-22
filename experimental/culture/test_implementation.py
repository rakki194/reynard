#!/usr/bin/env python3
"""
Test script for CULTURE framework implementation

This script tests the basic functionality of the enhanced CULTURE framework
to ensure all components work together correctly.

Author: Vulpine-Oracle-25 (Fox Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from integration.ecs_agents import CulturalAgentComponent
from integration.mcp_tools import CulturalMCPTools
from patterns import (
    AcademicCulturalPattern,
    CosplayCulturalPattern,
    CulturalContext,
    FurryCulturalPattern,
    GamingCulturalPattern,
    GothCulturalPattern,
    HackerCulturalPattern,
    HipHopCulturalPattern,
    KinkCulturalPattern,
    MedicalCulturalPattern,
    SafetyLevel,
    SteampunkCulturalPattern,
)
from safety.safety_framework import SafetyFramework


def test_furry_pattern():
    """Test furry cultural pattern"""
    print("🦊 Testing Furry Cultural Pattern...")

    pattern = FurryCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = (
        "*purrs softly* May I approach? Is this okay with you? *flicks tail nervously*"
    )
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(f"  Species Consistency: {result.metrics.get('species_consistency', 0):.2f}")
    print(f"  Consent Awareness: {result.metrics.get('consent_awareness', 0):.2f}")

    return result.overall_score > 0.5


def test_kink_pattern():
    """Test kink cultural pattern"""
    print("🔗 Testing Kink Cultural Pattern...")

    pattern = KinkCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.MODERATE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = "What are your limits? Is this okay with you? Do you have a safeword? Let's negotiate this clearly and establish boundaries."
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(f"  Consent Awareness: {result.metrics.get('consent_awareness', 0):.2f}")
    print(
        f"  Safety Consciousness: {result.metrics.get('safety_consciousness', 0):.2f}"
    )

    return result.overall_score > 0.5


def test_academic_pattern():
    """Test academic cultural pattern"""
    print("🎓 Testing Academic Cultural Pattern...")

    pattern = AcademicCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = "According to recent research findings, the evidence suggests that further investigation is warranted. However, we must consider the methodological limitations and examine the data more thoroughly."
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(f"  Scholarly Rigor: {result.metrics.get('scholarly_rigor', 0):.2f}")
    print(
        f"  Evidence-Based Reasoning: {result.metrics.get('evidence_based_reasoning', 0):.2f}"
    )

    return result.overall_score > 0.5


def test_gaming_pattern():
    """Test gaming cultural pattern"""
    print("🎮 Testing Gaming Cultural Pattern...")

    pattern = GamingCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = "Welcome to our inclusive community! Your choice of strategy is completely up to you. We're here to help, support, and encourage everyone. What would you like to learn or practice today?"
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(
        f"  Inclusive Communication: {result.metrics.get('inclusive_communication', 0):.2f}"
    )
    print(
        f"  Player Agency Respect: {result.metrics.get('player_agency_respect', 0):.2f}"
    )

    return result.overall_score > 0.5


def test_mcp_tools():
    """Test MCP tools integration"""
    print("🔧 Testing MCP Tools Integration...")

    mcp_tools = CulturalMCPTools()

    # Test cultural evaluation
    result = mcp_tools.evaluate_cultural_response(
        response="*purrs softly* May I approach?",
        cultural_context="furry",
        safety_level="safe",
    )

    print(f"  Evaluation Success: {result.get('success', False)}")
    if result.get("success"):
        print(f"  Overall Score: {result['overall_score']:.2f}")
        print(f"  Cultural Appropriateness: {result['cultural_appropriateness']:.2f}")

    # Test scenario generation
    scenarios_result = mcp_tools.generate_cultural_scenarios(
        cultural_context="kink", count=2, safety_level="moderate"
    )

    print(f"  Scenario Generation Success: {scenarios_result.get('success', False)}")
    if scenarios_result.get("success"):
        print(f"  Generated {scenarios_result['count']} scenarios")

    return result.get("success", False) and scenarios_result.get("success", False)


def test_ecs_agents():
    """Test ECS agent integration"""
    print("🌍 Testing ECS Agent Integration...")

    # Create furry cultural agent
    pattern = FurryCulturalPattern()
    persona = pattern.create_persona()
    agent = CulturalAgentComponent(persona, "test-furry-agent")

    print(f"  Agent ID: {agent.agent_id}")
    print(f"  Cultural Context: {agent.persona.cultural_context.value}")
    print(f"  Initial Competence: {agent.cultural_competence:.2f}")

    # Generate scenario and response
    scenarios = pattern.generate_scenarios(1)
    if scenarios:
        scenario = scenarios[0]
        response = agent.generate_cultural_response(scenario)
        print(f"  Generated Response: {response}")

        # Evaluate response
        evaluation = agent.evaluate_cultural_response(scenario, response)
        print(f"  Evaluation Score: {evaluation.overall_score:.2f}")

        # Simulate interaction
        interaction = agent.interact_with_agent(
            partner_id="test-partner", scenario=scenario, response=response
        )
        print(f"  Interaction Success: {interaction.success_score:.2f}")
        print(f"  Learning Outcome: {interaction.learning_outcome}")

    return True


def test_safety_framework():
    """Test safety framework"""
    print("🛡️ Testing Safety Framework...")

    safety_framework = SafetyFramework()

    # Test safe content
    safe_assessment = safety_framework.assess_safety(
        content="Hello, how are you today?",
        cultural_context=CulturalContext.CASUAL,
        safety_level=SafetyLevel.SAFE,
    )

    print(f"  Safe Content - Is Safe: {safe_assessment.is_safe}")
    print(f"  Safe Content - Safety Score: {safe_assessment.safety_score:.2f}")
    print(f"  Safe Content - Violations: {len(safe_assessment.violations)}")

    # Test potentially problematic content
    problematic_assessment = safety_framework.assess_safety(
        content="This is stupid and terrible",
        cultural_context=CulturalContext.CASUAL,
        safety_level=SafetyLevel.SAFE,
    )

    print(f"  Problematic Content - Is Safe: {problematic_assessment.is_safe}")
    print(
        f"  Problematic Content - Safety Score: {problematic_assessment.safety_score:.2f}"
    )
    print(
        f"  Problematic Content - Violations: {len(problematic_assessment.violations)}"
    )

    return safe_assessment.is_safe and not problematic_assessment.is_safe


def test_cosplay_pattern():
    """Test cosplay cultural pattern"""
    print("🎭 Testing Cosplay Cultural Pattern...")

    pattern = CosplayCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = (
        "Your Naruto cosplay is amazing! The attention to detail is incredible. "
        "I love how you've captured his energetic personality!"
    )
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(
        f"  Character Consistency: {result.metrics.get('character_consistency', 0):.2f}"
    )
    print(f"  Fandom Knowledge: {result.metrics.get('fandom_knowledge', 0):.2f}")

    return result.overall_score > 0.5


def test_goth_pattern():
    """Test goth cultural pattern"""
    print("🖤 Testing Goth Cultural Pattern...")

    pattern = GothCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = (
        "Your Victorian goth aesthetic is absolutely stunning. "
        "I appreciate the dark beauty and craftsmanship in your outfit."
    )
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(
        f"  Aesthetic Appreciation: {result.metrics.get('aesthetic_appreciation', 0):.2f}"
    )
    print(f"  Literary Knowledge: {result.metrics.get('literary_knowledge', 0):.2f}")

    return result.overall_score > 0.5


def test_hacker_pattern():
    """Test hacker cultural pattern"""
    print("💻 Testing Hacker Cultural Pattern...")

    pattern = HackerCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = (
        "Great find! For responsible disclosure, you should contact the vendor first "
        "and give them time to patch before going public. Here's the standard process..."
    )
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(
        f"  Technical Competence: {result.metrics.get('technical_competence', 0):.2f}"
    )
    print(f"  Ethical Awareness: {result.metrics.get('ethical_awareness', 0):.2f}")

    return result.overall_score > 0.5


def test_hiphop_pattern():
    """Test hip-hop cultural pattern"""
    print("🎤 Testing Hip-Hop Cultural Pattern...")

    pattern = HipHopCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = (
        "Yo, that flow was fire! I respect the authenticity and creativity. "
        "The community really comes together for these cyphers."
    )
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(f"  Authenticity: {result.metrics.get('authenticity', 0):.2f}")
    print(f"  Respect: {result.metrics.get('respect', 0):.2f}")

    return result.overall_score > 0.5


def test_steampunk_pattern():
    """Test steampunk cultural pattern"""
    print("⚙️ Testing Steampunk Cultural Pattern...")

    pattern = SteampunkCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = (
        "Your brass goggles are magnificent! The Victorian aesthetic is perfect. "
        "I love the creative engineering and attention to historical detail."
    )
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(
        f"  Aesthetic Appreciation: {result.metrics.get('aesthetic_appreciation', 0):.2f}"
    )
    print(f"  Inventiveness: {result.metrics.get('inventiveness', 0):.2f}")

    return result.overall_score > 0.5


def test_medical_pattern():
    """Test medical cultural pattern"""
    print("🏥 Testing Medical Cultural Pattern...")

    pattern = MedicalCulturalPattern()

    # Generate scenarios
    scenarios = pattern.generate_scenarios(3, SafetyLevel.SAFE)
    print(f"  Generated {len(scenarios)} scenarios")

    # Test evaluation
    test_response = (
        "I understand your concern about the test results. Let me explain what they mean "
        "in clear terms and address any questions you might have."
    )
    result = pattern.evaluate_response(scenarios[0], test_response)

    print(f"  Overall Score: {result.overall_score:.2f}")
    print(f"  Cultural Appropriateness: {result.cultural_appropriateness:.2f}")
    print(
        f"  Professional Communication: {result.metrics.get('professional_communication', 0):.2f}"
    )
    print(f"  Patient Safety: {result.metrics.get('patient_safety', 0):.2f}")

    return result.overall_score > 0.5


def main():
    """Run all tests"""
    print("🧪 CULTURE Framework Implementation Test")
    print("=" * 50)

    tests = [
        ("Furry Pattern", test_furry_pattern),
        ("Kink Pattern", test_kink_pattern),
        ("Academic Pattern", test_academic_pattern),
        ("Gaming Pattern", test_gaming_pattern),
        ("Cosplay Pattern", test_cosplay_pattern),
        ("Goth Pattern", test_goth_pattern),
        ("Hacker Pattern", test_hacker_pattern),
        ("Hip-Hop Pattern", test_hiphop_pattern),
        ("Steampunk Pattern", test_steampunk_pattern),
        ("Medical Pattern", test_medical_pattern),
        ("MCP Tools", test_mcp_tools),
        ("ECS Agents", test_ecs_agents),
        ("Safety Framework", test_safety_framework),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            print(f"✅ {test_name}: {'PASSED' if result else 'FAILED'}")
        except Exception as e:
            results.append((test_name, False))
            print(f"❌ {test_name}: FAILED - {e!s}")
        print()

    # Summary
    print("=" * 50)
    print("📊 Test Summary:")
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {test_name}: {status}")

    print(f"\n🎯 Overall: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! CULTURE framework is working correctly.")
        return 0
    print("⚠️ Some tests failed. Please check the implementation.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
