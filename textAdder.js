const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
var randomstring = require("randomstring");
const multer = require('multer');
const videoMerger = require('./merger');
const fs = require('fs');
const path = require('path');

const textedVideos = path.join(__dirname, 'texted_videos/videos');

const textAdder = (video_input, text, name, exercise, res, selected, data) => {


    ffprobe(video_input, { path: ffprobeStatic.path })
    .then((info) => {
        const duration = info.streams[0].duration;
        ffmpeg(video_input)
            .videoFilters({
              filter: 'drawtext',
              options: {
                  fontfile: './fonts/orignal_font.ttf',
                  text: text,
                  fontsize: 18,
                  fontcolor: 'white',
                  x: '30',
                  y: '(h-text_h)-30',
                  box: 1, // enable text background
                  boxcolor: '#008875',
                  boxborderw: 8, // border width of text background
                  alpha: 1,
              }
            },
            {
                filter: 'drawtext',
                options: {
                    fontfile: './fonts/orignal_font.ttf',
                    text: 'SUP TUNK HOLD',
                    fontsize: 12,
                    fontcolor: 'black',
                    x: '30',
                    y: '(h-text_h)-65',
                    box: 1, // enable text background
                    boxcolor: '#e6e6e6',
                    boxborderw:5, // border width of text background
                    alpha: 1,
                    
                }
            }, {
              filter: 'drawtext',
              options: {
                  fontfile: './fonts/orignal_font.ttf',
                  text: `Note\\\\: ${exercise}`,
                  fontsize: 14,
                  fontcolor: 'black',
                  x: '(w-text_w)/2',
                  y: '20',
                  box: 1, // enable text background
                  boxcolor: '#e6e6e6',
                  boxborderw: 6, // border width of text background
                  alpha: 1,
                  // rounded: 1,
                  
              }
          })
            .duration(`${duration}`)
            .save(`./texted_videos/videos/${name}.mp4`)
            .on('end', () => {
                console.log('Text added to video successfully');

                    fs.readdir(textedVideos, (err, files) => {
                      if (err) {
                        console.error(err);
                        return res.status(500).send('Error reading videos directory');
                      }
                      const videoOptions = files.filter(file => {
                        const extension = path.extname(file);
                        return extension === '.mp4' || extension === '.mov';
                      })   
                      
                      for (let i = 0; i < data.length; i++) {
                        if(videoOptions[i] != undefined){
                          selected.push(`./texted_videos/videos/${videoOptions[i]}`)
                        }
                      }
                  
                      console.log(selected);
                      videoMerger(selected, res)
                      
                    });

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
