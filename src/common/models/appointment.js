
import mongoose from 'mongoose';
import { COMPLETED, CONFIRMED, PENDING, SCHEDULED } from '../constants/enum';
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    therapist_id: {
        type: Schema.ObjectId,
        ref: 'Therapist',
        required: true
    },
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    scheduled_at: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
    },
    meet_link: {
        type: String
    },
    payment_status: {
        type: String,
        enum: [CONFIRMED, PENDING],
    },
    appointment_status: {
        type: String,
        enum: [SCHEDULED, COMPLETED],
        default: SCHEDULED
    },
    // paymentId:{
    //     type:Schema.ObjectId
    // },
    user_feedback: {
        type: Number,
        min: 1,
        max: 5
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

appointmentSchema.set('versionKey', false);

export default mongoose.model('Appointment', appointmentSchema);
