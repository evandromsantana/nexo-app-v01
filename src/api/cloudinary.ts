import Constants from 'expo-constants';

const cloudName = Constants.expoConfig?.extra?.cloudinaryCloudName;
const uploadPreset = 'unsigned_upload'; // IMPORTANT: This must be created in your Cloudinary settings

export const uploadImage = async (uri: string) => {
  const formData = new FormData();
  
  // The file needs to be typed correctly for FormData
  const file = {
    uri,
    type: 'image/jpeg', // or 'image/png'
    name: 'upload.jpg',
  } as any;

  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Upload failed: ' + (data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
