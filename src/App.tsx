import { useEffect, useState } from "react";

type Player = "monica" | "zahin";
type Screen = "today" | "detail" | "explore" | "journal" | "system";
type Category = "main" | "side" | "shared";

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
    title: "Arrive safely",
    time: "08:30",
    art: "case",
    category: "main",
    clue: "Touch down, find your bag, and resist following the first person holding a cardboard sign.",
    place: "Paddington Station",
    action: "Made it in one piece",
    result: "London has accepted your arrival.",
    reward: "One slightly jet-lagged traveller, successfully imported.",
  },
  {
    id: "accommodation",
    title: "Find accommodation",
    time: "10:00",
    art: "key",
    category: "main",
    clue: "A key awaits. So does the opportunity to put down that bag.",
    place: "The little blue door",
    action: "Keys acquired",
    result: "You now have a London base.",
    reward: "And, critically, somewhere to charge your phone.",
  },
  {
    id: "coffee",
    title: "First London coffee",
    time: "11:00",
    art: "coffee",
    category: "main",
    clue: "Find something warm, caffeinated and not from an airport machine.",
    place: "Formative Coffee",
    action: "Coffee acquired",
    result: "The city is looking sharper already.",
    reward: "A tiny cup of courage for the road ahead.",
  },
  {
    id: "navigate",
    title: "Navigate somewhere yourself",
    time: "12:30",
    art: "compass",
    category: "main",
    clue: "No tour guide. No rescue call. Pick a direction and make it look intentional.",
    hint: "Follow the river until a very large clock starts judging you.",
    action: "I found it",
    result: "Against all odds: correctly located.",
    reward: "A growing and possibly dangerous sense of confidence.",
  },
  {
    id: "specific",
    title: "The specific thing",
    time: "14:30",
    art: "eye",
    category: "main",
    clue: "You will know it when you see it. Probably.",
    hint: "Look up. London hides its best bits above eye level.",
    action: "Found the thing",
    result: "Yes. That was the specific thing.",
    reward: "No further explanation will be provided.",
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

const sharedQuest: Quest = {
  id: "river",
  title: "Where the river bends",
  time: "17:30",
  art: "bridge",
  category: "shared",
  clue: "Two routes. One evening. Meet where London reflects itself.",
  place: "South Bank",
  action: "Found each other",
  result: "The questlines converge.",
  reward: "The good part of the day begins now.",
};

const sideQuest: Quest = {
  id: "heroes",
  title: "The Wall of Tiny Heroes",
  time: "any time",
  art: "hero",
  category: "side",
  clue: "There are heroes hiding in plain sight. They are much smaller than expected.",
  hint: "Look near Seven Dials. Then look down.",
  action: "Heroes found",
  result: "Tiny, heroic, and worth the detour.",
  reward: "A secret London detail for your collection.",
};

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
  state?: "current" | "done" | "next" | "mystery" | "locked" | "unlocked";
  player: Player;
  onClick?: () => void;
  teaser?: string;
}) {
  const categoryName = quest.category === "main" ? "Main quest" : quest.category === "side" ? "Side quest" : "Shared quest";
  const isMystery = state === "mystery";
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
          <span className="quest-title">{isLocked ? "Locked" : isMystery ? "A mystery quest" : quest.title}</span>
          <span className="quest-label">
            {isLocked ? <Icon name="lock" /> : <span className="diamond">◆</span>}
            {isLocked ? teaser : categoryName}
          </span>
          <span className="quest-meta">
            <Icon name="clock" /> {quest.time}
            {!isLocked && !isMystery && (quest.place ? " · pin on the map" : " · figure it out")}
          </span>
        </span>
        <span className={`quest-art quest-art--${quest.category}`}>
          <span className="hill" />
          <span className="quest-emoji">{isMystery || isLocked ? "?" : <Illustration name={quest.art} />}</span>
        </span>
      </button>
    </div>
  );
}

function TopBar({ player, onSwitch }: { player: Player; onSwitch: () => void }) {
  return (
    <div className="topbar">
      <button className="avatar" onClick={onSwitch} aria-label={`Switch to ${player === "monica" ? "Zahin" : "Monica"}`}>
        {player === "monica" ? "M" : "Z"}
        <span className="avatar-switch">↔</span>
      </button>
      <div className="questline">{player === "monica" ? "SURVIVE LONDON" : "SURVIVE THE WORKDAY"}</div>
    </div>
  );
}

