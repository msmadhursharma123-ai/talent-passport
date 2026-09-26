import { useLayoutEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import type { ManualVideoConfig } from "./manualVideoTypes";
import { getPortalManualVideoUrl } from "./manualVideoRegistry";
import "./manualVideo.css";

interface Props {
  video: ManualVideoConfig;
}

export default function ManualVideoCard({ video }: Props) {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const playbackGenerationRef = useRef(0);

  useLayoutEffect(() => {
    // The Manual keeps this component mounted while the user changes topics.
    // Reset the existing player whenever the selected topic/video changes so
    // the previous video's source can never remain attached to the new topic.
    playbackGenerationRef.current += 1;
    const generation = playbackGenerationRef.current;
    const element = videoRef.current;

    if (element) {
      element.pause();
      element.removeAttribute("src");
      element.load();
    }

    setPlaying(false);
    setStarted(false);
    setFailed(false);

    return () => {
      if (playbackGenerationRef.current !== generation) return;
      const current = videoRef.current;
      if (current) {
        current.pause();
        current.removeAttribute("src");
        current.load();
      }
    };
  }, [video.storagePath]);

  function startVideo() {
    const element = videoRef.current;

    if (!element) {
      setFailed(true);
      return;
    }

    if (started) {
      const generation = playbackGenerationRef.current;
      void element
        .play()
        .then(() => {
          if (playbackGenerationRef.current === generation) setPlaying(true);
        })
        .catch(() => {
          if (playbackGenerationRef.current === generation) setPlaying(false);
        });
      return;
    }

    const url = getPortalManualVideoUrl(video.storagePath);
    if (!url) {
      setFailed(true);
      return;
    }

    // The src is intentionally assigned only from this user gesture.
    // No poster/thumbnail request is made before this point.
    element.src = url;
    element.load();
    setFailed(false);
    setStarted(true);

    // Keep using this same mounted <video> element. The component does not
    // replace it when `started` changes, so the src assigned above is retained.
    const generation = playbackGenerationRef.current;
    void element
      .play()
      .then(() => {
        if (playbackGenerationRef.current === generation) setPlaying(true);
      })
      .catch(() => {
        if (playbackGenerationRef.current === generation) setPlaying(false);
      });
  }

  function closePlayer() {
    playbackGenerationRef.current += 1;
    const element = videoRef.current;
    if (element) {
      element.pause();
      element.removeAttribute("src");
      element.load();
    }
    setPlaying(false);
    setStarted(false);
    setFailed(false);
  }

  function togglePlayback() {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      const generation = playbackGenerationRef.current;
      void element
        .play()
        .then(() => {
          if (playbackGenerationRef.current === generation) setPlaying(true);
        })
        .catch(() => {
          if (playbackGenerationRef.current === generation) setPlaying(false);
        });
    } else {
      element.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="tp-manual-video-card" aria-label={`${video.title} video guide`}>
      <button
        type="button"
        className="tp-manual-video-launch"
        onClick={startVideo}
        aria-label={`Play ${video.title}`}
        hidden={started}
      >
        <span className="tp-manual-video-play">
          <Play size={17} fill="currentColor" aria-hidden="true" />
        </span>
        <span className="tp-manual-video-copy">
          <strong>See how it works</strong>
          <small>{video.description}</small>
        </span>
        <span className="tp-manual-video-duration">VIDEO</span>
      </button>

      <div
        className="tp-manual-video-player"
        hidden={!started}
        aria-hidden={!started}
      >
        <video
          ref={videoRef}
          preload="none"
          playsInline
          muted={muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setFailed(true)}
          aria-label={video.title}
        />
        <div className="tp-manual-video-controls">
          <button type="button" onClick={togglePlayback} aria-label={playing ? "Pause video" : "Play video"}>
            {playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          </button>
          <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Unmute video" : "Mute video"}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button type="button" onClick={closePlayer} aria-label="Close video">
            <X size={15} />
          </button>
        </div>
        {failed ? (
          <div className="tp-manual-video-error" role="status">
            <strong>Video is not available yet.</strong>
            <span>Upload the matching MP4 to the configured Manual Videos folder.</span>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                startVideo();
              }}
            >
              <RotateCcw size={13} /> Retry
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
