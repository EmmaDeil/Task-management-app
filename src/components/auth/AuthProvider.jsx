import React, { useReducer, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        organization: action.payload.organization,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        organization: null,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ORGANIZATION":
      return {
        ...state,
        organization: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  organization: null,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing session
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        dispatch({ type: "LOGIN", payload: authData });
      } catch {
        localStorage.removeItem("auth");
      }
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const login = (userData, orgData) => {
    const authData = { user: userData, organization: orgData };
    localStorage.setItem("auth", JSON.stringify(authData));
    dispatch({ type: "LOGIN", payload: authData });
  };

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const setOrganization = (orgData) => {
    const currentAuth = JSON.parse(localStorage.getItem("auth") || "{}");
    const updatedAuth = { ...currentAuth, organization: orgData };
    localStorage.setItem("auth", JSON.stringify(updatedAuth));
    dispatch({ type: "SET_ORGANIZATION", payload: orgData });
  };

  const value = {
    ...state,
    login,
    logout,
    setOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
