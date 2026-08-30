import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");
    const filename = searchParams.get("filename") || "video.mp4";

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing video URL." }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    if (!response.ok || !response.body) {
      // Fallback redirect if streaming fails
      return NextResponse.redirect(targetUrl);
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("[Proxy Download Error]:", err);
    return NextResponse.json({ error: "Failed to download media stream." }, { status: 500 });
  }
}
