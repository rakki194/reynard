/**
 * Media Icons
 * Icons for audio, video, images, and media controls
 */

// Import Fluent UI media icons
import PlayIcon from "@fluentui/svg-icons/icons/play_24_regular.svg?raw";
import PauseIcon from "@fluentui/svg-icons/icons/pause_24_regular.svg?raw";
import StopIcon from "@fluentui/svg-icons/icons/stop_24_regular.svg?raw";
import SkipBackwardRegular from "@fluentui/svg-icons/icons/skip_back_10_24_regular.svg?raw";
import SkipForwardRegular from "@fluentui/svg-icons/icons/skip_forward_10_24_regular.svg?raw";
import SpeakerIcon from "@fluentui/svg-icons/icons/speaker_2_24_regular.svg?raw";
import SpeakerMuteRegular from "@fluentui/svg-icons/icons/speaker_mute_24_regular.svg?raw";
import Speaker1Regular from "@fluentui/svg-icons/icons/speaker_1_24_regular.svg?raw";
import Speaker2Regular from "@fluentui/svg-icons/icons/speaker_2_24_regular.svg?raw";
import MusicNote1Regular from "@fluentui/svg-icons/icons/music_note_1_24_regular.svg?raw";
import MusicNote2Regular from "@fluentui/svg-icons/icons/music_note_2_24_regular.svg?raw";
import MusicNote1Filled from "@fluentui/svg-icons/icons/music_note_1_24_filled.svg?raw";
import MusicNote2Filled from "@fluentui/svg-icons/icons/music_note_2_24_filled.svg?raw";
import MusicNoteOff1Regular from "@fluentui/svg-icons/icons/music_note_off_1_24_regular.svg?raw";
import MusicNoteOff2Regular from "@fluentui/svg-icons/icons/music_note_off_2_24_regular.svg?raw";
import MusicNoteOff1Filled from "@fluentui/svg-icons/icons/music_note_off_1_24_filled.svg?raw";
import MusicNoteOff2Filled from "@fluentui/svg-icons/icons/music_note_off_2_24_filled.svg?raw";
import VideoRegular from "@fluentui/svg-icons/icons/video_24_regular.svg?raw";
import CameraRegular from "@fluentui/svg-icons/icons/camera_24_regular.svg?raw";
import ImageAddRegular from "@fluentui/svg-icons/icons/image_add_24_regular.svg?raw";
import DimensionsIcon from "@fluentui/svg-icons/icons/image_24_regular.svg?raw";
import SoundWaveCircleRegular from "@fluentui/svg-icons/icons/sound_wave_circle_24_regular.svg?raw";

