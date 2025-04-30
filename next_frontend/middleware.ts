import { withAuth } from "next-auth/middleware";

// Simple middleware to protect routes
export default withAuth({
  pages: {
    signIn: "/", // Redirect unauthenticated users to the root page
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/setup", "/profile"], // Protect these routes
};
