
// addCarControls = () => {
//   let velocity = new Point(0, 0);
//   const MAX_VELOCITY = 100;
//   const ACCELERATION = 0.2;
//   const FRICTION = 0.05;
//   const TURN_SPEED = 0.015;
//   const SLIDE_FACTOR = 2;
//   const SLIDE_ACCELERATION = 0.3;

//   const inputs = { w: false, a: false, s: false, d: false, shift: false };

//   document.addEventListener("keydown", (event) => {
//     const keyName = event.key.toLowerCase();
//     if (keyName in inputs) {
//       // @ts-ignore
//       inputs[keyName] = true;
//     }
//   });

//   document.addEventListener("keyup", (event) => {
//     const keyName = event.key.toLowerCase();
//     if (keyName in inputs) {
//       // @ts-ignore
//       inputs[keyName] = false;
//     }
//   });

//   this.props.renderer.app.ticker.add(() => {
//     // Apply friction
//     velocity.x -= velocity.x * FRICTION;
//     velocity.y -= velocity.y * FRICTION;

//     // Handle acceleration
//     if (inputs.w && !inputs.s) {
//       const acceleration = inputs.shift ? SLIDE_ACCELERATION : ACCELERATION;
//       velocity.x += Math.sin(this.c.rotation) * acceleration;
//       velocity.y -= Math.cos(this.c.rotation) * acceleration;
//     } else if (inputs.s && !inputs.w) {
//       const acceleration = inputs.shift ? SLIDE_ACCELERATION : ACCELERATION;
//       velocity.x -= Math.sin(this.c.rotation) * acceleration;
//       velocity.y += Math.cos(this.c.rotation) * acceleration;
//     }

//     // Handle turning
//     const slide_multiplier = inputs.shift ? SLIDE_FACTOR : 1;
//     if (inputs.a && !inputs.d) {
//       this.c.rotation -= TURN_SPEED * slide_multiplier;
//     } else if (inputs.d && !inputs.a) {
//       this.c.rotation += TURN_SPEED * slide_multiplier;
//     }

//     // Handle maximum velocity
//     const currentVelocity = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
//     if (currentVelocity > MAX_VELOCITY) {
//       const maxVelocityRatio = MAX_VELOCITY / currentVelocity;
//       velocity.x *= maxVelocityRatio;
//       velocity.y *= maxVelocityRatio;
//     }

//     // Update the container position based on the velocity
//     this.c.x += velocity.x;
//     this.c.y += velocity.y;

//     // Play the correct animation
//     if (currentVelocity > 0) {
//       const animationToUse =
//         (velocity.y > 0 ? "d" : "") + (velocity.y < 0 ? "u" : "") +
//         (velocity.x > 0 ? "r" : "") + (velocity.x < 0 ? "l" : "");

//       // @ts-ignore
//       if (this.currentAnimation !== this.props.animations[animationToUse]) {
//         if (this.currentAnimation) {
//           this.c.removeChild(this.currentAnimation);
//         }
//         // @ts-ignore
//         this.currentAnimation = this.props.animations[animationToUse];
//         this.c.addChild(this.currentAnimation);
//         this.currentAnimation.play();
//       } else {
//         this.currentAnimation.play();
//       }
//     }
//   });
// }