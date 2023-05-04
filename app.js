const express = require("express");
const axios = require("axios");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const { google } = require("googleapis");
const videoMerger = require("./merger");
const textAdder = require("./textAdder");

const app = express();
const path = require("path");

const videosDirectory = path.join(__dirname, "videos");
const textedVideos = path.join(__dirname, "texted_videos/videos");
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
// Replace the path below with the path to your downloaded JSON key file
const keyFile = "video-merger.json";

// Load the JSON key file
const keyData = JSON.parse(fs.readFileSync(keyFile, "utf8"));
// Configure the JWT auth client
const jwtClient = new google.auth.JWT(
  keyData.client_email,
  null,
  keyData.private_key,
  ["https://www.googleapis.com/auth/drive.readonly"],
  null
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // specify the directory where you want to store the videos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use the original name of the file
  },
});

const upload = multer({ storage: storage });

const downloadFile = async (fileId, filePath) => {
  try {
    const drive = google.drive({ version: "v3", auth: jwtClient });

    // Get the metadata to check the correct mimetype
    const fileMetadata = await drive.files.get({ fileId });

    // Download the file
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      response.data
        .pipe(fileStream)
        .on("finish", () => {
          console.log(`File downloaded to ${filePath}`);
          resolve(filePath);
        })
        .on("error", (error) => {
          console.error("Error downloading file:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload", upload.single("personal-video"), async (req, res) => {
  const choosen_videos = req.body["exercise-video"];
  const sets = req.body["sets"];
  const reps = req.body["reps"];
  const note = req.body["note"];

  const data = choosen_videos.map((id, i) => ({
    video_name: id,
    sets: sets[i],
    reps: reps[i],
    note: note[i],
  }));

  const selected = [`./uploads/${req.file.filename}`];

  try {
    const tempFilePath = path.join(__dirname, "temp_video.mp4");
    for (let i = 0; i < choosen_videos.length; i++) {
      // download url from google drive
      console.log("video", choosen_videos[i]);
      if (choosen_videos[i] !== "") {
        const video = await downloadFile(choosen_videos[i], tempFilePath);
        video &&
          (await textAdder(
            video,
            `${sets[i]} | ${reps[i]} `,
            i,
            note[i],
            res,
            selected,
            data
          ));
      }
    }

    const textedVideos = path.join(__dirname, "texted_videos/videos");
    fs.readdir(textedVideos, async (err, files) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error reading videos directory");
      }
      const videoOptions = files.filter((file) => {
        const extension = path.extname(file);
        return extension === ".mp4" || extension === ".mov";
      });

      for (let i = 0; i < data.length; i++) {
        if (videoOptions[i] != undefined) {
          selected.push(`./texted_videos/videos/${videoOptions[i]}`);
        }
      }
      await videoMerger(selected, res);
      res.download("final.mp4");
    });
  } catch (err) {
    reps.status(500).send("An error occurred");
  }
});

app.get("/videos", async (req, res) => {
  try {
    // Authenticate the JWT client
    await jwtClient.authorize();

    // Create a Google Drive API client
    const drive = google.drive({ version: "v3", auth: jwtClient });

    // Fetch video files from Google Drive
    const response = await drive.files.list({
      q: "mimeType contains 'video/'",
      fields: "nextPageToken, files(id, name, mimeType)",
    });

    res.status(200).json(
      response.data.files.map((file) => ({
        id: file.id,
        name: file.name,
      }))
    );
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error reading videos");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("App listening on port 3000!");
});
