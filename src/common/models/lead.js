
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
    stage: {
        type: String,
        enum: ["open", "proposal_sent", "negotiation", "closed_won", "closed_lost"],
        default: "open"
    },
    source: {
        type: String,
        enum: ['website', 'referral', 'event', 'other'],
        default: 'other'
    },
    notes: {
        type: String,
        trim: true
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
