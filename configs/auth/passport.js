const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const db = require("../../models");
const User = db.user;

require("dotenv").config();
const { JWTSECRET } = process.env;

const strategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWTSECRET
};

passport.use("SION",
    new JwtStrategy(strategyOptions, (jwt_payload, done) => {
        console.log('User SION')
        const id = jwt_payload.user;
        User.findOne({ where: { idUser: id },logging:false })
        .then((data) => {
            if (data === null) {
                done(null, false);
            } else {
                done(null, data);
            }
        })
        .catch((err) => {
            done(null, false);
        });
      
    })
);