import { useState, useEffect } from "react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HOSPITALS = [
  {
    id: 1,
    name: "City General Hospital",
    address: "12 MG Road, Nellore",
    distance: "2.3 km",
    time: "7 min",
  },
  {
    id: 2,
    name: "Apollo Lifeline",
    address: "45 GT Road, Nellore",
    distance: "4.1 km",
    time: "12 min",
  },
  {
    id: 3,
    name: "SVIMS Hospital",
    address: "NH-16, Tirupati Road",
    distance: "6.8 km",
    time: "19 min",
  },
];

const INITIAL_SOS = [
  {
    id: 1,
    hospital: HOSPITALS[0],
    bloodGroup: "O+",
    units: 2,
    urgency: "CRITICAL",
    patient: "Adult Male, 42",
    raisedAt: "2 mins ago",
    status: "open",
    arrivedDonors: [],
    donorName: null,
  },
  {
    id: 2,
    hospital: HOSPITALS[1],
    bloodGroup: "B+",
    units: 1,
    urgency: "URGENT",
    patient: "Female, 28",
    raisedAt: "11 mins ago",
    status: "open",
    arrivedDonors: [],
    donorName: null,
  },
];

const BADGES = [
  { id: "first", icon: "🩸", label: "First Donation", earned: true },
  { id: "lifesaver", icon: "🦸", label: "Life Saver", earned: true },
  { id: "hero3", icon: "⭐", label: "3x Hero", earned: false },
  { id: "emergency", icon: "🚨", label: "Emergency Responder", earned: true },
  { id: "legend", icon: "👑", label: "Legend (10+)", earned: false },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Sora:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { background: #150a0c; margin: 0; }
  ::selection { background: #c9a24b; color: #2a1215; }
  button { transition: transform .15s ease, filter .15s ease; }
  button:hover { filter: brightness(1.08); transform: translateY(-1px); }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes sos-flash {
    0%, 100% { background: #8b1e2d; }
    50% { background: #a62639; }
  }
  @keyframes float-up {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    14% { transform: scale(1.22); }
    28% { transform: scale(1); }
    42% { transform: scale(1.15); }
    56% { transform: scale(1); }
  }
  .fadeup { animation: float-up 0.35s ease both; }
  select option { background: #2a1215; color: #f4ead5; }
`;

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [savedAccounts, setSavedAccounts] = useState({
    donor: null,
    doctor: null,
  });
  const [activeRole, setActiveRole] = useState(null);
  const [sosAlerts, setSosAlerts] = useState(INITIAL_SOS);
  const [acceptedSos, setAcceptedSos] = useState(null);
  const [donorForm, setDonorForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "O+",
    city: "Nellore",
  });
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    hospital: HOSPITALS[0],
    bloodGroup: "O+",
    units: 1,
    urgency: "CRITICAL",
    patient: "",
  });
  const [requestRaised, setRequestRaised] = useState(false);
  const [points, setPoints] = useState(120);
  const [donations, setDonations] = useState(3);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (screen === "splash") setTimeout(() => setScreen("roleSelect"), 2200);
  }, [screen]);

  const donorBloodGroup =
    savedAccounts.donor?.bloodGroup || donorForm.bloodGroup;
  const activeSos = sosAlerts.filter(
    (s) => s.bloodGroup === donorBloodGroup && s.status === "open",
  );

  const handleDonorRegister = () => {
    if (!donorForm.name || !donorForm.phone) return;
    setSavedAccounts((p) => ({ ...p, donor: { ...donorForm } }));
    setActiveRole("donor");
    setScreen("donorHome");
    showToast("Welcome, " + donorForm.name + "! 🩸");
  };

  const handleDoctorRegister = () => {
    if (!doctorForm.name) return;
    setSavedAccounts((p) => ({ ...p, doctor: { ...doctorForm } }));
    setActiveRole("doctor");
    setScreen("doctorHome");
    showToast("Welcome, Dr. " + doctorForm.name + "!");
  };

  const handleSwitch = () => {
    const to = activeRole === "donor" ? "doctor" : "donor";
    setActiveRole(to);
    if (savedAccounts[to]) {
      setScreen(to === "donor" ? "donorHome" : "doctorHome");
      showToast(
        to === "donor" ? "Switched to Donor 🩸" : "Switched to Doctor 🏥",
      );
    } else {
      setScreen(to === "donor" ? "donorRegister" : "doctorRegister");
    }
  };

  const handleLogout = () => {
    setActiveRole(null);
    setAcceptedSos(null);
    setRequestRaised(false);
    setScreen("roleSelect");
    showToast("Logged out successfully");
  };

  const handleAcceptSos = (sos) => {
    setAcceptedSos(sos);
    setSosAlerts((prev) =>
      prev.map((s) =>
        s.id === sos.id
          ? {
            ...s,
            status: "accepted",
            donorName: savedAccounts.donor?.name || donorForm.name,
          }
          : s,
      ),
    );
    setScreen("enRoute");
  };

  const handleCheckIn = () => {
    const name = savedAccounts.donor?.name || donorForm.name;
    setPoints((p) => p + 50);
    setDonations((d) => d + 1);
    setSosAlerts((prev) =>
      prev.map((s) =>
        s.id === acceptedSos?.id
          ? {
            ...s,
            status: "donor_arrived",
            arrivedDonors: [...(s.arrivedDonors || []), name],
          }
          : s,
      ),
    );
    setScreen("thankYou");
  };

  const handleRaiseSos = () => {
    setSosAlerts((prev) => [
      {
        id: Date.now(),
        hospital: doctorForm.hospital,
        bloodGroup: doctorForm.bloodGroup,
        units: doctorForm.units,
        urgency: doctorForm.urgency,
        patient: doctorForm.patient || "Patient",
        raisedAt: "Just now",
        status: "open",
        arrivedDonors: [],
        donorName: null,
      },
      ...prev,
    ]);
    setRequestRaised(true);
    showToast(`🚨 SOS sent to all ${doctorForm.bloodGroup} donors!`);
  };

  // ── shared styles ─────────────────────────────────────
  const S = {
    page: {
      fontFamily: "'Sora', sans-serif",
      minHeight: "100vh",
      width: "100%",
      background: "radial-gradient(ellipse at 50% -10%, #3a161c 0%, #150a0c 62%)",
      color: "#f4ead5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
    },
    inner: { width: "100%", maxWidth: 440, padding: "14px 16px 48px" },
    card: {
      background: "rgba(255,240,210,0.045)",
      border: "1px solid rgba(201,162,75,0.2)",
      borderRadius: 20,
      padding: "22px 18px",
      width: "100%",
    },
    btn: (bg = "#8b1e2d", color = "#fff", mt = 10) => ({
      background: bg,
      color,
      border: "none",
      borderRadius: 12,
      padding: "13px 18px",
      fontFamily: "'Sora', sans-serif",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      width: "100%",
      marginTop: mt,
    }),
    input: {
      background: "rgba(255,240,210,0.07)",
      border: "1px solid rgba(201,162,75,0.28)",
      borderRadius: 10,
      padding: "11px 13px",
      color: "#f4ead5",
      fontFamily: "'Sora', sans-serif",
      fontSize: 14,
      width: "100%",
      marginTop: 6,
    },
    label: {
      fontSize: 11,
      color: "#ad9e8c",
      marginTop: 14,
      display: "block",
      fontWeight: 600,
      letterSpacing: 0.4,
    },
    tag: (bg) => ({
      background: bg,
      borderRadius: 6,
      padding: "3px 9px",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      display: "inline-block",
    }),
    bloodBadge: {
      background: "#8b1e2d",
      color: "#fff",
      borderRadius: 10,
      padding: "5px 13px",
      fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 20,
      display: "inline-block",
      marginRight: 8,
    },
  };

  // ── Navbar ────────────────────────────────────────────
  const Navbar = ({ isDonor }) => {
    const otherRole = isDonor ? "doctor" : "donor";
    const hasOther = !!savedAccounts[otherRole];
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px 4px",
        }}
      >
        {/* Switch button */}
        <button
          onClick={handleSwitch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: isDonor
              ? "rgba(201,162,75,0.14)"
              : "rgba(139,30,45,0.14)",
            border: `1px solid ${isDonor ? "#c9a24b55" : "#8b1e2d66"}`,
            borderRadius: 30,
            padding: "7px 15px",
            color: isDonor ? "#e0c37a" : "#d9959c",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {isDonor ? "🏥" : "🩸"}{" "}
          {hasOther
            ? `Switch to ${isDonor ? "Doctor" : "Donor"}`
            : `+ Add ${isDonor ? "Doctor" : "Donor"} Account`}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 30,
            padding: "7px 15px",
            color: "#a39484",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          ↩ Logout
        </button>
      </div>
    );
  };

  // ── Toast ─────────────────────────────────────────────
  const Toast = () =>
    toast ? (
      <div
        style={{
          position: "fixed",
          bottom: 26,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#2a1215",
          border: "1px solid rgba(139,30,45,0.5)",
          color: "#fff",
          padding: "11px 22px",
          borderRadius: 30,
          fontWeight: 600,
          fontSize: 13,
          boxShadow: "0 4px 24px rgba(139,30,45,0.3)",
          zIndex: 999,
          animation: "float-up 0.28s ease both",
          whiteSpace: "nowrap",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {toast}
      </div>
    ) : null;

  // ════════════════════════════════════════════════════
  // SPLASH
  if (screen === "splash")
    return (
      <div style={{ ...S.page, justifyContent: "center" }}>
        <style>{css}</style>
        <div style={{ textAlign: "center" }} className="fadeup">
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: "50%",
                background: "#8b1e2d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                animation: "heartbeat 1.4s ease infinite",
              }}
            >
              🩸
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                inset: -10,
                borderRadius: "50%",
                border: "3px solid rgba(139,30,45,0.3)",
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: -1 }}>
            BloodBridge
          </div>
          <div
            style={{
              color: "#8b1e2d",
              fontWeight: 600,
              fontSize: 13,
              marginTop: 8,
            }}
          >
            Every drop counts. Every second matters.
          </div>
        </div>
      </div>
    );

  // ROLE SELECT
  if (screen === "roleSelect")
    return (
      <div style={{ ...S.page, justifyContent: "center" }}>
        <style>{css}</style>
        <div style={{ ...S.inner, paddingTop: 0 }} className="fadeup">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>🩸 BloodBridge</div>
            <div style={{ color: "#9b8c7e", fontSize: 13, marginTop: 6 }}>
              Who are you joining as?
            </div>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              {
                r: "donor",
                icon: "🦸",
                title: "I'm a Donor",
                sub: "Register & respond to SOS alerts",
                color: "#8b1e2d",
              },
              {
                r: "doctor",
                icon: "🏥",
                title: "I'm a Doctor",
                sub: "Raise emergency blood requests",
                color: "#c9a24b",
              },
            ].map((opt) => (
              <div
                key={opt.r}
                onClick={() => {
                  if (savedAccounts[opt.r]) {
                    setActiveRole(opt.r);
                    setScreen(opt.r === "donor" ? "donorHome" : "doctorHome");
                  } else
                    setScreen(
                      opt.r === "donor" ? "donorRegister" : "doctorRegister",
                    );
                }}
                style={{
                  background: "rgba(255,240,210,0.045)",
                  border: `1px solid ${opt.color}30`,
                  borderRadius: 18,
                  padding: "22px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 38 }}>{opt.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>
                    {opt.title}
                  </div>
                  <div style={{ color: "#9b8c7e", fontSize: 12, marginTop: 3 }}>
                    {opt.sub}
                  </div>
                  {savedAccounts[opt.r] && (
                    <div
                      style={{
                        color: opt.color,
                        fontSize: 11,
                        marginTop: 5,
                        fontWeight: 700,
                      }}
                    >
                      ✓ {savedAccounts[opt.r].name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Toast />
      </div>
    );

  // DONOR REGISTER
  if (screen === "donorRegister")
    return (
      <div style={{ ...S.page, justifyContent: "center" }}>
        <style>{css}</style>
        <div style={S.inner} className="fadeup">
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, marginBottom: 4 }}>
              Create Donor Profile
            </div>
            <div style={{ color: "#9b8c7e", fontSize: 12, marginBottom: 16 }}>
              You'll receive SOS alerts matching your blood group
            </div>
            {[
              { label: "Full Name", key: "name", ph: "Rajesh Kumar" },
              { label: "Phone Number", key: "phone", ph: "+91 98765 43210" },
              { label: "City", key: "city", ph: "Nellore" },
            ].map((f) => (
              <div key={f.key}>
                <label style={S.label}>{f.label}</label>
                <input
                  style={S.input}
                  placeholder={f.ph}
                  value={donorForm[f.key]}
                  onChange={(e) =>
                    setDonorForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <label style={S.label}>Blood Group</label>
            <select
              style={S.input}
              value={donorForm.bloodGroup}
              onChange={(e) =>
                setDonorForm((p) => ({ ...p, bloodGroup: e.target.value }))
              }
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <button style={S.btn()} onClick={handleDonorRegister}>
              Register as Donor →
            </button>
            <button
              style={S.btn("transparent", "#9b8c7e")}
              onClick={() => setScreen("roleSelect")}
            >
              ← Back
            </button>
          </div>
        </div>
        <Toast />
      </div>
    );

  // DOCTOR REGISTER
  if (screen === "doctorRegister")
    return (
      <div style={{ ...S.page, justifyContent: "center" }}>
        <style>{css}</style>
        <div style={S.inner} className="fadeup">
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, marginBottom: 4 }}>
              Doctor Registration
            </div>
            <div style={{ color: "#9b8c7e", fontSize: 12, marginBottom: 16 }}>
              Raise emergency blood requests instantly
            </div>
            <label style={S.label}>Full Name</label>
            <input
              style={S.input}
              placeholder="Dr. Priya Sharma"
              value={doctorForm.name}
              onChange={(e) =>
                setDoctorForm((p) => ({ ...p, name: e.target.value }))
              }
            />
            <label style={S.label}>Hospital</label>
            <select
              style={S.input}
              value={doctorForm.hospital.id}
              onChange={(e) =>
                setDoctorForm((p) => ({
                  ...p,
                  hospital: HOSPITALS.find((h) => h.id == e.target.value),
                }))
              }
            >
              {HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <button style={S.btn("#c9a24b", "#2a1215")} onClick={handleDoctorRegister}>
              Register as Doctor →
            </button>
            <button
              style={S.btn("transparent", "#9b8c7e")}
              onClick={() => setScreen("roleSelect")}
            >
              ← Back
            </button>
          </div>
        </div>
        <Toast />
      </div>
    );

  // DONOR HOME
  if (screen === "donorHome") {
    const donor = savedAccounts.donor || donorForm;
    return (
      <div style={S.page}>
        <style>{css}</style>
        <Navbar isDonor={true} />
        <div style={S.inner} className="fadeup">
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              marginTop: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "#8b1e2d",
                  fontWeight: 700,
                  letterSpacing: 1.5,
                }}
              >
                BLOODBRIDGE · DONOR
              </div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>
                Hello, {donor.name.split(" ")[0]} 👋
              </div>
            </div>
            <span style={S.bloodBadge}>{donor.bloodGroup}</span>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 22,
            }}
          >
            {[
              { icon: "🩸", label: "Donations", value: donations },
              { icon: "⭐", label: "Points", value: points },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, marginTop: 4 }}>
                  {s.value}
                </div>
                <div style={{ color: "#9b8c7e", fontSize: 11 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* SOS */}
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
            🚨 Live SOS Alerts
            {activeSos.length > 0 && (
              <span style={{ ...S.tag("#8b1e2d"), marginLeft: 10 }}>
                {activeSos.length} ACTIVE
              </span>
            )}
          </div>

          {activeSos.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 14,
                padding: 22,
                textAlign: "center",
                color: "#85776b",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              ✅ No active SOS for{" "}
              <b style={{ color: "#ad9e8c" }}>{donor.bloodGroup}</b> right now
            </div>
          ) : (
            activeSos.map((sos) => (
              <div
                key={sos.id}
                style={{
                  background: "rgba(139,30,45,0.08)",
                  border: "1px solid rgba(139,30,45,0.28)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <span style={S.bloodBadge}>{sos.bloodGroup}</span>
                    <span
                      style={S.tag(
                        sos.urgency === "CRITICAL" ? "#8b1e2d" : "#c98a2e",
                      )}
                    >
                      {sos.urgency}
                    </span>
                  </div>
                  <div style={{ color: "#9b8c7e", fontSize: 11 }}>
                    {sos.raisedAt}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {sos.hospital.name}
                </div>
                <div style={{ color: "#a39484", fontSize: 12, marginTop: 2 }}>
                  {sos.hospital.address}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  {[
                    { icon: "📍", val: sos.hospital.distance },
                    { icon: "🕐", val: sos.hospital.time },
                    { icon: "🩸", val: `${sos.units} unit(s)` },
                  ].map((i) => (
                    <div key={i.icon} style={{ fontSize: 12, color: "#bbb" }}>
                      {i.icon} <b>{i.val}</b>
                    </div>
                  ))}
                </div>
                <div style={{ color: "#b5a696", fontSize: 12, marginBottom: 10 }}>
                  🏥 Patient: {sos.patient}
                </div>
                <button
                  style={{ ...S.btn(), marginTop: 4 }}
                  onClick={() => handleAcceptSos(sos)}
                >
                  ✅ I ACCEPT — I'll donate now
                </button>
              </div>
            ))
          )}

          {/* Badges */}
          <div style={{ fontWeight: 800, fontSize: 15, margin: "20px 0 12px" }}>
            🏅 My Badges
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {BADGES.map((b) => (
              <div
                key={b.id}
                style={{
                  background: b.earned
                    ? "rgba(139,30,45,0.15)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${b.earned ? "#8b1e2d66" : "#222"}`,
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 11,
                  textAlign: "center",
                  opacity: b.earned ? 1 : 0.35,
                  minWidth: 76,
                }}
              >
                <div style={{ fontSize: 20 }}>{b.icon}</div>
                <div style={{ color: "#ccc", marginTop: 4, lineHeight: 1.3 }}>
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Toast />
      </div>
    );
  }

  // EN ROUTE
  if (screen === "enRoute")
    return (
      <div style={S.page}>
        <style>{css}</style>
        <Navbar isDonor={true} />
        <div style={S.inner} className="fadeup">
          <div style={{ textAlign: "center", marginBottom: 22, marginTop: 10 }}>
            <div style={{ fontSize: 50, marginBottom: 10 }}>🚗</div>
            <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22 }}>
              You're on the way!
            </div>
            <div
              style={{
                color: "#8b1e2d",
                fontWeight: 600,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Hospital has been notified
            </div>
          </div>

          {acceptedSos && (
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                🏥 Destination
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {acceptedSos.hospital.name}
              </div>
              <div
                style={{
                  color: "#a39484",
                  fontSize: 12,
                  marginTop: 3,
                  marginBottom: 14,
                }}
              >
                {acceptedSos.hospital.address}
              </div>
              {/* Fake map */}
              <div
                style={{
                  background: "linear-gradient(135deg,#2b1216,#3d1a20,#55262d)",
                  borderRadius: 14,
                  height: 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.12,
                    backgroundImage:
                      "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)",
                  }}
                />
                <div style={{ textAlign: "center", zIndex: 1 }}>
                  <div style={{ fontSize: 32 }}>📍</div>
                  <div style={{ fontSize: 11, color: "#c2b4a3", marginTop: 4 }}>
                    {acceptedSos.hospital.name}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                {[
                  {
                    icon: "📍",
                    label: "Distance",
                    val: acceptedSos.hospital.distance,
                  },
                  { icon: "⏱️", label: "ETA", val: acceptedSos.hospital.time },
                ].map((i) => (
                  <div
                    key={i.label}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{i.icon}</div>
                    <div
                      style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}
                    >
                      {i.val}
                    </div>
                    <div style={{ color: "#9b8c7e", fontSize: 11 }}>{i.label}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(139,30,45,0.1)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#ddd",
                }}
              >
                🩸 <b>{acceptedSos.units} unit(s)</b> of{" "}
                <b>{acceptedSos.bloodGroup}</b> · Patient: {acceptedSos.patient}
              </div>
            </div>
          )}

          <button style={S.btn()} onClick={handleCheckIn}>
            ✅ I've Arrived — Check In
          </button>
          <button
            style={S.btn("transparent", "#9b8c7e")}
            onClick={() => setScreen("donorHome")}
          >
            ← Back to Home
          </button>
        </div>
        <Toast />
      </div>
    );

  // THANK YOU
  if (screen === "thankYou")
    return (
      <div style={S.page}>
        <style>{css}</style>
        <Navbar isDonor={true} />
        <div
          style={{ ...S.inner, textAlign: "center", paddingTop: 36 }}
          className="fadeup"
        >
          <div
            style={{
              fontSize: 70,
              animation: "heartbeat 1.2s ease infinite",
              marginBottom: 14,
            }}
          >
            🩸
          </div>
          <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, marginBottom: 8 }}>
            Thank You, Hero!
          </div>
          <div
            style={{
              color: "#8b1e2d",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 28,
            }}
          >
            Your donation may have just saved a life.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              { icon: "🏆", label: "Total Donations", val: donations },
              { icon: "⭐", label: "Points Earned", val: `+50 (${points})` },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 24 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, marginTop: 6 }}>
                  {s.val}
                </div>
                <div style={{ color: "#9b8c7e", fontSize: 11, marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 14,
              marginBottom: 12,
              textAlign: "left",
            }}
          >
            🏅 Your Badges
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            {BADGES.filter((b) => b.earned).map((b) => (
              <div
                key={b.id}
                style={{
                  background: "rgba(139,30,45,0.15)",
                  border: "1px solid #8b1e2d66",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 11,
                  textAlign: "center",
                  minWidth: 76,
                }}
              >
                <div style={{ fontSize: 20 }}>{b.icon}</div>
                <div style={{ color: "#ddd", marginTop: 4 }}>{b.label}</div>
              </div>
            ))}
          </div>
          <button
            style={S.btn()}
            onClick={() => {
              setAcceptedSos(null);
              setScreen("donorHome");
            }}
          >
            Back to Home →
          </button>
        </div>
        <Toast />
      </div>
    );

  // DOCTOR HOME
  if (screen === "doctorHome") {
    const doctor = savedAccounts.doctor || doctorForm;
    return (
      <div style={S.page}>
        <style>{css}</style>
        <Navbar isDonor={false} />
        <div style={S.inner} className="fadeup">
          <div style={{ marginBottom: 20, marginTop: 10 }}>
            <div
              style={{
                fontSize: 10,
                color: "#c9a24b",
                fontWeight: 700,
                letterSpacing: 1.5,
              }}
            >
              BLOODBRIDGE · DOCTOR
            </div>
            <div style={{ fontWeight: 800, fontSize: 19 }}>
              Dr. {doctor.name} 🏥
            </div>
            <div style={{ color: "#9b8c7e", fontSize: 12 }}>
              {doctor.hospital?.name || HOSPITALS[0].name}
            </div>
          </div>

          {!requestRaised ? (
            <div style={S.card}>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>
                🚨 Raise Blood SOS
              </div>
              <label style={S.label}>Blood Group Required</label>
              <select
                style={S.input}
                value={doctorForm.bloodGroup}
                onChange={(e) =>
                  setDoctorForm((p) => ({ ...p, bloodGroup: e.target.value }))
                }
              >
                {BLOOD_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <label style={S.label}>Units Required</label>
              <select
                style={S.input}
                value={doctorForm.units}
                onChange={(e) =>
                  setDoctorForm((p) => ({
                    ...p,
                    units: Number(e.target.value),
                  }))
                }
              >
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={u}>
                    {u} unit{u > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <label style={S.label}>Urgency Level</label>
              <select
                style={S.input}
                value={doctorForm.urgency}
                onChange={(e) =>
                  setDoctorForm((p) => ({ ...p, urgency: e.target.value }))
                }
              >
                <option>CRITICAL</option>
                <option>URGENT</option>
                <option>ROUTINE</option>
              </select>
              <label style={S.label}>Patient Description (optional)</label>
              <input
                style={S.input}
                placeholder="e.g. Adult Male, 42, post-surgery"
                value={doctorForm.patient}
                onChange={(e) =>
                  setDoctorForm((p) => ({ ...p, patient: e.target.value }))
                }
              />
              <label style={S.label}>Hospital</label>
              <select
                style={S.input}
                value={doctorForm.hospital.id}
                onChange={(e) =>
                  setDoctorForm((p) => ({
                    ...p,
                    hospital: HOSPITALS.find((h) => h.id == e.target.value),
                  }))
                }
              >
                {HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
              <button
                style={{
                  ...S.btn(),
                  animation: "sos-flash 1.8s ease infinite",
                  marginTop: 20,
                }}
                onClick={handleRaiseSos}
              >
                🚨 SEND EMERGENCY SOS
              </button>
            </div>
          ) : (
            <div style={{ ...S.card, textAlign: "center" }}>
              <div style={{ fontSize: 46, marginBottom: 12 }}>📡</div>
              <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, marginBottom: 8 }}>
                SOS Sent!
              </div>
              <div style={{ color: "#c2b4a3", fontSize: 13, marginBottom: 18 }}>
                All <b style={{ color: "#8b1e2d" }}>{doctorForm.bloodGroup}</b>{" "}
                donors have been alerted
              </div>
              <div
                style={{
                  background: "rgba(255,240,210,0.045)",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 18,
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 11, color: "#9b8c7e" }}>Hospital</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  {doctorForm.hospital.name}
                </div>
                <div style={{ fontSize: 11, color: "#9b8c7e" }}>
                  Blood Required
                </div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  {doctorForm.bloodGroup} · {doctorForm.units} unit(s)
                </div>
                <div style={{ fontSize: 11, color: "#9b8c7e" }}>Urgency</div>
                <span
                  style={S.tag(
                    doctorForm.urgency === "CRITICAL" ? "#8b1e2d" : "#c98a2e",
                  )}
                >
                  {doctorForm.urgency}
                </span>
              </div>
              <button style={S.btn()} onClick={() => setRequestRaised(false)}>
                + Raise Another Request
              </button>
            </div>
          )}

          <div style={{ fontWeight: 800, fontSize: 15, margin: "22px 0 12px" }}>
            📋 Active Requests
          </div>
          {sosAlerts.map((s) => (
            <div
              key={s.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${s.status === "closed" ? "#6b8f5e20" : s.status === "donor_arrived" ? "#6b8f5e55" : "rgba(255,240,210,0.07)"}`,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <span style={S.bloodBadge}>{s.bloodGroup}</span>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 6 }}>
                    {s.hospital.name}
                  </div>
                  <div style={{ color: "#85776b", fontSize: 11, marginTop: 2 }}>
                    {s.raisedAt}
                  </div>
                </div>
                <span
                  style={{
                    ...S.tag(
                      s.status === "closed"
                        ? "#333"
                        : s.status === "donor_arrived"
                          ? "#6b8f5e"
                          : s.status === "accepted"
                            ? "#c98a2e"
                            : "#8b1e2d",
                    ),
                    fontSize: 10,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.status === "closed"
                    ? "✅ CLOSED"
                    : s.status === "donor_arrived"
                      ? "🏥 ARRIVED"
                      : s.status === "accepted"
                        ? "🚗 EN ROUTE"
                        : "⏳ WAITING"}
                </span>
              </div>

              {s.status === "donor_arrived" && s.arrivedDonors?.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    background: "rgba(107,143,94,0.1)",
                    border: "1px solid #6b8f5e44",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b8f5e",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    🙋 Donor has arrived at the hospital!
                  </div>
                  {s.arrivedDonors.map((name, i) => (
                    <div
                      key={i}
                      style={{ fontSize: 13, color: "#ddd", fontWeight: 600 }}
                    >
                      👤 {name}
                    </div>
                  ))}
                  <button
                    style={{ ...S.btn("#6b8f5e"), marginTop: 10, fontSize: 13 }}
                    onClick={() =>
                      setSosAlerts((prev) =>
                        prev.map((r) =>
                          r.id === s.id ? { ...r, status: "closed" } : r,
                        ),
                      )
                    }
                  >
                    ✅ Mark as Donated & Close Request
                  </button>
                </div>
              )}

              {s.status === "closed" && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#85776b",
                    fontStyle: "italic",
                  }}
                >
                  Request fulfilled · Donor: {s.arrivedDonors?.[0] || "Unknown"}
                </div>
              )}
            </div>
          ))}
        </div>
        <Toast />
      </div>
    );
  }

  return null;
}
