const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const salesVideo = document.querySelector(".sales-video");
const soundToggle = document.querySelector(".sound-toggle");
const heroMedia = document.querySelector(".hero__media");

if (heroMedia && "IntersectionObserver" in window) {
  const videoExitObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      document.body.classList.toggle("has-passed-video", entry.boundingClientRect.bottom <= 0);
    });
  });

  videoExitObserver.observe(heroMedia);
}

if (salesVideo && soundToggle) {
  const soundLabel = soundToggle.querySelector("span");

  const syncSoundToggle = () => {
    const isPlaying = !salesVideo.paused && !salesVideo.ended;
    const isMuted = salesVideo.muted || salesVideo.volume === 0 || !isPlaying;
    soundToggle.classList.toggle("is-muted", isMuted);
    soundToggle.setAttribute("aria-pressed", String(isPlaying && !isMuted));
    soundToggle.setAttribute("aria-label", !isPlaying ? "Reproducir el video con sonido" : isMuted ? "Activar sonido del video" : "Silenciar el video");
    soundLabel.textContent = !isPlaying ? "Reproducir con sonido" : isMuted ? "Activar sonido" : "Silenciar";
  };

  soundToggle.addEventListener("click", async () => {
    const enableSound = salesVideo.muted || salesVideo.volume === 0;
    if (salesVideo.paused || salesVideo.ended || enableSound) {
      salesVideo.removeAttribute("muted");
      salesVideo.muted = false;
      if (salesVideo.volume === 0) salesVideo.volume = 1;
      if (salesVideo.paused || salesVideo.ended) {
        try {
          await salesVideo.play();
        } catch {
          syncSoundToggle();
          return;
        }
      }
    } else {
      salesVideo.muted = true;
    }
    syncSoundToggle();
  });

  ["play", "pause", "ended", "volumechange"].forEach((eventName) => {
    salesVideo.addEventListener(eventName, syncSoundToggle);
  });
  syncSoundToggle();
}

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const toast = document.querySelector(".toast");
let toastTimer;

document.querySelectorAll("[data-purchase]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (!toast) return;

    toast.textContent = "El enlace de pago debe configurarse antes de publicar esta página.";
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
  });
});