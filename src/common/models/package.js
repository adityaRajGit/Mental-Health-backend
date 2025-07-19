
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
        required: true
    },
    max_attendees_per_webinar: {
        type: Number,
        required: true
    },
    max_duration_minutes: {
        type: Number,
        required: true
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
