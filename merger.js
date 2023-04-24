const fs = require('fs');
const path = require('path');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const videoMerger = (input_videos, res) => {
    const inputs = input_videos;
    const output = 'final.mp4';
    
    const command = ffmpeg();
    
    inputs.forEach((input) => {
      command.input(input);
    });
    
    command
      .on('error', (err) => {
        console.log('An error occurred: ' + err.message);
      })
      .on('end', () => {
        console.log('Joining finished successfully');

        setTimeout(() => {
          const folderPath = 'texted_videos/videos/'; // Replace with your folder path
  
          fs.readdirSync(folderPath).forEach((file) => {
          const filePath = path.join(folderPath, file);
           fs.unlinkSync(filePath);
          });
  
          console.log('All files deleted from folder');
          res.download('final.mp4')
          // res.send("done")
        }, 5000);
      })
      .mergeToFile(output, './outputs')
      .videoCodec('libx264')
      .format('mp4')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions('-shortest');


}

module.exports = videoMerger;