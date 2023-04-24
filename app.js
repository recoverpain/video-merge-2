const express = require('express');
const fs = require('fs');
const multer = require('multer');
const videoMerger = require('./merger');
const textAdder = require('./textAdder');

const app = express();
const path = require('path');


const videosDirectory = path.join(__dirname, 'videos');
const textedVideos = path.join(__dirname, 'texted_videos/videos');

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // specify the directory where you want to store the videos
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // use the original name of the file
    }
})
  
const upload = multer({ storage: storage })
  
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('personal-video'), (req, res) => {
    
    const choosen_videos = req.body['exercise-video'];
    const sets = req.body['sets'];
    const reps = req.body['reps'];
    const note = req.body['note'];

    const data = [];
    for (let i = 0; i < choosen_videos.length; i++) {
      data.push(
        {
          video_name: choosen_videos[i],
          sets: sets[i],
          reps: reps[i],
          note: note[i],
        }
      )
    }

    console.log(data);
    const selected = [`./uploads/${req.file.filename}`];
    const choosen_to_add_video = []

    for (let i = 0; i < data.length; i++) {
      if(data[i]['video_name'] != ''){
        // selected.push(`./texted_videos/videos/${data[i]['video_name']}`)
        choosen_to_add_video.push({
          'video': `./videos/${data[i]['video_name']}`,
          'text': `${data[i]['sets']} | ${data[i]['reps']} `,
          'name': i,
          'exercise': data[i]['note']
        })
      }      
    }

    for (let i = 0; i < choosen_to_add_video.length; i++) {
      textAdder(choosen_to_add_video[i]['video'], choosen_to_add_video[i]['text'], choosen_to_add_video[i]['name'], choosen_to_add_video[i]['exercise'], res, selected, data)
    }

    // setTimeout(() => {
    //   fs.readdir(textedVideos, (err, files) => {
    //     if (err) {
    //       console.error(err);
    //       return res.status(500).send('Error reading videos directory');
    //     }
    //     const videoOptions = files.filter(file => {
    //       const extension = path.extname(file);
    //       return extension === '.mp4' || extension === '.mov';
    //     })   
        
    //     for (let i = 0; i < data.length; i++) {
    //       if(videoOptions[i] != undefined){
    //         selected.push(`./texted_videos/videos/${videoOptions[i]}`)
    //       }
    //     }
    
    //     console.log(selected);
    //     // videoMerger(selected, res)
        
    //   });
    // }, 5000);

    
})

app.get('/videos', (req, res) => {
  fs.readdir(videosDirectory, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading videos directory');
    }
    const videoOptions = files.filter(file => {
      const extension = path.extname(file);
      return extension === '.mp4' || extension === '.mov';
    })

    res.json(videoOptions);
  });
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});
  