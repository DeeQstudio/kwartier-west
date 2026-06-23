const LEFT_THRESHOLD = 0.47;
const RIGHT_THRESHOLD = 0.53;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function canUseHoverPointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function usesMobileEntry() {
  return !canUseHoverPointer() || window.matchMedia("(max-width: 820px)").matches;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setPanelLinksFocusable(links, side) {
  links.forEach((link) => {
    const linkSide = (link.dataset.riftSide || "").toLowerCase();
    link.tabIndex = linkSide === side ? 0 : -1;
  });
}

function setPanelsAria(panels, visible) {
  panels.setAttribute("aria-hidden", "false");
}

function updatePointerMood(hero, event) {
  const rect = hero.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const nx = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
  const ny = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
  const absX = Math.abs(nx);

  hero.style.setProperty("--rift-width", `${(1.6 + absX * 2.8).toFixed(2)}px`);
  hero.style.setProperty("--rift-shift", `${(nx * 14).toFixed(2)}px`);
  hero.style.setProperty("--parallax-x", `${(nx * 10).toFixed(2)}px`);
  hero.style.setProperty("--parallax-y", `${(ny * 7).toFixed(2)}px`);
}

function sideFromClientX(hero, clientX) {
  const rect = hero.getBoundingClientRect();
  if (!rect.width) return "none";
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
  if (ratio < LEFT_THRESHOLD) return "tekno";
  if (ratio > RIGHT_THRESHOLD) return "hiphop";
  return "villa";
}

function sideFromClientXLoose(hero, clientX) {
  const rect = hero.getBoundingClientRect();
  if (!rect.width) return "none";
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
  return ratio < 0.5 ? "tekno" : "hiphop";
}

function resetPointerMood(hero) {
  hero.style.setProperty("--rift-width", "1px");
  hero.style.setProperty("--rift-shift", "0px");
  hero.style.setProperty("--parallax-x", "0px");
  hero.style.setProperty("--parallax-y", "0px");
}

function trapTabBetweenCTAs(event, hero, ctas, side) {
  if (event.key !== "Tab" || !ctas.length || side === "none") return false;

  const enabled = ctas.filter((cta) => (cta.dataset.riftSide || "").toLowerCase() === side);
  if (!enabled.length) return false;

  const active = document.activeElement;
  const first = enabled[0];
  const last = enabled[enabled.length - 1];
  const inCtaList = enabled.includes(active);

  if (!inCtaList) {
    event.preventDefault();
    if (event.shiftKey) {
      last.focus();
    } else {
      first.focus();
    }
    return true;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
    return true;
  }

  if (event.shiftKey && (active === first || active === hero)) {
    event.preventDefault();
    last.focus();
    return true;
  }

  return false;
}

function applySideState(root, panels, links, side) {
  root.classList.toggle("has-side", side === "tekno" || side === "hiphop");
  root.classList.toggle("is-hover-tekno", side === "tekno");
  root.classList.toggle("is-hover-hiphop", side === "hiphop");
  root.classList.toggle("is-hover-villa", side === "villa");
  setPanelsAria(panels, side === "tekno" || side === "hiphop");
  setPanelLinksFocusable(links, side);
}

function navigateToSide(side, routes) {
  const target = routes[side];
  if (!target) return false;
  window.location.href = target;
  return true;
}

function enterSide(side, routes, root, panelCards, state) {
  if (state.isNavigating) return false;
  const target = routes[side];
  if (!target) return false;

  state.isNavigating = true;
  root.classList.add("is-entering", `is-entering-${side}`);

  panelCards.forEach((panel) => {
    const panelSide = (panel.getAttribute("data-rift-side") || "").toLowerCase();
    panel.classList.toggle("is-selected", panelSide === side);
  });

  window.setTimeout(() => {
    window.location.href = target;
  }, state.reducedMotion ? 40 : 280);

  return true;
}

function resetEntryState(root, panelCards, state) {
  state.isNavigating = false;
  root.classList.remove("is-entering", "is-entering-tekno", "is-entering-hiphop");
  panelCards.forEach((panel) => {
    panel.classList.remove("is-selected");
  });
}

function touchInstructionLabel() {
  const lang = (document.documentElement.lang || "nl").toLowerCase();
  if (lang.startsWith("en")) {
    return "Tekno / Villa West / Hip hop";
  }
  return "Tekno / Villa West / Hiphop";
}

export function initLandingPortal() {
  const root = document.querySelector("[data-portal]");
  const hero = document.querySelector("[data-rift-hero]");
  const panels = document.querySelector("[data-rift-panels]");
  const allCtas = Array.from(document.querySelectorAll("[data-rift-cta]"));
  const panelCards = Array.from(document.querySelectorAll("[data-rift-panel]"));
  const villaSignal = document.querySelector("[data-rift-villa]");

  if (!root || !hero || !panels || !allCtas.length) return;

  const openTekno = allCtas.find((link) => link.dataset.riftOpen === "tekno");
  const openHiphop = allCtas.find((link) => link.dataset.riftOpen === "hiphop");
  if (!openTekno || !openHiphop) return;

  const state = {
    reducedMotion: prefersReducedMotion(),
    hoverPointer: canUseHoverPointer(),
    activeSide: "none",
    isMobileEntry: usesMobileEntry(),
    isNavigating: false
  };

  const routes = {
    tekno: openTekno.href,
    hiphop: openHiphop.href,
    villa: villaSignal instanceof HTMLAnchorElement ? villaSignal.href : ""
  };

  const setSide = (side) => {
    const safe = side === "tekno" || side === "hiphop" || side === "villa" ? side : "none";
    state.activeSide = safe;
    applySideState(root, panels, allCtas, safe);
  };

  setSide("none");
  resetPointerMood(hero);
  resetEntryState(root, panelCards, state);

  if (state.isMobileEntry) {
    const instruction = document.getElementById("portal-instruction");
    if (instruction) {
      instruction.textContent = touchInstructionLabel();
    }
  }

  if (!state.reducedMotion && state.hoverPointer) {
    hero.addEventListener("pointermove", (event) => {
      updatePointerMood(hero, event);
      setSide(sideFromClientX(hero, event.clientX));
    });

    hero.addEventListener("pointerleave", () => {
      resetPointerMood(hero);
      setSide("none");
    });
  }

  hero.addEventListener("click", (event) => {
    const interactive = event.target instanceof Element ? event.target.closest("a,button,input,select,textarea") : null;
    if (interactive) return;

    const x = typeof event.clientX === "number"
      ? event.clientX
      : hero.getBoundingClientRect().left + (hero.getBoundingClientRect().width / 2);
    const side = state.hoverPointer
      ? sideFromClientX(hero, x)
      : sideFromClientXLoose(hero, x);

    if (state.isMobileEntry) {
      enterSide(side, routes, root, panelCards, state);
      return;
    }

    navigateToSide(side, routes);
  });

  allCtas.forEach((cta) => {
    cta.addEventListener("focus", () => {
      const side = (cta.dataset.riftSide || "").toLowerCase();
      setSide(side);
    });
  });

  panelCards.forEach((panel) => {
    panel.addEventListener("click", (event) => {
      const interactive = event.target instanceof Element ? event.target.closest("a,button,input,select,textarea") : null;
      if (interactive) return;
      const side = (panel.getAttribute("data-rift-side") || "").toLowerCase();
      if (side === "tekno" || side === "hiphop") {
        event.stopPropagation();
        if (state.isMobileEntry) {
          enterSide(side, routes, root, panelCards, state);
          return;
        }
        navigateToSide(side, routes);
      }
    });
  });

  hero.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSide("tekno");
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSide("hiphop");
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSide("none");
      resetPointerMood(hero);
      return;
    }

    if (event.key === "1") {
      event.preventDefault();
      navigateToSide("tekno", routes);
      return;
    }

    if (event.key === "2") {
      event.preventDefault();
      navigateToSide("hiphop", routes);
      return;
    }

    if (event.key === "3" || event.key === "ArrowDown") {
      event.preventDefault();
      navigateToSide("villa", routes);
      return;
    }

    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      navigateToSide(state.activeSide === "none" ? "villa" : state.activeSide, routes);
      return;
    }

    if (state.activeSide !== "none") {
      trapTabBetweenCTAs(event, hero, allCtas, state.activeSide);
    }
  });

  window.addEventListener("pageshow", () => {
    resetEntryState(root, panelCards, state);
    setSide("none");
    resetPointerMood(hero);
  });
}
