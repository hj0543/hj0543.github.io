import { profile } from "@/lib/profile";

export default function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-14 border-t border-ink/8 bg-surface">
      <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-mono text-[12px] tracking-[0.2em] text-label">CONTACT</p>
        <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
          함께 이야기해요.
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Email 보내기 ↗
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:border-accent/50 hover:text-accent"
          >
            GitHub 보기 ↗
          </a>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-6 font-mono text-[12px] text-foreground/65">
          <span>© 2026 {profile.name.toUpperCase()}</span>
          <a href="#top" className="transition-colors hover:text-accent">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
