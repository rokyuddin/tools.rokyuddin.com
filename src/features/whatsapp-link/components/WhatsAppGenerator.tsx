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
import { Label } from "@/components/ui/label";
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
  { label: "Customer Support", text: "Hi, I need assistance with my account/service." },
];

export function WhatsAppGenerator() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(popularCountries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const countrySelectId = useId();

  const generatedUrl = generateWhatsAppUrl({
    dialCode: selectedCountry.dialCode,
    phoneNumber,
    message,
  });

  const htmlSnippet = generatedUrl ? generateHtmlSnippet(generatedUrl) : "";

  // Dynamic QR Code SVG renderer URL
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
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Input Configuration Card */}
      <Card className="lg:col-span-7 shadow-sm border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Phone className="size-5 text-primary" />
              Configure WhatsApp Chat
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

        <CardContent className="space-y-6">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor={countrySelectId}>Country & Phone Number</Label>
            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <div className="relative w-44 shrink-0">
                <select
                  id={countrySelectId}
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = popularCountries.find(
                      (c) => c.code === e.target.value
                    );
                    if (country) setSelectedCountry(country);
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
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
                  type="tel"
                  placeholder="e.g. 1712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-10 text-base"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Selected prefix: <strong className="text-foreground">+{selectedCountry.dialCode}</strong>. Omit spaces or dashes.
            </p>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-message">Pre-filled Message (Optional)</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {message.length} characters
              </span>
            </div>

            <Textarea
              id="custom-message"
              placeholder="Hi, I'm interested in your product..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none text-sm"
            />

            {/* Message Quick Templates */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-muted-foreground block mb-2">
                Quick templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview & Actions Card */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-border shadow-sm bg-gradient-to-b from-card to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Generated WhatsApp Link
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {generatedUrl ? (
              <>
                {/* Result Display Box */}
                <div className="p-3.5 rounded-xl bg-background border border-border break-all font-mono text-xs text-foreground shadow-xs select-all">
                  {generatedUrl}
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <CopyButton
                    textToCopy={generatedUrl}
                    label="Copy Link"
                    successLabel="Link Copied!"
                    variant="default"
                    className="w-full"
                  />

                  <Button asChild variant="outline" className="w-full">
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
                    className="flex-1 text-xs"
                  >
                    <QrCode className="size-3.5 mr-1" />
                    {showQR ? "Hide QR" : "Show QR Code"}
                  </Button>

                  <Button
                    type="button"
                    variant={showHtml ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowHtml(!showHtml)}
                    className="flex-1 text-xs"
                  >
                    <Code className="size-3.5 mr-1" />
                    {showHtml ? "Hide HTML" : "HTML Button"}
                  </Button>
                </div>

                {/* QR Code Section */}
                {showQR && qrCodeImageUrl && (
                  <div className="p-4 rounded-xl border border-border bg-white text-center animate-in fade-in zoom-in-95 duration-150">
                    <div className="mx-auto size-48 flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeImageUrl}
                        alt="WhatsApp Direct QR Code"
                        className="size-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-sans font-medium">
                      Scan with any camera or WhatsApp to start chat
                    </p>
                    <div className="mt-3">
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
                          Download QR PNG
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
                        Website HTML Button
                      </span>
                      <CopyButton
                        textToCopy={htmlSnippet}
                        label="Copy HTML"
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
              <div className="py-12 text-center text-muted-foreground">
                <MessageSquare className="size-10 mx-auto mb-2 opacity-30 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Enter a phone number
                </p>
                <p className="text-xs mt-1 max-w-[200px] mx-auto">
                  Your WhatsApp link, QR code, and HTML button will generate in real-time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
