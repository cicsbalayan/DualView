import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, quickPageTransition } from "@/lib/animation-variants";
import { useRoomData, useKeyboardNav, useFullscreen, useControlChannel } from "@/hooks";
import {
  SlideHeader,
  SlideDisplay,
  SlideNavArrows,
  SlideProgress,
  slideData,
} from "@/components/fragments";

export function MainPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { roomData, isLoading } = useRoomData();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  const [currentSlide, setCurrentSlide] = useState(1);
  const [direction, setDirection] = useState(0);
  
  const totalSlides = slideData.length;
  const currentSlideData = slideData[currentSlide - 1] || slideData[0];

  const handleNext = useCallback((slide?: number) => {
    const targetSlide = slide ?? currentSlide;
    if (targetSlide < totalSlides) {
      setDirection(1);
      setCurrentSlide(targetSlide);
    }
  }, [currentSlide, totalSlides]);

  const handlePrev = useCallback((slide?: number) => {
    const targetSlide = slide ?? currentSlide;
    if (targetSlide > 1) {
      setDirection(-1);
      setCurrentSlide(targetSlide);
    }
  }, [currentSlide]);

  const handleGoToSlide = useCallback((slide: number) => {
    if (slide >= 1 && slide <= totalSlides) {
      setDirection(slide > currentSlide ? 1 : -1);
      setCurrentSlide(slide);
    }
  }, [currentSlide, totalSlides]);

  const handleFullscreen = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Listen for control commands from controller via BroadcastChannel
  useControlChannel({
    onNext: handleNext,
    onPrev: handlePrev,
    onGoToSlide: handleGoToSlide,
    onFullscreen: handleFullscreen,
  });

  const handleLocalNext = useCallback(() => {
    if (currentSlide < totalSlides) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides]);

  const handleLocalPrev = useCallback(() => {
    if (currentSlide > 1) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  useKeyboardNav({
    currentSlide,
    totalSlides,
    isFullscreen,
    onNext: handleLocalNext,
    onPrev: handleLocalPrev,
    onToggleFullscreen: toggleFullscreen,
  });

  if (isLoading || !roomData) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        <p>Loading...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`min-h-screen flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-black" : "bg-white"}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={quickPageTransition}
    >
      <SlideHeader
        roomCode={roomCode || ""}
        roomData={roomData}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <SlideDisplay
        fileUrl={roomData.fileUrl}
        currentSlide={currentSlide}
        currentSlideData={currentSlideData}
        direction={direction}
      />

      {!isFullscreen && (
        <>
          <SlideNavArrows
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            isFullscreen={isFullscreen}
            onNext={handleNext}
            onPrev={handlePrev}
          />

          <SlideProgress currentSlide={currentSlide} totalSlides={totalSlides} />
        </>
      )}

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="absolute bottom-4 right-4 flex items-center gap-2 text-gray-400 text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3 }}
          >
            <Check className="w-3 h-3" />
            <span>Fullscreen</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MainPage;
