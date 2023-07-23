require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
const DButils = require("./routes/utils/DButils");
var cors = require('cors');
// const crypto = require("crypto");

var app = express();

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   next();
// });

app.use(cors({
  origin: 'http://127.0.0.1:8080',
  credentials: true
}));

// //chat add -------------------------
// // Function to generate a secret key
// const generateSecretKey = () => {
//   return crypto.randomBytes(32).toString("hex");
// };

// // Generate the secret key and store it in a variable
// const secretKey = generateSecretKey();
// // ----------------------------------

app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    //secret: process.env.COOKIE_SECRET, // the encryption key
    secret: "template", // the encryption key
    // secret: secretKey, // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 20 sec
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration,
    
    // //add chat
    // resave: false,
    // saveUninitialized: true,
    
    cookie: {
      httpOnly: false,
      // secure: false
    }
    //the session will be extended by activeDuration milliseconds
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

// //Chat add:
// app.use(function (req, res, next) {
//   console.log("Session data:");
//   console.log(req.session);
//   next();
// });


//local:
app.use(express.static(path.join(__dirname, "dist")));
//remote:
// app.use(express.static(path.join(__dirname, '../assignment-3-3-basic/dist')));
app.get("/",function(req,res)
{ 
  //remote: 
  // res.sendFile(path.join(__dirname, '../assignment-3-3-basic/dist/index.html'));
  //local:
  res.sendFile(__dirname+"/index.html");

});

// app.use(cors());
// app.options("*", cors());

const corsConfig = {
  origin: true,
  credentials: true
};

// app.use(cors(corsConfig));
// app.options("*", cors(corsConfig));

var port = process.env.PORT || "3000"; //local=3000 remote=80
//#endregion
const user = require("./routes/users");

// //chat add
// app.use(function (req, res, next) {
//   console.log("Session data:");
//   console.log(req.session);
//   next();
// });


const recipes = require("./routes/recipes");
const auth = require("./routes/auth");


//#region cookie middleware
app.use(function (req, res, next) {
  // res.header('Access-Control-Allow-Origin', '*');
  console.log("1");
  console.log(req.session);
  // console.log(req.session.user.user_id);
  // console.log("req.user_id"+req.user_id);
  // console.log("req.user_id"+req.session.user.user_id);

  if (req.session && req.session.user) {
    console.log("2");

    DButils.execQuery("SELECT user_id FROM users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user.user_id)) {
          // req.user_id = req.session.user.user_id;
          // req.session.user.user_id = user.user_id;
          req.session.user.user_id = req.session.user.user_id;
          console.log("2.5");
          next();
        }
      })
      .catch((error) => next());
      console.log("3");
  } else {
    next();
    console.log("4");

  }
});

// //#endregion//#region cookie middleware
// app.use(function (req, res, next) {
//   if (req.session && req.session.username) {
//     DButils.execQuery("SELECT username FROM users")
//       .then((users) => {
//         if (users.find((x) => x.username === req.session.username)) {
//           req.username = req.session.username;
//         }
//         next();
//       })
//       .catch((error) => next());
//   } else {
//     next();
//   }
// });
// //#endregion

// ----> For cheking that our server is alive
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routings
app.use("/users", user);
app.use("/recipes", recipes);
app.use(auth);

// Default router
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});



const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
