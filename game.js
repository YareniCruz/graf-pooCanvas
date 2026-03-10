// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota) con soporte para color y radio dinámico
class Ball {
  constructor(x, y, radius, speedX, speedY, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color; // Nuevo: Color individual
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color; // Usa el color de la pelota
    ctx.fill();
    ctx.closePath();
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Colisión con la parte superior e inferior
    if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
      this.speedY = -this.speedY;
    }
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    // Invertir dirección y aleatorizar un poco el ángulo al resetear
    this.speedX = -this.speedX;
  }
}

// Clase Paddle (Paleta) con soporte para color
class Paddle {
  constructor(x, y, width, height, color, isPlayerControlled = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color; // Nuevo: Color de la paleta
    this.isPlayerControlled = isPlayerControlled;
    this.speed = 7;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(direction) {
    if (direction === 'up' && this.y > 0) {
      this.y -= this.speed;
    } else if (direction === 'down' && this.y + this.height < canvas.height) {
      this.y += this.speed;
    }
  }

  // IA mejorada para seguir a la pelota más cercana o a una principal
  autoMove(ball) {
    if (ball.y < this.y + this.height / 2) {
      this.y -= this.speed * 0.8; // Un poco más lenta para que sea ganable
    } else if (ball.y > this.y + this.height / 2) {
      this.y += this.speed * 0.8;
    }
  }
}

// Clase Game (Controla el juego)
class Game {
  constructor() {
    // 1. Generar 5 pelotas con diferentes propiedades
    this.balls = [];
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FFFF33'];
    
    for (let i = 0; i < 5; i++) {
      this.balls.push(new Ball(
        canvas.width / 2, 
        canvas.height / 2, 
        5 + Math.random() * 5,       // Radio entre 5 y 10
        (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2), // Velocidad X aleatoria
        (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2), // Velocidad Y aleatoria
        colors[i]
      ));
    }

    // Paleta del jugador
    this.paddle1 = new Paddle(10, canvas.height / 2 - 100, 15, 200, '#00d2ff', true); 
    // Paleta CPU estándar
    this.paddle2 = new Paddle(canvas.width - 25, canvas.height / 2 - 50, 15, 100, '#ff4b2b');
    
    this.keys = {};
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar todas las pelotas
    this.balls.forEach(ball => ball.draw());
    
    this.paddle1.draw();
    this.paddle2.draw();
  }

  update() {
    this.balls.forEach(ball => {
      ball.move();

      // Colisión con Paleta 1 (Jugador) - Detecta todas las pelotas
      if (ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
          ball.x - ball.radius >= this.paddle1.x && // Para evitar que se "teletransporte" detrás
          ball.y >= this.paddle1.y && ball.y <= this.paddle1.y + this.paddle1.height) {
        ball.speedX = Math.abs(ball.speedX); // Rebota hacia la derecha
      }

      // Colisión con Paleta 2 (CPU)
      if (ball.x + ball.radius >= this.paddle2.x &&
          ball.x + ball.radius <= this.paddle2.x + this.paddle2.width &&
          ball.y >= this.paddle2.y && ball.y <= this.paddle2.y + this.paddle2.height) {
        ball.speedX = -Math.abs(ball.speedX); // Rebota hacia la izquierda
      }

      // Resetear si salen de los bordes laterales
      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
        ball.reset();
      }
    });

    // Movimiento Jugador
    if (this.keys['ArrowUp']) this.paddle1.move('up');
    if (this.keys['ArrowDown']) this.paddle1.move('down');

    // Movimiento IA (sigue a la primera pelota del arreglo por simplicidad)
    this.paddle2.autoMove(this.balls[0]);
  }

  handleInput() {
    window.addEventListener('keydown', (e) => this.keys[e.key] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key] = false);
  }

  run() {
    this.handleInput();
    const gameLoop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }
}

const game = new Game();
game.run();