import { db } from "@workspace/db";

import {
  adminUsers,
  trainers,
  adminUserTrainers
} from "@workspace/db/schema";

import { eq } from "drizzle-orm";

async function run() {

  const [admin] =
    await db
      .select()
      .from(adminUsers)
      .where(
        eq(
          adminUsers.email,
          "admin@blockfit.local"
        )
      )
      .limit(1);

  const [trainer] =
    await db
      .select()
      .from(trainers)
      .where(
        eq(
          trainers.email,
          "roberto@blockfit.local"
        )
      )
      .limit(1);

  console.log(
    "ADMIN:",
    admin?.id
  );

  console.log(
    "TRAINER:",
    trainer?.id
  );

  if (!admin || !trainer) {

    throw new Error(
      "Missing admin or trainer"
    );
  }

  await db
    .insert(
      adminUserTrainers
    )
    .values({
      admin_user_id:
        admin.id,

      trainer_id:
        trainer.id
    });

  console.log(
    "\n✅ LINK CREATED"
  );
}

run()
.then(
  ()=>process.exit(0)
)
.catch(console.error);