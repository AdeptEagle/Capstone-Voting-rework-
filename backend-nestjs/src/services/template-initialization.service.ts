import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_BALLOT_TEMPLATES } from '../templates/default-templates';

@Injectable()
export class TemplateInitializationService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Add a small delay to ensure database is ready
    setTimeout(async () => {
      await this.ensureTemplatesExist();
    }, 2000);
  }

  private async ensureTemplatesExist() {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`🔍 Checking for ballot templates... (Attempt ${retryCount + 1}/${maxRetries})`);
        
        // Get the first admin to use as creator if templates don't exist
        const admin = await this.prisma.admin.findFirst();
        if (!admin) {
          console.log('⚠️ No admin found, retrying in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
          continue;
        }

        console.log(`👤 Using admin: ${admin.Admin_Username}`);

        // Check if templates already exist
        const existingTemplates = await this.prisma.ballotTemplate.findMany({
          where: {
            id: {
              in: DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
            }
          }
        });

        const existingTemplateIds = existingTemplates.map(t => t.id);
        const missingTemplates = DEFAULT_BALLOT_TEMPLATES.filter(
          template => !existingTemplateIds.includes(template.id)
        );

        console.log(`📊 Found ${existingTemplates.length} existing templates`);
        console.log(`📊 Missing ${missingTemplates.length} templates`);

        if (missingTemplates.length === 0) {
          console.log('✅ All ballot templates are already present');
          return;
        }

        console.log(`📋 Initializing ${missingTemplates.length} missing ballot templates...`);

        // Create missing templates one by one to avoid conflicts
        const createdTemplates = [];
        for (const template of missingTemplates) {
          try {
            console.log(`🔄 Creating template: ${template.name}`);
            const createdTemplate = await this.prisma.ballotTemplate.create({
              data: {
                id: template.id,
                BallotTemplate_Name: template.name,
                BallotTemplate_Description: template.description,
                BallotTemplate_Data: template.data,
                BallotTemplate_IsPublic: template.isPublic,
                BallotTemplate_CreatedBy: admin.id,
              },
            });
            createdTemplates.push(createdTemplate);
            console.log(`✅ Created: ${createdTemplate.BallotTemplate_Name} (${(template.data.positions || []).length} positions)`);
          } catch (error) {
            console.error(`❌ Failed to create template ${template.name}:`, error);
            // Continue with other templates
          }
        }

        console.log(`✅ Successfully initialized ${createdTemplates.length} ballot templates:`);
        createdTemplates.forEach(template => {
          console.log(`   - ${template.BallotTemplate_Name}`);
        });

        // Verify all templates are now present
        const finalCheck = await this.prisma.ballotTemplate.findMany({
          where: {
            id: {
              in: DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
            }
          }
        });

        console.log(`🔍 Final verification: ${finalCheck.length}/${DEFAULT_BALLOT_TEMPLATES.length} templates present`);

        if (finalCheck.length === DEFAULT_BALLOT_TEMPLATES.length) {
          console.log('🎉 All templates are now available!');
          return;
        } else {
          throw new Error(`Only ${finalCheck.length}/${DEFAULT_BALLOT_TEMPLATES.length} templates found`);
        }

      } catch (error) {
        console.error(`❌ Error initializing ballot templates (Attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.error('💥 Failed to initialize templates after maximum retries');
          // Don't throw error to prevent application startup failure
        }
      }
    }
  }
}
