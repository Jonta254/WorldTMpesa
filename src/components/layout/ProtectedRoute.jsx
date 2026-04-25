import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, isUserAccessVerified } from "../../services";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isUserAccessVerified(user)) {
    return <Navigate to="/login" replace state={{ from: location, requiresVerification: true }} />;
  }

  return children;
}

export default ProtectedRoute;
