"use client";

import {
  ArrowRightLeft,
  CalendarDays,
  CloudRain,
  CloudSun,
  Flower2,
  Snowflake,
  Sparkles,
  Sun,
  Wheat,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/common/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BANGLA_MONTHS,
  BANGLA_SEASONS,
  type BanglaDateResult,
  banglaToGregorian,
  gregorianToBangla,
  HISTORICAL_PRESETS,
  toBanglaNumber,
} from "../utils/bangla-calendar";

// Format date to YYYY-MM-DD
function formatDateToInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BanglaDateConverter() {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateToInput(today), [today]);
  const todayBangla = useMemo(() => gregorianToBangla(today), [today]);

  // Gregorian to Bangla State
  const [selectedGregorianStr, setSelectedGregorianStr] =
    useState<string>(todayStr);

  // Bangla to Gregorian State
  const [selectedBanglaYear, setSelectedBanglaYear] = useState<number>(
    todayBangla.year,
  );
  const [selectedBanglaMonth, setSelectedBanglaMonth] = useState<number>(
    todayBangla.monthIndex,
  );
  const [selectedBanglaDay, setSelectedBanglaDay] = useState<number>(
    todayBangla.day,
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "gregorian-to-bangla" | "bangla-to-gregorian"
  >("gregorian-to-bangla");

  // Computed results for Gregorian -> Bangla
  const gregorianToBanglaResult: BanglaDateResult = useMemo(() => {
    try {
      if (!selectedGregorianStr) return todayBangla;
      return gregorianToBangla(selectedGregorianStr);
    } catch {
      return todayBangla;
    }
  }, [selectedGregorianStr, todayBangla]);

  // Computed result for Bangla -> Gregorian
  const banglaToGregorianDate: Date = useMemo(() => {
    try {
      return banglaToGregorian(
        selectedBanglaYear,
        selectedBanglaMonth,
        selectedBanglaDay,
      );
    } catch {
      return new Date();
    }
  }, [selectedBanglaYear, selectedBanglaMonth, selectedBanglaDay]);

  const banglaToGregorianResult: BanglaDateResult = useMemo(() => {
    return gregorianToBangla(banglaToGregorianDate);
  }, [banglaToGregorianDate]);

  // Quick date offsets
  const setDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedGregorianStr(formatDateToInput(d));
  };

  // Season icon renderer
  const renderSeasonIcon = (iconName: string, className = "size-5") => {
    switch (iconName) {
      case "Sun":
        return <Sun className={className} />;
      case "CloudRain":
        return <CloudRain className={className} />;
      case "CloudSun":
        return <CloudSun className={className} />;
      case "Wheat":
        return <Wheat className={className} />;
      case "Snowflake":
        return <Snowflake className={className} />;
      case "Flower2":
        return <Flower2 className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const currentResult =
    activeTab === "gregorian-to-bangla"
      ? gregorianToBanglaResult
      : banglaToGregorianResult;

  return (
    <div className="space-y-8">
      {/* 1. Today's Bangla Date Live Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-primary/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-background/80 text-primary border-primary/30 px-2.5 py-0.5 text-xs font-semibold gap-1.5 shadow-2xs"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                আজকের বাংলা তারিখ
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium">
                {todayBangla.season.nameBn} কাল
              </Badge>
            </div>

            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {todayBangla.fullDateBn}
            </h2>

            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{todayBangla.weekdayBn}</span>
              <span>•</span>
              <span>{todayBangla.fullDateEn}</span>
              <span>•</span>
              <span>
                ইংরেজি:{" "}
                {today.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <CopyButton
              textToCopy={todayBangla.fullDateBn}
              label="বাংলা ফরম্যাট কপি"
            />
            <CopyButton
              textToCopy={todayBangla.formalDocBn}
              label="দলিল/চেক ফরম্যাট"
            />
          </div>
        </div>
      </div>

      {/* 2. Interactive Converter Main Card */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Converter Inputs */}
        <Card className="lg:col-span-6 shadow-xs border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ArrowRightLeft className="size-4 text-primary" />
                তারিখ রূপান্তরক (Date Converter)
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "gregorian-to-bangla" | "bangla-to-gregorian")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger
                  value="gregorian-to-bangla"
                  className="text-xs sm:text-sm"
                >
                  ইংরেজি ➔ বাংলা
                </TabsTrigger>
                <TabsTrigger
                  value="bangla-to-gregorian"
                  className="text-xs sm:text-sm"
                >
                  বাংলা ➔ ইংরেজি
                </TabsTrigger>
              </TabsList>

              {/* Mode 1: Gregorian to Bangla */}
              <TabsContent
                value="gregorian-to-bangla"
                className="space-y-4 m-0"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="gregorian-date-input"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    ইংরেজি তারিখ নির্বাচন করুন (Gregorian Date)
                  </label>
                  <div className="relative">
                    <Input
                      id="gregorian-date-input"
                      type="date"
                      value={selectedGregorianStr}
                      onChange={(e) => setSelectedGregorianStr(e.target.value)}
                      className="h-12 text-base font-medium"
                    />
                  </div>
                </div>

                {/* Quick Date Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateOffset(0)}
                    className="text-xs h-7.5 px-2.5 rounded-lg"
                  >
                    আজ (Today)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateOffset(-1)}
                    className="text-xs h-7.5 px-2.5 rounded-lg"
                  >
                    গতকাল
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateOffset(1)}
                    className="text-xs h-7.5 px-2.5 rounded-lg"
                  >
                    আগামীকাল
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateOffset(30)}
                    className="text-xs h-7.5 px-2.5 rounded-lg"
                  >
                    +১ মাস
                  </Button>
                </div>
              </TabsContent>

              {/* Mode 2: Bangla to Gregorian */}
              <TabsContent
                value="bangla-to-gregorian"
                className="space-y-4 m-0"
              >
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Day */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="bangla-day-select"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      দিন (Day)
                    </label>
                    <select
                      id="bangla-day-select"
                      value={selectedBanglaDay}
                      onChange={(e) =>
                        setSelectedBanglaDay(
                          Number.parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {toBanglaNumber(d)} ({d})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="bangla-month-select"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      মাস (Month)
                    </label>
                    <select
                      id="bangla-month-select"
                      value={selectedBanglaMonth}
                      onChange={(e) =>
                        setSelectedBanglaMonth(
                          Number.parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      {BANGLA_MONTHS.map((m) => (
                        <option key={m.index} value={m.index}>
                          {m.nameBn} ({m.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="bangla-year-input"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      বঙ্গাব্দ (Year)
                    </label>
                    <Input
                      id="bangla-year-input"
                      type="number"
                      value={selectedBanglaYear}
                      onChange={(e) =>
                        setSelectedBanglaYear(
                          Number.parseInt(e.target.value, 10) || 1433,
                        )
                      }
                      className="h-11 font-medium"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  নির্বাচিত বাংলা তারিখের ইংরেজি সমতুল্য:{" "}
                  <span className="font-semibold text-foreground">
                    {banglaToGregorianDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </TabsContent>
            </Tabs>

            {/* Historical Days Presets */}
            <div className="border-t border-border pt-4 space-y-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                ঐতিহাসিক ও জাতীয় দিবসসমূহ (Historical Presets)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {HISTORICAL_PRESETS.map((preset) => {
                  const currentYear = new Date().getFullYear();
                  const targetDate = `${currentYear}-${preset.gregorianDateStr}`;
                  const isSelected = selectedGregorianStr === targetDate;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setActiveTab("gregorian-to-bangla");
                        setSelectedGregorianStr(targetDate);
                      }}
                      className={cn(
                        "rounded-lg p-2 text-left border transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="text-xs font-medium truncate">
                        {preset.titleBn.split("(")[0]}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {preset.significance}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Converted Date Details */}
        <Card className="lg:col-span-6 shadow-xs border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                ফলাফল (Converted Details)
              </span>
              <Badge variant="secondary" className="text-xs">
                {currentResult.weekdayBn}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Big Date Display */}
            <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                বাংলা ক্যালেন্ডার (Bangla Academy 2019 Standard)
              </div>

              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {currentResult.fullDateBn}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {currentResult.fullDateEn}
                </span>
                <span>•</span>
                <span>
                  {currentResult.weekdayBn} ({currentResult.weekdayEn})
                </span>
                <span>•</span>
                <span>সংক্ষিপ্ত: {currentResult.shortDateBn}</span>
              </div>
            </div>

            {/* Season Card */}
            <div
              className={cn(
                "rounded-xl border p-4 bg-linear-to-r flex items-start gap-4 transition-all",
                currentResult.season.colorClass,
              )}
            >
              <div className="p-2.5 rounded-xl bg-background/80 shadow-2xs">
                {renderSeasonIcon(currentResult.season.iconName, "size-6")}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold text-foreground">
                    {currentResult.season.nameBn} কাল (
                    {currentResult.season.nameEn})
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-background/80"
                  >
                    {currentResult.season.monthsBn}
                  </Badge>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {currentResult.season.descriptionBn}
                </p>
              </div>
            </div>

            {/* Quick Copy Formats */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                এক-ক্লিকে কপি করুন (One-Click Copy Formats)
              </span>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2.5 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[10px]">
                      মানসম্মত বাংলা তারিখ
                    </div>
                    <div className="font-medium text-foreground">
                      {currentResult.fullDateBn}
                    </div>
                  </div>
                  <CopyButton
                    textToCopy={currentResult.fullDateBn}
                    label="কপি"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2.5 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[10px]">
                      দলিল / দাপ্তরিক / চেক ফরম্যাট
                    </div>
                    <div className="font-medium text-foreground">
                      {currentResult.formalDocBn}
                    </div>
                  </div>
                  <CopyButton
                    textToCopy={currentResult.formalDocBn}
                    label="কপি"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2.5 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[10px]">
                      English Transliteration
                    </div>
                    <div className="font-medium text-foreground">
                      {currentResult.fullDateEn}
                    </div>
                  </div>
                  <CopyButton
                    textToCopy={currentResult.fullDateEn}
                    label="Copy"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Six Seasons of Bengal (ষড়ঋতু পরিচয়) Grid */}
      <div className="space-y-4 border-t border-border pt-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
            <Sparkles className="size-5 text-primary" />
            বাংলার ষড়ঋতু পরিচয় (Six Seasons of Bengal)
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            বাংলা বছরের ১২ মাসকে ২ মাস অন্তর ৬টি স্বতন্ত্র ঋতুতে ভাগ করা হয়েছে
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BANGLA_SEASONS.map((season) => {
            const isCurrentSeason = currentResult.season.index === season.index;

            return (
              <div
                key={season.index}
                className={cn(
                  "rounded-xl border p-4 space-y-2.5 transition-all",
                  isCurrentSeason
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs"
                    : "border-border bg-card hover:border-border/80",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-muted text-foreground">
                      {renderSeasonIcon(season.iconName, "size-4")}
                    </div>
                    <span className="font-heading font-bold text-foreground">
                      {season.nameBn} কাল
                    </span>
                  </div>
                  {isCurrentSeason && (
                    <Badge
                      variant="default"
                      className="text-[10px] bg-primary text-primary-foreground"
                    >
                      চলতি ঋতু
                    </Badge>
                  )}
                </div>

                <div className="text-xs font-semibold text-primary">
                  {season.monthsBn} ({season.monthsEn})
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {season.descriptionBn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
