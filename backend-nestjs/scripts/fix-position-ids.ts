import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPositionIds() {
  console.log('🔧 Starting position ID cleanup...');
  
  try {
    // Get all positions
    const positions = await prisma.position.findMany({
      select: {
        id: true,
        Position_Title: true,
      }
    });

    console.log(`📊 Found ${positions.length} positions`);

    for (const position of positions) {
      const originalId = position.id;
      const trimmedId = originalId.trim();
      
      // Only update if the ID has leading/trailing whitespace
      if (originalId !== trimmedId) {
        console.log(`🔄 Fixing position ID: "${originalId}" -> "${trimmedId}"`);
        
        // Check if trimmed ID already exists
        const existingPosition = await prisma.position.findUnique({
          where: { id: trimmedId }
        });
        
        if (existingPosition) {
          console.log(`⚠️  Position with trimmed ID "${trimmedId}" already exists, skipping...`);
          continue;
        }
        
        // Update the position ID
        await prisma.position.update({
          where: { id: originalId },
          data: { id: trimmedId }
        });
        
        console.log(`✅ Updated position ID: "${originalId}" -> "${trimmedId}"`);
      }
    }
    
    console.log('🎉 Position ID cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during position ID cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPositionIds();
