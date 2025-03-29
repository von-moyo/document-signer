"use client";

import { useCallback, useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ToolBar } from "@/components/ToolBar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentTool, setCurrentTool] = useState<string>("cursor");
  const [annotations, setAnnotations] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileUpload = useCallback((file: File) => {
    setPdfFile(file);
  }, []);

  const handleExport = useCallback(async () => {
    toast({
      title: "Export Started",
      description: "Your document is being prepared for download...",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Document Signer</h1>
          {pdfFile && (
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!pdfFile ? (
          <FileUploader onFileUpload={handleFileUpload} />
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-9">
              <DocumentViewer
                file={pdfFile}
                currentTool={currentTool}
                annotations={annotations}
                setAnnotations={setAnnotations}
              />
            </div>
            <div className="col-span-3">
              <ToolBar
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}