require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.SECRET;

userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/register", function(req, res){
    User.find(function(err, result){
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        newUser.save(function(err){
            if(err){
                res.send(err);
            } else{
                res.render("secrets");
            }
        });
    });
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, result){
        if(err){
            console.log(err);
        } else{
            if(result){
                if(result.password === password){
                    res.render("secrets");
                } else{
                    res.redirect("/login");
                }
            } else{
                res.redirect("/");
            }
        }
    })
});

app.listen(3000, function(){
    console.log("Server started successfully.")
});