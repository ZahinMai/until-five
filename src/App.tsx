import { useEffect, useState } from "react";

type Player = "monica" | "zahin";
type Screen = "welcome" | "today" | "detail" | "companion" | "explore" | "journal";
type Category = "main" | "side" | "shared";
type PlayerProgress = Record<Player, Set<string>>;

const PROGRESS_STORAGE_KEY = "until-five.quest-progress.v1";
const PLAYER_STORAGE_KEY = "until-five.selected-player";

function emptyPlayerProgress(): PlayerProgress {
  return { monica: new Set(), zahin: new Set() };
}

function parsePlayerProgress(value: string): PlayerProgress {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Saved quest progress has an invalid format.");
  }

  const record = parsed as Record<string, unknown>;
  const readPlayer = (player: Player) => {
    const quests = record[player];
    if (!Array.isArray(quests) || !quests.every((quest) => typeof quest === "string")) {
      throw new Error("Saved quest progress has an invalid format.");
    }
    return new Set<string>(quests);
  };

  return { monica: readPlayer("monica"), zahin: readPlayer("zahin") };
}

function serializePlayerProgress(progress: PlayerProgress): string {
  return JSON.stringify({
    monica: [...progress.monica],
    zahin: [...progress.zahin],
  });
}

type Quest = {
  id: string;
  title: string;
  time: string;
  art: string;
  category: Category;
  clue: string;
  place?: string;
  hint?: string;
  action: string;
  result: string;
  reward: string;
};

const monicaQuests: Quest[] = [
  {
    id: "arrive",
    title: "Arrive in London",
    time: "1pm",
    art: "case",
    category: "main",
    clue: "Get into London and make it to the coach station.",
    place: "London coach station",
    action: "Made it to London",
    result: "London: reached.",
    reward: "The adventure is officially in motion.",
  },
  {
    id: "lunch",
    title: "Get food",
    time: "1:30pm",
    art: "coffee",
    category: "main",
    clue: "Find something good to eat at Victoria Place.",
    place: "Victoria Place",
    action: "Food acquired",
    result: "A well-earned food stop.",
    reward: "Fuel for the rest of the adventure.",
  },
  {
    id: "meet-zahin",
    title: "Meet Zahin",
    time: "3pm",
    art: "people",
    category: "main",
    clue: "Make it to St Paul's station to meet Zahin.",
    place: "St Paul's station",
    action: "Met up with Zahin",
    result: "The team is back together.",
    reward: "Two adventurers are better than one.",
  },
  {
    id: "monica-office",
    title: "Get into Zahin's office",
    time: "3pm",
    art: "key",
    category: "main",
    clue: "Follow Zahin to his office at LSEG.",
    place: "Zahin's office, LSEG",
    action: "Made it into the office",
    result: "Office access: secured.",
    reward: "A brief pause before the main event.",
  },
  {
    id: "markets-talk",
    title: "Survive the financial markets talk",
    time: "5pm",
    art: "meeting",
    category: "main",
    clue: "You and Zahin: make it through the financial markets talk at LSEG.",
    place: "LSEG",
    action: "Survived the talk",
    result: "Financial markets: survived.",
    reward: "You both made it through. That's the important bit.",
  },
];

const zahinQuests: Quest[] = [
  ["office", "Make it to the office on time", "08:55", "train", "Arrive before the calendar does."],
  ["spill", "Don't spill coffee on clothes", "09:10", "coffee", "A white shirt. A full cup. High stakes."],
  ["standup", "Survive standup", "09:30", "people", "Say something useful. Or at least something brief."],
  ["stakeholder", "Meet Senior Stakeholder", "11:00", "meeting", "Nod thoughtfully. Deploy the good notebook."],
  ["lauron", "Get a meeting with Lauron", "13:30", "calendar", "Calendars are merely puzzles with worse colours."],
  ["slump", "Survive the 3pm slump", "15:00", "biscuit", "There may be biscuits. There had better be biscuits."],
  ["escape", "Escape at 5pm", "17:00", "exit", "Close the laptop. Walk away slowly. Do not look back."],
].map(([id, title, time, art, clue]) => ({
  id,
  title,
  time,
  art,
  clue,
  category: "main" as Category,
  action: id === "standup" ? "Standup survived" : "Quest complete",
  result: id === "standup" ? "You said words. People nodded." : "A small workplace miracle.",
  reward: id === "standup" ? "Your companion has been informed that you remain alive." : "One step closer to freedom.",
}));

