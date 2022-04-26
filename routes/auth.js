const express = require('express');
const User = require('../models/user');
const {updateValidation, registerValidation, loginValidation } = require('../validation');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv/config');

router.patch('/updateInfo/:token', async (req, res) => {
    console.log(req.body);
    const {error} = updateValidation(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    const token = req.params.token;
    try {
        const verify = jwt.verify(token, `${process.env.TOKEN_SECRET}`);
        const userId = verify._id;
        const update = await User.updateOne({_id: userId}, {$set: {name: req.body.name, email: req.body.email}});
        res.status(200).send({updated: update})
        } catch {
            res.status(400).send({message: "Invalid token, cannot update."})
        }
})


router.get('/:token', async (req,res) => {
    const token = req.params.token;
    try{
        const verified = jwt.verify(token, `${process.env.TOKEN_SECRET}`);
        const userId = verified;
        const user = await User.findById(userId._id);
        res.send({user: user});
    } catch (err) {
        res.status(400).send({message: "Invalid token, access denied"})
    }
})



router.post('/register', async (req,res) =>{
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});

    const emailExist = await User.findOne({email: req.body.email})
    if (emailExist) {
        return res.status(400).send({message: 'Email already taken'});
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    })

    try{
        console.log(req.body.name);
        const saved = await user.save();
        res.send(saved);
    }catch (e){
        res.send(e)
    }
}) 


router.post('/login', async (req,res) =>{
    const {error} = loginValidation(req.body)
    if (error) return res.status(400).send({message: error.details[0].message});

    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).send({message: 'Email does not exist'});
    }
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({message: 'Invalid Password'});
    const token = jwt.sign({_id: user._id}, `${process.env.TOKEN_SECRET}`);
    res.header('auth-token', token).send({token: token});
})



module.exports = router;