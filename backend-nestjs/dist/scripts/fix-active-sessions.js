"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fixActiveSessions() {
    try {
        console.log('🔍 Finding users with multiple active sessions...');
        const usersWithMultipleSessions = await prisma.userLoginLog.groupBy({
            by: ['userId'],
            where: {
                isActive: true,
            },
            _count: {
                id: true,
            },
            having: {
                id: {
                    _count: {
                        gt: 1,
                    },
                },
            },
        });
        console.log(`📊 Found ${usersWithMultipleSessions.length} users with multiple active sessions`);
        for (const user of usersWithMultipleSessions) {
            console.log(`\n🔧 Fixing user ${user.userId}...`);
            const activeSessions = await prisma.userLoginLog.findMany({
                where: {
                    userId: user.userId,
                    isActive: true,
                },
                orderBy: {
                    loginTime: 'desc',
                },
            });
            console.log(`   Found ${activeSessions.length} active sessions`);
            if (activeSessions.length > 1) {
                const mostRecent = activeSessions[0];
                const olderSessions = activeSessions.slice(1);
                console.log(`   Keeping session ${mostRecent.id} active (most recent)`);
                for (const session of olderSessions) {
                    const logoutTime = new Date();
                    const duration = Math.floor((logoutTime.getTime() - session.loginTime.getTime()) / 1000);
                    await prisma.userLoginLog.update({
                        where: { id: session.id },
                        data: {
                            logoutTime: logoutTime,
                            duration: duration,
                            isActive: false,
                        },
                    });
                    console.log(`   ✅ Marked session ${session.id} as inactive (duration: ${duration}s)`);
                }
            }
        }
        console.log('\n✅ Cleanup completed!');
        const finalActiveSessions = await prisma.userLoginLog.count({
            where: { isActive: true },
        });
        console.log(`📊 Final active sessions: ${finalActiveSessions}`);
    }
    catch (error) {
        console.error('❌ Error fixing active sessions:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
fixActiveSessions();
//# sourceMappingURL=fix-active-sessions.js.map