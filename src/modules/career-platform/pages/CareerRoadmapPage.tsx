import { useEffect, useState } from "react";
import { Link } from "react-router";
import { z } from "zod";
import { useSession } from "@/shared/session/session";
import { Button, Input } from "antd";
import { TimelineSidebar } from "@/shared/ui/ce/TimelineSidebar";
import styles from "./CareerRoadmapPage.module.css";
import { paths } from "@/routes/paths";
import { usePlatformCommand, usePlatformQuery } from "../api/platform.api";
import { gapSchema, goalSchema, profileSchema } from "../model/contracts";
import type { Goal } from "../model/contracts";
import {
  PlatformFrame,
  SourceNote,
  ReadState,
  CommandState,
} from "../components/PlatformUI";
const gapsSchema = z.object({
  careerId: z.string(),
  profileRevision: z.number(),
  sourceVersion: z.string(),
  sourceUrl: z.url(),
  gaps: z.array(gapSchema.extend({ name: z.string() })),
});
const phaseLabels = [
  "Khám phá nghề",
  "Tự đánh giá và thực hành",
  "Dự án minh chứng",
  "Nhận xét và điều chỉnh",
];
export function CareerRoadmapPage() {
  const profile = usePlatformQuery(
      "profile",
      "/api/v1/career/profile",
      profileSchema,
      true,
    ),
    goals = usePlatformQuery(
      "goals",
      "/api/v1/career/goals",
      z.array(goalSchema),
      true,
    ),
    command = usePlatformCommand();
  const target = profile.data?.targetCareerId;
  const gaps = usePlatformQuery(
    "gaps",
    `/api/v1/career/gaps/${encodeURIComponent(target ?? "")}`,
    gapsSchema,
    true,
    Boolean(target),
  );
  return (
    <PlatformFrame title="Lộ trình và tiến độ cá nhân" className={styles.page} animationKey={goals.data?.map(goal => `${goal.id}:${goal.revision}`).join(',') ?? 'loading'} sidebar={<TimelineSidebar steps={[
      {id:'target',title:'Nghề mục tiêu',description:target ?? 'Chọn nghề trong hồ sơ',status:target?'completed':'pending'},
      {id:'profile',title:'Hồ sơ kỹ năng',description:'Tự đánh giá và đọc khoảng cách',status:profile.data?.skills.length?'completed':'pending'},
      {id:'roadmap',title:'Lộ trình',description:'Tiến độ có minh chứng do bạn xác nhận',status:'active'},
    ]}/>}>
      <p>
        Lộ trình được tạo từ nghề mục tiêu và khoảng cách kỹ năng tại thời điểm
        tạo. Tiến độ là việc bạn tự xác nhận có minh chứng, chưa phải chứng nhận
        năng lực.
      </p>
      <SourceNote />
      <ReadState
        pending={profile.isPending || goals.isPending}
        error={profile.isError || goals.isError}
        retry={() => {
          void profile.refetch();
          void goals.refetch();
        }}
      />
      {profile.data && !target && (
        <section className={styles.card}>
          <h2>Chọn nghề mục tiêu trước</h2>
          <p>Cập nhật kỹ năng và chọn nghề trong hồ sơ để tạo lộ trình.</p>
          <Link to={paths.careerProfile}>Mở hồ sơ định hướng</Link>
          <Link to={paths.careers}>Khám phá nghề</Link>
        </section>
      )}
      {target && (
        <section className={styles.card}>
          <h2>Khoảng cách kỹ năng · {target}</h2>
          <ReadState
            pending={gaps.isPending}
            error={gaps.isError}
            retry={() => void gaps.refetch()}
          />
          {gaps.data && (
            <>
              <p>
                Hồ sơ phiên bản {gaps.data.profileRevision} ·{" "}
                {gaps.data.sourceVersion}
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Kỹ năng</th>
                      <th>Tự đánh giá</th>
                      <th>Mức tham khảo</th>
                      <th>Khoảng cách</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gaps.data.gaps.map((g) => (
                      <tr key={g.skillId}>
                        <td>{g.name}</td>
                        <td>{g.current ?? "Chưa biết"}</td>
                        <td>{g.level.toFixed(2)}</td>
                        <td>
                          {g.gap === null
                            ? "Cần tự đánh giá"
                            : g.gap.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link to={paths.careerProfile}>Cập nhật tự đánh giá</Link>
              {goals.data && !goals.data.some((g) => g.careerId === target) && (
                <Button
                  disabled={command.isPending}
                  onClick={() =>
                    command.mutate({
                      method: "post",
                      url: "/api/v1/career/goals",
                      body: { careerId: target },
                      schema: goalSchema,
                    })
                  }
                >
                  Tạo lộ trình từ mục tiêu
                </Button>
              )}
              <CommandState error={command.error} success={command.isSuccess} />
            </>
          )}
        </section>
      )}
      {goals.data?.map((goal) => (
        <GoalCard key={`${goal.id}:${goal.revision}`} goal={goal} />
      ))}
      {goals.isSuccess && !goals.data.length && <p>Chưa có lộ trình đã lưu.</p>}
    </PlatformFrame>
  );
}
function GoalCard({ goal }: { goal: Goal }) {
  const command = usePlatformCommand(),
    complete = goal.tasks.filter((t) => t.done).length;
  return (
    <section className={styles.card}>
      <h2>{goal.title}</h2>
      <p>
        {complete}/{goal.tasks.length} nhiệm vụ hoàn thành · phiên bản{" "}
        {goal.revision}
      </p>
      <progress className={styles.progress}
        value={complete}
        max={goal.tasks.length || 1}
        aria-label={`Tiến độ ${goal.title}`}
      />
      <Button

        disabled={command.isPending}
        onClick={() =>
          command.mutate({
            method: "post",
            url: `/api/v1/career/goals/${goal.id}/regenerate`,
            body: { revision: goal.revision },
            schema: goalSchema,
          })
        }
      >
        Cập nhật lộ trình từ hồ sơ hiện tại
      </Button>
      <p className="platform-evidence">
        Cập nhật sẽ giữ nhiệm vụ đã hoàn thành và nội dung minh chứng. Hoàn
        thành các phase trước để mở phase sau.
      </p>
      <CommandState error={command.error} success={command.isSuccess} />
      {!goal.tasks.length && <p>Chưa có nhiệm vụ trong lộ trình này.</p>}
      <div className={styles.timeline}>{phaseLabels.map((phase, index) => (
        <section key={phase} className={styles.phase} data-ce-enter="" data-phase-state={goal.tasks.filter(t=>t.phase===index).length && goal.tasks.filter(t=>t.phase===index).every(t=>t.done) ? 'done' : goal.tasks.some(t=>t.phase<index&&!t.done) ? 'future' : 'current'}>
          <h3>
            {index + 1}. {phase}
          </h3>
          {goal.tasks
            .filter((t) => t.phase === index)
            .map((task) => (
              <TaskForm key={task.id} task={task} goal={goal} />
            ))}
        </section>
      ))}</div>
    </section>
  );
}
function TaskForm({ task, goal }: { task: Goal["tasks"][number]; goal: Goal }) {
  const current = useSession(),
    command = usePlatformCommand(),
    key = `aihn.career.task.v1.${current.user?.id}.${goal.id}.${task.id}`;
  const [evidence, setEvidence] = useState(() => {
    try {
      return sessionStorage.getItem(key) ?? task.evidence;
    } catch {
      return task.evidence;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(key, evidence);
    } catch {
      /* Keep local text. */
    }
  }, [key, evidence]);
  const blocked = goal.tasks.some((t) => t.phase < task.phase && !t.done);
  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        void command
          .mutateAsync({
            method: "patch",
            url: `/api/v1/career/goals/${goal.id}/tasks/${task.id}`,
            body: { revision: goal.revision, done: !task.done, evidence },
            schema: goalSchema,
          })
          .then(() => {
            try {
              sessionStorage.removeItem(key);
            } catch {
              /* No replay. */
            }
          })
          .catch(() => {});
      }}
    >
      <p>
        {task.done ? "✓ Đã hoàn thành" : "Chưa hoàn thành"} · {task.title}
      </p>
      <label>
        Minh chứng — {task.title}
        <Input.TextArea
          maxLength={1000}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Mô tả việc đã làm hoặc đường dẫn sản phẩm…"
        />
      </label>
      <Button
        htmlType="submit"
        type={task.done ? "default" : "primary"}
        disabled={
          command.isPending || (!task.done && (blocked || !evidence.trim()))
        }
      >
        {task.done ? "Mở lại nhiệm vụ" : "Xác nhận hoàn thành"}
      </Button>
      {blocked && !task.done && <p>Hoàn thành các phase trước.</p>}
      <CommandState error={command.error} success={command.isSuccess} />
    </form>
  );
}
