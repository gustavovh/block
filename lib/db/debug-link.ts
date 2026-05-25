import { db } from "@workspace/db";

import {
  adminUsers,
  trainers,
  adminUserTrainers
} from "@workspace/db/schema";

async function run() {

  const admins =
    await db
      .select()
      .from(adminUsers);

  console.log(
    "\nADMINS\n",
    admins
  );

  const coachs =
    await db
      .select()
      .from(trainers);

  console.log(
    "\nTRAINERS\n",
    coachs
  );

  const links =
    await db
      .select()
      .from(adminUserTrainers);

  console.log(
    "\nLINKS\n",
    links
  );
}

run()
.then(() => process.exit(0))
.catch(console.error);