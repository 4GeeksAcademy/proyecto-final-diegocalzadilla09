import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
    const [productos, setProductos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const pedirCatalogo = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/products");
                const data = await response.json();

                setProductos(data);

            } catch (error) {
                console.error("error de conexion", error);
            }
        };

        pedirCatalogo();
    }, []);

    const agregarAlCarrito = async (productoId) => {
        const token = localStorage.getItem("mi_token");

        if (!token) {
            alert("Debes iniciar sesión para comprar.");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productoId,
                    quantity: 1
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Producto añadido al carrito exitosamente!");
                console.log("Respuesta del servidor:", data.msg);
            } else {
                console.error("Error del servidor:", data.msg);
                alert("Hubo un problema al añadir el producto.");
            }

        } catch (error) {
            console.error("problema de conexión:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Nuestro Catálogo</h1>

            <div className="row">
                {productos.map((producto) => (

                    <div className="col-md-4" key={producto.id}>
                        <div className="card shadow-sm">
                            <img src={producto.image_url} className="card-img-top p-3" alt={producto.name} style={{ objectFit: "contain", height: "200px",}} />
                            <div className="card-body text-center d-flex flex-column">
                                <h5 className="card-title">{producto.name}</h5>
                                <p className="card-text text-muted">{producto.description}</p>
                                <h4 className="card-text text-success">${producto.price}</h4>
                                <button
                                    className="btn btn-primary mt-auto"
                                    onClick={() => agregarAlCarrito(producto.id)}
                                >
                                    Añadir al carrito
                                </button>
                            </div>
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
};