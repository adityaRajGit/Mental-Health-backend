
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    hugs: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    shares: [{
        type: Schema.Types.ObjectId,
        ref: 'Share'
    }],
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
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

postSchema.set('versionKey', false);

export default mongoose.model('Post', postSchema);
