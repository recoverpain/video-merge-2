const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const videoMerger = (input_videos) => {
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
      })
      .mergeToFile(output, './outputs')
      .videoCodec('libx264')
      .format('mp4')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions('-shortest');

    setTimeout(() => {
        
    }, 2000);
}

module.exports = videoMerger;