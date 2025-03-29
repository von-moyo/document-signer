/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import CustomRenderer from "./CustomRenderer";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface DocumentViewerProps {
  file: File;
  currentTool: string;
  annotations: any[];
  setAnnotations: (annotations: any[]) => void;
}

export function DocumentViewer({ file, currentTool, annotations, setAnnotations }: DocumentViewerProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'highlight' || currentTool === 'underline') {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelectionStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!selectionStart || !canvasRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newAnnotation = {
      type: currentTool,
      coords: {
        x: Math.min(selectionStart.x, endX),
        y: Math.min(selectionStart.y, endY),
        width: Math.abs(endX - selectionStart.x),
        height: Math.abs(endY - selectionStart.y)
      },
      text: currentTool === 'comment' ? prompt('Enter comment:') : '',
      signature: currentTool === 'signature' ? prompt('Enter signature:') : ''
    };

    setAnnotations([...annotations, newAnnotation]);
    setSelectionStart(null);
  };

  useEffect(() => (
    setPageDimensions(pageDimensions)
  ), [])

  return (
    <div className="p-4 overflow-auto max-h-[calc(100vh-12rem)] relative">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))} disabled={pageNumber <= 1} className="bg-gray-200 p-2 rounded">
          <ChevronLeft />
        </button>
        <span>Page {pageNumber} {numPages && `/ ${numPages}`}</span>
        <button onClick={() => setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev))} disabled={numPages !== null && pageNumber >= numPages} className="bg-gray-200 p-2 rounded">
          <ChevronRight />
        </button>
      </div>
      <Document
        file={file}
        loading={<LoaderCircle className="size-4 animate-spin text-gunmetal" />}
        onLoadSuccess={handleDocumentLoadSuccess}
        renderMode="custom"
      >
        <Page
          pageNumber={pageNumber}
          customRenderer={() => <CustomRenderer />}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </Document>

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: pageDimensions.width, height: pageDimensions.height }}
      />

      <AnnotationLayer
        annotations={annotations}
        pageDimensions={pageDimensions}
        onDelete={(index: number) => setAnnotations(annotations.filter((_, i) => i !== index))}
      />

      <button
        onClick={() => setAnnotations(annotations.slice(0, -1))}
        className="absolute bottom-4 right-4 bg-red-500 text-white px-2 py-1 rounded"
      >
        Undo
      </button>
    </div>
  );
}

const AnnotationLayer = ({ annotations, pageDimensions }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = pageDimensions.width;
    canvas.height = pageDimensions.height;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((annotation: any) => {
      const { coords, type } = annotation;
      ctx.beginPath();

      switch (type) {
        case 'highlight':
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = 'yellow';
          ctx.fillRect(coords.x, coords.y, coords.width, coords.height);
          break;

        case 'underline':
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          ctx.moveTo(coords.x, coords.y + coords.height);
          ctx.lineTo(coords.x + coords.width, coords.y + coords.height);
          ctx.stroke();
          break;

        case 'comment':
          ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
          ctx.fillRect(coords.x, coords.y, 20, 20);
          break;

        case 'signature':
          ctx.font = '16px Arial';
          ctx.fillStyle = 'black';
          ctx.fillText(annotation.signature, coords.x, coords.y);
          break;
      }

      ctx.globalAlpha = 1;
    });
  }, [annotations, pageDimensions]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0" />;
};
