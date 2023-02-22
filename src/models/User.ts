import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt'
import { color } from "@helpers/constant";
import randomInt from "@helpers/randomInt";

export interface IUser extends Document {
    first_name: string;
    last_name: string,
    email: string;
    password: string;
    token?: string;
    avatar_url?: string
    friends: IUser["_id"][];
    createdAt: Date,
    updatedAt: Date
}

const UserSchema = new Schema<IUser>({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar_url: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: false
    },
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, { timestamps: true });

// Hash password before saving to database
UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;

    let avatar_url = `https://ui-avatars.com/api/?background=${color[randomInt(0, color.length)]}&color=fff&name=${user.first_name}+${user.last_name}`
    user.avatar_url = avatar_url
    next();
});

UserSchema.set("toJSON", {
    transform(doc, ret, options) {
        delete ret.password
        delete ret.token
    },
})


export default mongoose.model<IUser>('User', UserSchema);
