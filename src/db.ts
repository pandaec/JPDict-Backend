import mongoose from 'mongoose';
import logger from '@shared/Logger';

const DB_HOST : string = process.env.DB_HOST ? process.env.DB_HOST : '';

mongoose.connect(DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(()=>{
        logger.info('mongodb connected');
    });

export const db = mongoose;