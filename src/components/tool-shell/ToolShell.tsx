import React from "react";
import Link from "next/link";
import { ChevronRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToolCard } from "./ToolCard";
import { ToolFeedback } from "./ToolFeedback";
import {
  type ToolDefinition,
  getRelatedTools,
} from "@/config/tools";
import { cn } from "@/lib/utils";

interface ToolShellProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  className?: string;
}

export function ToolShell({ tool, children, className }: ToolShellProps) {
  const relatedTools = getRelatedTools(tool.slug);

  return (
    <div className={cn("mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8", className)}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/50" />
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Tools
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/50" />
        <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
          {tool.name}
        </span>
      </nav>

      {/* Tool Header */}
      <header className="mb-6 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {tool.category}
          </Badge>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {tool.name}
        </h1>

        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          {tool.tagline}
        </p>
      </header>

      {/* Main Interactive Tool Container */}
      <main className="mb-10">{children}</main>

      {/* Frequently Asked Questions (if any) */}
      {tool.faqs.length > 0 && (
        <section className="mb-10 rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3 text-foreground">
            <HelpCircle className="size-4 text-primary" />
            <h2 className="font-heading text-base font-semibold">
              FAQ
            </h2>
          </div>

          <Accordion type="single" className="w-full">
            {tool.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-sm font-medium py-3">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Feedback */}
      <div className="mb-10">
        <ToolFeedback toolSlug={tool.slug} />
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mb-6 border-t border-border/60 pt-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="font-heading text-lg font-bold text-foreground">
              More Tools
            </h2>
            <Link
              href="/tools"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {relatedTools.map((relTool) => (
              <ToolCard key={relTool.slug} tool={relTool} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
