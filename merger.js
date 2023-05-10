const fs = require("fs");
const path = require("path");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const videoMerger = async (input_videos, res) => {
  console.log("input videos", input_videos);
  const inputs = input_videos;
  const output = path.join(__dirname, "final.mp4");
  const tempFilePath = path.join(__dirname, "temp_video.mp4");

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
        // .on("start", (commandLine) =>
        //   console.log("FFmpeg command started:", commandLine)
        // )
        // .on("codecData", (codecData) =>
        //   console.log("Input codec data:", codecData)
        // )
        // .on("progress", (progress) => console.log("Progress:", progress))
        // .on("stderr", (stderrData) => console.log("Stderr data:", stderrData))
        // .on("stdout", (stdoutData) => console.log("Stdout data:", stdoutData))
        // .on("error", (err) => {
        //   console.log("An error occurred: " + err.message);
        //   reject(err);
        // })
        .on("end", () => {
          console.log("Joining finished successfully");
          const folderPath = "texted_videos/videos/"; // Replace with your folder path

          fs.readdirSync(folderPath).forEach((file) => {
            const filePath = path.join(folderPath, file);
            fs.unlinkSync(filePath);
          });

          console.log("All files deleted from folder");

          const folderPath2 = "uploads/"; // Replace with your folder path

          fs.readdirSync(folderPath2).forEach((file) => {
            const filePath = path.join(folderPath2, file);
            fs.unlinkSync(filePath);
          });
          fs.unlinkSync(tempFilePath);
          resolve();
        })
        .output(output)
        .videoCodec("libx265")
        .format("mp4")
        .audioCodec("aac")
        .audioBitrate("128k")
        .outputOptions("-shortest")
        .complexFilter(filterChain, ["outv"])
        .fps(30)
        .run();
    });
  } catch (err) {
    console.log("Error in videoMerger function:", err);
  }
};

module.exports = videoMerger;
