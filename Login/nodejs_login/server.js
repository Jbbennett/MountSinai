// Server

const express = require ('express');
const bodyParser = require ('body-parser');
const session = require ('express-session');
const bcrypt = require ('bcryptjs');
const mongoose = require ('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection

mongoose.connect('mongodb://localhost:27017/nodejs_login', {useNewUrlParser: true, useUnifiedTopology: true});

// User schema

const User = mongoose.model('User', {
    username: String,
    password: String
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false
}));

// Register route

app.post('/register', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error){
        res.status(400).send('Error registering user');
    }
});

// Login route

app.post('/login', async (req, res) => {
    try{
        const user = await User.findOne({username: req.body.username});
        if(!user){
            return res.status(404).send('User not found');
        }
        if(await bcrypt.compare(req.body.password, user.password)) {
            req.session.userId = user._id;
            return res.status(200).send('Login successful')
        }
        res.status(401).send('Invalid credentials');
    } catch (error) {
        res.status(400).send('Error logging in');
    }
});

// Logout route

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            return res.status(400).send('Error logging out');
        }
        res.status(200).send('Logged out successfully');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})