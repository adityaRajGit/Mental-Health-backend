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
    
    username:{
        type: String,
        unique: true,
        trim: true
    },
    
    phone:{
        type: String,
        minlength: 10,
        maxlength: 10,
    },
    
    password: {
        type: String,
        required: true
    },
    
    profile_pic: {
        type: String
    },
    
    bio: String,
    
    status : {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    
    lastLogin : Date,
    
    isPrivate: {
        type: Boolean,
        default: false
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
