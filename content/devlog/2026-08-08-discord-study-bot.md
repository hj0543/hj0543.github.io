---
title: "스터디장의 반복 작업을 봇에게 넘기기"
date: 2026-08-08
categories: [devlog, backend]
tags: [개인 프로젝트, Discord Bot, 백엔드]
---

SSAFY 1학기 동안 여덟 명이 모인 알고리즘 스터디를 주 3회 운영했다. 스터디 자체보다 스터디를 굴리는 일이 더 손이 많이 갔다. 문제를 고르고, 링크를 복사하고, 마감을 적고, 투표를 만들고, 누가 풀었는지 한 명씩 확인하는 일이 매번 반복됐다. 그 반복을 Discord 봇에게 넘긴 이야기다.

![/공지로 올린 스터디 문제 공지](/projects/discord_study_bot/problem-notice.png)

## 1. 매번 같은 공지를 쓰고 있었다

공지 한 번을 올리는 데 필요한 정보는 늘 같았다. 문제 제목, BOJ 링크, 마감 기한, 그리고 풀었는지 표시할 투표 이모지. 내용은 매번 바뀌어도 형식은 바뀌지 않았다.

그래서 Slash Command `/공지` 하나로 이 템플릿이 만들어지게 했다. 문제 번호를 세 개까지 넣고 마감일을 `0316`처럼 적으면, 봇이 제목과 티어, 태그, 링크를 채우고 문제마다 1️⃣, 2️⃣, 3️⃣ 이모지를 달아 공지를 올린다.

```python
p_ids = [pid for pid in [문제1, 문제2, 문제3] if pid and pid.isdigit()]
...
for i, pid in enumerate(p_ids):
    p_info = get_problem_by_id(int(pid))
    ...
    description.append(f"**{i+1}.** [{tier_name}] [{pid}. {title}](https://www.acmicpc.net/problem/{pid})
> 🏷️ {tag_str}")

embed = discord.Embed(title=f"📅 {today.strftime('%m/%d')} 📃오늘의 스터디 문제 공지 (~{기한})", description="

".join(description), color=discord.Color.blue())
msg = await interaction.channel.send(embed=embed)
reaction_emojis = ["1️⃣", "2️⃣", "3️⃣"]
for i in range(len(description)):
    await msg.add_reaction(reaction_emojis[i])
```

거창한 기능은 아니었다. 그래도 매번 하던 수작업이 명령어 한 줄로 줄었다.

처음 `/공지`를 올린 날, 스터디원 한 명이 "이거 다른 스터디에서도 쓸 수 있어?"라고 물었다. 그제야 알았다. 내가 귀찮았던 일은 다른 사람에게도 귀찮은 일이었다. 다들 말없이 같은 공지를 손으로 쓰고 있었을 뿐이었다.

## 2. 수준에 맞는 문제를 고르기

기존 봇들은 난이도와 알고리즘 유형을 함께 걸어 검색하기 어려웠다. "실버 1 수준의 BFS 문제"처럼 스터디 수준에 맞춰 고르고 싶었다.

Solved.ac API v3 문서를 읽어 보니 검색 쿼리에 티어와 태그 조건을 함께 넣을 수 있었다. "실1", "BFS"처럼 스터디원들이 평소 부르는 이름을 공식 티어 번호와 태그 키로 바꿔 주는 표를 만들고, 여기에 `lang:ko`를 더해 한글 문제만 받아 오게 했다. 그렇게 받은 후보 중 다섯 문제를 추천한다.

```python
TIER_MAP = {
    "실버1": 10, "실1": 10, "s1": 10,
    "골드5": 11, "골5": 11, "g5": 11,
    ...
}
TAG_MAP = {
    "BFS": "bfs",
    "너비우선탐색": "bfs",
    "DP": "dp",
    ...
}

def search_problems(tier_query, tag_query):
    tier_val = TIER_MAP.get(tier_query, None)
    tag_key = TAG_MAP.get(tag_query, tag_query)

    query_parts = []
    if tier_val:
        query_parts.append(f"tier:{tier_val}")
    if tag_key:
        query_parts.append(f"tag:{tag_key}")
    query_parts.append("lang:ko")
    ...
```

