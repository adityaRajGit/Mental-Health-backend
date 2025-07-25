
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const companySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    industry: {
        type: String
    },
    company_mail: {
        type: String
    },
    status: {
        type: String,
        enum: ['in_process', 'completed'],
        default: 'in_process'
    },
    website: {
        type: String
    },
    address: {
        type: String
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    webinarsCompleted: {
        type: Number,
        default: 0
    },
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    visibility: {
        type: Boolean,
        default: false
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

companySchema.set('versionKey', false);

export default mongoose.model('Company', companySchema);
