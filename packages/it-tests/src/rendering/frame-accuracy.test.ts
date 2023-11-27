import execa from "execa";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import { random } from "remotion";
import { expect, test } from "vitest";
import { RenderInternals } from "@remotion/renderer";

function selectColor(color: string, frame: number) {
  return Math.floor((random(`${color}-${frame}`) * 255) % 255);
}

const getMissedFramesforCodec = async (
  codec: "mp4" | "webm",
  offthread: boolean
) => {
  const outputPath = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "remotion-")
  );

  // render the VideoTesting example (which contains the Framer composition embedded with <Video>) to an image
  // sequence which can be checked for accuracy
  await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      `video-testing-${codec}${offthread ? "-offthread" : ""}`,
      outputPath,
      "--image-format",
      "jpeg",
      "--jpeg-quality",
      "100",
      "--sequence",
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );

  let missedFrames = 0;

  for (let frame = 0; frame < 100; frame++) {
    // each frame of the embedded video contains a (deterministically) random color which should appear correctly
    // in the rendered output
    const expectedColor = {
      red: selectColor("red", frame),
      green: selectColor("green", frame),
      blue: selectColor("blue", frame),
    };

    // extract the actual RGB color value of the top left pixel in the frame image that was generated by remotion
    const paddedIndex = String(frame).padStart(2, "0");
    const filename = path.join(outputPath, `element-${paddedIndex}.jpeg`);
    const img = await sharp(filename).raw().toBuffer();

    const actualColor = {
      red: img.readUInt8(0),
      green: img.readUInt8(1),
      blue: img.readUInt8(2),
    };

    const colorDistance = {
      red: Math.abs(expectedColor.red - actualColor.red),
      green: Math.abs(expectedColor.green - actualColor.green),
      blue: Math.abs(expectedColor.blue - actualColor.blue),
    };

    // encoding sometimes shifts the color slightly - so measure the distance between the expected and actual
    // colors and consider any frame not within an acceptable range to be wrong
    const highestDistance = Math.max(
      colorDistance.red,
      colorDistance.blue,
      colorDistance.green
    );
    const threshold = 30;
    if (highestDistance > threshold) {
      console.log(colorDistance, { threshold, frame, filename });
      missedFrames++;
    }
  }
  RenderInternals.deleteDirectory(outputPath);

  return missedFrames;
};

test("should render correct frames from embedded videos - WebM onthread", async () => {
  const missedFrames = await getMissedFramesforCodec("webm", false);
  expect(missedFrames).toBeLessThanOrEqual(0);
});

test("should render correct frames from embedded videos - WebM offthread", async () => {
  const missedFrames = await getMissedFramesforCodec("webm", true);
  expect(missedFrames).toBe(0);
});

test("should render correct frames from embedded videos - MP4 onthread", async () => {
  const missedFrames = await getMissedFramesforCodec("mp4", false);
  expect(missedFrames).toBeLessThanOrEqual(0);
});

test("should render correct frames from embedded videos - MP4 offthread", async () => {
  const missedFrames = await getMissedFramesforCodec("mp4", true);
  expect(missedFrames).toBe(0);
});