![/추천 골드3 백트래킹 결과](/projects/discord_study_bot/problem-search.png)

## 3. 같은 문제가 자꾸 추천됐다

쓰다 보니 문제가 생겼다. 같은 조건으로 여러 번 추천을 받으면 이전에 나온 문제가 계속 다시 나왔다.

처음에는 API가 돌려준 후보 중 `random.sample()`로 다섯 개를 뽑았다. 하지만 결과는 크게 달라지지 않았다. 원인은 뽑는 쪽이 아니라 후보 쪽에 있었다. API가 돌려주는 후보 목록 자체가 매번 비슷했다. 같은 바구니에서 아무리 섞어 뽑아도 나오는 건 결국 그 바구니 안의 것들이었다.

그래서 검색 쿼리에 `sort:random`을 넣고, 요청마다 무작위 값을 함께 보내 같은 응답이 캐시되어 돌아오지 않게 했다. 후보 자체가 무작위로 섞인 뒤에 다섯 개를 뽑으니, 그제야 추천이 고르게 퍼졌다.

```python
# utils/solvedac.py
full_query = " ".join(query_parts) + " sort:random"

params = {
    "query": full_query,
    "direction": "asc",
    "page": 1,
    "c": random.randint(1, 1000000)  # CDN 캐시를 우회하기 위한 무작위 값
}

# cogs/study.py
selected_problems = random.sample(ko_problems, min(len(ko_problems), 5))
```

클라이언트에서 아무리 무작위로 골라도 원본이 고정되어 있으면 소용이 없다. 외부 API를 쓸 때는 그 API가 어떻게 정렬하고 캐시하는지까지 알아야 한다는 걸 이때 배웠다.

## 4. 누가 풀었는지 대신 확인하기

공지를 올린 뒤에는 누가 풀었는지 확인하는 일이 남았다. 봇이 5분마다 Solved.ac API로 스터디원들의 풀이 기록을 확인하고, 공지된 문제를 풀면 알림 채널에 알려 주도록 했다. 마감이 지난 문제는 감지 목록에서 알아서 빠진다. 쌓인 기록은 `/문제풀이현황`으로 주간, 월간, 누적 풀이 수를 한눈에 볼 수 있게 했다.

매일 저녁 9시에는 아직 안 푼 사람을 위한 리마인드 알림도 보냈다.

![풀이 알림과 밤 9시 리마인드](/projects/discord_study_bot/problem-alarm.png)

![/문제풀이현황 결과](/projects/discord_study_bot/problem-solved.png)

집계가 채널에 올라오기 시작하자 분위기가 조금씩 달라졌다. 누군가 먼저 풀었다는 알림이 뜨면, 아직 못 푼 사람들이 하나둘 문제를 열었다. 재촉하는 말 한마디 없이도 서로의 기록이 서로를 끌어당겼다.

## 5. 재시작하면 기록이 사라졌다

연동 정보와 풀이 집계를 메모리에만 들고 있으면, 서버가 재시작되거나 봇을 다시 배포할 때 그동안 쌓은 기록이 사라질 수 있었다.

실제로 한 번 그런 일이 있었다. 봇을 업데이트하고 다시 띄웠더니, 일주일 동안 쌓인 풀이 집계가 전부 0으로 돌아가 있었다. 숫자는 다시 쌓으면 되지만, 함께 쌓아 온 흐름이 끊긴 기분은 꽤 오래 남았다.

규모가 작아서 데이터베이스까지는 필요 없다고 판단했다. 대신 상태가 바뀔 때마다 JSON 파일에 저장하고, 시작할 때 다시 읽어 오도록 했다.

기능이 늘면서 저장 형식도 바뀌었다. 처음엔 문제 번호만 담던 목록이 마감일과 공지일을 함께 담게 됐다. 이미 쌓인 기록을 버릴 수는 없어서, 이전 형식을 읽으면 새 형식으로 바꿔 주는 코드를 남겼다.

