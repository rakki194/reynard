# Gallery-dl Demo - Reynard Framework

A comprehensive demonstration of the gallery-dl integration with the Reynard framework, showcasing download management, progress tracking, and history viewing capabilities.

## Features

- **URL Validation**: Validate gallery URLs before downloading
- **Download Management**: Start, monitor, and cancel gallery downloads
- **Progress Tracking**: Real-time progress updates with detailed statistics
- **Download History**: View completed downloads with metadata
- **Multi-platform Support**: Works with Instagram, Twitter, Reddit, Pixiv, and more
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+ and pnpm
- Reynard backend running on `http://localhost:8000`
- Gallery-dl service configured and running

## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

3. Open your browser to `http://localhost:3002`

## Usage

### Starting a Download

1. Enter a gallery URL in the input field
2. Click "Validate" to check if the URL is supported
3. Click "Download" to start the download process

### Monitoring Progress

- View active downloads in the "Active Downloads" section
- See real-time progress, file counts, and download speed
- Cancel downloads if needed

### Viewing History

- Completed downloads appear in the "Download History" section
- View download statistics and metadata
- Retry failed downloads

## Supported Platforms

The demo supports downloading from various platforms including:

- Instagram posts and profiles
- Twitter/X posts and threads
- Reddit posts and galleries
- Pixiv artworks and user galleries
- Many other platforms supported by gallery-dl

## Example URLs

Try these example URLs to test the functionality:

- Instagram: `https://www.instagram.com/p/example/`
- Twitter: `https://twitter.com/user/status/123456789`
- Reddit: `https://www.reddit.com/r/example/comments/abc123/`
- Pixiv: `https://www.pixiv.net/en/artworks/12345678`

## Architecture

The demo application is built using:

- **SolidJS**: Reactive UI framework
- **Reynard Components**: UI component library
- **Reynard Themes**: Theming system
- **Reynard Gallery-dl**: Gallery-dl integration package
- **Reynard Core**: Core functionality and notifications

## Components

- `DownloadManager`: Handles URL input and validation
- `ProgressTracker`: Displays active download progress
- `HistoryViewer`: Shows completed download history

## API Integration

The demo connects to the Reynard backend API endpoints:

- `POST /api/gallerydl/download` - Start a download
- `POST /api/gallerydl/validate` - Validate a URL
- `GET /api/gallerydl/progress/{id}` - Get download progress
- `GET /api/gallerydl/downloads/active` - Get active downloads
- `GET /api/gallerydl/downloads/history` - Get download history

## Development

### Building for Production

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Ensure the Reynard backend is running on `http://localhost:8000`
2. Check that the gallery-dl service is properly configured
3. Verify network connectivity

### Download Failures

Common causes of download failures:

1. Invalid or unsupported URLs
2. Network connectivity issues
3. Rate limiting from the target platform
4. Authentication requirements for private content

## Contributing

This demo is part of the Reynard framework. To contribute:

1. Follow the Reynard coding standards
2. Use SolidJS for UI components
3. Maintain consistency with the Reynard ecosystem
4. Add proper TypeScript types
5. Include comprehensive error handling

## License

Part of the Reynard framework. See the main project license for details.
