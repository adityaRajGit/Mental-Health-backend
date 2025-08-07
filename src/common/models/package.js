
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const packageSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    package_type: {
        type: String,
        enum: ['standard', 'advanced', 'premium', 'custom'],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    max_webinars_per_month: {
        type: Number,
    },
    max_attendees_per_webinar: {
        type: Number,
    },
    max_duration_minutes: {
        type: Number,
    },
    max_sessions_per_month: {
        type: Number,
    },
    total_counselling_sessions : {
        type: Number,
    },
    max_sessions_minutes: {
        type: Number,
    },
    timeLine:{
        type: Number,
    },
    price: {
        type: Number,
        required: true
    },
    is_active: {
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

packageSchema.set('versionKey', false);

export default mongoose.model('Package', packageSchema);
