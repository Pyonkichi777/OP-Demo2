class DeviceAggregator {
    constructor() {
        this.devices = {
            'cellular-main': {
                name: 'Cellular - Main',
                type: 'LTE/5G Primary',
                active: false,
                signalStrength: 0,
                dataUsage: 0,
                speed: 0,
                plan: 'Premium Unlimited',
                dataLimit: 'Unlimited',
                color: '#f59e0b'
            },
            'cellular-sub': {
                name: 'Cellular - Sub',
                type: 'LTE/5G Secondary',
                active: false,
                signalStrength: 0,
                dataUsage: 0,
                speed: 0,
                plan: 'Standard 50GB',
                dataLimit: 50,
                dataRemaining: 32.5,
                color: '#f8fafc'
            },
            wifi: {
                name: 'WiFi',
                type: '802.11ac',
                active: false,
                signalStrength: 0,
                dataUsage: 0,
                speed: 0,
                plan: 'Business Unlimited',
                dataLimit: 'Unlimited',
                color: '#06b6d4'
            },
            satellite: {
                name: 'Satellite',
                type: 'Starlink',
                active: false,
                signalStrength: 0,
                dataUsage: 0,
                speed: 0,
                plan: 'Enterprise 200GB',
                dataLimit: 200,
                dataRemaining: 147.3,
                color: '#10b981'
            }
        };

        this.dataHistory = {
            'cellular-main': [],
            'cellular-sub': [],
            wifi: [],
            satellite: []
        };
        
        this.initializeHistoricalData();

        this.init();
        this.startSimulation();
        this.initIndividualCharts();
        this.initDeviceListModal();
    }

    initializeHistoricalData() {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
        
        Object.keys(this.devices).forEach(deviceType => {
            for (let i = 0; i < 72; i++) {
                const timestamp = new Date(threeDaysAgo.getTime() + (i * 60 * 60 * 1000));
                const baseUsage = Math.random() * 5;
                this.dataHistory[deviceType].push({
                    timestamp: timestamp,
                    value: baseUsage + (i * 0.1)
                });
            }
        });
    }

    init() {
        this.attachEventListeners();
        this.updateUI();
        this.initChart();
    }

    attachEventListeners() {
        Object.keys(this.devices).forEach(deviceType => {
            const toggleCheckbox = document.getElementById(`${deviceType}-toggle`);
            if (toggleCheckbox) {
                toggleCheckbox.addEventListener('change', (e) => {
                    e.preventDefault();
                    const isChecked = e.target.checked;
                    // Reset checkbox state until confirmed
                    e.target.checked = !isChecked;
                    this.showConfirmation(deviceType, isChecked);
                });
            }
        });

        const deviceListBtn = document.querySelector('.control-btn.primary');
        if (deviceListBtn) {
            deviceListBtn.addEventListener('click', () => this.showDeviceList());
        }

        // Confirmation modal event listeners
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const confirmationModal = document.getElementById('confirmationModal');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.handleConfirmation(true));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleConfirmation(false));
        }
        if (confirmationModal) {
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) {
                    this.handleConfirmation(false);
                }
            });
        }
    }

    toggleDevice(deviceType) {
        const device = this.devices[deviceType];
        
        // If the device is currently disabled, enable it and disable all others
        if (!device.active) {
            // Disable all other devices
            Object.keys(this.devices).forEach(otherDeviceType => {
                if (otherDeviceType !== deviceType) {
                    this.devices[otherDeviceType].active = false;
                    this.devices[otherDeviceType].signalStrength = 0;
                    this.devices[otherDeviceType].speed = 0;
                    
                    // Update UI for other devices
                    const otherToggleBtn = document.getElementById(`${otherDeviceType}-toggle`);
                    if (otherToggleBtn) {
                        otherToggleBtn.classList.remove('active');
                    }
                    
                    const otherDeviceCard = document.querySelector(`.device-card[data-device="${otherDeviceType}"]`);
                    if (otherDeviceCard) {
                        otherDeviceCard.classList.remove('active');
                    }
                }
            });
            
            // Enable the selected device
            device.active = true;
            device.signalStrength = Math.floor(Math.random() * 5) + 1;
            device.speed = Math.random() * 100 + 10;
        } else {
            // If the device is currently enabled, disable it
            device.active = false;
            device.signalStrength = 0;
            device.speed = 0;
        }
        
        this.updateUI();
        this.updateChart();
        this.updateDeviceListModal();
        
        const toggleCheckbox = document.getElementById(`${deviceType}-toggle`);
        const toggleLabel = document.getElementById(`${deviceType}-label`);
        if (toggleCheckbox) {
            toggleCheckbox.checked = device.active;
        }
        if (toggleLabel) {
            toggleLabel.textContent = device.active ? 'Disable Device' : 'Enable Device';
        }
        
        const deviceCard = document.querySelector(`.device-card[data-device="${deviceType}"]`);
        if (deviceCard) {
            deviceCard.classList.toggle('active', device.active);
        }
    }

    updateUI() {
        Object.keys(this.devices).forEach(deviceType => {
            const device = this.devices[deviceType];
            this.updateDeviceStatus(deviceType, device);
            this.updateDeviceMetrics(deviceType, device);
        });
        
        this.updateGlobalStats();
    }

    updateDeviceStatus(deviceType, device) {
        const statusIndicator = document.getElementById(`${deviceType}-status`);
        if (statusIndicator) {
            statusIndicator.classList.toggle('active', device.active);
        }
    }

    updateDeviceMetrics(deviceType, device) {
        const signalBars = document.getElementById(`${deviceType}-signal`);
        if (signalBars) {
            signalBars.className = `signal-bars strength-${device.signalStrength}`;
        }

        const dataElement = document.getElementById(`${deviceType}-data`);
        if (dataElement) {
            dataElement.textContent = `${device.dataUsage.toFixed(2)}\u00A0GB`;
        }

        const speedElement = document.getElementById(`${deviceType}-speed`);
        if (speedElement) {
            speedElement.textContent = `${device.speed.toFixed(1)} Mbps`;
        }

        const planElement = document.getElementById(`${deviceType}-plan`);
        if (planElement) {
            planElement.textContent = device.plan;
        }

        const limitElement = document.getElementById(`${deviceType}-limit`);
        if (limitElement) {
            if (device.dataLimit === 'Unlimited') {
                limitElement.textContent = 'Unlimited';
                limitElement.className = 'metric-value unlimited';
            } else {
                limitElement.textContent = `${device.dataRemaining.toFixed(1)}\u00A0GB`;
                limitElement.className = 'metric-value limited';
            }
        }

        // Toggle label is updated in the main updateUI method
    }

    updateGlobalStats() {
        const totalData = Object.values(this.devices).reduce((sum, device) => sum + device.dataUsage, 0);

        const totalDataElement = document.getElementById('totalData');
        if (totalDataElement) {
            totalDataElement.textContent = `${totalData.toFixed(2)}\u00A0GB`;
        }
    }

    startSimulation() {
        setInterval(() => {
            this.simulateDataUsage();
            this.simulateSignalChanges();
            this.updateUI();
            this.updateChart();
            this.updateIndividualCharts();
        }, 2000);
    }

    simulateDataUsage() {
        Object.keys(this.devices).forEach(deviceType => {
            const device = this.devices[deviceType];
            if (device.active) {
                const increment = Math.random() * 0.1;
                device.dataUsage += increment;
                
                this.dataHistory[deviceType].push({
                    timestamp: new Date(),
                    value: device.dataUsage
                });
                
                if (this.dataHistory[deviceType].length > 72) {
                    this.dataHistory[deviceType].shift();
                }
            }
        });
    }

    simulateSignalChanges() {
        Object.keys(this.devices).forEach(deviceType => {
            const device = this.devices[deviceType];
            if (device.active) {
                const change = (Math.random() - 0.5) * 0.8;
                device.signalStrength = Math.max(1, Math.min(5, Math.round(device.signalStrength + change)));
                device.speed = Math.max(0, device.speed + (Math.random() * 20 - 10));
                
                if (device.dataLimit !== 'Unlimited') {
                    const usage = Math.random() * 0.05;
                    device.dataRemaining = Math.max(0, device.dataRemaining - usage);
                }
            } else {
                const naturalVariation = Math.random() * 3 + 1;
                device.signalStrength = Math.round(naturalVariation);
            }
        });
    }

    initChart() {
        const canvas = document.getElementById('dataChart');
        if (!canvas) return;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const ctx = canvas.getContext('2d');
        this.chartCtx = ctx;
        this.updateChart();
    }

    updateChart() {
        if (!this.chartCtx) return;
        
        const canvas = this.chartCtx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        this.chartCtx.clearRect(0, 0, width, height);
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        this.chartCtx.strokeStyle = '#475569';
        this.chartCtx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            this.chartCtx.beginPath();
            this.chartCtx.moveTo(padding, y);
            this.chartCtx.lineTo(width - padding, y);
            this.chartCtx.stroke();
        }
        
        for (let i = 0; i <= 10; i++) {
            const x = padding + (chartWidth / 10) * i;
            this.chartCtx.beginPath();
            this.chartCtx.moveTo(x, padding);
            this.chartCtx.lineTo(x, height - padding);
            this.chartCtx.stroke();
        }
        
        Object.keys(this.devices).forEach(deviceType => {
            const device = this.devices[deviceType];
            const history = this.dataHistory[deviceType];
            
            if (history.length < 2) return;
            
            this.chartCtx.strokeStyle = device.color;
            this.chartCtx.lineWidth = 3;
            this.chartCtx.beginPath();
            
            history.forEach((point, index) => {
                const x = padding + (chartWidth / (history.length - 1)) * index;
                const maxValue = Math.max(...Object.values(this.dataHistory).flat().map(p => p.value), 1);
                const y = height - padding - (point.value / maxValue) * chartHeight;
                
                if (index === 0) {
                    this.chartCtx.moveTo(x, y);
                } else {
                    this.chartCtx.lineTo(x, y);
                }
            });
            
            this.chartCtx.stroke();
            
            this.chartCtx.fillStyle = device.color;
            this.chartCtx.font = '12px Inter';
            this.chartCtx.fillText(device.name, padding, padding - 10 + Object.keys(this.devices).indexOf(deviceType) * 15);
        });
    }

    initIndividualCharts() {
        this.individualCharts = {};
        Object.keys(this.devices).forEach(deviceType => {
            const canvas = document.getElementById(`${deviceType}Chart`);
            if (canvas) {
                const container = canvas.parentElement;
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                this.individualCharts[deviceType] = canvas.getContext('2d');
            }
        });
    }

    updateIndividualCharts() {
        Object.keys(this.devices).forEach(deviceType => {
            const ctx = this.individualCharts[deviceType];
            if (!ctx) return;

            const canvas = ctx.canvas;
            const width = canvas.width;
            const height = canvas.height;
            const device = this.devices[deviceType];
            const history = this.dataHistory[deviceType];

            ctx.clearRect(0, 0, width, height);

            if (history.length < 2) {
                ctx.fillStyle = '#64748b';
                ctx.font = '14px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('No data available', width / 2, height / 2);
                return;
            }

            const padding = 20;
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2;

            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;

            for (let i = 0; i <= 3; i++) {
                const y = padding + (chartHeight / 3) * i;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }

            const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000));
            const twoDaysAgo = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
            const oneDayAgo = new Date(Date.now() - (1 * 24 * 60 * 60 * 1000));
            
            const dayPositions = [
                history.findIndex(p => p.timestamp >= twoDaysAgo),
                history.findIndex(p => p.timestamp >= oneDayAgo),
                history.length - 1
            ].filter(pos => pos > 0);

            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            dayPositions.forEach(pos => {
                const x = padding + (chartWidth / (history.length - 1)) * pos;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();
            });
            
            ctx.setLineDash([]);

            ctx.strokeStyle = device.color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            const maxValue = Math.max(...history.map(p => p.value), 1);

            history.forEach((point, index) => {
                const x = padding + (chartWidth / (history.length - 1)) * index;
                const y = height - padding - (point.value / maxValue) * chartHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            ctx.fillStyle = device.color + '40';
            ctx.beginPath();
            ctx.moveTo(padding, height - padding);
            history.forEach((point, index) => {
                const x = padding + (chartWidth / (history.length - 1)) * index;
                const y = height - padding - (point.value / maxValue) * chartHeight;
                ctx.lineTo(x, y);
            });
            ctx.lineTo(width - padding, height - padding);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#f8fafc';
            ctx.font = '10px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`${device.dataUsage.toFixed(2)}\u00A0GB`, padding, padding - 5);
            
            ctx.textAlign = 'right';
            const latestTime = history[history.length - 1]?.timestamp;
            if (latestTime) {
                const timeStr = latestTime.toLocaleDateString() + ' ' + latestTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                ctx.fillText(timeStr, width - padding, height - 5);
            }
        });
    }

    initDeviceListModal() {
        const modal = document.getElementById('deviceListModal');
        const closeBtn = document.getElementById('closeModal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideDeviceList());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideDeviceList();
                }
            });
        }

        document.querySelectorAll('.table-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceType = e.target.getAttribute('data-device');
                this.toggleDevice(deviceType);
            });
        });

    }

    showDeviceList() {
        const modal = document.getElementById('deviceListModal');
        if (modal) {
            modal.classList.add('active');
            this.updateDeviceListModal();
        }
    }

    hideDeviceList() {
        const modal = document.getElementById('deviceListModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    updateDeviceListModal() {
        Object.keys(this.devices).forEach(deviceType => {
            const device = this.devices[deviceType];
            
            const statusElement = document.getElementById(`modal-${deviceType}-status`);
            if (statusElement) {
                statusElement.textContent = device.active ? 'Enabled' : 'Disabled';
                statusElement.className = `status-badge ${device.active ? 'enabled' : 'disabled'}`;
            }
            
            const signalElement = document.getElementById(`modal-${deviceType}-signal`);
            if (signalElement) {
                signalElement.textContent = `${device.signalStrength}/5`;
            }
            
            const speedElement = document.getElementById(`modal-${deviceType}-speed`);
            if (speedElement) {
                speedElement.textContent = `${device.speed.toFixed(1)} Mbps`;
            }
            
            const planElement = document.getElementById(`modal-${deviceType}-plan`);
            if (planElement) {
                planElement.textContent = device.plan;
            }
            
            const dataElement = document.getElementById(`modal-${deviceType}-data`);
            if (dataElement) {
                dataElement.textContent = `${device.dataUsage.toFixed(2)}\u00A0GB`;
            }
            
            const tableRow = document.querySelector(`.table-row[data-device="${deviceType}"]`);
            if (tableRow) {
                tableRow.classList.toggle('active', device.active);
            }
        });
    }


    showConfirmation(deviceType, newState) {
        const device = this.devices[deviceType];
        const modal = document.getElementById('confirmationModal');
        const title = document.getElementById('confirmationTitle');
        const message = document.getElementById('confirmationMessage');
        
        if (modal && title && message) {
            const action = newState ? 'enable' : 'disable';
            title.textContent = `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)} Device`;
            message.textContent = `Are you sure you want to ${action} ${device.name}?`;
            
            this.pendingToggle = { deviceType, newState };
            modal.classList.add('active');
        }
    }

    handleConfirmation(confirmed) {
        const modal = document.getElementById('confirmationModal');
        
        if (confirmed && this.pendingToggle) {
            const { deviceType, newState } = this.pendingToggle;
            const toggleCheckbox = document.getElementById(`${deviceType}-toggle`);
            
            if (toggleCheckbox) {
                toggleCheckbox.checked = newState;
            }
            
            this.confirmToggleDevice(deviceType, newState);
        }
        
        this.pendingToggle = null;
        if (modal) {
            modal.classList.remove('active');
        }
    }

    confirmToggleDevice(deviceType, newState) {
        const device = this.devices[deviceType];
        
        if (newState) {
            // Disable all other devices when enabling this one
            Object.keys(this.devices).forEach(otherDeviceType => {
                if (otherDeviceType !== deviceType) {
                    this.devices[otherDeviceType].active = false;
                    this.devices[otherDeviceType].signalStrength = 0;
                    this.devices[otherDeviceType].speed = 0;
                    
                    // Update UI for other devices
                    const otherToggleCheckbox = document.getElementById(`${otherDeviceType}-toggle`);
                    if (otherToggleCheckbox) {
                        otherToggleCheckbox.checked = false;
                    }
                    
                    const otherDeviceCard = document.querySelector(`.device-card[data-device="${otherDeviceType}"]`);
                    if (otherDeviceCard) {
                        otherDeviceCard.classList.remove('active');
                    }
                }
            });
            
            // Enable the selected device
            device.active = true;
            device.signalStrength = Math.floor(Math.random() * 5) + 1;
            device.speed = Math.random() * 100 + 10;
        } else {
            // Disable the device
            device.active = false;
            device.signalStrength = 0;
            device.speed = 0;
        }
        
        this.updateUI();
        this.updateChart();
        this.updateDeviceListModal();
        
        const deviceCard = document.querySelector(`.device-card[data-device="${deviceType}"]`);
        if (deviceCard) {
            deviceCard.classList.toggle('active', device.active);
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new DeviceAggregator();
});

window.addEventListener('resize', () => {
    const canvas = document.getElementById('dataChart');
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    ['cellular-main', 'cellular-sub', 'wifi', 'satellite'].forEach(deviceType => {
        const canvas = document.getElementById(`${deviceType}Chart`);
        if (canvas) {
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }
    });
});