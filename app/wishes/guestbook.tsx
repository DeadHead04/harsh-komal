"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Heart, Languages, RefreshCw, Search, X } from "lucide-react";
import styles from "./wishes.module.css";

type Translation = { name: string; message: string; language: string };
type Wish = { id: string; name: string; message: string; createdAt: number; translation?: Translation | null };
type GuestbookData = { wishes: Wish[]; total: number; matched: number; page: number; pages: number; pageSize: number };
const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join("").toLocaleUpperCase();

let translationQueue: Promise<unknown> = Promise.resolve();
function requestTranslation(id: string): Promise<Translation> {
  const job = translationQueue.catch(() => {}).then(async () => {
    const response = await fetch("/api/wishes/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Translation is unavailable. Please try again.");
    return result.translation as Translation;
  });
  translationQueue = job;
  return job;
}
const hasNonLatinLetters = (text: string) => Array.from(text).some(char => /\p{Letter}/u.test(char) && !/\p{Script=Latin}/u.test(char));

function WishCard({ wish }: { wish: Wish }) {
  const [expanded, setExpanded] = useState(false);
  const [translation, setTranslation] = useState<Translation | null>(wish.translation || null);
  const [english, setEnglish] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const shownMessage = english && translation ? translation.message : wish.message;
  const shownName = english && translation ? translation.name : wish.name;
  async function toggleTranslation() {
    if (english && translation) { setEnglish(false); return; }
    if (translation) { setEnglish(true); return; }
    setTranslating(true);
    setTranslationError("");
    try {
      setTranslation(await requestTranslation(wish.id));
      setEnglish(true);
    } catch (error) { setTranslationError(error instanceof Error ? error.message : "Please try again."); }
    finally { setTranslating(false); }
  }
  useEffect(() => {
    if (wish.translation) { setTranslation(wish.translation); return; }
    if (!hasNonLatinLetters(wish.name + wish.message)) return;
    let cancelled = false;
    setTranslating(true);
    requestTranslation(wish.id)
      .then(value => { if (!cancelled) { setTranslation(value); setTranslationError(""); } })
      .catch(() => { if (!cancelled) setTranslationError("English translation is unavailable just now. Showing the original; you can try again."); })
      .finally(() => { if (!cancelled) setTranslating(false); });
    return () => { cancelled = true; };
  }, [wish.id, wish.name, wish.message, wish.translation?.message]);
  const [truncated, setTruncated] = useState(false);
  const message = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const element = message.current;
    if (!element || expanded) return;
    const measure = () => setTruncated(element.scrollHeight > element.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [shownMessage, expanded]);
  return (
    <article className={styles.note}>
      <header className={styles.noteHeader}>
        <span className={styles.avatar} aria-hidden="true">{initials(shownName)}</span>
        <div><h3 dir="auto">{shownName}</h3><time dateTime={new Date(wish.createdAt).toISOString()}>{date.format(wish.createdAt)} <span aria-hidden="true">·</span> {time.format(wish.createdAt)} IST</time></div>
      </header>
      <p id={`wish-${wish.id}`} ref={message} dir="auto" lang={english && translation ? "en" : undefined} className={`${styles.message} ${expanded ? "" : styles.collapsed}`}>{shownMessage}</p>
      {(truncated || expanded) && <button className={styles.readMore} aria-expanded={expanded} aria-controls={`wish-${wish.id}`} onClick={() => setExpanded(value => !value)}>{expanded ? "Show less" : "Read full wish"}</button>}
      <button className={styles.translate} onClick={toggleTranslation} disabled={translating} aria-pressed={english && !!translation}><Languages size={15} aria-hidden="true" />{translating ? "Translating…" : english && translation ? "Show original" : "Translate to English"}</button>
      {english && translation && <p className={styles.translationNote}>{translation.language === "English" ? "This wish is already in English." : `Translated from ${translation.language} · AI translation`}</p>}
      {translationError && <p className={styles.translationError} role="status">{translationError}</p>}
      <footer className={styles.noteFooter}><span className={styles.line} /><Heart size={14} aria-hidden="true" /><span>With love</span></footer>
    </article>
  );
}

