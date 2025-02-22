const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const notesRoute = require("./routes/note");
const mongoose = require("mongoose");
const { protect } = require("./middleware/fetchuser");
const express = require("express");
const app = express();
const cors = require("cors");

dotenv.config();

app.use(
  cors({
    origin: "*",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("connected to mongodb"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoute);
app.use("/api/note", protect, notesRoute);

app.get("/test", (req, res) => {
  res.send("Welcome to server of Note-keeper App");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("INoteBook app listening");
});
