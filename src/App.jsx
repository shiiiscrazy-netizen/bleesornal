import { useState, useEffect } from "react";

const TABS = ["Money", "Bills", "Planner", "Fitness"];

const PRESET_CATEGORIES = ["Food", "Transport", "Airtime", "Rent", "Fee", "Salary", "Side Hustle", "Other"];

const initialState = {
  money: { transactions: [], balance: 0 },
  bills: [],
  tasks: [],
  meals: { breakfast: "", lunch: "", dinner: "" },
  fitness: { logs: [] },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date(today());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Bleesornal() {
  const [tab, setTab] = useState("Money");
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem("bleesornal");
      return s ? JSON.parse(s) : initialState;
    } catch { return initialState; }
  });

  useEffect(() => {
    localStorage.setItem("bleesornal", JSON.stringify(state));
  }, [state]);

  const update = (key, val) => setState(s => ({ ...s, [key]: val }));

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto",
      padding: "0 0 80px 0"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
        input, textarea, select {
          background: #141414; border: 1px solid #222; color: #e8e8e8;
          font-family: 'DM Mono', monospace; font-size: 13px;
          padding: 10px 12px; border-radius: 6px; outline: none; width: 100%;
        }
        input:focus, textarea:focus, select:focus { border-color: #c8f060; }
        button { cursor: pointer; font-family: 'DM Mono', monospace; }
        .pill {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 500;
        }
        .card {
          background: #111; border: 1px solid #1e1e1e; border-radius: 10px;
          padding: 14px 16px; margin-bottom: 10px;
        }
        .accent { color: #c8f060; }
        .muted { color: #555; font-size: 12px; }
        .row { display: flex; gap: 8px; align-items: center; }
        .btn-primary {
          background: #c8f060; color: #0a0a0a; border: none;
          padding: 11px 20px; border-radius: 7px; font-weight: 500;
          font-size: 13px; flex-shrink: 0;
        }
        .btn-ghost {
          background: transparent; color: #555; border: 1px solid #222;
          padding: 8px 14px; border-radius: 7px; font-size: 12px;
        }
        .btn-ghost:hover { border-color: #c8f060; color: #c8f060; }
        .section-title {
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: #444;
          margin: 20px 0 10px;
        }
        .tag {
          background: #181818; border: 1px solid #222; border-radius: 20px;
          padding: 5px 12px; font-size: 12px; color: #888; cursor: pointer;
          white-space: nowrap;
        }
        .tag.active { background: #c8f060; color: #0a0a0a; border-color: #c8f060; }
        .delete-btn {
          background: none; border: none; color: #333; font-size: 16px;
          padding: 0 4px; line-height: 1; flex-shrink: 0;
        }
        .delete-btn:hover { color: #ff5555; }
        .streak-box {
          background: #111; border: 1px solid #1e1e1e; border-radius: 10px;
          padding: 16px; text-align: center;
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 20px 16px", borderBottom: "1px solid #161616" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
          BLEE<span style={{ color: "#c8f060" }}>S</span>ORNAL
        </div>
        <div style={{ color: "#333", fontSize: 11, marginTop: 2 }}>personal operating system</div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, padding: "12px 20px", borderBottom: "1px solid #161616", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "#c8f060" : "transparent",
            color: tab === t ? "#0a0a0a" : "#444",
            border: tab === t ? "none" : "1px solid #1e1e1e",
            padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500,
            whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "0 20px", flex: 1 }}>
        {tab === "Money" && <MoneyTab state={state.money} update={v => update("money", v)} />}
        {tab === "Bills" && <BillsTab bills={state.bills} update={v => update("bills", v)} />}
        {tab === "Planner" && <PlannerTab tasks={state.tasks} meals={state.meals} updateTasks={v => update("tasks", v)} updateMeals={v => update("meals", v)} />}
        {tab === "Fitness" && <FitnessTab logs={state.fitness.logs} update={v => update("fitness", { logs: v })} />}
      </div>
    </div>
  );
}

/* ─── MONEY ─── */
function MoneyTab({ state, update }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("expense");
  const [cat, setCat] = useState("Other");

  const add = () => {
    if (!amount || isNaN(+amount)) return;
    const amt = parseFloat(amount);
    const newTx = { id: Date.now(), amount: amt, note, type, category: cat, date: today() };
    const newBalance = type === "income" ? state.balance + amt : state.balance - amt;
    update({ ...state, transactions: [newTx, ...state.transactions], balance: newBalance });
    setAmount(""); setNote("");
  };

  const remove = (id, tx) => {
    const revert = tx.type === "income" ? state.balance - tx.amount : state.balance + tx.amount;
    update({ ...state, transactions: state.transactions.filter(t => t.id !== id), balance: revert });
  };

  return (
    <div>
      {/* Balance */}
      <div style={{ padding: "24px 0 8px", textAlign: "center" }}>
        <div className="muted" style={{ marginBottom: 4 }}>current balance</div>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800,
          color: state.balance >= 0 ? "#c8f060" : "#ff5555",
          letterSpacing: "-0.03em"
        }}>
          {state.balance < 0 ? "-" : ""}KES {Math.abs(state.balance).toLocaleString()}
        </div>
      </div>

      {/* Type toggle */}
      <div className="row" style={{ marginBottom: 10 }}>
        {["income", "expense"].map(t => (
          <button key={t} onClick={() => setType(t)} className={`tag ${type === t ? "active" : ""}`}
            style={{ flex: 1, textAlign: "center" }}>
            {t === "income" ? "＋ Income" : "－ Expense"}
          </button>
        ))}
      </div>

      {/* Category presets */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {PRESET_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`tag ${cat === c ? "active" : ""}`}>{c}</button>
        ))}
      </div>

      {/* Input */}
      <div className="row" style={{ marginBottom: 8 }}>
        <input placeholder="Amount (KES)" value={amount} onChange={e => setAmount(e.target.value)}
          type="number" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
        <button className="btn-primary" onClick={add}>Add</button>
      </div>
      <input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)}
        style={{ marginBottom: 4 }} onKeyDown={e => e.key === "Enter" && add()} />

      {/* Transactions */}
      <div className="section-title">Transactions</div>
      {state.transactions.length === 0 && <div className="muted" style={{ padding: "20px 0", textAlign: "center" }}>No transactions yet</div>}
      {state.transactions.map(tx => (
        <div key={tx.id} className="card row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, marginBottom: 2 }}>{tx.category}{tx.note ? ` · ${tx.note}` : ""}</div>
            <div className="muted">{formatDate(tx.date)}</div>
          </div>
          <div className="row">
            <div style={{ color: tx.type === "income" ? "#c8f060" : "#ff7070", fontWeight: 500, fontSize: 14 }}>
              {tx.type === "income" ? "+" : "-"}KES {tx.amount.toLocaleString()}
            </div>
            <button className="delete-btn" onClick={() => remove(tx.id, tx)}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── BILLS ─── */
function BillsTab({ bills, update }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");

  const add = () => {
    if (!name || !due) return;
    update([...bills, { id: Date.now(), name, amount, due, paid: false }]);
    setName(""); setAmount(""); setDue("");
  };

  const toggle = id => update(bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  const remove = id => update(bills.filter(b => b.id !== id));

  const sorted = [...bills].sort((a, b) => new Date(a.due) - new Date(b.due));

  return (
    <div>
      <div className="section-title">Add Bill</div>
      <div className="card">
        <input placeholder="Bill name (e.g. WiFi, Rent)" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 8 }} />
        <div className="row" style={{ marginBottom: 8 }}>
          <input placeholder="Amount (KES)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <input type="date" value={due} onChange={e => setDue(e.target.value)} />
        </div>
        <button className="btn-primary" style={{ width: "100%" }} onClick={add}>Add Bill</button>
      </div>

      <div className="section-title">Upcoming</div>
      {sorted.length === 0 && <div className="muted" style={{ padding: "20px 0", textAlign: "center" }}>No bills added</div>}
      {sorted.map(b => {
        const d = daysUntil(b.due);
        const urgent = d <= 3 && !b.paid;
        return (
          <div key={b.id} className="card row" style={{ justifyContent: "space-between", opacity: b.paid ? 0.4 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div onClick={() => toggle(b.id)} style={{
                width: 18, height: 18, border: `2px solid ${b.paid ? "#c8f060" : "#333"}`,
                borderRadius: 4, background: b.paid ? "#c8f060" : "transparent",
                cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {b.paid && <span style={{ color: "#0a0a0a", fontSize: 11 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, textDecoration: b.paid ? "line-through" : "none" }}>{b.name}</div>
                <div className="muted">{formatDate(b.due)} · {b.paid ? "paid" : d < 0 ? "overdue" : `${d}d left`}</div>
              </div>
            </div>
            <div className="row">
              {b.amount && <div style={{ color: urgent ? "#ff7070" : "#888", fontSize: 13 }}>KES {parseFloat(b.amount).toLocaleString()}</div>}
              {urgent && <span className="pill" style={{ background: "#ff555520", color: "#ff5555" }}>!</span>}
              <button className="delete-btn" onClick={() => remove(b.id)}>×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── PLANNER ─── */
function PlannerTab({ tasks, meals, updateTasks, updateMeals }) {
  const [task, setTask] = useState("");
  const [taskDate, setTaskDate] = useState(today());

  const addTask = () => {
    if (!task.trim()) return;
    updateTasks([...tasks, { id: Date.now(), text: task, date: taskDate, done: false }]);
    setTask("");
  };

  const toggleTask = id => updateTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = id => updateTasks(tasks.filter(t => t.id !== id));

  const todayTasks = tasks.filter(t => t.date === today());
  const upcoming = tasks.filter(t => t.date > today()).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      {/* Meals */}
      <div className="section-title">Today's Meals</div>
      <div className="card">
        {["breakfast", "lunch", "dinner"].map(m => (
          <div key={m} className="row" style={{ marginBottom: m !== "dinner" ? 8 : 0 }}>
            <div style={{ width: 72, color: "#555", fontSize: 12, flexShrink: 0 }}>{m}</div>
            <input placeholder={`What's for ${m}?`} value={meals[m]}
              onChange={e => updateMeals({ ...meals, [m]: e.target.value })} />
          </div>
        ))}
      </div>

      {/* Add task */}
      <div className="section-title">Tasks</div>
      <div className="row" style={{ marginBottom: 8 }}>
        <input placeholder="New task..." value={task} onChange={e => setTask(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()} />
        <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)}
          style={{ width: 140 }} />
        <button className="btn-primary" onClick={addTask}>+</button>
      </div>

      {/* Today's tasks */}
      {todayTasks.length > 0 && <>
        <div style={{ color: "#c8f060", fontSize: 11, marginBottom: 8, letterSpacing: "0.08em" }}>TODAY</div>
        {todayTasks.map(t => (
          <div key={t.id} className="card row" style={{ justifyContent: "space-between", opacity: t.done ? 0.4 : 1 }}>
            <div className="row">
              <div onClick={() => toggleTask(t.id)} style={{
                width: 18, height: 18, border: `2px solid ${t.done ? "#c8f060" : "#333"}`,
                borderRadius: 4, background: t.done ? "#c8f060" : "transparent",
                cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {t.done && <span style={{ color: "#0a0a0a", fontSize: 11 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
            </div>
            <button className="delete-btn" onClick={() => removeTask(t.id)}>×</button>
          </div>
        ))}
      </>}

      {/* Upcoming */}
      {upcoming.length > 0 && <>
        <div style={{ color: "#555", fontSize: 11, margin: "14px 0 8px", letterSpacing: "0.08em" }}>UPCOMING</div>
        {upcoming.map(t => (
          <div key={t.id} className="card row" style={{ justifyContent: "space-between" }}>
            <div className="row">
              <div onClick={() => toggleTask(t.id)} style={{
                width: 18, height: 18, border: "2px solid #2a2a2a", borderRadius: 4, cursor: "pointer", flexShrink: 0
              }} />
              <div>
                <div style={{ fontSize: 13 }}>{t.text}</div>
                <div className="muted">{formatDate(t.date)}</div>
              </div>
            </div>
            <button className="delete-btn" onClick={() => removeTask(t.id)}>×</button>
          </div>
        ))}
      </>}

      {tasks.length === 0 && <div className="muted" style={{ padding: "20px 0", textAlign: "center" }}>No tasks yet</div>}
    </div>
  );
}

/* ─── FITNESS ─── */
function FitnessTab({ logs, update }) {
  const [steps, setSteps] = useState("");
  const [pushups, setPushups] = useState("");
  const [pullups, setPullups] = useState("");
  const [logDate, setLogDate] = useState(today());

  const save = () => {
    const existing = logs.findIndex(l => l.date === logDate);
    const entry = { date: logDate, steps: +steps || 0, pushups: +pushups || 0, pullups: +pullups || 0 };
    if (existing >= 0) {
      const updated = [...logs]; updated[existing] = entry; update(updated);
    } else {
      update([entry, ...logs].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    setSteps(""); setPushups(""); setPullups("");
  };

  const remove = date => update(logs.filter(l => l.date !== date));

  // Streak: consecutive days logged
  const streak = (() => {
    if (!logs.length) return 0;
    const dates = new Set(logs.map(l => l.date));
    let s = 0, d = new Date(today());
    while (dates.has(d.toISOString().split("T")[0])) {
      s++; d.setDate(d.getDate() - 1);
    }
    return s;
  })();

  const totals = logs.reduce((a, l) => ({
    steps: a.steps + l.steps, pushups: a.pushups + l.pushups, pullups: a.pullups + l.pullups
  }), { steps: 0, pushups: 0, pullups: 0 });

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 16, marginBottom: 4 }}>
        {[
          { label: "streak", val: `${streak}d`, accent: true },
          { label: "steps", val: totals.steps.toLocaleString() },
          { label: "pushups", val: totals.pushups },
          { label: "pullups", val: totals.pullups },
        ].map(s => (
          <div key={s.label} className="streak-box">
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: s.accent ? "#c8f060" : "#e8e8e8" }}>{s.val}</div>
            <div className="muted" style={{ marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="section-title">Log Activity</div>
      <div className="card">
        <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} style={{ marginBottom: 8 }} />
        <div className="row" style={{ marginBottom: 8 }}>
          <input placeholder="Steps" type="number" value={steps} onChange={e => setSteps(e.target.value)} />
          <input placeholder="Push-ups" type="number" value={pushups} onChange={e => setPushups(e.target.value)} />
          <input placeholder="Pull-ups" type="number" value={pullups} onChange={e => setPullups(e.target.value)} />
        </div>
        <button className="btn-primary" style={{ width: "100%" }} onClick={save}>Save Log</button>
      </div>

      {/* History */}
      <div className="section-title">History</div>
      {logs.length === 0 && <div className="muted" style={{ padding: "20px 0", textAlign: "center" }}>No logs yet</div>}
      {logs.map(l => (
        <div key={l.date} className="card row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, marginBottom: 3 }}>{formatDate(l.date)}</div>
            <div className="muted">
              {l.steps.toLocaleString()} steps · {l.pushups} push · {l.pullups} pull
            </div>
          </div>
          <button className="delete-btn" onClick={() => remove(l.date)}>×</button>
        </div>
      ))}
    </div>
  );
}
