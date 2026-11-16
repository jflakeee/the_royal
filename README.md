# 🏰 The Royal — Minion Worlds

미니언에게 명령하고 자원을 모아 도시를 성장시키는 **브라우저 기반 도시 건설 게임 프로토타입**입니다. 기존 2D 게임과 선택형 3D 판타지 화면을 지원합니다.

### 🎮 [게임 바로 실행하기](https://jflakeee.github.io/the_royal/)

## 게임 방법

1. 나무·바위·꽃·열매를 클릭하거나 터치해 미니언에게 작업을 지시합니다.
2. 게임 화면의 역할·채집 우선순위 설정으로 미니언을 관리합니다.
3. 자원을 모아 도시를 확장하고, 도시 성장 후 새로운 도시로 이주합니다.
4. 동물 AI 및 전투·구조 시스템도 게임에 포함되어 있습니다.

## 2D / 3D 조작

- **✨ 3D 그래픽 보기**: 기존 2D 게임에서 3D 모드로 전환합니다.
- **🎮 2D 게임 보기**: 원래 게임 화면으로 돌아갑니다.
- **3D 자원 클릭/터치**: 기존 게임의 채집 명령으로 연결합니다.
- **드래그**: 3D 카메라 회전
- **마우스 휠 / 두 손가락 핀치**: 3D 카메라 확대·축소

3D 모드는 Three.js 기반 절차적 복셀풍 지형, 조명, 안개, 발광 오브젝트, 미니언과 자원을 표현합니다. 기존 2D 게임 상태를 공유하는 **선택형 시각화 모드**이며, 모든 게임 요소가 완전한 3D로 전환된 것은 아닙니다.

## 실시간 FPS

3D 화면 오른쪽 상단에 **실제로 렌더링한 초당 프레임 수**가 표시됩니다. 1초마다 갱신되며 50FPS 이상은 초록색, 30~49FPS는 노란색, 30FPS 미만은 빨간색입니다. FPS는 사용자 기기와 브라우저 환경에 따라 달라집니다.

## 저장 및 호환성

브라우저 로컬 저장소를 이용하며 기존 `royal-save-v3` 저장 구조를 유지합니다. 저장 데이터가 중요한 경우 브라우저 사이트 데이터를 삭제하지 마세요.

## 로컬 실행

```bash
git clone https://github.com/jflakeee/the_royal.git
cd the_royal
python3 -m http.server 8765
```

브라우저에서 `http://localhost:8765/`을 엽니다. 3D 모드는 WebGL과 Three.js CDN 모듈 다운로드를 위한 인터넷 연결이 필요합니다. `file://` 대신 HTTP 서버 사용을 권장합니다.

## 주요 파일

| 경로 | 설명 |
| --- | --- |
| `index.html` | 게임 UI, 2D 캔버스, 게임 상태 연결 |
| `royal-3d.js` | 3D 렌더링, 카메라 조작, FPS 표시 |
| `game-core.js` | 게임 핵심 로직 |
| `animal-ai.js` | 동물 AI |
| `rescue.js` | 구조 관련 기능 |
| `tests/` | 회귀 및 브라우저 검증 |
| `.github/workflows/` | GitHub Actions 워크플로 |

## 테스트 및 배포

```bash
node --test tests/*.test.cjs
```

Chromium 브라우저 검증은 Playwright와 로컬 HTTP 서버를 사용합니다. 실행 환경은 `.github/workflows/browser-smoke.yml`을 참고하세요.

- [GitHub Actions: 테스트 및 배포](https://github.com/jflakeee/the_royal/actions)
- [GitHub Pages: 공개 게임](https://jflakeee.github.io/the_royal/)
- [GitHub 저장소](https://github.com/jflakeee/the_royal)

> **개발 상태:** 지속 개발 중인 프로토타입입니다. 자동 테스트 통과는 모든 모바일 기기에서의 FPS나 그래픽 품질을 보장하지 않습니다.
