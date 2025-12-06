import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  where,
  limit,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import {
  Home,
  Vote,
  MessageSquare,
  CreditCard,
  Bell,
  Plus,
  CheckCircle,
  AlertCircle,
  Shield,
  BookOpen,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  Loader2,
  Link as LinkIcon,
  FileText,
  Megaphone,
  Clock,
  Eye,
  ExternalLink,
  Settings,
  LogOut,
  Lock,
  Pin,
  MinusCircle,
  UserCircle,
  ChevronRight,
  Wallet,
  ArrowDownCircle,
} from "lucide-react";

/* ----------------------------------------------------------------
   Project: 丰野哲隱三期住戶通 (Fengye Zheyin Phase 3 Community App)
   Version: v2.8.1 (Fixes: Localization, Layout, Unpin Feature)
   Updates: 
   - Fixed English text to Traditional Chinese.
   - Removed year from fees for perennial use.
   - Added "Unpin" button for admins.
   - Adjusted bottom padding to avoid Sandbox watermark overlap.
   ---------------------------------------------------------------- 
*/

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD9EXCtCW4kXAm_jNwyoR1UD_M5KGQl-rE",
  authDomain: "fengye-community.firebaseapp.com",
  projectId: "fengye-community",
  storageBucket: "fengye-community.firebasestorage.app",
  messagingSenderId: "329726549842",
  appId: "1:329726549842:web:f783b5cfcdae861b1a648b",
  measurementId: "G-T1XHV5F1SN",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "fengye-community";

// --- Constants ---
const COMMUNITY_UNITS = [
  "A1-1F",
  "A1-2F",
  "A1-3F",
  "A1-4F",
  "A2-1F",
  "A2-2F",
  "A2-3F",
  "A2-4F",
  "A3-2F",
  "A3-3F",
  "A3-4F",
  "A5-2F",
  "A5-3F",
  "A5-4F",
  "B1-2F",
  "B1-3F",
  "B1-4F",
  "B2-1F",
  "B2-2F",
  "B2-3F",
  "B2-4F",
  "B3-2F",
  "B3-3F",
  "B3-4F",
  "B5-2F",
  "B5-3F",
  "B5-4F",
  "C1-2F",
  "C1-3F",
  "C1-4F",
  "C2-2F",
  "C2-3F",
  "C2-4F",
  "C3-2F",
  "C3-3F",
  "C3-4F",
];

const DEFAULT_BYLAWS = `第一章 總則
第一條：本規約依公寓大廈管理條例訂定之。
第二條：本社區定名為「丰野哲隱三期」。`;

// --- High-End Design System ---
const theme = {
  bg: "#F8FAFC", // Slate 50
  text: "#1E293B", // Slate 800
  textSecondary: "#64748B", // Slate 500
  primary: "#0F172A", // Slate 900 (Navy)
  accent: "#3B82F6", // Blue 500
  success: "#10B981", // Emerald 500
  danger: "#EF4444", // Red 500
  cardBg: "#FFFFFF",
  border: "#F1F5F9", // Slate 100
};

const styles = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: theme.bg,
    minHeight: "100vh",
    paddingBottom: "140px", // Increased padding for scroll safety
    color: theme.text,
    WebkitFontSmoothing: "antialiased",
  },
  header: {
    backgroundColor: "rgba(15, 23, 42, 0.95)", // Slightly transparent navy
    backdropFilter: "blur(12px)",
    color: "white",
    padding: "16px 20px",
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: theme.cardBg,
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.02)", // Soft diffusion shadow
    border: "none", // Removed hard border
    position: "relative",
    transition: "transform 0.2s ease",
  },
  btnPrimary: {
    backgroundColor: theme.primary,
    color: "white",
    padding: "14px 20px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
    transition: "transform 0.1s",
  },
  btnSecondary: {
    backgroundColor: "#F1F5F9",
    color: "#475569",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s",
  },
  btnDestructive: {
    backgroundColor: "#FEF2F2",
    color: "#EF4444",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#F1F5F9", // Light gray bg instead of border
    fontSize: "16px",
    marginBottom: "16px",
    boxSizing: "border-box",
    outline: "none",
    color: theme.text,
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#F1F5F9",
    fontSize: "16px",
    marginBottom: "16px",
    boxSizing: "border-box",
    appearance: "none",
  },
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 0 50px 0", // Increased bottom padding to 50px to clear Sandbox button
    zIndex: 40,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.02)",
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#94A3B8",
    fontSize: "10px",
    cursor: "pointer",
    padding: "4px 12px",
    transition: "color 0.2s",
  },
  navItemActive: {
    color: theme.primary,
    fontWeight: "600",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.02em",
  },
  modal: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Darker dim
    backdropFilter: "blur(4px)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "32px",
    width: "100%",
    maxWidth: "400px",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: theme.primary,
    marginBottom: "20px",
    letterSpacing: "-0.02em",
  },
};

