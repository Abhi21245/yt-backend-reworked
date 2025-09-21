import { v2 as cloudinary } from "cloudinary"
import { Readable } from "stream";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// multi file upload


const uploadBufferToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const readableStream = new Readable();
        readableStream._read = () => { }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",

            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result)
            }

        );
        readableStream.push(buffer)
        readableStream.push(null)
        readableStream.pipe(uploadStream)


    })



}



// main upload

const uploadCloudinary = async (files) => {
    if (Buffer.isBuffer(files)) {
        return await uploadBufferToCloudinary(files)

    } else if (Array.isArray(files)) {
        const uploadPromises = files.map(async (fileBuffer) => {

            if (Buffer.isBuffer(fileBuffer)) {
                return await uploadBufferToCloudinary(fileBuffer)
            } else {
                console.log("skipping non buffer element in files array :", fileBuffer)
                return null
            }
        })
        return await Promise.all(uploadPromises.filter(Boolean));

    } else {
        throw new Error("Invalid input: Expected a buffer or an array of buffers ")
    }
}













// const uploadCloudinary = async (buffer) =>{

//     return new Promise ((resolve,rejects)=>{
//         const uploadStream = cloudinary.uploader.upload_stream(
//             {
//             resource_type: "auto"
//             },

//             (error,result)=>{
//                 if(error){
//                     return rejects(error);
//                 }
//                 resolve(result)
//             }
//     );



//     console.log("file is upoladed ",uploadStream.url)

//     const readableStream = new Readable();
//     readableStream.push(buffer)
//     readableStream.push(null)
//     readableStream.pipe(uploadStream)

//     }
// )

// }


export { uploadCloudinary }


