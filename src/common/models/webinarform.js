import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const webinarformSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
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
    age: {
        type: Number,
        required: true,
        min: 1,
        max: 120
    },
    mobile_no: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 15
    },
    main_concerns: { //What are the main concerns or challenges you'd like support with?
        type: String,
        required: true,
        trim: true
    },
    challenge_duration: { // How long have you been experiencing these challenges?
        type: String,
        required: true,
        trim: true
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
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

webinarformSchema.set('versionKey', false);

export default mongoose.model('Webinarform', webinarformSchema);