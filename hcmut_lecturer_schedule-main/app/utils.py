from datetime import datetime, timedelta, timezone



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



SEMESTER_START = datetime(2025, 2, 3, tzinfo=timezone.utc) 
PERIOD_TIMES = {
    1: ("07:00", "07:50"),
    2: ("08:00", "08:50"),
    3: ("09:00", "09:50"),
    4: ("10:00", "10:50"),
    5: ("11:00", "11:50"),
    6: ("12:00", "12:50"),
}

def transform_to_calendar_events(payload: dict) -> list[dict]:
    """
    Turn your schedule JSON into a list of Google Calendar event bodies.
    """
    events = []
    for entry in payload["lichHoc"]:
        class_info_list = entry["classInfo"]
        title = f"{payload['maMonHoc']} – {payload['tenMonHoc']}"
        professor = entry.get("giangVien", "").strip()
        room = None
        for ci in class_info_list:
            room = ci.get("phong", "").strip() or room
            dow = ci["dayOfWeek"]  # 1=Monday … 7=Sunday
            weeks = ci["week"]
            periods = ci["tietHoc"]
            
            for w in weeks:
                # date = semester_start + (w-1) weeks + (dow-1) days
                event_date = SEMESTER_START + timedelta(weeks=w-1, days=dow-1)
                
                # each period block
                # if multiple contiguous periods, merge into one event span
                start_period = min(periods)
                end_period   = max(periods)
                
                start_hm = PERIOD_TIMES[start_period][0]
                end_hm   = PERIOD_TIMES[end_period][1]
                
                start_dt = datetime.fromisoformat(f"{event_date.date().isoformat()}T{start_hm}+00:00")
                end_dt   = datetime.fromisoformat(f"{event_date.date().isoformat()}T{end_hm}+00:00")
                
                body = {
                    "summary": title,
                    "description": f"Lecturer: {professor}\n Email: {entry.get('email', '').strip()}\n Group: {entry.get('group', '').strip()}",
                    "location": room,
                    "start":    {"dateTime": start_dt.isoformat()},
                    "end":      {"dateTime": end_dt.isoformat()},
                    "reminders": {
                        "useDefault": False,
                        "overrides": [
                            {"method": "popup", "minutes": 10},
                        ],
                    },
                }
                events.append(body)
    return events