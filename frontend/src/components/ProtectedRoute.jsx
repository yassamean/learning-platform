import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import Loading from "./Loading";

const ProtectedRoute = ({ children, roles }) => {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <Loading />;
	}

	if (!user) {
		return <Navigate to={`/login?redirect=${location.pathname}`} />;
	}

	if (!roles.includes(user.role)) {
		return <Navigate to="/" />;
	}

	return children;
};

export default ProtectedRoute;
