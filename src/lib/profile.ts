// 홈 화면의 소개·경력·기술 스택 데이터. 문구는 여기서만 고치면 된다.

export const profile = {
  name: "Hyeonjin Jeong",
  role: "Frontend-focused Web Developer",
  location: "Gumi, KR",
  photo: "/my_profile/my_profile.jpg",
  // 홈 첫 화면의 큰 제목. 줄마다 끊어서 그린다.
  headline: ["문제를 이해하고,", "끝까지 구현하는 개발자."],
  intro:
    "SSAFY 15기에서 프론트엔드 중심의 웹 서비스를 만들고 있습니다. 기획부터 화면 구현, 협업까지 끝까지 책임지는 개발자가 되고 싶습니다.",
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
      "Monthly member (Jan, Mar, Aug)",
      `SAMSUNG SW Competency Test - ${swCompetencyGrade}`,
    ],
  },
  {
    title: "Math Academy",
    role: "Team Leader",
    period: "2021.07 ~ 2025.12",
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

export const certifications = ["정보처리기사 (필기합격)"];

export const skillGroups = [
  {
    title: "Core Stack",
    skills: ["Python", "Django", "Vue", "Tailwind CSS", "MySQL"],
  },
  {
    title: "Tools",
    skills: ["Figma", "Jira"],
  },
  {
    title: "Currently Learning",
    skills: ["React", "JavaScript", "TypeScript", "Java"],
  },
];
