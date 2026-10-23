"use client";
import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  MapPin,
  ArrowUpRight,
  Heart,
  Send,
  CalendarDays,
  ArrowDown,
} from "lucide-react";
import { buildCalendar } from "./calendar";
const A = "/assets/";
const weddingTime = Date.parse("2026-11-26T19:00:00+05:30");
// The supplied maps.app.goo.gl short link timed out during mobile QA.
// This direct route was verified against the venue shown by the embedded map.
const maps =
  "https://www.google.com/maps/dir//Golden+Blossom+Imperial+Resorts,+NH-28,+Faizabad+Rd,+Chinhat,+Lucknow,+Anora+Kala,+Uttar+Pradesh+226028,+India/@26.899688,81.096615,16z/data=!4m19!1m10!3m9!1s0x39995f5d9340c473:0xd04c8676415ea074!2sGolden+Blossom+Imperial+Resorts!5m2!4m1!1i2!8m2!3d26.8996876!4d81.096615!16s%2Fg%2F11f3n0tb4v!4m7!1m0!1m5!1m1!1s0x39995f5d9340c473:0xd04c8676415ea074!2m2!1d81.096615!2d26.8996876";
const events = [
  {
    name: "Mehendi",
    description: "A little henna, a little laughter, a whole lot of love",
    day: "WEDNESDAY",
    date: "25 November 2026",
    time: "12:00 PM",
    iso: "2026-11-25T12:00:00+05:30",
    photo: "heritage-smiles-v7.webp",
    alt: "Komal and Harsh smiling together in traditional attire",
  },
  {
    name: "Sangeet",
    description: "An evening of music, dancing and togetherness",
    day: "WEDNESDAY",
    date: "25 November 2026",
    time: "8:00 PM",
    iso: "2026-11-25T20:00:00+05:30",
    photo: "garden-dance-v7.webp",
    alt: "Komal and Harsh holding hands and dancing on the lawn",
  },
  {
    name: "Haldi",
    description: "Golden hues and the warmth of your blessings",
    day: "THURSDAY",
    date: "26 November 2026",
    time: "11:00 AM",
    iso: "2026-11-26T11:00:00+05:30",
    photo: "picnic-embrace-v7.webp",
    alt: "Komal and Harsh laughing together at a sunset picnic",
  },
  {
    name: "Wedding",
    description: "With sacred vows, our forever begins",
    day: "THURSDAY",
    date: "26 November 2026",
    time: "7:00 PM",
    iso: "2026-11-26T19:00:00+05:30",
    photo: "heritage-embrace-v7.webp",
    alt: "Komal and Harsh embracing beside a carved heritage doorway",
  },
];
const photos = [
  {
    src: "heritage-embrace-v7.webp",
    caption: "A little closer, a little more in love",
    alt: "Komal and Harsh embracing beside a carved heritage doorway",
    width: 1066, height: 1600, position: "50% 65%",
  },
  {
    src: "picnic-embrace-v7.webp",
    caption: "Together, our favourite place to be",
    alt: "Komal and Harsh smiling at each other during a sunset picnic",
    width: 1066, height: 1600, position: "50% 78%",
  },
  {
    src: "heritage-walk-v7.webp",
    caption: "Hand in hand, into our forever",
    alt: "Komal and Harsh walking hand in hand in traditional attire",
    width: 1066, height: 1600, position: "50% 70%",
  },
  {
    src: "garden-dance-v7.webp",
    caption: "Our kind of happiness",
    alt: "Komal and Harsh holding hands and dancing on the lawn",
    width: 1066, height: 1600, position: "50% 65%",
  },
  {
    src: "heritage-smiles-v7.webp",
    caption: "The smiles we share",
    alt: "Komal playfully touching Harsh’s cheek outside a heritage doorway",
    width: 1066, height: 1600, position: "50% 65%",
  },
  {
    src: "picnic-letter-v7.webp",
    caption: "A love story, one page at a time",
    alt: "Komal and Harsh reading together on a picnic blanket",
    width: 1066, height: 692, position: "32% 50%",
  },
];

