import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Cart = () => {
    const [carrito, setCarrito] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const traerCarrito = async () => {
            const token = localStorage.getItem("mi_token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/cart", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    alert("Tu sesión ha caducado. Por favor, vuelve a iniciar sesión");
                    localStorage.removeItem("mi_token");
                    navigate("/login");
                    return;
                }

                const data = await response.json();

                if (response.ok) {
                    setCarrito(data);
                    console.log("Carrito cargado:", data);
                } else {
                    console.error("El servidor rechazó la entrada:", data.msg);
                }

            } catch (error) {
                console.error("Houston, tenemos un problema de conexión:", error);
            }
        };

        traerCarrito();
    }, []);

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Carrito de Compras</h2>

            {carrito.length === 0 ? (
                <div className="alert alert-info">Tu carrito está vacío. ¡Ve a comprar algo!</div>
            ) : (
                <div className="row">
                    <div className="col-md-8">
                        <ul className="list-group shadow-sm">
                            {carrito.map((item, index) => (
                                <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
                                    <div className="d-flex align-items-center">
                                        <img src={item.image_url} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "15px", borderRadius: "5px" }} />
                                        <div>
                                            <h5 className="my-0">{item.name}</h5>
                                            <small className="text-muted">Cantidad: {item.quantity} | Precio: ${item.price}</small>
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-danger">Eliminar</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Resumen de compra</h5>
                                <p className="card-text">Total de artículos: {carrito.length}</p>
                                <button className="btn btn-success w-100">Proceder al pago</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};