import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/fragments';
import { Loader2, Upload, FileText, Monitor, Trash2, X, Smartphone } from 'lucide-react';
import {
  pageVariants,
  staggerContainer,
  fadeInUp,
  buttonVariants,
  defaultPageTransition,
} from '@/lib/animation-variants';

const DocViewer = lazy(() => import('@cyntler/react-doc-viewer'));

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

function ViewerLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<UploadedFile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

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

  const MAX_PPT_FILES = 3;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith('.ppt') && !file.name.endsWith('.pptx')) {
      setUploadError('Please select a PowerPoint file (.ppt or .pptx)');
      return;
    }

    // Check if user has reached the limit
    if (files.length >= MAX_PPT_FILES) {
      setUploadError(`You can only store up to ${MAX_PPT_FILES} presentations. Please delete an existing file to upload a new one.`);
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        setUploadError('Upload failed: ' + error.message);
      } else {
        await loadFiles();
      }
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!user) return;

    try {
      const filePath = `${user.id}/${file.name}`;
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return;
      }

      setFiles(files.filter(f => f.id !== file.id));
      
      if (selectedFileForViewer?.id === file.id) {
        setSelectedFileForViewer(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };


  const closeViewer = () => {
    setSelectedFileForViewer(null);
  };

  const handlePresent = (file: UploadedFile) => {
    const roomCode = generateSessionCode();
    localStorage.setItem(
      "castper-room",
      JSON.stringify({
        code: roomCode,
        isHost: true,
        fileUrl: file.url,
        fileName: file.name,
      })
    );
    navigate(`/present/${roomCode}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={defaultPageTransition}
    >
      <DashboardHeader onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Join Room */}
          <motion.div variants={buttonVariants}>
            <Card className="h-full min-h-32">
              <CardContent className="flex items-center justify-center h-full">
                <Button
                  onClick={() => navigate('/join-room')}
                  className="w-full min-h-32 p-6
                             flex flex-col items-center justify-center gap-4
                             rounded-2xl text-center
                             hover:shadow-xl hover:-translate-y-1
                             transition-all duration-300"
                  asChild
                >
                  <motion.div
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <div className="p-4 border shadow-2xl rounded-full bg-muted">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        Join Room
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Enter code to control presentation
                      </div>
                    </div>
                  </motion.div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Presentations List */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Presentations
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".ppt,.pptx"
                      onChange={handleUpload}
                      disabled={uploading || files.length >= MAX_PPT_FILES}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="cursor-pointer"
                        disabled={uploading || files.length >= MAX_PPT_FILES}
                      >
                        <span className="flex items-center gap-2">
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Upload
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-destructive/10 border border-destructive/50 text-destructive text-sm px-4 py-2 rounded-md mt-2"
                    >
                      {uploadError}
                    </motion.div>
                  )}
                </AnimatePresence>
                <CardDescription className={uploadError ? "mt-2" : ""}>
                  {files.length} of {MAX_PPT_FILES} files used
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No presentations uploaded yet</p>
                    <p className="text-sm">Upload a PowerPoint file to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-orange-500 shrink-0" />
                          <span className="text-sm font-medium truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                        
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePresent(file)}
                            title="Present"
                            className="gap-1"
                          >
                            <Monitor className="h-3 w-3" />
                            Present
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(file)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <AnimatePresence>
        {selectedFileForViewer && (
          <motion.div 
            className="fixed inset-0 bg-background/95 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold truncate">{selectedFileForViewer.name}</h2>
              <Button variant="ghost" size="icon" onClick={closeViewer}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<ViewerLoader />}>
                <DocViewer
                  documents={[{ uri: selectedFileForViewer.url }]}
                  className="h-full"
                />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Dashboard;