function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span />❀<span />
    </div>
  );
}
function useScrollEntrance(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const show = () => {
      el.classList.remove("is-pending");
      el.classList.add("is-visible");
    };
    const setup = () => {
      observer?.disconnect();
      // Already-visible content and headings inside a reveal stay readable.
      if (reducedMotion.matches || el.parentElement?.closest(".reveal") ||
          el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        show();
        return;
      }
      el.classList.remove("is-visible");
      el.classList.add("is-pending");
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer?.unobserve(el);
        }
      }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
      observer.observe(el);
    };
    setup();
    reducedMotion.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener("change", setup);
      el.classList.remove("is-pending", "is-visible");
    };
  }, [ref]);
}
function Heading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  const ref = useRef<HTMLElement>(null);
  useScrollEntrance(ref);
  return (
    <header ref={ref} className="section-heading scroll-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <Divider />
    </header>
  );
}
function Reveal({
  children,
  className = "",
  motion = "rise",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  motion?: "rise" | "left" | "right" | "zoom";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollEntrance(ref);
  return (
    <div ref={ref} className={"reveal " + className} data-motion={motion}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}
function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={i % 3 === 0 ? "leaf" : "petal"}
          style={{
            left: `${(i * 23 + 7) % 100}%`,
            animationDelay: `-${i * 2.9}s`,
            animationDuration: `${18 + (i % 5) * 3}s`,
          }}
        />
      ))}
    </div>
  );
}
function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, weddingTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const values =
    remaining === null
      ? ["—", "—", "—", "—"]
      : [
          Math.floor(remaining / 86400000),
          Math.floor(remaining / 3600000) % 24,
          Math.floor(remaining / 60000) % 60,
          Math.floor(remaining / 1000) % 60,
        ].map((n) => String(n).padStart(2, "0"));
  return (
    <>
      <div className="countdown" aria-label="Countdown to the wedding">
        {values.map((v, i) => (
          <div key={i}>
            <strong>{v}</strong>
            <span>{["Days", "Hours", "Minutes", "Seconds"][i]}</span>
          </div>
        ))}
      </div>
      {remaining === 0 && (
        <p className="countdown-note">Our forever has begun.</p>
      )}
    </>
  );
}
function ScratchDate() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pressed = useRef(false);
  const lastSample = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = canvas.current;
    if (!el || revealed) return;
    const draw = () => {
      const r = el.getBoundingClientRect();
      el.width = Math.round(r.width * devicePixelRatio);
      el.height = Math.round(r.height * devicePixelRatio);
      const c = el.getContext("2d");
      if (!c) return;
      c.scale(devicePixelRatio, devicePixelRatio);
      const g = c.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, "#d4a574");
      g.addColorStop(0.45, "#f5d199");
      g.addColorStop(1, "#b8853f");
      c.fillStyle = g;
      c.fillRect(0, 0, r.width, r.height);
      c.fillStyle = "#fff8ed";
      c.textAlign = "center";
      c.font = "44px Georgia";
      c.fillText("✦", r.width / 2, r.height / 2 + 14);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [revealed]);
  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pressed.current) return;
    const el = e.currentTarget;
    const c = el.getContext("2d");
    if (!c) return;
    const r = el.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top;
    c.globalCompositeOperation = "destination-out";
    c.lineWidth = 50;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(last.current?.x ?? x, last.current?.y ?? y);
    c.lineTo(x, y);
    c.stroke();
    c.beginPath();
    c.arc(x, y, 25, 0, Math.PI * 2);
    c.fill();
    last.current = { x, y };
    if (performance.now() - lastSample.current < 100) return;
    lastSample.current = performance.now();
    const pixels = c.getImageData(0, 0, el.width, el.height).data;
    let clear = 0,
      total = 0;
    for (let i = 3; i < pixels.length; i += 256) {
      total++;
      if (pixels[i] < 40) clear++;
    }
    if (clear / total > 0.09) setRevealed(true);
  };
  return (
    <>
      <div className={"scratch-wrap " + (revealed ? "revealed" : "")}>
        <div className="date-card">
          <p className="eyebrow">Save the date</p>
          <p>25th &amp; 26th November 2026</p>
        </div>
        {!revealed && (
          <>
            <canvas
              ref={canvas}
              aria-hidden="true"
              onPointerDown={(e) => {
                pressed.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                scratch(e);
              }}
              onPointerMove={scratch}
              onPointerUp={() => {
                pressed.current = false;
                last.current = null;
              }}
              onPointerCancel={() => {
                pressed.current = false;
                last.current = null;
              }}
            />
            <span className="scratch-hint">✧ SCRATCH TO REVEAL ✧</span>
          </>
        )}
        {revealed && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i
                key={i}
                style={
                  {
                    "--angle": `${i * 15}deg`,
                    "--distance": `${110 + (i % 5) * 24}px`,
                    background: ["#c75a6b", "#d4a574", "#7a8a6a"][i % 3],
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>
      {!revealed && (
        <button
          className="text-button reveal-date"
          onClick={() => setRevealed(true)}
        >
          Or tap to reveal the date
        </button>
      )}
      <div
        className={"countdown-region " + (revealed ? "show" : "")}
        aria-hidden={!revealed}
      >
        {revealed && <Countdown />}
      </div>
    </>
  );
}
function Gallery() {
  const rail = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0),
    [selected, setSelected] = useState<number | null>(null);
  const close = useCallback(() => {
    dialog.current?.close();
    setSelected(null);
    document.body.style.overflow = "";
    trigger.current?.focus();
  }, []);
  const go = (i: number) => {
    const next = (i + photos.length) % photos.length;
    const item = rail.current?.children[next] as HTMLElement;
    if (item && rail.current)
      rail.current.scrollTo({
        left:
          item.offsetLeft - (rail.current.clientWidth - item.offsetWidth) / 2,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    setActive(next);
  };
  useEffect(() => {
    if (selected === null) return;
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);
  return (
    <section id="gallery" className="gallery-section">
      <div className="wide">
        <Heading eyebrow="Captured moments" title="Moments of Love" />
        <Reveal>
          <div className="gallery-stage">
            <div
              ref={rail}
              className="gallery-rail"
              onScroll={() => {
                const el = rail.current;
                if (!el) return;
                const mid = el.scrollLeft + el.clientWidth / 2;
                let idx = 0,
                  d = Infinity;
                Array.from(el.children).forEach((item, i) => {
                  const n = item as HTMLElement,
                    delta = Math.abs(n.offsetLeft + n.offsetWidth / 2 - mid);
                  if (delta < d) {
                    idx = i;
                    d = delta;
                  }
                });
                setActive(idx);
              }}
            >
              {photos.map((photo, i) => (
                <button
                  key={photo.src}
                  className={"gallery-card " + (active === i ? "active" : "")}
                  aria-label={`Open photo ${i + 1}: ${photo.alt}`}
                  onClick={(e) => {
                    trigger.current = e.currentTarget;
                    setSelected(i);
                  }}
                >
                  <img
                    src={A + photo.src}
                    srcSet={`${A + photo.src.replace(".webp", "-tiny.webp")} 400w, ${A + photo.src.replace(".webp", "-small.webp")} 640w, ${A + photo.src} 1066w`}
                    sizes="(max-width: 767px) 76vw, 310px"
                    style={{ objectPosition: photo.position }}
                    alt={photo.alt}
                    loading="lazy"
                    width={photo.width}
                    height={photo.height}
                  />
                  <span className="zoom-hint">View photograph</span>
                </button>
              ))}
            </div>
            <button
              className="round gallery-prev"
              aria-label="Previous photograph"
              onClick={() => go(active - 1)}
            >
              <ChevronLeft />
            </button>
            <button
              className="round gallery-next"
              aria-label="Next photograph"
              onClick={() => go(active + 1)}
            >
              <ChevronRight />
            </button>
          </div>
          <p className="gallery-caption" aria-live="polite">
            {photos[active].caption}
          </p>
          <div className="dots">
            {photos.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to photograph ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => go(i)}
              >
                <span />
              </button>
            ))}
          </div>
        </Reveal>
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight")
            setSelected((i) => (i === null ? null : (i + 1) % photos.length));
          if (e.key === "ArrowLeft")
            setSelected((i) =>
              i === null ? null : (i + photos.length - 1) % photos.length,
            );
        }}
      >
        <button
          className="round lightbox-close"
          aria-label="Close photograph"
          onClick={close}
        >
          <X />
        </button>
        {selected !== null && (
          <div className="lightbox-inner">
            <button
              className="round"
              aria-label="Previous full-size photograph"
              onClick={() =>
                setSelected((selected + photos.length - 1) % photos.length)
              }
            >
              <ChevronLeft />
            </button>
            <figure
              onTouchStart={(e) => {
                touchStart.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                };
              }}
              onTouchEnd={(e) => {
                if (!touchStart.current) return;
                const dx = e.changedTouches[0].clientX - touchStart.current.x;
                const dy = e.changedTouches[0].clientY - touchStart.current.y;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
                  setSelected(
                    (selected + (dx < 0 ? 1 : photos.length - 1)) %
                      photos.length,
                  );
                touchStart.current = null;
              }}
            >
              <img
                key={photos[selected].src}
                src={A + photos[selected].src}
                alt={photos[selected].alt}
              />
              <figcaption>
                {photos[selected].caption} · {selected + 1} / {photos.length}
              </figcaption>
            </figure>
            <button
              className="round"
              aria-label="Next full-size photograph"
              onClick={() => setSelected((selected + 1) % photos.length)}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}
function calendarDownload() {
  const content = buildCalendar(events);
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "komal-harsh-wedding.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type Wish = { id: string; name: string; message: string; createdAt: number };
function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>([]),
    [status, setStatus] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [active, setActive] = useState(0),
    [loadError, setLoadError] = useState(false);
  const requestId = useRef<string | null>(null);
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/wishes");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { wishes: Wish[] };
      setWishes(data.wishes);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);
  useEffect(() => {
    if (wishes.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % wishes.length),
      6000,
    );
    return () => clearInterval(id);
  }, [wishes.length]);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget,
      data = new FormData(form);
    requestId.current ??= crypto.randomUUID();
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId.current,
          name: data.get("name"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      const reply = (await res.json()) as { error?: string };
      if (!res.ok)
        throw new Error(
          reply.error || "Unable to send your wish. Please try again.",
        );
      form.reset();
      requestId.current = null;
      setStatus("Your wish has been received. Thank you for the love!");
      await load();
      setActive(0);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to send your wish. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const shown = wishes[active % Math.max(1, wishes.length)];
  return (
    <section id="wishes" className="wishes-section">
      <div className="narrow">
        <Reveal>
          <form onSubmit={submit} className="wish-form">
            <p className="eyebrow">A little note, a lot of love</p>
            <h2>Send Your Wishes</h2>
            <Divider />
            <label htmlFor="guest-name">
              Your name <span aria-hidden="true">*</span>
            </label>
            <input
              id="guest-name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              placeholder="Your name"
            />
            <label htmlFor="guest-message">
              Wishes &amp; messages <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="guest-message"
              name="message"
              required
              minLength={3}
              maxLength={800}
              rows={4}
              placeholder="Leave a little love for Komal & Harsh…"
            />
            <div className="honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <p className="form-note">
              Your name and message will appear on the wishes wall.
            </p>
            <button className="pill primary" type="submit" disabled={busy}>
              <Send size={16} />
              {busy ? "Sending your wish…" : "Send wish"}
            </button>
            <p className="form-status" role="status">
              {status}
            </p>
          </form>
        </Reveal>
        <Reveal className="wish-wall">
          <Heading
            eyebrow="From our loved ones"
            title="Wishes for the Couple"
          />
          {loading ? (
            <p>Gathering your lovely wishes…</p>
          ) : loadError ? (
            <p>
              We couldn’t load the wishes just now.{" "}
              <button className="text-button" onClick={load}>
                Try again
              </button>
            </p>
          ) : shown ? (
            <>
              <div className="wish-quote">
                <Heart aria-hidden="true" />
                <blockquote>“{shown.message}”</blockquote>
                <p className="eyebrow">— {shown.name}</p>
              </div>
              {wishes.length > 1 && (
                <div className="wish-controls">
                  <button
                    className="round"
                    aria-label="Previous wish"
                    onClick={() =>
                      setActive((i) => (i + wishes.length - 1) % wishes.length)
                    }
                  >
                    <ChevronLeft />
                  </button>
                  <span>
                    {(active % wishes.length) + 1} / {wishes.length}
                  </span>
                  <button
                    className="round"
                    aria-label="Next wish"
                    onClick={() => setActive((i) => (i + 1) % wishes.length)}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-wishes">
              <Heart />
              <p>The first wish is waiting to be yours.</p>
              <p>Leave a message for the beginning of their forever.</p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
export default function Invitation() {
  const [opened, setOpened] = useState(false),
    [opening, setOpening] = useState(false),
    [introVisible, setIntroVisible] = useState(true),
    [videoWaiting, setVideoWaiting] = useState(false),
    [music, setMusic] = useState(false);
  const audio = useRef<HTMLAudioElement>(null),
    video = useRef<HTMLVideoElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    hero = useRef<HTMLElement>(null);
  const finish = useCallback(() => {
    setOpened(true);
    video.current?.pause();
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    if (opened) hero.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = "";
      if (timer.current) clearTimeout(timer.current);
    };
  }, [opened]);
  useEffect(() => {
    if (!opened) return;
    const id = setTimeout(() => setIntroVisible(false), 650);
    return () => clearTimeout(id);
  }, [opened]);
  const open = () => {
    if (opening) return;
    setOpening(true);
    setVideoWaiting(true);
    if (audio.current) {
      audio.current.volume = 0.2;
      audio.current
        .play()
        .then(() => setMusic(true))
        .catch(() => setMusic(false));
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    timer.current = setTimeout(finish, 12000);
    if (video.current) {
      video.current.play().catch(finish);
    }
  };
  const toggleMusic = () => {
    if (!audio.current) return;
    if (music) {
      audio.current.pause();
      setMusic(false);
    } else
      audio.current
        .play()
        .then(() => setMusic(true))
        .catch(() => setMusic(false));
  };
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={A + "hero-mobile-v7.webp"}
        media="(max-width:1023px)"
      />
      <link
        rel="preload"
        as="image"
        href={A + "hero-desktop-v7.webp"}
        media="(min-width:1024px)"
      />
      <audio
        ref={audio}
        src={A + "ishq-hai-from-38s.mp3"}
        loop
        preload="metadata"
        onPlay={() => setMusic(true)}
        onPause={() => setMusic(false)}
        onError={() => setMusic(false)}
      />
      {introVisible && (
        <div
          className={
            "envelope " +
            (opening ? "opening " : "") +
            (opened ? "envelope-leaving" : "")
          }
          inert={opened}
          aria-hidden={opened}
        >
          <video
            ref={video}
            poster={A + "opening-poster-v7.webp"}
            src={A + "opening-centered-v4.mp4"}
            muted
            playsInline
            preload="auto"
            onPlaying={() => setVideoWaiting(false)}
            onWaiting={() => setVideoWaiting(true)}
            onEnded={finish}
            onError={() => {
              if (opening) finish();
            }}
            aria-hidden="true"
          />
          <button
            className="envelope-open"
            onClick={open}
            aria-label="Open Komal and Harsh’s wedding invitation"
            disabled={opening}
          >
            <span className="tap-pill">
              ✦ &nbsp; {opening ? "Opening your invitation" : "Tap here"} &nbsp;
              ✦
            </span>
          </button>
          {opening && videoWaiting && !opened && (
            <p className="intro-loading" role="status">
              Preparing your invitation…
            </p>
          )}
          {opening && (
            <button className="skip-intro" onClick={finish}>
              Skip introduction
            </button>
          )}
        </div>
      )}
      {opened && (
        <>
          <a href="#events" className="skip-link">
            Skip to wedding events
          </a>
          <Petals />
          <button
            className="music-toggle round"
            aria-label={
              music ? "Mute background music" : "Play background music"
            }
            onClick={toggleMusic}
          >
            {music ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <main>
            <section ref={hero} tabIndex={-1} className="hero">
              <picture>
                <source
                  media="(min-width:1024px)"
                  srcSet={A + "hero-desktop-v7.webp"}
                />
                <img
                  className="hero-backdrop"
                  src={A + "hero-mobile-v7.webp"}
                  alt=""
                  width="720"
                  height="1280"
                  fetchPriority="high"
                />
              </picture>
              <div className="hero-wash" />
              <div className="hero-content">
                <img
                  className="ganesha"
                  src={A + "ganesha-v7.webp"}
                  alt="Lord Ganesha"
                  width="144"
                  height="144"
                />
                <p className="blessing">‖ Shree Ganeshaya Namah ‖</p>
                <p className="invite-copy">
                  We cordially invite you to witness the beginning of our
                  forever and celebrate the wedding ceremony of
                </p>
                <h1>
                  <span>Komal</span>
                  <span className="sr-only"> Dewani and Harsh Gurnani</span>
                </h1>
                <p className="parents">
                  D/o Mr. Purshotam Das Dewani
                  <br />
                  &amp; Mrs. Geeta Dewani
                </p>
                <p className="with">with</p>
                <p className="groom-name">Harsh</p>
                <p className="parents">
                  S/o Mr. Sunil Gurnani
                  <br />
                  &amp; Mrs. Varsha Gurnani
                </p>
              </div>
              <a
                className="scroll-cue"
                href="#save-date"
                aria-label="Continue to save the date"
              >
                <ArrowDown size={18} />
              </a>
            </section>
            <section className="section save-date" id="save-date">
              <Reveal className="narrow" motion="zoom">
                <Divider />
                <ScratchDate />
              </Reveal>
            </section>
            <section className="section couple-section" id="couple">
              <div className="wide">
                <Heading title="Meet the Couple" />
                <Reveal className="couple-row" motion="left">
                  <div className="portrait-frame">
                    <img
                      src={A + "komal-portrait-v7.webp"}
                      srcSet={`${A}komal-portrait-v7-small.webp 400w, ${A}komal-portrait-v7.webp 800w`}
                      sizes="(max-width: 767px) min(340px, calc(100vw - 44px)), 340px"
                      decoding="async"
                      alt="Komal Dewani, the bride"
                      width="800"
                      height="800"
                      loading="lazy"
                    />
                  </div>
                  <div className="couple-copy">
                    <p className="eyebrow">The bride</p>
                    <h3>Komal Dewani</h3>
                    <p>
                      Daughter of
                      <br />
                      Mr. Purshotam Das Dewani
                      <br />
                      &amp; Mrs. Geeta Dewani
                    </p>
                    <Divider />
                  </div>
                </Reveal>
                <Reveal className="couple-row reverse" motion="right">
                  <div className="portrait-frame">
                    <img
                      src={A + "harsh-portrait-v7.webp"}
                      srcSet={`${A}harsh-portrait-v7-small.webp 400w, ${A}harsh-portrait-v7.webp 800w`}
                      sizes="(max-width: 767px) min(340px, calc(100vw - 44px)), 340px"
                      decoding="async"
                      alt="Harsh Gurnani, the groom"
                      width="800"
                      height="800"
                      loading="lazy"
                    />
                  </div>
                  <div className="couple-copy">
                    <p className="eyebrow">The groom</p>
                    <h3>Harsh Gurnani</h3>
                    <p>
                      Son of
                      <br />
                      Mr. Sunil Gurnani
                      <br />
                      &amp; Mrs. Varsha Gurnani
                    </p>
                    <Divider />
                  </div>
                </Reveal>
                <Reveal>
                  <blockquote className="couple-quote">
                    “Together with our families, we invite you to share in our
                    joy, our laughter, and the beginning of our forever.”
                  </blockquote>
                </Reveal>
              </div>
            </section>
            <section className="forever-section">
              <Reveal className="narrow" motion="zoom">
                <Heading eyebrow="A new chapter" title="Our Forever Begins" />
                <p className="intro">
                  Two hearts, two families, and a lifetime of moments to come.
                </p>
                <figure className="forever-photo">
                  <img
                    src={A + "heritage-walk-v7.webp"}
                    srcSet={`${A}heritage-walk-v7-tiny.webp 400w, ${A}heritage-walk-v7-small.webp 640w, ${A}heritage-walk-v7.webp 1066w`}
                    sizes="(max-width: 767px) calc(100vw - 62px), 532px"
                    decoding="async"
                    alt="Komal and Harsh walking hand in hand, wearing a rose sari and white kurta"
                    width="1066"
                    height="1600"
                    loading="lazy"
                  />
                </figure>
                <p className="script-note">
                  We can’t wait to celebrate with you.
                </p>
              </Reveal>
            </section>
            <Gallery />
            <section id="events" className="section events-section">
              <div className="wide">
                <Heading
                  eyebrow="25 & 26 November 2026"
                  title="Events Schedule"
                />
                <p className="intro">
                  Four celebrations. Countless memories.
                  <br />
                  All events at Golden Blossom Imperial Resort, Lucknow.
                </p>
                <div className="events-grid">
                  {events.map((event, i) => (
                    <Reveal key={event.name} motion={i % 2 === 0 ? "left" : "right"} delay={(i % 2) * 140}>
                      <article className={"event-card event-" + i}>
                        <div className="event-art">
                          <img
                            src={A + event.photo}
                            srcSet={`${A + event.photo.replace(".webp", "-tiny.webp")} 400w, ${A + event.photo.replace(".webp", "-small.webp")} 640w, ${A + event.photo} 1066w`}
                            sizes="(max-width: 767px) calc(100vw - 44px), 500px"
                            alt={event.alt}
                            width="1066"
                            height="1600"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="event-copy">
                          <h3>{event.name}</h3>
                          <p className="event-description">
                            {event.description}
                          </p>
                          <Divider />
                          <dl>
                            <dt>Date</dt>
                            <dd>
                              <span>{event.day}</span>
                              {event.date}
                            </dd>
                            <dt>Time</dt>
                            <dd>{event.time} onwards</dd>
                            <dt>Venue</dt>
                            <dd>
                              Golden Blossom Imperial Resort
                              <br />
                              Lucknow
                            </dd>
                          </dl>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
                <button className="pill calendar" onClick={calendarDownload}>
                  <CalendarDays size={17} />
                  Save the celebrations
                </button>
                <p className="small-note">
                  All times are in India Standard Time (IST).
                </p>
              </div>
            </section>
            <section className="presence-section">
              <Reveal className="narrow">
                <Heading title="Awaiting Your Noble Presence" />
                <p>
                  Your presence will make our celebration complete.
                  <br />
                  Join us with your love, laughter and blessings.
                </p>
              </Reveal>
            </section>
            <section className="section families-section">
              <div className="wide">
                <Heading eyebrow="With love" title="The Families" />
                <div className="families-grid">
                  {[
                    {
                      title: "Bride’s family",
                      names: ["Mr. Purshotam Das Dewani", "Mrs. Geeta Dewani"],
                    },
                    {
                      title: "Groom’s family",
                      names: ["Mr. Sunil Gurnani", "Mrs. Varsha Gurnani"],
                    },
                  ].map((f) => (
                    <Reveal key={f.title} motion="zoom">
                      <article className="family-card">
                        <p className="eyebrow">{f.title}</p>
                        <Divider />
                        <p className="family-invite">
                          Awaiting your gracious presence
                        </p>
                        {f.names.map((n) => (
                          <p key={n}>{n}</p>
                        ))}
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
            <Wishes />
            <section id="venue" className="section venue-section">
              <Reveal className="wide">
                <Heading eyebrow="Venue" title="Where We Celebrate" />
                <p className="venue-name">Golden Blossom Imperial Resort</p>
                <p className="venue-city">Lucknow, Uttar Pradesh</p>
                <div className="map-frame">
                  <iframe
                    title="Golden Blossom Imperial Resort, Lucknow map"
                    src="https://www.google.com/maps?q=Golden%20Blossom%20Imperial%20Resort%20Lucknow&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <a
                  className="pill primary"
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={17} />
                  Get directions
                  <ArrowUpRight size={16} />
                </a>
              </Reveal>
            </section>
            <footer>
              <p className="eyebrow">With love</p>
              <h2>Komal &amp; Harsh</h2>
              <Divider />
              <p>25th &amp; 26th November 2026</p>
              <p className="hashtag">#kompletelyharsh</p>
              <p className="footer-flourish" aria-hidden="true">
                ❀
              </p>
              <a
                className="contact-cta"
                href={`https://wa.me/919455349613?text=${encodeURIComponent("Hi Festeve360! I’m interested in getting a wedding invitation card made. Could you please share the details and pricing?")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Festeve360 on WhatsApp at 9455349613"
              >
                <span>For a card like this, contact</span>
                <strong>Festeve360 · 9455349613</strong>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </footer>
          </main>
        </>
      )}
    </>
  );
}
