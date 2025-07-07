
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const companySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201+'],
        required: true
    },
    industry: {
        type: String
    },
    website: {
        type: String
    },
    address: {
        type: String
    },
    packageType: {
        type: String,
        enum: ['Basic', 'Standard', 'Enterprise'],
        required: true
    },
    webinarsCompleted: {
        type: Number,
        default: 0
    },
    webinarsScheduled: {
        type: Number,
        default: 0
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
