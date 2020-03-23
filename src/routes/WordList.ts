import {Request, Response, Router} from 'express';
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, OK} from 'http-status-codes';
import passport from 'passport';
import jwt_decode from 'jwt-decode';
import {JwtToken} from '../typings';
import {WordListModel} from '../models/WordList';


const router = Router();

router.get('/',
    passport.authenticate('jwt', {session: false}),
    async (req: Request, res: Response) => {
        const token = req.header('auth');
        if (token) {
            const decoded: JwtToken = jwt_decode(token);

            WordListModel.findOne({owner: decoded.id}, async (err: any, dbList: any) => {
                if (dbList === null) {
                    return res
                        .status(BAD_REQUEST)
                        .json({err: 'Word List not for this user not found'});
                }

                return res.status(OK).json(dbList);
            });
        } else {
            // should never pass without auth header
            return res.status(INTERNAL_SERVER_ERROR);
        }
    });

router.post('/add/:word',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const token = req.header('auth');
        const paramWord = req.params.word;

        if (token) {
            const decoded: JwtToken = jwt_decode(token);

            WordListModel.findOne({owner: decoded.id}, async (err: any, dbList: any) => {
                if (dbList === null) {
                    // create WordList
                    const newDbList = new WordListModel({
                        owner: decoded.id,
                        list: [
                            {word: paramWord}
                        ],
                    });
                    try {
                        await newDbList.save();
                        return res.status(OK).json({success: true, ...newDbList});
                    } catch (err) {
                        res.status(INTERNAL_SERVER_ERROR);
                    }
                } else {
                    try {
                        // TODO handle unique word card
                        // use set or array?

                        // append word to wordlist
                        dbList.list.push({word: paramWord});
                        await dbList.save();
                        res.status(OK).json({success: true, ...dbList});
                    } catch (err) {
                        res.status(INTERNAL_SERVER_ERROR);
                    }
                }
            });


            //

        } else {
            // should never pass without auth header
            return res.status(INTERNAL_SERVER_ERROR);
        }
    });

router.post('/remove',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const token = req.header('auth');
        const wid: string[] = req.body.wid;

        if (wid === undefined) {
            return res.status(BAD_REQUEST).json({err: 'missing word ids'});
        }

        if (token) {
            const decoded: JwtToken = jwt_decode(token);

            try {
                await WordListModel
                    .updateOne({owner: decoded.id},
                        {
                            $pull: {
                                list: {
                                    _id: {$in: wid}
                                }
                            }
                        });

                return res.status(OK).json({success: true});

            } catch (err) {
                return res.status(INTERNAL_SERVER_ERROR);
            }


            //

        } else {
            // should never pass without auth header
            return res.status(INTERNAL_SERVER_ERROR);
        }
    });


// return a list of $id in the list array
router.get('/get/:word',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const token = req.header('auth');
        const paramWord = req.params.word;

        if (token) {
            const decoded: JwtToken = jwt_decode(token);

            WordListModel.findOne({owner: decoded.id}, async (err: any, dbList: any) => {
                if (dbList === null) {
                    return res
                        .status(OK)
                        .json({wid: []});
                }
                const idList = dbList.list
                    .filter((s: any) => s.word === paramWord)
                    .map((s: any) => s._id);
                return res.status(OK).json({wid: idList});
            });
        } else {
            // should never pass without auth header
            return res.status(INTERNAL_SERVER_ERROR);
        }
    });

export default router;