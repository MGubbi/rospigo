from flask import Flask, render_template, redirect
import pandas as pd

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)