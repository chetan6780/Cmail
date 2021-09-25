# <img src="https://user-images.githubusercontent.com/62825092/134491462-35446f6c-fa65-45ec-a844-a9f152d20929.png" alt="Cmail logo" style="width:35px"> Cmail

## Local setup.

1. Clone the repository

```sh
$ git clone https://github.com/chetan6780/Cmail.git
$ cd Cmail
```

2. Create a virtual environment to install dependencies in and activate it:

```sh
$ python -m venv .
$ .\Scripts\activate
```

3. install the dependencies:

```sh
(venv)$ pip install -r requirements.txt
```
*Note: `(venv)` in front of the prompt. This indicates that this terminal
session operates in a virtual environment set up by `virtualenv`.
For pipenv you will not see any `(venv)` in front of the propt.*

4. Once `pip` has finished downloading the dependencies:
```sh
(venv)$ cd src
(venv)$ python manage.py makemigrations
(venv)$ python manage.py migrate
(venv)$ python manage.py runserver
```
The application should be running on [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
