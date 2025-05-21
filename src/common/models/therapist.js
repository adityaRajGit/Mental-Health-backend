import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const therapistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    profile_image: {
        type: String
    },
    academic_background: {
        qualification: {
            type: [String]
        },
        years_of_experience: {
            type: Number
        }
    },
    specialization: {
        type: [String]
    },
    session_details: {
        duration: {
            type: Number
        },
        cost: {
            type: Number
        },
        currency: {
            type: String,
            enum: ['USD', 'INR']
        }
    },
    availability: {
        sunday: {
            type: [Date]
        },
        monday: {
            type: [Date]
        },
        tuesday: {
            type: [Date]
        }
    },
    languages: {
        type: [String],
        enum: ['en', 'hi']
    },
    location: {
        city: {
            type: String
        },
        country: {
            type: String
        }
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

therapistSchema.set('versionKey', false);

export default mongoose.model('Therapist', therapistSchema);
