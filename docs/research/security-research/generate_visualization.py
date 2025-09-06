
import matplotlib.pyplot as get_matplotlib_pyplot
plt = get_matplotlib_pyplot()
import argparse

def generate_vulnerability_chart(data, title="Vulnerability Distribution by Severity", filename="vulnerability_chart.png"):
    """
    Generates a bar chart showing vulnerability distribution by severity.
    :param data: A dictionary where keys are severity levels (e.g., "High", "Medium") and values are counts.
    :param title: Title of the chart.
    :param filename: Name of the file to save the chart.
    """
    severities = list(data.keys())
    counts = list(data.values())

    plt.figure(figsize=(10, 6))
    plt.bar(severities, counts, color=['red', 'orange', 'yellow', 'green', 'blue'])
    plt.xlabel("Severity")
    plt.ylabel("Number of Vulnerabilities")
    plt.title(title)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.savefig(filename)
    print(f"Chart saved to {filename}")

def main():
    parser = argparse.ArgumentParser(description="Generate data visualizations for security assessments.")
    parser.add_argument("--data", type=str, required=True, 
                        help="JSON string of data, e.g., '{\"Critical\": 2, \"High\": 5, \"Medium\": 10, \"Low\": 3, \"Informational\": 7}'")
    parser.add_argument("--title", default="Vulnerability Distribution by Severity", help="Title of the chart.")
    parser.add_argument("--output", default="vulnerability_chart.png", help="Output filename for the chart.")

    args = parser.parse_args()

    try:
        import json
        data = json.loads(args.data)
        generate_vulnerability_chart(data, args.title, args.output)
    except json.JSONDecodeError:
        print("Error: Invalid JSON data provided for --data.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main() 