# TTS Integration

Text-to-speech endpoints allow synthesis, summary reading, backend/voice discovery, and
RVC conversion (when enabled). A minimal fallback TTS also exists under the audio API when TTS is disabled.

## Configuration

Enable via `AppConfig`:

- `tts_enabled: bool`
- `tts_default_backend: "kokoro" | "coqui" | "xtts"`
- `tts_audio_dir: string`
- `tts_kokoro_mode: "performance" | "normal" | "powersave"`
- Optional: `tts_rvc_enabled: bool`

## API Endpoints

### Text-to-Speech Synthesis

- `POST /api/tts/speak`
  - Body: `{ text, backend?, voice?, speed?, lang?, to_ogg? }`
  - Returns provider result (path/bytes/metadata, depending on service adapter).

- `POST /api/tts/speak-summary`
  - Body: `{ summary_id, backend?, voice? }`
  - Loads a summary from the summarize service and synthesizes its abstract.

- `GET /api/tts/voices`
  - Returns `{ backends, voices }` as reported by the service adapter.

- `POST /api/tts/set-backend`
  - Body: `{ backend? }` to switch runtime backend when supported by the adapter.

- `POST /api/tts/set-kokoro-mode`
  - Body: `{ mode? }` to adjust Kokoro runtime mode when supported.

### RVC Voice Conversion

RVC (Retrieval-based Voice Conversion) allows converting audio to different voices using trained models.

#### Voice Conversion

- `POST /api/tts/rvc-convert`
  - Body: `{ source_path, voice, output_name?, f0_up_key?, f0_method?, index_rate?, filter_radius?, resample_sr?, rms_mix_rate?, protect? }` (requires `tts_rvc_enabled`)
  - Converts source audio to a target voice using an RVC adapter.
  - Parameters:
    - `source_path`: Path to input audio file
    - `voice`: Name of the RVC model to use
    - `output_name`: Optional custom output filename
    - `f0_up_key`: Pitch shift in semitones (default: 0)
    - `f0_method`: F0 extraction method: "harvest", "pm", "dio", "crepe" (default: "harvest")
    - `index_rate`: Index rate for voice conversion (default: 0.66)
    - `filter_radius`: Filter radius for processing (default: 3)
    - `resample_sr`: Resample sample rate (default: 0, no resampling)
    - `rms_mix_rate`: RMS mixing rate (default: 1.0)
    - `protect`: Voice protection rate (default: 0.33)

#### Model Management

- `GET /api/tts/rvc-voices`
  - Returns `{ rvc_voices }` list of available RVC models.

- `GET /api/tts/rvc-model-info/{model_name}`
  - Returns detailed information about a specific RVC model.

- `POST /api/tts/rvc-model-management`
  - Body: `{ action, model_name? }`
  - Actions: "preload", "unload", "unload_all"
  - Manages RVC model loading/unloading for memory optimization.

#### RVC Model Training

- `POST /api/tts/rvc-prepare-training-data`
  - Body: `{ audio_dir, speaker_name, language?, min_duration?, max_duration?, target_sample_rate? }`
  - Prepares and preprocesses audio data for RVC model training.
  - Parameters:
    - `audio_dir`: Directory containing training audio files
    - `speaker_name`: Name for the speaker/voice
    - `language`: Language code (default: "en")
    - `min_duration`: Minimum audio duration in seconds (default: 1.0)
    - `max_duration`: Maximum audio duration in seconds (default: 30.0)
    - `target_sample_rate`: Target sample rate (default: 44100)

- `POST /api/tts/rvc-start-training`
  - Body: `{ model_name, training_data_dir, sample_rate?, hop_length?, win_length?, n_fft?, mel_channels?, mel_fmin?, mel_fmax?, batch_size?, learning_rate?, epochs?, save_interval?, log_interval?, fp16?, cache_in_gpu?, use_amp? }`
  - Starts RVC model training with specified configuration.
  - Returns training job ID for monitoring.

- `GET /api/tts/rvc-training-status/{training_id}`
  - Returns detailed status of a training job including logs and progress.

- `GET /api/tts/rvc-training-jobs`
  - Returns list of all training jobs and their status.

- `POST /api/tts/rvc-stop-training/{training_id}`
  - Stops a running training job.

- `DELETE /api/tts/rvc-cleanup-training/{training_id}`
  - Cleans up training artifacts and removes the training job.

## RVC Training Workflow

### 1. Data Preparation

1. Collect high-quality audio recordings of the target voice
2. Organize audio files in a directory
3. Call `/api/tts/rvc-prepare-training-data` to preprocess the data
4. The system will:
   - Validate audio files (duration, format)
   - Convert to target sample rate (44.1kHz)
   - Generate training metadata
   - Create organized training dataset

### 2. Model Training

1. Configure training parameters based on your requirements
2. Call `/api/tts/rvc-start-training` with the prepared data directory
3. Monitor training progress via `/api/tts/rvc-training-status/{training_id}`
4. Training will create:
   - Model weights (`model.pth`)
   - Index file for fast inference
   - Configuration metadata

### 3. Model Usage

1. Once training completes, the model becomes available for conversion
2. Use `/api/tts/rvc-convert` to convert audio to the trained voice
3. Adjust conversion parameters for optimal results

## RVC Model Requirements

### Training Data Requirements

- **Audio Quality**: High-quality recordings with minimal background noise
- **Duration**: 1-30 seconds per file (configurable)
- **Format**: WAV, MP3, FLAC, M4A, OGG (automatically converted)
- **Sample Rate**: Automatically converted to 44.1kHz
- **Channels**: Automatically converted to mono
- **Quantity**: Minimum 10-20 minutes of speech for good results

### Hardware Requirements

- **Training**: GPU recommended (CUDA-compatible)
- **Inference**: CPU or GPU (GPU recommended for real-time)
- **Memory**: 4GB+ RAM for training, 2GB+ for inference
- **Storage**: 1-5GB per model depending on complexity

## Error Handling

All endpoints require an active user. If `tts_enabled` is false or
the service is unavailable, endpoints return 404/500 accordingly.

### Common RVC Errors

- **"RVC is disabled"**: Enable `tts_rvc_enabled` in configuration
- **"RVC library not installed"**: Install RVC dependencies: `pip install rvc-python`
- **"Model not found"**: Ensure RVC model exists in `models/rvc/{model_name}/`
- **"Training data not found"**: Verify audio directory path and permissions
- **"Insufficient training data"**: Ensure minimum audio duration requirements

## Performance Optimization

### Runtime Model Management

- Use `/api/tts/rvc-model-management` to preload frequently used models
- Unload unused models to free GPU memory
- Monitor memory usage during training and inference

### Training Optimization

- Use appropriate batch sizes for your hardware
- Enable FP16 training for faster training on compatible GPUs
- Adjust learning rate based on training stability
- Use appropriate epoch counts (typically 1000-2000)

### Inference Optimization

- Use appropriate F0 extraction methods:
  - "harvest": Good quality, slower
  - "pm": Fast, lower quality
  - "dio": Balanced speed/quality
  - "crepe": High quality, requires additional dependencies
- Adjust index rate for quality vs. speed trade-off
- Use voice protection to maintain original voice characteristics

## Files

- `app/api/tts.py` - API endpoints
- `app/api/audio.py` - Fallback audio API
- `app/integration/tts/rvc_converter.py` - RVC voice conversion backend
- `app/integration/tts/rvc_trainer.py` - RVC training system
- `app/services/integration/tts_service.py` - TTS service with RVC integration
- `app/tests/integration/test_rvc_integration.py` - RVC integration tests
