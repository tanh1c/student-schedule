from flask import Blueprint, request, jsonify
import os 
import json
from flasgger import Swagger, swag_from

subjects_bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')


subject = []

current_file = os.path.abspath(__file__)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
subject_data_path = os.path.join(project_root, 'app/data', 'subject.json')

with open(subject_data_path) as f:
    subject = json.load(f)
    
@subjects_bp.route('', methods=['GET'])

def getSubjects():
  
    if "CF-Connecting-IP" in request.headers:
        remote_addr = request.headers.getlist("CF-Connecting-IP")[0].rpartition(' ')[-1]
    elif 'X-Forwarded-For' in request.headers:
        remote_addr = request.headers.getlist("X-Forwarded-For")[0].rpartition(' ')[-1]
    else:
        remote_addr = request.remote_addr or 'untrackable'
    
    maMonHoc = request.args.get('maMonHoc')
    if maMonHoc is not None:
        maMonHoc = maMonHoc.strip()
        print(f"request from {remote_addr} with id={maMonHoc}")
        for subject_item in subject:
            if subject_item['maMonHoc'] == maMonHoc:
                return jsonify(subject_item)
        return jsonify({'error': 'Subject not found'}), 404
    
    else:
        print(f"request from {remote_addr} - Get all subjects")
        return jsonify(subject)
    
    