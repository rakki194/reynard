/**
 * File Operations Tools Configuration
 *
 * Defines file and directory operation tools for the NLWeb service.
 */
export const fileTools = [
    {
        name: "list_directory",
        description: "List files and directories in a path",
        category: "file-operations",
        tags: ["file", "directory", "list", "browse"],
        path: "/api/files/list",
        method: "POST",
        parameters: [
            {
                name: "path",
                type: "string",
                description: "Directory to list",
                required: true,
            },
            {
                name: "limit",
                type: "number",
                description: "Maximum number of entries to return",
                required: false,
                default: 100,
                constraints: {
                    min: 1,
                    max: 1000,
                },
            },
        ],
        examples: ["list files", "show directory contents", "what files are here"],
        enabled: true,
        priority: 70,
        timeout: 3000,
    },
];
