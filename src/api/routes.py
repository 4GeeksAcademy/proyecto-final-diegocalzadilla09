"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, CartItem, Product
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

bcrypt = Bcrypt()


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route('/register', methods=['POST'])
def register_user():
    body = request.get_json()

    if body is None:
        return jsonify({"msg": "Debes enviar un body en formato JSON"}), 400
    if 'email' not in body or 'password' not in body:
        return jsonify({"msg": "El email y el password son obligatorios"}), 400

    existing_user = User.query.filter_by(email=body['email']).first()
    if existing_user:
        return jsonify({"msg": "Este email ya está registrado"}), 400

    hashed_password = bcrypt.generate_password_hash(
        body['password']).decode('utf-8')

    new_user = User(
        email=body['email'],
        password=hashed_password,
        first_name=body.get('first_name', ''),
        last_name=body.get('last_name', ''),
        address=body.get('address', '')
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201


@api.route('/login', methods=['POST'])
def login_user():

    body = request.get_json()

    if body is None or 'email' not in body or 'password' not in body:
        return jsonify({"msg": "El email y el password son obligatorios"}), 400

    user = User.query.filter_by(email=body['email']).first()
    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    password_is_valid = bcrypt.check_password_hash(
        user.password, body['password'])
    if not password_is_valid:
        return jsonify({"msg": "Contraseña incorrecta"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "msg": "Login exitoso",
        "token": access_token
    }), 200


@api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()

    body = request.get_json()
    product_id = body.get('product_id')
    quantity_to_add = body.get('quantity', 1)

    if not product_id:
        return jsonify({"msg": "Falta el product_id"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"msg": "Producto no encontrado en el catálogo"}), 404

    existing_item = CartItem.query.filter_by(
        user_id=current_user_id, product_id=product_id).first()

    if existing_item:
        existing_item.quantity += quantity_to_add
    else:
        new_item = CartItem(
            user_id=current_user_id,
            product_id=product_id,
            quantity=quantity_to_add
        )
        db.session.add(new_item)

    db.session.commit()

    return jsonify({"msg": "Carrito actualizado exitosamente"}), 200


@api.route('/products', methods=['GET'])
def get_all_products():
    products = Product.query.all()

    results = [product.serialize() for product in products]

    return jsonify(results), 200


@api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    current_user_id = get_jwt_identity()

    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()

    results = []
    for item in cart_items:
        product = Product.query.get(item.product_id)
        
        if product:
            results.append({
                "cart_id": item.id,
                "quantity": item.quantity,
                "product_id": product.id,
                "name": product.name,
                "price": product.price,
                "image_url": product.image_url
            })

    return jsonify(results), 200
