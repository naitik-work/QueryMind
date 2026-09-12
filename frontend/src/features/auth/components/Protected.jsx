import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import LoadingScreen from "../../../app/LoadingScreen";

const Protected = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return <LoadingScreen message="Checking authorization..." />;
  }
  if (!user) {
    return <Navigate to={"/login"} />;
  }

  return children;
};

export default Protected;
