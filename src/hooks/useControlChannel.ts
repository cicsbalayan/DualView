import { useState, useEffect, useCallback, useRef } from "react";

interface SlideControl {
  action: "next" | "prev" | "goto" | "fullscreen" | "sync";
  slide?: number;
  totalSlides?: number;
}

interface UseControlChannelOptions {
  onSync?: (slide: number, totalSlides: number) => void;
  onNext?: (slide: number) => void;
  onPrev?: (slide: number) => void;
  onGoToSlide?: (slide: number) => void;
  onFullscreen?: () => void;
}

interface UseControlChannelResult {
  currentSlide: number;
  totalSlides: number;
  sendControl: (action: SlideControl["action"], slide?: number) => void;
}

export function useControlChannel(
  options: UseControlChannelOptions = {}
): UseControlChannelResult {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(10);
  
  // Use ref to persist BroadcastChannel across renders
  const channelRef = useRef<BroadcastChannel | null>(null);
  if (!channelRef.current) {
    channelRef.current = new BroadcastChannel("dualview-control");
  }

  // Store options in ref to avoid re-creating listener on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Handle incoming messages from presenter
  useEffect(() => {
    const channel = channelRef.current;
    
    if (!channel) return;
    
    const handleMessage = (event: MessageEvent<SlideControl>) => {
      const control = event.data;
      const { onSync, onNext, onPrev, onGoToSlide, onFullscreen } = optionsRef.current;

      if (control.action === "sync") {
        // Sync slide info from presenter
        if (control.slide) setCurrentSlide(control.slide);
        if (control.totalSlides) setTotalSlides(control.totalSlides);
        onSync?.(control.slide ?? 1, control.totalSlides ?? 10);
      } else if (control.action === "next") {
        const targetSlide = control.slide ?? currentSlide + 1;
        setCurrentSlide(targetSlide);
        onNext?.(targetSlide);
      } else if (control.action === "prev") {
        const targetSlide = control.slide ?? currentSlide - 1;
        setCurrentSlide(targetSlide);
        onPrev?.(targetSlide);
      } else if (control.action === "goto") {
        if (control.slide) {
          setCurrentSlide(control.slide);
          onGoToSlide?.(control.slide);
        }
      } else if (control.action === "fullscreen") {
        onFullscreen?.();
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      if (channel) {
        channel.removeEventListener("message", handleMessage);
      }
    };
  }, []); // Empty deps - handler uses refs for current values

  // Send control action to presenter
  const sendControl = useCallback((action: SlideControl["action"], slide?: number) => {
    channelRef.current?.postMessage({ action, slide });
    localStorage.setItem("dualview-control", JSON.stringify({ action, slide }));
    setTimeout(() => {
      localStorage.removeItem("dualview-control");
    }, 100);
  }, []);

  return {
    currentSlide,
    totalSlides,
    sendControl,
  };
}
