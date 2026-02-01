import { email } from "zod";
import { prisma } from "../../config/prisma.js";
import type { User } from "../../generated/prisma/index.js";

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
  }
}