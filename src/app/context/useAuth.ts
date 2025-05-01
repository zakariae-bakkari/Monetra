import { useContext } from "react";
import AuthContext from "./authContext";

const useAuth = () => {
   const data = useContext(AuthContext);
   return data;
}

export default useAuth;
// This custom hook allows you to access the authentication context easily in your components.