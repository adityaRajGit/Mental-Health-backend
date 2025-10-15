
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
    user_type: {
        type: String,
        enum: ['individual', 'corporate'],
        required: true,
        default: 'individual'
    },
    total_sessions : {
        type: Number,
    },
    description: {
        type: String,
        trim: true
    },
    points:{
        type: [String],
        trim: true
    },
    resultCheck:{
        type: String
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
    timeLine:{ // days
        type: Number,
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    realPrice:{
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
