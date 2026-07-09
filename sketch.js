let tono;
let toneStarted = false;
let volumen = 0.5;
let frecuencia;

let pA_x, pA_y; // punta de curva A
let pB_x, pB_y; // punta de curva B

let contr_A_x, contr_A_y; // punto de control A
let contr_B_x, contr_B_y; // punto de control B

let width_steps = 21; // cantidad de pasos a lo largo del ancho de la pantalla
let time_counter; // contador de tiempo para determinar el paso actual
let ultimoTiempo; // variable para almacenar el tiempo del último paso
let speed; // velocidad de reproducción del tiempo

let controller_radio; // radio de los círculos de control

let play;
let play_control_X, play_control_Y; // posición del boton de play

let speed_control_X, speed_control_Y;
let speed_control_X_min, speed_control_X_max;

let volume_control_X, volume_control_Y;
let volume_control_X_min, volume_control_X_max;

let scale_factor;
let marging_width, marging_heigth;
let scale_control_X, scale_control_Y;
let scale_control_X_min, scale_control_X_max;

let rotate_control_X, rotate_control_Y;
let rotating = false;
let backgroundColor;

function setup() {
  createCanvas(1000, 800);
  colorMode(HSB, 360, 100, 100, 100);

  play = false;
  backgroundColor = color(40, 10, 100);
  scale_factor = 1.0;

  pA_x = width * 0.3;
  pA_y = height * 0.6;
  pB_x = width * 0.7;
  pB_y = height * 0.3;

  contr_A_x = pA_x + (pB_x - pA_x) / 2;
  contr_A_y = pB_y + (pA_y - pB_y) / 2;
  contr_B_x = contr_A_x;
  contr_B_y = contr_A_y;

  controller_radio = width / 20;
  time_counter = 0;
  speed = 5;
  ultimoTiempo = 0;

  play_control_X = width * 0.15;
  play_control_Y = height * 0.95;

  speed_control_X = width * 0.3;
  speed_control_Y = height * 0.95;
  speed_control_X_min = speed_control_X - width * 0.05;
  speed_control_X_max = speed_control_X + width * 0.05;

  volume_control_X = width * 0.48;
  volume_control_Y = height * 0.95;
  volume_control_X_min = volume_control_X - 50;
  volume_control_X_max = volume_control_X + 50;

  scale_control_X = width * 0.65;
  scale_control_Y = height * 0.95;
  scale_control_X_min = scale_control_X - width * 0.05;
  scale_control_X_max = scale_control_X + width * 0.05;

  rotate_control_X = width * 0.85;
  rotate_control_Y = height * 0.95;

  tono = new p5.Oscillator('sine');
  tono.amp(0);

  frecuencia = 100;
}

