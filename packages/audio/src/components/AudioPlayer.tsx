/**
 * Audio Player Component
 *
 * Comprehensive audio player with advanced controls, playlist support,
 * and integration with the AudioWaveformVisualizer. Built on top of
 * the existing audio processing infrastructure.
 *
 * Features:
 * - Advanced playback controls
 * - Playlist management
 * - Audio visualization
 * - Keyboard shortcuts
 * - Customizable interface
 */

import {
  Component,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  Show,
  For,
} from "solid-js";
import { AudioWaveformVisualizer } from "./AudioWaveformVisualizer";
import "./AudioPlayer.css";
import { Slider } from "reynard-components";

export interface AudioPlayerProps {
  /** Audio files or URLs */
  audioFiles: (File | string)[];
  /** Initial track index */
  initialTrack?: number;
  /** Player configuration */
  playerConfig?: {
    /** Auto-play next track */
    autoPlayNext?: boolean;
    /** Loop playlist */
    loopPlaylist?: boolean;
    /** Loop current track */
    loopTrack?: boolean;
    /** Shuffle mode */
    shuffle?: boolean;
    /** Initial volume (0-1) */
    volume?: number;
    /** Show waveform visualizer */
    showWaveform?: boolean;
    /** Show playlist */
    showPlaylist?: boolean;
  };
  /** Custom CSS class */
  className?: string;
  /** Callback when track changes */
  onTrackChange?: (trackIndex: number, track: File | string) => void;
  /** Callback when playback state changes */
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  /** Callback when playlist ends */
  onPlaylistEnd?: () => void;
}

export interface TrackInfo {
  /** Track index */
  index: number;
  /** Track name */
  name: string;
  /** Track duration */
  duration: number;
  /** Track file or URL */
  file: File | string;
  /** Whether track is currently playing */
  isPlaying: boolean;
  /** Whether track is currently selected */
  isSelected: boolean;
}

