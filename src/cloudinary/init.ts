import cloudinary from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()
const cloudinaryInstance = cloudinary.v2

cloudinaryInstance.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

export const uploadToCloud = (file: Express.Multer.File) => {
    return cloudinaryInstance.uploader.upload(file.path, {
        resource_type: "auto"
    })
}