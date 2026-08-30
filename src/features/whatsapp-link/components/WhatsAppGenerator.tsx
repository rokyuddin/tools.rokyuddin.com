"use client";

import React, { useState, useId } from "react";
import {
  MessageSquare,
  ExternalLink,
  QrCode,
  Code,
  Sparkles,
  Phone,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/common/CopyButton";
import {
  popularCountries,
  type Country,
} from "../utils/countries";
import {
  generateWhatsAppUrl,
  generateHtmlSnippet,
} from "../utils/generate-url";

const messageTemplates = [
  { label: "General Inquiry", text: "Hello! I would like to inquire about your services." },
  { label: "Order Inquiry", text: "Hi, I have a question regarding my order." },
  { label: "Schedule Meeting", text: "Hello, I would like to schedule a quick call or meeting." },
  { label: "Support", text: "Hi, I need assistance with my account/service." },
];

export function WhatsAppGenerator() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(popularCountries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const countrySelectId = useId();
  const phoneInputId = useId();
  const messageInputId = useId();

  const generatedUrl = generateWhatsAppUrl({
    dialCode: selectedCountry.dialCode,
    phoneNumber,
    message,
  });

  const htmlSnippet = generatedUrl ? generateHtmlSnippet(generatedUrl) : "";

  const qrCodeImageUrl = generatedUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedUrl)}&margin=10`
    : "";

  const handleReset = () => {
    setPhoneNumber("");
    setMessage("");
    setShowQR(false);
    setShowHtml(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Input Configuration Card */}
      <Card className="lg:col-span-7 shadow-xs border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              WhatsApp Details
            </span>
            {(phoneNumber || message) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Reset
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="gap-5">
            {/* Phone Number Input */}
            <Field>
              <FieldLabel htmlFor={phoneInputId}>Phone Number</FieldLabel>
              <div className="flex gap-2.5">
                {/* Country Code Dropdown */}
                <div className="relative w-48 shrink-0">
                  <select
                    id={countrySelectId}
                    aria-label="Select Country"
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = popularCountries.find(
                        (c) => c.code === e.target.value
                      );
                      if (country) setSelectedCountry(country);
                    }}
                    className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  >
                    {popularCountries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} (+{c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number input */}
                <div className="relative flex-1">
                  <Input
                    id={phoneInputId}
                    type="tel"
                    placeholder="e.g. 1712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-11 text-base font-mono"
                  />
                </div>
              </div>
            </Field>

            {/* Message Textarea */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={messageInputId}>Message (Optional)</FieldLabel>
                {message && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {message.length} chars
                  </span>
                )}
              </div>

              <Textarea
                id={messageInputId}
                placeholder="Hi, I'm interested in..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />

              {/* Message Quick Templates */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {messageTemplates.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => setMessage(tmpl.text)}
                    className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border/50"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Live Preview & Actions Card */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="border-border shadow-xs bg-gradient-to-b from-card to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Generated Link
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {generatedUrl ? (
              <>
                {/* Result Display Box */}
                <div className="p-3.5 rounded-xl bg-background border border-border break-all font-mono text-xs text-foreground shadow-xs select-all">
                  {generatedUrl}
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <CopyButton
                    textToCopy={generatedUrl}
                    label="Copy Link"
                    successLabel="Copied!"
                    variant="default"
                    className="w-full h-10"
                  />

                  <Button asChild variant="outline" className="w-full h-10">
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="size-4 mr-1.5 text-emerald-600" />
                      <span>Open Chat</span>
                      <ExternalLink className="size-3 ml-1 opacity-60" />
                    </a>
                  </Button>
                </div>

                {/* Additional Toggles (QR & HTML Snippet) */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant={showQR ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowQR(!showQR)}
                    className="flex-1 text-xs h-9"
                  >
                    <QrCode className="size-3.5 mr-1" />
                    {showQR ? "Hide QR" : "QR Code"}
                  </Button>

                  <Button
                    type="button"
                    variant={showHtml ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowHtml(!showHtml)}
                    className="flex-1 text-xs h-9"
                  >
                    <Code className="size-3.5 mr-1" />
                    {showHtml ? "Hide HTML" : "HTML Code"}
                  </Button>
                </div>

                {/* QR Code Section */}
                {showQR && qrCodeImageUrl && (
                  <div className="p-4 rounded-xl border border-border bg-white text-center animate-in fade-in zoom-in-95 duration-150">
                    <div className="mx-auto size-44 flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeImageUrl}
                        alt="WhatsApp Direct QR Code"
                        className="size-full object-contain"
                      />
                    </div>
                    <div className="mt-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="text-xs text-slate-800 border-slate-300"
                      >
                        <a
                          href={qrCodeImageUrl}
                          target="_blank"
                          download="whatsapp-qr-code.png"
                          rel="noopener noreferrer"
                        >
                          Download QR
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* HTML Embed Snippet Section */}
                {showHtml && (
                  <div className="space-y-2 p-3.5 rounded-xl bg-background border border-border animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        HTML Code
                      </span>
                      <CopyButton
                        textToCopy={htmlSnippet}
                        label="Copy"
                        size="sm"
                      />
                    </div>
                    <pre className="p-2.5 rounded-lg bg-muted font-mono text-[11px] overflow-x-auto text-muted-foreground">
                      {htmlSnippet}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <MessageSquare className="size-8 mx-auto mb-2 opacity-30 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Enter phone number above
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