export const AudioPlayer: Component<AudioPlayerProps> = (props) => {
  const [currentTrackIndex, setCurrentTrackIndex] = createSignal(
    props.initialTrack || 0,
  );
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [volume, setVolume] = createSignal(props.playerConfig?.volume || 0.8);
  const [isShuffled, setIsShuffled] = createSignal(
    props.playerConfig?.shuffle || false,
  );
  const [playlist, setPlaylist] = createSignal<(File | string)[]>([]);
  const [shuffledIndices, setShuffledIndices] = createSignal<number[]>([]);

  let audioRef: HTMLAudioElement | undefined;

  // Default configuration
  const playerConfig = {
    autoPlayNext: true,
    loopPlaylist: false,
    loopTrack: false,
    shuffle: false,
    volume: 0.8,
    showWaveform: true,
    showPlaylist: true,
    ...props.playerConfig,
  };

  // Initialize playlist
  onMount(() => {
    setPlaylist(props.audioFiles);
    if (playerConfig.shuffle) {
      shufflePlaylist();
    }
    setupKeyboardShortcuts();
  });

  onCleanup(() => {
    removeKeyboardShortcuts();
  });

  // Update playlist when props change
  createEffect(() => {
    setPlaylist(props.audioFiles);
    if (playerConfig.shuffle) {
      shufflePlaylist();
    }
  });

  // Setup keyboard shortcuts
  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          togglePlayback();
          break;
        case "ArrowLeft":
          event.preventDefault();
          seekBackward();
          break;
        case "ArrowRight":
          event.preventDefault();
          seekForward();
          break;
        case "ArrowUp":
          event.preventDefault();
          increaseVolume();
          break;
        case "ArrowDown":
          event.preventDefault();
          decreaseVolume();
          break;
        case "KeyN":
          event.preventDefault();
          nextTrack();
          break;
        case "KeyP":
          event.preventDefault();
          previousTrack();
          break;
        case "KeyS":
          event.preventDefault();
          toggleShuffle();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  };

  const removeKeyboardShortcuts = () => {
    // Cleanup handled by the returned function from setupKeyboardShortcuts
  };

  // Shuffle playlist
  const shufflePlaylist = () => {
    const indices = Array.from({ length: playlist().length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
  };

  // Get current track
  const getCurrentTrack = (): File | string | null => {
    const playlistArray = playlist();
    if (playlistArray.length === 0) return null;

    if (isShuffled() && shuffledIndices().length > 0) {
      const shuffledIndex = shuffledIndices()[currentTrackIndex()];
      return playlistArray[shuffledIndex] || null;
    }

    return playlistArray[currentTrackIndex()] || null;
  };

  // Get track info
  const getTrackInfo = (index: number): TrackInfo => {
    const track = playlist()[index];
    const isCurrentTrack = index === currentTrackIndex();

    return {
      index,
      name:
        typeof track === "string"
          ? track.split("/").pop() || "Unknown"
          : track.name,
      duration: duration(),
      file: track,
      isPlaying: isCurrentTrack && isPlaying(),
      isSelected: isCurrentTrack,
    };
  };

  // Playback controls
  const togglePlayback = () => {
    if (!audioRef) return;

    if (isPlaying()) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
  };

  const nextTrack = () => {
    const nextIndex = currentTrackIndex() + 1;
    if (nextIndex < playlist().length) {
      setCurrentTrackIndex(nextIndex);
    } else if (playerConfig.loopPlaylist) {
      setCurrentTrackIndex(0);
    } else {
      props.onPlaylistEnd?.();
    }
  };

  const previousTrack = () => {
    const prevIndex = currentTrackIndex() - 1;
    if (prevIndex >= 0) {
      setCurrentTrackIndex(prevIndex);
    } else if (playerConfig.loopPlaylist) {
      setCurrentTrackIndex(playlist().length - 1);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef) {
      audioRef.currentTime = time;
    }
  };

  const seekForward = () => {
    if (audioRef) {
      audioRef.currentTime = Math.min(
        audioRef.currentTime + 10,
        audioRef.duration,
      );
    }
  };

  const seekBackward = () => {
    if (audioRef) {
      audioRef.currentTime = Math.max(audioRef.currentTime - 10, 0);
    }
  };

  const setVolumeLevel = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef) {
      audioRef.volume = clampedVolume;
    }
  };

  const increaseVolume = () => {
    setVolumeLevel(volume() + 0.1);
  };

  const decreaseVolume = () => {
    setVolumeLevel(volume() - 0.1);
  };

  const toggleShuffle = () => {
    const newShuffleState = !isShuffled();
    setIsShuffled(newShuffleState);
    if (newShuffleState) {
      shufflePlaylist();
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
  };

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef) {
      setDuration(audioRef.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef) {
      setCurrentTime(audioRef.currentTime);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    props.onPlaybackStateChange?.(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    props.onPlaybackStateChange?.(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    if (playerConfig.loopTrack) {
      audioRef?.play();
    } else if (playerConfig.autoPlayNext) {
      nextTrack();
    }
  };

  const handleError = () => {
    setIsPlaying(false);
    console.error("Audio playback error");
  };

  // Track change effect
  createEffect(() => {
    const currentTrack = getCurrentTrack();
    if (currentTrack) {
      props.onTrackChange?.(currentTrackIndex(), currentTrack);
    }
  });

  const currentTrack = getCurrentTrack();

  return (
    <div class={`audio-player ${props.className || ""}`}>
      {/* Audio element (hidden) */}
      <audio
        ref={audioRef}
        src={
          currentTrack
            ? typeof currentTrack === "string"
              ? currentTrack
              : URL.createObjectURL(currentTrack)
            : ""
        }
        loop={playerConfig.loopTrack}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />

      <div class="player-content">
        {/* Waveform Visualizer */}
        <Show when={playerConfig.showWaveform && currentTrack}>
          <div class="waveform-section">
            <AudioWaveformVisualizer
              audioSrc={currentTrack!}
              playbackConfig={{
                autoPlay: false,
                loop: playerConfig.loopTrack,
                volume: volume(),
                showControls: false,
              }}
              interactionConfig={{
                enableSeeking: true,
                showProgress: true,
              }}
              onTimeUpdate={(time, dur) => {
                setCurrentTime(time);
                setDuration(dur);
              }}
            />
          </div>
        </Show>

        {/* Main Controls */}
        <div class="main-controls">
          <div class="track-info">
            <div class="track-name">
              {currentTrack
                ? typeof currentTrack === "string"
                  ? currentTrack.split("/").pop()
                  : currentTrack.name
                : "No track selected"}
            </div>
            <div class="track-position">
              {Math.floor(currentTime() / 60)}:
              {(currentTime() % 60).toFixed(0).padStart(2, "0")} /{" "}
              {Math.floor(duration() / 60)}:
              {(duration() % 60).toFixed(0).padStart(2, "0")}
            </div>
          </div>

          <div class="control-buttons">
            <button
              type="button"
              class="control-button shuffle-button"
              classList={{ active: isShuffled() }}
              onClick={toggleShuffle}
              title="Shuffle (S)"
            >
              🔀
            </button>

            <button
              type="button"
              class="control-button"
              onClick={previousTrack}
              disabled={currentTrackIndex() === 0 && !playerConfig.loopPlaylist}
              title="Previous (P)"
            >
              ⏮️
            </button>

            <button
              type="button"
              class="control-button play-button"
              onClick={togglePlayback}
              disabled={!currentTrack}
              title="Play/Pause (Space)"
            >
              <Show when={isPlaying()} fallback="▶️">
                ⏸️
              </Show>
            </button>

            <button
              type="button"
              class="control-button"
              onClick={nextTrack}
              disabled={
                currentTrackIndex() === playlist().length - 1 &&
                !playerConfig.loopPlaylist
              }
              title="Next (N)"
            >
              ⏭️
            </button>

            <div class="volume-control">
              <span class="volume-icon">🔊</span>
              <Slider
    min={0}
    max={1}
    step={0.1}
  /> setVolumeLevel(parseFloat(e.target.value))}
                class="volume-slider"
                title="Volume (↑/↓)"
              />
            </div>
          </div>
        </div>

        {/* Playlist */}
        <Show when={playerConfig.showPlaylist && playlist().length > 1}>
          <div class="playlist-section">
            <h4 class="playlist-title">Playlist</h4>
            <div class="playlist">
              <For each={playlist()}>
                {(_, index) => {
                  const trackInfo = getTrackInfo(index());
                  return (
                    <div
                      class="playlist-item"
                      classList={{
                        "playlist-item--selected": trackInfo.isSelected,
                        "playlist-item--playing": trackInfo.isPlaying,
                      }}
                      onClick={() => selectTrack(index())}
                    >
                      <div class="playlist-item-info">
                        <span class="playlist-item-name">{trackInfo.name}</span>
                        <span class="playlist-item-duration">
                          {Math.floor(trackInfo.duration / 60)}:
                          {(trackInfo.duration % 60)
                            .toFixed(0)
                            .padStart(2, "0")}
                        </span>
                      </div>
                      <Show when={trackInfo.isPlaying}>
                        <div class="playlist-item-indicator">♪</div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};
