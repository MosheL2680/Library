from flask import Flask
from flask_sqlalchemy import SQLAlchemy



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
db = SQLAlchemy(app)


#register blueprints

from my_project.books import books
from my_project.customers import customers
from my_project.loans import loans

app.register_blueprint(books)
app.register_blueprint(customers)
app.register_blueprint(loans)