function draw() {
  background(backgroundColor);
  noStroke();

  if (play) {
    if (!toneStarted) {
      tono.start();
      toneStarted = true;
    }
  } else if (toneStarted) {
    tono.stop();
    toneStarted = false;
  }

  speed = map(speed_control_X, speed_control_X_min, speed_control_X_max, 1, 10);
  volumen = map(volume_control_X, volume_control_X_min, volume_control_X_max, 0, 2);
  scale_factor = map(scale_control_X, scale_control_X_min, scale_control_X_max, 0.4, 1);

  marging_width = width * ((1 - scale_factor) / 2);
  marging_heigth = height * ((1 - scale_factor) / 2);

  contr_A_x = constrain(contr_A_x, 0 - marging_width, width + marging_width);
  contr_A_y = constrain(contr_A_y, 0 - marging_heigth, height + marging_heigth);
  contr_B_x = constrain(contr_B_x, 0 - marging_width, width + marging_width);
  contr_B_y = constrain(contr_B_y, 0 - marging_heigth, height + marging_heigth);
  pA_x = constrain(pA_x, 0 - marging_width, width + marging_width);
  pA_y = constrain(pA_y, 0 - marging_heigth, height + marging_heigth);
  pB_x = constrain(pB_x, 0 - marging_width, width + marging_width);
  pB_y = constrain(pB_y, 0 - marging_heigth, height + marging_heigth);

  push();
  translate(width / 2, height / 2);
  scale(scale_factor, scale_factor);
  if (rotating) {
    rotate(radians(180));
  }
  translate(-width / 2, -height / 2);

  let segment_width = width / width_steps;
  let current_step = int(time_counter);

  let current_p3_x = bezierPoint(pA_x, contr_A_x, contr_B_x, pB_x, current_step * (1.0 / width_steps));
  let current_p4_x = bezierPoint(pA_x, contr_A_x, contr_B_x, pB_x, (current_step + 1) * (1.0 / width_steps));
  let current_p4_y = bezierPoint(pA_y, contr_A_y, contr_B_y, pB_y, (current_step + 1) * (1.0 / width_steps));
  let grosor_banda_activa = current_p4_x - current_p3_x;

  let factor_tiempo = 2.5;
  let intervaloMilis = abs(grosor_banda_activa) * factor_tiempo / speed;

  if (frameCount - ultimoTiempo >= intervaloMilis && play) {
    time_counter += 1;
    ultimoTiempo = frameCount;
  }

  time_counter = time_counter % width_steps;
  let current_p1_x = (current_step + 1) * segment_width;
  let screenX_freq_factor = current_p4_x / current_p1_x;

  if (current_step % 2 === 0) {
    frecuencia = (1.0 / current_p4_y) * screenX_freq_factor * 100000;
    frecuencia = constrain(frecuencia, 100, 2000);
    if (play) {
      tono.amp(volumen, 0.05);
      tono.freq(frecuencia);
    }
  }

  noStroke();

  // INICIO DE DIBUJO DE BANDAS
  for (let i = 0; i < width_steps; i += 1) {
    let p1_x = (i + 1) * segment_width;
    let p2_x = i * segment_width;
    let p3_x = bezierPoint(pA_x, contr_A_x, contr_B_x, pB_x, i * (1.0 / width_steps));
    let p3_y = bezierPoint(pA_y, contr_A_y, contr_B_y, pB_y, i * (1.0 / width_steps));
    let p4_x = bezierPoint(pA_x, contr_A_x, contr_B_x, pB_x, (i + 1) * (1.0 / width_steps));
    let p4_y = bezierPoint(pA_y, contr_A_y, contr_B_y, pB_y, (i + 1) * (1.0 / width_steps));

    let color_activo = map(frecuencia, 0, 1000, 0, 360);

    if (i % 2 === 0) {
      if (current_step === i) {
        fill(color_activo, 75, 75);
      } else {
        fill(0);
      }
    } else {
      noFill();
    }

    // Geometría superior
    beginShape();
    vertex(p1_x, 0);
    vertex(p2_x, 0);
    vertex(p3_x, p3_y);
    vertex(p4_x, p4_y);
    endShape(CLOSE);

    // Geometría inferior
    beginShape();
    vertex(p1_x, height);
    vertex(p2_x, height);
    vertex(p3_x, p3_y);
    vertex(p4_x, p4_y);
    endShape(CLOSE);
  }

  // Controles para las barras
  stroke(0, 200, 130);
  fill(0, 100, 50, 50);
  circle(contr_A_x, contr_A_y, controller_radio);
  stroke(120, 100, 50, 100);
  fill(120, 100, 50, 50);
  circle(pA_x, pA_y, controller_radio);
  stroke(240, 100, 50, 100);
  fill(240, 100, 50, 50);
  circle(pB_x, pB_y, controller_radio);
  fill(0, 255);
  pop();

  // Sliders
  noStroke();
  fill(0);
  rect(width * 0.1, speed_control_Y - controller_radio / 2, width * 0.8, controller_radio, width * 0.01);
  fill(backgroundColor);
  stroke(backgroundColor);
  line(speed_control_X_min, speed_control_Y, speed_control_X_max, speed_control_Y);
  line(volume_control_X_min, volume_control_Y, volume_control_X_max, volume_control_Y);
  line(scale_control_X_min, scale_control_Y, scale_control_X_max, scale_control_Y);
  noStroke();

  textFont('Arial Black');
  if (play) {
    fill(0, 50, 100);
    circle(play_control_X, play_control_Y, controller_radio / 2);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(10);
    fill(0, 0, 0);
    text("stop", play_control_X, play_control_Y);
  } else {
    fill(120, 50, 100);
    circle(play_control_X, play_control_Y, controller_radio / 2);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(10);
    fill(0, 0, 0);
    text("play", play_control_X, play_control_Y);
  }

  fill(backgroundColor);
  circle(speed_control_X, speed_control_Y, controller_radio / 2);
  circle(volume_control_X, volume_control_Y, controller_radio / 2);
  circle(scale_control_X, scale_control_Y, controller_radio / 2);
  if (rotating) {
    fill(0, 50, 50);
  } else {
    fill(backgroundColor);
  }
  circle(rotate_control_X, rotate_control_Y, controller_radio / 2);

  // Título
  fill(0);
  rect(width * 0.1, height * 0.025, width * 0.8, controller_radio, width * 0.01);
  textStyle(NORMAL);
  textSize(15);
  fill(backgroundColor);
  textAlign(RIGHT, CENTER);
  text("VEL    ", speed_control_X_min, speed_control_Y);
  text("VOL    ", volume_control_X_min, volume_control_Y);
  text("ESC    ", scale_control_X_min, scale_control_Y);
  textStyle(BOLD);
  textSize(10);
  textAlign(CENTER, CENTER);
  fill(0, 0, 0);
  text("INV", rotate_control_X, rotate_control_Y);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
  fill(backgroundColor);
  textSize(15);
  text("       " + int(frecuencia) + " Hz", scale_control_X_max, scale_control_Y);
  fill(0, 100, 50);
  textAlign(RIGHT, BOTTOM);
  text("reset ", width, height);

  textAlign(CENTER, CENTER);
  fill(backgroundColor);
  textSize(25);
  text("HOMENAJE A BRIDGET RILEY", width / 2, height * 0.05);
}

