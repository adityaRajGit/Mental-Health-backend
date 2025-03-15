
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
      },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    content: {
        type: String,
        required: true,
        maxlength: 500
      },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
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

commentSchema.set('versionKey', false);

export default mongoose.model('Comment', commentSchema);
