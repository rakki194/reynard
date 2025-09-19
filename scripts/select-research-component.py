#!/usr/bin/env python3
"""
Research Component Selection Script for Reynard Ecosystem

This script randomly selects components from the Reynard codebase for research analysis.
It provides detailed information about the selected component to guide agents in conducting
comprehensive research and generating meaningful LaTeX research proposals.

Author: Cascade-Sage-30 (Reynard Research Agent)
Date: 2025-01-15
"""

import os
import random
import json
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ComponentInfo:
    """Information about a selected component for research analysis."""
    path: str
    name: str
    category: str
    weight: float
    description: str
    files: List[str]
    subdirectories: List[str]
    file_count: int
    directory_count: int
    primary_languages: List[str]
    key_files: List[str]
    dependencies: List[str]
    research_focus_areas: List[str]

@dataclass
class ResearchAssignment:
    """Research assignment for an agent."""
    component: ComponentInfo
    agent_specialist: str
    research_questions: List[str]
    analysis_focus: List[str]
    timestamp: datetime
    assignment_id: str

class ReynardComponentSelector:
    """Handles random selection of components from the Reynard ecosystem for research."""
    
    def __init__(self, base_path: str = "/home/kade/runeset/reynard"):
        self.base_path = Path(base_path)
        self.components = self._discover_components()
        
    def _discover_components(self) -> Dict[str, List[ComponentInfo]]:
        """Discover all components in the Reynard ecosystem."""
        components = {
            'core_packages': [],
            'specialized_packages': [],
            'backend_services': [],
            'testing_quality': [],
            'examples_templates': [],
            'tools_scripts': []
        }
        
        # Core packages (Weight: 25%)
        core_packages = [
            'core', 'components', 'themes', 'i18n', 'ecs-world'
        ]
        for pkg in core_packages:
            pkg_path = self.base_path / 'packages' / pkg
            if pkg_path.exists():
                components['core_packages'].append(self._analyze_component(
                    str(pkg_path), pkg, 'core_packages', 0.25
                ))
        
        # Specialized packages (Weight: 20%)
        specialized_packages = [
            'chat', 'rag', 'auth', 'charts', 'gallery', 'annotating',
            'annotating-core', 'annotating-jtp2', 'annotating-joy',
            'annotating-florence2', 'annotating-wdv3', '3d', 'games',
            'monaco', 'floating-panel', 'caption', 'caption-core',
            'caption-multimodal', 'caption-ui', 'multimodal', 'audio',
            'video', 'image', 'segmentation', 'boundingbox', 'comfy',
            'file-processing', 'scraping', 'queue-watcher', 'service-manager',
            'settings', 'tools', 'ui', 'unified-repository', 'validation',
            'code-quality', 'algorithms', 'animation', 'api-client',
            'connection', 'dashboard', 'dev-server-management', 'diagram-generator',
            'docs-components', 'docs-core', 'docs-generator', 'docs-site',
            'error-boundaries', 'features', 'fluent-icons', 'gallery-ai',
            'gallery-dl', 'git-automation', 'model-management', 'nlweb',
            'project-architecture', 'repository-core', 'repository-multimodal',
            'repository-search', 'repository-storage'
        ]
        for pkg in specialized_packages:
            pkg_path = self.base_path / 'packages' / pkg
            if pkg_path.exists():
                components['specialized_packages'].append(self._analyze_component(
                    str(pkg_path), pkg, 'specialized_packages', 0.20
                ))
        
        # Backend services (Weight: 20%)
        backend_services = [
            'backend/app', 'services/mcp-server',
            'services/agent-naming', 'services/gatekeeper'
        ]
        for service in backend_services:
            service_path = self.base_path / service
            if service_path.exists():
                components['backend_services'].append(self._analyze_component(
                    str(service_path), service.replace('/', '-'), 'backend_services', 0.20
                ))
        
        # Testing and quality (Weight: 15%)
        testing_components = [
            'e2e', 'packages/testing', 'packages/code-quality'
        ]
        for test_comp in testing_components:
            test_path = self.base_path / test_comp
            if test_path.exists():
                components['testing_quality'].append(self._analyze_component(
                    str(test_path), test_comp.replace('/', '-'), 'testing_quality', 0.15
                ))
        
        # Examples and templates (Weight: 10%)
        examples_path = self.base_path / 'examples'
        templates_path = self.base_path / 'templates'
        if examples_path.exists():
            for example_dir in examples_path.iterdir():
                if example_dir.is_dir():
                    components['examples_templates'].append(self._analyze_component(
                        str(example_dir), f"example-{example_dir.name}", 'examples_templates', 0.10
                    ))
        if templates_path.exists():
            for template_dir in templates_path.iterdir():
                if template_dir.is_dir():
                    components['examples_templates'].append(self._analyze_component(
                        str(template_dir), f"template-{template_dir.name}", 'examples_templates', 0.10
                    ))
        
        # Tools and scripts (Weight: 10%)
        scripts_path = self.base_path / 'scripts'
        if scripts_path.exists():
            components['tools_scripts'].append(self._analyze_component(
                str(scripts_path), 'scripts', 'tools_scripts', 0.10
            ))
        
        return components
    
    def _analyze_component(self, path: str, name: str, category: str, weight: float) -> ComponentInfo:
        """Analyze a component and extract comprehensive information."""
        path_obj = Path(path)
        
        files = []
        subdirectories = []
        primary_languages = set()
        key_files = []
        dependencies = []
        
        if path_obj.exists():
            for item in path_obj.rglob('*'):
                if item.is_file() and not item.name.startswith('.'):
                    rel_path = str(item.relative_to(path_obj))
                    files.append(rel_path)
                    
                    # Identify primary languages
                    if item.suffix in ['.ts', '.tsx']:
                        primary_languages.add('TypeScript')
                    elif item.suffix in ['.js', '.jsx']:
                        primary_languages.add('JavaScript')
                    elif item.suffix == '.py':
                        primary_languages.add('Python')
                    elif item.suffix in ['.sh', '.bash']:
                        primary_languages.add('Shell')
                    elif item.suffix == '.md':
                        primary_languages.add('Markdown')
                    elif item.suffix in ['.json', '.yaml', '.yml']:
                        primary_languages.add('Configuration')
                    
                    # Identify key files
                    if item.name in ['README.md', 'package.json', 'tsconfig.json', 'main.py', 'index.ts', 'index.js']:
                        key_files.append(rel_path)
                        
                elif item.is_dir() and not item.name.startswith('.'):
                    subdirectories.append(str(item.relative_to(path_obj)))
        
        # Analyze dependencies from package.json if present
        package_json_path = path_obj / 'package.json'
        if package_json_path.exists():
            try:
                with open(package_json_path, 'r') as f:
                    package_data = json.load(f)
                    if 'dependencies' in package_data:
                        dependencies.extend(list(package_data['dependencies'].keys())[:10])  # Top 10
            except:
                pass
        
        # Generate research focus areas based on component characteristics
        research_focus_areas = self._generate_research_focus_areas(name, category, list(primary_languages))
        
        return ComponentInfo(
            path=path,
            name=name,
            category=category,
            weight=weight,
            description=self._generate_description(name, category, len(files), len(subdirectories)),
            files=files[:100],  # Limit to first 100 files for performance
            subdirectories=subdirectories[:20],  # Limit to first 20 subdirectories
            file_count=len(files),
            directory_count=len(subdirectories),
            primary_languages=list(primary_languages),
            key_files=key_files,
            dependencies=dependencies[:10],  # Top 10 dependencies
            research_focus_areas=research_focus_areas
        )
    
    def _generate_research_focus_areas(self, name: str, category: str, languages: List[str]) -> List[str]:
        """Generate research focus areas based on component characteristics."""
        focus_areas = []
        
        # Category-based focus areas
        if category == 'core_packages':
            focus_areas.extend(['Foundation Architecture', 'Core Utilities', 'Framework Integration'])
        elif category == 'specialized_packages':
            focus_areas.extend(['Domain-Specific Design', 'Specialized Functionality', 'Integration Patterns'])
        elif category == 'backend_services':
            focus_areas.extend(['Service Architecture', 'API Design', 'Backend Performance'])
        elif category == 'testing_quality':
            focus_areas.extend(['Quality Assurance', 'Testing Strategies', 'Code Analysis'])
        elif category == 'examples_templates':
            focus_areas.extend(['Usage Patterns', 'Best Practices', 'Template Design'])
        elif category == 'tools_scripts':
            focus_areas.extend(['Development Tools', 'Automation', 'Scripting Patterns'])
        
        # Language-based focus areas
        if 'TypeScript' in languages:
            focus_areas.extend(['Type Safety', 'Modern JavaScript Patterns'])
        if 'Python' in languages:
            focus_areas.extend(['Python Best Practices', 'Backend Services'])
        if 'Shell' in languages:
            focus_areas.extend(['System Integration', 'Automation Scripts'])
        
        # Name-based focus areas
        if 'auth' in name.lower():
            focus_areas.extend(['Security Patterns', 'Authentication', 'Authorization'])
        if 'chat' in name.lower():
            focus_areas.extend(['Real-time Communication', 'WebSocket Patterns'])
        if 'rag' in name.lower():
            focus_areas.extend(['AI Integration', 'Vector Databases', 'Semantic Search'])
        if '3d' in name.lower():
            focus_areas.extend(['3D Graphics', 'WebGL', 'Three.js Integration'])
        if 'game' in name.lower():
            focus_areas.extend(['Game Development', 'ECS Architecture', 'Performance Optimization'])
        
        return list(set(focus_areas))  # Remove duplicates
    
    def _generate_description(self, name: str, category: str, file_count: int, dir_count: int) -> str:
        """Generate a description for the component."""
        descriptions = {
            'core_packages': f"Core Reynard package providing foundational functionality with {file_count} files and {dir_count} subdirectories",
            'specialized_packages': f"Specialized Reynard package offering domain-specific functionality with {file_count} files and {dir_count} subdirectories",
            'backend_services': f"Backend service component handling server-side operations with {file_count} files and {dir_count} subdirectories",
            'testing_quality': f"Testing and quality assurance component with {file_count} files and {dir_count} subdirectories",
            'examples_templates': f"Example or template component demonstrating Reynard usage patterns with {file_count} files and {dir_count} subdirectories",
            'tools_scripts': f"Development tools and automation scripts with {file_count} files and {dir_count} subdirectories"
        }
        return descriptions.get(category, f"Reynard ecosystem component with {file_count} files and {dir_count} subdirectories")
    
    def select_random_component(self) -> ComponentInfo:
        """Select a random component using weighted selection."""
        all_components = []
        for category_components in self.components.values():
            all_components.extend(category_components)
        
        if not all_components:
            raise ValueError("No components found in the Reynard ecosystem")
        
        # Weighted random selection
        weights = [comp.weight for comp in all_components]
        selected = random.choices(all_components, weights=weights, k=1)[0]
        
        logger.info(f"Selected component: {selected.name} ({selected.category})")
        return selected

