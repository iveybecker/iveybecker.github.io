// ===== Contact form settings =====
// Messages go through Formspree (https://formspree.io), which forwards them to
// Ivey's inbox, so no email address appears anywhere in the site's code.
// Paste the form's endpoint here, e.g. "https://formspree.io/f/abcd1234".
const FORM_ENDPOINT = "";

// ===== Burger menu =====
const header = document.querySelector(".site-header");
const burger = document.querySelector(".burger");
const nav = document.getElementById("site-nav");

function setMenu(open) {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
}

burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    setMenu(false);
    burger.focus();
  }
});
document.addEventListener("click", (e) => {
  if (nav.classList.contains("open") && !header.contains(e.target)) setMenu(false);
});
window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => {
  if (e.matches) setMenu(false);
});

// Header border once you scroll
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Active nav link for the section on screen =====
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => observer.observe(s));

// Clear the highlight when back at the hero
const hero = document.getElementById("top");
new IntersectionObserver(
  ([entry]) => { if (entry.isIntersecting) navLinks.forEach((a) => a.classList.remove("active")); },
  { rootMargin: "-45% 0px -50% 0px" }
).observe(hero);

// ===== Experience timeline: fade cards in as you scroll =====
const tlItems = document.querySelectorAll(".tl-item");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("js");
  const reveal = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        reveal.unobserve(entry.target);
      }
    }),
    { rootMargin: "0px 0px -10% 0px" }
  );
  tlItems.forEach((item) => reveal.observe(item));
}

// ===== Contact form =====
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = form.querySelector('button[type="submit"]');

const rules = {
  name: (v) => (v.trim() ? "" : "Please enter your name."),
  email: (v) =>
    !v.trim() ? "Please enter your email."
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "That email doesn't look quite right.",
  message: (v) => (v.trim().length >= 5 ? "" : "Please write a short message."),
};

function validateField(input) {
  const msg = rules[input.name](input.value);
  document.getElementById(input.name + "-error").textContent = msg;
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}

Object.keys(rules).forEach((name) => {
  const input = form.elements[name];
  input.addEventListener("blur", () => input.value && validateField(input));
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") validateField(input);
  });
});

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = "form-status" + (type ? " " + type : "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const inputs = Object.keys(rules).map((n) => form.elements[n]);
  const valid = inputs.map(validateField).every(Boolean);
  if (!valid) {
    inputs.find((i) => i.getAttribute("aria-invalid") === "true").focus();
    return;
  }

  const data = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    message: form.elements.message.value.trim(),
  };

  // Hidden "bot trap" field: people never see it, bots fill it in
  if (form.elements._gotcha.value) {
    form.reset();
    setStatus("Thank you! Your message is on its way.", "success");
    return;
  }
  if (!FORM_ENDPOINT) {
    setStatus("The contact form isn't connected yet. Please reach out on LinkedIn for now.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  setStatus("");
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...data, _subject: `Website message from ${data.name}` }),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    setStatus("Thank you! Your message is on its way. ✿", "success");
  } catch {
    setStatus("Something went wrong sending your message. Please try again in a moment, or reach me on LinkedIn.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
