import { ArrowLeft, Monitor, Maximize, Minimize } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { headerVariants } from "@/lib/animation-variants";
import type { RoomData } from "@/hooks/useRoomData";

interface SlideHeaderProps {
  roomCode: string;
  roomData: RoomData;
  currentSlide: number;
  totalSlides: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function SlideHeader({
  roomCode,
  roomData,
  currentSlide,
  totalSlides,
  isFullscreen,
  onToggleFullscreen,
}: SlideHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className={`flex items-center justify-between px-4 py-2 border-b ${
        isFullscreen 
          ? "bg-black/80 backdrop-blur-sm border-gray-800" 
          : "bg-white/80 backdrop-blur-sm border-gray-200"
      }`}
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className={isFullscreen ? "text-gray-300 hover:bg-gray-800" : "text-gray-900 hover:bg-gray-100"}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </motion.div>
        <div className={`flex items-center gap-2 ${isFullscreen ? "text-gray-300" : "text-gray-900"}`}>
          <Monitor className="w-4 h-4" />
          <span className="font-mono text-sm">{roomCode}</span>
          {roomData.isHost && (
            <motion.span
              className="text-xs bg-primary/20 px-2 py-0.5 rounded"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              Host
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Slide Counter */}
        <motion.div
          className={`text-sm font-mono mr-4 ${isFullscreen ? "text-gray-300" : "text-gray-900"}`}
          key={currentSlide}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {currentSlide} / {totalSlides}
        </motion.div>

        {/* Fullscreen Toggle */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            className={isFullscreen ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700" : "bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
