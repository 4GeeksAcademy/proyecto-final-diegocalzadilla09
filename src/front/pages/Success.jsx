import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const vaciarCarrito = async () => {
            const token = localStorage.getItem("mi_token");

            if (token) {
                try {
                    await fetch(import.meta.env.VITE_BACKEND_URL + "/api/cart/clear", {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log("El carrito se ha vaciado automáticamente tras la compra");
                } catch (error) {
                    console.error("Error intentando vaciar el carrito:", error);
                }
            }
        };

        vaciarCarrito();
    }, []);

    return (
        <div className="container mt-5 text-center">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm p-5 border-0">
                        <h1 className="text-success mb-4">Pago Exitoso.</h1>
                        <p className="lead">Tu orden ha sido procesada correctamente.</p>
                        <p className="text-muted">Recibirás un comprobante en tu correo electrónico en breve.</p>

                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => navigate("/")}
                        >
                            Seguir comprando
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};