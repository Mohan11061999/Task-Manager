"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      toast.success("Logged in");
      router.push("/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <main style={styles.container}>
      <h2>🔐 Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={login} style={styles.button}>
        Login
      </button>

      <p>email : admin@example.com</p>
      <p>password : admin123</p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 400,
    margin: "100px auto",
    padding: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderBottom: "2px solid #1976d2",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: 10,
    cursor: "pointer",
  },
};
