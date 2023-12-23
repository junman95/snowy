import { SNOWFLAKES_BASE } from "./snowflakes.js";
const {
  Mouse,
  MouseConstraint,
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Events,
} = Matter;

const engine = Engine.create({
  gravity: {
    x: 0,
    y: 0.03,
  },
});

const { clientWidth, clientHeight } = document.getElementById("box");
const canvas = document.getElementById("canvas");

// create a renderer
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    // 화면 너비에 맞춰서 캔버스 크기 조정
    width: clientWidth,
    height: clientHeight,
    background: "transparent",
    wireframes: false,
  },
});

// 바닥 경계 설정
const ground = Bodies.rectangle(1000, clientHeight, 2000, 30, {
  name: "ground",
  isStatic: true,
});

// 바닥을 월드에 추가
World.add(engine.world, [ground]);

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

/**
 * @description 랜덤한 위치에 눈송이를 추가하는 함수
 * @param {number} i
 */
function addSnowflake(i) {
  const snowflake = SNOWFLAKES_BASE[i];
  const body = Bodies.circle(
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

// 1초마다 눈송이 추가
SNOWFLAKES_BASE.forEach((_, i) => {
  setInterval(() => {
    addSnowflake(i);
  }, 1000);
});

// 흩날리는 효과
setInterval(() => {
  render.engine.gravity.x = Math.random() * 0.1 - 0.05;
}, 5000);

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});

let sweeperMode = false;

/**
 * @description 마우스를 누를 때마다 sweeperMode를 키고, 마우스 커서를 숨기는 함수
 */
function mouseDown() {
  sweeperMode = true;
  mouse.element.style.cursor = "none";
}

/**
 * @description 마우스를 뗄 때마다 sweeperMode를 끄고, 마우스 커서를 기본값으로 설정하는 함수
 */
function mouseUp() {
  sweeperMode = false;
  mouse.element.style.cursor = "default";
}

/**
 * @description 마우스를 움직일 때마다 원을 생성하고 0.1초 뒤에 삭제하는 함수
 */
function mouseMoved() {
  if (!sweeperMode) return; // sweeperMode가 아니면 함수 종료
  let sweeper = Bodies.circle(mouse.position.x, mouse.position.y, 50, {
    name: "sweeper",
    isStatic: true,
    render: {
      fillStyle: "#868786",
    },
  });
  World.add(engine.world, sweeper);
  setTimeout(() => {
    World.remove(engine.world, sweeper);
  }, 100);
}

Events.on(mouseConstraint, "mousedown", mouseDown);
Events.on(mouseConstraint, "mouseup", mouseUp);
Events.on(mouseConstraint, "mousemove", mouseMoved);
// sweeper와 충돌 시 sweeper와 충돌한 눈송이를 월드에서 삭제(청소로 간주)
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
