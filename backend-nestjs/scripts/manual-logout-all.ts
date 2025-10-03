import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualLogoutAll() {
  try {
    console.log('🔍 Finding all active sessions...');
    
    const activeSessions = await prisma.userLoginLog.findMany({
      where: { isActive: true },
      include: { user: true },
      orderBy: { loginTime: 'desc' }
    });
    
    console.log(`📊 Found ${activeSessions.length} active sessions`);
    
    if (activeSessions.length > 0) {
      const now = new Date();
      
      for (const session of activeSessions) {
        const duration = Math.floor((now.getTime() - session.loginTime.getTime()) / 1000);
        
        await prisma.userLoginLog.update({
          where: { id: session.id },
          data: {
            logoutTime: now,
            duration: duration,
            isActive: false,
          },
        });
        
        console.log(`✅ Logged out: ${session.user.Voter_Name} (${Math.floor(duration/60)}m ${duration%60}s)`);
      }
    }
    
    console.log('✅ All active sessions have been logged out');
    
  } catch (error) {
    console.error('❌ Error logging out sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualLogoutAll();
