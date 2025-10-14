"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
async function seedTemplates() {
    try {
        console.log('🧩 Upserting default ballot templates...');
        const admin = await prisma.admin.findFirst();
        if (!admin) {
            throw new Error('No admin found. Run the main seed or start the app to create an admin first.');
        }
        const results = [];
        for (const tpl of default_templates_1.DEFAULT_BALLOT_TEMPLATES) {
            await prisma.ballotTemplate.upsert({
                where: { id: tpl.id },
                update: {
                    BallotTemplate_Name: tpl.name,
                    BallotTemplate_Description: tpl.description,
                    BallotTemplate_Data: tpl.data,
                    BallotTemplate_IsPublic: tpl.isPublic,
                    BallotTemplate_CreatedBy: admin.id,
                },
                create: {
                    id: tpl.id,
                    BallotTemplate_Name: tpl.name,
                    BallotTemplate_Description: tpl.description,
                    BallotTemplate_Data: tpl.data,
                    BallotTemplate_IsPublic: tpl.isPublic,
                    BallotTemplate_CreatedBy: admin.id,
                },
            });
            results.push(tpl.name);
        }
        console.log(`✅ Templates ensured: ${results.length}`);
        results.forEach(n => console.log(`   - ${n}`));
    }
    catch (error) {
        console.error('❌ Template seeding failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedTemplates()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
//# sourceMappingURL=seed-templates.js.map