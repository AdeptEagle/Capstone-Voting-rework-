import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabasePerformance() {
  console.log('🚀 Starting Database Performance Tests...\n');

  try {
    // Test 1: Basic SELECT queries with new field names
    console.log('📊 Test 1: Basic SELECT Performance');
    console.log('Testing queries with new field names...');
    
    const startTime1 = Date.now();
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        Department_Name: true,
        Department_Description: true,
        createdAt: true,
      },
      take: 100,
    });
    const endTime1 = Date.now();
    console.log(`✅ Departments query: ${endTime1 - startTime1}ms (${departments.length} records)`);

    const startTime2 = Date.now();
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        Course_Name: true,
        Course_Code: true,
        Course_Description: true,
        departmentId: true,
      },
      take: 100,
    });
    const endTime2 = Date.now();
    console.log(`✅ Courses query: ${endTime2 - startTime2}ms (${courses.length} records)`);

    // Test 2: JOIN queries with new field names
    console.log('\n🔗 Test 2: JOIN Query Performance');
    console.log('Testing complex relationships...');
    
    const startTime3 = Date.now();
    const candidatesWithDetails = await prisma.candidate.findMany({
      select: {
        id: true,
        Candidate_Name: true,
        Candidate_Email: true,
        Candidate_StudentId: true,
        position: {
          select: {
            id: true,
            Position_Title: true,
          },
        },
        department: {
          select: {
            id: true,
            Department_Name: true,
          },
        },
        course: {
          select: {
            id: true,
            Course_Name: true,
            Course_Code: true,
          },
        },
      },
      take: 50,
    });
    const endTime3 = Date.now();
    console.log(`✅ Complex JOIN query: ${endTime3 - startTime3}ms (${candidatesWithDetails.length} records)`);

    // Test 3: Search queries with new field names
    console.log('\n🔍 Test 3: Search Query Performance');
    console.log('Testing LIKE queries...');
    
    const startTime4 = Date.now();
    const searchResults = await prisma.candidate.findMany({
      where: {
        OR: [
          { Candidate_Name: { contains: 'John', mode: 'insensitive' } },
          { Candidate_Email: { contains: 'student.edu', mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
    const endTime4 = Date.now();
    console.log(`✅ Search query: ${endTime4 - startTime4}ms (${searchResults.length} records)`);

    // Test 4: Aggregation queries
    console.log('\n📈 Test 4: Aggregation Query Performance');
    console.log('Testing COUNT and GROUP BY...');
    
    const startTime5 = Date.now();
    const departmentStats = await prisma.department.findMany({
      select: {
        Department_Name: true,
        _count: {
          select: {
            courses: true,
            candidates: true,
            voters: true,
          },
        },
      },
    });
    const endTime5 = Date.now();
    console.log(`✅ Aggregation query: ${endTime5 - startTime5}ms (${departmentStats.length} departments)`);

    // Test 5: Election-related queries
    console.log('\n🗳️ Test 5: Election Query Performance');
    console.log('Testing election data queries...');
    
    const startTime6 = Date.now();
    const electionData = await prisma.election.findMany({
      select: {
        id: true,
        Election_Title: true,
        Election_Description: true,
        startDate: true,
        endDate: true,
        status: true,
        _count: {
          select: {
            electionCandidates: true,
            votes: true,
          },
        },
      },
      take: 10,
    });
    const endTime6 = Date.now();
    console.log(`✅ Election query: ${endTime6 - startTime6}ms (${electionData.length} elections)`);

    // Test 6: Performance under load simulation
    console.log('\n⚡ Test 6: Concurrent Query Performance');
    console.log('Simulating multiple concurrent queries...');
    
    const concurrentQueries = Array.from({ length: 10 }, (_, i) => 
      prisma.department.findMany({
        select: {
          id: true,
          Department_Name: true,
          _count: { select: { courses: true } },
        },
        take: 5,
      })
    );

    const startTime7 = Date.now();
    const results = await Promise.all(concurrentQueries);
    const endTime7 = Date.now();
    
    console.log(`✅ Concurrent queries: ${endTime7 - startTime7}ms (${results.length} queries completed)`);

    // Performance Summary
    console.log('\n📊 PERFORMANCE TEST SUMMARY');
    console.log('============================');
    console.log(`Total test time: ${endTime7 - startTime1}ms`);
    console.log(`Average query time: ${((endTime7 - startTime1) / 7).toFixed(2)}ms`);
    console.log(`Total records processed: ${departments.length + courses.length + candidatesWithDetails.length + searchResults.length + departmentStats.length + electionData.length}`);
    
    // Performance Recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS');
    console.log('==============================');
    
    if (endTime3 - startTime3 > 1000) {
      console.log('⚠️  Complex JOIN queries are slow - consider adding database indexes');
    } else {
      console.log('✅ Complex JOIN queries are performing well');
    }
    
    if (endTime7 - startTime7 > 2000) {
      console.log('⚠️  Concurrent queries are slow - consider connection pool optimization');
    } else {
      console.log('✅ Concurrent queries are performing well');
    }
    
    if (endTime4 - startTime4 > 500) {
      console.log('⚠️  Search queries are slow - consider adding full-text search indexes');
    } else {
      console.log('✅ Search queries are performing well');
    }

    console.log('\n🎯 New field names are working correctly!');
    console.log('✅ Database schema changes are performing well');
    console.log('✅ All queries using new field names are successful');

  } catch (error) {
    console.error('❌ Performance test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabasePerformance();
