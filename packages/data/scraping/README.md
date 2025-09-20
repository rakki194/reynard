# reynard-scraping

> **Comprehensive Scraping and Content Extraction System for Reynard** 🦊

Advanced web scraping framework with intelligent content extraction, quality assessment, and
seamless integration with gallery-dl for media downloads.

## ✨ Features

### 🎯 **Core Functionality**

- **Multi-Source Scraping**: Support for 10+ specialized scrapers (HackerNews, GitHub, StackOverflow, Twitter, Wikipedia, etc.)
- **Intelligent Content Extraction**: Advanced HTML parsing with BeautifulSoup and custom extractors
- **Quality Assessment**: Comprehensive content quality scoring with multiple factors
- **Content Processing Pipeline**: Automated cleaning, categorization, and deduplication
- **Real-time Progress Tracking**: WebSocket-based progress updates and job monitoring
- **Gallery-dl Integration**: Seamless media download capabilities

### 🎨 **Frontend Components**

- **ScrapingJobManager**: Complete job lifecycle management with real-time updates
- **ProgressTracker**: Visual progress indicators with detailed statistics
- **ContentQualityDisplay**: Quality assessment visualization with factor breakdown
- **ScrapingStatistics**: Comprehensive analytics and performance metrics
- **ConfigurationPanel**: Advanced scraper configuration and settings management

### 🔧 **Backend Services**

- **ScrapingService**: Main orchestration service with job management
- **ScrapingRouter**: Intelligent routing to appropriate scrapers
- **ContentQualityScorer**: Multi-factor quality assessment engine
- **ProcessingPipelineManager**: Automated content processing workflows
- **GalleryDownloadService**: Integrated media download management

## 📦 Installation

```bash
pnpm install reynard-scraping
```

## 🚀 Quick Start

### Basic Scraping

```typescript
import { useScrapingJobs } from "reynard-scraping";

function ScrapingComponent() {
  const { createJob, jobs, isLoading } = useScrapingJobs();

  const handleScrape = async () => {
    const job = await createJob({
      url: "https://example.com/article",
      type: "general"
    });
    console.log("Created job:", job.id);
  };

  return (
    <div>
      <button onClick={handleScrape} disabled={isLoading}>
        Start Scraping
      </button>
      <div>
        {jobs.map(job => (
          <div key={job.id}>
            {job.url} - {job.status}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Gallery Downloads

```typescript
import { useGalleryDownloads } from "reynard-scraping";

