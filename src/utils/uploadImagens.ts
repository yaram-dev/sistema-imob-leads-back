import { uploadImage } from "../services/cloudinary.service";

export async function uploadImages(files: Express.Multer.File[]) {
  if (!files.length) {
    return [];
  }

  return Promise.all(files.map((file) => uploadImage(file)));
}
