
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    type_of_feedback:{
        type:Boolean
    },
    feedback_content:{
        type:String
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

feedbackSchema.set('versionKey', false);

export default mongoose.model('Feedback', feedbackSchema);