function GalleryComponent() {
  const { startDownload, downloads } = useGalleryDownloads();

  const handleDownload = async () => {
    const download = await startDownload("https://example.com/gallery", {
      outputDirectory: "./downloads",
      quality: "best"
    });
    console.log("Started download:", download.id);
  };

  return (
    <div>
      <button onClick={handleDownload}>
        Download Gallery
      </button>
      <div>
        {downloads.map(download => (
          <div key={download.id}>
            {download.url} - {download.status} ({download.progress.percentage}%)
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Content Quality Assessment

```typescript
import { useContentQuality } from "reynard-scraping";

function QualityComponent() {
  const { assessQuality, getQualityLevel } = useContentQuality();

  const handleAssess = async () => {
    const quality = await assessQuality("Your content here...");
    console.log("Quality score:", quality.score);
    console.log("Quality level:", quality.overall);
  };

  return (
    <button onClick={handleAssess}>
      Assess Content Quality
    </button>
  );
}
```

## 📚 API Reference

### Composables

#### `useScrapingJobs(options?)`

Manages scraping job state and operations.

**Options:**

- `autoRefresh?: boolean` - Auto-refresh jobs (default: true)
- `refreshInterval?: number` - Refresh interval in ms (default: 5000)
- `onJobUpdate?: (job) => void` - Job update callback
- `onJobComplete?: (job) => void` - Job completion callback
- `onJobError?: (job, error) => void` - Job error callback

**Returns:**

- `jobs: ScrapingJob[]` - All jobs
- `activeJobs: ScrapingJob[]` - Active jobs
- `completedJobs: ScrapingJob[]` - Completed jobs
- `failedJobs: ScrapingJob[]` - Failed jobs
- `isLoading: boolean` - Loading state
- `error: string | null` - Error state
- `createJob(request): Promise<ScrapingJob>` - Create new job
- `cancelJob(jobId): Promise<void>` - Cancel job
- `retryJob(jobId): Promise<void>` - Retry job
- `deleteJob(jobId): Promise<void>` - Delete job

#### `useGalleryDownloads(options?)`

Manages gallery-dl download operations.

**Options:**

- `autoRefresh?: boolean` - Auto-refresh downloads (default: true)
- `refreshInterval?: number` - Refresh interval in ms (default: 2000)
- `onDownloadComplete?: (job) => void` - Download completion callback
- `onDownloadError?: (job, error) => void` - Download error callback

**Returns:**

- `downloads: GalleryDownloadJob[]` - All downloads
- `activeDownloads: GalleryDownloadJob[]` - Active downloads
- `completedDownloads: GalleryDownloadJob[]` - Completed downloads
- `failedDownloads: GalleryDownloadJob[]` - Failed downloads
- `startDownload(url, config?): Promise<GalleryDownloadJob>` - Start download
- `cancelDownload(jobId): Promise<void>` - Cancel download
- `pauseDownload(jobId): Promise<void>` - Pause download
- `resumeDownload(jobId): Promise<void>` - Resume download

#### `useContentQuality(options?)`

Manages content quality assessment.

**Options:**

- `onQualityUpdate?: (quality) => void` - Quality update callback

**Returns:**

- `assessQuality(content, metadata?): Promise<ContentQuality>` - Assess quality
- `getQualityLevel(score): QualityLevel` - Get quality level
- `getQualityFactors(): QualityFactor[]` - Get quality factors
- `isQualityAcceptable(quality, threshold?): boolean` - Check if acceptable

### Types

#### `ScrapingJob`

```typescript
interface ScrapingJob {
  id: string;
  url: string;
  type: ScrapingType;
  status: ScrapingStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
  results?: ScrapingResult[];
}
```

#### `ScrapingResult`

```typescript
interface ScrapingResult {
  id: string;
  jobId: string;
  url: string;
  title?: string;
  content: string;
  metadata: Record<string, any>;
  extractedAt: Date;
  quality: ContentQuality;
  category?: ContentCategory;
}
```

#### `ContentQuality`

```typescript
interface ContentQuality {
  score: number; // 0-100
  factors: QualityFactor[];
  overall: QualityLevel;
}
```

## 🔧 Configuration

### Scraper Configuration

```typescript
interface ScraperConfig {
  name: string;
  type: ScrapingType;
  enabled: boolean;
  rateLimit: RateLimitConfig;
  extraction: ExtractionConfig;
  quality: QualityConfig;
  metadata: Record<string, any>;
}
```

### Gallery Configuration

```typescript
interface GalleryConfig {
  outputDirectory: string;
  filename: string;
  extractorOptions: Record<string, any>;
  postprocessors: string[];
  quality: string;
  format: string;
}
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build package
pnpm build

# Type checking
pnpm typecheck
```

## 📊 Supported Scrapers

| Scraper       | Type            | Status | Description                         |
| ------------- | --------------- | ------ | ----------------------------------- |
| General       | `general`       | ✅     | General-purpose web scraper         |
| HackerNews    | `hackernews`    | 🚧     | HackerNews articles and comments    |
| GitHub        | `github`        | 🚧     | GitHub repositories and issues      |
| StackOverflow | `stackoverflow` | 🚧     | StackOverflow questions and answers |
| Twitter       | `twitter`       | 🚧     | Twitter/X posts and threads         |
| Wikipedia     | `wikipedia`     | 🚧     | Wikipedia articles                  |
| WikiFur       | `wikifur`       | 🚧     | WikiFur content                     |
| E621 Wiki     | `e621_wiki`     | 🚧     | E621 wiki entries                   |
| Ars Technica  | `arstechnica`   | 🚧     | Ars Technica articles               |
| TechCrunch    | `techcrunch`    | 🚧     | TechCrunch articles                 |
| Wired         | `wired`         | 🚧     | Wired articles                      |

## 🎯 Quality Factors

The content quality assessment evaluates content on multiple dimensions:

- **Content Length** (20%): Length and depth of content
- **Readability** (25%): Clarity and readability of text
- **Relevance** (20%): Relevance to search query or topic
- **Structure** (15%): Well-structured content with proper formatting
- **Completeness** (20%): Completeness of information

## 🔗 Integration

### With Reynard Core

```typescript
import { useScrapingJobs } from "reynard-scraping";
import { useNotifications } from "reynard-core";

function IntegratedComponent() {
  const { createJob } = useScrapingJobs({
    onJobComplete: job => {
      showNotification(`Job completed: ${job.url}`);
    },
  });

  // ... rest of component
}
```

### With Gallery-dl

```typescript
import { useGalleryDownloads } from "reynard-scraping";

function MediaComponent() {
  const { startDownload } = useGalleryDownloads();

  const handleMediaDownload = async (url: string) => {
    await startDownload(url, {
      outputDirectory: "./media",
      quality: "best",
      format: "original",
    });
  };

  // ... rest of component
}
```

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/reynard.git
cd reynard/packages/scraping

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build

# Run in development mode
pnpm dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE.md) file for details.

---

**Built with ❤️ using SolidJS and modern web standards** 🦊

_The Reynard Scraping package provides comprehensive content extraction and
processing capabilities with the strategic precision of a fox and the thoroughness of an otter._
