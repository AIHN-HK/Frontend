import type { Page } from "@playwright/test";
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
  options: { anonymous?: boolean; failSave?: boolean } = {},
) {
  if (!options.anonymous) await resultFixture(page);
  const calls: { method: string; path: string; body: unknown }[] = [];
  let profile = {
    userId: 71,
    revision: 0,
    skills: [] as { skillId: string; level: number }[],
    interests: null as null | Record<string, number>,
    targetCareerId: null as null | string,
  };
  let run: unknown = null;
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
        sourceCareer.title
          .toLowerCase()
          .includes(url.searchParams.get("q")!.toLowerCase())
          ? [sourceCareer]
          : [];
      data = {
        items,
        total: items.length,
        page: Number(url.searchParams.get("page") ?? 1),
        limit: 12,
      };
    } else if (path === "/api/v1/careers/skills")
      data = [sourceCareer.skills[0]!.skill];
    else if (path === "/api/v1/careers/15-1252.00") data = sourceCareer;
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
            careerId: sourceCareer.id,
            title: sourceCareer.title,
            sourceVersion: sourceCareer.sourceVersion,
            sourceUrl: sourceCareer.sourceUrl,
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
  return { calls, profile: () => profile };
}
