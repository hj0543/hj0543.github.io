---
name: Discord Algorithms Study Bot
tagline: Solved.ac API 기반 알고리즘 스터디 운영 자동화 봇
thumbnail: /projects/discord_study_bot/discord-study-bot.png
screens:
  - { src: /projects/discord-study-bot/problem-search.png, alt: 문제 검색 화면, caption: 알고리즘 문제 검색 }
  - { src: /projects/discord-study-bot/problem-alarm.png, alt: 문제 풀이 알람, caption: 문제풀이 알람 }
  - { src: /projects/discord-study-bot/problem-solved.png, alt: 스터디원 풀이 현황 화면, caption: 스터디원 풀이 현황 }
  - { src: /projects/discord-study-bot/problem-notice.png, alt: 공지 등록 화면, caption: 알고리즘 문제풀이 공지 등록 }
  - { src: /projects/discord-study-bot/probelm-vote.png, alt: 문제 투표 화면, caption: 스터디 문제 투표 }
role: 1인 기획 · 개발 · 배포
period: 2026.02 ~ 2026.03
team: 개인
stack: [Python, discord.py, Solved.ac API, JSON, Oracle Cloud, systemd]
order: 1
# 채우면 문서 상단에 버튼으로 표시된다.
links:
  - { label: GitHub, href: https://github.com/hj0543/Discord_Algorthms_StudyBot }
---

## 프로젝트 개요

SSAFY 과정 중 운영한 알고리즘 스터디에서 반복되던 문제 선정, 공지 작성, 풀이 여부 확인을 자동화하기 위해 개발한 Discord 봇입니다. Solved.ac API를 활용해 난이도·알고리즘 태그 기반 문제 추천, 공지 템플릿 자동 생성, 스터디원별 풀이 현황 집계 기능을 제공합니다.

> 2026년 4월 28일 백준(BOJ) 서비스 종료로 현재는 운영을 중단했습니다.

## 개발 배경 및 필요성

- 스터디 규모: 8명 / 주 4회
- 매번 문제를 고른 뒤 링크 복사, 마감 기한 기입, 투표 생성까지 수동으로 처리해야 해 준비 시간이 오래 걸렸습니다.
- 기존 봇들은 세부 난이도(Tier)와 알고리즘 태그를 조합한 필터링이 부족해, 스터디 수준에 맞는 문제를 찾기 어려웠습니다.
- 스터디원별로 공지 문제를 풀었는지 일일이 확인해야 했고, 주간·월간·누적 집계도 필요했습니다.

## 주요 기능

- **맞춤형 문제 추천**: 난이도(Tier)와 알고리즘 태그(Tag)를 조합해 "실버 1 수준의 BFS 문제"처럼 조건에 맞는 백준 문제를 추천
- **공지 자동 생성**: Slash Command `/공지` 하나로 문제 제목, BOJ 다이렉트 링크, 마감 기한, 투표 이모지가 포함된 정형화된 공지 생성
- **문제 투표**: 후보 문제에 대한 스터디원 투표 진행
- **풀이 현황 자동 집계**: 5분 주기로 Solved.ac API를 호출해 풀이 여부를 확인하고, 공지 문제 풀이 시 알림 채널에 알림 발송 및 주간·월간·누적 카운트 반영
- **리마인드 알림**: 매일 저녁 9시 스케줄러로 스터디 참여 독려 알림 발송

## 담당 역할 및 기여

1인 프로젝트로 기획, 개발, 배포 전 과정을 담당했습니다.

- Solved.ac API v3 문서를 분석해 난이도·태그 조합 검색 쿼리 설계
- Cogs 기반으로 기능별 명령어를 모듈화해 유지보수성 확보
- JSON 기반 데이터 저장 로직으로 봇 재시작 시에도 사용자 연동 정보와 집계 데이터 유지
- Oracle Cloud(Always Free) 인스턴스에 systemd 서비스로 등록해 24시간 무중단 운영
- 스터디원도 직접 배포할 수 있도록 단계별 배포 가이드 작성

## 성과

- 문제 선정부터 공지 작성까지 걸리는 시간 **70% 이상 단축**
- 스터디원 풀이 현황 파악 시간 **50% 이상 단축**
- 풀이 현황 집계 시각화로 스터디원 동기부여

## 시스템 아키텍처

- **Discord 이벤트 처리**: `main.py`에서 봇을 구동하고, `cogs/`에 기능별 명령어(`study.py`, `profile.py` 등)를 분리해 로드
- **문제 데이터 조회**: Solved.ac API v3에 난이도·태그·정렬 쿼리를 조합해 요청하고, 비동기 통신으로 응답 지연 최소화
- **스케줄링**: 5분 주기 풀이 현황 폴링, 매일 21시 Cron 방식 리마인드 알림
- **데이터 저장**: JSON 파일로 사용자 연동 정보 및 풀이 집계 데이터 영속화
- **배포**: Oracle Cloud Ubuntu 인스턴스 + Python venv + `.env`로 토큰 분리 + systemd(`Restart=always`)로 무중단 실행

## 기술적 고민 및 문제 해결

### 추천 문제 중 중복 문제가 많았던 문제

- 상황: 동일한 난이도와 알고리즘 유형으로 여러 번 추천을 요청하면 이전에 추천된 문제가 다시 등장하는 경우가 많았습니다.

- 시도: API가 반환한 문제 중 `random.sample()`로 5개를 추출했지만, API에서 반환하는 후보 목록 자체가 비슷하게 유지되어 반복 추천을 충분히 줄이지 못했습니다.

- 해결: Solved.ac 검색 쿼리에 `sort:random`을 추가하고, 요청마다 무작위 쿼리 값을 전달해 캐시된 동일 응답이 반복되는 것을 방지했습니다. 이후 무작위로 정렬된 후보에서 다시 5개를 추출해 추천 결과가 더욱 다양하게 분산되도록 개선했습니다.

- 배운 점: 클라이언트에서 결과만 무작위로 선택해도 원본 후보가 고정되어 있다면 다양성을 확보하기 어렵다는 것을 배웠습니다. 외부 API의 정렬 방식과 캐시 동작까지 고려해야 한다는 점도 알게 되었습니다.

### 반복적인 공지 작성 과정의 비효율

- 상황: 문제 선정 후 링크 복사, 날짜 기입, 투표 생성 등 매번 같은 수동 작업이 반복되었습니다.

- 해결: Slash Command `/공지`로 문제 제목, BOJ 링크, 마감 기한, 투표 이모지를 담은 템플릿을 자동 생성하도록 구현했습니다.

- 배운 점: 내가 겪는 불편함이 곧 팀 전체의 불편함이라는 점을 인지하고, 사용자 관점에서 반복 작업을 줄이는 기능이 가장 체감 효과가 크다는 것을 배웠습니다.

### 봇 재시작 시 데이터 유실

- 상황: 서버 재시작이나 봇 재배포 시 메모리에만 있던 사용자 연동 정보와 풀이 집계가 사라질 수 있었습니다.

- 해결: JSON 파일 기반 저장 로직을 설계해 데이터를 영속화하고, systemd의 `Restart=always` 설정으로 프로세스가 종료되어도 자동 복구되도록 구성했습니다.

- 배운 점: 소규모 서비스라도 상태 데이터의 영속성과 장애 복구를 처음부터 고려해야 안정적으로 운영할 수 있다는 것을 배웠습니다.

## 관련 링크

- [GitHub](https://github.com/hj0543/Discord_Algorthms_StudyBot)
- [Solved.ac API v3](https://solved.ac/api/v3)