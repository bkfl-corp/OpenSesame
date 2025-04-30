"use server";

import { hash } from "bcrypt";
import prisma from "@/lib/prisma";
import { z } from "zod";

const userRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterResult = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  try {
    // Validate input data
    const validatedData = userRegisterSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }

    return {
      success: false,
      message: "Registration failed. Please try again later.",
    };
  }
}
