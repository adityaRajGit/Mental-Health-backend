import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Time slot sub-schema
const timeSlotSchema = new Schema({
    from: {
        type: String, // Format: "HH:MM"
        required: true,
        validate: {
            validator: v => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: 'Time must be in HH:MM format (24-hour)'
        }
    },
    to: {
        type: String, // Format: "HH:MM"
        required: true,
        validate: {
            validator: v => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: 'Time must be in HH:MM format (24-hour)'
        }
    }
}, { _id: false });


const availabilitySchema = new Schema({
    therapist: {
        type: Schema.Types.ObjectId,
        ref: 'Therapist', 
        required: true
    },
    days: {
        sunday: { type: [timeSlotSchema], default: [] },
        monday: { type: [timeSlotSchema], default: [] },
        tuesday: { type: [timeSlotSchema], default: [] },
        wednesday: { type: [timeSlotSchema], default: [] },
        thursday: { type: [timeSlotSchema], default: [] },
        friday: { type: [timeSlotSchema], default: [] },
        saturday: { type: [timeSlotSchema], default: [] }
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

availabilitySchema.set('versionKey', false);

export default mongoose.model('Availability', availabilitySchema);
