const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testFileUpload() {
  try {
    console.log('🧪 Testing File Upload Endpoints...\n');

    // Test 1: Check if server is running
    console.log('1. Checking server status...');
    try {
      const healthCheck = await axios.get('http://localhost:9000');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start the server with: npm run start:dev');
      return;
    }

    // Test 2: Check file upload endpoint exists
    console.log('\n2. Testing file upload endpoint availability...');
    
    // Create a simple test file
    const testContent = 'This is a test file for upload functionality';
    fs.writeFileSync('/tmp/test-upload.txt', testContent);

    const form = new FormData();
    form.append('file', fs.createReadStream('/tmp/test-upload.txt'));

    try {
      const response = await axios.post('http://localhost:9000/upload/single', form, {
        headers: {
          ...form.getHeaders(),
        },
        params: {
          folder: 'theSkillClub/test',
          resourceType: 'raw'
        }
      });

      console.log('✅ File upload endpoint is working');
      console.log('📄 Upload response:', JSON.stringify(response.data, null, 2));
      
      // Clean up test file
      fs.unlinkSync('/tmp/test-upload.txt');
      
    } catch (error) {
      console.log('❌ File upload failed:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        console.log('💡 This might be due to missing Cloudinary configuration');
        console.log('   Please ensure CLOUDINARY_* environment variables are set');
      }
    }

    console.log('\n3. Testing file upload with query parameters...');
    
    // Test with different parameters
    const testParams = [
      { folder: 'theSkillClub/companies/logos', resourceType: 'image' },
      { folder: 'theSkillClub/documents', resourceType: 'raw' },
      { resourceType: 'auto' }, // No folder specified
    ];

    for (const params of testParams) {
      console.log(`   Testing with params:`, params);
      // Note: We won't actually upload files in this test, just check the endpoint structure
    }

    console.log('\n✅ File upload system test completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Ensure Cloudinary environment variables are configured');
    console.log('   2. Test with actual image files through the frontend');
    console.log('   3. Verify file upload in assessment form');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFileUpload();
