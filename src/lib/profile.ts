// 홈 화면의 소개·경력·기술 스택 데이터. 문구는 여기서만 고치면 된다.

export const profile = {
  name: "Hyeonjin Jeong",
  role: "Service Planning · Data",
  location: "Gumi, KR",
  // 증명사진 아래 이름 밑에 표시한다.
  facts: [
    ["생년", "1996"],
    ["전공", "신소재공학부"],
    ["병역", "육군 중위 만기전역"],
    ["MBTI", "ISFJ"],
  ],
  photo: "/my_profile/증명사진.png",
  // 홈 첫 화면의 큰 제목. 줄마다 끊어서 그린다.
  headline: ["직접 만들어 본 기획자,", "데이터로 판단합니다."],
  intro:
    "SSAFY 15기에서 웹·앱 서비스를 직접 개발하며, 기획이 화면과 데이터로 구현되는 과정을 배웠습니다. 도담에서는 5인 팀의 PM을 맡아 기획과 개발을 함께 이끌었습니다. 개발을 이해하는 기획자로서 데이터에 근거해 판단하고, 개발팀과 같은 언어로 소통하겠습니다.",
  github: "https://github.com/hj0543",
  email: "hj0543@gmail.com",
};

// SW 역량테스트 등급. 경력과 하이라이트가 같은 값을 공유한다.
const swCompetencyGrade = "Grade A+ (Python)";

/** 경력. 항목을 추가하면 Background 타임라인에 순서대로 그려진다. */
export const career = [
  {
    title: "SSAFY 15th",
    role: "",
    period: "2026.01 ~ 2026.12",
    details: [
      "1학기 성적최우수 (1st)",
      "2학기 특화 프로젝트 2등 (팀장, 발표)",
      "Monthly member (Jan, Mar, Aug)",
      `SAMSUNG SW Competency Test - ${swCompetencyGrade}`,
    ],
  },
  {
    title: "Math Academy",
    role: "Team Leader",
    period: "2023.10 ~ 2025.12",
    details: ["초,중,고 수학교육", "학원운영 시스템 기획 및 개발"],
  },
  {
    title: "ROK Army",
    role: "Officer",
    period: "2019.03 ~ 2021.06",
    details: ["근무유공표창 2회", "경계작전유공표창 1회"],
  },
];

/** 핵심 강점 요약. 첫 화면 태그로 쓰므로 3개 이내로 유지한다. */
export const highlights = [
  `SW Competency Test ${swCompetencyGrade}`,
  "Frontend Web Service",
  "Team Leadership",
];

// 합격하면 "응시예정"을 "합격"으로 바꾼다.
export const certifications = [
  "정보처리기사 (필기 합격 · 실기 2026.10.25 응시예정)",
  "ADsP (2026.10.31 응시예정)",
  "SQLD (2026.11.14 응시예정)",
];

// 기획·데이터 도구를 먼저, 개발 스택은 "개발 경험"으로 묶어 아래에 둔다.
export const skillGroups = [
  {
    title: "기획 · 데이터",
    skills: ["Figma", "Jira", "Python", "MySQL"],
  },
  {
    title: "개발 경험",
    skills: ["Django", "Vue", "React", "TypeScript", "JavaScript", "Java", "Tailwind CSS"],
  },
];
