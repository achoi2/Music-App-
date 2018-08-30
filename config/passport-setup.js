require('dotenv').config();
const passport = require('passport');
const MeetupStrategy = require('passport-meetup-oauth2').Strategy;
const db = require('./database');
let serverURL = 'http://localhost:3000/auth/meetup/redirect';

let getMeetupProfile = (token) => {
    let url = 'https://api.meetup.com/members/self'
    return fetch(url,
        {headers: new Headers(
            {"Authorization": "Bearer " + token}
        )}
    )
    .then(res => {
        return res.json();
    })
};

let storeMeetupProfile = (id, accessToken) => {
    db.query(`UPDATE users SET access_token = $1
    WHERE meetup_id = '$2';`, [accessToken, id]
    )}

var registerMeetupStrategy = () => {
    passport.use(
        new MeetupStrategy({
            // options for the meetup strategy
            callbackURL: serverURL,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        }, (accessToken, refreshToken, profile, done) => {
            // passport callback function
            console.log(`Access Token: ${accessToken}`);
            getMeetupProfile(accessToken)
            .then(profile => {
                console.log(profile);
                return storeMeetupProfile(profile.id, accessToken)
            })
            .then(data => {
                return done(null, profile);
            });
        })
    );
}

module.exports = registerMeetupStrategy;