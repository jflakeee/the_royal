# P1-22 통합 회귀 검증 현황 (2026-11-20)

## 범위
- Node 단위 테스트: `node --test tests/*.test.cjs`
- Playwright 브라우저: `browser-save-p0.spec.cjs`, `browser-perf.spec.cjs`, `browser-autoplay.spec.cjs`, `browser-migration.spec.cjs`
- GitHub Actions: `.github/workflows/p0-regression.yml` (push, PR, workflow_dispatch)

## 정적 확인
- CI 워크플로에 위 4개 Playwright 스펙이 포함되어 있음.
- 저장 권한 대기 조건을 자동 플레이/이주/성능 테스트에 추가.
- 이주 경로는 수동 이주와 타이머 이주 모두 `Core.inheritLegacy` 호출.
- 테스트가 검증하는 것은 제한된 시나리오이며 실제 장시간 실기기 안정성을 보증하지 않음.

## 실행 결과 구분
| 항목 | 상태 |
| --- | --- |
| 테스트 코드 작성 | 완료 |
| Git 커밋 | 완료 |
| Node 단위 테스트 실제 실행 | 미확인 |
| Playwright 실제 실행 | 미확인 |
| GitHub Actions 성공 | 미확인 |
| GitHub Pages 최신 배포 성공 | 미확인 |
| Android/iOS 실기기 시각 검증 | 미실시 |

## 검증 명령
```bash
node --test tests/*.test.cjs
npm install --no-save @playwright/test@1.51.1
npx playwright install --with-deps chromium
python3 -m http.server 8080 &
npx playwright test tests/browser-save-p0.spec.cjs tests/browser-perf.spec.cjs tests/browser-autoplay.spec.cjs tests/browser-migration.spec.cjs --workers=1
```

## 배포 승인 기준
1. Node 단위 테스트 전체 통과
2. Playwright 4개 스펙 통과, JSON/스크린샷 등 증거 보관
3. GitHub Actions run ID 및 성공 결론 확인
4. Pages 배포 URL 및 최신 커밋 반영 확인
5. 모바일 실기기에서 입력, 저장, 전투, 이주, 해상도 자동 조절 시각 검증

## 알려진 제약
- 자동 플레이 테스트는 90초로, 수 시간 내구성 검증이 아님.
- 이주 테스트는 승리 상태를 주입하므로 실제 전투부터 엔딩까지 전 구간 검증이 아님.
- 이 문서는 검증 실행 결과를 주장하지 않음.
