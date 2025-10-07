class ParkingDashboard {
    constructor() {
        this.autoRefresh = false;
        this.refreshInterval = null;
        this.initializeEventListeners();
        this.loadParkingData();
    }

    initializeEventListeners() {
        // Botón de actualización manual
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadParkingData();
        });

        // Botón de auto-actualización
        document.getElementById('auto-refresh-btn').addEventListener('click', () => {
            this.toggleAutoRefresh();
        });
    }

    async loadParkingData() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            this.updateDashboard(data);
        } catch (error) {
            console.error('Error loading parking data:', error);
        }
    }

    async updateRandomData() {
        try {
            const response = await fetch('/api/update');
            const data = await response.json();
            this.updateDashboard(data);
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }

    updateDashboard(data) {
        // Actualizar métricas
        document.getElementById('total-spaces').textContent = data.total_spaces;
        document.getElementById('occupied-spaces').textContent = data.occupied_spaces;
        document.getElementById('available-spaces').textContent = data.available_spaces;
        document.getElementById('occupancy-rate').textContent = `${data.occupancy_rate}%`;

        // Actualizar mapa de estacionamiento
        this.updateParkingGrid(data.spaces);

        // Actualizar distribución de vehículos
        this.updateVehicleDistribution(data.spaces);

        // Actualizar estadísticas rápidas
        this.updateQuickStats(data);

        // Actualizar timestamp
        document.getElementById('last-update').textContent = data.timestamp;
    }

    updateParkingGrid(spaces) {
        const grid = document.getElementById('parking-grid');
        grid.innerHTML = '';

        spaces.forEach(space => {
            const spaceElement = this.createSpaceElement(space);
            grid.appendChild(spaceElement);
        });
    }

    createSpaceElement(space) {
        const div = document.createElement('div');
        const statusClass = space.occupied 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600';
        
        div.className = `aspect-square rounded-lg flex flex-col items-center justify-center text-white font-semibold cursor-pointer transition duration-200 ${statusClass}`;
        div.innerHTML = `
            <div class="text-lg">${space.id}</div>
            <div class="text-xs mt-1">${space.occupied ? space.vehicle_type : 'Libre'}</div>
        `;

        div.addEventListener('click', () => {
            this.showSpaceInfo(space);
        });

        return div;
    }

    updateVehicleDistribution(spaces) {
        const distribution = document.getElementById('vehicle-distribution');
        const vehicleCount = {};
        
        spaces.forEach(space => {
            if (space.occupied && space.vehicle_type) {
                vehicleCount[space.vehicle_type] = (vehicleCount[space.vehicle_type] || 0) + 1;
            }
        });

        let html = '';
        for (const [type, count] of Object.entries(vehicleCount)) {
            const percentage = ((count / spaces.length) * 100).toFixed(1);
            html += `
                <div class="flex justify-between items-center">
                    <span class="text-gray-700">${type}</span>
                    <div class="flex items-center space-x-2">
                        <div class="w-20 bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                        <span class="text-sm text-gray-500 w-8">${count}</span>
                    </div>
                </div>
            `;
        }

        distribution.innerHTML = html || '<p class="text-gray-500 text-center">No hay vehículos estacionados</p>';
    }

    updateQuickStats(data) {
        const stats = document.getElementById('quick-stats');
        const availablePercentage = ((data.available_spaces / data.total_spaces) * 100).toFixed(1);
        
        stats.innerHTML = `
            <div class="flex justify-between">
                <span class="text-gray-600">Tasa de disponibilidad:</span>
                <span class="font-semibold ${availablePercentage > 30 ? 'text-green-600' : 'text-red-600'}">
                    ${availablePercentage}%
                </span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Espacios por fila:</span>
                <span class="font-semibold">8 espacios</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Estado del sistema:</span>
                <span class="font-semibold text-green-600">Operativo</span>
            </div>
        `;
    }

    toggleAutoRefresh() {
        const button = document.getElementById('auto-refresh-btn');
        
        if (this.autoRefresh) {
            // Detener auto-actualización
            clearInterval(this.refreshInterval);
            this.autoRefresh = false;
            button.innerHTML = '<i class="fas fa-play mr-2"></i>Auto Actualizar';
            button.className = 'bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition duration-200';
        } else {
            // Iniciar auto-actualización
            this.autoRefresh = true;
            this.refreshInterval = setInterval(() => {
                this.updateRandomData();
            }, 3000); // Actualizar cada 3 segundos
            
            button.innerHTML = '<i class="fas fa-stop mr-2"></i>Detener Auto';
            button.className = 'bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center transition duration-200';
        }
    }

    showSpaceInfo(space) {
        const status = space.occupied ? 'Ocupado' : 'Disponible';
        const vehicleInfo = space.occupied ? ` por ${space.vehicle_type}` : '';
        const timeInfo = space.occupied ? ` (${space.time})` : '';
        
        alert(`Espacio ${space.id}\nEstado: ${status}${vehicleInfo}${timeInfo}`);
    }
}

// Inicializar el dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new ParkingDashboard();
});

// Actualizar la hora actual
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime();