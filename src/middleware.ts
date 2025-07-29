import { NextResponse, NextRequest } from "next/server";
import getOrCreateDB from "./models/server/dbSetup";
import getOrCreateStorage from "./models/server/storageSetup";
import { useAuthStore } from "./store/Auth";
import loginPage from "./(auth)/login/page";
import registerPage from "./(auth)/register/page";

// this function runs everywhere in the app
export async function middleware(request: NextRequest) {
  await Promise.all([
    getOrCreateDB(), // ensure the database is set up
    getOrCreateStorage(), // ensure the storage is set up
  ]);

  return NextResponse.next(); // move to the next middleware
}

// our middleware part will not run on anything that is in "matcher"
export const config = {
  /* match all req paths except for the one's that start with :
    - api
    - _next/static
    - _next/image
    - favicon.com
 */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",

    // you can add more paths here if needed
    // "/home",etc
  ],
};
