// 타이포그래피 플러그인 없이 마크다운 본문만 골라 스타일을 입힌다.
// devlog 글과 프로젝트 상세 창이 같은 규칙을 쓴다.
export const PROSE = [
  "[&_h2]:mt-7 [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:text-foreground",
  "[&_h3]:mt-6 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground/90",
  "[&_p]:mt-3.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground/65",
  "[&_strong]:font-semibold [&_strong]:text-foreground/90",
  "[&_ul]:mt-3.5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
  "[&_ol]:mt-3.5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
  "[&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-foreground/65",
  "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2",
  "[&_code]:rounded [&_code]:bg-ink/8 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground/85",
  "[&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-ink/10 [&_pre]:bg-ink/6 [&_pre]:p-4",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[12px] [&_pre_code]:leading-relaxed",
  // 창을 리사이즈해도 이미지가 밖으로 삐져나오지 않게 너비를 창에 맞춘다.
  "[&_img]:mt-4 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-ink/10",
  "[&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:text-sm [&_blockquote]:text-foreground/55",
  // 스크린샷 여러 장을 두 칸 그리드로 배치한다. 마크다운에서 <div class="gallery">로 감싼다.
  "[&_.gallery]:mt-4 [&_.gallery]:grid [&_.gallery]:grid-cols-2 [&_.gallery]:items-start [&_.gallery]:gap-2 [&_.gallery_img]:mt-0",
].join(" ");
