import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ToSModalProps {
  onAgree: () => void;
}

export default function ToSModal({ onAgree }: ToSModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasAgreed = localStorage.getItem("tosAgreed");
    if (!hasAgreed) {
      setOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem("tosAgreed", "true");
    setOpen(false);
    onAgree();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="relative w-[95vw] max-w-lg max-h-[95dvh] overflow-hidden rounded-2xl shadow-xl">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAgree}
          className="absolute top-2 right-2 rounded-full text-gray-600 hover:text-gray-900 
                     dark:text-white dark:hover:text-gray-300 hover:bg-transparent active:bg-transparent"
        >
          <X className="w-5 h-5 text-current" />
        </Button>

        <CardHeader>
          <CardTitle className="text-xl font-semibold">Terms of Service</CardTitle>
        </CardHeader>

        <CardContent className="overflow-y-auto scrollbar-hide max-h-[70vh] space-y-4 text-sm text-gray-700 dark:text-gray-200">
          <p>
            This project is a personal portfolio demo intended solely to showcase
            software development skills. It is not a commercial product.
          </p>
          <p>
            When you upload a document, it is processed temporarily for parsing and is
            not stored or shared. Some processing may involve third-party services,
            including OpenAI, which may apply their own terms.
          </p>
          <p>
            You retain ownership of your uploaded documents. Please do not use this
            demo for sensitive, financial, medical, or legal information.
          </p>
          <p>
            This project is provided as-is without warranties of any kind. The author is
            not liable for damages or reliance on its outputs. Access may be
            discontinued at any time.
          </p>
          <p>
            By clicking <strong>I Agree and Continue</strong>, you confirm that you
            understand and accept these terms.
          </p>
        </CardContent>

        <div className="p-4 flex justify-center">
          <Button
            onClick={handleAgree}
            className="rounded-xl px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            I Agree and Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
