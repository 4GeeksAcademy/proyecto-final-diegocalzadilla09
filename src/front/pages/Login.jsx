import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("login correcto");
                localStorage.setItem("mi_token", data.token);
                alert("¡Bienvenido a la tienda! Has iniciado sesión correctamente.");
                navigate("/");
            } else {
                console.error("El servidor rechazó las credenciales:", data.msg);
                alert("correo o contraseña incorrectos.");
            }

        } catch (error) {
            console.error("Error del servidor", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Iniciar Sesión</h2>

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Entrar
                                </button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};