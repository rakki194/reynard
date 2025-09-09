# Reynard File Test App

A comprehensive test application for the Reynard file processing and thumbnail generation system.

## Features

- **Multi-format File Upload**: Supports images, videos, audio, text, code, and documents
- **Real-time Thumbnail Generation**: Generates thumbnails for various file types
- **Audio Waveform Visualization**: Uses Web Audio API to create real waveform thumbnails from audio data
- **Drag & Drop Interface**: Easy file upload with drag and drop support
- **Processing Metrics**: Shows processing time and file information
- **Error Handling**: Graceful error handling with user-friendly messages

## Supported File Types

### Images

- JPEG, PNG, GIF, WebP, SVG, BMP

### Videos

- MP4, AVI, MOV, WMV, FLV, WebM, MKV

### Audio

- MP3, WAV, FLAC, AAC, OGG, M4A

### Text & Code

- TXT, MD, JSON, XML, CSV
- JS, TS, JSX, TSX, CSS, HTML, Python, Java, C++, C

### Documents

- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:3003`
   - Upload files to test thumbnail generation
   - Try the audio waveform test with your audio files

## Testing Audio Waveforms

The app includes a special audio test section that:

1. Uses the Web Audio API to analyze real audio data
2. Generates waveform visualizations based on actual audio content
3. Shows processing time and file information
4. Provides fallback visualization if audio analysis fails

### Test with Your Audio File

To test with your `nolan_north_cut.wav` file:

1. Start the development server
2. Go to the "Audio Waveform Test" section
3. Select your audio file
4. Click "Generate Waveform Thumbnail"
5. The thumbnail will show a real waveform based on the audio data

## Development

- **Framework**: SolidJS
- **Build Tool**: Vite
- **Styling**: CSS with modern layout (Grid, Flexbox)
- **File Processing**: Reynard File Processing package

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

The app is structured with:

- **App.tsx**: Main application component with state management
- **FileUploader**: Drag & drop file upload component
- **ThumbnailViewer**: Displays generated thumbnails with file info
- **AudioTest**: Specialized audio waveform testing component

## Port

The development server runs on port **3003** to avoid conflicts with other Reynard apps.
