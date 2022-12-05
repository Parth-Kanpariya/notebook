const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator')



// ROUT 1: Get all notes using GET '/api/notes/fetchallnotes'........login required
router.get('/fetchallnotes', fetchuser, async(req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)

    } catch (error) {
        console.error(err.message);
        res.status(500).send("Internal server error occured")
    }
})


// ROUT 2: add notes using POST '/api/notes/addnote'........login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a Valid Title').isLength({ min: 3 }),
    body('description', 'Descryption must be at least 5 characters').isLength({ min: 5 }),
], async(req, res) => {

    try {
        const { description, tags, title } = req.body;

        //if there are errors, then return bad request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title,
            description,
            tags,
            user: req.user.id
        })

        const savedNote = await note.save();

        res.json(savedNote)
    } catch (error) {
        console.error(err.message);
        res.status(500).send("Internal server error occured")
    }
})

// ROUT 3: update notes using PUT '/api/notes/updatenote'........login required
router.put('/updatenote/:id', fetchuser, async(req, res) => {

   try {
      
      const { title, description, tags } = req.body;
   
      //create new note object
      const newNote = {};
   
      if (title) { newNote.title = title; }
      if (description) { newNote.description = description; }
      if (tags) { newNote.tags = tags; }
   
      //Find the note to be updated and update it
      let note = await Notes.findById(req.params.id);
      if (!note) {
          return res.status(404).send("Not Found");
      }
   
      if (note.user.toString() !== req.user.id) {
          return res.status(401).send("Not allowed");
      }
   
      note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
      res.json({ note });
   } catch (error) {
      console.error(err.message);
      res.status(500).send("Internal server error occured")
   }


});


// ROUT 4: delete notes using delete '/api/notes/deletenote'........login required
router.delete('/deletenote/:id', fetchuser, async(req, res) => {
   try {
      
      const { title, description, tags } = req.body;
  
  
      //Find the note to be deleted and delete it
      let note = await Notes.findById(req.params.id);
      if (!note) {
          return res.status(404).send("Not Found");
      }
  
      //Allow deletetion if user own this
      if (note.user.toString() !== req.user.id) {
          return res.status(401).send("Not allowed");
      }
  
      note = await Notes.findByIdAndDelete(req.params.id)
      res.json({ "Success":"Node has been deleted" });
   } catch (error) {
      console.error(err.message);
      res.status(500).send("Internal server error occured")
   }


})








module.exports = router