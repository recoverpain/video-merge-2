const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
var randomstring = require("randomstring");

const textAdder = (video_input, text) => {
    ffprobe(video_input, { path: ffprobeStatic.path })
    .then((info) => {
        const duration = info.streams[0].duration;
        ffmpeg(video_input)
            .videoFilters({
            filter: 'drawtext',
            options: {
                fontfile: './fonts/font.ttf',
                text: text,
                fontsize: 24,
                fontcolor: 'black',
                x: '20',
                y: '(h-text_h)-20',
                box: 1, // enable text background
                boxcolor: 'yellow',
                boxborderw: 5, // border width of text background
                borderw: 2, // border width of text
                alpha: 1,
            }
            })
            .duration(`${duration}`)
            .save(`./texted_videos/videos/${randomstring.generate(7)}.mp4`)
            .on('end', () => {
                console.log('Text added to video successfully');
            })
            .on('error', (err) => {
                console.log('Error adding text to video:', err);
            });
        })
    .catch((err) => {
        console.log('Error getting video duration:', err);
    });
}

module.exports = textAdder;
