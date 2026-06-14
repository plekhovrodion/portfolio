import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const previewsDir = path.join(publicDir, "desktop-previews");

async function optimizeProfile() {
  const source = path.join(publicDir, "profile.png");
  if (!existsSync(source)) {
    console.warn("skip profile: profile.png not found");
    return;
  }

  await sharp(source)
    .resize(128, 128, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(path.join(publicDir, "profile.webp"));

  await sharp(source)
    .resize(256, 256, { fit: "cover" })
    .webp({ quality: 85 })
    .toFile(path.join(publicDir, "profile@2x.webp"));

  console.log("optimized profile.webp, profile@2x.webp");
}

async function optimizeDesktopPreviews() {
  if (!existsSync(previewsDir)) {
    return;
  }

  const files = await readdir(previewsDir);
  for (const file of files) {
    if (!file.endsWith(".png")) {
      continue;
    }

    const source = path.join(previewsDir, file);
    const target = path.join(previewsDir, file.replace(/\.png$/, ".webp"));

    await sharp(source)
      .resize(256, 144, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(target);

    console.log(`optimized ${path.relative(publicDir, target)}`);
  }
}

async function optimizeWallPoster() {
  const video = path.join(publicDir, "wall.webm");
  const poster = path.join(publicDir, "wall-poster.webp");

  if (!existsSync(video)) {
    console.warn("skip wall poster: wall.webm not found");
    return;
  }

  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        video,
        "-frames:v",
        "1",
        "-vf",
        "scale=1280:-2",
        poster,
      ],
      { stdio: "pipe" },
    );
    console.log("optimized wall-poster.webp");
  } catch {
    await sharp({
      create: {
        width: 1280,
        height: 720,
        channels: 3,
        background: { r: 8, g: 8, b: 8 },
      },
    })
      .webp({ quality: 60 })
      .toFile(poster);
    console.warn(
      "wall poster: ffmpeg unavailable — wrote dark fallback wall-poster.webp",
    );
  }
}

await optimizeProfile();
await optimizeDesktopPreviews();
await optimizeWallPoster();
