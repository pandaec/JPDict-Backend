import {Schema} from 'mongoose';
import {db} from '../db';

const UserScm = new Schema({
    username: {type: String},
    email: {type: String},
    emailConfirmed: {type: Boolean},
    pwHash: {type: String},
});
const UserModel = db.model('User', UserScm, 'User');


export {UserModel};