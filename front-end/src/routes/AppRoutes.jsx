import { BrowserRouter, Routes, Route } from "react-router-dom";
import VoosPublicos from "@/pages/VoosPublicos";
import Login from "@/pages/Login";
import PrivateRoute from "@/routes/PrivateRoute";
import Admin from "@/pages/Admin";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 Público */}
        <Route path="/" element={<VoosPublicos />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