export const mediaIcons = {
  play: {
    svg: PlayIcon,
    metadata: {
      name: "play",
      tags: ["media", "control", "playback"],
      description: "Play icon",
      keywords: ["play", "start", "media", "triangle"],
    },
  },
  pause: {
    svg: PauseIcon,
    metadata: {
      name: "pause",
      tags: ["media", "control", "playback"],
      description: "Pause icon",
      keywords: ["pause", "stop", "media", "control"],
    },
  },
  stop: {
    svg: StopIcon,
    metadata: {
      name: "stop",
      tags: ["media", "control", "playback"],
      description: "Stop icon",
      keywords: ["stop", "end", "media", "square"],
    },
  },
  "skip-backward": {
    svg: SkipBackwardRegular,
    metadata: {
      name: "skip-backward",
      tags: ["media", "control", "navigation"],
      description: "Skip backward icon",
      keywords: ["skip", "backward", "rewind", "media"],
    },
  },
  "skip-forward": {
    svg: SkipForwardRegular,
    metadata: {
      name: "skip-forward",
      tags: ["media", "control", "navigation"],
      description: "Skip forward icon",
      keywords: ["skip", "forward", "fast", "media"],
    },
  },
  speaker: {
    svg: SpeakerIcon,
    metadata: {
      name: "speaker",
      tags: ["media", "audio", "sound"],
      description: "Speaker icon",
      keywords: ["speaker", "audio", "sound", "volume"],
    },
  },
  "speaker-mute": {
    svg: SpeakerMuteRegular,
    metadata: {
      name: "speaker-mute",
      tags: ["media", "audio", "mute"],
      description: "Speaker mute icon",
      keywords: ["speaker", "mute", "silent", "audio"],
    },
  },
  "speaker-1": {
    svg: Speaker1Regular,
    metadata: {
      name: "speaker-1",
      tags: ["media", "audio", "sound"],
      description: "Speaker 1 icon",
      keywords: ["speaker", "audio", "sound", "volume"],
    },
  },
  "speaker-2": {
    svg: Speaker2Regular,
    metadata: {
      name: "speaker-2",
      tags: ["media", "audio", "sound"],
      description: "Speaker 2 icon",
      keywords: ["speaker", "audio", "sound", "volume"],
    },
  },
  volume: {
    svg: Speaker2Regular,
    metadata: {
      name: "volume",
      tags: ["media", "audio", "sound"],
      description: "Volume icon",
      keywords: ["volume", "audio", "sound", "speaker"],
    },
  },
  "music-note-1": {
    svg: MusicNote1Regular,
    metadata: {
      name: "music-note-1",
      tags: ["media", "music", "audio"],
      description: "Music note 1 icon",
      keywords: ["music", "note", "audio", "sound"],
    },
  },
  "music-note-2": {
    svg: MusicNote2Regular,
    metadata: {
      name: "music-note-2",
      tags: ["media", "music", "audio"],
      description: "Music note 2 icon",
      keywords: ["music", "note", "audio", "sound"],
    },
  },
  "music-note-1-filled": {
    svg: MusicNote1Filled,
    metadata: {
      name: "music-note-1-filled",
      tags: ["media", "music", "audio"],
      description: "Music note 1 filled icon",
      keywords: ["music", "note", "audio", "filled"],
    },
  },
  "music-note-2-filled": {
    svg: MusicNote2Filled,
    metadata: {
      name: "music-note-2-filled",
      tags: ["media", "music", "audio"],
      description: "Music note 2 filled icon",
      keywords: ["music", "note", "audio", "filled"],
    },
  },
  "music-note-off-1": {
    svg: MusicNoteOff1Regular,
    metadata: {
      name: "music-note-off-1",
      tags: ["media", "music", "audio"],
      description: "Music note off 1 icon",
      keywords: ["music", "note", "off", "mute"],
    },
  },
  "music-note-off-2": {
    svg: MusicNoteOff2Regular,
    metadata: {
      name: "music-note-off-2",
      tags: ["media", "music", "audio"],
      description: "Music note off 2 icon",
      keywords: ["music", "note", "off", "mute"],
    },
  },
  "music-note-off-1-filled": {
    svg: MusicNoteOff1Filled,
    metadata: {
      name: "music-note-off-1-filled",
      tags: ["media", "music", "audio"],
      description: "Music note off 1 filled icon",
      keywords: ["music", "note", "off", "mute", "filled"],
    },
  },
  "music-note-off-2-filled": {
    svg: MusicNoteOff2Filled,
    metadata: {
      name: "music-note-off-2-filled",
      tags: ["media", "music", "audio"],
      description: "Music note off 2 filled icon",
      keywords: ["music", "note", "off", "mute", "filled"],
    },
  },
  music: {
    svg: MusicNote1Regular,
    metadata: {
      name: "music",
      tags: ["media", "music", "audio"],
      description: "Music icon",
      keywords: ["music", "note", "audio", "sound"],
    },
  },
  video: {
    svg: VideoRegular,
    metadata: {
      name: "video",
      tags: ["media", "video", "playback"],
      description: "Video icon",
      keywords: ["video", "play", "media", "camera"],
    },
  },
  camera: {
    svg: CameraRegular,
    metadata: {
      name: "camera",
      tags: ["media", "camera", "photo"],
      description: "Camera icon",
      keywords: ["camera", "photo", "picture", "capture"],
    },
  },
  "image-add": {
    svg: ImageAddRegular,
    metadata: {
      name: "image-add",
      tags: ["media", "image", "add"],
      description: "Image add icon",
      keywords: ["image", "add", "photo", "picture"],
    },
  },
  dimensions: {
    svg: DimensionsIcon,
    metadata: {
      name: "dimensions",
      tags: ["media", "image", "size"],
      description: "Image dimensions icon",
      keywords: ["dimensions", "image", "size", "picture"],
    },
  },
  "sound-wave": {
    svg: SoundWaveCircleRegular,
    metadata: {
      name: "sound-wave",
      tags: ["media", "audio", "wave"],
      description: "Sound wave circle icon",
      keywords: ["sound", "wave", "audio", "circle"],
    },
  },
} as const;
