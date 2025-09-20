/**
 * Video Player Component for Reynard Caption System
 *
 * Modal video player with custom controls and metadata display.
 */
import { createSignal } from "solid-js";
// Video controls composable
const useVideoControls = (videoRef) => {
    const [isPlaying, setIsPlaying] = createSignal(false);
    const [currentTime, setCurrentTime] = createSignal(0);
    const [duration, setDuration] = createSignal(0);
    const handlePlayPause = () => {
        const video = videoRef();
        if (!video)
            return;
        if (isPlaying()) {
            video.pause();
        }
        else {
            video.play();
        }
        setIsPlaying(!isPlaying());
    };
    const handleTimeUpdate = () => {
        const video = videoRef();
        if (video) {
            setCurrentTime(video.currentTime);
        }
    };
    const handleLoadedMetadata = () => {
        const video = videoRef();
        if (video) {
            setDuration(video.duration);
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };
    return {
        isPlaying,
        currentTime,
        duration,
        handlePlayPause,
        handleTimeUpdate,
        handleLoadedMetadata,
        formatTime,
        setIsPlaying,
    };
};
// Render function for video player content
const renderVideoPlayerContent = (props, videoRef, isPlaying, currentTime, duration, handlePlayPause, handleTimeUpdate, handleLoadedMetadata, formatTime, setIsPlaying, handleClose) => {
    return (<div class="video-player-modal">
      <div class="video-player-content">
        <button class="close-button" onClick={handleClose}>
          ×
        </button>

        <div class="video-container">
          <video ref={videoRef} src={props.file.url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} controls class="video-element"/>
        </div>

        <div class="video-controls">
          <button onClick={handlePlayPause} class="play-pause-button">
            {isPlaying() ? "⏸" : "▶"}
          </button>

          <div class="time-display">
            {formatTime(currentTime())} / {formatTime(duration())}
          </div>

          <div class="video-info">
            <h3>{props.file.name}</h3>
            <div class="video-details">
              {props.file.metadata.width}×{props.file.metadata.height} •{props.file.metadata.fps} FPS •
              {props.file.size ? (props.file.size / (1024 * 1024)).toFixed(2) + " MB" : "Unknown size"}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
export const VideoPlayer = (props) => {
    let videoRef;
    const { isPlaying, currentTime, duration, handlePlayPause, handleTimeUpdate, handleLoadedMetadata, formatTime, setIsPlaying, } = useVideoControls(() => videoRef);
    const handleClose = () => {
        props.onClose();
    };
    return renderVideoPlayerContent(props, () => videoRef, isPlaying, currentTime, duration, handlePlayPause, handleTimeUpdate, handleLoadedMetadata, formatTime, setIsPlaying, handleClose);
};
