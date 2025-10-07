from flask import Flask, render_template, jsonify
import random
from datetime import datetime
import os

app = Flask(__name__)

# Configuración para producción
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    DEBUG = False

app.config.from_object(Config)

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

# Health check para Render
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "message": "Parking System is running"})

# Manejo de errores 404
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

# Solo ejecutar en desarrollo
if __name__ == '__main__':
    if os.environ.get('RENDER'):
        # En producción, Render maneja el servidor
        pass
    else:
        # En desarrollo
        app.run(debug=True, host='0.0.0.0', port=5000)