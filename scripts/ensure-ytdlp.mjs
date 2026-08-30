import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const binDir = path.join(process.cwd(), "bin");
const binPath = path.join(binDir, "yt-dlp");

async function ensureYtDlp() {
  if (fs.existsSync(binPath)) {
    console.log("✓ yt-dlp binary is already present at", binPath);
    return;
  }

  console.log("yt-dlp binary not found. Downloading latest binary...");
  fs.mkdirSync(binDir, { recursive: true });

  const url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

  const download = (targetUrl) => {
    https.get(targetUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location) {
          download(res.headers.location);
          return;
        }
      }

      if (res.statusCode !== 200) {
        console.warn(`Failed to download yt-dlp binary (HTTP ${res.statusCode})`);
        return;
      }

      const fileStream = fs.createWriteStream(binPath);
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        try {
          fs.chmodSync(binPath, 0o755);
          console.log("✓ yt-dlp binary downloaded and chmod +x set successfully.");
        } catch (e) {
          console.warn("Could not chmod binary:", e.message);
        }
      });
    }).on("error", (err) => {
      console.warn("Error downloading yt-dlp:", err.message);
    });
  };

  download(url);
}

ensureYtDlp();
