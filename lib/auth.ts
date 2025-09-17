
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_NAME = 'user session'

export async function setSession(userId: string, email: string, name:string) {
    const sessionData = {
        userId,
        email,
        name,
        createdAt : Date.now() 
    }

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    (await cookies()).set(SESSION_NAME, sessionValue, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    })
}

export async function getSession() {
    const sessionCookie = (await cookies()).get(SESSION_NAME)
      if (!sessionCookie) {
    return null;
  }
  
  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    );
    return sessionData;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
     const session = await getSession();
  
  if (!session?.userId) {
    return null;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
}

export async function logout() {
  (await cookies()).delete(SESSION_NAME);
}