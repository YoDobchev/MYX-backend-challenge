const express = require("express");
const app = express();
const port = 3000;

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("imageInfos.db");

const ExifImage = require("exif").ExifImage;

const imageThumbnail = require("image-thumbnail");

const crypto = require("crypto");

(function initiateDB() {
  db.run(
    "CREATE TABLE IF NOT EXISTS imageInfos (id INT64, image BLOB, latitudeD INT, latitudeM INT, latitudeS FLOAT, longitudeD INT, longitudeM INT, longitudeS FLOAT, altitude INT)"
  );
})();

app.get("/images", (req, res) => {
  db.all(
    "SELECT id, latitudeD, latitudeM, latitudeS, longitudeD, longitudeM, longitudeS, altitude FROM imageInfos WHERE (latitudeD + latitudeM/60 + latitudeS/3600) BETWEEN ? and ? AND (longitudeD + longitudeM/60 + longitudeS/3600) BETWEEN ? and ?",
    parseInt(req.query.minLat),
    parseInt(req.query.maxLat),
    parseInt(req.query.minLong),
    parseInt(req.query.maxLong),
    (err, rows) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(404).send("No images found!");
        return;
      }
      var imageSearchResults = [];
      rows.forEach((row) => {
        imageSearchResults.push(row);
      });
      res.status(200).send(JSON.stringify(imageSearchResults));
    }
  );
});

app.get("/images/:imageID", (req, res) => {
  db.all(
    "SELECT id, image FROM imageInfos WHERE id = ?",
    req.params.imageID,
    (err, rows) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(404).send("Image not found!");
        return;
      }
      rows.forEach((row) => {
        res.header("Content-Type", "image/jpeg").end(row.image);
      });
    }
  );
});

app.get("/images/:imageID/thumbnail", (req, res) => {
  db.all(
    "SELECT id, image FROM imageInfos WHERE id = ?",
    req.params.imageID,
    (err, rows) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(404).send("Image not found!");
        return;
      }
      rows.forEach(async (row) => {
        try {
          const thumbnail = await imageThumbnail(row.image, {
            width: 256,
            height: 256,
          });
          res.header("Content-Type", "image/jpeg").end(thumbnail);
        } catch (err) {
          console.error(err);
        }
      });
    }
  );
});

app.post("/images", (req, res) => {
  const id = crypto.randomBytes(8).toString('hex');
  let data = [];
  req.on("data", (chunk) => {
    data.push(chunk);
  });
  req.on("end", () => {
    ExifImage({ image: Buffer.concat(data) }, (err, exifData) => {
      if (err) throw err;
      if (exifData === undefined) {
        res.status(404).send("Image does not contain EXIF information!");
        return;
      }
      db.run(
        "INSERT INTO imageInfos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id,
        Buffer.concat(data),
        exifData.gps.GPSLatitude[0],
        exifData.gps.GPSLatitude[1],
        exifData.gps.GPSLatitude[2],
        exifData.gps.GPSLongitude[0],
        exifData.gps.GPSLongitude[1],
        exifData.gps.GPSLongitude[2],
        exifData.gps.GPSAltitude,
        (err) => {
          if (err) throw err;
          res.status(200).send(`Uploaded image with id '${id}'!`);
        }
      );
    });
  });
});

app.delete("/images/:imageID", (req, res) => {
  db.all(
    "SELECT id FROM imageInfos WHERE id = ?",
    req.params.imageID,
    (err, rows) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(404).send("Image not found!");
        return;
      }
      db.run(
        "DELETE FROM imageInfos WHERE id = ?",
        req.params.imageID,
        (err) => {
          if (err) throw err;
          res
            .status(200)
            .send(`Image with id '${req.params.imageID}' has been deleted!`);
        }
      );
    }
  );
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
