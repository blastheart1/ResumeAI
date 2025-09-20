import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InfoModal({ open, onClose }: InfoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dimmed backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal wrapper */}
          <motion.div
            className="relative z-50 w-full max-w-3xl mx-4 max-h-[95dvh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <Card className="flex flex-col flex-1 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md relative overflow-hidden safe-area-padding">
              {/* Fade overlays */}
              <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white/90 dark:from-gray-800/90 to-transparent pointer-events-none rounded-t-2xl" />
              <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white/90 dark:from-gray-800/90 to-transparent pointer-events-none rounded-b-2xl" />

              {/* Close Button */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full bg-transparent hover:bg-transparent active:bg-transparent
                     text-gray-600 hover:text-gray-900
                     dark:text-white dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <CardHeader>
                <CardTitle className="text-xl font-semibold">About This Project</CardTitle>
              </CardHeader>

              {/* Scrollable content */}
<CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden leading-relaxed text-left">
  
  {/* Purpose */}
  <section className="mb-4">
    <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
      Purpose
    </h2>
    <p className="mb-2 text-gray-700 dark:text-gray-200">
      This project is a personal portfolio demonstration designed to showcase both traditional parsing techniques and AI model integration. It combines FastAPI and a Node.js server to handle document parsing while connecting to OpenAI to generate enriched suggestions.
    </p>
  </section>

  {/* How to Use */}
  <section className="mb-4">
    <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
      How to Use
    </h2>
    <ul className="list-disc list-inside ml-5 space-y-1 text-gray-700 dark:text-gray-200 break-words">
      <li>Upload a supported document (PDF, DOCX, or TXT).</li>
      <li>The system parses the file and extracts structured content.</li>
      <li>AI is applied to enhance the content and generate additional insights.</li>
      <li>View results in the suggestions panel for further analysis.</li>
    </ul>
  </section>

  {/* Privacy */}
  <section className="mb-4">
    <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
      Privacy
    </h2>
    <p className="mb-2 text-gray-700 dark:text-gray-200">
      Uploaded documents are processed temporarily and are not stored or shared. Some requests may involve OpenAI services, which handle data according to their own terms. Please avoid uploading highly sensitive information.
    </p>
  </section>

  {/* AI Transparency */}
  <section className="mb-4">
    <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
      AI Transparency
    </h2>
    <p className="mb-2 text-gray-700 dark:text-gray-200">
      Not all results are AI-generated. Some content is parsed directly from the document, while others are enhanced using OpenAI models. AI output may contain errors or inaccuracies.
    </p>
  </section>

  {/* Disclaimer */}
  <section className="mb-4">
    <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
      Disclaimer
    </h2>
    <p className="mb-2 text-gray-700 dark:text-gray-200">
      This tool is for demonstration and educational purposes only. It is not intended for professional, financial, medical, or legal use. The author is not responsible for any reliance on its outputs.
    </p>
  </section>

  {/* Credits */}
  <section className="mb-4">
    <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
      Credits
    </h2>
    <p className="text-gray-700 dark:text-gray-200">
      Built by <span className="font-semibold">Luis</span> as part of a personal portfolio project. For feedback or collaboration, you can reach out via LinkedIn or GitHub.
    </p>
  </section>

</CardContent>

            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
