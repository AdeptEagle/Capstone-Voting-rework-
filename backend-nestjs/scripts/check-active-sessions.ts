import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkActiveSessions() {
  try {
    const activeSessions = await prisma.userLoginLog.findMany({
      where: { isActive: true },
      include: { user: true },
      orderBy: { loginTime: 'desc' }
    });
    
    console.log(`📊 Current active sessions: ${activeSessions.length}`);
    console.log('');
    
    activeSessions.forEach(session => {
      const now = new Date();
      const loginTime = new Date(session.loginTime);
      const duration = Math.floor((now.getTime() - loginTime.getTime()) / 1000);
      
      console.log(`👤 User: ${session.user.Voter_Name} (${session.user.Voter_StudentId})`);
      console.log(`   Login: ${session.loginTime}`);
      console.log(`   Duration: ${duration} seconds (${Math.floor(duration/60)}m ${duration%60}s)`);
      console.log(`   Session ID: ${session.id}`);
      console.log(`   IP: ${session.ipAddress}`);
      console.log('');
    });
    
    if (activeSessions.length === 0) {
      console.log('✅ No active sessions found');
    }
    
  } catch (error) {
    console.error('❌ Error checking active sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveSessions();
