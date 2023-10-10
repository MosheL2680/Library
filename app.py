from flask import render_template
from my_project import app


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



if __name__ == '__main__':
    app.run(debug=True)