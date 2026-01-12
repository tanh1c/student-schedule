from flask import Blueprint, request, jsonify
import os 
import json

lecturers_bp = Blueprint('lecturers', __name__, url_prefix='/api/lecturers')


teacher_info = []

current_file = os.path.abspath(__file__)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
data_lecturer_json_path = os.path.join(project_root, 'app/data', 'data_lecturer.json')

with open(data_lecturer_json_path) as f:
    data_lecturer = json.load(f)


def convert_vietnamese_to_normal(text):
    # Define a mapping of Vietnamese characters with accents to their normal counterparts
    vietnamese_chars = "ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ"
    normal_chars = "AAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYDaaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd"

    # Convert each character in the input text to its normal version
    converted_text = ""
    for char in text:
        if char in vietnamese_chars:
            char_index = vietnamese_chars.index(char)
            char = normal_chars[char_index]
        converted_text += char

    return converted_text

def search_info_lecturer(data_lecturer,giangVien):
    for i in data_lecturer:
        if convert_vietnamese_to_normal(i['name']).lower() == convert_vietnamese_to_normal(giangVien).lower():
            return i
    return {'name':giangVien,'phone':'','email':''}




@lecturers_bp.route('', methods=['GET'])
def WebAPI_Info():
    """
    Get lecturer information, either all lecturers or a single lecturer by name.
    ---
    tags:
      - Lecturers
    parameters:
      - name: gv
        in: query
        type: string
        required: false
        description: Full name of the lecturer to look up
        example: Phan Trong Nhan
    responses:
      200:
        description: Returns either a single Lecturer object (if `gv` is provided) or a list of Lecturer objects
    """
    if "CF-Connecting-IP" in request.headers:
        remote_addr = request.headers.getlist("CF-Connecting-IP")[0].rpartition(' ')[-1]
    elif 'X-Forwarded-For' in request.headers:
        remote_addr = request.headers.getlist("X-Forwarded-For")[0].rpartition(' ')[-1]
    else:
        remote_addr = request.remote_addr or 'untrackable'
    giangVien = request.args.get('gv')
    if giangVien != None:
        print(f"request from {remote_addr} with gv={giangVien}")
        return search_info_lecturer(data_lecturer,giangVien)
    else:
        print(f"request from {remote_addr} - Get all info")
        return data_lecturer