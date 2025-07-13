
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const leadSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    company: {
        type: String,
        trim: true
    },
    employees: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    timeline: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    boughtPackage:{
        type:Boolean,
        default:false
    },
    status: {
        type: String,
        enum: ["lead", "client", "in progress"],
        default: "lead"
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

leadSchema.set('versionKey', false);

export default mongoose.model('Lead', leadSchema);
