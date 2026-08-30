"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolFeedbackProps {
  toolSlug: string;
  className?: string;
}

export function ToolFeedback({ toolSlug, className }: ToolFeedbackProps) {
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const handleFeedback = (response: "yes" | "no") => {
    setFeedback(response);
    try {
      localStorage.setItem(`feedback_${toolSlug}`, response);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card/50 text-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="font-medium text-foreground">Was this tool useful to you?</span>
      </div>

      {feedback ? (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
          <CheckCircle2 className="size-4" />
          <span>Thank you for your feedback!</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFeedback("yes")}
            className="h-8 px-3 hover:text-emerald-600 hover:border-emerald-500/30"
          >
            <ThumbsUp className="size-3.5 mr-1 text-emerald-600" />
            Yes
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFeedback("no")}
            className="h-8 px-3 hover:text-destructive hover:border-destructive/30"
          >
            <ThumbsDown className="size-3.5 mr-1 text-muted-foreground" />
            No
          </Button>
        </div>
      )}
    </div>
  );
}
