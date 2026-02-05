
import os
import csv
import re

directory = r"c:\Users\LG\Desktop\Study Material\AI\TKBSV\public\CTDT\Organized_CTDT\CHƯƠNG TRÌNH TIÊN TIẾN\Hệ thống Năng lượng"
vietnamese_pattern = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', re.IGNORECASE)

def check_logic():
    files = [f for f in os.listdir(directory) if f.endswith('.csv')]
    
    for file_name in files:
        print(f"\n--- Checking: {file_name} ---")
        file_path = os.path.join(directory, file_name)
        
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            next(reader) # Skip header
            
            for i, row in enumerate(reader, start=2):
                if len(row) < 6: continue
                stt, ma_hp, ten_hp, tin_chi = row[0], row[1], row[2], row[3]
                
                # Logic simulation
                is_stt_empty = not stt.strip()
                is_code_empty = not ma_hp.strip()
                has_vietnamese = bool(vietnamese_pattern.search(ten_hp))
                has_credits = bool(tin_chi.strip())
                starts_with_capital = re.match(r'^[A-Z]', ten_hp) is not None
                
                # Identify conflict
                is_potential_section = is_stt_empty and is_code_empty
                
                if is_potential_section:
                    # Current JS Logic simulation
                    js_is_english = starts_with_capital
                    
                    # Proposed Logic
                    proposed_is_section = has_vietnamese or has_credits
                    proposed_is_english = not proposed_is_section
                    
                    status = ""
                    if js_is_english and proposed_is_section:
                        status = "CONFLICT (JS thinks English, Proposed thinks Section)"
                    elif not js_is_english and not proposed_is_section:
                        status = "UNKNOWN"
                    else:
                        status = "MATCH"
                        
                    if status.startswith("CONFLICT"):
                        print(f"Line {i}: {ten_hp} | Credits: '{tin_chi}' | HasVN: {has_vietnamese} -> {status}")

check_logic()