export default function Guestbook() {
  const [data, setData] = useState<GuestbookData | null>(null);
  const [draft, setDraft] = useState("");
  const [filters, setFilters] = useState({ query: "", order: "newest", page: 1 });
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const lastRequest = useRef(0);
  const listHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setFilters(previous => previous.query === draft.trim() ? previous : { ...previous, query: draft.trim(), page: 1 }), 300);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    const controller = new AbortController();
    lastRequest.current = Date.now();
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ view: "guestbook", q: filters.query, order: filters.order, page: String(filters.page) });
    fetch(`/api/wishes?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(response => { if (!response.ok) throw new Error("Unavailable"); return response.json(); })
      .then((result: GuestbookData) => { if (!controller.signal.aborted) { setData(result); setUpdatedAt(Date.now()); } })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, refresh]);

  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRequest.current >= 10000) setRefresh(value => value + 1);
    };
    const timer = setInterval(update, 30000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    window.addEventListener("online", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
      window.removeEventListener("online", update);
    };
  }, []);

  function changePage(page: number) {
    setFilters(previous => ({ ...previous, page }));
    listHeading.current?.focus({ preventScroll: true });
    listHeading.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }

  return (
    <main className={styles.page}>
      <a className={styles.skip} href="#guestbook">Skip to wishes</a>
      <nav className={styles.nav} aria-label="Guestbook navigation">
        <a href="/" className={styles.back}><ArrowLeft size={17} aria-hidden="true" /><span>The invitation</span></a>
        <a href="/" className={styles.monogram} aria-label="Komal and Harsh invitation">K<span>&amp;</span>H</a>
        <span className={styles.navDate}>25–26 NOV 2026</span>
      </nav>

      <header className={styles.hero}>
        <picture className={styles.art}>
          <source media="(max-width: 640px)" srcSet="/assets/wishes-hero-v1-small.webp" />
          <img src="/assets/wishes-hero-v1.webp" alt="" width="1200" height="800" fetchPriority="high" />
        </picture>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>THE WEDDING GUESTBOOK</p>
          <h1>Words to <em>cherish.</em></h1>
          <p className={styles.couple}>For Komal &amp; Harsh</p>
          <p className={styles.intro}>A little love. A heartfelt blessing.<br />Every word, a part of our forever.</p>
          <div className={styles.heroDetail}><Heart size={15} aria-hidden="true" /><span>25 &amp; 26 November 2026 <span aria-hidden="true">·</span> Lucknow</span></div>
        </div>
      </header>

      <section className={styles.collection} aria-labelledby="guestbook">
        <div className={styles.collectionTop}>
          <div>
            <p className={styles.eyebrow}>FROM OUR LOVED ONES</p>
            <h2 id="guestbook" tabIndex={-1} ref={listHeading}>Love, in every note <span className={styles.count} aria-label={data ? `${data.total} wishes in total` : "Loading wish count"}>{data?.total ?? "—"}</span></h2>
          </div>
          <button className={styles.refresh} onClick={() => setRefresh(value => value + 1)} disabled={loading} aria-label="Refresh wishes"><RefreshCw size={16} aria-hidden="true" /><span>{loading ? "Updating…" : "Refresh"}</span></button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Search size={19} aria-hidden="true" />
            <label className={styles.srOnly} htmlFor="wish-search">Search wishes by guest name or message</label>
            <input id="wish-search" type="search" placeholder="Find a name or a message…" value={draft} maxLength={100} onChange={event => setDraft(event.target.value)} />
            {draft && <button onClick={() => setDraft("")} aria-label="Clear search"><X size={17} aria-hidden="true" /></button>}
          </div>
          <div className={styles.sort}>
            <label htmlFor="wish-sort">Sort by</label>
            <select id="wish-sort" value={filters.order} onChange={event => setFilters(previous => ({ ...previous, order: event.target.value, page: 1 }))}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <div className={styles.resultsLine}>
          <p role="status">{loading ? "Gathering your lovely wishes…" : error ? "Couldn’t update. Please refresh to try again." : data ? filters.query ? `${data.matched} ${data.matched === 1 ? "wish" : "wishes"} found` : `${data.total} ${data.total === 1 ? "wish" : "wishes"}, sent with love` : ""}</p>
          <span>Dates &amp; times in IST</span>
        </div>

        <p className={styles.autoUpdate}>Updates automatically every 30 seconds{updatedAt ? ` · Last updated ${time.format(updatedAt)} IST` : ""}</p>

        {error && !data ? (
          <div className={styles.empty} role="alert">
            <Heart size={28} aria-hidden="true" />
            <h3>A little pause</h3>
            <p>We couldn’t load the wishes. Please try again in a moment.</p>
            <button className={styles.action} onClick={() => setRefresh(value => value + 1)}>Try again</button>
          </div>
        ) : !data ? (
          <div className={styles.grid} aria-hidden="true">{[0, 1, 2].map(index => <div key={index} className={styles.skeleton}><span /><span /><span /></div>)}</div>
        ) : data.wishes.length === 0 ? (
          <div className={styles.empty}>
            <Heart size={28} aria-hidden="true" />
            <h3>{filters.query ? "No notes found" : "The first note is yours"}</h3>
            <p>{filters.query ? "Try another name or a few words from the message." : "Your kind words will find a home here. Leave a wish for Komal & Harsh in the invitation."}</p>
            {filters.query ? <button className={styles.action} onClick={() => setDraft("")}>Clear search</button> : <a className={styles.action} href="/#wishes">Open the invitation <ArrowUpRight size={16} aria-hidden="true" /></a>}
          </div>
        ) : (
          <div className={styles.grid} aria-busy={loading}>
            {data.wishes.map(wish => <WishCard key={wish.id} wish={wish} />)}
          </div>
        )}

        {!error && data && data.pages > 1 && (
          <nav className={styles.pagination} aria-label="Wishes pages">
            <button disabled={loading || data.page <= 1} onClick={() => changePage(data.page - 1)}><ChevronLeft size={17} aria-hidden="true" /> Previous</button>
            <span>Page {data.page} of {data.pages}</span>
            <button disabled={loading || data.page >= data.pages} onClick={() => changePage(data.page + 1)}>Next <ChevronRight size={17} aria-hidden="true" /></button>
          </nav>
        )}
      </section>

      <footer className={styles.footer}>
        <Heart size={22} strokeWidth={1.3} aria-hidden="true" />
        <p>Thank you for being part of our story.</p>
        <span>Komal &amp; Harsh</span>
        <a href="/">Back to the invitation <ArrowUpRight size={16} aria-hidden="true" /></a>
      </footer>
    </main>
  );
}
