import { useEffect, useState } from "react";
import { z } from "zod";
import { useSearchParams, Link } from "react-router";
import { useSession } from "@/shared/session/session";
import { Button } from "antd";
import { paths } from "@/routes/paths";
import { usePlatformCommand, usePlatformQuery } from "../api/platform.api";
import { profileSchema, skillSchema, codes } from "../model/contracts";
import type { CareerProfile } from "../model/contracts";
import { CommandState, ReadState } from "./PlatformUI";
export function CareerProfilePanel() {
  const profile = usePlatformQuery(
      "profile",
      "/api/v1/career/profile",
      profileSchema,
      true,
    ),
    skills = usePlatformQuery(
      "skills",
      "/api/v1/careers/skills",
      z.array(skillSchema),
    );
  return (
    <section className="career-platform" aria-label="Kỹ năng và mục tiêu">
      <h2>Điều bạn đang có và muốn thử</h2>
      <p>
        Tự đánh giá từ 0 đến 5: 0 là chưa làm, 5 là tự làm và hướng dẫn được. Chưa rõ thì để trống. Đây là góc nhìn của bạn, chưa phải bài đo năng lực.
      </p>
      <ReadState
        pending={profile.isPending || skills.isPending}
        error={profile.isError || skills.isError}
        retry={() => {
          void profile.refetch();
          void skills.refetch();
        }}
      />
      {profile.data && skills.data && (
        <ProfileForm
          key={`${profile.data.userId}:${profile.data.revision}`}
          saved={profile.data}
          skills={skills.data}
        />
      )}
    </section>
  );
}
function ProfileForm({
  saved,
  skills,
}: {
  saved: CareerProfile;
  skills: { id: string; name: string }[];
}) {
  const current = useSession(),
    [params] = useSearchParams(),
    command = usePlatformCommand();
  const storageKey = `aihn.career.profile.v1.${saved.userId}`;
  const [draft, setDraft] = useState(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = profileSchema.safeParse(JSON.parse(raw));
        if (
          parsed.success &&
          parsed.data.userId === saved.userId &&
          JSON.stringify(parsed.data) !== JSON.stringify(saved)
        )
          return parsed.data;
      }
    } catch {
      /* Keep an editable in-memory draft. */
    }
    const target = params.get("target");
    return {
      ...saved,
      targetCareerId:
        target && /^\d{2}-\d{4}\.\d{2}$/.test(target)
          ? target
          : saved.targetCareerId,
    };
  });
  const [enabled, setEnabled] = useState(draft.interests !== null);
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      /* Saving to the server remains explicit. */
    }
  }, [draft, storageKey]);
  const stale = draft.revision !== saved.revision;
  return (
    <form
      className="platform-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (stale || !current.user || command.isPending) return;
        void command
          .mutateAsync({
            method: "put",
            url: "/api/v1/career/profile",
            body: {
              revision: draft.revision,
              skills: draft.skills,
              interests: enabled ? draft.interests : null,
              targetCareerId: draft.targetCareerId || null,
            },
            schema: profileSchema,
          })
          .then(() => {
            try {
              sessionStorage.removeItem(storageKey);
            } catch {
              /* No automatic replay. */
            }
          })
          .catch(() => {});
      }}
    >
      {stale && (
        <div role="alert">
          <p>
            Hồ sơ đã thay đổi từ lúc tạo bản nháp. Đối chiếu bản đã lưu trước khi lưu tiếp.
          </p>
          <Button  onClick={() => setDraft(saved)}>
            Dùng hồ sơ đã lưu
          </Button>
        </div>
      )}
      {params.get('target') && /^\d{2}-\d{4}\.\d{2}$/.test(params.get('target')!) && params.get('target') !== draft.targetCareerId && <div><p>Bạn vừa chọn nghề {params.get('target')}. Bản nháp hiện tại vẫn được giữ.</p><Button  onClick={()=>setDraft({...draft,targetCareerId:params.get('target')})}>Dùng nghề vừa chọn</Button></div>}
      <label>
        Mã nghề mục tiêu
        <input
          value={draft.targetCareerId ?? ""}
          pattern="[0-9]{2}-[0-9]{4}\.[0-9]{2}"
          placeholder="15-1252.00"
          onChange={(e) =>
            setDraft({ ...draft, targetCareerId: e.target.value || null })
          }
        />
      </label>
      <Link to={paths.careers}>Tìm và chọn nghề</Link>
      <div className="platform-profile-grid">
        {skills.map((skill) => (
          <label key={skill.id}>
            {skill.name}
            <select
              aria-label={`Mức ${skill.name}`}
              value={
                draft.skills.find((s) => s.skillId === skill.id)?.level ?? ""
              }
              onChange={(e) => {
                const remaining = draft.skills.filter(
                  (s) => s.skillId !== skill.id,
                );
                setDraft({
                  ...draft,
                  skills:
                    e.target.value === ""
                      ? remaining
                      : [
                          ...remaining,
                          { skillId: skill.id, level: Number(e.target.value) },
                        ],
                });
              }}
            >
              <option value="">Chưa tự đánh giá</option>
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            setDraft({
              ...draft,
              interests: e.target.checked
                ? (draft.interests ?? { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
                : null,
            });
          }}
        />{" "}
        Mức quan tâm RIASEC (0–5)
      </label>
      {enabled && (
        <div className="platform-profile-grid">
          {codes.map((c) => (
            <label key={c}>
              Quan tâm {c}
              <input
                type="number"
                min="0"
                max="5"
                step="1"
                required
                value={draft.interests?.[c] ?? 0}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    interests: {
                      ...(draft.interests ?? {
                        R: 0,
                        I: 0,
                        A: 0,
                        S: 0,
                        E: 0,
                        C: 0,
                      }),
                      [c]: e.target.valueAsNumber,
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
      )}
      <p className="platform-evidence">
        Phiên bản đã lưu: {saved.revision}. Tuổi, giới tính và địa chỉ không được dùng để xếp hạng nghề.
      </p>
      <Button htmlType="submit" disabled={command.isPending || stale}>
        Lưu kỹ năng và mục tiêu
      </Button>
      <CommandState error={command.error} success={command.isSuccess} />
      <Button  onClick={() => window.location.reload()}>
        Kiểm tra hồ sơ đã lưu
      </Button>
    </form>
  );
}
