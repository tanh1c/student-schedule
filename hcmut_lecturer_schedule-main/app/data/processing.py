import json
import os



current_dir = os.path.dirname(os.path.abspath(__file__))
data_json_path = os.path.join(current_dir, 'data_subject.json')


print(f"Data JSON path: {data_json_path}")
output_path        = os.path.join(current_dir, 'subject.json')

with open(data_json_path) as f:
    data = json.load(f)



subject_info = []
for subject in data:
    subject_info.append({
        'maMonHoc': subject['maMonHoc'],
        'tenMonHoc': subject['tenMonHoc'],
        'soTinChi': subject['soTinChi'],
        'id': subject['id'],
    })

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(subject_info, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(subject_info)} subjects to {output_path}")
