import { createUploadthing, type FileRouter } from 'uploadthing/next';
import jwt from 'jsonwebtoken';

const f = createUploadthing();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function checkAdmin(req: { headers: Headers }): Promise<void> {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      console.error('No cookie header found');
      throw new Error('Unauthorized - No authentication cookie');
    }

    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...rest] = c.split('=');
        return [key, rest.join('=')];
      })
    );

    const token = cookies['auth-token'];
    if (!token) {
      console.error('No auth-token cookie found');
      throw new Error('Unauthorized - No authentication token');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (!decoded || !decoded.admin) {
        console.error('User is not admin:', decoded);
        throw new Error('Forbidden - Admin access required');
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      throw new Error('Unauthorized - Invalid token');
    }
  } catch (error: any) {
    console.error('Admin check error:', error.message);
    throw error;
  }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '256MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      await checkAdmin(req);
      // Return metadata to be used in onUploadComplete
      return { userId: 'admin' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
    }),

  audioUploader: f({ audio: { maxFileSize: '256MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      await checkAdmin(req);
      return { userId: 'admin' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
    }),

  zipUploader: f({ blob: { maxFileSize: '256MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      await checkAdmin(req);
      return { userId: 'admin' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

