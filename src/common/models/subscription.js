
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package_id: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    subscription_type: {
        type: String,
        enum: ['one_time', 'monthly', 'quarterly', 'annual'],
        default: 'one_time'
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'cancelled', 'expired', 'pending'],
        default: 'pending'
    },
    razorpay_payment_id: {
        type:String
    },
    date_bought : {
        type: Date,
        default: Date.now
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

subscriptionSchema.set('versionKey', false);

export default mongoose.model('Subscription', subscriptionSchema);
