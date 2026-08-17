const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0; 

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    updateNodePositions();
}
window.addEventListener('resize', resize);

// Solo 4 Nodos, tal como en el proyecto original
const nodes = {
    'A': { color: '#00f2fe', links: [], count: 0 },
    'B': { color: '#ff0844', links: [], count: 0 },
    'C': { color: '#f6d365', links: [], count: 0 },
    'D': { color: '#43e97b', links: [], count: 0 }
};

// Catálogo de Escenarios (Matrices de conectividad)
const scenarios = [
    {
        title: "1. Red Original",
        desc: "El ejemplo de tu trabajo: La página A distribuye a B y C. C y D alimentan a A. A termina siendo la más importante.",
        links: { 'A': ['B', 'C'], 'B': ['C', 'D'], 'C': ['A'], 'D': ['A'] }
    },
    {
        title: "2. Red en Estrella",
        desc: "B, C y D apuntan exclusivamente a A. A apunta a todos. Observa cómo A absorbe casi todo el tráfico.",
        links: { 'A': ['B', 'C', 'D'], 'B': ['A'], 'C': ['A'], 'D': ['A'] }
    },
    {
        title: "3. Bucle Circular",
        desc: "A -> B -> C -> D -> A. Al ser un ciclo perfecto, todas las páginas terminarán con exactamente un 25% de importancia.",
        links: { 'A': ['B'], 'B': ['C'], 'C': ['D'], 'D': ['A'] }
    },
    {
        title: "4. Grupos Aislados",
        desc: "A se enlaza con B. C se enlaza con D. Sin el factor de amortiguamiento (15% al azar), el algoritmo fallaría aquí.",
        links: { 'A': ['B'], 'B': ['A'], 'C': ['D'], 'D': ['C'] }
    }
];

Object.keys(nodes).forEach((key, index) => {
    nodes[key].baseRadius = 50;
    nodes[key].radius = 50;
    nodes[key].phase = index;
});

function updateNodePositions() {
    const centerX = width / 2;
    const centerY = height / 2 + 30;
    const offset = Math.min(width, height) * 0.25;
    
    // Disposición en diamante (Arriba, Derecha, Abajo, Izquierda)
    nodes['A'].baseX = centerX;             nodes['A'].baseY = centerY - offset;
    nodes['B'].baseX = centerX + offset;    nodes['B'].baseY = centerY;
    nodes['C'].baseX = centerX;             nodes['C'].baseY = centerY + offset;
    nodes['D'].baseX = centerX - offset;    nodes['D'].baseY = centerY;

    Object.keys(nodes).forEach(key => {
        if(nodes[key].x === undefined) {
            nodes[key].x = nodes[key].baseX;
            nodes[key].y = nodes[key].baseY;
        }
    });
}

let surfers = [];
const ALPHA = 0.85; // Factor de amortiguamiento del 85%

function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function getBezierPoint(t, p0, p1, p2) {
    const u = 1 - t;
    return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
    };
}

class Surfer {
    constructor(startNode) {
        this.currentNode = startNode;
        this.targetNode = null;
        this.state = 'idle'; 
        this.progress = 0;
        this.speed = 0.005 + Math.random() * 0.005;
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitRadius = Math.random() * 35;
        this.orbitSpeed = (Math.random() - 0.5) * 0.05;
        this.x = nodes[startNode].x;
        this.y = nodes[startNode].y;
        this.idleTimer = Math.random() * 80; 
        nodes[startNode].count++;
    }

    update() {
        if (this.state === 'idle') {
            this.idleTimer--;
            let n = nodes[this.currentNode];
            this.orbitAngle += this.orbitSpeed;
            this.x += (n.x + Math.cos(this.orbitAngle) * this.orbitRadius - this.x) * 0.1;
            this.y += (n.y + Math.sin(this.orbitAngle) * this.orbitRadius - this.y) * 0.1;

            if (this.idleTimer <= 0) this.chooseNextDestination();
        } else {
            this.progress += this.state === 'teleporting' ? this.speed * 2 : this.speed;
            let start = nodes[this.currentNode];
            let end = nodes[this.targetNode];
            
            if (this.progress >= 1) {
                this.x = end.x; this.y = end.y;
                this.currentNode = this.targetNode;
                this.state = 'idle';
                this.progress = 0;
                this.idleTimer = 30 + Math.random() * 60;
                end.count++;
            } else {
                let easeT = easeInOutQuad(this.progress);
                if (this.state === 'teleporting') {
                    let midX = (start.x + end.x) / 2;
                    let midY = (start.y + end.y) / 2 - 200;
                    let pos = getBezierPoint(easeT, start, {x: midX, y: midY}, end);
                    this.x = pos.x; this.y = pos.y;
                } else {
                    let dx = end.x - start.x;
                    let dy = end.y - start.y;
                    let midX = (start.x + end.x) / 2 - dy * 0.3;
                    let midY = (start.y + end.y) / 2 + dx * 0.3;
                    let pos = getBezierPoint(easeT, start, {x: midX, y: midY}, end);
                    this.x = pos.x; this.y = pos.y;
                }
            }
        }
    }

