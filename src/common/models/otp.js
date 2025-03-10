
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const otpSchema = new Schema({
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

otpSchema.set('versionKey', false);

export default mongoose.model('Otp', otpSchema);
