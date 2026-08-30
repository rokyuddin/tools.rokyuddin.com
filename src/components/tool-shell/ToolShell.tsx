import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
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
    <div className={cn("mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8", className)}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
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
      <header className="mb-8 text-center max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs font-semibold">
            {tool.category}
          </Badge>
          <Badge
            variant="success"
            className="text-xs font-semibold flex items-center gap-1"
          >
            <ShieldCheck className="size-3.5" />
            100% In-Browser & Private
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs font-semibold flex items-center gap-1"
          >
            <Zap className="size-3 text-amber-500 fill-amber-500" />
            No Signup Required
          </Badge>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {tool.name}
        </h1>

        <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
          {tool.tagline}
        </p>
      </header>

      {/* Main Interactive Tool Container */}
      <main className="mb-10">{children}</main>

      {/* Was this useful feedback */}
      <div className="mb-14">
        <ToolFeedback toolSlug={tool.slug} />
      </div>

      {/* How It Works Section */}
      {tool.howItWorks.length > 0 && (
        <section className="mb-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 text-foreground">
            <BookOpen className="size-5 text-primary" />
            <h2 className="font-heading text-xl font-bold">
              How {tool.name} Works
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {tool.howItWorks.map((step) => (
              <div
                key={step.step}
                className="relative flex flex-col p-4 rounded-xl bg-muted/40 border border-border/50"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm mb-3 shadow-xs">
                  {step.step}
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Features */}
      {tool.features.length > 0 && (
        <section className="mb-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4 text-foreground">
            <Sparkles className="size-5 text-primary" />
            <h2 className="font-heading text-xl font-bold">Key Features</h2>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
            {tool.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span className="leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {tool.faqs.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4 text-foreground">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="font-heading text-xl font-bold">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" className="w-full">
            {tool.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-base font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-6">
            <h2 className="font-heading text-xl font-bold text-foreground">
              More Free Tools
            </h2>
            <Link
              href="/tools"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All Tools →
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
