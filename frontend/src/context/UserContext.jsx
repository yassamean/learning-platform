import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext();

export const useAuth = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useAuth must be used within a UserProvider");
	}
	return context;
};

const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUser(decoded);
			} catch (error) {
				console.error("Invalid token:", error);
				localStorage.removeItem("token");
			}
		}
		setLoading(false);
	}, []);

	const login = token => {
		localStorage.setItem("token", token);
		const decoded = jwtDecode(token);
		setUser(decoded);
		setLoading(false);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUser(null);
	};

	return (
		<UserContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</UserContext.Provider>
	);
};

export default UserProvider;