function BottomNav({
  player,
  screen,
  go,
}: {
  player: Player;
  screen: Screen;
  go: (screen: Screen, player?: Player) => void;
}) {
  const items: { label: string; icon: string; target: Screen; person?: Player }[] = [
    { label: "Monica", icon: "compass", target: "today", person: "monica" },
    { label: "Zahin", icon: "people", target: "today", person: "zahin" },
    { label: "Explore", icon: "bridge", target: "explore" },
    { label: "Journal", icon: "case", target: "journal" },
  ];
  return (
    <nav className={`bottom-nav bottom-nav--${player}`} aria-label="Main navigation">
      {items.map((item) => {
        const active = item.person ? screen === "today" && player === item.person : screen === item.target;
        return (
          <button className={`nav-item ${active ? "is-active" : ""}`} onClick={() => go(item.target, item.person)} key={item.label}>
            <span className="nav-icon"><Illustration name={item.icon} /></span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function FeedRow({ art, text, time }: { art: string; text: string; time: string }) {
  return (
    <div className="feed-row">
      <span className="feed-emoji"><Illustration name={art} /></span>
      <span className="feed-text">{text}</span>
      <span className="feed-time">{time}</span>
    </div>
  );
}

function Today({
  player,
  completed,
  openQuest,
  toggleQuest,
  resetDemo,
  openSystem,
}: {
  player: Player;
  completed: Set<string>;
  openQuest: (quest: Quest) => void;
  toggleQuest: (id: string) => void;
  resetDemo: () => void;
  openSystem: () => void;
}) {
  const quests = player === "monica" ? monicaQuests : zahinQuests;
  const visibleCompleted = quests.filter((q) => completed.has(q.id)).length;
  const monicaMysteryStarts = completed.has("arrive") ? 3 : 2;
  const standupDone = completed.has("standup");
  const sideUnlocked = completed.has("coffee");

  return (
    <main className="page page--today">
      <TopBar player={player} onSwitch={() => window.dispatchEvent(new CustomEvent("switch-player"))} />
      <div className="eyebrow">FRIDAY · LONDON</div>
      <div className="display-title">Start your day<span className="title-dot">.</span></div>
      <div className="progress" aria-label={`${visibleCompleted} of ${quests.length} quests complete`}>
        {quests.slice(0, player === "monica" ? 5 : 7).map((q) => (
          <span className={completed.has(q.id) ? "is-done" : ""} key={q.id} />
        ))}
      </div>
      <div className="companion-strip">
        <span className="live-dot" />
        <div>
          <strong>{player === "monica" ? (standupDone ? "Your companion survived standup." : "Your companion is still alive.") : "Your companion is roaming London."}</strong>
          <span>{player === "monica" ? (standupDone ? "Words were said. Nobody panicked." : "Nothing alarming to report.") : "Last seen with unreasonable confidence."}</span>
        </div>
      </div>

      <section>
        <div className="section-kicker">THE PLAN, APPARENTLY</div>
        <div className="section-title">Today’s quests</div>
        <div className="quest-list">
          {quests.map((quest, index) => {
            const done = completed.has(quest.id);
            const currentIndex = quests.findIndex((q) => !completed.has(q.id));
            const isCurrent = index === currentIndex;
            const mystery = player === "monica" && index >= monicaMysteryStarts;
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                player={player}
                state={done ? "done" : isCurrent ? "current" : mystery ? "mystery" : "next"}
                onClick={done || isCurrent ? () => openQuest(quest) : undefined}
              />
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-kicker">OPTIONAL MISCHIEF</div>
        <div className="section-title">Side quests</div>
        <div className="standalone-card">
          <QuestCard
            quest={sideQuest}
            player={player}
            state={sideUnlocked ? "unlocked" : "locked"}
            teaser={player === "zahin" ? "The Good Biscuits are hiding." : "Something is waiting nearby."}
            onClick={sideUnlocked ? () => openQuest(sideQuest) : undefined}
          />
        </div>
      </section>

      {player === "monica" ? (
        <>
          <section>
            <div className="section-kicker">17:30 · NON-NEGOTIABLE</div>
            <div className="section-title">Later, together</div>
            <div className="standalone-card">
              <QuestCard
                quest={sharedQuest}
                player={player}
                state="locked"
                teaser="Both journeys end in the same place."
              />
            </div>
          </section>
          <section className="feed-section">
            <div className="section-title">From Zahin</div>
            {standupDone ? (
              <FeedRow art="people" text="Survived standup. Just." time="09:34" />
            ) : (
              <div className="empty-note">Quiet so far. He is probably pretending to listen.</div>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="feed-section">
            <div className="section-kicker">INTELLIGENCE FROM THE FIELD</div>
            <div className="section-title">From Monica</div>
            <FeedRow art="case" text="Touched down. London beware." time="08:31" />
            {completed.has("coffee") && <FeedRow art="coffee" text="Coffee acquired." time="11:08" />}
          </section>
          <section className="host-controls">
            <div className="section-kicker">FOR THE PERSON PULLING STRINGS</div>
            <div className="section-title">Host controls</div>
            <div className="control-list">
              {quests.map((quest) => (
                <div className="control-row" key={quest.id}>
                  <span className="control-name"><Illustration name={quest.art} /> {quest.title}</span>
                  <Button variant="small" onClick={() => toggleQuest(quest.id)}>
                    {completed.has(quest.id) ? "Undo" : "Complete"}
                  </Button>
                </div>
              ))}
              <div className="control-row">
                <span className="control-name"><Illustration name="biscuit" /> The Good Biscuits</span>
                <Button variant="small">Unlock</Button>
              </div>
            </div>
            <Button variant="quiet" className="reset-button" onClick={resetDemo}>Reset demo</Button>
            <Button variant="quiet" className="system-link" onClick={openSystem}>Open design system</Button>
          </section>
        </>
      )}
      <div className="bottom-spacer" />
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
    { art: "coffee", name: "First coffee", note: "London began to make sense.", id: "coffee" },
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

function DesignSystem({ back }: { back: () => void }) {
  return (
    <main className="page system-page">
      <button className="back-link" onClick={back}><Icon name="back" /> Host controls</button>
      <div className="eyebrow">TWO QUESTS, ONE LONDON</div>
      <div className="display-title">Field kit<span className="title-dot">.</span></div>
      <p className="intro">The bits and pieces behind this small, suspiciously organised adventure.</p>
      <section>
        <div className="section-title">Colours</div>
        <div className="swatches">
          {["beige", "paper", "mauve", "teal", "slate", "blush", "thames", "park"].map((colour) => (
            <div className={`swatch swatch--${colour}`} key={colour}><span />{colour}</div>
          ))}
        </div>
      </section>
      <section>
        <div className="section-title">Type</div>
        <div className="type-card"><div className="display-title">A grand plan.</div><p>Fraunces · display and section titles</p></div>
        <div className="type-card sans-sample"><strong>Turn left at the good story.</strong><p>DM Sans · labels, directions and everything practical</p></div>
      </section>
      <section>
        <div className="section-title">Quest states</div>
        <div className="state-grid">
          <div><span className="mini-dot mini-dot--current" />Current</div>
          <div><span className="mini-dot mini-dot--done">✓</span>Done</div>
          <div><span className="mini-dot" />Next</div>
          <div><span className="mini-dot mini-dot--dashed">?</span>Mystery</div>
        </div>
      </section>
      <section>
        <div className="section-title">Buttons & markers</div>
        <Button>Onwards</Button>
        <Button variant="quiet">Need a hint?</Button>
        <div className="marker-demo"><span className="map-dot">✓</span><span className="map-dot map-dot--pulse">2</span><span className="map-dot map-dot--dash">?</span></div>
      </section>
      <section>
        <div className="section-title">Activity row</div>
        <FeedRow art="coffee" text="Coffee acquired." time="11:08" />
      </section>
    </main>
  );
}

export default function App() {
  const [player, setPlayer] = useState<Player>("monica");
  const [screen, setScreen] = useState<Screen>("today");
  const [selected, setSelected] = useState<Quest | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(["office", "spill"]));
  const [reveal, setReveal] = useState<Quest | null>(null);

  const go = (target: Screen, person?: Player) => {
    if (person) setPlayer(person);
    setScreen(target);
    setSelected(null);
  };

  const complete = (quest: Quest) => {
    setCompleted((previous) => new Set(previous).add(quest.id));
    setReveal(quest);
  };

  const toggleQuest = (id: string) => {
    setCompleted((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const switchPlayer = () => {
      setPlayer((current) => current === "monica" ? "zahin" : "monica");
      setScreen("today");
    };
    const openMap = () => setScreen("explore");
    window.addEventListener("switch-player", switchPlayer);
    window.addEventListener("open-map", openMap);
    return () => {
      window.removeEventListener("switch-player", switchPlayer);
      window.removeEventListener("open-map", openMap);
    };
  }, []);

  return (
    <div className={`app app--${player}`}>
      <div className="phone-shell">
        {screen === "today" && (
          <Today
            player={player}
            completed={completed}
            openQuest={(quest) => { setSelected(quest); setScreen("detail"); }}
            toggleQuest={toggleQuest}
            resetDemo={() => setCompleted(new Set(["office", "spill"]))}
            openSystem={() => setScreen("system")}
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
        {screen === "explore" && <Explore player={player} completed={completed} />}
        {screen === "journal" && <Journal completed={completed} />}
        {screen === "system" && <DesignSystem back={() => setScreen("today")} />}
        {screen !== "detail" && screen !== "system" && <BottomNav player={player} screen={screen} go={go} />}
        {reveal && <Reveal quest={reveal} player={player} close={() => { setReveal(null); setScreen("today"); }} />}
      </div>
    </div>
  );
}
