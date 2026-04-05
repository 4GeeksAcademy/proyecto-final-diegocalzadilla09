import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
    const [perfil, setPerfil] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("mi_token");

    const traerPerfil = async () => {
        if (!token) { navigate("/login"); return; }
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPerfil(data);
                setEditName(data.first_name);
                setEditLastName(data.last_name);
                setEditAddress(data.address);
            }
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => { traerPerfil(); }, []);

    const guardarCambios = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: editName,
                    last_name: editLastName,
                    address: editAddress
                })
            });

            if (response.ok) {
                alert("Datos actualizados correctamente.");
                setIsEditing(false);
                traerPerfil();
            }
        } catch (error) {
            console.error("Error actualizando:", error);
        }
    };

    const cambiarContraseña = async () => {
        if (!oldPassword || !newPassword) {
            alert("Por favor llena ambos campos de contraseña.");
            return;
        }

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/update-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡" + data.msg + "!");
                setIsEditingPassword(false);
                setOldPassword("");
                setNewPassword("");
            } else {
                alert("Error: " + data.msg);
            }
        } catch (error) {
            console.error("Error cambiando contraseña:", error);
        }
    };
    
    if (!perfil) return <div className="text-center mt-5"><h2>Cargando...</h2></div>;

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                            <h3 className="mb-0">Mi Perfil</h3>
                            <button className="btn btn-light btn-sm fw-bold" onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? "Cancelar" : "Editar Datos"}
                            </button>
                        </div>
                        <div className="card-body p-4">
                            <p className="text-muted mb-4"><strong>Email:</strong> {perfil.email}</p>

                            {!isEditing ? (
                                <>
                                    <p className="fs-5"><strong>Nombre:</strong> {perfil.first_name}</p>
                                    <p className="fs-5"><strong>Apellido:</strong> {perfil.last_name}</p>
                                    <p className="fs-5"><strong>Dirección:</strong> {perfil.address}</p>
                                </>
                            ) : (
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Nombre</label>
                                        <input type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Apellido</label>
                                        <input type="text" className="form-control" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Dirección de envío</label>
                                        <input type="text" className="form-control" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                                    </div>
                                    <button className="btn btn-success w-100 mt-2 fw-bold" onClick={guardarCambios}>
                                        Guardar Datos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center py-3">
                            <h5 className="mb-0">Seguridad</h5>
                            <button className="btn btn-light btn-sm fw-bold" onClick={() => setIsEditingPassword(!isEditingPassword)}>
                                {isEditingPassword ? "Cancelar" : "Cambiar Contraseña"}
                            </button>
                        </div>
                        
                        {isEditingPassword && (
                            <div className="card-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Contraseña Actual</label>
                                    <input type="password" className="form-control" placeholder="Escribe tu contraseña actual" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nueva Contraseña</label>
                                    <input type="password" className="form-control" placeholder="Escribe la nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                                <button className="btn btn-warning w-100 fw-bold" onClick={cambiarContraseña}>
                                    Actualizar Contraseña
                                </button>
                            </div>
                        )}
                        
                        <div className="card-footer bg-white border-0 py-3">
                            <button className="btn btn-outline-danger w-100 fw-bold" onClick={() => { localStorage.removeItem("mi_token"); navigate("/login"); }}>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};