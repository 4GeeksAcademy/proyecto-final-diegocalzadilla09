import React, { useEffect } from "react"

export const Home = () => {

    useEffect(() => {
        const pedirCatalogo = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/products");
                
                const data = await response.json();
                
                console.log("Conexión exitosa. catálogo:", data);
                
            } catch (error) {
                console.error("error de conexion", error);
            }
        };

        pedirCatalogo();
    }, []);
};