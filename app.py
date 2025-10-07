from flask import Flask, render_template, jsonify, Response
import random
from datetime import datetime
import time

app = Flask(__name__)

class ParkingSystem:
    def __init__(self):
        self.total_spaces = 24
        self.spaces = self.initialize_spaces()
    
    def initialize_spaces(self):
        spaces = []
        for i in range(self.total_spaces):
            occupied = random.random() < 0.6
            spaces.append({
                'id': i + 1,
                'occupied': occupied,
                'vehicle_type': random.choice(['Carro', 'Moto', 'Camioneta']) if occupied else None,
                'time': f"{random.randint(1, 180)} min" if occupied else ""
            })
        return spaces
    
    def get_status(self):
        occupied = sum(1 for space in self.spaces if space['occupied'])
        available = self.total_spaces - occupied
        occupancy_rate = (occupied / self.total_spaces) * 100
        
        return {
            'total_spaces': self.total_spaces,
            'occupied_spaces': occupied,
            'available_spaces': available,
            'occupancy_rate': round(occupancy_rate, 1),
            'spaces': self.spaces,
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }
    
    def update_random(self):
        for space in self.spaces:
            if random.random() < 0.1:
                if space['occupied']:
                    space['occupied'] = False
                    space['vehicle_type'] = None
                    space['time'] = ""
                else:
                    space['occupied'] = True
                    space['vehicle_type'] = random.choice(['Carro', 'Moto', 'Camioneta'])
                    space['time'] = f"{random.randint(1, 180)} min"

parking_system = ParkingSystem()

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/video-feed')
def video_feed():
    return render_template('video_feed.html')

@app.route('/api/status')
def get_status():
    return jsonify(parking_system.get_status())

@app.route('/api/update')
def update_status():
    parking_system.update_random()
    return jsonify(parking_system.get_status())

# Simular stream de video (en un caso real, aquí conectarías con OpenCV)
@app.route('/api/video_stream')
def video_stream():
    def generate():
        while True:
            # Simular frame de video (en realidad sería un frame JPEG)
            time.sleep(0.1)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + b'' + b'\r\n')
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)