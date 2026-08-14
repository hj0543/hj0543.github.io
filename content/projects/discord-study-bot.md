---
name: Discord Algorithms Study Bot
tagline: 알고리즘 스터디 운영 자동화 봇
thumbnail: /projects/discord_study_bot/discord-study-bot.png
screens:
  - { src: /projects/discord-study-bot/problem-search.png, alt: 문제 검색 화면, caption: 알고리즘 문제 검색 }
  - { src: /projects/discord-study-bot/problem-alarm.png, alt: 문제 풀이 알람, caption: 문제풀이 알람 }
  - { src: /projects/discord-study-bot/problem-solved.png, alt: 스터디원 풀이 현황 화면, caption: 스터디원 풀이 현황 }
  - { src: /projects/discord-study-bot/problem-notice.png, alt: 공지 등록 화면, caption: 알고리즘 문제풀이 공지 등록 }
  - { src: /projects/discord-study-bot/probelm-vote.png, alt: 문제 투표 화면, caption: 스터디 문제 투표 }
role: 1인 기획 · 개발
period: 2026.02 ~ 2026.03
team: 개인
stack: [Python, discord.py, Oracle Cloud]
order: 1
# 채우면 문서 상단에 버튼으로 표시된다.
links:
  - { label: GitHub, href: https://github.com/hj0543/Discord_Algorthms_StudyBot }
# featured: true   # 대표 프로젝트: 목록 맨 앞에 두 칸 폭으로 강조된다.
---

## 프로젝트 개요

반복적인 문제 선정과 풀이 여부 확인을 자동화하기 위해 디스코드 봇을 개발했습니다.

## 개발 배경 및 필요성

- 스터디원: 8명 / 주 4회
- 매일 각자 문제를 선정한 뒤 링크를 올리고 투표를 생성하는 데 시간이 오래 걸렸습니다.
- 난이도, 알고리즘 및 자료구조 태그를 상세하게 검색하기 어려웠습니다.

## 주요 기능

- 난이도·유형별 백준 문제 추천 명령어
- 문제 선정 및 문제 투표 진행
- 스터디원별 풀이 현황 자동 집계
- 미풀이 인원 리마인드 알림

## 담당 역할 및 기여
1인 프로젝트로 기획, 개발, 배포 전 과정을 담당했습니다.


## 시스템 아키텍처
<!-- TODO: 디스코드 이벤트 처리, 문제 데이터 조회, 스케줄링, Oracle Cloud 배포 구조를 추가한다. -->

## 기술적 고민 및 문제 해결

### 매번 추천하는 문제 중 중복 문제가 많았던 문제

- 상황: 동일한 난이도와 알고리즘 유형으로 여러 번 추천을 요청하면 이전에 추천된 문제가 다시 등장하는 경우가 많았습니다.

- 시도: API가 반환한 문제 중 random.sample()로 5개를 추출했지만, API에서 반환하는 후보 목록 자체가 비슷하게 유지되어 반복 추천을 충분히 줄이지 못했습니다.

- 해결: Solved.ac 검색 쿼리에 sort:random을 추가하고, 요청마다 무작위 쿼리 값을 전달해 캐시된 동일 응답이 반복되는 것을 방지했습니다. 이후 무작위로 정렬된 후보에서 다시 5개를 추출해 추천 결과가 더욱 다양하게 분산되도록 개선했습니다.

- 배운 점: 클라이언트에서 결과만 무작위로 선택해도 원본 후보가 고정되어 있다면 다양성을 확보하기 어렵다는 것을 배웠습니다. 외부 API의 정렬 방식과 캐시 동작까지 고려해야 한다는 점도 알게 되었습니다.



## 관련 링크

- [GitHub](https://github.com/hj0543/Discord_Algorthms_StudyBot)
