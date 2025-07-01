import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    userName: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profilePicture: {type: String, default: ''},
    phoneNumber: {type: String, default: null},
    dateOfBirth: {type: Date, default: null},
    gender: {
        type: String, 
        enum: ['Male', 'Female', 'Other'],  
        default: 'Other'
    },
    bio: {type: String, default: ''},
    address: {
        street: {type: String, default: ''},
        city: {type: String, default: ''},
        state: {type: String, default: ''},
        country: {type: String, default: ''},
        zipCode: {type: String, default: ''}
    },
    socialLinks: {
        facebook: {type: String, default: ''},
        twitter: {type: String, default: ''},
        instagram: {type: String, default: ''},
        linkedin: {type: String, default: ''},
        website: {type: String, default: ''}
    },
    isVerified: {type: Boolean, default: false},
    role: {
        type: String, 
        enum: ['User', 'Admin'],  
        default: 'User'
    },
    accountStatus: {
        type: String, 
        enum: ['Active', 'Inactive', 'Suspended', 'DeActivated'], 
        default: 'Active'
    },
    lastLogin: {type: Date, default: null},

    preferences: {
        language: {type: String, default: 'English'},
        theme: {type: String, default: 'Light'},
        notifications: {type: Boolean, default: true},
        privacy: {type: String, default: 'Public'}
    },

    lockUntil: {type: Date, default: null},

    isProfilePrivate: {type: Boolean, default: false},

    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    blockedUsers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    bookmarks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],















}, {
    timestamps: true,
})

const User = mongoose.model('User', userSchema);

export default User;