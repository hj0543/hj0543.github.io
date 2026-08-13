import Image from "next/image";

const BRAND_ICONS: Record<string, string> = {
  django: "django",
  docker: "docker",
  fastapi: "fastapi",
  github: "github",
  gitlab: "gitlab",
  javascript: "javascript",
  jenkins: "jenkins",
  jira: "jira",
  livekit: "livekit",
  mysql: "mysql",
  nginx: "nginx",
  python: "python",
  react: "react",
  redis: "redis",
  "spring boot": "springboot",
  springboot: "springboot",
  sqlite: "sqlite",
  "tailwind css": "tailwindcss",
  tailwindcss: "tailwindcss",
  typescript: "typescript",
  vercel: "vercel",
  vue: "vuedotjs",
  "vue.js": "vuedotjs",
  vuedotjs: "vuedotjs",
};

export function BrandIcon({
  name,
  size = 14,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icon = BRAND_ICONS[name.trim().toLowerCase()];

  if (!icon) return null;

  return (
    <Image
      src={`/icons/${icon}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`brand-icon shrink-0 ${className}`}
    />
  );
}

export function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-ink/6 px-2.5 py-1 font-mono text-[10px] text-foreground/75">
      <BrandIcon name={label} size={12} />
      {label}
    </span>
  );
}
