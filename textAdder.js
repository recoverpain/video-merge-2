const ffprobePath = require("ffprobe-static");
const { exec } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const fs = require("fs");
const path = require("path");

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
  try {
    const info = await getMediaInfo(video_input);
    const duration = info.streams[0].duration;
    await new Promise((resolve, reject) => {
      ffmpeg(video_input)
        .videoFilters(
          {
            filter: "drawtext",
            options: {
              fontfile: "./fonts/orignal_font.ttf",
              text: text,
              fontsize: 33,
              fontcolor: "white",
              x: "55",
              y: "(h-text_h)-80",
              box: 1, // enable text background
              boxcolor: "#00ADD3",
              boxborderw: 15, // border width of text background
              alpha: 1,
            },
          },
          {
            filter: "drawtext",
            options: {
              fontfile: "./fonts/orignal_font.ttf",
              text: name.toUpperCase(),
              fontsize: 23,
              fontcolor: "black",
              x: "50",
              y: "(h-text_h)-145",
              box: 1, // enable text background
              boxcolor: "#e6e6e6",
              boxborderw: 10, // border width of text background
              alpha: 1,
            },
          },
          {
            filter: "drawtext",
            options: {
              fontfile: "./fonts/orignal_font.ttf",
              text: `Note\\\\: ${exercise}`,
              fontsize: 23,
              fontcolor: "black",
              x: "(w-text_w)/2",
              y: "20",
              box: 1, // enable text background
              boxcolor: "#e6e6e6",
              boxborderw: 10, // border width of text background
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
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

function getMediaInfo(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.log("Error: Video file does not exist:", filePath);
      return reject();
    }
    const ffprobeCommand = `"${ffprobePath.path}" -v quiet -print_format json -show_format -show_streams "${filePath}"`;
    exec(ffprobeCommand, (error, stdout) => {
      if (error) {
        console.log("ffprobe error", error);
        reject(error);
        return;
      }

      try {
        const info = JSON.parse(stdout);
        resolve(info);
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = textAdder;
