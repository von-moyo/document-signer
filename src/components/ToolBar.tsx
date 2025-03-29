"use client";

import { Button } from "@/components/ui/button";
import {
  MousePointer2,
  Highlighter,
  Underline,
  MessageSquare,
  PenTool,
} from "lucide-react";

interface ToolBarProps {
  currentTool: string;
  setCurrentTool: (tool: string) => void;
}

const tools = [
  { id: "cursor", icon: MousePointer2, label: "Select" },
  { id: "highlight", icon: Highlighter, label: "Highlight" },
  { id: "underline", icon: Underline, label: "Underline" },
  { id: "comment", icon: MessageSquare, label: "Comment" },
  { id: "signature", icon: PenTool, label: "Sign" },
];

export function ToolBar({ currentTool, setCurrentTool }: ToolBarProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold mb-4">Tools</h2>
      <div className="grid gap-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={currentTool === tool.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => setCurrentTool(tool.id)}
          >
            <tool.icon className="mr-2 h-4 w-4" />
            {tool.label}
          </Button>
        ))}
      </div>
    </div>
  );
}