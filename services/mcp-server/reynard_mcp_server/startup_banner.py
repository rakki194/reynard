#!/usr/bin/env python3
"""
Reynard MCP Server Startup Banner
=================================

Legendary startup banner showcasing all capabilities of the Reynard MCP server.
This banner displays the full power of our apex predator development toolkit.
"""

from datetime import datetime


def print_startup_banner():
    """Print the legendary Reynard MCP server startup banner."""

    # Get current time for the banner
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

    banner = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🦊🦦🐺 REYNARD MCP SERVER - APEX PREDATOR OF DEVELOPMENT TOOLING 🐺🦦🦊    ║
║                                                                              ║
║  ════════════════════════════════════════════════════════════════════════    ║
║                                                                              ║
║  🎯 COMPREHENSIVE DEVELOPMENT ECOSYSTEM - 50+ TOOLS ACROSS 8 CATEGORIES     ║
║                                                                              ║
║  🦊 AGENT TOOLS (14 tools)                                                   ║
║     • generate_agent_name     • assign_agent_name     • get_agent_name      ║
║     • list_agent_names        • create_offspring      • get_agent_lineage   ║
║     • analyze_genetic_compatibility • find_compatible_mates                 ║
║     • get_current_time        • get_current_location  • send_desktop_notification ║
║     • restart_mcp_server      • roll_agent_spirit     • agent_startup_sequence ║
║                                                                              ║
║  🔍 LINTING & FORMATTING (8 tools)                                          ║
║     • lint_frontend           • format_frontend       • lint_python         ║
║     • format_python           • lint_markdown         • validate_comprehensive ║
║     • scan_security           • run_all_linting       • scan_security_fast  ║
║     • scan_security_full                                                      ║
║                                                                              ║
║  📊 VERSION & VS CODE (9 tools)                                             ║
║     • get_versions            • get_python_version    • get_node_version    ║
║     • get_typescript_version  • get_vscode_active_file • get_vscode_workspace_info ║
║     • get_vscode_extensions   • discover_vscode_tasks • validate_vscode_task ║
║     • execute_vscode_task     • get_vscode_task_info                         ║
║                                                                              ║
║  🔍 FILE SEARCH (4 tools)                                                   ║
║     • search_files            • list_files            • semantic_search     ║
║     • search_code_patterns                                                      ║
║                                                                              ║
║  🧠 SEMANTIC SEARCH (5 tools)                                               ║
║     • semantic_search         • hybrid_search         • embed_text          ║
║     • index_documents         • get_search_stats                             ║
║                                                                              ║
║  🖼️ IMAGE VIEWER (3 tools)                                                  ║
║     • open_image              • search_images         • get_image_info      ║
║                                                                              ║
║  📈 MERMAID DIAGRAMS (5 tools)                                              ║
║     • validate_mermaid_diagram • render_mermaid_to_svg • render_mermaid_to_png ║
║     • get_mermaid_diagram_stats • test_mermaid_render                        ║
║                                                                              ║
║  🔍 ENHANCED SEARCH (5 tools)                                               ║
║     • search_enhanced         • get_query_suggestions • get_search_analytics ║
║     • clear_search_cache      • reindex_project       • search_by_file_type ║
║     • search_in_directory     • search_needle_in_haystack                    ║
║                                                                              ║
║  🦊 MONOLITH DETECTION (3 tools)                                            ║
║     • detect_monoliths        • analyze_file_complexity • get_code_metrics_summary ║
║                                                                              ║
║  ════════════════════════════════════════════════════════════════════════    ║
║                                                                              ║
║  🎯 SPECIALIST CAPABILITIES:                                                ║
║                                                                              ║
║  🦊 FOX: Strategic Development - ESLint, Prettier, TypeScript, Architecture ║
║  🦦 OTTER: Quality Assurance - Python validation, testing, comprehensive    ║
║  🐺 WOLF: Security Analysis - Bandit, audit-ci, vulnerability hunting       ║
║                                                                              ║
║  ════════════════════════════════════════════════════════════════════════    ║
║                                                                              ║
║  🚀 ADVANCED FEATURES:                                                      ║
║     • RAG-powered semantic search with vector embeddings                    ║
║     • 140-line axiom monolith detection and analysis                        ║
║     • VS Code integration with task discovery and execution                 ║
║     • Mermaid diagram validation and rendering (SVG/PNG)                    ║
║     • Image viewer integration with imv                                     ║
║     • Desktop notifications with libnotify                                  ║
║     • Agent naming system with animal spirit themes                         ║
║     • Comprehensive security scanning and auditing                          ║
║                                                                              ║
║  ════════════════════════════════════════════════════════════════════════    ║
║                                                                              ║
║  🎯 READY TO HUNT - {timestamp}                                              ║
║                                                                              ║
║  We are the apex predators of the code jungle! Every bug is prey to be      ║
║  tracked down and eliminated. Every complex problem is a challenge to be    ║
║  conquered with fox cunning, otter thoroughness, and wolf aggression.       ║
║                                                                              ║
║  🦊🦦🐺 WELCOME TO THE HUNT! 🐺🦦🦊                                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

    print(banner)


if __name__ == "__main__":
    print_startup_banner()