// --- Shared UI ---
const Toast = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "130px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(10px)",
        color: "white",
        padding: "14px 24px",
        borderRadius: "99px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontWeight: "600",
        fontSize: "14px",
        whiteSpace: "nowrap",
      }}
    >
      {type === "error" ? (
        <AlertCircle size={20} color="#F87171" />
      ) : (
        <CheckCircle size={20} color="#34D399" />
      )}{" "}
      {message}
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "home", icon: Home, label: "首頁" },
    { id: "vote", icon: Vote, label: "投票" },
    { id: "feedback", icon: MessageSquare, label: "反饋" },
    { id: "fees", icon: Wallet, label: "繳費" }, // Icon changed to Wallet
    { id: "profile", icon: UserCircle, label: "我的" },
  ];
  return (
    <div style={styles.nav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            }}
          >
            <Icon
              size={26}
              strokeWidth={isActive ? 2.5 : 2}
              style={{ marginBottom: "4px" }}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const Header = ({ account, onLogout }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target))
        setShowNotifs(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!account) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "announcements"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    return onSnapshot(q, (snapshot) => {
      setNotifications(
        snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((doc) => doc.id !== "system_bylaws")
      );
    });
  }, [account]);

  const toggleNotifs = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) setHasUnread(false);
  };

  return (
    <div style={styles.header}>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "700",
            letterSpacing: "-0.01em",
          }}
        >
          丰野哲隱三期
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "#94A3B8",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {account.isAdmin ? "管理員 (Admin)" : `住戶 (Unit): ${account.unit}`}
        </p>
      </div>
      <div style={{ position: "relative" }} ref={notifRef}>
        <button
          onClick={toggleNotifs}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "10px",
            borderRadius: "50%",
            position: "relative",
          }}
        >
          <Bell size={20} />
          {hasUnread && notifications.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: "8px",
                height: "8px",
                backgroundColor: "#EF4444",
                borderRadius: "50%",
                border: "2px solid #0F172A",
              }}
            ></span>
          )}
        </button>
        {showNotifs && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "120%",
              width: "300px",
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              overflow: "hidden",
              color: "#1e293b",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0F172A",
                }}
              >
                通知中心
              </span>
              <button
                onClick={onLogout}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#EF4444",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                登出
              </button>
            </div>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#94a3b8",
                  }}
                >
                  暫無新通知
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #f8fafc",
                      display: "flex",
                      alignItems: "start",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#3B82F6",
                        marginTop: "6px",
                      }}
                    ></div>
                    <p
                      style={{
                        fontSize: "14px",
                        margin: 0,
                        color: "#334155",
                        lineHeight: "1.4",
                      }}
                    >
                      {notif.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Features ---

const AnnouncementsTab = ({ isAdmin, account, onOpenBylaws, showToast }) => {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "一般",
    isPinned: false,
  });

  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "announcements"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      let docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((d) => d.id !== "system_bylaws");
      docs.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return 0;
      });
      setList(docs);
    });
  }, []);

  const handleAdd = async () => {
    if (!form.title) return;
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "announcements"),
        { ...form, createdAt: serverTimestamp(), author: account.unit }
      );
      setShowModal(false);
      setForm({ title: "", content: "", type: "一般", isPinned: false });
      showToast("公告已發布");
    } catch (e) {
      showToast("發布失敗", "error");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ 確定要刪除此公告？")) {
      try {
        await deleteDoc(
          doc(db, "artifacts", appId, "public", "data", "announcements", id)
        );
        showToast("已刪除");
      } catch (e) {
        showToast("刪除失敗", "error");
      }
    }
  };

  // New Feature: Toggle Pin
  const togglePin = async (id, currentStatus) => {
    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "announcements", id),
        { isPinned: !currentStatus }
      );
      showToast(currentStatus ? "已取消置頂" : "已設為置頂");
    } catch (e) {
      showToast("操作失敗", "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={onOpenBylaws}
        style={{
          ...styles.card,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
          cursor: "pointer",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "#DBEAFE",
              padding: "12px",
              borderRadius: "12px",
              color: "#2563EB",
            }}
          >
            <BookOpen size={24} />
          </div>
          <div style={{ textAlign: "left" }}>
            <strong
              style={{
                display: "block",
                fontSize: "16px",
                marginBottom: "4px",
                color: "#0F172A",
              }}
            >
              社區總規約
            </strong>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              點擊查看詳細條文
            </span>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#F1F5F9",
            borderRadius: "50%",
            padding: "8px",
          }}
        >
          <ChevronRight size={16} color="#94A3B8" />
        </div>
      </button>

      {isAdmin && (
        <button
          onClick={() => setShowModal(true)}
          style={{ ...styles.btnPrimary, marginBottom: "24px" }}
        >
          <Plus size={18} /> 發布新公告
        </button>
      )}

      {list.map((item) => (
        <div
          key={item.id}
          style={{
            ...styles.card,
            border: item.isPinned ? "2px solid #FCD34D" : "none",
            backgroundColor: item.isPinned ? "#FFFBEB" : "white",
          }}
        >
          {item.isPinned && (
            <div
              style={{
                position: "absolute",
                top: "-2px",
                right: "20px",
                background: "#FCD34D",
                color: "#92400E",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "700",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Pin
                size={10}
                style={{ display: "inline", marginRight: "4px" }}
              />{" "}
              置頂公告
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              marginTop: item.isPinned ? "12px" : "0",
            }}
          >
            <span
              style={{
                ...styles.badge,
                backgroundColor:
                  item.type === "緊急"
                    ? "#FEE2E2"
                    : item.type === "會議"
                    ? "#DBEAFE"
                    : "#F1F5F9",
                color:
                  item.type === "緊急"
                    ? "#B91C1C"
                    : item.type === "會議"
                    ? "#1E40AF"
                    : "#475569",
              }}
            >
              {item.type}
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {item.createdAt?.seconds
                ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                : ""}
            </span>
          </div>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "700",
              lineHeight: "1.3",
            }}
          >
            {item.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: "#475569",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            {item.content}
          </p>
          {isAdmin && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              {item.isPinned && (
                <button
                  onClick={() => togglePin(item.id, true)}
                  style={{
                    ...styles.btnSecondary,
                    width: "auto",
                    fontSize: "13px",
                    backgroundColor: "#FEF3C7",
                    color: "#D97706",
                  }}
                >
                  <ArrowDownCircle
                    size={14}
                    style={{ marginRight: "4px", verticalAlign: "middle" }}
                  />{" "}
                  取消置頂
                </button>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                style={styles.btnDestructive}
              >
                <Trash2 size={14} /> 刪除公告
              </button>
            </div>
          )}
        </div>
      ))}

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, fontSize: "20px" }}>發布公告</h3>
            <label
              style={{
                fontSize: "12px",
                color: "#64748b",
                display: "block",
                marginBottom: "6px",
              }}
            >
              標題
            </label>
            <input
              placeholder="輸入公告標題"
              style={styles.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                公告類型
              </label>
              <select
                style={styles.select}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="一般">一般公告</option>
                <option value="緊急">緊急通知</option>
                <option value="會議">會議記錄</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#D97706",
                  backgroundColor: "#FFFBEB",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) =>
                    setForm({ ...form, isPinned: e.target.checked })
                  }
                  style={{
                    accentColor: "#D97706",
                    width: "16px",
                    height: "16px",
                  }}
                />
                📌 設定為置頂公告
              </label>
            </div>

            <label
              style={{
                fontSize: "12px",
                color: "#64748b",
                display: "block",
                marginBottom: "6px",
              }}
            >
              內容
            </label>
            <textarea
              placeholder="輸入公告內容..."
              style={{ ...styles.input, height: "120px", resize: "none" }}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.btnSecondary}
              >
                取消
              </button>
              <button onClick={handleAdd} style={styles.btnPrimary}>
                發布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VotingTab = ({ isAdmin, account, showToast }) => {
  const [votes, setVotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "" });
  const [customOptions, setCustomOptions] = useState(["贊成", "反對"]);
  const [deadline, setDeadline] = useState("");
  const [viewDetailsId, setViewDetailsId] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "votes"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) =>
      setVotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const addOption = () => setCustomOptions([...customOptions, ""]);
  const updateOption = (idx, val) => {
    const newOpts = [...customOptions];
    newOpts[idx] = val;
    setCustomOptions(newOpts);
  };
  const removeOption = (idx) => {
    setCustomOptions(customOptions.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!form.title) return;
    const validOptions = customOptions.filter((o) => o.trim() !== "");
    if (validOptions.length < 2) {
      showToast("至少需要兩個選項", "error");
      return;
    }

    let deadlineTimestamp = deadline
      ? Timestamp.fromDate(new Date(deadline))
      : null;
    const optionsData = validOptions.map((opt) => ({ label: opt, count: 0 }));

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "votes"),
        {
          title: form.title,
          description: form.desc,
          options: optionsData,
          votedUsers: [],
          voteRecords: [],
          status: "active",
          deadline: deadlineTimestamp,
          createdAt: serverTimestamp(),
        }
      );
      setShowModal(false);
      setForm({ title: "", desc: "" });
      setDeadline("");
      setCustomOptions(["贊成", "反對"]);
      showToast("投票已建立");
    } catch (e) {
      showToast("建立失敗", "error");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ 確定要刪除此投票？")) {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "votes", id)
      );
      showToast("已刪除");
    }
  };

  const handleVote = async (vote, idx) => {
    if (vote.votedUsers.includes(account.unit)) {
      showToast("此戶號已投票", "error");
      return;
    }
    const newOpts = [...vote.options];
    newOpts[idx].count++;
    const newRecord = {
      unit: account.unit,
      option: newOpts[idx].label,
      time: Timestamp.now(),
    };
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "votes", vote.id),
      {
        options: newOpts,
        votedUsers: [...vote.votedUsers, account.unit],
        voteRecords: [...(vote.voteRecords || []), newRecord],
      }
    );
    showToast("投票成功");
  };

  const isExpired = (vote) =>
    vote.deadline && new Date() > vote.deadline.toDate();
  const formatDate = (ts) =>
    ts
      ? new Date(ts.seconds * 1000).toLocaleString("zh-TW", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={styles.pageTitle}>社區投票</h2>
      {isAdmin && (
        <button
          onClick={() => setShowModal(true)}
          style={{ ...styles.btnPrimary, marginBottom: "24px" }}
        >
          <Plus size={18} /> 發起新投票
        </button>
      )}

      {showModal && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalContent, maxHeight: "90vh" }}>
            <h3 style={{ marginTop: 0 }}>發起投票</h3>
            <input
              placeholder="投票標題"
              style={styles.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="投票說明 (選填)"
              style={{ ...styles.input, height: "80px", resize: "none" }}
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#64748b",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                選項設定
              </label>
              {customOptions.map((opt, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <input
                    style={{ ...styles.input, marginBottom: 0 }}
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`選項 ${idx + 1}`}
                  />
                  {customOptions.length > 2 && (
                    <button
                      onClick={() => removeOption(idx)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                      }}
                    >
                      <MinusCircle />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                style={{
                  ...styles.btnSecondary,
                  marginTop: "8px",
                  fontSize: "13px",
                  padding: "8px",
                }}
              >
                + 新增選項
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                截止時間 (選填)
              </label>
              <input
                type="datetime-local"
                style={styles.input}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.btnSecondary}
              >
                取消
              </button>
              <button onClick={handleCreate} style={styles.btnPrimary}>
                發起
              </button>
            </div>
          </div>
        </div>
      )}

      {viewDetailsId && (
        <div style={styles.modal}>
          <div
            style={{
              ...styles.modalContent,
              height: "60vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "16px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0 }}>投票明細</h3>
              <button
                onClick={() => setViewDetailsId(null)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {(() => {
                const targetVote = votes.find((v) => v.id === viewDetailsId);
                if (!targetVote?.voteRecords?.length)
                  return (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        marginTop: "20px",
                      }}
                    >
                      尚無記錄
                    </p>
                  );
                return (
                  <table
                    style={{
                      width: "100%",
                      fontSize: "14px",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          color: "#64748b",
                        }}
                      >
                        <th style={{ textAlign: "left", padding: "12px 8px" }}>
                          戶號
                        </th>
                        <th style={{ textAlign: "left", padding: "12px 8px" }}>
                          選項
                        </th>
                        <th style={{ textAlign: "right", padding: "12px 8px" }}>
                          時間
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetVote.voteRecords.map((rec, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #f8fafc" }}
                        >
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: "600",
                              color: "#0F172A",
                            }}
                          >
                            {rec.unit}
                          </td>
                          <td style={{ padding: "12px 8px" }}>{rec.option}</td>
                          <td
                            style={{
                              padding: "12px 8px",
                              textAlign: "right",
                              fontSize: "12px",
                              color: "#94a3b8",
                            }}
                          >
                            {formatDate(rec.time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {votes.map((vote) => {
        const expired = isExpired(vote);
        const hasVoted = vote.votedUsers?.includes(account.unit);
        const total = vote.options.reduce((a, b) => a + b.count, 0) || 1;
        return (
          <div key={vote.id} style={styles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                {vote.title}
              </h3>
              {expired ? (
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: "#F1F5F9",
                    color: "#64748b",
                  }}
                >
                  已截止
                </span>
              ) : (
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: "#DCFCE7",
                    color: "#166534",
                  }}
                >
                  進行中
                </span>
              )}
            </div>
            {vote.deadline && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#EF4444",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "500",
                }}
              >
                <Clock size={14} /> 截止：{formatDate(vote.deadline)}
              </div>
            )}
            <p
              style={{
                fontSize: "15px",
                color: "#64748b",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              {vote.description}
            </p>
            {vote.options.map((opt, idx) => (
              <div key={idx} style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  <span>{opt.label}</span>
                  <span>
                    {opt.count} 票 ({Math.round((opt.count / total) * 100)}%)
                  </span>
                </div>
                <div
                  style={{
                    height: "10px",
                    backgroundColor: "#F1F5F9",
                    borderRadius: "99px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(opt.count / total) * 100}%`,
                      backgroundColor: "#0F172A",
                      borderRadius: "99px",
                      transition: "width 0.5s ease-out",
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {!hasVoted && !expired && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >
                {vote.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleVote(vote, idx)}
                    style={{
                      ...styles.btnSecondary,
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      color: "#0F172A",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {hasVoted && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#10B981",
                  marginTop: "24px",
                  padding: "12px",
                  backgroundColor: "#ECFDF5",
                  borderRadius: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle size={16} /> 您已完成投票
              </div>
            )}
            {isAdmin && (
              <div
                style={{
                  marginTop: "20px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "16px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => handleDelete(vote.id)}
                  style={styles.btnDestructive}
                >
                  <Trash2 size={14} /> 刪除
                </button>
                <button
                  onClick={() => setViewDetailsId(vote.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#475569",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "500",
                  }}
                >
                  <Eye size={16} /> 查看明細
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FeedbackTab = ({ isAdmin, account, showToast }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [content, setContent] = useState("");
  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "feedbacks"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) =>
      setFeedbacks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);
  const send = async () => {
    if (!content.trim()) return;
    const authorId = account.uid || "unknown";
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "feedbacks"),
        {
          content,
          author: account.unit,
          authorId,
          status: "pending",
          reply: "",
          createdAt: serverTimestamp(),
        }
      );
      setContent("");
      showToast("意見已送出");
    } catch (e) {
      showToast("送出失敗", "error");
    }
  };
  const reply = async (id, text) => {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "feedbacks", id),
      { reply: text, status: "done" }
    );
  };
  const handleDelete = async (id) => {
    if (confirm("確定刪除？")) {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "feedbacks", id)
      );
      showToast("已刪除");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={styles.pageTitle}>住戶反饋</h2>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, fontSize: "16px" }}>新增意見 / 公設報修</h3>
        <textarea
          style={{ ...styles.input, height: "100px", resize: "none" }}
          placeholder="請描述您遇到的問題..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={send} style={styles.btnPrimary}>
          送出反饋
        </button>
      </div>
      {feedbacks.map((item) => (
        <div key={item.id} style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#F1F5F9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#64748b",
                }}
              >
                {item.author.split("-")[0]}
              </div>
              <strong>{item.author}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  ...styles.badge,
                  backgroundColor:
                    item.status === "done" ? "#DCFCE7" : "#FEF3C7",
                  color: item.status === "done" ? "#166534" : "#B45309",
                }}
              >
                {item.status === "done" ? "已處理" : "處理中"}
              </span>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#CBD5E1",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          <p
            style={{
              fontSize: "15px",
              color: "#475569",
              lineHeight: "1.5",
              margin: "0 0 16px 0",
            }}
          >
            {item.content}
          </p>
          {(item.reply || isAdmin) && (
            <div
              style={{
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                borderLeft: "4px solid #0F172A",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#0F172A",
                }}
              >
                <Shield size={14} /> 管委會回覆：
              </div>
              {isAdmin ? (
                <input
                  style={{
                    ...styles.input,
                    marginBottom: 0,
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                  defaultValue={item.reply}
                  onBlur={(e) => reply(item.id, e.target.value)}
                  placeholder="輸入回覆..."
                />
              ) : (
                item.reply || "尚無回覆"
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const FeesTab = ({ isAdmin, account }) => {
  const [feeStatus, setFeeStatus] = useState({});
  const [currentPeriod, setCurrentPeriod] = useState("H1");
  const year = new Date().getFullYear();
  const periodLabel =
    currentPeriod === "H1" ? "上半年 (1-6月)" : "下半年 (7-12月)";
  const units = COMMUNITY_UNITS;
  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "fees"),
      where("year", "==", year),
      where("period", "==", currentPeriod)
    );
    return onSnapshot(q, (snapshot) => {
      const statusMap = {};
      snapshot.docs.forEach((doc) => {
        statusMap[doc.data().unit] = doc.data().paid;
      });
      setFeeStatus(statusMap);
    });
  }, [year, currentPeriod]);
  const togglePayment = async (unit) => {
    if (!isAdmin) return;
    const isPaid = feeStatus[unit];
    const docId = `${year}_${currentPeriod}_${unit}`;
    const ref = doc(db, "artifacts", appId, "public", "data", "fees", docId);
    if (isPaid) await deleteDoc(ref);
    else
      await setDoc(ref, {
        unit,
        year,
        period: currentPeriod,
        paid: true,
        updatedAt: serverTimestamp(),
      });
  };
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          ...styles.card,
          padding: "12px",
          position: "sticky",
          top: "80px",
          zIndex: 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px" }}>
          管理費管理
        </h3>
        <button
          onClick={() =>
            setCurrentPeriod((prev) => (prev === "H1" ? "H2" : "H1"))
          }
          style={{
            ...styles.btnSecondary,
            width: "auto",
            padding: "8px 16px",
            fontSize: "13px",
          }}
        >
          {periodLabel}{" "}
          <ChevronRight
            size={14}
            style={{ display: "inline", verticalAlign: "middle" }}
          />
        </button>
      </div>

      {isAdmin ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "12px",
          }}
        >
          {units.map((unit) => (
            <div
              key={unit}
              onClick={() => togglePayment(unit)}
              style={{
                padding: "12px 8px",
                borderRadius: "12px",
                border: "2px solid",
                borderColor: feeStatus[unit] ? "transparent" : "#E2E8F0",
                backgroundColor: feeStatus[unit] ? "#DCFCE7" : "white",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
                boxShadow: feeStatus[unit]
                  ? "0 4px 6px -1px rgba(16, 185, 129, 0.2)"
                  : "none",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: feeStatus[unit] ? "#15803d" : "#64748B",
                  marginBottom: "4px",
                }}
              >
                {unit}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  color: feeStatus[unit] ? "#166534" : "#94a3b8",
                }}
              >
                {feeStatus[unit] ? "已繳" : "未繳"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          {/* Apple Wallet Style Card */}
          <div
            style={{
              padding: "32px 24px",
              borderRadius: "24px",
              background: feeStatus[account.unit]
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
              marginBottom: "24px",
              color: "white",
              boxShadow: feeStatus[account.unit]
                ? "0 20px 25px -5px rgba(16, 185, 129, 0.4)"
                : "0 20px 25px -5px rgba(225, 29, 72, 0.4)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative Circles */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: "-40px",
                left: "-20px",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
              }}
            ></div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "40px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    opacity: 0.8,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  繳費狀態 (Payment Status)
                </p>
                <h4
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "28px",
                    fontWeight: "800",
                  }}
                >
                  {feeStatus[account.unit] ? "已繳費" : "未繳費"}
                </h4>
              </div>
              {feeStatus[account.unit] ? (
                <CheckCircle size={32} style={{ opacity: 0.9 }} />
              ) : (
                <AlertCircle size={32} style={{ opacity: 0.9 }} />
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
              }}
            >
              <div>
                <p style={{ margin: 0, opacity: 0.8, fontSize: "12px" }}>
                  登記戶號 (Unit)
                </p>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>
                  {account.unit}
                </p>
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    opacity: 0.8,
                    fontSize: "12px",
                    textAlign: "right",
                  }}
                >
                  繳費期數 (Period)
                </p>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>
                  {periodLabel}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
            }}
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              匯款資訊
            </h4>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                borderBottom: "1px dashed #e2e8f0",
                paddingBottom: "12px",
              }}
            >
              <span style={{ color: "#94a3b8" }}>銀行代碼</span>
              <strong style={{ color: "#0f172a" }}>807 (永豐銀行)</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                borderBottom: "1px dashed #e2e8f0",
                paddingBottom: "12px",
              }}
            >
              <span style={{ color: "#94a3b8" }}>戶名</span>
              <strong style={{ color: "#0f172a" }}>哲隱三期管理委員會</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <span style={{ color: "#94a3b8" }}>帳號</span>
              <strong
                style={{
                  color: "#0f172a",
                  fontSize: "18px",
                  fontFamily: "monospace",
                }}
              >
                119-018-0018333-9
              </strong>
            </div>
            <div
              style={{
                backgroundColor: "#FFFBEB",
                color: "#B45309",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "13px",
                display: "flex",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} style={{ minWidth: "16px" }} />
              <span>
                轉帳時請務必在備註欄填寫您的
                <strong>戶號 ({account.unit})</strong>，以利系統自動對帳。
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MemberArea = ({ account, onLogout, showToast }) => {
  const [isChangePw, setIsChangePw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const handleChangePassword = async () => {
    if (!newPw || !account.uid) return;
    try {
      const ref = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "users",
        account.uid
      );
      await updateDoc(ref, { password: newPw });
      setToastMsg("密碼修改成功");
      setIsChangePw(false);
    } catch (e) {
      setToastMsg("修改失敗");
    }
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleResetPassword = async () => {
    if (!targetUnit.trim()) return;
    const unitCode = targetUnit.trim().toUpperCase();
    try {
      const q = query(
        collection(db, "artifacts", appId, "public", "data", "users"),
        where("unit", "==", unitCode)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        showToast("找不到該住戶", "error");
        return;
      }

      const targetDoc = snap.docs[0];
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "users", targetDoc.id),
        { password: "0000" }
      );
      showToast(`已重置 ${unitCode} 密碼為 0000`);
      setTargetUnit("");
    } catch (e) {
      showToast("重置失敗", "error");
    }
  };

  if (!account) return null;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          ...styles.card,
          display: "flex",
          alignItems: "center",
          gap: "20px",
          background: "linear-gradient(to right, #0F172A, #1E293B)",
          color: "white",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          <UserCircle size={32} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px" }}>
            {account.unit || "未知用戶"}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#94A3B8",
              marginTop: "4px",
            }}
          >
            {account.isAdmin ? "管理委員會" : "社区住戶"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={styles.card}>
          <h4
            style={{
              marginTop: 0,
              color: "#64748b",
              fontSize: "12px",
              textTransform: "uppercase",
            }}
          >
            帳號設定 (Account Settings)
          </h4>
          <button
            onClick={() => setIsChangePw(!isChangePw)}
            style={{
              ...styles.btnSecondary,
              backgroundColor: "white",
              border: "1px solid #F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <Lock size={18} />{" "}
              <span style={{ fontWeight: "600" }}>修改登入密碼</span>
            </div>{" "}
            <ChevronRight size={16} color="#CBD5E1" />
          </button>

          {isChangePw && (
            <div
              style={{
                marginTop: "16px",
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "12px",
              }}
            >
              <input
                type="password"
                placeholder="舊密碼"
                style={styles.input}
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
              />
              <input
                type="password"
                placeholder="新密碼"
                style={styles.input}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <button onClick={handleChangePassword} style={styles.btnPrimary}>
                確認修改
              </button>
            </div>
          )}

          <button
            onClick={onLogout}
            style={{
              ...styles.btnSecondary,
              backgroundColor: "white",
              border: "1px solid #FEF2F2",
              color: "#EF4444",
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <LogOut size={18} />{" "}
            <span style={{ fontWeight: "600" }}>登出系統</span>
          </button>
        </div>
      </div>

      {account.isAdmin && (
        <div style={{ marginTop: "12px" }}>
          <div
            style={{
              ...styles.card,
              border: "1px solid #DBEAFE",
              backgroundColor: "#EFF6FF",
            }}
          >
            <h5
              style={{
                marginTop: 0,
                marginBottom: "12px",
                color: "#1E40AF",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Shield size={14} /> 管理員工具
            </h5>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                style={{
                  ...styles.input,
                  marginBottom: 0,
                  backgroundColor: "white",
                }}
                placeholder="輸入戶號 (如 A1-1F)"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
              />
              <button
                onClick={handleResetPassword}
                style={{
                  ...styles.btnPrimary,
                  width: "auto",
                  whiteSpace: "nowrap",
                  backgroundColor: "#2563EB",
                }}
              >
                重置密碼
              </button>
            </div>
            <p style={{ fontSize: "11px", color: "#60A5FA", marginTop: "8px" }}>
              將該戶密碼恢復為預設值 0000
            </p>
          </div>
        </div>
      )}

      {toastMsg && (
        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
            color: "#10B981",
            fontWeight: "bold",
          }}
        >
          {toastMsg}
        </div>
      )}
      <p
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#CBD5E1",
          marginTop: "40px",
          fontFamily: "monospace",
        }}
      >
        Fengye Zheyin Community App v2.8.1
      </p>
    </div>
  );
};

const BylawsModal = ({ isOpen, onClose, isAdmin, showToast }) => {
  const [bylawsContent, setBylawsContent] = useState(DEFAULT_BYLAWS);
  const [bylawsUrl, setBylawsUrl] = useState("");
  const [isEditingBylaws, setIsEditingBylaws] = useState(false);
  const [tempBylaws, setTempBylaws] = useState("");
  const [tempUrl, setTempUrl] = useState("");
  const [useLinkMode, setUseLinkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchBylaws = async () => {
      try {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "announcements",
          "system_bylaws"
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBylawsContent(data.content || DEFAULT_BYLAWS);
          setBylawsUrl(data.url || "");
          setUseLinkMode(!!data.url);
        }
      } catch (e) {
        console.error("Fetch error:", e);
      }
    };
    fetchBylaws();
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "announcements",
        "system_bylaws"
      );
      await setDoc(docRef, {
        title: "社區總規約",
        content: tempBylaws,
        url: useLinkMode ? tempUrl : "",
        isSystem: true,
        updatedAt: serverTimestamp(),
      });
      setBylawsContent(tempBylaws);
      setBylawsUrl(useLinkMode ? tempUrl : "");
      setIsEditingBylaws(false);
      showToast("規約已更新");
    } catch (e) {
      showToast("儲存失敗", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = () => {
    setTempBylaws(bylawsContent);
    setTempUrl(bylawsUrl);
    setUseLinkMode(!!bylawsUrl);
    setIsEditingBylaws(true);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "white",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          ...styles.header,
          backgroundColor: "white",
          color: "#0f172a",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "none",
        }}
      >
        {isEditingBylaws ? (
          <button
            onClick={() => setIsEditingBylaws(false)}
            style={{
              border: "none",
              background: "none",
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            取消
          </button>
        ) : (
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <ChevronLeft />
          </button>
        )}
        <h3 style={{ margin: 0, fontSize: "16px" }}>社區總規約</h3>
        {isEditingBylaws ? (
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              ...styles.btnPrimary,
              width: "auto",
              padding: "6px 12px",
              fontSize: "12px",
            }}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : "儲存"}
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "8px",
              width: "40px",
              justifyContent: "flex-end",
            }}
          >
            {isAdmin && (
              <button
                onClick={startEdit}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <Edit3 size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          backgroundColor: "#f8fafc",
        }}
      >
        {isEditingBylaws ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: "white",
                padding: "4px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                onClick={() => setUseLinkMode(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: !useLinkMode ? "#eff6ff" : "transparent",
                  color: !useLinkMode ? "#2563eb" : "#64748b",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <FileText size={16} /> 文字
              </button>
              <button
                onClick={() => setUseLinkMode(true)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: useLinkMode ? "#eff6ff" : "transparent",
                  color: useLinkMode ? "#2563eb" : "#64748b",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <LinkIcon size={16} /> 連結
              </button>
            </div>

            {useLinkMode ? (
              <div style={styles.card}>
                <h4
                  style={{
                    marginTop: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Megaphone size={16} /> 外部連結模式
                </h4>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  貼上 Google 文件連結，住戶點擊時將直接開啟該網頁。
                </p>
                <input
                  style={styles.input}
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    color: "#92400e",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    marginBottom: "12px",
                  }}
                >
                  提示：直接編輯下方文字。
                </div>
                <textarea
                  style={{
                    ...styles.input,
                    minHeight: "300px",
                    fontFamily: "monospace",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                  value={tempBylaws}
                  onChange={(e) => setTempBylaws(e.target.value)}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {bylawsUrl ? (
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#eff6ff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <ExternalLink size={32} color="#2563eb" />
                </div>
                <h3>規約已發布於外部連結</h3>
                <p
                  style={{
                    color: "#64748b",
                    marginBottom: "24px",
                    fontSize: "14px",
                    maxWidth: "250px",
                    margin: "0 auto 24px auto",
                  }}
                >
                  為了提供最佳閱讀體驗，請點擊下方按鈕前往查看。
                </p>
                <a
                  href={bylawsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...styles.btnPrimary,
                    textDecoration: "none",
                    display: "inline-flex",
                    maxWidth: "200px",
                  }}
                >
                  前往查看規約 <ExternalLink size={16} />
                </a>
              </div>
            ) : (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  color: "#334155",
                  backgroundColor: "white",
                  padding: "24px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {bylawsContent}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Login Screen ---
const Login = ({ onLogin }) => {
  const [unit, setUnit] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const doLogin = async () => {
    try {
      await onLogin(unit, pwd);
    } catch (e) {
      setErr(e.message);
    }
  };
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0F172A",
        padding: "20px",
        backgroundImage:
          "radial-gradient(circle at top right, #1E293B 0%, #0F172A 100%)",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px 32px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "340px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#0F172A",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
            }}
          >
            <Home color="white" size={32} />
          </div>
          <h2 style={{ margin: 0, fontSize: "24px", color: "#0F172A" }}>
            丰野哲隱三期
          </h2>
          <p
            style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: "14px" }}
          >
            住戶專屬服務平台
          </p>
        </div>
        <input
          style={{
            ...styles.input,
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
          placeholder="戶號 (如 A1-1F)"
          value={unit}
          onChange={(e) => setUnit(e.target.value.toUpperCase())}
        />
        <input
          style={{
            ...styles.input,
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
          type="password"
          placeholder="密碼"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        {err && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              color: "#EF4444",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px",
              textAlign: "center",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <AlertCircle size={14} /> {err}
          </div>
        )}
        <button onClick={doLogin} style={styles.btnPrimary}>
          登入系統
        </button>
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#94a3b8",
            marginTop: "24px",
          }}
        >
          首次登入密碼預設 0000
        </p>
      </div>
    </div>
  );
};

// --- App Root ---
export default function App() {
  const [account, setAccount] = useState(null);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(null);
  const [showBylaws, setShowBylaws] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const savedUid = localStorage.getItem("uid");
        if (savedUid) {
          try {
            const docSnap = await getDoc(
              doc(db, "artifacts", appId, "public", "data", "users", savedUid)
            );
            if (docSnap.exists())
              setAccount({ uid: docSnap.id, ...docSnap.data() });
          } catch (e) {
            console.error("Fetch failed:", e);
          }
        }
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (unit, pwd) => {
    await signInAnonymously(auth);
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "users"),
      where("unit", "==", unit)
    );
    const snap = await new Promise((r) => onSnapshot(q, (s) => r(s)));

    let userData;
    if (snap.empty) {
      if (pwd !== (unit === "MANAGER" ? "8888" : "0000"))
        throw new Error("密碼錯誤");
      if (unit !== "MANAGER" && !COMMUNITY_UNITS.includes(unit))
        throw new Error("戶號不存在");
      const ref = await addDoc(
        collection(db, "artifacts", appId, "public", "data", "users"),
        { unit, password: pwd, isAdmin: unit === "MANAGER" }
      );
      userData = { uid: ref.id, unit, isAdmin: unit === "MANAGER" };
    } else {
      userData = { uid: snap.docs[0].id, ...snap.docs[0].data() };
      if (userData.password !== pwd) throw new Error("密碼錯誤");
    }
    setAccount(userData);
    localStorage.setItem("uid", userData.uid);
  };

  const handleLogout = () => {
    localStorage.removeItem("uid");
    setAccount(null);
    setTab("home");
  };
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!account) return <Login onLogin={handleLogin} />;

  return (
    <div style={styles.container}>
      <Header account={account} onLogout={handleLogout} />
      <main>
        {tab === "home" && (
          <AnnouncementsTab
            isAdmin={account.isAdmin}
            account={account}
            onOpenBylaws={() => setShowBylaws(true)}
            showToast={showToast}
          />
        )}
        {tab === "vote" && (
          <VotingTab
            isAdmin={account.isAdmin}
            account={account}
            showToast={showToast}
          />
        )}
        {tab === "feedback" && (
          <FeedbackTab
            isAdmin={account.isAdmin}
            account={account}
            showToast={showToast}
          />
        )}
        {tab === "fees" && (
          <FeesTab isAdmin={account.isAdmin} account={account} />
        )}
        {tab === "profile" && (
          <MemberArea
            account={account}
            onLogout={handleLogout}
            showToast={showToast}
          />
        )}
      </main>
      <BottomNav activeTab={tab} setActiveTab={setTab} />
      <BylawsModal
        isOpen={showBylaws}
        onClose={() => setShowBylaws(false)}
        isAdmin={account.isAdmin}
        showToast={showToast}
      />
      <Toast message={toast?.msg} type={toast?.type} />
    </div>
  );
}
