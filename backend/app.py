# This file run the flask project

from my_project import app

# Route to render the background img of the web
@app.route('/static/img/<image_filename>')
def serve_image(image_filename):
    return app.send_static_file('img/' + image_filename)


if __name__ == '__main__':
    app.run(port=5001, debug=True)