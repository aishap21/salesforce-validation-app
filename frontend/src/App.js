import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [instance, setInstance] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://salesforce-validation-app.onrender.com";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    const i = params.get("instance");
    if (t && i) {
      setToken(t);
      setInstance(decodeURIComponent(i));
      window.history.replaceState({}, document.title, "/");
      setMessage("✅ Successfully connected to Salesforce!");
    }
  }, []);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      setMessage("⏳ Fetching rules...");
      const res = await fetch(
        `${BACKEND_URL}/validation-rules?token=${token}&instance=${encodeURIComponent(instance)}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRules(data);
      setMessage(`✅ Found ${data.length} validation rules`);
    } catch (error) {
      setMessage("❌ Failed to fetch rules. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId, currentStatus) => {
    try {
      setMessage("⏳ Updating rule...");
      const res = await fetch(`${BACKEND_URL}/toggle-rule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          instance,
          ruleId,
          active: !currentStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      setMessage(`✅ Rule ${!currentStatus ? "activated" : "deactivated"} successfully`);
      fetchRules();
    } catch (error) {
      setMessage("❌ Failed to update rule.");
    }
  };

  const toggleAll = async (makeActive) => {
    try {
      setLoading(true);
      setMessage(`⏳ ${makeActive ? "Enabling" : "Disabling"} all rules...`);
      for (const rule of rules) {
        await fetch(`${BACKEND_URL}/toggle-rule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            instance,
            ruleId: rule.Id,
            active: makeActive,
          }),
        });
      }
      setMessage(`✅ All rules ${makeActive ? "activated" : "deactivated"} successfully`);
      fetchRules();
    } catch (error) {
      setMessage("❌ Failed to update all rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* HEADER */}
      <div className="header">
        <h1>⚡ Salesforce Validation Rules Manager</h1>
        <p>Manage your Salesforce Account validation rules easily</p>
      </div>

      {/* BEFORE LOGIN */}
      {!token && (
        <div className="login-box">
          <div className="login-icon">🔐</div>
          <h2>Connect to Salesforce</h2>
          <p>Click the button below to log in to your Salesforce org</p>
          <button className="btn-login" onClick={handleLogin}>
            🔐 Login to Salesforce
          </button>
        </div>
      )}

      {/* AFTER LOGIN */}
      {token && (
        <div className="dashboard">

          {/* STATUS */}
          <div className="status-bar">
            ✅ Connected to Salesforce
          </div>

          {/* ACTION BUTTONS */}
          <div className="button-group">
            <button className="btn btn-fetch" onClick={fetchRules} disabled={loading}>
              📋 Get Validation Rules
            </button>
            <button className="btn btn-enable" onClick={() => toggleAll(true)} disabled={loading || rules.length === 0}>
              ✅ Enable All
            </button>
            <button className="btn btn-disable" onClick={() => toggleAll(false)} disabled={loading || rules.length === 0}>
              ❌ Disable All
            </button>
          </div>

          {/* MESSAGE BOX */}
          {message && (
            <div className={`message-box ${message.startsWith("❌") ? "error" : "success"}`}>
              {message}
            </div>
          )}

          {/* LOADING */}
          {loading && <div className="loader">⏳ Please wait...</div>}

          {/* RULES TABLE */}
          {rules.length > 0 && (
            <div className="table-wrapper">
              <h3>📋 Validation Rules ({rules.length})</h3>
              <table className="rules-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Rule Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, index) => (
                    <tr key={rule.Id}>
                      <td>{index + 1}</td>
                      <td className="rule-name">{rule.ValidationName}</td>
                      <td>
                        <span className={rule.Active ? "badge-active" : "badge-inactive"}>
                          {rule.Active ? "🟢 Active" : "🔴 Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={rule.Active ? "btn-deactivate" : "btn-activate"}
                          onClick={() => toggleRule(rule.Id, rule.Active)}
                          disabled={loading}
                        >
                          {rule.Active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* EMPTY STATE */}
          {rules.length === 0 && !loading && (
            <div className="empty-state">
              <p>Click <strong>"Get Validation Rules"</strong> to load your rules</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default App;