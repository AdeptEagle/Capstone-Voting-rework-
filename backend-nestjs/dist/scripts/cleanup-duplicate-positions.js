"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function cleanupDuplicatePositions() {
    try {
        console.log('🧹 Cleaning up duplicate positions...\n');
        const positions = await prisma.position.findMany({
            include: {
                _count: {
                    select: {
                        candidates: true,
                        ballotPositions: true
                    }
                }
            },
            orderBy: {
                displayOrder: 'asc'
            }
        });
        console.log(`📊 Total positions found: ${positions.length}`);
        const positionGroups = new Map();
        positions.forEach(position => {
            const key = `${position.Position_Title}-${position.voteLimit}`;
            if (!positionGroups.has(key)) {
                positionGroups.set(key, []);
            }
            positionGroups.get(key).push(position);
        });
        console.log(`📊 Unique position groups: ${positionGroups.size}`);
        const duplicates = Array.from(positionGroups.entries())
            .filter(([key, positions]) => positions.length > 1);
        console.log(`🔍 Found ${duplicates.length} duplicate groups`);
        if (duplicates.length === 0) {
            console.log('✅ No duplicates found!');
            return;
        }
        for (const [key, duplicatePositions] of duplicates) {
            console.log(`\n🔍 Processing duplicates for: ${key}`);
            console.log(`   Found ${duplicatePositions.length} duplicates`);
            const sortedPositions = duplicatePositions.sort((a, b) => {
                const aUsage = a._count.candidates + a._count.ballotPositions;
                const bUsage = b._count.candidates + b._count.ballotPositions;
                if (aUsage !== bUsage) {
                    return bUsage - aUsage;
                }
                return a.displayOrder - b.displayOrder;
            });
            const keepPosition = sortedPositions[0];
            const deletePositions = sortedPositions.slice(1);
            console.log(`   ✅ Keeping: ${keepPosition.Position_Title} (ID: ${keepPosition.id})`);
            console.log(`      Usage: ${keepPosition._count.candidates} candidates, ${keepPosition._count.ballotPositions} ballots`);
            for (const deletePosition of deletePositions) {
                console.log(`   🔄 Migrating from: ${deletePosition.Position_Title} (ID: ${deletePosition.id})`);
                console.log(`      Usage: ${deletePosition._count.candidates} candidates, ${deletePosition._count.ballotPositions} ballots`);
                const ballotPositions = await prisma.ballotPosition.findMany({
                    where: { BallotPosition_PositionId: deletePosition.id }
                });
                console.log(`      Found ${ballotPositions.length} ballot positions to migrate`);
                for (const ballotPosition of ballotPositions) {
                    await prisma.ballotPosition.update({
                        where: { id: ballotPosition.id },
                        data: { BallotPosition_PositionId: keepPosition.id }
                    });
                }
                const candidates = await prisma.candidate.findMany({
                    where: { positionId: deletePosition.id }
                });
                console.log(`      Found ${candidates.length} candidates to migrate`);
                for (const candidate of candidates) {
                    await prisma.candidate.update({
                        where: { id: candidate.id },
                        data: { positionId: keepPosition.id }
                    });
                }
                await prisma.position.delete({
                    where: { id: deletePosition.id }
                });
                console.log(`      ✅ Migrated and deleted duplicate position`);
            }
        }
        console.log('\n✅ Duplicate cleanup completed!');
        const finalPositions = await prisma.position.findMany({
            select: {
                id: true,
                Position_Title: true,
                voteLimit: true,
                _count: {
                    select: {
                        candidates: true,
                        ballotPositions: true
                    }
                }
            },
            orderBy: {
                displayOrder: 'asc'
            }
        });
        console.log(`📊 Final position count: ${finalPositions.length}`);
        console.log('📝 Final positions:');
        finalPositions.forEach((pos, index) => {
            console.log(`   ${index + 1}. ${pos.Position_Title} (Vote Limit: ${pos.voteLimit}, Candidates: ${pos._count.candidates}, Ballots: ${pos._count.ballotPositions})`);
        });
    }
    catch (error) {
        console.error('❌ Error cleaning up duplicate positions:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
cleanupDuplicatePositions()
    .then(() => {
    console.log('\n✅ Duplicate position cleanup completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Duplicate position cleanup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=cleanup-duplicate-positions.js.map