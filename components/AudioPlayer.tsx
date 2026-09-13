"use client";

import { useState } from "react";

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
}

export default function AudioPlayer({ surahNumber, ayahNumber }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const surahStr = String(surahNumber).padStart(3, "0");
  const ayahStr = String(ayahNumber).padStart(3, "0");
  const audioUrl = `https://everyayah.com/data/Husary_128kbps/${surahStr}${ayahStr}.mp3`;

  const togglePlay = () => {
    if (playing && audio) {
      audio.pause();
      setPlaying(false);
    } else {
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => setPlaying(false);
      newAudio.play();
      setAudio(newAudio);
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={togglePlay}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "10px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#c9a227",
        border: "0.5px solid rgba(201,162,39,0.4)",
        background: "transparent",
        padding: "6px 16px",
        borderRadius: "2px",
        cursor: "pointer",
        transition: "background 150ms",
      }}
    >
      {playing ? "⏸ PAUSE" : "▶ LISTEN"}
    </button>
  );
}
