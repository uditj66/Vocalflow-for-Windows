"use client";

import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";

// --- SVG Icons Components ---
const MicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.micIcon}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" x2="12" y1="19" y2="22"></line>
  </svg>
);

const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={styles.micIcon}
  >
    <rect
      width="18"
      height="18"
      x="3"
      y="3"
      rx="4"
      ry="4"
      fill="currentColor"
    />
  </svg>
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
  </svg>
);

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5-1.5 1.2 1.2 0 1 1-1.5 1.5C18.6 21 21 19.3 21 16v-2.5"></path>
    <path d="M5 7a2 2 0 0 0 0 4h12"></path>
    <circle cx="16" cy="11" r="1"></circle>
  </svg>
);

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={spinning ? styles.spinning : ""}
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
  </svg>
);

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="M5 3v4"></path>
    <path d="M19 17v4"></path>
    <path d="M3 5h4"></path>
    <path d="M17 19h4"></path>
  </svg>
);

// --- Main Page Component ---
export default function Home() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string>("");
  const [balance, setBalance] = useState<string>("");

  const [mediaRecorderMimeType, setMediaRecorderMimeType] = useState("");

  useEffect(() => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    for (const c of candidates) {
      if (
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported(c)
      ) {
        setMediaRecorderMimeType(c);
        return;
      }
    }
  }, []);

  async function refreshBalance() {
    setBalanceLoading(true);
    setBalanceError("");
    try {
      const res = await fetch("/api/balance");
      const data = (await res.json()) as
        | { balance?: string; error?: string; details?: string }
        | undefined;

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to fetch balance");
      }

      setBalance(data?.balance ?? "");
    } catch (e) {
      setBalance("");
      setBalanceError(
        e instanceof Error ? e.message : "Failed to fetch balance",
      );
    } finally {
      setBalanceLoading(false);
    }
  }

  useEffect(() => {
    void refreshBalance();
    return () => {
      try {
        recorderRef.current?.stop();
      } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }

  async function startRecording() {
    setError("");
    setStatus("");
    // We intentionally don't clear old transcript here immediately
    // to keep it visible until the new one processes—unless user prefers a fresh state.

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("This browser doesn't support audio recording.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setError("This browser doesn't support MediaRecorder.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(
        stream,
        mediaRecorderMimeType ? { mimeType: mediaRecorderMimeType } : undefined,
      );
      recorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstart = () => {
        setIsRecording(true);
        setStatus("Recording...");
        setTranscript(""); // clear it now
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        setStatus("Processing audio...");

        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderMimeType || "audio/webm",
        });

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        try {
          setStatus("Transcribing with Deepgram...");
          const form = new FormData();
          const ext = blob.type.includes("ogg") ? "ogg" : "webm";
          form.set(
            "audio",
            new File([blob], `recording.${ext}`, { type: blob.type }),
          );

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: form,
          });
          const data = (await res.json()) as {
            transcript?: string;
            error?: string;
          };
          if (!res.ok) throw new Error(data.error ?? "Transcription failed");

          setTranscript(data.transcript ?? "");
          setStatus(""); // Clear status when done
          void refreshBalance();
        } catch (e) {
          setStatus("");
          setError(e instanceof Error ? e.message : "Transcription failed");
        } finally {
          streamRef.current?.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start recording");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function stopRecording() {
    setError("");
    setStatus("Finalizing...");
    try {
      recorderRef.current?.stop();
    } catch (e) {
      setStatus("");
      setError(e instanceof Error ? e.message : "Failed to stop recorder");
    }
  }

  async function copyTranscript() {
    setError("");
    try {
      await navigator.clipboard.writeText(transcript);
      setStatus("Copied to clipboard!");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setError("Copy failed (clipboard permission).");
    }
  }

  const isProcessing =
    status === "Processing audio..." ||
    status === "Transcribing with Deepgram...";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoArea}>
            <div className={styles.iconBox}>
              <SparklesIcon />
            </div>
            <div>
              <h1 className={styles.title}>SonicScribe</h1>
              <p className={styles.subtitle}>AI-Powered Voice Notes</p>
            </div>
          </div>

          <div className={styles.walletBadge}>
            <div className={styles.walletInfo}>
              <WalletIcon />
              <span className={styles.walletLabel}>Balance</span>
            </div>
            {balanceError ? (
              <span
                className={styles.errorText}
                style={{ padding: 0, border: "none", background: "none" }}
              >
                Error
              </span>
            ) : balanceLoading && !balance ? (
              <span className={styles.walletAmount}>...</span>
            ) : (
              <span className={styles.walletAmount}>{balance || "—"}</span>
            )}
            <button
              className={styles.refreshBtn}
              onClick={refreshBalance}
              disabled={balanceLoading}
              title="Refresh Balance"
            >
              <RefreshIcon spinning={balanceLoading} />
            </button>
          </div>
        </header>

        <main className={styles.mainGrid}>
          {/* LEFT COLUMN: Record Controls */}
          <section className={styles.recordSection}>
            <div className={styles.micButtonArea}>
              {isRecording && <div className={styles.ripple}></div>}
              <button
                className={`${styles.micButton} ${isRecording ? styles.recording : ""}`}
                onClick={toggleRecording}
                disabled={isProcessing}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </button>
            </div>

            <div className={styles.recordStatus}>
              {error ? (
                <div className={styles.errorText}>{error}</div>
              ) : status ? (
                <div
                  className={`${styles.statusText} ${
                    isRecording ? styles.statusRecording : ""
                  }`}
                >
                  {status}
                </div>
              ) : (
                <div className={styles.statusText}>
                  {mediaRecorderMimeType
                    ? "Tap to continuously record"
                    : "Browser audio not fully supported"}
                </div>
              )}
            </div>

            {audioUrl && (
              <audio
                className={styles.audioPlayer}
                controls
                src={audioUrl}
                title="Latest Recording"
              />
            )}
          </section>

          {/* RIGHT COLUMN: Transcript & Notes */}
          <section className={styles.transcriptSection}>
            <div className={styles.transcriptHeader}>
              <h2 className={styles.transcriptTitle}>
                <span style={{ fontSize: "1.2rem" }}>📝</span> Transcript Result
              </h2>
              <button
                className={styles.copyBtn}
                onClick={copyTranscript}
                disabled={!transcript}
              >
                <CopyIcon /> Copy
              </button>
            </div>

            <div className={styles.textAreaContainer}>
              <textarea
                className={styles.textarea}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Start speaking and your perfectly transcribed text will appear here almost instantly..."
                readOnly={isRecording}
              />

              <div
                className={`${styles.processingOverlay} ${isProcessing ? styles.active : ""}`}
              >
                <div className={styles.loader}></div>
                <div className={styles.loaderText}>
                  {status || "Working..."}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
