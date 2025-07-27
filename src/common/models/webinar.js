
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const webinarSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    host_name: {
        type: String,
        required: true,
        trim: true
    },
    scheduled_date: {
        type: Date
    },
    duration_minutes: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    meeting_url: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    visibility: {
        type: Boolean,
        default: true
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

webinarSchema.set('versionKey', false);

export default mongoose.model('Webinar', webinarSchema);
