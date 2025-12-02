import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Authenticate admin using the same mechanism as the middleware/admin pages
        // We look for 'admin_token' cookie using next/headers
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('admin_token')?.value;

        if (!adminToken) {
           throw new Error('Unauthorized');
        }

        const isValid = await validateAdminSession(adminToken);
        if (!isValid) {
            throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // you could pass a user id from auth
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times automatically if the status code is 500
    );
  }
}
