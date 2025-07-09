import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const Redirect = () => {
    const navigate = useNavigate();
    
    // Redirect to the login page
    useEffect(() => {
        navigate("/login");
    }, [navigate]);
    
    // Return null since this component does not render anything
    return null;
};

export default Redirect;