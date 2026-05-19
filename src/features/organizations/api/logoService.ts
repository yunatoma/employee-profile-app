import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, firebaseAuth } from '../../../lib/firebase';

export async function uploadLogo(orgId: string, file: File): Promise<string> {
  // Storage rules で role == 'admin' が必要なため、最新のクレームを取得する
  await firebaseAuth.currentUser?.getIdToken(true);
  const logoRef = ref(storage, `organizations/${orgId}/logo`);
  await uploadBytes(logoRef, file, { contentType: file.type });
  return getDownloadURL(logoRef);
}
