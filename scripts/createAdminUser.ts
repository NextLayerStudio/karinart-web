import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const username = 'KarinHaizerova';
    const password = 'Fretka007';
    const name = 'Karin';
    
    // Hash both username and password
    const saltRounds = 12;
    const hashedUsername = await bcrypt.hash(username, saltRounds);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Check if admin user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { username: hashedUsername }
    });
    
    if (existingUser) {
      console.log('Admin user already exists. Updating password and name...');
      await prisma.adminUser.update({
        where: { username: hashedUsername },
        data: { 
          password: hashedPassword,
          name: name
        }
      });
      console.log('Admin user updated successfully!');
    } else {
      // Create new admin user
      await prisma.adminUser.create({
        data: {
          username: hashedUsername,
          password: hashedPassword,
          name: name
        }
      });
      console.log('Admin user created successfully!');
    }
    
    console.log('Username:', username);
    console.log('Display Name:', name);
    console.log('Password has been hashed and stored securely.');
    console.log('Both username and password are now hashed in the database.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 