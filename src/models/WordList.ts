import {Schema} from 'mongoose';
import {db} from '../db';

const WordListScm = new Schema({
    owner: {type: Schema.Types.ObjectId},
    list: [
        {
            word: String,
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        }
    ],
});
const WordListModel = db.model('WordList', WordListScm, 'WordList');


export {WordListModel};