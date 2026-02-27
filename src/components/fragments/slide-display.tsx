import { lazy, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const DocViewer = lazy(() => import("@cyntler/react-doc-viewer"));

interface SlideData {
  title: string;
  content: string;
}

interface SlideDisplayProps {
  fileUrl?: string;
  currentSlide: number;
  currentSlideData: SlideData;
  direction: number;
}

// Placeholder slides - in real app this would come from props or context
const placeholderSlides = [
  { title: "Welcome", content: "DualView Presentation" },
  { title: "Slide 2", content: "This is a placeholder slide" },
  { title: "Slide 3", content: "Add your content here" },
  { title: "Slide 4", content: "Control from your phone" },
  { title: "Slide 5", content: "Thank you!" },
];

function ViewerLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function SlideDisplay({ fileUrl, currentSlide, currentSlideData, direction }: SlideDisplayProps) {
  // Memoize the documents array to prevent re-renders
  const documents = useMemo(() => {
    if (fileUrl) {
      return [{ uri: fileUrl }];
    }
    return [];
  }, [fileUrl]);

  if (fileUrl && documents.length > 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-black">
        <div className="relative w-full h-full max-w-[95vw] max-h-[90vh]">
          <Suspense fallback={<ViewerLoader />}>
            <DocViewer
              documents={documents}
              className="h-full w-full"
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // Otherwise, show placeholder slides
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="relative w-full max-w-5xl aspect-video bg-white rounded-lg shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Placeholder Slide Content */}
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <motion.h2
                className="text-4xl font-bold text-gray-800 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentSlideData.title}
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentSlideData.content}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Export placeholder data for use in parent
export const slideData = placeholderSlides;
