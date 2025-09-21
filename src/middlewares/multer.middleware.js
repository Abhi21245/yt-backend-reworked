// import multer from "multer";

// const storage = multer.diskStorage(
//         {
//                 destination: function(req,file,cb){
//                         cb(null,"./public/temp")
//                   },
//                     filename:function(req,file,cb){
//                             cb(null,file.originalname)
//                         }
//                     }
//                 )
                
                
                
//                 console.log("the file in multer is ",storage);
//                 console.log("the file in multer in memory  ",multer.memoryStorage);
                
import multer from "multer";

const storage = multer.memoryStorage();

console.log("This is from multer ",storage)

export const upload = multer({storage:storage})