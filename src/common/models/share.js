
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const shareSchema = new Schema({
    originalPost: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    sharedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedMessage: {
        type: String,
        maxlength: 500
    },
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

shareSchema.set('versionKey', false);

export default mongoose.model('Share', shareSchema);
