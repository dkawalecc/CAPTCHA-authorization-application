const path = require("path");
const https = require("https");
const cors = require("cors");
const express = require("express");

const app = express();
const port = 3030;
app.use(cors());

const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));
// const serverUrl = "localhost:3000"


app.listen(port, () => {
    console.log(`App is listening on ${port}`);
});
  
