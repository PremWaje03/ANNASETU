import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ROLE_OPTIONS } from "../utils/constants";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const loginInitial = { email: "", password: "" };
const registerInitial = {
  name: "",
  email: "",
  password: "",
  role: "DONOR",
  latitude: "",
  longitude: "",
};

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loginData, setLoginData] = useState(loginInitial);
  const [registerData, setRegisterData] = useState(registerInitial);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(loginData);
      success("Welcome back to Annasetu.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register({
        ...registerData,
        latitude: registerData.latitude ? Number(registerData.latitude) : null,
        longitude: registerData.longitude ? Number(registerData.longitude) : null,
      });
      success("Account created successfully.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRegisterData((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        }));
        success("Location detected.");
      },
      () => error("Could not detect location. Please enter manually.")
    );
  };

  return (
    <div className="auth-layout">
      <Card className="auth-panel" title={mode === "login" ? "Welcome Back" : "Create Account"}>
        <div className="tab-switch">
          <button className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "tab active" : "tab"} onClick={() => setMode("register")}>Register</button>
        </div>

        {mode === "login" ? (
          <form className="form-grid" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </label>

            <Button type="submit" loading={loading} block>
              Sign In
            </Button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegister}>
            <label>
              Full Name
              <input
                value={registerData.name}
                onChange={(e) => setRegisterData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                minLength={6}
                value={registerData.password}
                onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </label>

            <label>
              Role
              <select
                value={registerData.role}
                onChange={(e) => setRegisterData((prev) => ({ ...prev, role: e.target.value }))}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid-two">
              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  value={registerData.latitude}
                  onChange={(e) => setRegisterData((prev) => ({ ...prev, latitude: e.target.value }))}
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  value={registerData.longitude}
                  onChange={(e) => setRegisterData((prev) => ({ ...prev, longitude: e.target.value }))}
                />
              </label>
            </div>

            <Button type="button" variant="ghost" onClick={detectLocation}>
              Detect My Location
            </Button>

            <Button type="submit" loading={loading} block>
              Create Account
            </Button>
          </form>
        )}
      </Card>

      <Card title="Why Annasetu" subtitle="Build meaningful impact every day">
        <ul className="feature-list">
          <li>Real-time donation alerts with WebSocket notifications</li>
          <li>Map-powered donation discovery and pickup planning</li>
          <li>Role-based workflow for donors, NGOs, and volunteers</li>
          <li>Transparent fulfillment status and quality feedback</li>
        </ul>
      </Card>
    </div>
  );
}

export default AuthPage;
