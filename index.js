import { SNOWFLAKES_BASE } from "./snowflakes.js";
const { Engine, Render, Composite, Runner, World, Bodies, Body, Events } =
  Matter;

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

// create two boxes and a ground
var ground = Bodies.rectangle(1000, clientHeight, 2000, 30, { isStatic: true });

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
