import { auth } from '../../auth';

export async function verifyAdminAuth() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return { isAdmin: false, user: null };
    }

    // Check user role
    if (session.user.role === 'admin') {
      return { 
        isAdmin: true, 
        user: {
          id: session.user.id,
          email: session.user.email as string,
          role: session.user.role as string,
          name: session.user.name as string
        }
      };
    }

    return { isAdmin: false, user: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAdmin: false, user: null };
  }
}