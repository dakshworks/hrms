import axios from '../config/axiosConfig'
import { createContext, useEffect, useState } from 'react'

const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
	const [auth, setAuth] = useState(
		JSON.parse(localStorage.getItem('auth')) || {
			employeeId: null,
			username: null,
			email: null,
			role: null,
			token: null
		}
	)
	const getUser = async () => {
		try {
			if (!auth.token) return
			// Axios interceptor already extracts data from backend envelope
			// Response is directly: { employeeId, username, email, role, ... }
			const response = await axios.get('/auth/me')
			// Strip ROLE_ prefix from role
			const role = response.role.replace('ROLE_', '')
			const updatedAuth = {
				...auth,
				employeeId: response.employeeId,
				username: response.username,
				email: response.email,
				role: role
			}
			if (
				updatedAuth.username !== auth.username ||
				updatedAuth.email !== auth.email ||
				updatedAuth.role !== auth.role
			) {
				setAuth(updatedAuth)
			}
		} catch (error) {
			console.error(error)
		}
	}
	useEffect(() => {
		getUser()
		localStorage.setItem('auth', JSON.stringify(auth))
	}, [auth])

	return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}
export { AuthContext, AuthContextProvider }