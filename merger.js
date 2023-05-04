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

  inputs.forEach((input) => {
    command.input(input);
  });

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
        .mergeToFile(output, "./outputs")
        .videoCodec("libx264")
        .format("mp4")
        .audioCodec("aac")
        .audioBitrate("128k")
        .outputOptions("-shortest");
      console.log("Merging process started");
    });

    const folderPath = "texted_videos/videos/";

    const files1 = await fs.promises.readdir(folderPath);
    for (const file of files1) {
      const filePath = path.join(folderPath, file);
      await fs.promises.unlink(filePath);
    }

    const folderPath2 = "uploads/";

    const files2 = await fs.promises.readdir(folderPath2);
    for (const file of files2) {
      const filePath = path.join(folderPath2, file);
      await fs.promises.unlink(filePath);
    }

    const tempFilePath = path.join(__dirname, "temp_video.mp4");
    await fs.promises.unlink(tempFilePath);
    console.log("All files deleted from folder");
  } catch (err) {
    console.log("Error in videoMerger function:", err);
  }
};

module.exports = videoMerger;
