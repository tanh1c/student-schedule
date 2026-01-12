from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta, timezone
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from utils import transform_to_calendar_events



celandar_bp = Blueprint('calendar', __name__, url_prefix='/api/calendar')

def getCalendarService(access_token, refresh_token):
    client_id = "1148541732725-usgt189nmop22b764l5c27msugm7rmji.apps.googleusercontent.com"
    client_secret = "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"
    token_uri = "https://oauth2.googleapis.com/token"
    SCOPES = ['https://www.googleapis.com/auth/calendar']

    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES
    )

    service = build('calendar', 'v3', credentials=creds)
    print("Google Calendar service created successfully")
    return service








@celandar_bp.route('', methods=['GET'])
def getEvents():
    """
    Fetch Google Calendar events within a time window.
    ---
    tags:
      - Calendar
    parameters:
      - name: access_token
        in: query
        type: string
        required: false
        description: OAuth2 access token (if not stored in session)
      - name: refresh_token
        in: query
        type: string
        required: false
        description: OAuth2 refresh token (if not stored in session)
      - name: startDate
        in: query
        type: string
        format: date-time
        required: false
        description: RFC3339 timestamp to start fetching events from
        example: 2025-05-01T00:00:00Z
      - name: endDate
        in: query
        type: string
        format: date-time
        required: false
        description: RFC3339 timestamp to stop fetching events at
        example: 2025-06-01T00:00:00Z
    responses:
      200:
        description: A list of CalendarEvent objects
        
    """

    # Get Tokens from session or request args
    tokens = session.get('google_tokens')
    print("tokens:", tokens)
   
    access_token = tokens.get('access_token') if tokens else request.args.get('access_token')
    refresh_token = tokens.get('refresh_token') if tokens else request.args.get('refresh_token')
    
    print("access_token:", access_token)
    print("refresh_token:", refresh_token)
        
        
   
    if not access_token or not refresh_token:
        return jsonify({"error": "Access token and refresh token are required"}), 401
    
    service = getCalendarService(access_token, refresh_token)
    if not service:
        return jsonify({"error": "Failed to create calendar service"}), 500
    
    now       = datetime.now(timezone.utc)
    startDate = request.args.get('startDate') or (now - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
    endDate   = request.args.get('endDate')   or (now + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")

         
    print(f"Fetching events from {startDate} to {endDate}")
   
    events_result = service.events().list(
        calendarId='primary',
        timeMin=startDate,
        timeMax=endDate,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    revents = events_result.get('items', [])
    if not revents:
        print('No upcoming events found.')
    else:
        print('Upcoming events:')
        for event in revents:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            print(f"{start} - {end}: {event['summary']}")
            
    return jsonify(revents), 200
    
    
        

@celandar_bp.route('/', methods=['POST'])
def create_event(): 
    
    """
    Create one or more Google Calendar events from a JSON schedule payload.
    ---
    tags:
      - Calendar
    consumes:
      - application/json
    parameters:
      - name: access_token
        in: query
        type: string
        required: false
        description: OAuth2 access token (if not stored in session)
      - name: refresh_token
        in: query
        type: string
        required: false
        description: OAuth2 refresh token (if not stored in session)
      - name: payload
        in: body
        required: true
  
        example:
          id: "14178"
          lichHoc:
            - classInfo:
                - coSo: " 2  "
                  dayOfWeek: 3
                  phong: "H6-411"
                  tietHoc: [5, 6]
                  week: [1,2,3,4,5,6,7,9,10,11,12,13,14,15,16]
              email: "lecaodang@hcmut.edu.vn"
              emailBT: ""
              giangVien: "Lê Cao Đăng"
              giangVienBT: ""
              group: "L01"
              ngonNgu: "V"
              nhomBT: ""
              nhomLT: "L01"
              phone: "(84.8) 8 635 869 – Ext: 5317"
              phoneBT: ""
              siso: "16/80"
              sisoLT: "80"
          maMonHoc: "AS2009"
          soTinChi: 0
          tenMonHoc: "Csở cơ học lượng tử – vlcr"
    responses:
      201:
        description: Events created successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Events created successfully
     
    """
    
    # Get events from request body
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "No payload provided"}), 400
    
    # Get Tokens from session or request args
    tokens = session.get('google_tokens')
    print("tokens:", tokens)
   
    access_token = tokens.get('access_token') if tokens else request.args.get('access_token')
    refresh_token = tokens.get('refresh_token') if tokens else request.args.get('refresh_token')
    
        
    if not access_token or not refresh_token:
        return jsonify({"error": "Access token and refresh token are required"}), 401

    service = getCalendarService(access_token, refresh_token)
    if not service:
        return jsonify({"error": "Failed to create calendar service"}), 500 
    
    events = transform_to_calendar_events(payload)
    for event in events:
        try:
            service.events().insert(calendarId='primary', body=event).execute()
        except Exception as e:
            return jsonify({"error": f"Failed to create event: {str(e)}"}), 500
        
    return jsonify({"message": "Events created successfully", "event": events}), 201
   
    