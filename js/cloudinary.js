/* cloudinary.js — upload de imagens para o Cloudinary */

const CLOUDINARY_CLOUD  = 'drcdrisch';
const CLOUDINARY_PRESET = 'catalogolingerie';

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);

  try {
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.secure_url ?? null;
  } catch {
    return null;
  }
}
