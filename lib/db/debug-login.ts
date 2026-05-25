import { db } from "@workspace/db";
import { adminUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function debugLogin() {
  const email = "admin@blockfit.local";
  const password = "Admin@123456";

  try {
    console.log("🔍 Checking user:", email);
    const users = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    
    if (users.length === 0) {
      console.log("❌ User not found");
      return;
    }

    const user = users[0];
    console.log("✅ User found:", user.email);
    console.log("Status:", user.status);

    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", isValid);

  } catch (error) {
    console.error("Error during debug:", error);
  } finally {
    process.exit(0);
  }
}

debugLogin();
