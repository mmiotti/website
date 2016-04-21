from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def load_website():
    return render_template('main/index.html', name=name)

@app.route('/cars')
def load_cars():
    return render_template('cars/index.html', name=name)

if __name__ == '__main__':
	#app.debug = True
    app.run()