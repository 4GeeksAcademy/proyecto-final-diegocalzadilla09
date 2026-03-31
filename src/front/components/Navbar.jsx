import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
    const navigate = useNavigate();
    
    const token = localStorage.getItem("mi_token");

    const cerrarSesion = () => {
        localStorage.removeItem("mi_token");
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-3" to="/">
                    DCcomputers
                </Link>

                <div className="ms-auto d-flex gap-2">
                    {!token ? (
                        <>
                            <Link to="/login" className="btn btn-outline-light">
                                Iniciar Sesión
                            </Link>
                            <Link to="/signup" className="btn btn-primary">
                                Registrarse
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/cart" className="btn btn-success fw-bold">
                                Carrito
                            </Link>
                            <Link to="/profile" className="btn btn-primary text-white fw-bold">
                                Mi Perfil
                            </Link>
                            <button onClick={cerrarSesion} className="btn btn-danger fw-bold">
                                Salir
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};