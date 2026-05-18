import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';

export async function uploadLogo(orgId: string, file: File): Promise<string> {
  const logoRef = ref(storage, `organizations/${orgId}/logo`);
  await uploadBytes(logoRef, file, { contentType: file.type });
  return getDownloadURL(logoRef);
}
