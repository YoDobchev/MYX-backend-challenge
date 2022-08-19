# MYX Backend Challenge

## Dependencies
- [express](https://www.npmjs.com/package/express)
- [sqlite3](https://www.npmjs.com/package/sqlite)
- [exif](https://www.npmjs.com/package/exif)
- [image-thumbnail](https://www.npmjs.com/package/image-thumbnail)
- [crypto-js](https://www.npmjs.com/package/crypto-js)

## Setup
- Clone the repository
```
git clone https://github.com/YoDobchev/MYX-backend-challenge.git
```
- Install dependencies
```
cd MYX-backend-challenge/
npm install
```
- Run the project
```
npm start
```
- Navigate to <http://localhost:3000/>

## Testing
Testing is done with images from the [ML training dataset](https://docs.myxrobotics.com/BIM-classification-small-dataset.zip).
```
./test/test.sh
```

## API

| Method | Endpoint                                                                    | Function                                            |
|--------|-----------------------------------------------------------------------------|-----------------------------------------------------|
| GET    | /images?minLat=[minLat]&maxLat=[maxLat]&minLong=[minLong]&maxLong=[maxLong] | Search images inside a geographic bounding box. |
| GET    | /images/[imageId]                                                           | Get an image by id.                                 |
| GET    | /images/[imageId]?thumbnail                                                 | Get the thumbnail of an image by id.            |
| POST   | /images/                                                                    | Post an image in binary format.                     |
| DELETE | /images/[imageId]                                                           | Delete an image by id.                              |

### Examples:
- GET `localhost:3000/images?minLat=52&maxLat=62&minLong=1&maxLong=3`
- GET `localhost:3000/eb2b06c76f037f97?thumbnail`
- DELETE `localhost:3000/eb2b06c76f037f97`

## Questions

**Q: How will the system behave with 1 thousand images? With 1 millon?**

**A:** The amount of images that can be stored is limitless. It functioned just fine with 500 images, therefore working with an even higher number of entries should not be a problem.
 
**Q: How will the system behave with 1 concurent user? With 10? With 1000?**

**A:** As of now, lots of users uploading images simultaneously will cause an "Out of Memory" error. It turns out that SQLite does not support streaming data to a BLOB, hence this solution first loads the image into memory before inserting it. When working with a more reliable database, things such as running more node processes and file streaming can be implemented to maximize efficiency. 
