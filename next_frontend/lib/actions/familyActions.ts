"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Import from lib/auth instead
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
// Assuming you have authOptions setup for NextAuth.js
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

// Helper function to generate a unique code (keep internal or move to utils)
const generateJoinCode = (length = 6): string => {
  const buffer = randomBytes(Math.ceil(length * 0.75));
  let code = buffer
    .toString("base64")
    .replace(/\+/g, "A")
    .replace(/\//g, "B")
    .substring(0, length)
    .toUpperCase();
  while (code.length < length) {
    code += Math.random().toString(36).substring(2, 3).toUpperCase();
  }
  return code.substring(0, length);
};

// Type for the successful return value
export type CreateFamilyResult =
  | {
      success: true;
      family: {
        id: string;
        name: string;
        joinCode: string;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: Creates a new family for the logged-in user.
 * @param familyName The desired name for the new family.
 * @returns Object indicating success or failure with family data or error message.
 */
export async function createFamily(
  familyName: string
): Promise<CreateFamilyResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (
    !familyName ||
    typeof familyName !== "string" ||
    familyName.trim().length === 0
  ) {
    return { success: false, error: "Family name is required" };
  }

  const userId = session.user.id;
  const name = familyName.trim();

  try {
    // Use a transaction to ensure atomicity
    const newFamily = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. First try to find user by ID
        let existingUser = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, familyId: true },
        });

        // If user not found by ID but we have email in session, try to find by email
        if (!existingUser && session.user.email) {
          console.log(
            `User ID ${userId} not found, looking up by email ${session.user.email}`
          );

          const userByEmail = await tx.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true, familyId: true },
          });

          if (userByEmail) {
            existingUser = userByEmail;

            // Update user ID to match session ID for future lookups
            console.log(
              `Found user by email. Updating ID from ${userByEmail.id} to ${userId}`
            );
            await tx.user.update({
              where: { id: userByEmail.id },
              data: { id: userId },
            });
          }
        }

        // If still no user found, create a new one using session data
        if (!existingUser && session.user.email) {
          console.log(
            `Creating new user with email ${session.user.email} and ID ${userId}`
          );
          existingUser = await tx.user.create({
            data: {
              id: userId,
              email: session.user.email,
              name: session.user.name || "User",
              image: session.user.image,
            },
            select: { id: true, email: true, familyId: true },
          });
        }

        if (!existingUser) {
          console.error(
            `User with ID ${userId} not found in database despite valid session.`
          );
          throw new Error("Authenticated user not found in database.");
        }

        if (existingUser.familyId) {
          throw new Error("User is already in a family.");
        }

        // 2. Generate a unique join code
        let joinCode = "";
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
          joinCode = generateJoinCode();
          const existingFamily = await tx.family.findUnique({
            where: { joinCode }, // Make sure prisma client is updated
          });
          if (!existingFamily) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          console.error(
            "Failed to generate a unique join code after multiple attempts."
          );
          throw new Error("Failed to generate a unique join code.");
        }

        // 3. Create the new family
        const createdFamily = await tx.family.create({
          data: {
            name: name,
            joinCode: joinCode, // Make sure prisma client is updated
            creatorId: userId, // Store the creator's ID
          },
        });

        // 4. Update the user to link them to the new family
        await tx.user.update({
          where: { id: userId },
          data: { familyId: createdFamily.id },
        });

        return createdFamily;
      }
    );

    // Revalidate the dashboard path to reflect the change in family status
    revalidatePath("/dashboard");

    // Return the newly created family data
    return {
      success: true,
      family: {
        id: newFamily.id,
        name: newFamily.name,
        joinCode: newFamily.joinCode, // Return join code upon creation
      },
    };
  } catch (error) {
    console.error("Family creation failed:", error);
    let errorMessage = "Failed to create family. Please try again.";

    if (error instanceof Error) {
      // Keep specific error messages
      if (error.message === "User is already in a family.") {
        errorMessage = error.message;
      }
      if (error.message === "Failed to generate a unique join code.") {
        errorMessage =
          "Could not generate a unique join code. Please try again.";
      }
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action: Fetches the family details for the currently logged-in user.
 * @returns The user's family object {id, name} or null if not in a family or error.
 */
export async function getUserFamily(): Promise<{
  id: string;
  name: string;
} | null> {
  console.log("[getUserFamily Action] Action started."); // Log action start
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error("[getUserFamily Action] Unauthorized access attempt.");
    return null; // Return null or throw error based on how you want to handle unauthorized access server-side
  }

  try {
    const userId = session.user.id;
    console.log(
      `[getUserFamily Action] User ID: ${userId}. Querying database...`
    ); // Log before query

    // First try looking up by ID
    let userWithFamily = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        family: {
          select: {
            id: true,
            name: true,
            // Do NOT include joinCode here for security
          },
        },
      },
    });

    // If not found but we have email, try looking up by email
    if (!userWithFamily && session.user.email) {
      console.log(
        `[getUserFamily Action] User not found by ID, trying email lookup: ${session.user.email}`
      );

      userWithFamily = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          family: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // If found by email, update the ID to match session
      if (userWithFamily) {
        console.log(
          `[getUserFamily Action] User found by email. Updating ID from ${userWithFamily.id} to ${userId}`
        );
        await prisma.user.update({
          where: { id: userWithFamily.id },
          data: { id: userId },
        });
      }
    }

    // If user still not found but we have session data, create the user
    if (!userWithFamily && session.user.email) {
      console.log(
        `[getUserFamily Action] Creating new user with email ${session.user.email}`
      );

      await prisma.user.create({
        data: {
          id: userId,
          email: session.user.email,
          name: session.user.name || "User",
          image: session.user.image,
        },
      });

      userWithFamily = {
        id: userId,
        email: session.user.email,
        family: null,
      };
    }

    console.log("[getUserFamily Action] Prisma query result:", userWithFamily); // Log query result

    if (!userWithFamily) {
      console.error(
        `[getUserFamily Action] User with ID ${userId} not found in database.`
      );
      return null;
    }

    console.log(
      "[getUserFamily Action] Returning family data:",
      userWithFamily.family
    ); // Log before return
    // Return the family object (which will be null if the user has no family)
    return userWithFamily.family;
  } catch (error) {
    console.error(
      "[getUserFamily Action] Failed to fetch user family status:",
      error
    );
    // Decide how to handle errors: return null, throw, or return an error object
    return null;
  }
}

