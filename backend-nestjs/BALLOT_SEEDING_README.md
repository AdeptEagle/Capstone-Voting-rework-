# 🎯 Ballot Test Data Seeding

This guide explains how to seed your database with comprehensive test data for testing the ballot creation process.

## 🚀 Quick Start

### Option 1: PowerShell Script (Windows - Recommended)
```powershell
# Navigate to backend directory
cd backend-nestjs

# Run the seeding script
.\seed-ballot-data.ps1
```

### Option 2: NPM Script
```bash
# Navigate to backend directory
cd backend-nestjs

# Run the seeding script
npm run seed:ballot
```

### Option 3: Manual Execution
```bash
# Navigate to backend directory
cd backend-nestjs

# Install dependencies (if not already done)
npm install

# Generate Prisma client (if not already done)
npm run db:generate

# Run the seeding script
npx ts-node src/scripts/seed-ballot-test-data.ts
```

## 📊 What Gets Created

### 🏢 Departments (4)
- **Computer Science** - CS and IT programs
- **Engineering** - Engineering and Technology
- **Business Administration** - Business and Management
- **Arts & Sciences** - Arts, Humanities, and Sciences

### 📚 Courses (6)
- **CS301** - Software Engineering
- **CS302** - Database Systems
- **CS303** - Web Development
- **ENG401** - Mechanical Engineering
- **BUS501** - Business Management
- **ARTS601** - Digital Arts

### 🎯 Positions (6)
- **Student Council President** (Display Order: 1)
- **Vice President** (Display Order: 2)
- **Secretary** (Display Order: 3)
- **Treasurer** (Display Order: 4)
- **Public Relations Officer** (Display Order: 5)
- **Course Representative** (Display Order: 6)

### 👨‍💼 Candidates (12)
- **President**: 3 candidates (Alexandra Santos, Miguel Cruz, Isabella Reyes)
- **Vice President**: 2 candidates (David Kim, Sophia Chen)
- **Secretary**: 1 candidate (Ryan Thompson)
- **Treasurer**: 2 candidates (Emma Wilson, Carlos Rodriguez)
- **PRO**: 1 candidate (Lisa Park)
- **Course Rep**: 2 candidates (James Miller, Nina Patel)

### 🗳️ Test Voters (5)
- Alice Johnson (CS301)
- Bob Smith (CS302)
- Carol Davis (BUS501)
- Daniel Brown (ENG401)
- Eva Garcia (ARTS601)

## 🔑 Test Credentials

### SuperAdmin Access
- **Username**: `superadmin`
- **Password**: `superadmin123`
- **Access**: Full system control

### Voter Access
- **Email**: Any of the voter emails above
- **Password**: `voter123`
- **Access**: Voting interface

## 🎯 Testing the Ballot Creation Process

After seeding, you can test the complete ballot creation workflow:

### 1. **Login as SuperAdmin**
- Go to `/admin-login`
- Use credentials: `superadmin` / `superadmin123`

### 2. **Navigate to Ballot Creation**
- Go to **Ballot Creation** in the sidebar
- Or navigate to `/admin/ballot-creation`

### 3. **Create Ballot Positions**
- Add positions with display order
- Set position descriptions and requirements

### 4. **Assign Candidates**
- Select candidates for each position
- Verify candidate information and photos

### 5. **Test Ballot Display**
- Preview how the ballot will look
- Check position ordering and candidate layout

### 6. **Test Voting Process**
- Login as a voter
- Navigate through the ballot
- Cast votes for different positions

## 🧹 Data Management

### Clear Existing Data (Optional)
If you want to start fresh, uncomment these lines in the seeding script:
```typescript
// console.log('🧹 Clearing existing data...');
// await prisma.candidate.deleteMany();
// await prisma.position.deleteMany();
// await prisma.course.deleteMany();
// await prisma.department.deleteMany();
// await prisma.voter.deleteMany();
```

### Update Existing Data
The script uses `upsert` operations, so it won't create duplicates. You can run it multiple times safely.

## 🚨 Troubleshooting

### Common Issues

#### 1. **"No admin found" Error**
```bash
# Create superadmin first
npm run create:superadmin
```

#### 2. **Prisma Client Not Generated**
```bash
# Generate Prisma client
npm run db:generate
```

#### 3. **Database Connection Issues**
```bash
# Check database connection
npm run db:push
```

#### 4. **TypeScript Compilation Errors**
```bash
# Install ts-node globally
npm install -g ts-node typescript
```

## 📝 Customization

You can modify the seeding script to:
- Add more departments/courses
- Create different position types
- Add more candidates per position
- Customize voter data
- Change display orders

## 🎉 Success Indicators

When seeding is successful, you should see:
- ✅ All departments created
- ✅ All courses created with proper department associations
- ✅ All positions created with display orders
- ✅ All candidates created with proper course and position associations
- ✅ All voters created with hashed passwords
- 🎉 "Ballot Test Data Seeding Complete" message

## 🔄 Re-running the Script

The script is safe to run multiple times:
- Existing data will be updated (not duplicated)
- New data will be created
- Relationships will be maintained

---

**Happy Testing! 🎯🗳️**
