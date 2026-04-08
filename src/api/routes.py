"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, CartItem, Product
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt, generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import stripe
import os

api = Blueprint('api', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

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
    if 'email' not in body or 'password' not in body or 'first_name' not in body or 'last_name' not in body or 'address' not in body:
        return jsonify({"msg": "Todos los campos (email, password, nombre, apellido y dirección) son obligatorios"}), 400

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


@api.route('/cart/<int:cart_id>', methods=['DELETE'])
@jwt_required()
def delete_cart_item(cart_id):
    current_user_id = get_jwt_identity()

    item_to_delete = CartItem.query.filter_by(
        id=cart_id, user_id=current_user_id).first()

    if item_to_delete is None:
        return jsonify({"msg": "El producto no está en tu carrito"}), 404

    db.session.delete(item_to_delete)
    db.session.commit()

    return jsonify({"msg": "Producto eliminado exitosamente"}), 200


@api.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    current_user_id = get_jwt_identity()

    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()

    if not cart_items:
        return jsonify({"msg": "El carrito está vacío"}), 400

    line_items = []
    for item in cart_items:
        product = Product.query.get(item.product_id)
        if product:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': product.name,
                    },
                    'unit_amount': int(product.price * 100),
                },
                'quantity': item.quantity,
            })

    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{frontend_url}/success",
            cancel_url=f"{frontend_url}/cart",
        )
        return jsonify({'url': checkout_session.url}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    current_user_id = get_jwt_identity()

    items_to_delete = CartItem.query.filter_by(user_id=current_user_id).all()

    if not items_to_delete:
        return jsonify({"msg": "El carrito ya estaba vacío"}), 200

    for item in items_to_delete:
        db.session.delete(item)

    db.session.commit()

    return jsonify({"msg": "Carrito vaciado exitosamente tras la compra"}), 200


@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()

    user = User.query.get(current_user_id)

    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify({
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "address": user.address
    }), 200


@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()

    user.first_name = body.get('first_name', user.first_name)
    user.last_name = body.get('last_name', user.last_name)
    user.address = body.get('address', user.address)

    db.session.commit()

    return jsonify({"msg": "Perfil actualizado con éxito"}), 200


@api.route('/update-password', methods=['PUT'])
@jwt_required()
def update_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()
    old_password = body.get('old_password')
    new_password = body.get('new_password')

    if not old_password or not new_password:
        return jsonify({"msg": "Debes enviar la contraseña actual y la nueva"}), 400

    password_is_valid = bcrypt.check_password_hash(user.password, old_password)
    if not password_is_valid:
        return jsonify({"msg": "La contraseña actual es incorrecta"}), 401

    hashed_new_password = bcrypt.generate_password_hash(
        new_password).decode('utf-8')
    user.password = hashed_new_password

    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada exitosamente"}), 200

@api.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"msg": "Cuenta eliminada con éxito"}), 200