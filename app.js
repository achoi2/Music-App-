// polyfill for using fetch on the backend
require('isomorphic-fetch');
// initialize express app
const app = require('express')();
// initialize http server for express app
const http = require('http').Server(app);
const passport = require('passport');
const authRoutes = require('./scripts/auth-routes');
const registerMeetupStrategy = require('./scripts/passport-setup');
// initialize scoket.io instance
const io = require('socket.io')(http);

// initiliaze passport session
registerMeetupStrategy();
app.use(passport.initialize());
app.use(passport.session());
// serialize user
passport.serializeUser(function(user, done) {
    done(null, user);
});
// deserialize user
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// ::routes::
// home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
// auth
app.use('/auth', authRoutes);
// chat
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

// listen for incoming web sockets
io.on('connection',(socket) => {
    // log connected status to console
    console.log('a user connected');
    // log client messages to console
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    // log disconnect status to console
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// app served on port 3000
http.listen(3000, () =>
    console.log('buddy-up is running on port 3000!')
);