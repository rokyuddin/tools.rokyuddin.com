import { NextResponse } from "next/server";
import { cleanEscapedUrl } from "@/features/reels-downloader/utils/url-detector";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTargetUrl = searchParams.get("url");
    const isInline = searchParams.get("inline") === "1";

    if (!rawTargetUrl) {
      return NextResponse.json({ error: "Missing video URL." }, { status: 400 });
    }

    const targetUrl = cleanEscapedUrl(rawTargetUrl);

    // Forward range header for seamless video seeking in browser
    const rangeHeader = req.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "*/*",
      Referer: "https://twitter.com/",
    };

    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const response = await fetch(targetUrl, {
      headers: fetchHeaders,
    });

    if (!response.ok || !response.body) {
      return NextResponse.redirect(targetUrl);
    }

    let filename = (searchParams.get("filename") || "video.mp4").trim();
    // Sanitize filename for HTTP header compliance
    filename = filename.replace(/[/\\?%*:|"<>]/g, "_");
    if (!filename.endsWith(".mp4") && !filename.endsWith(".mp3")) {
      filename = `${filename.replace(/\.[^.]+$/, "")}.mp4`;
    }

    const isMp3 = filename.endsWith(".mp3");
    const remoteContentType = response.headers.get("content-type");
    const contentType = isMp3
      ? "audio/mpeg"
      : remoteContentType?.includes("video") || remoteContentType?.includes("mp4")
        ? "video/mp4"
        : "video/mp4";

    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges") || "bytes";

    const dispositionType = isInline ? "inline" : "attachment";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `${dispositionType}; filename="${filename}"`,
      "Accept-Ranges": acceptRanges,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }
    if (contentRange) {
      headers["Content-Range"] = contentRange;
    }

    return new Response(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers,
    });
  } catch (err) {
    console.error("[Proxy Download Error]:", err);
    return NextResponse.json({ error: "Failed to download media stream." }, { status: 500 });
  }
}
