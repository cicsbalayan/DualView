import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface RoomData {
  code: string;
  isHost: boolean;
  fileUrl?: string;
  fileName?: string;
}

interface UseRoomDataResult {
  roomData: RoomData | null;
  isLoading: boolean;
}

export function useRoomData(): UseRoomDataResult {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("dualview-room");
    if (data) {
      try {
        const parsed = JSON.parse(data) as RoomData;
        setRoomData(parsed);
      } catch {
        navigate("/create-room");
      }
    } else {
      navigate("/create-room");
    }
    setIsLoading(false);
  }, [navigate]);

  return { roomData, isLoading };
}

