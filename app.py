from flask import render_template
from my_project import app


# Routes to render templates the web pages
@app.route('/')
def index_page():
    return render_template('index.html')

@app.route('/Loans')
def loans_page():
    return render_template('loans.html')

@app.route('/Books')
def books_page():
    return render_template('books.html')

@app.route('/Customers')
def customers_page():
    return render_template('customers.html')


# Run the flask app
if __name__ == '__main__':
    app.run(port=5001, debug=True)