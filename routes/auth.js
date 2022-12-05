const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require("../middleware/fetchuser")

const JWT_SECRET = "Parthisagoodb$oy";

// ROUT 1: Create user using POST "/api/auth/createuser" ........No login required
router.post('/createuser', [
    body('email', 'Enter a Valid Email').isEmail(),
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('password', 'Enter a valid password').isLength({ min: 5 })
], async(req, res) => {

    let success=false;

    //if there are errors, then return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }

    // const user = User(req.body);
    // user.save()

    //check wheter user exist with same email already
    try {
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({success, err: "Sorry a user with this email already exis" })
        }

        //add security
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)

        //create new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success, authToken })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error occured")
    }
});


// ROUT 2: Authenticate a user using POST '/api/auth/login'........No login required
router.post('/login', [
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async(req, res) => {

    //if there are errors, then return bad request
    const errors = validationResult(req);
    let success=false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success,errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({success, error: "Please try to login with correct credential" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({success, error: "Please try to login with correct credential" })
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success, authToken });
    } catch (e) {
        console.error(err.message);
        res.status(500).send("Internal server error occured")
    }

});


// ROUT 3: Get user detail using POST '/api/auth/getuser'........login required
router.post('/getuser',fetchuser, async(req, res) => {

    try {
        const userId= req.user.id;
        const user = await User.findById(userId).select('-password');
        res.send(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error occured")
    }

})







module.exports = router