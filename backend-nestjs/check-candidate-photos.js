const fetch = require('node-fetch');

async function checkCandidatePhotos() {
  try {
    console.log('🔍 Checking Candidate Photos...\n');

    // Get all candidates
    const response = await fetch('http://localhost:3001/candidates');
    const candidates = await response.json();

    console.log(`📊 Found ${candidates.length} candidates:\n`);

    let hasPhoto = 0;
    let noPhoto = 0;

    candidates.forEach((candidate, index) => {
      const photoStatus = candidate.photo ? '✅ HAS PHOTO' : '❌ NO PHOTO';
      const photoUrl = candidate.photo || 'None';
      
      console.log(`${index + 1}. ${candidate.name} (${candidate.studentId})`);
      console.log(`   📸 Photo: ${photoStatus}`);
      console.log(`   🔗 URL: ${photoUrl}`);
      console.log(`   🎯 Position: ${candidate.position?.title || 'Unknown'}`);
      console.log(`   🏢 Department: ${candidate.department?.name || 'Unknown'}`);
      console.log('');

      if (candidate.photo) {
        hasPhoto++;
      } else {
        noPhoto++;
      }
    });

    console.log('📈 Summary:');
    console.log(`   ✅ Candidates with photos: ${hasPhoto}`);
    console.log(`   ❌ Candidates without photos: ${noPhoto}`);
    console.log(`   📊 Total candidates: ${candidates.length}`);
    console.log('');

    if (noPhoto > 0) {
      console.log('💡 To add photos to candidates:');
      console.log('   1. Go to Swagger: http://localhost:3001/api');
      console.log('   2. Use POST /candidates with photo upload');
      console.log('   3. Or use PUT /candidates/{id} to update existing candidates');
      console.log('');
    }

    console.log('🎉 Photo check completed!');

  } catch (error) {
    console.error('❌ Error checking candidate photos:', error);
  }
}

checkCandidatePhotos(); 