
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    is_deleted: {
        type: Boolean,
        default: false 
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

userSchema.set('versionKey', false);

export default mongoose.model('User', userSchema);
