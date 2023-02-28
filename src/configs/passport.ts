import logger from '@helpers/logger';
import passport from 'passport'
import { ExtractJwt, StrategyOptions, Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as GoogleStrategy, StrategyOptions as GoogleOptions } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import { JwtPayload } from '@helpers/createToken'
import { Request } from 'express'
import User from '@models/User'
dotenv.config()


const cookieExtractor = function (req: Request) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['auth.access_token'];
    }


    return token;
};

const jwtPassportOpts: StrategyOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET_KEY!,

}

const googleOptions: GoogleOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:4000/api/auth/google/callback",
    scope: ["profile", "email"]
}

passport.use(new JwtStrategy(jwtPassportOpts, (payload: JwtPayload, done) => {
    return done(null, payload)
}))

passport.use(new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
    try {

        if (!profile.emails) {
            return done(null)
        }
        let email = profile.emails[0].value

        //check exist user
        let user = await User.findOne({ email })

        if (user && !user.googleId) {
            user.googleId = profile.id
            await user.save()
            return done(null, user)
        }

        if (!user) {
            user = new User({
                email,
                first_name: profile._json.given_name,
                last_name: profile._json.family_name,
                googleId: profile.id,
                avatar_url: profile._json.picture
            })

            await user.save()
            return done(null, user)

        }

        return done(null, user)

    } catch (error: any) {
        logger.error(error)
        return done(error.message)
    }
}))


