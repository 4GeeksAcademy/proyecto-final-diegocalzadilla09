import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    first_name: firstName,
                    last_name: lastName,
                    address: address
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Usuario creado", data);
                alert("Cuenta creada con éxito por favor, inicia sesión.");

                navigate("/Login");

            } else {
                console.error("El servidor rechazó el registro:", data);
                alert("Error al crear la cuenta. Tal vez el correo ya existe.");
            }

        } catch (error) {
            console.error("erro:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow p-4">
                        <h2 className="text-center mb-4">Crear Cuenta</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Apellido</label>
                                    <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Dirección de Envío</label>
                                <input type="text" className="form-control" placeholder="Calle, Número, Ciudad..." value={address} onChange={(e) => setAddress(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Correo Electrónico</label>
                                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Registrarse</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};