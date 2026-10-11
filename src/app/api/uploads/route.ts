import { apiError, created } from '@/lib/api';
import { requireUser } from '@/lib/access';
import { saveUpload } from '@/lib/storage';
import { ApiError } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireUser(); const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File)) throw new ApiError(422, 'FILE_REQUIRED', 'Provide a file field.');
    return created(await saveUpload(file));
  } catch (error) { return apiError(error); }
}
