var bodyParser = require("body-parser"),
    expressSession = require("express-session"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user")
    mongoose = require("mongoose"),
    express = require("express"),
    app = express();

app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost:27017/passport_demo",{
    useNewUrlParser: true
})
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressSession({
    secret : "I am the one",
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", (req, res) => {
    res.render("home")
});

app.get("/register", (req, res) => {
    res.render("register")
});

app.get("/login", (req, res) => {
    res.render("login")
});

// here we use the authenticate method as a middleware taking in an object as parameter 
// and execute before the callback function
app.post("/login", passport.authenticate("local", {
    successRedirect : "/secret",
    failureRedirect : "/login"
 }),(req, res) => {
});

app.post("/register", (req, res) => {
    // here new user is created using only the username and the password 
    // is passed as a second argument for hashing
    User.register(new User({ username : req.body.username }), req.body.password, (err, user) => {
        if(err){
            console.log(err)
            res.render("register");
        } else {
            // passport will be using local strategy for authenticating the 
            // user and the session encoding is done and the user is directed to the secret page
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secret")
            });
        }
    });
});

app.get("/logout", (req, res) => {
    req.logout(); 
    res.redirect("/");
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
})

app.listen(4000, (req, res) => {
    console.log("Serving at port 4000....")
});

function isLoggedIn(req, res, next){   // a middleware
    if(req.isAuthenticated()){
        return next(); // gives control to the next callback function
    }
    res.redirect("/login");
}