import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  pageVariantsHorizontal,
  staggerContainer,
  fadeInUp,
  scaleIn,
  defaultPageTransition,
} from "@/lib/animation-variants";

interface JoinFormProps {
  onJoin: (roomCode: string) => void;
}

export function JoinForm({ onJoin }: JoinFormProps) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = () => {
    if (roomCode.length === 6) {
      const roomData = localStorage.getItem("dualview-room");
      if (roomData) {
        const parsed = JSON.parse(roomData);
        if (parsed.code === roomCode.toUpperCase()) {
          onJoin(roomCode.toUpperCase());
        } else {
          alert("Room not found. Please check the code.");
        }
      } else {
        alert("Room not found. Please check the code.");
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariantsHorizontal}
      transition={defaultPageTransition}
    >
      <motion.div 
        className="max-w-md w-full space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Back Button */}
        <motion.div variants={fadeInUp}>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <motion.div className="text-center space-y-2" variants={fadeInUp}>
          <motion.div 
            className="flex justify-center"
            variants={scaleIn}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Key className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold">Join Room</h1>
          <p className="text-muted-foreground">
            Enter the 6-character session code from the presenter
          </p>
        </motion.div>

        {/* Room Code Input */}
        <motion.div className="space-y-4" variants={staggerContainer}>
          <motion.div className="space-y-2" variants={fadeInUp}>
            <label className="text-sm font-medium">Session Code</label>
            <motion.input
              type="text"
              value={roomCode}
              onChange={(e) =>
                setRoomCode(e.target.value.toUpperCase().slice(0, 6))
              }
              placeholder="ABC123"
              className="w-full h-14 text-center text-2xl font-mono tracking-widest bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={6}
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>

          <motion.div variants={scaleIn}>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full"
                size="lg"
                onClick={handleJoin}
                disabled={roomCode.length !== 6}
              >
                Join Room
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