/**
 * Type for join family action result
 */
export type JoinFamilyResult =
  | {
      success: true;
      family: {
        id: string;
        name: string;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: Allows a user to join a family using a join code.
 * @param joinCode The join code of the family to join.
 * @returns Object indicating success or failure with family data or error message.
 */
export async function joinFamily(joinCode: string): Promise<JoinFamilyResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (
    !joinCode ||
    typeof joinCode !== "string" ||
    joinCode.trim().length === 0
  ) {
    return { success: false, error: "Join code is required" };
  }

  const userId = session.user.id;
  const cleanJoinCode = joinCode.trim().toUpperCase();

  try {
    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. First try to find user by ID
        let existingUser = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, familyId: true },
        });

        // If user not found by ID but we have email in session, try to find by email
        if (!existingUser && session.user.email) {
          console.log(
            `User ID ${userId} not found, looking up by email ${session.user.email}`
          );

          const userByEmail = await tx.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true, familyId: true },
          });

          if (userByEmail) {
            existingUser = userByEmail;

            // Update user ID to match session ID for future lookups
            console.log(
              `Found user by email. Updating ID from ${userByEmail.id} to ${userId}`
            );
            await tx.user.update({
              where: { id: userByEmail.id },
              data: { id: userId },
            });
          }
        }

        // If still no user found, create a new one using session data
        if (!existingUser && session.user.email) {
          console.log(
            `Creating new user with email ${session.user.email} and ID ${userId}`
          );
          existingUser = await tx.user.create({
            data: {
              id: userId,
              email: session.user.email,
              name: session.user.name || "User",
              image: session.user.image,
            },
            select: { id: true, email: true, familyId: true },
          });
        }

        if (!existingUser) {
          throw new Error("Authenticated user not found in database.");
        }

        if (existingUser.familyId) {
          throw new Error("User is already in a family.");
        }

        // 2. Find the family with the provided join code
        const targetFamily = await tx.family.findUnique({
          where: { joinCode: cleanJoinCode },
        });

        if (!targetFamily) {
          throw new Error("Invalid join code. Family not found.");
        }

        // 3. Update the user to join the family
        await tx.user.update({
          where: { id: existingUser.id }, // Use existingUser.id which might be different from userId
          data: { familyId: targetFamily.id },
        });

        return targetFamily;
      }
    );

    // Revalidate the dashboard path to reflect the change
    revalidatePath("/dashboard");

    return {
      success: true,
      family: {
        id: result.id,
        name: result.name,
      },
    };
  } catch (error) {
    console.error("Family join failed:", error);
    let errorMessage = "Failed to join family. Please try again.";

    if (error instanceof Error) {
      if (
        error.message === "User is already in a family." ||
        error.message === "Invalid join code. Family not found."
      ) {
        errorMessage = error.message;
      }
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action: Checks if a user is in a family.
 * @returns Boolean indicating if the user is in a family.
 */
export async function userHasFamily(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return false;
  }

  try {
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    return user?.familyId ? true : false;
  } catch (error) {
    console.error("Failed to check if user has family:", error);
    return false;
  }
}

/**
 * Server Action: Retrieves the join code for the user's family.
 * @returns The family join code or null if not found.
 */
export async function getFamilyJoinCode(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  try {
    const userId = session.user.id;

    // First get the user with their family ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      return null;
    }

    // Now get the family join code
    const family = await prisma.family.findUnique({
      where: { id: user.familyId },
      select: { joinCode: true },
    });

    return family?.joinCode || null;
  } catch (error) {
    console.error("Failed to fetch family join code:", error);
    return null;
  }
}

/**
 * Server Action: Retrieves the members of the user's family.
 * @returns Array of family members or null if not found.
 */
export async function getFamilyMembers(): Promise<{
  members: Array<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
  }>;
  creatorId: string | null;
} | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  try {
    const userId = session.user.id;

    // First get the user with their family ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      return null;
    }

    // Get family with members
    const family = await prisma.family.findUnique({
      where: { id: user.familyId },
      select: {
        id: true,
        creatorId: true,
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!family) {
      return null;
    }

    return {
      members: family.members,
      creatorId: family.creatorId,
    };
  } catch (error) {
    console.error("Failed to fetch family members:", error);
    return null;
  }
}
