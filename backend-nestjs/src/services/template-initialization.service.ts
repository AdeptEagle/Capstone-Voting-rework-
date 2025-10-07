import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_BALLOT_TEMPLATES } from '../templates/default-templates';

@Injectable()
export class TemplateInitializationService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureTemplatesExist();
  }

  private async ensureTemplatesExist() {
    try {
      console.log('🔍 Checking for ballot templates...');
      
      // Get the first admin to use as creator if templates don't exist
      const admin = await this.prisma.admin.findFirst();
      if (!admin) {
        console.log('⚠️ No admin found, skipping template initialization');
        return;
      }

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

      if (missingTemplates.length === 0) {
        console.log('✅ All ballot templates are already present');
        return;
      }

      console.log(`📋 Initializing ${missingTemplates.length} missing ballot templates...`);

      // Create missing templates
      const createdTemplates = await Promise.all(
        missingTemplates.map(template =>
          this.prisma.ballotTemplate.create({
            data: {
              id: template.id,
              BallotTemplate_Name: template.name,
              BallotTemplate_Description: template.description,
              BallotTemplate_Data: template.data,
              BallotTemplate_IsPublic: template.isPublic,
              BallotTemplate_CreatedBy: admin.id,
            },
          })
        )
      );

      console.log(`✅ Successfully initialized ${createdTemplates.length} ballot templates:`);
      createdTemplates.forEach(template => {
        console.log(`   - ${template.BallotTemplate_Name}`);
      });

    } catch (error) {
      console.error('❌ Error initializing ballot templates:', error);
      // Don't throw error to prevent application startup failure
    }
  }
}
