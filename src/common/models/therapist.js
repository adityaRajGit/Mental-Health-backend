import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const therapistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        trim: true
    },

    phone: {
        type: String,
        minlength: 10,
        maxlength: 10,
    },

    password: {
        type: String,
        required: function () {
            return !this.googleId // Password is required only if no social login ID are present
        },
        trim: true,
    },
    email_verified: {
        type: Boolean,
        default: false
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
    bio: String,
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
            enum: ['$', '₹', '€', '£', '¥', '¥', 'A$', 'C$', 'CHF', 'S$', 'HK$', 'NZ$', 'kr', 'kr', 'kr', 'R', 'R$', '₽', '₩', 'Mex$', 'AED', '฿', 'RM', 'Rp', '₫']
        }
    },
    googleId: String,
    role: {
        type: String,
        default: 'therapist',
        required: true,
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
        },
        wednesday: {
            type: [Date]
        },
        thursday: {
            type: [Date]
        },
        friday: {
            type: [Date]
        },
        saturday: {
            type: [Date]
        },
    },
    languages: {
        type: [String],
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
