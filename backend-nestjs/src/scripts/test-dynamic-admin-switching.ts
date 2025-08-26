import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDynamicAdminSwitching() {
  try {
    console.log('🧪 Testing Dynamic Admin ID Switching...\n');

    // First, let's see all superadmins
    const allSuperadmins = await prisma.admin.findMany({
      where: { role: 'SUPERADMIN' },
      select: { id: true, Admin_Username: true, Admin_Email: true, role: true }
    });

    console.log('📋 Current Superadmins:');
    allSuperadmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.id} - ${admin.Admin_Username} (${admin.role})`);
    });

    // Simulate what our controllers do - find first superadmin
    const firstSuperadmin = await prisma.admin.findFirst({
      where: { role: 'SUPERADMIN' },
      select: { id: true, Admin_Username: true, role: true }
    });

    console.log(`\n🔍 Current 'findFirst' Result: ${firstSuperadmin?.id} (${firstSuperadmin?.Admin_Username})`);

    // Now let's temporarily "disable" the first superadmin by updating their role
    if (firstSuperadmin && firstSuperadmin.id === 'NSGL-Z0BB2') {
      console.log('\n🔄 Temporarily changing first superadmin role to test switching...');
      
      await prisma.admin.update({
        where: { id: 'NSGL-Z0BB2' },
        data: { role: 'ADMIN' }
      });

      console.log('✅ Changed NSGL-Z0BB2 role to ADMIN');

      // Now test what happens when we find first superadmin
      const newFirstSuperadmin = await prisma.admin.findFirst({
        where: { role: 'SUPERADMIN' },
        select: { id: true, Admin_Username: true, role: true }
      });

      console.log(`🔍 New 'findFirst' Result: ${newFirstSuperadmin?.id} (${newFirstSuperadmin?.Admin_Username})`);

      if (newFirstSuperadmin?.id === 'DEV_SP') {
        console.log('🎉 SUCCESS! System automatically switched to DEV_SP superadmin!');
      }

      // Restore the original role
      console.log('\n🔄 Restoring original role...');
      await prisma.admin.update({
        where: { id: 'NSGL-Z0BB2' },
        data: { role: 'SUPERADMIN' }
      });
      console.log('✅ Restored NSGL-Z0BB2 role to SUPERADMIN');

    } else {
      console.log('⚠️ Expected superadmin not found for testing');
    }

  } catch (error) {
    console.error('❌ Error testing dynamic admin switching:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDynamicAdminSwitching();
