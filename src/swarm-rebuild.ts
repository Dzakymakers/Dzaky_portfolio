/**
 * Original portfolio intro inspired by the "website rebuilds itself" interaction.
 * This is an independent implementation; it does not import code from swarm-cursors.
 */
type BuildTarget = HTMLElement;

const TARGET_SELECTOR = [
  ".site-header",
  ".availability",
  ".hero-kicker",
  ".hero h1",
  ".tagline",
  ".hero-meta",
  ".hero-actions",
  ".portrait-frame",
  ".orbit-note",
].join(",");

const agents = [
  { name: "PIXEL", color: "#ef476f" },
  { name: "NOVA", color: "#118ab2" },
  { name: "ECHO", color: "#06a77d" },
  { name: "MICA", color: "#8b5cf6" },
  { name: "BYTE", color: "#f59e0b" },
];

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function installStyles(): void {
  if (document.getElementById("swarm-rebuild-styles")) return;
  const style = document.createElement("style");
  style.id = "swarm-rebuild-styles";
  style.textContent = `
    .swarm-build-target { opacity: 0 !important; visibility: hidden !important; }
    .swarm-build-target.swarm-built {
      opacity: 1 !important; visibility: visible !important;
      transition: opacity .38s cubic-bezier(.2,.7,.2,1), translate .38s cubic-bezier(.2,.7,.2,1) !important;
      translate: 0 0 !important;
    }
    .swarm-build-target.swarm-building { translate: 0 8px; }
    .swarm-rebuild-overlay {
      position: fixed; inset: 0; z-index: 9999; overflow: hidden;
      display: grid; place-items: center; color: var(--text, #171717);
      background: var(--bg, #fdfdfc); opacity: 1;
      transition: opacity .65s ease, visibility .65s ease;
      font-family: inherit;
    }
    .swarm-rebuild-overlay.is-leaving { opacity: 0; visibility: hidden; pointer-events: none; }
    .swarm-rebuild-overlay::before {
      content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .28;
      background-image: linear-gradient(to right, currentColor 1px, transparent 1px),
        linear-gradient(to bottom, currentColor 1px, transparent 1px);
      background-size: 44px 44px;
      mask-image: linear-gradient(to bottom, black, transparent 85%);
    }
    .swarm-rebuild-hud {
      position: absolute; left: clamp(20px, 5vw, 64px); top: clamp(22px, 5vh, 54px);
      z-index: 2; display: flex; flex-direction: column; gap: 9px;
    }
    .swarm-rebuild-kicker { font: 700 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .18em; opacity: .58; }
    .swarm-rebuild-status { font-size: clamp(18px, 2.2vw, 27px); font-weight: 750; letter-spacing: -.055em; }
    .swarm-rebuild-progress { width: min(240px, 48vw); height: 2px; overflow: hidden; background: color-mix(in srgb, currentColor 15%, transparent); }
    .swarm-rebuild-progress > span { display: block; width: 0; height: 100%; background: var(--accent, #6477df); transition: width .35s ease; }
    .swarm-rebuild-count { font: 600 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; opacity: .5; }
    .swarm-agent {
      position: fixed; z-index: 4; left: 0; top: 0; pointer-events: none;
      transform: translate3d(-120px,-120px,0); transition: transform .48s cubic-bezier(.2,.75,.2,1);
      filter: drop-shadow(0 3px 5px rgba(0,0,0,.15));
    }
    .swarm-agent svg { display: block; width: 22px; height: 26px; }
    .swarm-agent-label {
      margin: -2px 0 0 15px; padding: 4px 6px; border-radius: 3px;
      color: #fff; background: var(--agent-color); white-space: nowrap;
      font: 700 8px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em;
    }
    .swarm-skip {
      position: absolute; z-index: 5; right: clamp(20px, 5vw, 64px); top: clamp(22px, 5vh, 54px);
      padding: 9px 13px; border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
      border-radius: 999px; color: inherit; background: transparent; cursor: pointer;
      font: 650 11px/1 inherit;
    }
    .swarm-skip:hover { background: color-mix(in srgb, currentColor 7%, transparent); }
    .swarm-replay {
      position: fixed; z-index: 40; right: 18px; bottom: 18px;
      padding: 10px 13px; display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid var(--border, #ddd); border-radius: 999px;
      color: var(--text, #171717); background: var(--surface, #fff);
      box-shadow: 0 5px 24px rgba(0,0,0,.08); cursor: pointer;
      font: 650 11px/1 inherit; opacity: .78; transition: opacity .2s, transform .2s;
    }
    .swarm-replay:hover { opacity: 1; transform: translateY(-2px); }
    .swarm-replay svg { width: 14px; height: 14px; }
    @media (prefers-reduced-motion: reduce) {
      .swarm-rebuild-overlay, .swarm-agent, .swarm-build-target, .swarm-replay { transition-duration: .01ms !important; }
    }
  `;
  document.head.append(style);
}

