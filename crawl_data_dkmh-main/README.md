
# crawl_data_dkmh

This Python script is designed to crawl and extract data related to class schedules and course information from the Ho Chi Minh City University of Technology's MyBK portal.

## Prerequisites

Before using this script, ensure you have the following dependencies installed:

- Python 3.x
- Required Python libraries, which can be installed using pip:
  - `requests`
  - `beautifulsoup4`
  - `html2text`

You'll also need to set up environment variables for your MyBK username and password:

```bash
export USERNAME=your_username
export PASSWORD=your_password
```

## Usage

Follow these steps to use the script:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/KenKout/crawl_data_dkmh.git
```

2. Navigate to the project directory:

```bash
cd crawl_data_dkmh
```

3. Install the required Python libraries:

```bash
pip install requests beautifulsoup4 html2text
```

4. Run the script:

```bash
python main.py
```

The script will log in to your MyBK account, scrape class schedules and course information, and save the data to a JSON file named `data.json`.

## Contributing

If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository on GitHub.
2. Create a new branch with a descriptive name for your feature or bug fix.
3. Make your changes and commit them with clear, concise commit messages.
4. Push your changes to your fork.
5. Create a pull request on the original repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

This script was created by [@KenKout](https://www.github.com/KenKout), inspired by [@namanhishere](https://www.github.com/namanhishere). If you have any questions or need assistance, feel free to contact me or open issue.
