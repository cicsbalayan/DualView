import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  pageVariantsHorizontal,
  staggerContainer,
  fadeInUp,
  slideInRight,
  scaleIn,
  defaultPageTransition,
} from "@/lib/animation-variants";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function CreateRoomFragment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState(generateSessionCode());
  const [isCopied, setIsCopied] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(user?.id + '/', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error('Error listing files:', error);
        setFiles([]);
        return;
      }

      if (data && data.length > 0) {
        const fileList: UploadedFile[] = data
          .filter(file => file.name.endsWith('.ppt') || file.name.endsWith('.pptx'))
          .map(file => {
            const { data: urlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(user?.id + '/' + file.name);
            
            return {
              id: file.id,
              name: file.name,
              url: urlData.publicUrl,
              created_at: file.created_at || new Date().toISOString(),
            };
          });
        setFiles(fileList);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert("Failed to copy code");
    }
  };

  const handleProceed = () => {
    localStorage.setItem(
      "dualview-room",
      JSON.stringify({
        code: roomCode,
        isHost: true,
        fileUrl: selectedFile?.url || null,
        fileName: selectedFile?.name || null,
      })
    );
    navigate(`/present/${roomCode}`);
  };

  const regenerateCode = () => {
    setRoomCode(generateSessionCode());
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
        className="max-w-lg w-full space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
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
          <h1 className="text-2xl font-bold">Create Presenter Room</h1>
          <p className="text-muted-foreground">
            Create a room to start presenting
          </p>
        </motion.div>

        <motion.div className="bg-card border rounded-lg p-6 space-y-4" variants={slideInRight}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Session Code</span>
            <Button variant="outline" size="sm" onClick={regenerateCode}>
              Regenerate
            </Button>
          </div>

          <motion.div 
            className="flex gap-2"
            variants={fadeInUp}
          >
            <motion.div 
              className="flex-1 bg-muted rounded-lg px-4 py-3 text-center font-mono text-2xl tracking-widest font-bold"
              key={roomCode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {roomCode}
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
              >
                {isCopied ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </motion.div>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          </motion.div>

          <p className="text-xs text-muted-foreground text-center">
            Share this code with your phone to control the presentation
          </p>
        </motion.div>

        <motion.div className="bg-card border rounded-lg p-6 space-y-2" variants={slideInRight}>
          <p className="text-sm font-medium">Presentation</p>
          {loadingFiles ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No presentations uploaded. Go to Dashboard to upload a PPT file.
            </p>
          ) : (
            <select
              value={selectedFile?.id || ""}
              onChange={(e) => {
                const file = files.find(f => f.id === e.target.value);
                setSelectedFile(file || null);
              }}
              className="w-full h-10 px-3 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a presentation</option>
              {files.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                </option>
              ))}
            </select>
          )}
        </motion.div>

        <motion.div variants={scaleIn}>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full"
              size="lg"
              onClick={handleProceed}
            >
              Proceed to Presentation
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

