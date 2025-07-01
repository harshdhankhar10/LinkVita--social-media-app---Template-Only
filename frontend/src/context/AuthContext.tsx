import { useState, useEffect, useContext, createContext, ReactNode } from "react";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  name?: string;
  profilePicture?: string;
  role?: string;
  userName?: string;
  fullName?: string;
}

interface AuthData {
  user: User | null;
  token: string;
}

interface AuthContextType {
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthData>({ user: null, token: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.token) {
      axios.defaults.headers.common["Authorization"] = `${auth.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [auth?.token]);

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parsedData = JSON.parse(data);
      setAuth({
        user: parsedData.user,
        token: parsedData.token,
      });
    }
    setLoading(false);

    //eslint-disable-next-line
  }, []);
  
  const logout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export { useAuth, AuthProvider };
