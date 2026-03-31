import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
    const [perfil, setPerfil] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const traerPerfil = async () => {
            const token = localStorage.getItem("mi_token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/profile", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    alert("Tu sesión ha caducado. Vuelve a iniciar sesión.");
                    localStorage.removeItem("mi_token");
                    navigate("/login");
                    return;
                }

                const data = await response.json();

                if (response.ok) {
                    setPerfil(data);
                }
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
            }
        };

        traerPerfil();
    }, []);

    if (!perfil) {
        return <div className="container mt-5 text-center"><h2>Cargando perfil...</h2></div>;
    }

    const cerrarSesion = () => {
        localStorage.removeItem("mi_token");
        navigate("/login");
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-primary text-white text-center py-3">
                            <h3 className="mb-0">Mi Perfil</h3>
                        </div>
                        <div className="card-body p-4">
                            <p className="fs-5"><strong>Email:</strong> {perfil.email}</p>
                            <p className="fs-5"><strong>Nombre:</strong> {perfil.first_name || <span className="text-muted">No registrado</span>}</p>
                            <p className="fs-5"><strong>Apellido:</strong> {perfil.last_name || <span className="text-muted">No registrado</span>}</p>
                            <p className="fs-5"><strong>Dirección:</strong> {perfil.address || <span className="text-muted">No registrada</span>}</p>
                            
                            <hr className="my-4" />
                            
                            <button 
                                className="btn btn-outline-danger w-100 fw-bold" 
                                onClick={cerrarSesion}
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};