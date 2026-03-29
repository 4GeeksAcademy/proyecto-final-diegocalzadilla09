import React, { useEffect, useState } from "react";

export const Home = () => {
    const [productos, setProductos] = useState([]);

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
    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Nuestro Catálogo</h1>

            <div className="row">
                {productos.map((producto) => (

                    <div className="col-md-4" key={producto.id}>
                        <div className="card shadow-sm">
                            <img src={producto.image_url} className="card-img-top" alt={producto.name} />
                            <div className="card-body text-center">
                                <h5 className="card-title">{producto.name}</h5>
                                <p className="card-text text-muted">{producto.description}</p>
                                <h4 className="card-text text-success">${producto.price}</h4>
                                <button className="btn btn-primary mt-2">Añadir al carrito</button>
                            </div>
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
};