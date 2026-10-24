import type { Page } from "@playwright/test";
import { adminFixture } from "./admin.fixture";
import type { Goal } from "@/modules/career-platform/model/contracts";
import { resultFixture } from "./result.fixture";
export const sourceCareer = {
  id: "15-1252.00",
  title: "Software Developers",
  description: "Sourced occupation description for this browser fixture.",
  riasec: { R: 3, I: 7, A: 4, S: 2, E: 3, C: 5 },
  sourceVersion: "O*NET 31.0",
  sourceUrl: "https://www.onetonline.org/link/summary/15-1252.00",
  revision: 1,
  active: true,
  skills: [
    {
      skillId: "2.B.3.e",
      importance: 4,
      level: 3.5,
      skill: { id: "2.B.3.e", name: "Programming" },
    },
  ],
};
export async function careerPlatformFixture(
  page: Page,
  options: {
    anonymous?: boolean;
    failSave?: boolean;
    seedProfile?: boolean;
    admin?: boolean;
    failTask?: boolean;
  } = {},
) {
  if (options.admin) await adminFixture(page);
  else if (!options.anonymous) await resultFixture(page);
  const career = structuredClone(sourceCareer);
  const calls: { method: string; path: string; body: unknown }[] = [];
  let profile = {
    userId: 71,
    revision: 0,
    skills: [] as { skillId: string; level: number }[],
    interests: null as null | Record<string, number>,
    targetCareerId: null as null | string,
  };
  if (options.seedProfile)
    profile = {
      ...profile,
      revision: 1,
      targetCareerId: career.id,
      skills: [{ skillId: "2.B.3.e", level: 0 }],
    };
  let run: unknown = null;
  let goals: Goal[] = [];
  await page.route("http://localhost:3000/api/v1/career**", async (route) => {
    const r = route.request(),
      url = new URL(r.url()),
      path = url.pathname,
      method = r.method();
    if (method === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
      });
      return;
    }
    const body = r.postDataJSON();
    calls.push({ method, path, body });
    let data: unknown,
      status = 200;
    if (path === "/api/v1/careers") {
      const items =
        !url.searchParams.get("q") ||
        career.title
          .toLowerCase()
          .includes(url.searchParams.get("q")!.toLowerCase())
          ? [career]
          : [];
      data = {
        items,
        total: items.length,
        page: Number(url.searchParams.get("page") ?? 1),
        limit: 12,
      };
    } else if (path === "/api/v1/careers/skills")
      data = [career.skills[0]!.skill];
    else if (path === "/api/v1/careers/15-1252.00") data = career;
    else if (path === "/api/v1/career/profile") {
      if (method === "PUT") {
        if (options.failSave) {
          await route.fulfill({
            status: 503,
            json: { message: "fixture unavailable" },
          });
          return;
        }
        const input = body as typeof profile;
        if (input.revision !== profile.revision) {
          await route.fulfill({
            status: 409,
            json: { message: "Profile changed" },
          });
          return;
        }
        profile = { ...profile, ...input, revision: profile.revision + 1 };
      }
      data = profile;
    } else if (path === "/api/v1/career/recommendations" && method === "POST") {
      status = 201;
      run = {
        id: "run-fixture-1",
        userId: 71,
        attemptId: 812,
        algorithmVersion: "aihn-hybrid-1.0.0",
        createdAt: "2026-10-19T08:00:00Z",
        input: { profileRevision: profile.revision },
        items: [
          {
            careerId: career.id,
            title: career.title,
            sourceVersion: career.sourceVersion,
            sourceUrl: career.sourceUrl,
            score: 80,
            skillCoverage: 0,
            components: { riasec: 80, skills: null, interests: null },
            contributions: [
              { key: "riasec", value: 80, weight: 1, contribution: 80 },
            ],
            missing: ["skills", "interests"],
            gaps: [
              {
                skillId: "2.B.3.e",
                importance: 4,
                level: 3.5,
                current: null,
                gap: null,
                priority: null,
              },
            ],
          },
        ],
      };
      data = run;
    } else if (path.startsWith("/api/v1/career/recommendations/")) data = run;
    else {
      await route.fallback();
      return;
    }
    await route.fulfill({ status, json: { status, data } });
  });
  await page.route(
    /^http:\/\/localhost:3000\/api\/v1\/(?:career\/(?:goals|gaps|analytics)|admin\/career)/,
    async (route) => {
      const r = route.request(),
        path = new URL(r.url()).pathname,
        method = r.method();
      if (method === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
          },
        });
        return;
      }
      const body = r.postDataJSON() as {
        revision?: number;
        done?: boolean;
        evidence?: string;
        active?: boolean;
      } | null;
      calls.push({ method, path, body });
      let data: unknown,
        status = 200;
      if (path === "/api/v1/career/goals") {
        if (method === "POST") {
          status = 201;
          goals = [
            {
              id: "goal-1",
              careerId: career.id,
              title: career.title,
              revision: 1,
              createdAt: "2026-10-19T08:00:00Z",
              tasks: ["explore", "practice", "project", "review"].map(
                (kind, phase) => ({
                  id: `task-${phase}`,
                  skillId: phase === 1 ? "2.B.3.e" : "",
                  title: `Fixture roadmap ${kind}`,
                  kind,
                  phase,
                  position: phase,
                  done: false,
                  evidence: "",
                }),
              ),
            },
          ];
        }
        data = goals;
        if (method === "POST") data = goals[0];
      } else if (path.includes("/tasks/")) {
        if (options.failTask) {
          await route.fulfill({
            status: 503,
            json: { message: "fixture unavailable" },
          });
          return;
        }
        const goal = goals[0]!,
          task = goal.tasks.find((t) => path.endsWith(t.id))!;
        if (body?.revision !== goal.revision) {
          await route.fulfill({ status: 409, json: { message: "stale goal" } });
          return;
        }
        task.done = Boolean(body.done);
        task.evidence = body.evidence ?? "";
        goal.revision++;
        data = goal;
      } else if (path.endsWith("/regenerate")) {
        goals[0]!.revision++;
        data = goals[0];
        status = 201;
      } else if (path.startsWith("/api/v1/career/gaps/"))
        data = {
          careerId: career.id,
          profileRevision: profile.revision,
          sourceVersion: career.sourceVersion,
          sourceUrl: career.sourceUrl,
          gaps: [
            {
              skillId: "2.B.3.e",
              name: "Programming",
              importance: 4,
              level: 3.5,
              current: 0,
              gap: 3.5,
              priority: 14,
            },
          ],
        };
      else if (path === "/api/v1/career/analytics")
        data = {
          counts: { assessments: 2, chats: 1, runs: run ? 1 : 0 },
          timeline: [
            {
              attemptId: 812,
              finishAt: "2026-10-19T08:00:00Z",
              topCode: "ISC",
              scores: { R: 0, I: 9, A: 2, S: 5, E: 0, C: 3 },
              normalized: { R: 0, I: 50, A: 10, S: 25, E: 0, C: 15 },
            },
            {
              attemptId: 811,
              finishAt: "2026-10-10T08:00:00Z",
              topCode: "ISC",
              scores: { R: 0, I: 8, A: 1, S: 5, E: 0, C: 3 },
              normalized: { R: 0, I: 40, A: 5, S: 25, E: 0, C: 15 },
            },
          ],
          delta: { R: 0, I: 10, A: 5, S: 0, E: 0, C: 0 },
          goals: goals.map((g) => ({
            id: g.id,
            title: g.title,
            total: g.tasks.length,
            completed: g.tasks.filter((t) => t.done).length,
          })),
          timelineLimit: 50,
        };
      else if (path === "/api/v1/admin/career-analytics")
        data = {
          careers: career.active ? 1 : 0,
          skills: 1,
          recommendations: run ? 1 : 0,
          goals: goals.length,
          completedTasks: 0,
          totalTasks: goals.reduce((n, g) => n + g.tasks.length, 0),
          distribution: [{ topCode: "ISC", _count: { _all: 2 } }],
        };
      else if (path === "/api/v1/admin/career-data/skills")
        data = [career.skills[0]!.skill];
      else if (method === "PATCH") {
        career.active = Boolean(body?.active);
        career.revision++;
        data = career;
      } else data = { items: [career], total: 1, page: 1, limit: 12 };
      await route.fulfill({ status, json: { status, data } });
    },
  );
  return { calls, profile: () => profile };
}
