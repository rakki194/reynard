import argparse
import sys


def generate_mermaid_diagram(diagram_type, title, nodes):
    """
    Generates a simple Mermaid diagram string.
    :param diagram_type: Type of diagram (e.g., "graph TD", "sequenceDiagram")
    :param title: Title of the diagram
    :param nodes: List of nodes/steps for the diagram (e.g., ["A-->B", "B-->C"])
    :return: Mermaid diagram string
    """
    mermaid_content = f"{diagram_type}\n"
    if title:
        mermaid_content += f"  %%{{init: {{ 'theme': 'neutral'}}}}%\n  {title}\n"  # Added init for consistent theme
    for node in nodes:
        mermaid_content += f"  {node}\n"
    return mermaid_content


def main():
    parser = argparse.ArgumentParser(description="Generate Mermaid diagrams.")
    parser.add_argument(
        "--type",
        default="graph TD",
        help="Type of Mermaid diagram (e.g., 'graph TD', 'sequenceDiagram').",
    )
    parser.add_argument("--title", default="", help="Title of the diagram.")
    parser.add_argument(
        "--nodes",
        nargs="+",
        help="List of diagram nodes/steps (e.g., 'A-->B' 'B-->C').",
    )
    parser.add_argument(
        "--output", help="Output filename for the Mermaid definition (.mmd)."
    )

    args = parser.parse_args()

    if not args.nodes:
        print(
            "Error: Please provide at least one node for the diagram using --nodes.",
            file=sys.stderr,
        )
        sys.exit(1)

    diagram = generate_mermaid_diagram(args.type, args.title, args.nodes)

    if args.output:
        try:
            with open(args.output, "w") as f:
                f.write(diagram)
            print(f"Mermaid diagram definition saved to {args.output}")
            print(
                "To convert to SVG, you'll need mermaid-cli (mmdc). Install with: npm install -g @mermaid-js/mermaid-cli"
            )
            print(
                f"Then run: mmdc -i {args.output} -o {args.output.replace('.mmd', '.svg')}"
            )
        except OSError as e:
            print(f"Error saving file {args.output}: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(diagram)


if __name__ == "__main__":
    main()
