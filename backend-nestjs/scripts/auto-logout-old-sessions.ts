import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function autoLogoutOldSessions() {
  try {
    console.log('🔍 Checking for old active sessions...');
    
    // Find sessions that have been active for more than 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const oldActiveSessions = await prisma.userLoginLog.findMany({
      where: {
        isActive: true,
        loginTime: {
          lt: twentyFourHoursAgo
        }
      },
      include: {
        user: true
      }
    });
    
    console.log(`📊 Found ${oldActiveSessions.length} sessions older than 24 hours`);
    
    if (oldActiveSessions.length > 0) {
      const now = new Date();
      
      for (const session of oldActiveSessions) {
        const duration = Math.floor((now.getTime() - session.loginTime.getTime()) / 1000);
        
        await prisma.userLoginLog.update({
          where: { id: session.id },
          data: {
            logoutTime: now,
            duration: duration,
            isActive: false,
          },
        });
        
        console.log(`✅ Auto-logged out: ${session.user.Voter_Name} (${Math.floor(duration/3600)}h ${Math.floor((duration%3600)/60)}m)`);
      }
    }
    
    // Also check for sessions that might be "stuck" (no recent activity)
    // This is a more aggressive cleanup for sessions that should have been logged out
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const stuckSessions = await prisma.userLoginLog.findMany({
      where: {
        isActive: true,
        loginTime: {
          lt: oneHourAgo
        }
      },
      include: {
        user: true
      }
    });
    
    console.log(`📊 Found ${stuckSessions.length} sessions older than 1 hour (potential stuck sessions)`);
    
    if (stuckSessions.length > 0) {
      const now = new Date();
      
      for (const session of stuckSessions) {
        const duration = Math.floor((now.getTime() - session.loginTime.getTime()) / 1000);
        
        await prisma.userLoginLog.update({
          where: { id: session.id },
          data: {
            logoutTime: now,
            duration: duration,
            isActive: false,
          },
        });
        
        console.log(`✅ Auto-logged out stuck session: ${session.user.Voter_Name} (${Math.floor(duration/60)}m)`);
      }
    }
    
    console.log('✅ Auto-logout cleanup completed');
    
  } catch (error) {
    console.error('❌ Error in auto-logout cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

autoLogoutOldSessions();
