import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Outlet, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import axios from "axios";

export default function PrivateRoute() {
  const { auth, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authCheck = async () => {
      if (!auth?.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/v1/user/user-auth`,
          {
            headers: {
              Authorization: `${auth.token}`,
            },
          }
        );

        if (response.data?.ok) {
          setLoading(false);
        } else {
          throw new Error("Unauthorized");
        }
      } catch {
        setLoading(false);
        navigate("/login");
      }
    };

    if (!authLoading) {
      authCheck();
    }
  }, [auth?.token, authLoading, navigate]);

  return loading || authLoading ? <Spinner /> : <Outlet />;
}
