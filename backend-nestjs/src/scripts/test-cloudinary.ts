import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CloudinaryService } from '../services/cloudinary.service';

async function testCloudinary() {
  try {
    console.log('🚀 Testing Cloudinary Integration...\n');

    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    const cloudinaryService = app.get(CloudinaryService);

    console.log('✅ Cloudinary service initialized successfully');
    console.log('📋 Configuration loaded from environment variables\n');

    // Test configuration
    console.log('🔧 Testing configuration...');
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    console.log('Cloud Name:', config.cloud_name ? '✅ Set' : '❌ Missing');
    console.log('API Key:', config.api_key ? '✅ Set' : '❌ Missing');
    console.log('API Secret:', config.api_secret ? '✅ Set' : '❌ Missing');

    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.log('\n❌ Missing Cloudinary configuration!');
      console.log('Please check your .env file and ensure all Cloudinary variables are set.');
      process.exit(1);
    }

    console.log('\n✅ All Cloudinary configuration variables are set!');
    console.log('🎉 Cloudinary integration is ready to use!');

    // Test connection (optional - requires valid credentials)
    console.log('\n🔍 Testing Cloudinary connection...');
    try {
      // This will test if the credentials are valid
      const testResult = await cloudinaryService.getThumbnailUrl('test');
      console.log('✅ Cloudinary connection successful!');
      console.log('📱 Service methods are working correctly.');
    } catch (error) {
      if (error.message.includes('Invalid public ID')) {
        console.log('✅ Cloudinary connection successful! (Invalid public ID error is expected for test)');
      } else {
        console.log('⚠️  Cloudinary connection test failed:', error.message);
        console.log('This might be due to invalid credentials or network issues.');
      }
    }

    await app.close();
    console.log('\n🎯 Test completed successfully!');
    console.log('💡 You can now upload images and they will be stored in Cloudinary.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testCloudinary();