```python
def save_data(self):
    with open(self.data_file, 'w', encoding='utf-8') as f:
        json.dump({
            'members': {str(k): v for k, v in self.members.items()},
            'announced_problems': self.announced_problems,
            'solved_log': {str(k): v for k, v in self.solved_log.items()},
            ...
        }, f, ensure_ascii=False, indent=4)

def load_data(self):
    ...
    # 이전 버전 호환 (문자열 리스트였던 걸 딕셔너리로 변환)
    self.announced_problems = []
    for p in data.get('announced_problems', []):
        if isinstance(p, dict):
            self.announced_problems.append(p)
        else:
            self.announced_problems.append({'pid': p, 'deadline': (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")})
```

## 6. 혼자 운영하는 서버

봇은 24시간 떠 있어야 했다. Oracle Cloud의 무료 인스턴스에 올리고, Python 가상환경과 `.env`로 토큰을 분리했다. 프로세스는 pm2에 맡겨 두니, 죽어도 알아서 다시 올라왔다.

스터디원도 직접 띄워 볼 수 있게 단계별 배포 가이드도 써 두었다.

수정할 때마다 서버에 접속해 코드를 받고 다시 켜는 일도 곧 반복이 됐다. 결국 이것도 넘겼다. master에 푸시하면 GitHub Actions가 서버에 접속해 코드를 받고, 의존성을 설치하고, pm2로 봇을 다시 띄운다.

```yaml
on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 오라클 서버 접속 및 봇 업데이트
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/Discord_Algorthms_StudyBot
            git pull origin master
            source venv/bin/activate
            pip install -r requirements.txt
            pm2 restart study-bot --update-env || pm2 start /home/ubuntu/Discord_Algorthms_StudyBot/venv/bin/python3 --name "study-bot" -- main.py
            pm2 save
```

그래도 한 번은 봇이 조용히 멈췄다. 알림이 오지 않는다는 메시지를 받고서야 알았다. Solved.ac가 응답을 주지 않자 요청이 끝나지 않고 매달려 있었고, 그동안 봇도 함께 멈춰 있었다. 프로세스는 살아 있는데 일은 하지 않는 상태. 재시작 설정으로는 막을 수 없는 종류의 장애였다. 그 뒤로 모든 요청에 5초 타임아웃을 걸고, 스터디원 한 명의 확인이 실패해도 나머지는 계속 확인하도록 고쳤다. 혼자 운영한다는 건, 아무도 대신 지켜봐 주지 않는다는 뜻이었다.

## 7. 봇이 멈춘 날

2026년 4월 28일, 백준 서비스가 종료됐다. 봇이 기대고 있던 문제 링크와 풀이 기록이 한꺼번에 사라졌고, 봇도 운영을 멈췄다.

몇 달 동안 매일 들여다보던 봇이 하루아침에 할 일을 잃었다. 코드는 그대로인데, 딛고 서 있던 바닥이 사라진 것이다. 외부 서비스 위에 지은 프로젝트는 그 서비스보다 오래 살 수 없다는 걸 그때 실감했다.

그래도 사라지지 않은 것이 있었다. 봇과 함께한 동안 스터디는 공지를 한 번도 거르지 않았고, 매일 밤 9시 알림에 맞춰 문제를 열던 습관은 봇이 멈춘 뒤에도 남았다.

## 돌아보며

- 내가 반복하고 있는 일은 팀 모두가 반복하고 있는 일이다.
- 결과를 섞는 것보다 후보를 바꾸는 게 먼저다. 외부 API의 정렬과 캐시까지 확인한다.
- 작은 서비스라도 상태를 어디에 저장할지, 죽으면 어떻게 살아날지는 처음부터 정한다.

처음엔 그저 귀찮아서 시작한 일이었다. 같은 공지를 또 쓰기 싫어서 만든 명령어 하나가 추천이 되고, 집계가 되고, 24시간 떠 있는 서버가 됐다. 작은 귀찮음을 그냥 넘기지 않은 덕분에, 처음으로 누군가 매일 쓰는 서비스를 운영해 볼 수 있었다. 봇은 멈췄지만, 반복을 발견하면 손이 먼저 움직이는 습관은 그대로 남아 있다.