    chooseNextDestination() {
        nodes[this.currentNode].count--;
        
        if (Math.random() < ALPHA) {
            let links = nodes[this.currentNode].links;
            this.targetNode = links[Math.floor(Math.random() * links.length)];
            this.state = 'moving';
        } else {
            const keys = Object.keys(nodes);
            this.targetNode = keys[Math.floor(Math.random() * keys.length)];
            this.state = 'teleporting';
        }
    }

    draw() {
        ctx.beginPath();
        if (this.state === 'teleporting') {
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15; ctx.shadowColor = '#ffffff';
        } else if (this.state === 'moving') {
            ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = nodes[this.currentNode].color;
            ctx.shadowBlur = 10; ctx.shadowColor = nodes[this.currentNode].color;
        } else {
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = nodes[this.currentNode].color;
            ctx.globalAlpha = 0.6; ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    }
}

// Función para cambiar de ejemplo
function loadScenario(index, btnElement) {
    // Actualizar botones UI
    if(btnElement) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    const data = scenarios[index];
    document.getElementById('scenario-title').innerText = data.title;
    document.getElementById('scenario-desc').innerText = data.desc;

    // Actualizar enlaces de la red
    Object.keys(nodes).forEach(key => {
        nodes[key].links = data.links[key];
        nodes[key].count = 0; // Reiniciar contadores
    });

    // Reiniciar simulación visual
    surfers = [];
    addSurfers(200);
}

function addSurfers(amount, specificNode = null) {
    const keys = Object.keys(nodes);
    for (let i = 0; i < amount; i++) {
        let start = specificNode ? specificNode : keys[Math.floor(Math.random() * keys.length)];
        surfers.push(new Surfer(start));
    }
}

function reset() {
    surfers = [];
    Object.keys(nodes).forEach(key => nodes[key].count = 0);
    addSurfers(200);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    Object.keys(nodes).forEach(key => {
        let n = nodes[key];
        let dist = Math.hypot(mouseX - n.x, mouseY - n.y);
        if (dist < n.radius * 1.5) {
            addSurfers(40, key);
            n.radius += 25; 
        }
    });
});

function drawEdges() {
    ctx.lineWidth = 1.5;
    Object.keys(nodes).forEach(key => {
        let start = nodes[key];
        start.links.forEach(targetKey => {
            let end = nodes[targetKey];
            let dx = end.x - start.x;
            let dy = end.y - start.y;
            let midX = (start.x + end.x) / 2 - dy * 0.2;
            let midY = (start.y + end.y) / 2 + dx * 0.2;

            let gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            gradient.addColorStop(0, start.color + '80'); 
            gradient.addColorStop(1, end.color + '10');

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.quadraticCurveTo(midX, midY, end.x, end.y);
            ctx.strokeStyle = gradient;
            ctx.stroke();
            
            // Dibujar pequeña flecha indicadora
            let easeT = 0.6; // Mitad del camino
            let arrowPos = getBezierPoint(easeT, start, {x: midX, y: midY}, end);
            ctx.beginPath();
            ctx.arc(arrowPos.x, arrowPos.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = start.color;
            ctx.fill();
        });
    });
}

function drawNodes() {
    Object.keys(nodes).forEach(key => {
        let n = nodes[key];
        
        n.y = n.baseY + Math.sin(time + n.phase) * 12;
        n.x = n.baseX + Math.cos(time + n.phase * 0.5) * 6;

        let total = Math.max(1, surfers.length);
        let targetRadius = n.baseRadius + (n.count / total) * 80;
        n.radius += (targetRadius - n.radius) * 0.1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 15, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '15';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        let grad = ctx.createRadialGradient(n.x - 10, n.y - 10, 5, n.x, n.y, n.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, n.color);
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 20; ctx.shadowColor = n.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#0b0b14'; 
        ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; 
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff'; 
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(key, n.x, n.y + 1);
    });
}

function updateLeaderboard() {
    const total = Math.max(1, surfers.length);
    const sortedNodes = Object.keys(nodes).map(key => {
        return { key: key, perc: (nodes[key].count / total) * 100, color: nodes[key].color };
    }).sort((a, b) => b.perc - a.perc);

    const board = document.getElementById('leaderboard');
    board.innerHTML = ''; 
    
    sortedNodes.forEach(n => {
        board.innerHTML += `
            <div class="node-row">
                <div class="node-label" style="color: ${n.color}; text-shadow: 0 0 10px ${n.color};">${n.key}</div>
                <div class="bar-container">
                    <div class="bar" style="background: ${n.color}; width: ${n.perc}%; box-shadow: 0 0 10px ${n.color};"></div>
                </div>
                <div class="percent">${n.perc.toFixed(1)}%</div>
            </div>
        `;
    });
}

function animate() {
    time += 0.02;
    ctx.fillStyle = 'rgba(11, 11, 20, 0.5)';
    ctx.fillRect(0, 0, width, height);

    drawEdges();
    drawNodes();

    surfers.forEach(s => { s.update(); s.draw(); });
    updateLeaderboard();
    
    requestAnimationFrame(animate);
}

// Inicializar con el Escenario 0 (Red Original del Trabajo)
resize();
loadScenario(0, null);
animate();