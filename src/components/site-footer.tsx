import { profile } from "@/lib/profile";

/** 문서의 끝. 굵은 선 아래에 연락처를 밑줄 링크로 둔다. */
export default function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-14">
      <div className="mx-auto max-w-[1080px] px-5 pb-10 sm:px-8">
        <div className="border-t-2 border-ink pt-14 sm:pt-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-label">
            End of Document
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
            함께 이야기해요.
          </h2>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            <a
              href={`mailto:${profile.email}`}
              className="border-b border-accent/50 text-accent transition-colors hover:border-accent"
            >
              {profile.email} ↗
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="border-b border-ink/25 text-foreground/80 transition-colors hover:border-accent hover:text-accent"
            >
              GitHub ↗
            </a>
          </p>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 pt-6 font-mono text-[12px] text-foreground/65">
            <span>© 2026 {profile.name.toUpperCase()}</span>
            <a href="#top" className="transition-colors hover:text-accent">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
