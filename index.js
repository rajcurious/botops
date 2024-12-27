const express  =  require("express");
const authRoutes = require("./Routes/authRoutes")
const messageRoutes = require("./Routes/messageRoutes")
const userRoutes = require("./Routes/userRoutes")
const startUpRoutes =  require("./Routes/startupRoutes")
const channelRoutes =  require("./Routes/ChannelRoutes")
const friendRequestRoutes =  require("./Routes/friendRequestRoutes")
const cookieParser =  require('cookie-parser')
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require("./chat-server/socketManager");
const publicRoutes = ['/auth/login', '/auth/register'];
const passport =  require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const cors =  require('cors');  
const { userService } = require("./dependencies");


const authenticateJWT = (req, res, next) => {
    if (publicRoutes.includes(req.path)) return next();
    if (req.path.startsWith("/auth/")) return next();
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });
      req.user = user; // Attach user to the request object
      console.log(user)
      next();
    });
  };



const app  = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    console.log(origin)
    const allowedOrigins = [`${process.env.FRONT_END_DOMAIN}`];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "REDIRECT"],
  credentials: true,              // Allow cookies to be sent
}));
app.use(cookieParser());



app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret : process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_DOMAIN}/api/auth/google/callback`,
  scope: ['email','profile','openid'],
},
 async (accessToken, refreshToken, profile, done) =>{
  const user = await userService.createUserFromGoogleProfile(profile._json)
  return done(null, user)
}
))

passport.serializeUser((user, done)=> done(null, user));
passport.deserializeUser((user, done)=> done(null, user));

// JWT autentication middleware
app.use(authenticateJWT);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [`${process.env.FRONT_END_DOMAIN}`];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

app.use(express.json());


//Routes
app.use('/api/auth', authRoutes);
app.use('/api/message/', messageRoutes);
app.use('/api/user/', userRoutes);
app.use('/api/startup/', startUpRoutes);
app.use('/api/channel/', channelRoutes);
app.use('/api/friend-request/', friendRequestRoutes);

app.get("/api/", (req, res)=>{
    console.log(req.user)
    res.send("API is  running")
});


const PORT = process.env.PORT 
server.listen(PORT, console.log(`Up and running on ${PORT}`));