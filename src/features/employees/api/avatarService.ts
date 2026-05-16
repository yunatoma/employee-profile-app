import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';

export async function uploadAvatar(employeeId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const storageRef = ref(storage, `avatars/${employeeId}/avatar.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
