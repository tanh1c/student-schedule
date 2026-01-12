from flask import Flask,request
from flask_cors import CORS  # The typical way to import flask-cors
import os
from flask_session import Session
from flasgger import Swagger

            
app = Flask(__name__)
app.secret_key = "a-really-random-secret"
app.config.update({
    "SESSION_TYPE": "filesystem",
    "SESSION_FILE_DIR": "./flask_session/",  # where to store session files
    "SESSION_PERMANENT": False,
})
Session(app)
Swagger(app)
cors = CORS(app)


from routes.lecturer import lecturers_bp 
from routes.subjects import subjects_bp
from routes.api import api_bp
from routes.auth import auth_bp
from routes.calendar import celandar_bp

import logging
if __name__ == "__main__":
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    app.register_blueprint(lecturers_bp)
    app.register_blueprint(subjects_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(celandar_bp)
    
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get("PORT", 8080)),
        debug=True,            
    )
    

