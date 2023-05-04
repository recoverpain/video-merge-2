const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
var randomstring = require("randomstring");
const multer = require("multer");
const videoMerger = require("./merger");
const fs = require("fs");
const path = require("path");

const textedVideos = path.join(__dirname, "texted_videos/videos");

const textAdder = async (
  video_input,
  text,
  name,
  exercise,
  res,
  selected,
  data
) => {
  if (!fs.existsSync(video_input)) {
    console.log("Error: Video file does not exist:", video_input);
    return;
  }
  const info = await ffprobe(video_input, { path: ffprobeStatic.path });
  const duration = info.streams[0].duration;

  await new Promise((resolve, reject) => {
    ffmpeg(video_input)
      .videoFilters(
        {
          filter: "drawtext",
          options: {
            fontfile: "./fonts/orignal_font.ttf",
            text: text,
            fontsize: 18,
            fontcolor: "white",
            x: "30",
            y: "(h-text_h)-30",
            box: 1, // enable text background
            boxcolor: "#008875",
            boxborderw: 8, // border width of text background
            alpha: 1,
          },
        },
        {
          filter: "drawtext",
          options: {
            fontfile: "./fonts/orignal_font.ttf",
            text: "SUP TUNK HOLD",
            fontsize: 12,
            fontcolor: "black",
            x: "30",
            y: "(h-text_h)-65",
            box: 1, // enable text background
            boxcolor: "#e6e6e6",
            boxborderw: 5, // border width of text background
            alpha: 1,
          },
        },
        {
          filter: "drawtext",
          options: {
            fontfile: "./fonts/orignal_font.ttf",
            text: `Note\\\\: ${exercise}`,
            fontsize: 14,
            fontcolor: "black",
            x: "(w-text_w)/2",
            y: "20",
            box: 1, // enable text background
            boxcolor: "#e6e6e6",
            boxborderw: 6, // border width of text background
            alpha: 1,
            // rounded: 1,
          },
        }
      )
      .duration(`${duration}`)
      .save(`./texted_videos/videos/${name}.mp4`)
      .on("end", () => {
        console.log("Text added to video successfully");
        resolve();
      })
      .on("error", (err) => {
        console.log("Error adding text to video:", err);
        reject(err);
      });
  });
};

module.exports = textAdder;
