import {ExtractJwt, Strategy} from "passport-jwt";
import {UserModel} from "./models/User";
import logger from "@shared/Logger";
import * as bcrypt from "bcrypt";
import {OK} from "http-status-codes";


const opts = {
    jwtFromRequest: ExtractJwt.fromHeader('auth'),
    secretOrKey: process.env.JWT_SECRET,
};


const strat = new Strategy(opts, (jwtPayload, done)=>{

    UserModel.find({id: jwtPayload.id}, async (err: any, user: any) => {
        if(err){
            return done(err, false);
        }

        if(user){
            return done(null, user);
        }else{
            return done(null, false);
        }

    });


});

export default  strat;