class ResearchAssignmentGenerator:
    """Generates research assignments for agents."""
    
    def __init__(self):
        self.specialists = ['fox', 'otter', 'wolf']
    
    def generate_assignment(self, component: ComponentInfo) -> ResearchAssignment:
        """Generate a research assignment for the selected component."""
        specialist = random.choice(self.specialists)
        research_questions = self._generate_research_questions(component, specialist)
        analysis_focus = self._generate_analysis_focus(component, specialist)
        
        assignment = ResearchAssignment(
            component=component,
            agent_specialist=specialist,
            research_questions=research_questions,
            analysis_focus=analysis_focus,
            timestamp=datetime.now(),
            assignment_id=f"{component.name}_{specialist}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )
        
        return assignment
    
    def _generate_research_questions(self, component: ComponentInfo, specialist: str) -> List[str]:
        """Generate research questions based on component and specialist."""
        base_questions = [
            f"How does the {component.name} component contribute to the overall Reynard ecosystem?",
            f"What are the key architectural patterns and design decisions in {component.name}?",
            f"How does {component.name} integrate with other Reynard components?",
            f"What are the performance characteristics and optimization opportunities in {component.name}?",
            f"What security considerations and potential vulnerabilities exist in {component.name}?"
        ]
        
        specialist_questions = {
            'fox': [
                f"What strategic improvements could enhance {component.name}'s architectural design?",
                f"How could {component.name} be refactored for better modularity and maintainability?",
                f"What are the long-term scalability considerations for {component.name}?"
            ],
            'otter': [
                f"What comprehensive testing strategies should be implemented for {component.name}?",
                f"How can the code quality and maintainability of {component.name} be improved?",
                f"What documentation and best practices are needed for {component.name}?"
            ],
            'wolf': [
                f"What security vulnerabilities and attack vectors exist in {component.name}?",
                f"How can {component.name} be hardened against potential security threats?",
                f"What performance bottlenecks and optimization opportunities exist in {component.name}?"
            ]
        }
        
        return base_questions + specialist_questions.get(specialist, [])
    
    def _generate_analysis_focus(self, component: ComponentInfo, specialist: str) -> List[str]:
        """Generate analysis focus areas based on component and specialist."""
        base_focus = [
            'Architectural Analysis',
            'Integration Patterns',
            'Performance Evaluation',
            'Security Assessment',
            'Maintainability Review'
        ]
        
        specialist_focus = {
            'fox': [
                'Strategic Design Patterns',
                'Scalability Architecture',
                'Modularity Assessment',
                'Future Evolution Planning'
            ],
            'otter': [
                'Comprehensive Testing',
                'Code Quality Metrics',
                'Documentation Analysis',
                'Best Practices Review'
            ],
            'wolf': [
                'Security Vulnerability Analysis',
                'Performance Optimization',
                'Adversarial Testing',
                'Threat Modeling'
            ]
        }
        
        return base_focus + specialist_focus.get(specialist, [])

def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description='Select components for research analysis')
    parser.add_argument('--base-path', default='/home/kade/runeset/reynard',
                       help='Base path to the Reynard codebase')
    parser.add_argument('--output-format', choices=['json', 'text', 'markdown'], default='json',
                       help='Output format for the research assignment')
    parser.add_argument('--output-file', help='Output file path (optional)')
    parser.add_argument('--specialist', choices=['fox', 'otter', 'wolf'], 
                       help='Force specific specialist (optional)')
    
    args = parser.parse_args()
    
    try:
        # Initialize components
        selector = ReynardComponentSelector(args.base_path)
        assignment_generator = ResearchAssignmentGenerator()
        
        # Select random component
        component = selector.select_random_component()
        
        # Generate research assignment
        if args.specialist:
            # Override specialist selection
            assignment = ResearchAssignment(
                component=component,
                agent_specialist=args.specialist,
                research_questions=assignment_generator._generate_research_questions(component, args.specialist),
                analysis_focus=assignment_generator._generate_analysis_focus(component, args.specialist),
                timestamp=datetime.now(),
                assignment_id=f"{component.name}_{args.specialist}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
        else:
            assignment = assignment_generator.generate_assignment(component)
        
        # Output assignment
        if args.output_format == 'json':
            output = json.dumps(asdict(assignment), indent=2, default=str)
        elif args.output_format == 'markdown':
            output = generate_markdown_assignment(assignment)
        else:  # text
            output = generate_text_assignment(assignment)
        
        if args.output_file:
            with open(args.output_file, 'w') as f:
                f.write(output)
            logger.info(f"Research assignment saved to: {args.output_file}")
        else:
            print(output)
        
        logger.info(f"Generated research assignment for {component.name} with {assignment.agent_specialist} specialist")
        
    except Exception as e:
        logger.error(f"Error generating research assignment: {e}")
        raise

def generate_markdown_assignment(assignment: ResearchAssignment) -> str:
    """Generate markdown format assignment."""
    component = assignment.component
    
    return f"""# Research Assignment: {component.name}

**Agent Specialist**: {assignment.agent_specialist}  
**Component Category**: {component.category}  
**Assignment ID**: {assignment.assignment_id}  
**Generated**: {assignment.timestamp}

## Component Information

- **Path**: `{component.path}`
- **Description**: {component.description}
- **File Count**: {component.file_count}
- **Directory Count**: {component.directory_count}
- **Primary Languages**: {', '.join(component.primary_languages)}

## Key Files

{chr(10).join(f'- `{file}`' for file in component.key_files[:10])}

## Dependencies

{chr(10).join(f'- {dep}' for dep in component.dependencies[:10])}

## Research Focus Areas

{chr(10).join(f'- {area}' for area in component.research_focus_areas)}

## Research Questions

{chr(10).join(f'{i+1}. {q}' for i, q in enumerate(assignment.research_questions))}

## Analysis Focus

{chr(10).join(f'- {focus}' for focus in assignment.analysis_focus)}

## Research Instructions

1. **Examine the Component**: Thoroughly analyze all source files, configuration, and documentation
2. **Conduct Web Research**: Research related technologies, best practices, and industry standards
3. **Perform Analysis**: Address all research questions using the specified analysis focus areas
4. **Generate Proposal**: Create a comprehensive LaTeX research proposal with your findings
5. **Include Citations**: Properly cite all research sources and references

## Expected Deliverables

- Comprehensive LaTeX research proposal
- Code examples and architectural diagrams
- Performance analysis and metrics
- Security assessment and recommendations
- Future work and implementation roadmap

---

*Generated by Reynard Research Component Selector - {assignment.timestamp}*
"""

def generate_text_assignment(assignment: ResearchAssignment) -> str:
    """Generate text format assignment."""
    component = assignment.component
    
    return f"""RESEARCH ASSIGNMENT: {component.name}
========================================

Agent Specialist: {assignment.agent_specialist}
Component Category: {component.category}
Assignment ID: {assignment.assignment_id}
Generated: {assignment.timestamp}

COMPONENT INFORMATION:
- Path: {component.path}
- Description: {component.description}
- File Count: {component.file_count}
- Directory Count: {component.directory_count}
- Primary Languages: {', '.join(component.primary_languages)}

KEY FILES:
{chr(10).join(f'  - {file}' for file in component.key_files[:10])}

DEPENDENCIES:
{chr(10).join(f'  - {dep}' for dep in component.dependencies[:10])}

RESEARCH FOCUS AREAS:
{chr(10).join(f'  - {area}' for area in component.research_focus_areas)}

RESEARCH QUESTIONS:
{chr(10).join(f'  {i+1}. {q}' for i, q in enumerate(assignment.research_questions))}

ANALYSIS FOCUS:
{chr(10).join(f'  - {focus}' for focus in assignment.analysis_focus)}

RESEARCH INSTRUCTIONS:
1. Examine the Component: Thoroughly analyze all source files, configuration, and documentation
2. Conduct Web Research: Research related technologies, best practices, and industry standards
3. Perform Analysis: Address all research questions using the specified analysis focus areas
4. Generate Proposal: Create a comprehensive LaTeX research proposal with your findings
5. Include Citations: Properly cite all research sources and references

EXPECTED DELIVERABLES:
- Comprehensive LaTeX research proposal
- Code examples and architectural diagrams
- Performance analysis and metrics
- Security assessment and recommendations
- Future work and implementation roadmap

Generated by Reynard Research Component Selector - {assignment.timestamp}
"""

if __name__ == "__main__":
    main()

