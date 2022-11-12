const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Get All the Notes Login required

router.get("/fetchallnotes", async (req, res) => {
  console.log("req.user ", req.user);
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Internal Server Error");
  }
});

// ROUTE 2: Add a new Note  Login required

router.post(
  "/addnote",
  body("title", "title must be atmost 20 letters").isLength({ max: 20 }),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      // If there are errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ data: errors.array() });
      }
      const note = new Note({
        title,
        description,
        user: req.user._id,
      });
      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ data: error.message });
    }
  }
);

// ROUTE 3: Update an existing Note  Login required

router.put(
  "/updatenote/:id",
  body("title", "title must be atmost 20 letters").isLength({ max: 20 }),
  async (req, res) => {
    const { title, description } = req.body;
    try {
      const newNote = await Note.findById(req.params.id);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ data: errors.array() });
      }
      // Find the note to be updated and update it
      if (!newNote) {
        return res.status(404).send({ data: "Not Found" });
      }

      if (req.user._id.toString() !== newNote.user.toString()) {
        return res.status(401).send({ data: "Not Allowed" });
      }
      const newNotes = {};
      if (title) {
        newNotes.title = title;
      }
      if (description) {
        newNotes.description = description;
      }
      const note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNotes },
        { new: true }
      );
      res.json(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ data: error.message });
    }
  }
);
// ROUTE 4: Delete an existing Note Login required

router.delete("/deletenote/:id", async (req, res) => {
  try {
    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send({ data: "Not Found" });
    }
    await Note.findByIdAndDelete(req.params.id);

    res.json("success: note deleted");
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ data: error.message });
  }
});

// ROUTE 5: Get particular notes Login required

router.get("/getNote/:id", async (req, res) => {
  try {
    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send({ data: "Not Found" });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ data: error.message });
  }
});

module.exports = router;
