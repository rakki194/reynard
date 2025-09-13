# Audio Ingestion

This subsystem provides metadata extraction, waveform visualization, format conversion, transcription, and
a minimal text‑to‑speech fallback. It uses the system `ffmpeg` and `ffprobe` for consistent performance and
behavior. All endpoints under `/api/audio` require authentication via the standard app guard and
respond with JSON. Errors are reported with appropriate HTTP status codes and an error message.

## API Endpoints

The `POST /api/audio/ingest` endpoint moves or copies a generated audio file into the configured library folder and
records provenance. The request accepts a JSON body with `source_path` as an absolute or
resolvable path to a file, `move` to prefer move over copy, and
optional `backend`, `voice`, `summary_id`, `source_url`, and
`extra` for arbitrary metadata. The server computes a SHA‑256 content hash over the file and
uses it to generate a stable filename of the form `tts_<hash16><ext>` inside the `tts_audio_dir` resolved from
application configuration. A sidecar JSON is written next to the ingested audio. If
the sidecar already exists, its contents are merged with the new fields,
preserving existing keys unless explicitly overwritten by non‑null values. The response includes `success`,
the resolved `audio_path`, the `metadata_path` to the sidecar, and a boolean `deduplicated` that indicates when
the destination already contained the same content.

The `POST /api/audio/import-to-folder` endpoint copies an ingested or
external audio file into a dataset directory under `ROOT_DIR`. The request body includes `source_path`,
a `target_dir` interpreted relative to `ROOT_DIR` using the app’s secure path resolver, and an optional `new_name`. If
a name collision occurs, an index suffix is appended to the stem (for example, `_1`,
`_2`) until a free filename is found. If
a sidecar JSON resides next to the source, it is also copied. The response returns `success` and
the final `target_path`.

The `POST /api/audio/analyze` endpoint provides four analysis modes controlled by
the `analysis_type` field. The `metadata` mode invokes `ffprobe` and
returns a dictionary with `duration` in seconds, `sample_rate`, `channels`, `bitrate`, and
`codec`. The `waveform` mode returns `waveform_data` as an opaque byte array suitable for client‑side rendering,
along with `duration`. The `statistics` mode combines the same metadata with the file size and
echoes selected fields for convenience. The `transcription` mode returns `transcription` text paired with
`duration`. Unsupported modes result in a 400 error.

The `POST /api/audio/generate-waveform` endpoint renders a waveform PNG to
a specified `output_path` using `ffmpeg`’s `showwavespic` filter. The request carries `audio_path`, `output_path`, and
presentation parameters `width`, `height`, `color`, and
`background_color`. The server ensures the output directory exists before rendering and
returns information about the generated file upon success. The current implementation uses `showwavespic` and
may use fixed defaults if certain parameters are not applied by the backend version.

The `POST /api/audio/convert` endpoint converts an input audio file into a `target_format` such as `mp3`, `wav`,
`flac`, `aac`, or `ogg`. The request accepts `source_path`, `output_path`, and
`target_format`, with optional `quality`, `sample_rate`, and `channels`. The server creates parent directories if
necessary and uses `ffmpeg` to perform the conversion. Depending on the format,
some optional parameters may be ignored by
the underlying command. A successful response confirms the target format and output location.

The `POST /api/audio/extract-segment` endpoint extracts a portion of an audio file between `start_time` and
`end_time` (in seconds) to `output_path`. The implementation uses `ffmpeg` with `-ss`, `-t`, and
`-c copy` to avoid re‑encoding and typically provides a very fast copy. Optional `fade_in` and
`fade_out` parameters are accepted by the API and
may be surfaced by the processor in future revisions;
the current backend uses stream copy semantics without applying fades. The response includes `start_time`, `end_time`,
and the derived `duration`.

The `GET /api/audio/metadata/{path}` endpoint returns the parsed metadata, duration in seconds,
a human‑readable `mm:ss` duration, and
file size in bytes. The `GET /api/audio/duration/{path}` endpoint returns only the duration and
a formatted string. The `{path}` parameter must reference a readable file on disk.

The `POST /api/audio/transcribe` endpoint accepts `audio_path` with optional `language` and `model` hints and
returns `transcription`, `language`, and
`model` alongside `success`. The precise transcription backend is abstracted behind the processor and
may vary by deployment.

The `POST /api/audio/text-to-speech` endpoint provides a minimal fallback that
writes a short mono WAV file containing silence. It is intended for environments with
the full TTS service disabled and should not be used for production synthesis. The request includes `text`,
`output_path`, `voice`, `language`, and `speed`. The response confirms the created file and parameters.

The `GET /api/audio/supported-formats` endpoint enumerates input formats derived from the configured set and
common output formats and codecs. The `GET /api/audio/available-voices` endpoint returns a small list intended for
the fallback path.

## Processor Details

Metadata extraction uses `ffprobe` with quiet logging, JSON output, and both `-show_format` and
`-show_streams`. The resulting JSON is parsed to derive `duration` from the format section and
to obtain `sample_rate`, `channels`, and
`codec` from the first audio stream. The `bitrate` is read from the `bit_rate` field when present. When
`ffprobe` fails, an empty dictionary is returned and an error is logged.

Waveform rendering uses `ffmpeg` and
the `showwavespic` filter. The server issues a command equivalent to a single‑frame render with a specified size and
color palette and overwrites the output if present. For thumbnail and
preview generation used elsewhere in the system, a synchronous call is performed and
a minimal placeholder PNG is returned on failure to preserve UI continuity.

Format conversion invokes `ffmpeg` with input and output paths and relies on the selected container and
codec defaults. The server ensures the output directory exists prior to running the command. Duration is derived from
the metadata routine and returned where relevant.

Segment extraction uses `ffmpeg` with `-ss` and `-t` arguments and
`-c copy` to minimize processing overhead. This approach avoids re‑encoding, is generally lossless, and
completes quickly even for large files. If
more advanced operations such as fades are required, they can be layered with `af` filters in a future version.

## Operational Notes and Best Practices

Prefer recording and storing lossless or high‑quality audio where feasible and
avoid unnecessary resampling. A sample rate of at least 16 kHz with 16‑bit depth is considered a baseline for
clear speech; however, retaining the source rate is generally preferable to
resampling. Limit aggressive preprocessing such as noise reduction and
automatic gain control, as these can impair downstream transcription quality. For multi‑speaker scenarios,
separate channels improve diarization and accuracy. Ensure proper access controls on audio libraries and
sidecar metadata, and capture provenance in the sidecar by including backend, voice, and
source references to support reproducibility. For large‑scale ingestion, monitor throughput and error rates and
validate that inputs match expected schemas before conversion.

## Frontend

The Audio UI follows the shared grid and modal patterns. It displays metadata and
waveform previews with controls for conversion and
segment extraction. Responses from the API are shaped for immediate consumption by the frontend components,
with duration values provided both as numbers and formatted strings where appropriate.

- Files:
  - `app/api/audio.py`
  - `app/data_access/audio_processor.py`
  - `src/components/Audio/*`
