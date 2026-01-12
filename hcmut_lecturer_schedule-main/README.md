# HCMUT Lecturer Schedule API

This is a Python Flask web application that provides an API for retrieving information about lecturers and subjects at HCMUT (Ho Chi Minh City University of Technology), created by [@KenKout](https://github.com/KenKout).

## About

This API allows you to search for information about lecturers and subjects at HCMUT based on certain criteria. It retrieves data from JSON files and provides responses in JSON format.

## Usage

### Endpoints

#### 1. `/api`

- **GET**: Retrieve information about subjects and lecturers.
- Parameters:
  - `id` (optional): Search by subject ID.
  - `gv` (optional): Search by lecturer's name.
- Example:
  - `/api?id=CS101&gv=John%20Doe`

#### 2. `/api/info`

- **GET**: Retrieve information about a specific lecturer or all teacher data.
- Parameters:
  - `gv` (optional): Lecturer's name.
- Example:
  - `/api/info?gv=John%20Doe` (Retrieve information about a specific lecturer)
  - `/api/info` (Retrieve all teacher data)

#### 3. `/api/info/subject`

- **GET**: Retrieve a list of all subjects.
- Example:
  - `/api/info/subject`

## Setup

1. Clone this repository: `git clone https://github.com/KenKout/hcmut_lecturer_schedule.git`
2. Install Flask and Flask-CORS: `pip install flask flask-cors`
3. Run the Flask application: `python main.py`

Make sure to have the required JSON files (`data.json` and `data_lecturer.json`) in the same directory as `main.py`.

## Author

- [@KenKout](https://github.com/KenKout)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
