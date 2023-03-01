import mongoose, { AnyKeys, Document, FilterQuery, Model, Schema } from "mongoose";
import bcrypt from 'bcrypt'
import { color } from "@helpers/constant";
import randomInt from "@helpers/randomInt";

// Định nghĩa một interface cho model
export interface IUser extends Document {
    first_name: string
    last_name: string
    email: string
    password: string
    token?: string
    avatar_url?: string;
    online_status: 'online' | 'offline'
    googleId?: string
    createdAt?: Date;
    updatedAt?: Date;

}

interface IFindOrCreate<T> extends Model<T> {
    findOneOrCreate: (
        condition: FilterQuery<T>,
        doc: AnyKeys<T> | T
    ) => Promise<T>;
}

const UserSchema = new Schema<IUser, IFindOrCreate<IUser>>({
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
        required: false,
    },
    avatar_url: {
        type: String,
        required: false
    },
    online_status: {
        type: String,
        enum: ["online", "offline"],
        default: "offline"
    },
    googleId: {
        type: String,
        required: false,
        unique: true
    },
    token: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    statics: {
        findOneOrCreate: async function (condition: any, doc: any) {
            const self: any = this;
            let result = await self.findOne(condition);
            if (result) {
                return result;
            } else {
                result = await self.create(doc, { new: true });
                return result;
            }
        }

    }
});


// Hash password before saving to database
UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    if (!user.password) return next()

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;

    if (!user.avatar_url) {
        let avatar_url = `https://ui-avatars.com/api/?background=${color[randomInt(0, color.length)]}&color=fff&name=${user.first_name}+${user.last_name}`
        user.avatar_url = avatar_url
    }

    next();
});

UserSchema.set("toJSON", {
    transform(doc, ret, options) {
        delete ret.password
        delete ret.token
    },
})


export default mongoose.model<IUser, IFindOrCreate<IUser>>('User', UserSchema);
