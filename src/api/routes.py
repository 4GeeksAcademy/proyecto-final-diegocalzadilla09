"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt 

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