function mouseDragged() {
  // Control de velocidad
  if (mouseX >= speed_control_X_min && mouseX <= speed_control_X_max &&
    mouseY >= speed_control_Y - controller_radio / 2 && mouseY <= speed_control_Y + controller_radio / 2) {
    speed_control_X = constrain(mouseX, speed_control_X_min, speed_control_X_max);
    return;
  }

  // Control de volumen
  if (mouseX >= volume_control_X_min && mouseX <= volume_control_X_max &&
    mouseY >= volume_control_Y - controller_radio / 2 && mouseY <= volume_control_Y + controller_radio / 2) {
    volume_control_X = constrain(mouseX, volume_control_X_min, volume_control_X_max);
    return;
  }

  // Control de escala
  if (mouseX >= scale_control_X_min && mouseX <= scale_control_X_max &&
    mouseY >= scale_control_Y - controller_radio / 2 && mouseY <= scale_control_Y + controller_radio / 2) {
    scale_control_X = constrain(mouseX, scale_control_X_min, scale_control_X_max);
    return;
  }

  // Traducción de las coordenadas del mouse a un sistema de coordenadas virtuales considerando la escala
  let centroX = width / 2.0;
  let centroY = height / 2.0;
  let f_escala = scale_factor;

  let mouseVirtualX = centroX + (mouseX - centroX) / f_escala;
  let mouseVirtualY = centroY + (mouseY - centroY) / f_escala;
  if (rotating) {
    mouseVirtualX = width - mouseVirtualX;
    mouseVirtualY = height - mouseVirtualY;
  }

  if (isInRadio(controller_radio, contr_A_x, contr_A_y, mouseVirtualX, mouseVirtualY)
    && !isInRadio(controller_radio, pA_x, pA_y, mouseVirtualX, mouseVirtualY)
    && !isInRadio(controller_radio, pB_x, pB_y, mouseVirtualX, mouseVirtualY)) {
    contr_A_x = mouseVirtualX;
    contr_A_y = mouseVirtualY;
    contr_B_x = contr_A_x;
    contr_B_y = contr_A_y;
  } else if (isInRadio(controller_radio, pA_x, pA_y, mouseVirtualX, mouseVirtualY)
    && !isInRadio(controller_radio, contr_A_x, contr_A_y, mouseVirtualX, mouseVirtualY)
    && !isInRadio(controller_radio, pB_x, pB_y, mouseVirtualX, mouseVirtualY)) {
    pA_x = mouseVirtualX;
    pA_y = mouseVirtualY;
  } else if (isInRadio(controller_radio, pB_x, pB_y, mouseVirtualX, mouseVirtualY)
    && !isInRadio(controller_radio, contr_A_x, contr_A_y, mouseVirtualX, mouseVirtualY)
    && !isInRadio(controller_radio, pA_x, pA_y, mouseVirtualX, mouseVirtualY)) {
    pB_x = mouseVirtualX;
    pB_y = mouseVirtualY;
  }
}

function mousePressed() {
  // Verificación de si el mouse está dentro del radio del control de rotación
  if (isInRadio(controller_radio, rotate_control_X, rotate_control_Y, mouseX, mouseY)) {
    rotating = !rotating;
  }

  // reset
  if (mouseX > width * 0.95 && mouseX < width && mouseY > height * 0.975 && mouseY < height) {
    rotating = false;

    speed_control_X = width * 0.3;
    volume_control_X = width * 0.48;
    scale_control_X = width * 0.65;

    pA_x = width * 0.3;
    pA_y = height * 0.6;
    pB_x = width * 0.7;
    pB_y = height * 0.3;

    contr_A_x = pA_x + (pB_x - pA_x) / 2;
    contr_A_y = pB_y + (pA_y - pB_y) / 2;
    contr_B_x = contr_A_x;
    contr_B_y = contr_A_y;
  }

  if (isInRadio(controller_radio, play_control_X, play_control_Y, mouseX, mouseY)) {
    play = !play;
  }
}

function isInRadio(radio, pX, pY, mX, mY) {
  return dist(pX, pY, mX, mY) < radio;
}
