import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
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

    profile_pic: {
        type: String
    },
    email_verified: {
        type: Boolean,
        default: false
    },

    bio: String,

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    googleId: String,
    lastLogin: Date,

    isPrivate: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'user',
        required: true,
    },

    blockedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

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

userSchema.set('versionKey', false);

export default mongoose.model('User', userSchema);
