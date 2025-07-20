import { useEffect, useState } from "react";
import { WS_URL } from "../config";
import { getSession } from "../utility/auth";

export const useSocket = () => {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = (await getSession()) || null;
      setToken(token);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      ws.onopen = () => {
        setLoading(false);
        setSocket(ws);
      };

      return () => {
        ws.close();
      };
    }
  }, [token]);

  return { socket, loading };
};
