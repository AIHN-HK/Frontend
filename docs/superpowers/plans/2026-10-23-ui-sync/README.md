# AIHN UI Sync — các plan theo commit

Ngày 23/10/2026. Thực thi tuần tự P00 → P18, một commit local mỗi plan. [Hợp đồng chung](CONTRACTS.md). [Plan tổng](/home/hoang/do-an/docs/superpowers/plans/2026-10-23-aihn-ui-sync-ant-design.md).

Giữ v8 + src/modules theo xác nhận user. P00 gồm baseline/tokens/theme; P01 shell/routes; P02 shared visuals; P03–P17 lần lượt 15 màn; P18 nghiệm thu. Chưa push/deploy.

| Plan | Phạm vi | Commit | Trạng thái |
| --- | --- | --- | --- |
| P00 | [Preflight, nhánh riêng và baseline + Tokens, CSS boundary và Ant Design theme](00-tokens-theme.md) | `feat(ui): add AIHN dark tokens and theme boundary` | Completed |
| P01 | [AppHeader, shell và routing thật](01-shell-routing.md) | `feat(ui): add AIHN navigation shell and guarded routes` | Completed |
| P02 | [TimelineSidebar, radar, showcase, bars và assets](02-shared-visuals.md) | `feat(ui): add shared radar showcase and timeline components` | Completed |
| P03 | [AssessmentResult, màn ưu tiên số một](03-assessment-result.md) | `feat(ui): port AssessmentResult page` | Pending |
| P04 | [Dashboard](04-dashboard.md) | `feat(ui): port Dashboard page` | Pending |
| P05 | [Recommendations list](05-recommendations.md) | `feat(ui): port Recommendations page` | Pending |
| P06 | [RecommendationDetail, tách page runtime có context chính xác](06-recommendation-detail.md) | `feat(ui): port RecommendationDetail page` | Pending |
| P07 | [CareerExplorer trên catalog runtime](07-career-explorer.md) | `feat(ui): port CareerExplorer page` | Pending |
| P08 | [CareerDetail trên O*NET career ID](08-career-detail.md) | `feat(ui): port CareerDetail page` | Pending |
| P09 | [Roadmap](09-roadmap.md) | `feat(ui): port Roadmap page` | Pending |
| P10 | [Advisor](10-advisor.md) | `feat(ui): port Advisor page` | Pending |
| P11 | [CareerProfile, giữ avatar và career profile panel](11-career-profile.md) | `feat(ui): port CareerProfile page` | Pending |
| P12 | [History](12-history.md) | `feat(ui): port History page` | Pending |
| P13 | [Settings, dark canvas và chức năng có thật](13-settings.md) | `feat(ui): port Settings page` | Pending |
| P14 | [Login](14-login.md) | `feat(ui): port Login page` | Pending |
| P15 | [Signup](15-signup.md) | `feat(ui): port Signup page` | Pending |
| P16 | [OtpVerify](16-otp-verify.md) | `feat(ui): port OtpVerify page` | Pending |
| P17 | [ForgotPassword + ResetPassword](17-password-recovery.md) | `feat(ui): port ForgotPassword and ResetPassword pages` | Pending |
| P18 | [Nghiệm thu toàn luồng, kiểm tra diff và bàn giao](18-acceptance.md) | `docs(ui): record AIHN UI migration acceptance` | Pending |
