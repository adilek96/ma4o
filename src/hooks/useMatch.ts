import { useCallback, useState } from "react";

export function useMatch() {
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);



    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;
    


    const handleSearch = useCallback(async () => {
        setLoading(true);
 try {
    const response = await fetch(`${baseUrl}/api/v1/user/match`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    const data = await response.json();


    setResults(data.data);
    setLoading(false);
 } catch (error) {
    console.error(error);
 }
       
    }, [baseUrl]);

    return { results, handleSearch, loading };

}