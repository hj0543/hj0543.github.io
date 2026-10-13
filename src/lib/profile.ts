// 홈 화면의 소개·경력·기술 스택 데이터. 문구는 여기서만 고치면 된다.

export const profile = {
  name: "Hyeonjin Jeong",
  role: "Planning · Development",
  location: "Gumi, KR",
  nameKo: "정현진",
  // 프로필 사진 아래 이름 옆에 표시한다. 병역은 경력(ROK Army)에 있어 넣지 않는다.
  facts: [
    ["전공", "신소재공학부"],
    ["MBTI", "ISFJ"],
  ],
  // 원본 profile.png를 자르지 않고 900×1200으로 줄인 웹용 사본.
  photo: "/my_profile/profile.jpg",
  // 홈 첫 화면의 큰 제목. [첫 줄, 둘째 줄 강조어, 둘째 줄 나머지]
  headline: ["내가 머무르던 자리에", "좋은 변화", "를 남기자."],
  // 넓은 화면에서는 줄마다 끊고, 좁은 화면에서는 이어서 흐른다.
  intro: [
    "가르치던 자리에서 시작해, 배우며 만드는 사람이 되어 가는 중입니다.",
    "그 과정에서 만든 것과 고민한 것을 정리했습니다.",
  ],
  github: "https://github.com/hj0543",
  email: "hj0543@gmail.com",
};

// SW 역량테스트 등급. 경력과 하이라이트가 같은 값을 공유한다.
const swCompetencyGrade = "Grade A+ (Python)";

/**
 * 경력. 항목을 추가하면 홈 경력 줄에 순서대로 그려진다.
 * logo는 /public 기준 경로(public/ex_logo/). 없으면 아이콘 배지로 대신한다.
 */
export const career = [
  {
    title: "SSAFY 15th",
    role: "",
    logo: "/ex_logo/ssafy_web.png",
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
    // 원본 math.png에서 글자를 빼고 큐브 마크만 잘라 낸 사본.
    logo: "/ex_logo/math_web.png",
    period: "2023.10 ~ 2025.12",
    details: ["초,중,고 수학교육", "학원운영 시스템 기획 및 개발"],
  },
  {
    title: "ROK Army",
    role: "Officer",
    // 원본 army_officer.png(1.3MB)를 여백 없이 줄인 사본.
    logo: "/ex_logo/army_officer_web.png",
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

// 홈 Background 줄의 자격 배지. 원본 cert.png를 여백 없이 줄인 사본.
export const certificationLogo = "/ex_logo/cert_web.png";

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
