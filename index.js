const express  =  require("express");
const authRoutes = require("./Routes/authRoutes")
const messageRoutes = require("./Routes/messageRoutes")
const userRoutes = require("./Routes/userRoutes")
const startUpRoutes =  require("./Routes/startupRoutes")
const channelRoutes =  require("./Routes/ChannelRoutes")
const friendRequestRoutes =  require("./Routes/friendRequestRoutes")
const integrationRoutes =  require("./Routes/integrationRoutes")
const cookieParser =  require('cookie-parser')
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const {setupSocket, addUserToChannel} = require("./chat-server/socketManager");
const publicRoutes = ['/auth/login', '/auth/register'];
const passport =  require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const cors =  require('cors');  
const { userService, channelService } = require("./dependencies");




const DEFAULT_BOT_ID = 1734111777966; // ID Of cuteuu bot


function restrictAccessToLocal(req, res, next) {
  const allowedHosts = ['127.0.0.1', 'localhost', 'internal-domain.com'];
  
  const requestHost = req.hostname; // For domain-based checks
  const clientIp = req.ip; // For IP-based checks

  if (allowedHosts.includes(requestHost) || clientIp === '::1' || clientIp === '127.0.0.1') {
      next(); // Allow access
  } else {
      res.status(403).send('Access Denied');
  }
}
const authenticateJWT = (req, res, next) => {
    if (publicRoutes.includes(req.path)) return next();
    if (req.path.startsWith("/auth/") ||  req.path.startsWith("/integrations/")) return next();
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });
      req.user = user; // Attach user to the request object
      next();
    });
  };

const setUpNewUser = async (user) =>{
 
  const channel = await channelService.createChannel({
    admin_id: DEFAULT_BOT_ID,
    is_group: 0,
  });

  await userService.subscribeUserToChannel(user.id, channel.id)
  await userService.subscribeUserToChannel(DEFAULT_BOT_ID, channel.id)
  addUserToChannel(user.id, channel.id)
  addUserToChannel(DEFAULT_BOT_ID, channel.id)

}



const app  = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
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
  callbackURL: process.env.STAGE === 'dev' ? `${process.env.SERVER_DOMAIN}/auth/google/callback` :  `${process.env.SERVER_DOMAIN}/api/auth/google/callback`,
  scope: ['email','profile','openid'],
},

 async (accessToken, refreshToken, profile, done) => {
  console.log("accessToken ",  accessToken,"\n", refreshToken)
  const {isNew, user} = await userService.createUserFromGoogleProfile(profile._json)
  if(isNew){
    await setUpNewUser(user)
  }
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
      return callback(null, true);
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
app.use('/auth', authRoutes);
app.use('/message/', messageRoutes);
app.use('/user/', userRoutes);
app.use('/startup/', startUpRoutes);
app.use('/channel/', channelRoutes);
app.use('/friend-request/', friendRequestRoutes);

app.use('/integrations/', integrationRoutes)
app.use('/integrations/', restrictAccessToLocal);

app.get("/", (req, res)=>{
    res.send("API is  running")
});


const PORT = process.env.PORT 
server.listen(PORT, console.log(`Up and running on ${PORT}`));