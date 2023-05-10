const fs = require("fs");
const path = require("path");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ffprobeStatic = require("ffprobe-static");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobeStatic.path);
const videoMerger = async (input_videos, res) => {
  console.log("input videos", input_videos);
  const inputs = input_videos;
  const output = path.join(__dirname, "final.mp4");

  const command = ffmpeg();

  // Set the desired output resolution
  const outputWidth = 1280;
  const outputHeight = 720;

  inputs.forEach((input, index) => {
    command.input(input);
  });

  const filterSpecs = inputs.map(
    (input, index) =>
      `[${index}:v]scale=${outputWidth}:${outputHeight}[scaled${index}]`
  );
  const concatSpecs = inputs.map((input, index) => `[scaled${index}]`).join("");
  const filterChain = `${filterSpecs.join(";")};${concatSpecs}concat=n=${
    inputs.length
  }:v=1:a=0[outv]`;

  try {
    await new Promise((resolve, reject) => {
      command
        .on("error", (err) => {
          console.log("An error occurred: " + err.message);
          reject(err);
        })
        .on("end", () => {
          console.log("Joining finished successfully");
          resolve();
        })
        .output(output)
        .videoCodec("libx264")
        .format("mp4")
        .audioCodec("aac")
        .audioBitrate("128k")
        .outputOptions("-shortest")
        .complexFilter(filterChain, ["outv"]);
      console.log("Merging process started");
    });

    // ... (The rest of the code remains unchanged)
  } catch (err) {
    console.log("Error in videoMerger function:", err);
  }
};

module.exports = videoMerger;