function Icon({ name }: { name: "clock" | "pin" | "lock" | "back" | "check" }) {
  const icons = { clock: "◷", pin: "⌖", lock: "▣", back: "←", check: "✓" };
  return <span aria-hidden="true">{icons[name]}</span>;
}

function Illustration({ name, className = "" }: { name: string; className?: string }) {
  const shared = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let drawing: React.ReactNode;
  switch (name) {
    case "case":
      drawing = <><rect className="art-fill" x="17" y="20" width="30" height="31" rx="5" /><path {...shared} d="M25 20v-4c0-3 2-5 5-5h4c3 0 5 2 5 5v4M17 31h30M24 27v8m16-8v8M24 47v6m16-6v6" /></>;
      break;
    case "key":
      drawing = <><circle className="art-fill" cx="23" cy="24" r="10" /><path {...shared} d="M30 31l19 19m-7-7 5-5m-11-1 5-5M20 24h6" /></>;
      break;
    case "coffee":
      drawing = <><path className="art-fill" d="M15 24h33v15c0 8-6 14-14 14h-5c-8 0-14-6-14-14V24Z" /><path {...shared} d="M19 16c3-4-2-6 1-10m12 10c3-4-2-6 1-10m14 24h3c6 0 7 11 0 12h-5M12 57h42" /></>;
      break;
    case "compass":
      drawing = <><circle className="art-fill" cx="32" cy="32" r="23" /><path {...shared} d="M39 23l-5 13-13 5 5-13 13-5Z" /><circle cx="32" cy="32" r="2.5" fill="currentColor" /></>;
      break;
    case "eye":
      drawing = <><path className="art-fill" d="M7 32s9-15 25-15 25 15 25 15-9 15-25 15S7 32 7 32Z" /><circle {...shared} cx="32" cy="32" r="8" /><circle cx="32" cy="32" r="3" fill="currentColor" /></>;
      break;
    case "train":
      drawing = <><rect className="art-fill" x="13" y="8" width="38" height="43" rx="9" /><path {...shared} d="M20 17h24M18 24h28v14H18V24Zm5 27-5 6m23-6 5 6M20 45h4m16 0h4" /></>;
      break;
    case "people":
      drawing = <><circle className="art-fill" cx="23" cy="21" r="8" /><circle className="art-fill" cx="43" cy="23" r="7" /><path {...shared} d="M8 53c0-12 6-19 15-19s15 7 15 19m0-15c2-3 5-5 8-5 7 0 11 7 11 18" /></>;
      break;
    case "meeting":
      drawing = <><circle className="art-fill" cx="19" cy="21" r="7" /><circle className="art-fill" cx="45" cy="21" r="7" /><path {...shared} d="M7 50c0-11 5-17 12-17s12 6 12 17m2 0c0-11 5-17 12-17s12 6 12 17M27 31l5 5 5-5" /></>;
      break;
    case "calendar":
      drawing = <><rect className="art-fill" x="10" y="14" width="44" height="40" rx="5" /><path {...shared} d="M10 25h44M21 9v10M43 9v10M20 35h5m7 0h5m7 0h2m-26 9h5m7 0h5" /></>;
      break;
    case "biscuit":
      drawing = <><circle className="art-fill" cx="32" cy="32" r="23" /><circle cx="23" cy="24" r="2" fill="currentColor" /><circle cx="40" cy="22" r="2" fill="currentColor" /><circle cx="34" cy="37" r="2" fill="currentColor" /><circle cx="21" cy="42" r="2" fill="currentColor" /><circle cx="45" cy="44" r="2" fill="currentColor" /></>;
      break;
    case "exit":
      drawing = <><path className="art-fill" d="M11 8h28v48H11z" /><path {...shared} d="M39 32h18m-7-7 7 7-7 7M27 9v46M20 31h1" /></>;
      break;
    case "bridge":
      drawing = <><path className="art-fill" d="M7 44h50v12H7z" /><path {...shared} d="M7 44h50M13 44c0-17 8-27 19-27s19 10 19 27M13 20v24m38-24v24M4 56h56" /></>;
      break;
    case "hero":
      drawing = <><path className="art-fill" d="M32 8 48 14v15c0 12-6 21-16 27-10-6-16-15-16-27V14l16-6Z" /><path {...shared} d="m24 31 6 6 11-13" /></>;
      break;
    default:
      drawing = <><circle className="art-fill" cx="32" cy="32" r="23" /><path {...shared} d="M32 20v14m0 9h.01" /></>;
  }
  return <svg className={`illustration ${className}`} viewBox="0 0 64 64" aria-hidden="true">{drawing}</svg>;
}

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "quiet" | "small";
  className?: string;
}) {
  return (
    <button className={`button button--${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function QuestCard({
  quest,
  state = "next",
  player,
  onClick,
  teaser,
}: {
  quest: Quest;
  state?: "current" | "done" | "next" | "locked" | "unlocked";
  player: Player;
  onClick?: () => void;
  teaser?: string;
}) {
  const categoryName = quest.category === "main" ? "Main quest" : quest.category === "side" ? "Side quest" : "Shared quest";
  const isLocked = state === "locked";
  return (
    <div className={`rail-item rail-item--${state}`}>
      <div className="rail-dot">{state === "done" ? <Icon name="check" /> : null}</div>
      <button
        className={`quest-card quest-card--${state} quest-card--${quest.category} quest-card--${player}`}
        onClick={onClick}
        disabled={!onClick}
      >
        <span className="quest-copy">
          <span className="quest-title">{isLocked ? "Locked" : quest.title}</span>
          <span className="quest-label">
            {isLocked ? <Icon name="lock" /> : <span className="diamond">◆</span>}
            {isLocked ? teaser : categoryName}
          </span>
          <span className="quest-meta">
            <Icon name="clock" /> {quest.time}
            {!isLocked && (quest.place ? " · pin on the map" : " · figure it out")}
          </span>
        </span>
        <span className={`quest-art quest-art--${quest.category}`}>
          <span className="hill" />
          <span className="quest-emoji">{isLocked ? "?" : <Illustration name={quest.art} />}</span>
        </span>
      </button>
    </div>
  );
}

function TopBar({ player, onSwitch }: { player: Player; onSwitch: () => void }) {
  return (
    <div className="topbar">
      <button
        className="avatar"
        onClick={onSwitch}
        aria-label="Switch player"
      >
        {player === "monica" ? "M" : "Z"}
        <span className="avatar-switch">↔</span>
      </button>
    </div>
  );
}

function Welcome({
  onChoose,
  storageError,
}: {
  onChoose: (player: Player) => void;
  storageError: string | null;
}) {
  return (
    <main className="welcome-page">
      <div className="eyebrow">TWO QUESTS, ONE LONDON</div>
      <h1 className="display-title">Until five<span className="title-dot">.</span></h1>
      <p className="intro">Who’s playing today?</p>
      {storageError && <p className="storage-message" role="alert">{storageError}</p>}
      <div className="role-options">
        <button className="role-card role-card--monica" onClick={() => onChoose("monica")}>
          <span className="role-initial">M</span>
          <span><strong>Monica</strong><small>Survive London</small></span>
          <span className="role-arrow" aria-hidden="true">→</span>
        </button>
        <button className="role-card role-card--zahin" onClick={() => onChoose("zahin")}>
          <span className="role-initial">Z</span>
          <span><strong>Zahin</strong><small>Survive the workday</small></span>
          <span className="role-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      <p className="welcome-footnote">Your quests are saved in this browser. Choose a role to continue.</p>
    </main>
  );
}

function BottomNav({
  player,
  screen,
  setScreen,
}: {
  player: Player;
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  const items: { label: string; icon: string; target: Screen }[] = [
    { label: "Today", icon: "clock", target: "today" },
    { label: player === "monica" ? "Zahin" : "Monica", icon: "people", target: "companion" },
    { label: "Explore", icon: "bridge", target: "explore" },
    { label: "Journal", icon: "case", target: "journal" },
  ];
  return (
    <nav className={`bottom-nav bottom-nav--${player}`} aria-label="Main navigation">
      {items.map((item) => {
        return (
          <button className={`nav-item ${screen === item.target ? "is-active" : ""}`} onClick={() => setScreen(item.target)} key={item.label}>
            <span className="nav-icon"><Illustration name={item.icon} /></span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Today({
  player,
  completed,
  openQuest,
  onSwitchPlayer,
}: {
  player: Player;
  completed: Set<string>;
  openQuest: (quest: Quest) => void;
  onSwitchPlayer: () => void;
}) {
  const quests = player === "monica" ? monicaQuests : zahinQuests;
  const visibleCompleted = quests.filter((q) => completed.has(q.id)).length;

  return (
    <main className="page page--today">
      <TopBar player={player} onSwitch={onSwitchPlayer} />
      <div className="eyebrow">FRIDAY · LONDON</div>
      <div className="display-title">Please don&apos;t get lost<span className="title-dot">.</span></div>
      <div className="progress" aria-label={`${visibleCompleted} of ${quests.length} quests complete`}>
        {quests.map((q) => (
          <span className={completed.has(q.id) ? "is-done" : ""} key={q.id} />
        ))}
      </div>

      <section>
        <div className="section-kicker">THE PLAN, APPARENTLY</div>
        <div className="section-title">Today’s quests</div>
        <div className="quest-list">
          {quests.map((quest, index) => {
            const done = completed.has(quest.id);
            const currentIndex = quests.findIndex((q) => !completed.has(q.id));
            const isCurrent = index === currentIndex;
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                player={player}
                state={done ? "done" : isCurrent ? "current" : "next"}
                onClick={done || isCurrent ? () => openQuest(quest) : undefined}
              />
            );
          })}
        </div>
      </section>

      <div className="bottom-spacer" />
    </main>
  );
}

function Companion({
  player,
  completed,
}: {
  player: Player;
  completed: Set<string>;
}) {
  const companion = player === "monica" ? "zahin" : "monica";
  const quests = companion === "monica" ? monicaQuests : zahinQuests;
  const completedCount = quests.filter((quest) => completed.has(quest.id)).length;
  const currentIndex = quests.findIndex((quest) => !completed.has(quest.id));

  return (
    <main className="page companion-page">
      <div className="eyebrow">A PEEK AT THE OTHER QUESTLINE</div>
      <h1 className="display-title">{companion === "monica" ? "Monica’s" : "Zahin’s"} day<span className="title-dot">.</span></h1>
      <p className="intro">Progress is visible here, but only {companion} can complete these quests.</p>
      <div className="companion-progress" aria-label={`${completedCount} of ${quests.length} quests complete`}>
        <div className="progress">
          {quests.map((quest) => (
            <span className={completed.has(quest.id) ? "is-done" : ""} key={quest.id} />
          ))}
        </div>
        <strong>{completedCount} of {quests.length} complete</strong>
      </div>
      <div className="quest-list companion-quest-list">
        {quests.map((quest, index) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            player={companion}
            state={
              completed.has(quest.id)
                ? "done"
                : index === currentIndex
                  ? "current"
                  : "next"
            }
          />
        ))}
      </div>
      <p className="read-only-note">These quests are view-only in your role.</p>
    </main>
  );
}

function QuestDetail({
  quest,
  player,
  completed,
  goBack,
  complete,
}: {
  quest: Quest;
  player: Player;
  completed: boolean;
  goBack: () => void;
  complete: () => void;
}) {
  const [hint, setHint] = useState(false);
  return (
    <main className="page detail-page">
      <button className="back-link" onClick={goBack}><Icon name="back" /> Today</button>
      <div className={`detail-hero detail-hero--${quest.category}`}>
        <span className="detail-emoji"><Illustration name={quest.art} /></span>
      </div>
      <div className="quest-label detail-label"><span className="diamond">◆</span> {quest.category} quest · {quest.time}</div>
      <div className="display-title detail-title">{quest.title}</div>
      <div className="info-card">
        <div className="section-kicker">THE CLUE</div>
        <p>{quest.clue}</p>
      </div>
      <div className="info-card location-card">
        <div>
          <div className="section-kicker">LOCATION</div>
          <strong>{quest.place ? `Go to ${quest.place}` : "Location unknown"}</strong>
          {hint && <p className="hint">{quest.hint}</p>}
        </div>
        <Button variant="quiet" onClick={() => quest.place ? window.dispatchEvent(new CustomEvent("open-map")) : setHint(true)}>
          {quest.place ? "Show map" : hint ? "That’s all you get" : "Need a hint?"}
        </Button>
      </div>
      {completed ? (
        <div className="completed-note">
          <span><Illustration name={quest.art} /></span>
          <strong>{quest.result}</strong>
          <p>{quest.reward}</p>
        </div>
      ) : (
        <Button className={`wide-button wide-button--${player}`} onClick={complete}>{quest.action}</Button>
      )}
    </main>
  );
}

function Reveal({ quest, player, close }: { quest: Quest; player: Player; close: () => void }) {
  return (
    <div className="reveal-scrim" role="dialog" aria-modal="true" aria-label="Quest reward">
      <div className={`reveal-card reveal-card--${player}`}>
        <div className="reveal-emoji"><Illustration name={quest.art} /></div>
        <div className="section-kicker">QUEST COMPLETE</div>
        <div className="reveal-title">You found something.</div>
        <strong className="reward-name">{quest.result}</strong>
        <p>{quest.reward}</p>
        <div className="unlock-pill">Something has unlocked.</div>
        <Button className={`wide-button wide-button--${player}`} onClick={close}>Onwards</Button>
      </div>
    </div>
  );
}

function Explore({ player, completed }: { player: Player; completed: Set<string> }) {
  return (
    <main className="page explore-page">
      <div className="eyebrow">A VERY APPROXIMATE MAP</div>
      <div className="display-title">Explore<span className="title-dot">.</span></div>
      <div className={`map-card map-card--${player}`}>
        <svg viewBox="0 0 390 490" role="img" aria-label="Stylised map of central London">
          <path className="park park--one" d="M25 58c13-35 75-37 93-4s-2 67-42 72-66-25-51-68Z" />
          <path className="park park--two" d="M286 74c16-23 64-20 75 9s-16 51-47 46-44-32-28-55Z" />
          <path className="street" d="M40 170C120 115 238 128 352 92M30 310c103-24 215-16 335 30M91 25c35 151 13 318-16 439M278 23c-43 141-24 289 28 431" />
          <path className="thames" d="M-20 271C58 221 103 345 187 288S310 210 415 271" />
          <path className="route" d="M68 382C97 322 113 248 166 215S243 211 293 145" />
          <g className={`marker ${completed.has("arrive") ? "marker--done" : "marker--current"}`}>
            <circle cx="68" cy="382" r="16" />
            <text x="68" y="388">{completed.has("arrive") ? "✓" : "1"}</text>
          </g>
          <g className="marker marker--current">
            <circle cx="166" cy="215" r="16" />
            <circle className="pulse-ring" cx="166" cy="215" r="24" />
            <text x="166" y="221">2</text>
          </g>
          <g className="marker marker--unknown">
            <circle cx="293" cy="145" r="20" />
            <text x="293" y="152">?</text>
          </g>
          <g className="ghost-marker">
            <circle cx="257" cy="322" r="6" />
            <text x="269" y="326">your companion was here</text>
          </g>
          <text className="map-label" x="25" y="155">HYDE PARK</text>
          <text className="river-label" x="213" y="286">THAMES</text>
        </svg>
        <div className="map-float">Friday’s trail · 2.4 mi</div>
      </div>
      <div className="map-caption"><span className="dashed-marker">?</span><span>Dashed circles mean you’re on your own.<br /><small>Character building, apparently.</small></span></div>
    </main>
  );
}

function Journal({ completed }: { completed: Set<string> }) {
  const found = [
    { art: "case", name: "Safe arrival", note: "Imported with only minor turbulence.", id: "arrive" },
    { art: "coffee", name: "Lunch acquired", note: "Fuel for the rest of the adventure.", id: "lunch" },
    { art: "hero", name: "Tiny hero", note: "Small in stature. Huge in lore.", id: "heroes" },
  ];
  return (
    <main className="page journal-page">
      <div className="eyebrow">PROOF THAT YOU WERE HERE</div>
      <div className="display-title">Discoveries<span className="title-dot">.</span></div>
      <p className="intro">The little things you found along the way. Some were even intentional.</p>
      <div className="journal-grid">
        {found.map((item) =>
          completed.has(item.id) ? (
            <div className="journal-tile" key={item.id}>
              <span><Illustration name={item.art} /></span><strong>{item.name}</strong><p>{item.note}</p>
            </div>
          ) : (
            <div className="journal-tile journal-tile--empty" key={item.id}>
              <span>?</span><strong>Undiscovered</strong><p>Still out there somewhere.</p>
            </div>
          ),
        )}
        <div className="journal-tile journal-tile--empty"><span>?</span><strong>Undiscovered</strong><p>London keeps its secrets.</p></div>
      </div>
      <div className="section-kicker companion-kicker">BORROWED MEMORIES</div>
      <div className="section-title">Found by your companion</div>
      <div className="journal-tile journal-tile--wide">
        <span><Illustration name="people" /></span><div><strong>A survivable standup</strong><p>Zahin spoke for 43 seconds. A personal best.</p></div>
      </div>
    </main>
  );
}

export default function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selected, setSelected] = useState<Quest | null>(null);
  const [progress, setProgress] = useState<PlayerProgress>(emptyPlayerProgress);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Quest | null>(null);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (savedProgress) setProgress(parsePlayerProgress(savedProgress));

      const savedPlayer = localStorage.getItem(PLAYER_STORAGE_KEY);
      if (savedPlayer === "monica" || savedPlayer === "zahin") {
        setPlayer(savedPlayer);
        setScreen("today");
      }
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Could not read saved progress: ${error.message}`
          : "Could not read saved progress from this browser.",
      );
    } finally {
      setStorageReady(true);
    }
  }, []);

  const choosePlayer = (chosenPlayer: Player) => {
    try {
      localStorage.setItem(PLAYER_STORAGE_KEY, chosenPlayer);
      setStorageError(null);
    } catch {
      setStorageError("Your player could not be saved in this browser. Quest progress may not persist after closing it.");
    }
    setPlayer(chosenPlayer);
    setScreen("today");
    setSelected(null);
  };

  const complete = (quest: Quest) => {
    if (!player || progress[player].has(quest.id)) return;
    const next: PlayerProgress = {
      ...progress,
      [player]: new Set(progress[player]).add(quest.id),
    };
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, serializePlayerProgress(next));
      setProgress(next);
      setStorageError(null);
    } catch {
      setStorageError("Quest progress could not be saved in this browser. Check its storage settings and try again.");
      return;
    }
    setReveal(quest);
  };

  useEffect(() => {
    const openMap = () => setScreen("explore");
    const syncProgress = (event: StorageEvent) => {
      if (event.key !== PROGRESS_STORAGE_KEY) return;
      try {
        setProgress(event.newValue ? parsePlayerProgress(event.newValue) : emptyPlayerProgress());
        setStorageError(null);
      } catch (error) {
        setStorageError(
          error instanceof Error
            ? `Could not read updated quest progress: ${error.message}`
            : "Could not read updated quest progress.",
        );
      }
    };
    window.addEventListener("open-map", openMap);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener("open-map", openMap);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  if (!storageReady) {
    return <div className="app"><div className="phone-shell loading-screen">Getting your quests…</div></div>;
  }

  if (screen === "welcome" || !player) {
    return (
      <div className="app">
        <div className="phone-shell">
          <Welcome onChoose={choosePlayer} storageError={storageError} />
        </div>
      </div>
    );
  }

  const completed = progress[player];
  const companionCompleted = progress[player === "monica" ? "zahin" : "monica"];

  return (
    <div className={`app app--${player}`}>
      <div className="phone-shell">
        {storageError && <div className="storage-banner" role="status">{storageError}</div>}
        {screen === "today" && (
          <Today
            player={player}
            completed={completed}
            openQuest={(quest) => { setSelected(quest); setScreen("detail"); }}
            onSwitchPlayer={() => setScreen("welcome")}
          />
        )}
        {screen === "detail" && selected && (
          <QuestDetail
            quest={selected}
            player={player}
            completed={completed.has(selected.id)}
            goBack={() => setScreen("today")}
            complete={() => complete(selected)}
          />
        )}
        {screen === "companion" && <Companion player={player} completed={companionCompleted} />}
        {screen === "explore" && <Explore player={player} completed={completed} />}
        {screen === "journal" && <Journal completed={completed} />}
        {screen !== "detail" && <BottomNav player={player} screen={screen} setScreen={setScreen} />}
        {reveal && <Reveal quest={reveal} player={player} close={() => { setReveal(null); setScreen("today"); }} />}
      </div>
    </div>
  );
}
