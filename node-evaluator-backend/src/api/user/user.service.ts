import { email } from "zod";
import { prisma } from "../../config/prisma.js";
import type { User, BlacklistedToken } from "../../generated/prisma/index.js"; 

export const UserDAO = {
  // Create a new user
  async createUser(data: any) {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password
      }
    })
  },

  // READ
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  // UPDATE
  async updateUserName(id: string, newName: string) {
    return await prisma.user.update({
      where: { id },
      data: { name: newName }
    });
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: {id:id},
      select: {id: true, name: true, email: true, createdAt: true} // Never return password
    })
  },

  async blacklistToken(token: string, exp:number) {
    return await prisma.blacklistedToken.create({
      data: { token: token, expiresAt: new Date(exp * 1000) }
    });
  },

  async findTokenB(token:string){
    return await prisma.blacklistedToken.findUnique({
      where: { token }
    });
  }

}