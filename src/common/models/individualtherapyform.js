
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const individualtherapyformSchema = new Schema({
    name:{
        type: String
    },
    contact:{
        type: Number
    },
    email:{
        type: String
    },
    help:{
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

individualtherapyformSchema.set('versionKey', false);

export default mongoose.model('Individualtherapyform', individualtherapyformSchema);
