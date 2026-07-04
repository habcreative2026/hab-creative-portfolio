process.env.DEBUG = 'passport:*';
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const whitelist = require("../utils/whitelist");

const API_URL = process.env.API_URL;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${API_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();

        if (!whitelist.includes(email)) {
          console.log(`[Passport]: Email ${email} không nằm trong whitelist.`);
          return done(null, { isWhitelisted: false, email });
        }

        let user = await User.findOne({ email });

        if (!user) {
          const role =
            email === "buihaitrong.dev@gmail.com" ? "super_admin" : "admin";
          user = await User.create({
            oauthId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            role: role,
          });
        }

        const userObj = user.toObject ? user.toObject() : user;
        userObj.isWhitelisted = true;

        return done(null, userObj);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
