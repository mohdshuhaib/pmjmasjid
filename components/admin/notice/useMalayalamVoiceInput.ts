"use client";

import { useEffect, useRef, useState } from "react";

export function useMalayalamVoiceInput(onTranscript: (text: string) => void) {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ml-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal && result[0]?.transcript) {
          finalText += result[0].transcript;
        }
      }
      if (finalText.trim()) onTranscript(finalText.trim());
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onspeechend = () => {
      try {
        recognition.stop();
      } catch {}
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {}
    };
  }, [onTranscript]);

  const start = async () => {
    try {
      const active = document.activeElement as HTMLElement | null;
      active?.blur();

      const mediaDevices = navigator.mediaDevices;
      if (mediaDevices?.getUserMedia) {
        const stream = await mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }

      recognitionRef.current?.abort?.();
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch {
          setIsListening(false);
        }
      }, 120);
    } catch {
      setIsListening(false);
    }
  };

  const stop = () => {
    try {
      recognitionRef.current?.stop?.();
      recognitionRef.current?.abort?.();
    } catch {}
    setIsListening(false);
  };

  return { supported, isListening, start, stop };
}