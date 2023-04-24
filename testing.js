// const ffmpeg = require('fluent-ffmpeg');
// const ffprobe = require('ffprobe');
// const ffprobeStatic = require('ffprobe-static');
// var randomstring = require("randomstring");

// const textAdder = (video_input, text) => {
//     ffprobe(video_input, { path: ffprobeStatic.path })
//     .then((info) => {
//         const duration = info.streams[0].duration;
//         ffmpeg(video_input)
//             .videoFilters({
//             filter: 'drawtext',
//             options: {
//                 fontfile: './fonts/font.ttf',
//                 text: text,
//                 fontsize: 24,
//                 fontcolor: 'black',
//                 x: '20',
//                 y: '(h-text_h)-20',
//                 box: 1, // enable text background
//                 boxcolor: 'yellow',
//                 boxborderw: 5, // border width of text background
//                 borderw: 2, // border width of text
//                 alpha: 1,
//             }
//             })
//             .duration(`${duration}`)
//             .save(`./texted_videos/videos/${randomstring.generate(7)}.mp4`)
//             .on('end', () => {
//                 console.log('Text added to video successfully');
//             })
//             .on('error', (err) => {
//                 console.log('Error adding text to video:', err);
//             });
//         })
//     .catch((err) => {
//         console.log('Error getting video duration:', err);
//     });
// }

// textAdder('videos/v1.mp4', 'hello \n world')


const gm = require('gm').subClass({ imageMagick: true });
const fs = require('fs');

function createRoundedTextImage(text, outputFile, callback) {
  const fontSize = 24;
  const padding = 10;
  const borderRadius = 10;

  gm(1, 1, 'none')
    .fontSize(fontSize)
    .fill('white')
    .drawText(0, 0, text)
    .trim()
    .size((err, size) => {
      if (err) return callback(err);

      const width = size.width + padding * 2;
      const height = size.height + padding * 2;

      gm(width, height, 'rgba(0, 0, 0, 0.5)')
        .drawRectangle(
          borderRadius,
          0,
          width - borderRadius,
          height,
          borderRadius,
          borderRadius
        )
        .drawRectangle(
          0,
          borderRadius,
          width,
          height - borderRadius,
          borderRadius,
          borderRadius
        )
        .drawArc(0, 0, borderRadius * 2, borderRadius * 2, 90, 180)
        .drawArc(width - borderRadius * 2, 0, width, borderRadius * 2, 0, 90)
        .drawArc(width - borderRadius * 2, height - borderRadius * 2, width, height, 270, 0)
        .drawArc(0, height - borderRadius * 2, borderRadius * 2, height, 180, 270)
        .fill('white')
        .drawText(padding, height - padding, text)
        .write(outputFile, callback);
    });
}

const inputVideo = './videos/v1.mp4';
const outputVideo = 'testing_vid.mp4';
const textImage = './text-image.png';
const text = 'Sample Text';

createRoundedTextImage(text, textImage, (err) => {
  if (err) {
    console.error('Error creating text image:', err);
    return;
  }

  ffmpeg(inputVideo)
    .input(textImage)
    .complexFilter([
      {
        filter: 'overlay',
        options: {
          x: 10,
          y: 10,
          enable: 'between(t,1,10)',
        },
      },
    ])
    .save(outputVideo)
    .on('end', () => {
      console.log('Text with rounded background added successfully!');
      fs.unlinkSync(textImage); // Delete the temporary text image
    })
    .on('error', (err) => {
      console.error('Error occurred:', err.message);
    });
});