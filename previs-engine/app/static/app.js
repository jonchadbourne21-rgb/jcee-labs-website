const $ = (selector) => document.querySelector(selector);

const els = {
  body: document.body,
  briefShell: $("#briefShell"),
  briefForm: $("#briefForm"),
  title: $("#titleInput"),
  scene: $("#sceneInput"),
  aspect: $("#aspectInput"),
  style: $("#styleInput"),
  characterCount: $("#characterCount"),
  generate: $("#generateButton"),
  deckShell: $("#deckShell"),
  projectTitle: $("#projectTitle"),
  deckKicker: $("#deckKicker"),
  deckStats: $("#deckStats"),
  timeline: $("#timeline"),
  progressText: $("#progressText"),
  progressPercent: $("#progressPercent"),
  progressBar: $("#progressBar"),
  warning: $("#warningBanner"),
  aesthetic: $("#aestheticLabel"),
  renderState: $("#renderStateLabel"),
  seed: $("#seedLabel"),
  exportButton: $("#exportButton"),
  jsonButton: $("#jsonButton"),
  copyLinkButton: $("#copyLinkButton"),
  previous: $("#previousShot"),
  next: $("#nextShot"),
  systemLabel: $("#systemLabel"),
  toast: $("#toast"),
};

const state = {
  projectId: null,
  project: null,
  pollTimer: null,
  reviewMode: window.location.pathname.startsWith("/review/"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function humanize(value) {
  return String(value ?? "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("visible"), 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch (_) {}
    throw new Error(message);
  }
  return response.json();
}

function setGenerating(active) {
  els.generate.disabled = active;
  els.generate.innerHTML = active
    ? '<span>Blocking the scene…</span><span aria-hidden="true">···</span>'
    : '<span>Build shot deck</span><span aria-hidden="true">↗</span>';
}

function renderProject(project, { preserveScroll = false } = {}) {
  state.project = project;
  state.projectId = project.project_id;
  const previousLeft = preserveScroll ? els.timeline.scrollLeft : 0;
  const completed = project.shots.filter((shot) => shot.state === "completed").length;
  const failed = project.shots.filter((shot) => shot.state === "failed").length;
  const totalSeconds = project.shots.reduce((sum, shot) => sum + shot.duration_seconds, 0);
  const percent = project.shots.length ? Math.round((completed / project.shots.length) * 100) : 0;
  const active = project.shots.some((shot) => ["pending", "rendering"].includes(shot.state));

  els.briefShell.classList.add("hidden");
  els.deckShell.classList.remove("hidden");
  els.exportButton.classList.remove("hidden");
  els.jsonButton.classList.remove("hidden");
  els.copyLinkButton.classList.remove("hidden");
  els.projectTitle.textContent = project.title;
  els.deckKicker.textContent = `Scene ${String(project.scene_metadata.scene_number).padStart(2, "0")} · ${project.visual_style}`;
  els.deckStats.innerHTML = `
    <div class="stat"><small>Shots</small><strong>${project.shots.length}</strong></div>
    <div class="stat"><small>Runtime</small><strong>${totalSeconds}s</strong></div>
    <div class="stat"><small>Canvas</small><strong>${escapeHtml(project.aspect_ratio)}</strong></div>`;
  els.progressText.textContent = active
    ? `${completed} of ${project.shots.length} previews rendered`
    : failed
      ? `${completed} ready · ${failed} need attention`
      : "Pitch deck ready for review";
  els.progressPercent.textContent = `${percent}%`;
  els.progressBar.style.width = `${percent}%`;
  els.aesthetic.textContent = project.scene_metadata.global_aesthetic;
  els.renderState.textContent = humanize(project.status);
  els.seed.textContent = project.scene_metadata.seed_lock;
  els.exportButton.href = project.export_path;
  els.jsonButton.href = project.shot_list_path;
  els.warning.textContent = project.planner_warning || "";
  els.warning.classList.toggle("hidden", !project.planner_warning);
  els.systemLabel.textContent = active ? "Rendering preview frames" : "Sequence synchronized";

  document.documentElement.style.setProperty(
    "--shot-ratio",
    project.aspect_ratio === "9:16" ? "9/16" : "16/9",
  );
  els.timeline.innerHTML = project.shots.map(shotCard).join("");
  if (preserveScroll) els.timeline.scrollLeft = previousLeft;

  if (!state.reviewMode) {
    els.timeline.querySelectorAll("[data-reroll]").forEach((button) => {
      button.addEventListener("click", () => rerollShot(button.dataset.reroll));
    });
  }

  localStorage.setItem("frameforge:last-project", project.project_id);
  schedulePoll(active);
}

function shotCard(shot) {
  const movement = humanize(shot.camera.movement_type);
  const media = shot.video_url
    ? `<video controls muted loop playsinline preload="metadata" poster=""><source src="${escapeHtml(shot.video_url)}" type="video/mp4"></video><div class="video-grade"></div>`
    : `<div class="media-placeholder"><div class="frame-lines"><span>${humanize(shot.state)}</span></div></div>`;
  const error = shot.render_error
    ? `<p class="shot-context" role="alert">${escapeHtml(shot.render_error)}</p>`
    : `<p class="shot-context">${escapeHtml(shot.script_context)}</p>`;
  const rerollLabel = shot.state === "rendering" || shot.state === "pending" ? "Rendering…" : "Re-roll shot";
  const disabled = shot.state === "rendering" || shot.state === "pending" ? "disabled" : "";

  return `<article class="shot-card" data-shot-id="${escapeHtml(shot.shot_id)}">
    <div class="shot-media">
      ${media}
      <span class="shot-number">${String(shot.sequence_order).padStart(2, "0")}</span>
      <span class="status-badge ${escapeHtml(shot.state)}"><i></i>${humanize(shot.state)}</span>
    </div>
    <div class="shot-body">
      <div class="card-head"><span class="shot-type">${escapeHtml(shot.shot_type)}</span><span class="shot-duration">${shot.duration_seconds} SEC</span></div>
      <h2 class="shot-title">${movement} · ${shot.camera.lens_focal_length_mm}mm</h2>
      ${error}
      <div class="camera-vector">
        <div><small>Movement</small><strong>${movement}</strong></div>
        <div><small>Angle</small><strong>${escapeHtml(shot.camera.angle)}</strong></div>
        <div><small>Strength</small><strong>${Number(shot.camera.motion_strength).toFixed(2)}</strong></div>
      </div>
      <details class="prompt-block">
        <summary><span>Generation prompt</span><span>+</span></summary>
        <p>${escapeHtml(shot.prompt)}</p>
      </details>
      <div class="card-footer">
        <span class="take-label">Take ${String(shot.attempt).padStart(2, "0")} · ${escapeHtml(shot.shot_id)}</span>
        <button class="reroll-button" type="button" data-reroll="${escapeHtml(shot.shot_id)}" ${disabled}>${rerollLabel}</button>
      </div>
    </div>
  </article>`;
}

function schedulePoll(active) {
  window.clearTimeout(state.pollTimer);
  if (!active || !state.projectId) return;
  state.pollTimer = window.setTimeout(refreshProject, 1300);
}

async function refreshProject() {
  if (!state.projectId) return;
  try {
    const project = await api(`/api/projects/${state.projectId}`);
    renderProject(project, { preserveScroll: true });
  } catch (error) {
    showToast(error.message);
    state.pollTimer = window.setTimeout(refreshProject, 3000);
  }
}

async function rerollShot(shotId) {
  const button = els.timeline.querySelector(`[data-reroll="${CSS.escape(shotId)}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = "Queuing…";
  }
  try {
    const result = await api(`/api/projects/${state.projectId}/shots/${shotId}/reroll`, {
      method: "POST",
      body: "{}",
    });
    showToast(result.message);
    await refreshProject();
  } catch (error) {
    showToast(error.message);
    if (button) button.disabled = false;
  }
}

async function createProject(event) {
  event.preventDefault();
  setGenerating(true);
  els.systemLabel.textContent = "Analyzing story beats";
  try {
    const payload = {
      title: els.title.value.trim() || "Untitled sequence",
      scene_text: els.scene.value.trim(),
      aspect_ratio: els.aspect.value,
      visual_style: els.style.value,
    };
    const project = await api("/api/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    window.history.replaceState({}, "", `/review/${project.project_id}`);
    state.reviewMode = false;
    renderProject(project);
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Shot plan built. Preview renders are now running.");
  } catch (error) {
    showToast(error.message);
    els.systemLabel.textContent = "Pre-visualization engine ready";
  } finally {
    setGenerating(false);
  }
}

async function loadReviewProject() {
  const projectId = window.location.pathname.split("/").filter(Boolean)[1];
  if (!projectId) return;
  state.projectId = projectId;
  els.body.classList.add("review-mode");
  try {
    const project = await api(`/api/projects/${projectId}`);
    renderProject(project);
  } catch (error) {
    els.deckShell.classList.remove("hidden");
    els.projectTitle.textContent = "Review link unavailable";
    els.timeline.innerHTML = `<p class="shot-context">${escapeHtml(error.message)}</p>`;
  }
}

function scrollTimeline(direction) {
  const card = els.timeline.querySelector(".shot-card");
  const distance = card ? card.getBoundingClientRect().width + 12 : 500;
  els.timeline.scrollBy({ left: direction * distance, behavior: "smooth" });
}

els.briefForm.addEventListener("submit", createProject);
els.scene.addEventListener("input", () => {
  els.characterCount.textContent = els.scene.value.length.toLocaleString();
});
els.characterCount.textContent = els.scene.value.length.toLocaleString();
els.previous.addEventListener("click", () => scrollTimeline(-1));
els.next.addEventListener("click", () => scrollTimeline(1));
els.copyLinkButton.addEventListener("click", async () => {
  if (!state.projectId) return;
  const url = `${window.location.origin}/review/${state.projectId}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast("Review link copied to clipboard.");
  } catch (_) {
    window.prompt("Copy this review link:", url);
  }
});

if (state.reviewMode) loadReviewProject();
