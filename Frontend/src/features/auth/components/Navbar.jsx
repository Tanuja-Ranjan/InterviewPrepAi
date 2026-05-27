import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.875rem 2rem",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%", // ← add karo
        boxSizing: "border-box", // ← add karo
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          letterSpacing: "-0.01em",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        InterviewAI
      </span>

      {/* Right side */}
      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Avatar circle with initials */}
        {user && (
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d23f90, #fc1568)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}
          >
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={onLogout}
          style={{
            fontSize: "0.875rem",
            padding: "0.4rem 1rem",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: "rgba(255,255,255,0.85)",
            cursor: "pointer",
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
