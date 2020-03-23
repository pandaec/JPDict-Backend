import {Request, Response, Router} from 'express';
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, OK} from 'http-status-codes';
import {UserRegister} from '../typings';
import * as bcrypt from 'bcrypt';
import logger from '@shared/Logger';
import mongoose from 'mongoose';
import {UserModel} from '../models/User';
import * as jwt from 'jsonwebtoken';

const router = Router();


router.get('/', async (req: Request, res: Response) => {
    UserModel.find({}, (err, users) => {
        if (err) {
            logger.error(err);
        }

        return res.status(OK).json(users);
    });


});

// register
router.post('/register', async (req: Request, res: Response) => {
    const saltRounds = 10;
    const body: UserRegister = req.body;

    if (body.username === undefined ||
        body.username.length === 0 ||
        body.email === undefined ||
        body.email.length === 0 ||
        body.password === undefined ||
        body.password.length === 0) {

        return res.status(BAD_REQUEST).json({'err': 'Username or email or password missing'});
    }

    bcrypt.hash(body.password, saltRounds, async (err, pwHash) => {
        if (err) {
            logger.error(err.message);
            return res.status(INTERNAL_SERVER_ERROR);
        }

        const dbUser = new UserModel({
            username: body.username,
            email: body.email,
            emailConfirmed: false,
            pwHash
        });
        try {
            await dbUser.save();

            return res.status(OK).json({});
        } catch (err) {
            if (err && err.code === 11000) {
                return res.status(BAD_REQUEST).json({'err': 'username or email already exists'});
            } else {
                return res.status(BAD_REQUEST).json({'err': 'unknown database error'});
            }
        }


    });
    return res.status(INTERNAL_SERVER_ERROR);
});

router.post('/login', async (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (email === undefined
        || email.length === 0
        || password === undefined
        || password.length === 0) {
        return res.status(BAD_REQUEST).json({'err': 'Email or password missing'});
    }

    UserModel.findOne({email}, async (err: any, dbUser: any) => {
        if(dbUser === null){
            return res
                .status(BAD_REQUEST)
                .json({err: 'Email or Password Incorrect'});
        }

        const match = await bcrypt.compare(password, dbUser.pwHash);
        if(match){
            const payload = {
                id: dbUser.id,
                username: dbUser.username,
            };
            jwt.sign(
                payload,
                (process.env.JWT_SECRET ? process.env.JWT_SECRET :  ''),
                {
                    expiresIn: 2628000 // 1 month in seconds
                },
                (errJwt, token) => {
                    res.json({
                        success: true,
                        token: token
                    });
                }
            );

        }else{
            return res
                .status(BAD_REQUEST)
                .json({err: 'Email or Password Incorrect'});
        }
    });

});

export default router;