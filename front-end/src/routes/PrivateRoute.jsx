import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@services/auth";

export default function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return children;
}
