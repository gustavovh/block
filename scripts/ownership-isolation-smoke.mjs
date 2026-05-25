import { execSync } from "node:child_process";

const base = process.env.API_BASE_URL || "http://localhost:3001/api";
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/blockfit";

async function call(method, path, token, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return {
    status: response.status,
    json,
  };
}

function tokenFrom(json) {
  return json?.data?.access_token || json?.data?.accessToken || null;
}

function print(key, value) {
  process.stdout.write(`${key}=${value}\n`);
}

async function main() {
  const runTag = Date.now().toString();

  const coachA = await call("POST", "/admin/auth/login", null, {
    email: "admin@blockfit.local",
    password: "Admin@123456",
  });
  const coachAToken = tokenFrom(coachA.json);

  const coachBEmail = `coachb.${runTag}@blockfit.local`;
  const coachBPass = "CoachB@123456";

  const createCoachB = await call("POST", "/admin/users", coachAToken, {
    email: coachBEmail,
    name: "Coach B",
    role: "super_admin",
    password: coachBPass,
  });

  execSync("pnpm -F @workspace/db harden:coach-ownership", {
    stdio: "pipe",
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });

  const coachB = await call("POST", "/admin/auth/login", null, {
    email: coachBEmail,
    password: coachBPass,
  });
  const coachBToken = tokenFrom(coachB.json);

  const athleteBEmail = `athlete.b.${runTag}@blockfit.local`;
  const athleteBPass = "AthleteB@123456";

  const createAthleteB = await call("POST", "/admin/gym/athletes", coachBToken, {
    email: athleteBEmail,
    password: athleteBPass,
    name: "Athlete B",
  });

  const coachBList = await call("GET", "/admin/gym/athletes", coachBToken);
  const athleteB = (coachBList.json?.data || []).find((a) => a.email === athleteBEmail);
  const athleteBId = athleteB?.id || "";

  const aReadAthleteB = await call("GET", `/admin/gym/athletes/${athleteBId}`, coachAToken);
  const aReadRoutinesB = await call(
    "GET",
    `/admin/gym/athletes/${athleteBId}/routines`,
    coachAToken
  );
  const aReadObsB = await call(
    "GET",
    `/admin/gym/athletes/${athleteBId}/observations`,
    coachAToken
  );

  const aMutateObsB = await call(
    "POST",
    `/admin/gym/athletes/${athleteBId}/observations`,
    coachAToken,
    { type: "Nota", content: "cross coach forbidden test" }
  );

  const aMutateRoutineB = await call(
    "POST",
    `/admin/gym/athletes/${athleteBId}/routines`,
    coachAToken,
    {
      name: "Cross blocked",
      day_of_week: 2,
      exercises: [
        {
          exercise_id: "00000000-0000-0000-0000-000000000000",
          sets: 3,
          reps: "12",
        },
      ],
    }
  );

  const aMutateMeasB = await call(
    "POST",
    `/admin/gym/athletes/${athleteBId}/measurements`,
    coachAToken,
    {
      weight_kg: "80.00",
      body_fat_pct: "17.00",
      notes: "cross coach forbidden test",
    }
  );

  const bReadOwnAthlete = await call("GET", `/admin/gym/athletes/${athleteBId}`, coachBToken);
  const bDashboard = await call("GET", "/admin/gym/coach/dashboard", coachBToken);
  const bMutateOwnObs = await call(
    "POST",
    `/admin/gym/athletes/${athleteBId}/observations`,
    coachBToken,
    { type: "Progreso", content: "valid coach b note" }
  );
  const bReadOwnObs = await call(
    "GET",
    `/admin/gym/athletes/${athleteBId}/observations`,
    coachBToken
  );

  const coachAList = await call("GET", "/admin/gym/athletes", coachAToken);
  const coachADashboard = await call("GET", "/admin/gym/coach/dashboard", coachAToken);
  const aListContainsBAthlete = (coachAList.json?.data || []).some(
    (a) => a.email === athleteBEmail
  );
  const aDashboardContainsBAthlete = (coachADashboard.json?.data?.attention_required || []).some(
    (a) => a.id === athleteBId
  );

  const athleteA = await call("POST", "/atleta/auth/login", null, {
    email: "alejandro@blockfit.local",
    password: "atleta123",
  });
  const athleteAToken = tokenFrom(athleteA.json);

  const athleteAReadProfileB = await call(
    "GET",
    `/atleta/profile/${athleteBId}`,
    athleteAToken
  );
  const athleteALegacyRoutinesById = await call(
    "GET",
    `/atleta/routines/${athleteBId}`,
    athleteAToken
  );
  const athleteAReadRoutinesB = await call("GET", "/atleta/routines", athleteAToken);

  const athleteBLogin = await call("POST", "/atleta/auth/login", null, {
    email: athleteBEmail,
    password: athleteBPass,
  });
  const athleteBToken = tokenFrom(athleteBLogin.json);
  const athleteBMe = await call("GET", "/atleta/me", athleteBToken);
  const athleteBProgress = await call("GET", "/atleta/progress", athleteBToken);

  print("COACH_A_LOGIN_STATUS", coachA.status);
  print("COACH_B_CREATE_STATUS", createCoachB.status);
  print("COACH_B_LOGIN_STATUS", coachB.status);
  print("COACH_B_ATHLETE_CREATE_STATUS", createAthleteB.status);
  print("COACH_B_EMAIL", coachBEmail);
  print("COACH_B_ATHLETE_EMAIL", athleteBEmail);
  print("COACH_B_ATHLETE_ID", athleteBId);

  print("A_READ_ATHLETE_B_STATUS", aReadAthleteB.status);
  print("A_READ_ROUTINES_B_STATUS", aReadRoutinesB.status);
  print("A_READ_OBS_B_STATUS", aReadObsB.status);
  print("A_MUTATE_OBS_B_STATUS", aMutateObsB.status);
  print("A_MUTATE_ROUTINE_B_STATUS", aMutateRoutineB.status);
  print("A_MUTATE_MEAS_B_STATUS", aMutateMeasB.status);

  print("B_READ_OWN_ATHLETE_STATUS", bReadOwnAthlete.status);
  print("B_DASHBOARD_STATUS", bDashboard.status);
  print("B_MUTATE_OWN_OBS_STATUS", bMutateOwnObs.status);
  print("B_READ_OWN_OBS_STATUS", bReadOwnObs.status);

  print("A_LIST_CONTAINS_B_ATHLETE", aListContainsBAthlete);
  print("A_DASHBOARD_CONTAINS_B_ATHLETE", aDashboardContainsBAthlete);

  print("ATHLETE_A_READ_PROFILE_B_STATUS", athleteAReadProfileB.status);
  print("ATHLETE_A_LEGACY_ROUTINES_BY_ID_STATUS", athleteALegacyRoutinesById.status);
  print("ATHLETE_A_READ_ROUTINES_B_STATUS", athleteAReadRoutinesB.status);
  print("ATHLETE_B_ME_STATUS", athleteBMe.status);
  print("ATHLETE_B_PROGRESS_STATUS", athleteBProgress.status);
}

main().catch((error) => {
  console.error("ownership-isolation-smoke failed:", error);
  process.exit(1);
});
