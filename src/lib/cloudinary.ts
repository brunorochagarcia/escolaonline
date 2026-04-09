import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/lib/env'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export async function uploadImagem(
  fileBase64: string,
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder: 'escolaonline/alunos',
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export async function deletarImagemCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}