function makeAgent(agent: (typeof agents)[number]): HTMLDivElement {
  const node = document.createElement("div");
  node.className = "swarm-agent";
  node.style.setProperty("--agent-color", agent.color);
  node.innerHTML = `<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M2 1.5 21.5 17 12 18.3 7.8 26.5Z" fill="currentColor" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg><div class="swarm-agent-label">${agent.name}</div>`;
  node.style.color = agent.color;
  return node;
}

function createOverlay(): { root: HTMLDivElement; progress: HTMLSpanElement; count: HTMLSpanElement; agentNodes: HTMLDivElement[] } {
  const root = document.createElement("div");
  root.className = "swarm-rebuild-overlay";
  root.setAttribute("role", "status");
  root.setAttribute("aria-label", "Portfolio interface is being reconstructed");
  root.innerHTML = `
    <div class="swarm-rebuild-hud">
      <span class="swarm-rebuild-kicker">DZAKY HABIBI / INTERACTIVE PORTFOLIO</span>
      <strong class="swarm-rebuild-status">Rebuilding the interface<span aria-hidden="true">…</span></strong>
      <span class="swarm-rebuild-progress" aria-hidden="true"><span></span></span>
      <span class="swarm-rebuild-count">Preparing layout</span>
    </div>
    <button class="swarm-skip" type="button">Skip animation ↗</button>
  `;
  const agentNodes = agents.map(makeAgent);
  agentNodes.forEach((node) => root.append(node));
  document.body.append(root);
  return {
    root,
    progress: root.querySelector(".swarm-rebuild-progress > span") as HTMLSpanElement,
    count: root.querySelector(".swarm-rebuild-count") as HTMLSpanElement,
    agentNodes,
  };
}

async function runBuild(): Promise<void> {
  const targets = Array.from(document.querySelectorAll<BuildTarget>(TARGET_SELECTOR))
    .filter((node) => node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0);
  if (!targets.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const { root, progress, count, agentNodes } = createOverlay();
  let cancelled = false;
  const restore = () => {
    cancelled = true;
    targets.forEach((target) => target.classList.remove("swarm-build-target", "swarm-built", "swarm-building"));
    root.classList.add("is-leaving");
    window.setTimeout(() => root.remove(), 700);
  };
  root.querySelector(".swarm-skip")?.addEventListener("click", restore, { once: true });
  targets.forEach((target) => target.classList.add("swarm-build-target"));

  await wait(350);
  if (cancelled) return;

  for (let index = 0; index < targets.length; index += 1) {
    if (cancelled) return;
    const target = targets[index];
    const rect = target.getBoundingClientRect();
    const agentIndex = index % agentNodes.length;
    const agent = agentNodes[agentIndex];
    const x = Math.max(12, Math.min(window.innerWidth - 28, rect.left + rect.width * (index % 2 ? .72 : .28)));
    const y = Math.max(12, Math.min(window.innerHeight - 32, rect.top + Math.min(rect.height * .35, 42)));
    agent.style.transform = `translate3d(${x}px,${y}px,0)`;
    target.classList.add("swarm-building");
    count.textContent = `Constructing layer ${String(index + 1).padStart(2, "0")} / ${String(targets.length).padStart(2, "0")}`;
    progress.style.width = `${((index + 1) / targets.length) * 100}%`;
    await wait(230);
    if (cancelled) return;
    target.classList.add("swarm-built");
    target.classList.remove("swarm-building");
    await wait(115);
  }

  if (cancelled) return;
  count.textContent = "Interface reconstructed · ready";
  await wait(500);
  restore();
}

function addReplayButton(): void {
  if (document.querySelector(".swarm-replay")) return;
  const button = document.createElement("button");
  button.className = "swarm-replay";
  button.type = "button";
  button.setAttribute("aria-label", "Replay the portfolio reconstruction animation");
  button.innerHTML = `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 9a6.5 6.5 0 1 1 1.7 4.4M3.5 4.5V9h4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Replay build`;
  button.addEventListener("click", () => {
    button.remove();
    void runBuild().finally(addReplayButton);
  });
  document.body.append(button);
}

function start(): void {
  installStyles();
  let played = false;
  try {
    played = sessionStorage.getItem("dzaky-swarm-intro") === "played";
    if (!played) sessionStorage.setItem("dzaky-swarm-intro", "played");
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }

  if (played || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addReplayButton();
    return;
  }

  window.setTimeout(() => {
    void runBuild().finally(addReplayButton);
  }, 280);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
