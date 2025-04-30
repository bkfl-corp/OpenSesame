import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by \`useSession\`, \`getSession\` and received as a prop on the \`SessionProvider\` React Context
   */
  interface Session {
    /** The access token from the provider, if persisted. */
    accessToken?: string;
    user: {
      /** The user's database id (or provider id for JWT). */
      id: string;
      /** The user's family id, if they belong to a family. */
      familyId?: string | null;
    } & DefaultSession["user"]; // Keep the default properties
  }

  /**
   * The shape of the user object returned in the OAuth providers' \`profile\` callback,
   * or the second parameter of the \`session\` callback, when using a database.
   * Note: When using JWT strategy, the \`user\` object passed to the \`jwt\` callback
   * has this shape initially, then the token is used.
   */
  interface User extends DefaultUser {
    /** The user's database id. */
    id: string;
    /** The user's family id, if they belong to a family. */
    familyId?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the \`jwt\` callback and \`getToken\`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id?: string;
    /** Custom property to hold access token */
    accessToken?: string;
    /** Custom property to hold picture */
    picture?: string | null;
    /** The user's family id, if they belong to a family */
    familyId?: string | null;
    // Add other properties you want persisted in the token
    // name and email are often already included by default depending on provider scope
  }
}
