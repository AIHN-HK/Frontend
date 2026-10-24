import { useState } from "react";
import { z } from "zod";
import { Button } from "@/shared/ui/Button";
import { usePlatformCommand, usePlatformQuery } from "../api/platform.api";
import { careerSchema, catalogSchema, skillSchema } from "../model/contracts";
import {
  PlatformFrame,
  SourceNote,
  ReadState,
  CommandState,
} from "../components/PlatformUI";
const statistics = z.object({
  careers: z.number(),
  skills: z.number(),
  recommendations: z.number(),
  goals: z.number(),
  completedTasks: z.number(),
  totalTasks: z.number(),
  distribution: z.array(
    z.object({ topCode: z.string(), _count: z.object({ _all: z.number() }) }),
  ),
});
export function AdminCareerDataPage() {
  const [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    command = usePlatformCommand();
  const data = usePlatformQuery(
      "admin-data",
      `/api/v1/admin/career-data?q=${encodeURIComponent(q)}&page=${page}&limit=12`,
      catalogSchema,
      true,
    ),
    stats = usePlatformQuery(
      "admin-analytics",
      "/api/v1/admin/career-analytics",
      statistics,
      true,
    ),
    skills = usePlatformQuery(
      "admin-skills",
      "/api/v1/admin/career-data/skills",
      z.array(skillSchema),
      true,
    );
  return (
    <PlatformFrame title="Dữ liệu nghề và phân tích hệ thống">
      <SourceNote />
      <ReadState
        pending={data.isPending}
        error={data.isError}
        retry={() => void data.refetch()}
      />
      {stats.data && (
        <section className="platform-card">
          <h2>Số liệu tổng hợp</h2>
          <p>
            {stats.data.careers} nghề đang xuất bản · {stats.data.skills} kỹ
            năng · {stats.data.recommendations} bản gợi ý · {stats.data.goals}{" "}
            mục tiêu
          </p>
          <p>
            Nhiệm vụ tự báo cáo hoàn thành: {stats.data.completedTasks}/
            {stats.data.totalTasks}
          </p>
          <h3>Phân bố mã Holland của các kết quả</h3>
          <ul>
            {stats.data.distribution.map((d) => (
              <li key={d.topCode}>
                {d.topCode}: {d._count._all}
              </li>
            ))}
          </ul>
        </section>
      )}
      <ReadState
        pending={stats.isPending}
        error={stats.isError}
        retry={() => void stats.refetch()}
      />
      <form
        className="platform-controls"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(String(new FormData(e.currentTarget).get("q") ?? ""));
          setPage(1);
        }}
      >
        <label>
          Tìm nghề để quản lý
          <input name="q" maxLength={120} />
        </label>
        <Button type="submit">Tìm kiếm</Button>
      </form>
      <CommandState error={command.error} success={command.isSuccess} />
      {data.data && (
        <>
          <p>
            {data.data.total} bản ghi · trang {page}
          </p>
          <div className="platform-grid">
            {data.data.items.map((c) => (
              <article className="platform-card" key={c.id}>
                <h2>{c.title}</h2>
                <p>
                  {c.id} · {c.sourceVersion} · phiên bản {c.revision}
                </p>
                <p>{c.active ? "Đang xuất bản" : "Đã ẩn khỏi gợi ý mới"}</p>
                <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                  Kiểm tra nguồn nghề
                </a>
                <Button
                  variant="secondary"
                  disabled={command.isPending}
                  onClick={() =>
                    command.mutate({
                      method: "patch",
                      url: `/api/v1/admin/career-data/${c.id}`,
                      body: { revision: c.revision, active: !c.active },
                      schema: careerSchema,
                    })
                  }
                >
                  {c.active ? "Ẩn nghề" : "Xuất bản nghề"}
                </Button>
                <details>
                  <summary>Kỹ năng và yêu cầu</summary>
                  <ul>
                    {c.skills.map((s) => (
                      <li key={s.skillId}>
                        {s.skill.name}: {s.level.toFixed(2)}/5 · tầm quan trọng{" "}
                        {s.importance.toFixed(2)}/5
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
          </div>
          <nav
            className="platform-controls"
            aria-label="Phân trang dữ liệu nghề"
          >
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trang trước
            </Button>
            <Button
              variant="secondary"
              disabled={page * 12 >= data.data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </Button>
          </nav>
        </>
      )}
      <section className="platform-card">
        <h2>Từ điển kỹ năng nguồn</h2>
        <ReadState
          pending={skills.isPending}
          error={skills.isError}
          retry={() => void skills.refetch()}
        />
        <ul>
          {skills.data?.map((s) => (
            <li key={s.id}>
              {s.id}: {s.name}
            </li>
          ))}
        </ul>
        <p>
          Thông số nghề/kỹ năng được nhập từ dataset có checksum bằng CLI, không
          sửa số liệu nguồn trực tiếp trên UI. Thao tác xuất bản/ẩn ghi audit và
          giữ nguyên các bản gợi ý cũ.
        </p>
      </section>
    </PlatformFrame>
  );
}
