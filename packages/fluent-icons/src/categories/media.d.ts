/**
 * Media Icons
 * Icons for audio, video, images, and media controls
 */
export declare const mediaIcons: {
    readonly play: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "play";
            readonly tags: readonly ["media", "control", "playback"];
            readonly description: "Play icon";
            readonly caption: "A triangular play button icon for starting media playback";
            readonly keywords: readonly ["play", "start", "media", "triangle"];
        };
    };
    readonly pause: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "pause";
            readonly tags: readonly ["media", "control", "playback"];
            readonly description: "Pause icon";
            readonly caption: "A pause button icon with two vertical bars for pausing media playback";
            readonly keywords: readonly ["pause", "stop", "media", "control"];
        };
    };
    readonly stop: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "stop";
            readonly tags: readonly ["media", "control", "playback"];
            readonly description: "Stop icon";
            readonly caption: "A square stop button icon for stopping media playback completely";
            readonly keywords: readonly ["stop", "end", "media", "square"];
        };
    };
    readonly "skip-backward": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "skip-backward";
            readonly tags: readonly ["media", "control", "navigation"];
            readonly description: "Skip backward icon";
            readonly caption: "A skip backward icon with double arrows for rewinding media content";
            readonly keywords: readonly ["skip", "backward", "rewind", "media"];
        };
    };
    readonly "skip-forward": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "skip-forward";
            readonly tags: readonly ["media", "control", "navigation"];
            readonly description: "Skip forward icon";
            readonly caption: "A skip forward icon with double arrows for fast-forwarding media content";
            readonly keywords: readonly ["skip", "forward", "fast", "media"];
        };
    };
    readonly speaker: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "speaker";
            readonly tags: readonly ["media", "audio", "sound"];
            readonly description: "Speaker icon";
            readonly caption: "A speaker icon with sound waves for audio output and volume control";
            readonly keywords: readonly ["speaker", "audio", "sound", "volume"];
        };
    };
    readonly "speaker-mute": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "speaker-mute";
            readonly tags: readonly ["media", "audio", "mute"];
            readonly description: "Speaker mute icon";
            readonly caption: "A speaker icon with X mark for muting audio or silencing sound";
            readonly keywords: readonly ["speaker", "mute", "silent", "audio"];
        };
    };
    readonly "speaker-1": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "speaker-1";
            readonly tags: readonly ["media", "audio", "sound"];
            readonly description: "Speaker 1 icon";
            readonly caption: "A speaker icon with single sound wave for low volume audio output";
            readonly keywords: readonly ["speaker", "audio", "sound", "volume"];
        };
    };
    readonly "speaker-2": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "speaker-2";
            readonly tags: readonly ["media", "audio", "sound"];
            readonly description: "Speaker 2 icon";
            readonly caption: "A speaker icon with double sound waves for high volume audio output";
            readonly keywords: readonly ["speaker", "audio", "sound", "volume"];
        };
    };
    readonly volume: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "volume";
            readonly tags: readonly ["media", "audio", "sound"];
            readonly description: "Volume icon";
            readonly caption: "A volume control icon with speaker and sound waves for audio level adjustment";
            readonly keywords: readonly ["volume", "audio", "sound", "speaker"];
        };
    };
    readonly "music-note-1": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-1";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note 1 icon";
            readonly caption: "A single music note icon representing audio or musical content";
            readonly keywords: readonly ["music", "note", "audio", "sound"];
        };
    };
    readonly "music-note-2": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-2";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note 2 icon";
            readonly caption: "A double music note icon representing musical content or audio files";
            readonly keywords: readonly ["music", "note", "audio", "sound"];
        };
    };
    readonly "music-note-1-filled": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-1-filled";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note 1 filled icon";
            readonly caption: "A filled single music note icon for active or selected audio content";
            readonly keywords: readonly ["music", "note", "audio", "filled"];
        };
    };
    readonly "music-note-2-filled": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-2-filled";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note 2 filled icon";
            readonly caption: "A filled double music note icon for active or selected musical content";
            readonly keywords: readonly ["music", "note", "audio", "filled"];
        };
    };
    readonly "music-note-off-1": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-off-1";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note off 1 icon";
            readonly caption: "A music note with slash icon indicating muted or disabled audio";
            readonly keywords: readonly ["music", "note", "off", "mute"];
        };
    };
    readonly "music-note-off-2": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-off-2";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note off 2 icon";
            readonly caption: "A double music note with slash icon indicating muted or disabled audio";
            readonly keywords: readonly ["music", "note", "off", "mute"];
        };
    };
    readonly "music-note-off-1-filled": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-off-1-filled";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note off 1 filled icon";
            readonly caption: "A filled music note with slash icon for disabled or muted audio content";
            readonly keywords: readonly ["music", "note", "off", "mute", "filled"];
        };
    };
    readonly "music-note-off-2-filled": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music-note-off-2-filled";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music note off 2 filled icon";
            readonly caption: "A filled double music note with slash icon for disabled or muted audio content";
            readonly keywords: readonly ["music", "note", "off", "mute", "filled"];
        };
    };
    readonly music: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "music";
            readonly tags: readonly ["media", "music", "audio"];
            readonly description: "Music icon";
            readonly caption: "A music note icon representing musical content, audio files, or sound";
            readonly keywords: readonly ["music", "note", "audio", "sound"];
        };
    };
    readonly video: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "video";
            readonly tags: readonly ["media", "video", "playback"];
            readonly description: "Video icon";
            readonly caption: "A video camera icon representing video content, recording, or playback";
            readonly keywords: readonly ["video", "play", "media", "camera"];
        };
    };
    readonly camera: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "camera";
            readonly tags: readonly ["media", "camera", "photo"];
            readonly description: "Camera icon";
            readonly caption: "A camera icon for taking photos, capturing images, or video recording";
            readonly keywords: readonly ["camera", "photo", "picture", "capture"];
        };
    };
    readonly "image-add": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "image-add";
            readonly tags: readonly ["media", "image", "add"];
            readonly description: "Image add icon";
            readonly caption: "An image icon with plus sign for adding or uploading new images";
            readonly keywords: readonly ["image", "add", "photo", "picture"];
        };
    };
    readonly dimensions: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "dimensions";
            readonly tags: readonly ["media", "image", "size"];
            readonly description: "Image dimensions icon";
            readonly caption: "An image icon with dimension indicators for showing image size or resolution";
            readonly keywords: readonly ["dimensions", "image", "size", "picture"];
        };
    };
    readonly "sound-wave": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "sound-wave";
            readonly tags: readonly ["media", "audio", "wave"];
            readonly description: "Sound wave circle icon";
            readonly caption: "A circular sound wave icon representing audio visualization or sound levels";
            readonly keywords: readonly ["sound", "wave", "audio", "circle"];
        };
    };
};
