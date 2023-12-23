import { SNOWFLAKES_BASE } from "./snowflakes.js";
const {
  Mouse,
  MouseConstraint,
  Engine,
  Render,
  Composite,
  Runner,
  World,
  Bodies,
  Events,
} = Matter;

// create an engine
var engine = Engine.create({
  gravity: {
    x: 0,
    y: 0.03,
  },
});

var { clientWidth, clientHeight } = document.getElementById("box");
let canvas = document.getElementById("canvas");

// create a renderer
var render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: clientWidth,
    height: clientHeight,
    background: "transparent",
    wireframes: false,
  },
});

var ground = Bodies.rectangle(1000, clientHeight, 2000, 30, {
  name: "ground",
  isStatic: true,
});

// add all of the bodies to the world
Composite.add(engine.world, [ground]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function addSnowflake(i) {
  const snowflake = SNOWFLAKES_BASE[i];
  let body = Bodies.circle(
    Math.random() * clientWidth,
    snowflake.radius - 300,
    snowflake.radius,
    {
      name: snowflake.name,
      density: 0.00001,
      render: {
        sprite: {
          texture: `./asset/${snowflake.name}.png`,
        },
      },
    }
  );
  World.add(engine.world, body);
}

SNOWFLAKES_BASE.forEach((_, i) => {
  setInterval(() => {
    addSnowflake(i);
  }, 1000);
});

// 흩날리는 효과
setInterval(() => {
  render.engine.gravity.x = Math.random() * 0.1 - 0.05;
}, 5000);

let mouse = Mouse.create(render.canvas);
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});

let sweeperMode = false;

function mouseDown() {
  sweeperMode = true;
  mouse.element.style.cursor = "none";
}

function mouseUp() {
  sweeperMode = false;
  mouse.element.style.cursor = "default";
}

function mouseMoved() {
  if (!sweeperMode) return;
  let sweeper = Bodies.rectangle(mouse.position.x, mouse.position.y, 50, 50, {
    name: "sweeper",
    isStatic: true,
  });
  World.add(engine.world, sweeper);
  setTimeout(() => {
    World.remove(engine.world, sweeper);
  }, 50);
}

Events.on(mouseConstraint, "mousedown", mouseDown);
Events.on(mouseConstraint, "mouseup", mouseUp);
Events.on(mouseConstraint, "mousemove", mouseMoved);
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (
      collision.bodyA.name === "sweeper" ||
      collision.bodyB.name === "sweeper"
    ) {
      World.remove(engine.world, collision.bodyA);
      World.remove(engine.world, collision.bodyB);
    }
  });
});
