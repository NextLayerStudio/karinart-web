import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface DiagnosticResult {
  service: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: DiagnosticResult[] = [];

function addResult(service: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
  results.push({ service, status, message, details });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${service}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

async function checkEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...\n');
  
  const requiredVars = [
    'BLOB_READ_WRITE_TOKEN',
    'DATABASE_URL',
  ];
  
  const optionalVars = [
    'POSTGRES_URL',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE',
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      const masked = varName.includes('TOKEN') || varName.includes('PASSWORD')
        ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
        : value;
      addResult(
        `Env: ${varName}`,
        'pass',
        'Present',
        { masked }
      );
    } else {
      addResult(
        `Env: ${varName}`,
        'fail',
        'Missing - REQUIRED',
        { varName }
      );
      allPresent = false;
    }
  }
  
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      addResult(
        `Env: ${varName}`,
        'pass',
        'Present (optional)'
      );
    } else {
      addResult(
        `Env: ${varName}`,
        'warning',
        'Not set (optional)'
      );
    }
  }
  
  return allPresent;
}

async function checkDatabaseConnection() {
  console.log('\n🗄️  Checking Database Connection...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    addResult('Database', 'pass', 'Connection successful');
    
    // Test query
    try {
      const count = await prisma.flashDesign.count();
      addResult('Database Query', 'pass', 'Query successful', { flashDesignsCount: count });
    } catch (queryError) {
      addResult(
        'Database Query',
        'fail',
        'Query failed',
        { error: queryError instanceof Error ? queryError.message : 'Unknown error' }
      );
    }
    
    return true;
  } catch (error) {
    addResult(
      'Database',
      'fail',
      'Connection failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    return false;
  }
}

async function checkVercelBlob() {
  console.log('\n☁️  Checking Vercel Blob Storage...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    addResult('Vercel Blob', 'fail', 'BLOB_READ_WRITE_TOKEN not set');
    return false;
  }
  
  try {
    // Create a small test image
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
      .webp({ quality: 80 })
      .toBuffer();
    
    addResult('Test Image Creation', 'pass', 'Created test image', { size: testImage.length });
    
    // Try to upload to Vercel Blob
    const testFileName = `test_${Date.now()}_${randomUUID()}.webp`;
    
    try {
      const startTime = Date.now();
      const { url } = await put(testFileName, testImage, {
        contentType: 'image/webp',
        access: 'public',
      });
      const uploadTime = Date.now() - startTime;
      
      addResult(
        'Vercel Blob Upload',
        'pass',
        'Upload successful',
        { url, uploadTime: `${uploadTime}ms` }
      );
      
      // Try to verify the URL is accessible
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          addResult('Vercel Blob Access', 'pass', 'File is accessible', { status: response.status });
        } else {
          addResult(
            'Vercel Blob Access',
            'warning',
            'File upload succeeded but may not be accessible',
            { status: response.status }
          );
        }
      } catch (fetchError) {
        addResult(
          'Vercel Blob Access',
          'warning',
          'Could not verify file accessibility',
          { error: fetchError instanceof Error ? fetchError.message : 'Unknown error' }
        );
      }
      
      return true;
    } catch (uploadError) {
      addResult(
        'Vercel Blob Upload',
        'fail',
        'Upload failed',
        { error: uploadError instanceof Error ? uploadError.message : 'Unknown error' }
      );
      return false;
    }
  } catch (imageError) {
    addResult(
      'Test Image Creation',
      'fail',
      'Failed to create test image',
      { error: imageError instanceof Error ? imageError.message : 'Unknown error' }
    );
    return false;
  }
}

async function checkSharp() {
  console.log('\n🖼️  Checking Sharp (Image Processing)...\n');
  
  try {
    const testImage = await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 3,
        background: { r: 0, g: 255, b: 0 }
      }
    })
      .webp({ quality: 80 })
      .toBuffer();
    
    if (Buffer.isBuffer(testImage) && testImage.length > 0) {
      addResult('Sharp', 'pass', 'Image processing working', { outputSize: testImage.length });
      return true;
    } else {
      addResult('Sharp', 'fail', 'Image processing returned invalid buffer');
      return false;
    }
  } catch (error) {
    addResult(
      'Sharp',
      'fail',
      'Image processing failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    return false;
  }
}

async function checkFlashDesignTable() {
  console.log('\n📊 Checking FlashDesign Table...\n');
  
  try {
    // Check if table exists and is accessible
    const designs = await prisma.flashDesign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    const totalCount = await prisma.flashDesign.count();
    
    addResult(
      'FlashDesign Table',
      'pass',
      'Table accessible',
      { totalCount, recentDesigns: designs.length }
    );
    
    // Check schema
    if (designs.length > 0) {
      const sample = designs[0];
      const hasRequiredFields = 
        'id' in sample &&
        'imageUrl' in sample &&
        'title' in sample &&
        'price' in sample &&
        'reserved' in sample;
      
      if (hasRequiredFields) {
        addResult('FlashDesign Schema', 'pass', 'All required fields present');
      } else {
        addResult('FlashDesign Schema', 'warning', 'Some fields may be missing');
      }
    }
    
    return true;
  } catch (error) {
    addResult(
      'FlashDesign Table',
      'fail',
      'Table access failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    return false;
  }
}

async function runDiagnostics() {
  console.log('🔍 Starting Service Diagnostics...\n');
  console.log('=' .repeat(60));
  
  const envCheck = await checkEnvironmentVariables();
  const dbCheck = await checkDatabaseConnection();
  const sharpCheck = await checkSharp();
  const blobCheck = await checkVercelBlob();
  const tableCheck = await checkFlashDesignTable();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  
  if (failed === 0) {
    console.log('\n🎉 All critical services are operational!');
  } else {
    console.log('\n⚠️  Some services are not working correctly. Please check the errors above.');
  }
  
  // Critical checks
  console.log('\n🔑 Critical Service Status:');
  console.log(`   Environment Variables: ${envCheck ? '✅' : '❌'}`);
  console.log(`   Database Connection: ${dbCheck ? '✅' : '❌'}`);
  console.log(`   Image Processing: ${sharpCheck ? '✅' : '❌'}`);
  console.log(`   Vercel Blob: ${blobCheck ? '✅' : '❌'}`);
  console.log(`   FlashDesign Table: ${tableCheck ? '✅' : '❌'}`);
  
  const allCriticalPassed = envCheck && dbCheck && sharpCheck && blobCheck && tableCheck;
  
  if (!allCriticalPassed) {
    console.log('\n❌ Some critical services are failing. Upload functionality may not work.');
    process.exit(1);
  } else {
    console.log('\n✅ All critical services are operational!');
    process.exit(0);
  }
}

// Run diagnostics
runDiagnostics()
  .catch((error) => {
    console.error('\n💥 Fatal error during diagnostics:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


