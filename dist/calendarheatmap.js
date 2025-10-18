(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CalendarHeatmap"] = factory();
	else
		root["CalendarHeatmap"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@svgdotjs/svg.js/src/animation/Animator.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/animation/Animator.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _Queue_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Queue.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Queue.js");



const Animator = {
  nextDraw: null,
  frames: new _Queue_js__WEBPACK_IMPORTED_MODULE_1__["default"](),
  timeouts: new _Queue_js__WEBPACK_IMPORTED_MODULE_1__["default"](),
  immediates: new _Queue_js__WEBPACK_IMPORTED_MODULE_1__["default"](),
  timer: () => _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.window.performance || _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.window.Date,
  transforms: [],

  frame(fn) {
    // Store the node
    const node = Animator.frames.push({ run: fn })

    // Request an animation frame if we don't have one
    if (Animator.nextDraw === null) {
      Animator.nextDraw = _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.window.requestAnimationFrame(Animator._draw)
    }

    // Return the node so we can remove it easily
    return node
  },

  timeout(fn, delay) {
    delay = delay || 0

    // Work out when the event should fire
    const time = Animator.timer().now() + delay

    // Add the timeout to the end of the queue
    const node = Animator.timeouts.push({ run: fn, time: time })

    // Request another animation frame if we need one
    if (Animator.nextDraw === null) {
      Animator.nextDraw = _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.window.requestAnimationFrame(Animator._draw)
    }

    return node
  },

  immediate(fn) {
    // Add the immediate fn to the end of the queue
    const node = Animator.immediates.push(fn)
    // Request another animation frame if we need one
    if (Animator.nextDraw === null) {
      Animator.nextDraw = _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.window.requestAnimationFrame(Animator._draw)
    }

    return node
  },

  cancelFrame(node) {
    node != null && Animator.frames.remove(node)
  },

  clearTimeout(node) {
    node != null && Animator.timeouts.remove(node)
  },

  cancelImmediate(node) {
    node != null && Animator.immediates.remove(node)
  },

  _draw(now) {
    // Run all the timeouts we can run, if they are not ready yet, add them
    // to the end of the queue immediately! (bad timeouts!!! [sarcasm])
    let nextTimeout = null
    const lastTimeout = Animator.timeouts.last()
    while ((nextTimeout = Animator.timeouts.shift())) {
      // Run the timeout if its time, or push it to the end
      if (now >= nextTimeout.time) {
        nextTimeout.run()
      } else {
        Animator.timeouts.push(nextTimeout)
      }

      // If we hit the last item, we should stop shifting out more items
      if (nextTimeout === lastTimeout) break
    }

    // Run all of the animation frames
    let nextFrame = null
    const lastFrame = Animator.frames.last()
    while (nextFrame !== lastFrame && (nextFrame = Animator.frames.shift())) {
      nextFrame.run(now)
    }

    let nextImmediate = null
    while ((nextImmediate = Animator.immediates.shift())) {
      nextImmediate()
    }

    // If we have remaining timeouts or frames, draw until we don't anymore
    Animator.nextDraw =
      Animator.timeouts.first() || Animator.frames.first()
        ? _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.window.requestAnimationFrame(Animator._draw)
        : null
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Animator);


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/animation/Controller.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/animation/Controller.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Controller: () => (/* binding */ Controller),
/* harmony export */   Ease: () => (/* binding */ Ease),
/* harmony export */   PID: () => (/* binding */ PID),
/* harmony export */   Spring: () => (/* binding */ Spring),
/* harmony export */   Stepper: () => (/* binding */ Stepper),
/* harmony export */   easing: () => (/* binding */ easing)
/* harmony export */ });
/* harmony import */ var _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/defaults.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/defaults.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");



/***
Base Class
==========
The base stepper class that will be
***/

function makeSetterGetter(k, f) {
  return function (v) {
    if (v == null) return this[k]
    this[k] = v
    if (f) f.call(this)
    return this
  }
}

const easing = {
  '-': function (pos) {
    return pos
  },
  '<>': function (pos) {
    return -Math.cos(pos * Math.PI) / 2 + 0.5
  },
  '>': function (pos) {
    return Math.sin((pos * Math.PI) / 2)
  },
  '<': function (pos) {
    return -Math.cos((pos * Math.PI) / 2) + 1
  },
  bezier: function (x1, y1, x2, y2) {
    // see https://www.w3.org/TR/css-easing-1/#cubic-bezier-algo
    return function (t) {
      if (t < 0) {
        if (x1 > 0) {
          return (y1 / x1) * t
        } else if (x2 > 0) {
          return (y2 / x2) * t
        } else {
          return 0
        }
      } else if (t > 1) {
        if (x2 < 1) {
          return ((1 - y2) / (1 - x2)) * t + (y2 - x2) / (1 - x2)
        } else if (x1 < 1) {
          return ((1 - y1) / (1 - x1)) * t + (y1 - x1) / (1 - x1)
        } else {
          return 1
        }
      } else {
        return 3 * t * (1 - t) ** 2 * y1 + 3 * t ** 2 * (1 - t) * y2 + t ** 3
      }
    }
  },
  // see https://www.w3.org/TR/css-easing-1/#step-timing-function-algo
  steps: function (steps, stepPosition = 'end') {
    // deal with "jump-" prefix
    stepPosition = stepPosition.split('-').reverse()[0]

    let jumps = steps
    if (stepPosition === 'none') {
      --jumps
    } else if (stepPosition === 'both') {
      ++jumps
    }

    // The beforeFlag is essentially useless
    return (t, beforeFlag = false) => {
      // Step is called currentStep in referenced url
      let step = Math.floor(t * steps)
      const jumping = (t * step) % 1 === 0

      if (stepPosition === 'start' || stepPosition === 'both') {
        ++step
      }

      if (beforeFlag && jumping) {
        --step
      }

      if (t >= 0 && step < 0) {
        step = 0
      }

      if (t <= 1 && step > jumps) {
        step = jumps
      }

      return step / jumps
    }
  }
}

class Stepper {
  done() {
    return false
  }
}

/***
Easing Functions
================
***/

class Ease extends Stepper {
  constructor(fn = _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_0__.timeline.ease) {
    super()
    this.ease = easing[fn] || fn
  }

  step(from, to, pos) {
    if (typeof from !== 'number') {
      return pos < 1 ? from : to
    }
    return from + (to - from) * this.ease(pos)
  }
}

/***
Controller Types
================
***/

class Controller extends Stepper {
  constructor(fn) {
    super()
    this.stepper = fn
  }

  done(c) {
    return c.done
  }

  step(current, target, dt, c) {
    return this.stepper(current, target, dt, c)
  }
}

function recalculate() {
  // Apply the default parameters
  const duration = (this._duration || 500) / 1000
  const overshoot = this._overshoot || 0

  // Calculate the PID natural response
  const eps = 1e-10
  const pi = Math.PI
  const os = Math.log(overshoot / 100 + eps)
  const zeta = -os / Math.sqrt(pi * pi + os * os)
  const wn = 3.9 / (zeta * duration)

  // Calculate the Spring values
  this.d = 2 * zeta * wn
  this.k = wn * wn
}

class Spring extends Controller {
  constructor(duration = 500, overshoot = 0) {
    super()
    this.duration(duration).overshoot(overshoot)
  }

  step(current, target, dt, c) {
    if (typeof current === 'string') return current
    c.done = dt === Infinity
    if (dt === Infinity) return target
    if (dt === 0) return current

    if (dt > 100) dt = 16

    dt /= 1000

    // Get the previous velocity
    const velocity = c.velocity || 0

    // Apply the control to get the new position and store it
    const acceleration = -this.d * velocity - this.k * (current - target)
    const newPosition = current + velocity * dt + (acceleration * dt * dt) / 2

    // Store the velocity
    c.velocity = velocity + acceleration * dt

    // Figure out if we have converged, and if so, pass the value
    c.done = Math.abs(target - newPosition) + Math.abs(velocity) < 0.002
    return c.done ? target : newPosition
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.extend)(Spring, {
  duration: makeSetterGetter('_duration', recalculate),
  overshoot: makeSetterGetter('_overshoot', recalculate)
})

class PID extends Controller {
  constructor(p = 0.1, i = 0.01, d = 0, windup = 1000) {
    super()
    this.p(p).i(i).d(d).windup(windup)
  }

  step(current, target, dt, c) {
    if (typeof current === 'string') return current
    c.done = dt === Infinity

    if (dt === Infinity) return target
    if (dt === 0) return current

    const p = target - current
    let i = (c.integral || 0) + p * dt
    const d = (p - (c.error || 0)) / dt
    const windup = this._windup

    // antiwindup
    if (windup !== false) {
      i = Math.max(-windup, Math.min(i, windup))
    }

    c.error = p
    c.integral = i

    c.done = Math.abs(p) < 0.001

    return c.done ? target : current + (this.P * p + this.I * i + this.D * d)
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.extend)(PID, {
  windup: makeSetterGetter('_windup'),
  p: makeSetterGetter('P'),
  i: makeSetterGetter('I'),
  d: makeSetterGetter('D')
})


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/animation/Morphable.js":
/*!******************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/animation/Morphable.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NonMorphable: () => (/* binding */ NonMorphable),
/* harmony export */   ObjectBag: () => (/* binding */ ObjectBag),
/* harmony export */   TransformBag: () => (/* binding */ TransformBag),
/* harmony export */   "default": () => (/* binding */ Morphable),
/* harmony export */   makeMorphable: () => (/* binding */ makeMorphable),
/* harmony export */   registerMorphableType: () => (/* binding */ registerMorphableType)
/* harmony export */ });
/* harmony import */ var _Controller_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Controller.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Controller.js");
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _types_Color_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/Color.js */ "./node_modules/@svgdotjs/svg.js/src/types/Color.js");
/* harmony import */ var _types_PathArray_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../types/PathArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PathArray.js");
/* harmony import */ var _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../types/SVGArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGArray.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");








const getClassForType = (value) => {
  const type = typeof value

  if (type === 'number') {
    return _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_6__["default"]
  } else if (type === 'string') {
    if (_types_Color_js__WEBPACK_IMPORTED_MODULE_3__["default"].isColor(value)) {
      return _types_Color_js__WEBPACK_IMPORTED_MODULE_3__["default"]
    } else if (_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_1__.delimiter.test(value)) {
      return _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_1__.isPathLetter.test(value) ? _types_PathArray_js__WEBPACK_IMPORTED_MODULE_4__["default"] : _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_5__["default"]
    } else if (_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_1__.numberAndUnit.test(value)) {
      return _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_6__["default"]
    } else {
      return NonMorphable
    }
  } else if (morphableTypes.indexOf(value.constructor) > -1) {
    return value.constructor
  } else if (Array.isArray(value)) {
    return _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_5__["default"]
  } else if (type === 'object') {
    return ObjectBag
  } else {
    return NonMorphable
  }
}

class Morphable {
  constructor(stepper) {
    this._stepper = stepper || new _Controller_js__WEBPACK_IMPORTED_MODULE_0__.Ease('-')

    this._from = null
    this._to = null
    this._type = null
    this._context = null
    this._morphObj = null
  }

  at(pos) {
    return this._morphObj.morph(
      this._from,
      this._to,
      pos,
      this._stepper,
      this._context
    )
  }

  done() {
    const complete = this._context.map(this._stepper.done).reduce(function (
      last,
      curr
    ) {
      return last && curr
    }, true)
    return complete
  }

  from(val) {
    if (val == null) {
      return this._from
    }

    this._from = this._set(val)
    return this
  }

  stepper(stepper) {
    if (stepper == null) return this._stepper
    this._stepper = stepper
    return this
  }

  to(val) {
    if (val == null) {
      return this._to
    }

    this._to = this._set(val)
    return this
  }

  type(type) {
    // getter
    if (type == null) {
      return this._type
    }

    // setter
    this._type = type
    return this
  }

  _set(value) {
    if (!this._type) {
      this.type(getClassForType(value))
    }

    let result = new this._type(value)
    if (this._type === _types_Color_js__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      result = this._to
        ? result[this._to[4]]()
        : this._from
          ? result[this._from[4]]()
          : result
    }

    if (this._type === ObjectBag) {
      result = this._to
        ? result.align(this._to)
        : this._from
          ? result.align(this._from)
          : result
    }

    result = result.toConsumable()

    this._morphObj = this._morphObj || new this._type()
    this._context =
      this._context ||
      Array.apply(null, Array(result.length))
        .map(Object)
        .map(function (o) {
          o.done = true
          return o
        })
    return result
  }
}

class NonMorphable {
  constructor(...args) {
    this.init(...args)
  }

  init(val) {
    val = Array.isArray(val) ? val[0] : val
    this.value = val
    return this
  }

  toArray() {
    return [this.value]
  }

  valueOf() {
    return this.value
  }
}

class TransformBag {
  constructor(...args) {
    this.init(...args)
  }

  init(obj) {
    if (Array.isArray(obj)) {
      obj = {
        scaleX: obj[0],
        scaleY: obj[1],
        shear: obj[2],
        rotate: obj[3],
        translateX: obj[4],
        translateY: obj[5],
        originX: obj[6],
        originY: obj[7]
      }
    }

    Object.assign(this, TransformBag.defaults, obj)
    return this
  }

  toArray() {
    const v = this

    return [
      v.scaleX,
      v.scaleY,
      v.shear,
      v.rotate,
      v.translateX,
      v.translateY,
      v.originX,
      v.originY
    ]
  }
}

TransformBag.defaults = {
  scaleX: 1,
  scaleY: 1,
  shear: 0,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  originX: 0,
  originY: 0
}

const sortByKey = (a, b) => {
  return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
}

class ObjectBag {
  constructor(...args) {
    this.init(...args)
  }

  align(other) {
    const values = this.values
    for (let i = 0, il = values.length; i < il; ++i) {
      // If the type is the same we only need to check if the color is in the correct format
      if (values[i + 1] === other[i + 1]) {
        if (values[i + 1] === _types_Color_js__WEBPACK_IMPORTED_MODULE_3__["default"] && other[i + 7] !== values[i + 7]) {
          const space = other[i + 7]
          const color = new _types_Color_js__WEBPACK_IMPORTED_MODULE_3__["default"](this.values.splice(i + 3, 5))
            [space]()
            .toArray()
          this.values.splice(i + 3, 0, ...color)
        }

        i += values[i + 2] + 2
        continue
      }

      if (!other[i + 1]) {
        return this
      }

      // The types differ, so we overwrite the new type with the old one
      // And initialize it with the types default (e.g. black for color or 0 for number)
      const defaultObject = new other[i + 1]().toArray()

      // Than we fix the values array
      const toDelete = values[i + 2] + 3

      values.splice(
        i,
        toDelete,
        other[i],
        other[i + 1],
        other[i + 2],
        ...defaultObject
      )

      i += values[i + 2] + 2
    }
    return this
  }

  init(objOrArr) {
    this.values = []

    if (Array.isArray(objOrArr)) {
      this.values = objOrArr.slice()
      return
    }

    objOrArr = objOrArr || {}
    const entries = []

    for (const i in objOrArr) {
      const Type = getClassForType(objOrArr[i])
      const val = new Type(objOrArr[i]).toArray()
      entries.push([i, Type, val.length, ...val])
    }

    entries.sort(sortByKey)

    this.values = entries.reduce((last, curr) => last.concat(curr), [])
    return this
  }

  toArray() {
    return this.values
  }

  valueOf() {
    const obj = {}
    const arr = this.values

    // for (var i = 0, len = arr.length; i < len; i += 2) {
    while (arr.length) {
      const key = arr.shift()
      const Type = arr.shift()
      const num = arr.shift()
      const values = arr.splice(0, num)
      obj[key] = new Type(values) // .valueOf()
    }

    return obj
  }
}

const morphableTypes = [NonMorphable, TransformBag, ObjectBag]

function registerMorphableType(type = []) {
  morphableTypes.push(...[].concat(type))
}

function makeMorphable() {
  (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.extend)(morphableTypes, {
    to(val) {
      return new Morphable()
        .type(this.constructor)
        .from(this.toArray()) // this.valueOf())
        .to(val)
    },
    fromArray(arr) {
      this.init(arr)
      return this
    },
    toConsumable() {
      return this.toArray()
    },
    morph(from, to, pos, stepper, context) {
      const mapper = function (i, index) {
        return stepper.step(i, to[index], pos, context[index], context)
      }

      return this.fromArray(from.map(mapper))
    }
  })
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/animation/Queue.js":
/*!**************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/animation/Queue.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Queue)
/* harmony export */ });
class Queue {
  constructor() {
    this._first = null
    this._last = null
  }

  // Shows us the first item in the list
  first() {
    return this._first && this._first.value
  }

  // Shows us the last item in the list
  last() {
    return this._last && this._last.value
  }

  push(value) {
    // An item stores an id and the provided value
    const item =
      typeof value.next !== 'undefined'
        ? value
        : { value: value, next: null, prev: null }

    // Deal with the queue being empty or populated
    if (this._last) {
      item.prev = this._last
      this._last.next = item
      this._last = item
    } else {
      this._last = item
      this._first = item
    }

    // Return the current item
    return item
  }

  // Removes the item that was returned from the push
  remove(item) {
    // Relink the previous item
    if (item.prev) item.prev.next = item.next
    if (item.next) item.next.prev = item.prev
    if (item === this._last) this._last = item.prev
    if (item === this._first) this._first = item.next

    // Invalidate item
    item.prev = null
    item.next = null
  }

  shift() {
    // Check if we have a value
    const remove = this._first
    if (!remove) return null

    // If we do, remove it and relink things
    this._first = remove.next
    if (this._first) this._first.prev = null
    this._last = this._first ? this._last : null
    return remove.value
  }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/animation/Runner.js":
/*!***************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/animation/Runner.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FakeRunner: () => (/* binding */ FakeRunner),
/* harmony export */   RunnerArray: () => (/* binding */ RunnerArray),
/* harmony export */   "default": () => (/* binding */ Runner)
/* harmony export */ });
/* harmony import */ var _Controller_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Controller.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Controller.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _modules_core_gradiented_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/core/gradiented.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/gradiented.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/core/defaults.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/defaults.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../modules/core/circled.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/circled.js");
/* harmony import */ var _Animator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Animator.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Animator.js");
/* harmony import */ var _types_Box_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../types/Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../types/EventTarget.js */ "./node_modules/@svgdotjs/svg.js/src/types/EventTarget.js");
/* harmony import */ var _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../types/Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");
/* harmony import */ var _Morphable_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Morphable.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Morphable.js");
/* harmony import */ var _types_Point_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../types/Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");
/* harmony import */ var _Timeline_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Timeline.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Timeline.js");
















class Runner extends _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_9__["default"] {
  constructor(options) {
    super()

    // Store a unique id on the runner, so that we can identify it later
    this.id = Runner.id++

    // Ensure a default value
    options = options == null ? _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_4__.timeline.duration : options

    // Ensure that we get a controller
    options = typeof options === 'function' ? new _Controller_js__WEBPACK_IMPORTED_MODULE_0__.Controller(options) : options

    // Declare all of the variables
    this._element = null
    this._timeline = null
    this.done = false
    this._queue = []

    // Work out the stepper and the duration
    this._duration = typeof options === 'number' && options
    this._isDeclarative = options instanceof _Controller_js__WEBPACK_IMPORTED_MODULE_0__.Controller
    this._stepper = this._isDeclarative ? options : new _Controller_js__WEBPACK_IMPORTED_MODULE_0__.Ease()

    // We copy the current values from the timeline because they can change
    this._history = {}

    // Store the state of the runner
    this.enabled = true
    this._time = 0
    this._lastTime = 0

    // At creation, the runner is in reset state
    this._reseted = true

    // Save transforms applied to this runner
    this.transforms = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"]()
    this.transformId = 1

    // Looping variables
    this._haveReversed = false
    this._reverse = false
    this._loopsDone = 0
    this._swing = false
    this._wait = 0
    this._times = 1

    this._frameId = null

    // Stores how long a runner is stored after being done
    this._persist = this._isDeclarative ? true : null
  }

  static sanitise(duration, delay, when) {
    // Initialise the default parameters
    let times = 1
    let swing = false
    let wait = 0
    duration = duration ?? _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_4__.timeline.duration
    delay = delay ?? _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_4__.timeline.delay
    when = when || 'last'

    // If we have an object, unpack the values
    if (typeof duration === 'object' && !(duration instanceof _Controller_js__WEBPACK_IMPORTED_MODULE_0__.Stepper)) {
      delay = duration.delay ?? delay
      when = duration.when ?? when
      swing = duration.swing || swing
      times = duration.times ?? times
      wait = duration.wait ?? wait
      duration = duration.duration ?? _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_4__.timeline.duration
    }

    return {
      duration: duration,
      delay: delay,
      swing: swing,
      times: times,
      wait: wait,
      when: when
    }
  }

  active(enabled) {
    if (enabled == null) return this.enabled
    this.enabled = enabled
    return this
  }

  /*
  Private Methods
  ===============
  Methods that shouldn't be used externally
  */
  addTransform(transform) {
    this.transforms.lmultiplyO(transform)
    return this
  }

  after(fn) {
    return this.on('finished', fn)
  }

  animate(duration, delay, when) {
    const o = Runner.sanitise(duration, delay, when)
    const runner = new Runner(o.duration)
    if (this._timeline) runner.timeline(this._timeline)
    if (this._element) runner.element(this._element)
    return runner.loop(o).schedule(o.delay, o.when)
  }

  clearTransform() {
    this.transforms = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"]()
    return this
  }

  // TODO: Keep track of all transformations so that deletion is faster
  clearTransformsFromQueue() {
    if (
      !this.done ||
      !this._timeline ||
      !this._timeline._runnerIds.includes(this.id)
    ) {
      this._queue = this._queue.filter((item) => {
        return !item.isTransform
      })
    }
  }

  delay(delay) {
    return this.animate(0, delay)
  }

  duration() {
    return this._times * (this._wait + this._duration) - this._wait
  }

  during(fn) {
    return this.queue(null, fn)
  }

  ease(fn) {
    this._stepper = new _Controller_js__WEBPACK_IMPORTED_MODULE_0__.Ease(fn)
    return this
  }
  /*
  Runner Definitions
  ==================
  These methods help us define the runtime behaviour of the Runner or they
  help us make new runners from the current runner
  */

  element(element) {
    if (element == null) return this._element
    this._element = element
    element._prepareRunner()
    return this
  }

  finish() {
    return this.step(Infinity)
  }

  loop(times, swing, wait) {
    // Deal with the user passing in an object
    if (typeof times === 'object') {
      swing = times.swing
      wait = times.wait
      times = times.times
    }

    // Sanitise the values and store them
    this._times = times || Infinity
    this._swing = swing || false
    this._wait = wait || 0

    // Allow true to be passed
    if (this._times === true) {
      this._times = Infinity
    }

    return this
  }

  loops(p) {
    const loopDuration = this._duration + this._wait
    if (p == null) {
      const loopsDone = Math.floor(this._time / loopDuration)
      const relativeTime = this._time - loopsDone * loopDuration
      const position = relativeTime / this._duration
      return Math.min(loopsDone + position, this._times)
    }
    const whole = Math.floor(p)
    const partial = p % 1
    const time = loopDuration * whole + this._duration * partial
    return this.time(time)
  }

  persist(dtOrForever) {
    if (dtOrForever == null) return this._persist
    this._persist = dtOrForever
    return this
  }

  position(p) {
    // Get all of the variables we need
    const x = this._time
    const d = this._duration
    const w = this._wait
    const t = this._times
    const s = this._swing
    const r = this._reverse
    let position

    if (p == null) {
      /*
      This function converts a time to a position in the range [0, 1]
      The full explanation can be found in this desmos demonstration
        https://www.desmos.com/calculator/u4fbavgche
      The logic is slightly simplified here because we can use booleans
      */

      // Figure out the value without thinking about the start or end time
      const f = function (x) {
        const swinging = s * Math.floor((x % (2 * (w + d))) / (w + d))
        const backwards = (swinging && !r) || (!swinging && r)
        const uncliped =
          (Math.pow(-1, backwards) * (x % (w + d))) / d + backwards
        const clipped = Math.max(Math.min(uncliped, 1), 0)
        return clipped
      }

      // Figure out the value by incorporating the start time
      const endTime = t * (w + d) - w
      position =
        x <= 0
          ? Math.round(f(1e-5))
          : x < endTime
            ? f(x)
            : Math.round(f(endTime - 1e-5))
      return position
    }

    // Work out the loops done and add the position to the loops done
    const loopsDone = Math.floor(this.loops())
    const swingForward = s && loopsDone % 2 === 0
    const forwards = (swingForward && !r) || (r && swingForward)
    position = loopsDone + (forwards ? p : 1 - p)
    return this.loops(position)
  }

  progress(p) {
    if (p == null) {
      return Math.min(1, this._time / this.duration())
    }
    return this.time(p * this.duration())
  }

  /*
  Basic Functionality
  ===================
  These methods allow us to attach basic functions to the runner directly
  */
  queue(initFn, runFn, retargetFn, isTransform) {
    this._queue.push({
      initialiser: initFn || _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_4__.noop,
      runner: runFn || _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_4__.noop,
      retarget: retargetFn,
      isTransform: isTransform,
      initialised: false,
      finished: false
    })
    const timeline = this.timeline()
    timeline && this.timeline()._continue()
    return this
  }

  reset() {
    if (this._reseted) return this
    this.time(0)
    this._reseted = true
    return this
  }

  reverse(reverse) {
    this._reverse = reverse == null ? !this._reverse : reverse
    return this
  }

  schedule(timeline, delay, when) {
    // The user doesn't need to pass a timeline if we already have one
    if (!(timeline instanceof _Timeline_js__WEBPACK_IMPORTED_MODULE_14__["default"])) {
      when = delay
      delay = timeline
      timeline = this.timeline()
    }

    // If there is no timeline, yell at the user...
    if (!timeline) {
      throw Error('Runner cannot be scheduled without timeline')
    }

    // Schedule the runner on the timeline provided
    timeline.schedule(this, delay, when)
    return this
  }

  step(dt) {
    // If we are inactive, this stepper just gets skipped
    if (!this.enabled) return this

    // Update the time and get the new position
    dt = dt == null ? 16 : dt
    this._time += dt
    const position = this.position()

    // Figure out if we need to run the stepper in this frame
    const running = this._lastPosition !== position && this._time >= 0
    this._lastPosition = position

    // Figure out if we just started
    const duration = this.duration()
    const justStarted = this._lastTime <= 0 && this._time > 0
    const justFinished = this._lastTime < duration && this._time >= duration

    this._lastTime = this._time
    if (justStarted) {
      this.fire('start', this)
    }

    // Work out if the runner is finished set the done flag here so animations
    // know, that they are running in the last step (this is good for
    // transformations which can be merged)
    const declarative = this._isDeclarative
    this.done = !declarative && !justFinished && this._time >= duration

    // Runner is running. So its not in reset state anymore
    this._reseted = false

    let converged = false
    // Call initialise and the run function
    if (running || declarative) {
      this._initialise(running)

      // clear the transforms on this runner so they dont get added again and again
      this.transforms = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"]()
      converged = this._run(declarative ? dt : position)

      this.fire('step', this)
    }
    // correct the done flag here
    // declarative animations itself know when they converged
    this.done = this.done || (converged && declarative)
    if (justFinished) {
      this.fire('finished', this)
    }
    return this
  }

  /*
  Runner animation methods
  ========================
  Control how the animation plays
  */
  time(time) {
    if (time == null) {
      return this._time
    }
    const dt = time - this._time
    this.step(dt)
    return this
  }

  timeline(timeline) {
    // check explicitly for undefined so we can set the timeline to null
    if (typeof timeline === 'undefined') return this._timeline
    this._timeline = timeline
    return this
  }

  unschedule() {
    const timeline = this.timeline()
    timeline && timeline.unschedule(this)
    return this
  }

  // Run each initialise function in the runner if required
  _initialise(running) {
    // If we aren't running, we shouldn't initialise when not declarative
    if (!running && !this._isDeclarative) return

    // Loop through all of the initialisers
    for (let i = 0, len = this._queue.length; i < len; ++i) {
      // Get the current initialiser
      const current = this._queue[i]

      // Determine whether we need to initialise
      const needsIt = this._isDeclarative || (!current.initialised && running)
      running = !current.finished

      // Call the initialiser if we need to
      if (needsIt && running) {
        current.initialiser.call(this)
        current.initialised = true
      }
    }
  }

  // Save a morpher to the morpher list so that we can retarget it later
  _rememberMorpher(method, morpher) {
    this._history[method] = {
      morpher: morpher,
      caller: this._queue[this._queue.length - 1]
    }

    // We have to resume the timeline in case a controller
    // is already done without being ever run
    // This can happen when e.g. this is done:
    //    anim = el.animate(new SVG.Spring)
    // and later
    //    anim.move(...)
    if (this._isDeclarative) {
      const timeline = this.timeline()
      timeline && timeline.play()
    }
  }

  // Try to set the target for a morpher if the morpher exists, otherwise
  // Run each run function for the position or dt given
  _run(positionOrDt) {
    // Run all of the _queue directly
    let allfinished = true
    for (let i = 0, len = this._queue.length; i < len; ++i) {
      // Get the current function to run
      const current = this._queue[i]

      // Run the function if its not finished, we keep track of the finished
      // flag for the sake of declarative _queue
      const converged = current.runner.call(this, positionOrDt)
      current.finished = current.finished || converged === true
      allfinished = allfinished && current.finished
    }

    // We report when all of the constructors are finished
    return allfinished
  }

  // do nothing and return false
  _tryRetarget(method, target, extra) {
    if (this._history[method]) {
      // if the last method wasn't even initialised, throw it away
      if (!this._history[method].caller.initialised) {
        const index = this._queue.indexOf(this._history[method].caller)
        this._queue.splice(index, 1)
        return false
      }

      // for the case of transformations, we use the special retarget function
      // which has access to the outer scope
      if (this._history[method].caller.retarget) {
        this._history[method].caller.retarget.call(this, target, extra)
        // for everything else a simple morpher change is sufficient
      } else {
        this._history[method].morpher.to(target)
      }

      this._history[method].caller.finished = false
      const timeline = this.timeline()
      timeline && timeline.play()
      return true
    }
    return false
  }
}

Runner.id = 0

class FakeRunner {
  constructor(transforms = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"](), id = -1, done = true) {
    this.transforms = transforms
    this.id = id
    this.done = done
  }

  clearTransformsFromQueue() {}
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.extend)([Runner, FakeRunner], {
  mergeWith(runner) {
    return new FakeRunner(
      runner.transforms.lmultiply(this.transforms),
      runner.id
    )
  }
})

// FakeRunner.emptyRunner = new FakeRunner()

const lmultiply = (last, curr) => last.lmultiplyO(curr)
const getRunnerTransform = (runner) => runner.transforms

function mergeTransforms() {
  // Find the matrix to apply to the element and apply it
  const runners = this._transformationRunners.runners
  const netTransform = runners
    .map(getRunnerTransform)
    .reduce(lmultiply, new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"]())

  this.transform(netTransform)

  this._transformationRunners.merge()

  if (this._transformationRunners.length() === 1) {
    this._frameId = null
  }
}

class RunnerArray {
  constructor() {
    this.runners = []
    this.ids = []
  }

  add(runner) {
    if (this.runners.includes(runner)) return
    const id = runner.id + 1

    this.runners.push(runner)
    this.ids.push(id)

    return this
  }

  clearBefore(id) {
    const deleteCnt = this.ids.indexOf(id + 1) || 1
    this.ids.splice(0, deleteCnt, 0)
    this.runners
      .splice(0, deleteCnt, new FakeRunner())
      .forEach((r) => r.clearTransformsFromQueue())
    return this
  }

  edit(id, newRunner) {
    const index = this.ids.indexOf(id + 1)
    this.ids.splice(index, 1, id + 1)
    this.runners.splice(index, 1, newRunner)
    return this
  }

  getByID(id) {
    return this.runners[this.ids.indexOf(id + 1)]
  }

  length() {
    return this.ids.length
  }

  merge() {
    let lastRunner = null
    for (let i = 0; i < this.runners.length; ++i) {
      const runner = this.runners[i]

      const condition =
        lastRunner &&
        runner.done &&
        lastRunner.done &&
        // don't merge runner when persisted on timeline
        (!runner._timeline ||
          !runner._timeline._runnerIds.includes(runner.id)) &&
        (!lastRunner._timeline ||
          !lastRunner._timeline._runnerIds.includes(lastRunner.id))

      if (condition) {
        // the +1 happens in the function
        this.remove(runner.id)
        const newRunner = runner.mergeWith(lastRunner)
        this.edit(lastRunner.id, newRunner)
        lastRunner = newRunner
        --i
      } else {
        lastRunner = runner
      }
    }

    return this
  }

  remove(id) {
    const index = this.ids.indexOf(id + 1)
    this.ids.splice(index, 1)
    this.runners.splice(index, 1)
    return this
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_5__.registerMethods)({
  Element: {
    animate(duration, delay, when) {
      const o = Runner.sanitise(duration, delay, when)
      const timeline = this.timeline()
      return new Runner(o.duration)
        .loop(o)
        .element(this)
        .timeline(timeline.play())
        .schedule(o.delay, o.when)
    },

    delay(by, when) {
      return this.animate(0, by, when)
    },

    // this function searches for all runners on the element and deletes the ones
    // which run before the current one. This is because absolute transformations
    // overwrite anything anyway so there is no need to waste time computing
    // other runners
    _clearTransformRunnersBefore(currentRunner) {
      this._transformationRunners.clearBefore(currentRunner.id)
    },

    _currentTransform(current) {
      return (
        this._transformationRunners.runners
          // we need the equal sign here to make sure, that also transformations
          // on the same runner which execute before the current transformation are
          // taken into account
          .filter((runner) => runner.id <= current.id)
          .map(getRunnerTransform)
          .reduce(lmultiply, new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
      )
    },

    _addRunner(runner) {
      this._transformationRunners.add(runner)

      // Make sure that the runner merge is executed at the very end of
      // all Animator functions. That is why we use immediate here to execute
      // the merge right after all frames are run
      _Animator_js__WEBPACK_IMPORTED_MODULE_7__["default"].cancelImmediate(this._frameId)
      this._frameId = _Animator_js__WEBPACK_IMPORTED_MODULE_7__["default"].immediate(mergeTransforms.bind(this))
    },

    _prepareRunner() {
      if (this._frameId == null) {
        this._transformationRunners = new RunnerArray().add(
          new FakeRunner(new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"](this))
        )
      }
    }
  }
})

// Will output the elements from array A that are not in the array B
const difference = (a, b) => a.filter((x) => !b.includes(x))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.extend)(Runner, {
  attr(a, v) {
    return this.styleAttr('attr', a, v)
  },

  // Add animatable styles
  css(s, v) {
    return this.styleAttr('css', s, v)
  },

  styleAttr(type, nameOrAttrs, val) {
    if (typeof nameOrAttrs === 'string') {
      return this.styleAttr(type, { [nameOrAttrs]: val })
    }

    let attrs = nameOrAttrs
    if (this._tryRetarget(type, attrs)) return this

    let morpher = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__["default"](this._stepper).to(attrs)
    let keys = Object.keys(attrs)

    this.queue(
      function () {
        morpher = morpher.from(this.element()[type](keys))
      },
      function (pos) {
        this.element()[type](morpher.at(pos).valueOf())
        return morpher.done()
      },
      function (newToAttrs) {
        // Check if any new keys were added
        const newKeys = Object.keys(newToAttrs)
        const differences = difference(newKeys, keys)

        // If their are new keys, initialize them and add them to morpher
        if (differences.length) {
          // Get the values
          const addedFromAttrs = this.element()[type](differences)

          // Get the already initialized values
          const oldFromAttrs = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__.ObjectBag(morpher.from()).valueOf()

          // Merge old and new
          Object.assign(oldFromAttrs, addedFromAttrs)
          morpher.from(oldFromAttrs)
        }

        // Get the object from the morpher
        const oldToAttrs = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__.ObjectBag(morpher.to()).valueOf()

        // Merge in new attributes
        Object.assign(oldToAttrs, newToAttrs)

        // Change morpher target
        morpher.to(oldToAttrs)

        // Make sure that we save the work we did so we don't need it to do again
        keys = newKeys
        attrs = newToAttrs
      }
    )

    this._rememberMorpher(type, morpher)
    return this
  },

  zoom(level, point) {
    if (this._tryRetarget('zoom', level, point)) return this

    let morpher = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__["default"](this._stepper).to(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_13__["default"](level))

    this.queue(
      function () {
        morpher = morpher.from(this.element().zoom())
      },
      function (pos) {
        this.element().zoom(morpher.at(pos), point)
        return morpher.done()
      },
      function (newLevel, newPoint) {
        point = newPoint
        morpher.to(newLevel)
      }
    )

    this._rememberMorpher('zoom', morpher)
    return this
  },

  /**
   ** absolute transformations
   **/

  //
  // M v -----|-----(D M v = F v)------|----->  T v
  //
  // 1. define the final state (T) and decompose it (once)
  //    t = [tx, ty, the, lam, sy, sx]
  // 2. on every frame: pull the current state of all previous transforms
  //    (M - m can change)
  //   and then write this as m = [tx0, ty0, the0, lam0, sy0, sx0]
  // 3. Find the interpolated matrix F(pos) = m + pos * (t - m)
  //   - Note F(0) = M
  //   - Note F(1) = T
  // 4. Now you get the delta matrix as a result: D = F * inv(M)

  transform(transforms, relative, affine) {
    // If we have a declarative function, we should retarget it if possible
    relative = transforms.relative || relative
    if (
      this._isDeclarative &&
      !relative &&
      this._tryRetarget('transform', transforms)
    ) {
      return this
    }

    // Parse the parameters
    const isMatrix = _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"].isMatrixLike(transforms)
    affine =
      transforms.affine != null
        ? transforms.affine
        : affine != null
          ? affine
          : !isMatrix

    // Create a morpher and set its type
    const morpher = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__["default"](this._stepper).type(
      affine ? _Morphable_js__WEBPACK_IMPORTED_MODULE_11__.TransformBag : _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"]
    )

    let origin
    let element
    let current
    let currentAngle
    let startTransform

    function setup() {
      // make sure element and origin is defined
      element = element || this.element()
      origin = origin || (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.getOrigin)(transforms, element)

      startTransform = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"](relative ? undefined : element)

      // add the runner to the element so it can merge transformations
      element._addRunner(this)

      // Deactivate all transforms that have run so far if we are absolute
      if (!relative) {
        element._clearTransformRunnersBefore(this)
      }
    }

    function run(pos) {
      // clear all other transforms before this in case something is saved
      // on this runner. We are absolute. We dont need these!
      if (!relative) this.clearTransform()

      const { x, y } = new _types_Point_js__WEBPACK_IMPORTED_MODULE_12__["default"](origin).transform(
        element._currentTransform(this)
      )

      let target = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"]({ ...transforms, origin: [x, y] })
      let start = this._isDeclarative && current ? current : startTransform

      if (affine) {
        target = target.decompose(x, y)
        start = start.decompose(x, y)

        // Get the current and target angle as it was set
        const rTarget = target.rotate
        const rCurrent = start.rotate

        // Figure out the shortest path to rotate directly
        const possibilities = [rTarget - 360, rTarget, rTarget + 360]
        const distances = possibilities.map((a) => Math.abs(a - rCurrent))
        const shortest = Math.min(...distances)
        const index = distances.indexOf(shortest)
        target.rotate = possibilities[index]
      }

      if (relative) {
        // we have to be careful here not to overwrite the rotation
        // with the rotate method of Matrix
        if (!isMatrix) {
          target.rotate = transforms.rotate || 0
        }
        if (this._isDeclarative && currentAngle) {
          start.rotate = currentAngle
        }
      }

      morpher.from(start)
      morpher.to(target)

      const affineParameters = morpher.at(pos)
      currentAngle = affineParameters.rotate
      current = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_10__["default"](affineParameters)

      this.addTransform(current)
      element._addRunner(this)
      return morpher.done()
    }

    function retarget(newTransforms) {
      // only get a new origin if it changed since the last call
      if (
        (newTransforms.origin || 'center').toString() !==
        (transforms.origin || 'center').toString()
      ) {
        origin = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.getOrigin)(newTransforms, element)
      }

      // overwrite the old transformations with the new ones
      transforms = { ...newTransforms, origin }
    }

    this.queue(setup, run, retarget, true)
    this._isDeclarative && this._rememberMorpher('transform', morpher)
    return this
  },

  // Animatable x-axis
  x(x) {
    return this._queueNumber('x', x)
  },

  // Animatable y-axis
  y(y) {
    return this._queueNumber('y', y)
  },

  ax(x) {
    return this._queueNumber('ax', x)
  },

  ay(y) {
    return this._queueNumber('ay', y)
  },

  dx(x = 0) {
    return this._queueNumberDelta('x', x)
  },

  dy(y = 0) {
    return this._queueNumberDelta('y', y)
  },

  dmove(x, y) {
    return this.dx(x).dy(y)
  },

  _queueNumberDelta(method, to) {
    to = new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_13__["default"](to)

    // Try to change the target if we have this method already registered
    if (this._tryRetarget(method, to)) return this

    // Make a morpher and queue the animation
    const morpher = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__["default"](this._stepper).to(to)
    let from = null
    this.queue(
      function () {
        from = this.element()[method]()
        morpher.from(from)
        morpher.to(from + to)
      },
      function (pos) {
        this.element()[method](morpher.at(pos))
        return morpher.done()
      },
      function (newTo) {
        morpher.to(from + new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_13__["default"](newTo))
      }
    )

    // Register the morpher so that if it is changed again, we can retarget it
    this._rememberMorpher(method, morpher)
    return this
  },

  _queueObject(method, to) {
    // Try to change the target if we have this method already registered
    if (this._tryRetarget(method, to)) return this

    // Make a morpher and queue the animation
    const morpher = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__["default"](this._stepper).to(to)
    this.queue(
      function () {
        morpher.from(this.element()[method]())
      },
      function (pos) {
        this.element()[method](morpher.at(pos))
        return morpher.done()
      }
    )

    // Register the morpher so that if it is changed again, we can retarget it
    this._rememberMorpher(method, morpher)
    return this
  },

  _queueNumber(method, value) {
    return this._queueObject(method, new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_13__["default"](value))
  },

  // Animatable center x-axis
  cx(x) {
    return this._queueNumber('cx', x)
  },

  // Animatable center y-axis
  cy(y) {
    return this._queueNumber('cy', y)
  },

  // Add animatable move
  move(x, y) {
    return this.x(x).y(y)
  },

  amove(x, y) {
    return this.ax(x).ay(y)
  },

  // Add animatable center
  center(x, y) {
    return this.cx(x).cy(y)
  },

  // Add animatable size
  size(width, height) {
    // animate bbox based size for all other elements
    let box

    if (!width || !height) {
      box = this._element.bbox()
    }

    if (!width) {
      width = (box.width / box.height) * height
    }

    if (!height) {
      height = (box.height / box.width) * width
    }

    return this.width(width).height(height)
  },

  // Add animatable width
  width(width) {
    return this._queueNumber('width', width)
  },

  // Add animatable height
  height(height) {
    return this._queueNumber('height', height)
  },

  // Add animatable plot
  plot(a, b, c, d) {
    // Lines can be plotted with 4 arguments
    if (arguments.length === 4) {
      return this.plot([a, b, c, d])
    }

    if (this._tryRetarget('plot', a)) return this

    const morpher = new _Morphable_js__WEBPACK_IMPORTED_MODULE_11__["default"](this._stepper)
      .type(this._element.MorphArray)
      .to(a)

    this.queue(
      function () {
        morpher.from(this._element.array())
      },
      function (pos) {
        this._element.plot(morpher.at(pos))
        return morpher.done()
      }
    )

    this._rememberMorpher('plot', morpher)
    return this
  },

  // Add leading method
  leading(value) {
    return this._queueNumber('leading', value)
  },

  // Add animatable viewbox
  viewbox(x, y, width, height) {
    return this._queueObject('viewbox', new _types_Box_js__WEBPACK_IMPORTED_MODULE_8__["default"](x, y, width, height))
  },

  update(o) {
    if (typeof o !== 'object') {
      return this.update({
        offset: arguments[0],
        color: arguments[1],
        opacity: arguments[2]
      })
    }

    if (o.opacity != null) this.attr('stop-opacity', o.opacity)
    if (o.color != null) this.attr('stop-color', o.color)
    if (o.offset != null) this.attr('offset', o.offset)

    return this
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.extend)(Runner, { rx: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_6__.rx, ry: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_6__.ry, from: _modules_core_gradiented_js__WEBPACK_IMPORTED_MODULE_2__.from, to: _modules_core_gradiented_js__WEBPACK_IMPORTED_MODULE_2__.to })
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.register)(Runner, 'Runner')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/animation/Timeline.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/animation/Timeline.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Timeline)
/* harmony export */ });
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Animator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Animator.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Animator.js");
/* harmony import */ var _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/EventTarget.js */ "./node_modules/@svgdotjs/svg.js/src/types/EventTarget.js");





const makeSchedule = function (runnerInfo) {
  const start = runnerInfo.start
  const duration = runnerInfo.runner.duration()
  const end = start + duration
  return {
    start: start,
    duration: duration,
    end: end,
    runner: runnerInfo.runner
  }
}

const defaultSource = function () {
  const w = _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.window
  return (w.performance || w.Date).now()
}

class Timeline extends _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  // Construct a new timeline on the given element
  constructor(timeSource = defaultSource) {
    super()

    this._timeSource = timeSource

    // terminate resets all variables to their initial state
    this.terminate()
  }

  active() {
    return !!this._nextFrame
  }

  finish() {
    // Go to end and pause
    this.time(this.getEndTimeOfTimeline() + 1)
    return this.pause()
  }

  // Calculates the end of the timeline
  getEndTime() {
    const lastRunnerInfo = this.getLastRunnerInfo()
    const lastDuration = lastRunnerInfo ? lastRunnerInfo.runner.duration() : 0
    const lastStartTime = lastRunnerInfo ? lastRunnerInfo.start : this._time
    return lastStartTime + lastDuration
  }

  getEndTimeOfTimeline() {
    const endTimes = this._runners.map((i) => i.start + i.runner.duration())
    return Math.max(0, ...endTimes)
  }

  getLastRunnerInfo() {
    return this.getRunnerInfoById(this._lastRunnerId)
  }

  getRunnerInfoById(id) {
    return this._runners[this._runnerIds.indexOf(id)] || null
  }

  pause() {
    this._paused = true
    return this._continue()
  }

  persist(dtOrForever) {
    if (dtOrForever == null) return this._persist
    this._persist = dtOrForever
    return this
  }

  play() {
    // Now make sure we are not paused and continue the animation
    this._paused = false
    return this.updateTime()._continue()
  }

  reverse(yes) {
    const currentSpeed = this.speed()
    if (yes == null) return this.speed(-currentSpeed)

    const positive = Math.abs(currentSpeed)
    return this.speed(yes ? -positive : positive)
  }

  // schedules a runner on the timeline
  schedule(runner, delay, when) {
    if (runner == null) {
      return this._runners.map(makeSchedule)
    }

    // The start time for the next animation can either be given explicitly,
    // derived from the current timeline time or it can be relative to the
    // last start time to chain animations directly

    let absoluteStartTime = 0
    const endTime = this.getEndTime()
    delay = delay || 0

    // Work out when to start the animation
    if (when == null || when === 'last' || when === 'after') {
      // Take the last time and increment
      absoluteStartTime = endTime
    } else if (when === 'absolute' || when === 'start') {
      absoluteStartTime = delay
      delay = 0
    } else if (when === 'now') {
      absoluteStartTime = this._time
    } else if (when === 'relative') {
      const runnerInfo = this.getRunnerInfoById(runner.id)
      if (runnerInfo) {
        absoluteStartTime = runnerInfo.start + delay
        delay = 0
      }
    } else if (when === 'with-last') {
      const lastRunnerInfo = this.getLastRunnerInfo()
      const lastStartTime = lastRunnerInfo ? lastRunnerInfo.start : this._time
      absoluteStartTime = lastStartTime
    } else {
      throw new Error('Invalid value for the "when" parameter')
    }

    // Manage runner
    runner.unschedule()
    runner.timeline(this)

    const persist = runner.persist()
    const runnerInfo = {
      persist: persist === null ? this._persist : persist,
      start: absoluteStartTime + delay,
      runner
    }

    this._lastRunnerId = runner.id

    this._runners.push(runnerInfo)
    this._runners.sort((a, b) => a.start - b.start)
    this._runnerIds = this._runners.map((info) => info.runner.id)

    this.updateTime()._continue()
    return this
  }

  seek(dt) {
    return this.time(this._time + dt)
  }

  source(fn) {
    if (fn == null) return this._timeSource
    this._timeSource = fn
    return this
  }

  speed(speed) {
    if (speed == null) return this._speed
    this._speed = speed
    return this
  }

  stop() {
    // Go to start and pause
    this.time(0)
    return this.pause()
  }

  time(time) {
    if (time == null) return this._time
    this._time = time
    return this._continue(true)
  }

  // Remove the runner from this timeline
  unschedule(runner) {
    const index = this._runnerIds.indexOf(runner.id)
    if (index < 0) return this

    this._runners.splice(index, 1)
    this._runnerIds.splice(index, 1)

    runner.timeline(null)
    return this
  }

  // Makes sure, that after pausing the time doesn't jump
  updateTime() {
    if (!this.active()) {
      this._lastSourceTime = this._timeSource()
    }
    return this
  }

  // Checks if we are running and continues the animation
  _continue(immediateStep = false) {
    _Animator_js__WEBPACK_IMPORTED_MODULE_2__["default"].cancelFrame(this._nextFrame)
    this._nextFrame = null

    if (immediateStep) return this._stepImmediate()
    if (this._paused) return this

    this._nextFrame = _Animator_js__WEBPACK_IMPORTED_MODULE_2__["default"].frame(this._step)
    return this
  }

  _stepFn(immediateStep = false) {
    // Get the time delta from the last time and update the time
    const time = this._timeSource()
    let dtSource = time - this._lastSourceTime

    if (immediateStep) dtSource = 0

    const dtTime = this._speed * dtSource + (this._time - this._lastStepTime)
    this._lastSourceTime = time

    // Only update the time if we use the timeSource.
    // Otherwise use the current time
    if (!immediateStep) {
      // Update the time
      this._time += dtTime
      this._time = this._time < 0 ? 0 : this._time
    }
    this._lastStepTime = this._time
    this.fire('time', this._time)

    // This is for the case that the timeline was seeked so that the time
    // is now before the startTime of the runner. That is why we need to set
    // the runner to position 0

    // FIXME:
    // However, resetting in insertion order leads to bugs. Considering the case,
    // where 2 runners change the same attribute but in different times,
    // resetting both of them will lead to the case where the later defined
    // runner always wins the reset even if the other runner started earlier
    // and therefore should win the attribute battle
    // this can be solved by resetting them backwards
    for (let k = this._runners.length; k--; ) {
      // Get and run the current runner and ignore it if its inactive
      const runnerInfo = this._runners[k]
      const runner = runnerInfo.runner

      // Make sure that we give the actual difference
      // between runner start time and now
      const dtToStart = this._time - runnerInfo.start

      // Dont run runner if not started yet
      // and try to reset it
      if (dtToStart <= 0) {
        runner.reset()
      }
    }

    // Run all of the runners directly
    let runnersLeft = false
    for (let i = 0, len = this._runners.length; i < len; i++) {
      // Get and run the current runner and ignore it if its inactive
      const runnerInfo = this._runners[i]
      const runner = runnerInfo.runner
      let dt = dtTime

      // Make sure that we give the actual difference
      // between runner start time and now
      const dtToStart = this._time - runnerInfo.start

      // Dont run runner if not started yet
      if (dtToStart <= 0) {
        runnersLeft = true
        continue
      } else if (dtToStart < dt) {
        // Adjust dt to make sure that animation is on point
        dt = dtToStart
      }

      if (!runner.active()) continue

      // If this runner is still going, signal that we need another animation
      // frame, otherwise, remove the completed runner
      const finished = runner.step(dt).done
      if (!finished) {
        runnersLeft = true
        // continue
      } else if (runnerInfo.persist !== true) {
        // runner is finished. And runner might get removed
        const endTime = runner.duration() - runner.time() + this._time

        if (endTime + runnerInfo.persist < this._time) {
          // Delete runner and correct index
          runner.unschedule()
          --i
          --len
        }
      }
    }

    // Basically: we continue when there are runners right from us in time
    // when -->, and when runners are left from us when <--
    if (
      (runnersLeft && !(this._speed < 0 && this._time === 0)) ||
      (this._runnerIds.length && this._speed < 0 && this._time > 0)
    ) {
      this._continue()
    } else {
      this.pause()
      this.fire('finished')
    }

    return this
  }

  terminate() {
    // cleanup memory

    // Store the timing variables
    this._startTime = 0
    this._speed = 1.0

    // Determines how long a runner is hold in memory. Can be a dt or true/false
    this._persist = 0

    // Keep track of the running animations and their starting parameters
    this._nextFrame = null
    this._paused = true
    this._runners = []
    this._runnerIds = []
    this._lastRunnerId = -1
    this._time = 0
    this._lastSourceTime = 0
    this._lastStepTime = 0

    // Make sure that step is always called in class context
    this._step = this._stepFn.bind(this, false)
    this._stepImmediate = this._stepFn.bind(this, true)
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Element: {
    timeline: function (timeline) {
      if (timeline == null) {
        this._timeline = this._timeline || new Timeline()
        return this._timeline
      } else {
        this._timeline = timeline
        return this
      }
    }
  }
})


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/A.js":
/*!*********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/A.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ A)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _modules_core_containerGeometry_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/core/containerGeometry.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/containerGeometry.js");






class A extends _Container_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('a', node), attrs)
  }

  // Link target attribute
  target(target) {
    return this.attr('target', target)
  }

  // Link url
  to(url) {
    return this.attr('href', url, _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__.xlink)
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(A, _modules_core_containerGeometry_js__WEBPACK_IMPORTED_MODULE_4__)

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create a hyperlink element
    link: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (url) {
      return this.put(new A()).to(url)
    })
  },
  Element: {
    unlink() {
      const link = this.linker()

      if (!link) return this

      const parent = link.parent()

      if (!parent) {
        return this.remove()
      }

      const index = parent.index(link)
      parent.add(this, index)

      link.remove()
      return this
    },
    linkTo(url) {
      // reuse old link if possible
      let link = this.linker()

      if (!link) {
        link = new A()
        this.wrap(link)
      }

      if (typeof url === 'function') {
        url.call(link, link)
      } else {
        link.to(url)
      }

      return this
    },
    linker() {
      const link = this.parent()
      if (link && link.node.nodeName.toLowerCase() === 'a') {
        return link
      }

      return null
    }
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(A, 'A')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Circle.js":
/*!**************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Circle.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Circle)
/* harmony export */ });
/* harmony import */ var _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/circled.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/circled.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");






class Circle extends _Shape_js__WEBPACK_IMPORTED_MODULE_4__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.nodeOrNew)('circle', node), attrs)
  }

  radius(r) {
    return this.attr('r', r)
  }

  // Radius x value
  rx(rx) {
    return this.attr('r', rx)
  }

  // Alias radius x value
  ry(ry) {
    return this.rx(ry)
  }

  size(size) {
    return this.radius(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_3__["default"](size).divide(2))
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.extend)(Circle, { x: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_0__.x, y: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_0__.y, cx: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_0__.cx, cy: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_0__.cy, width: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_0__.width, height: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_0__.height })

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_2__.registerMethods)({
  Container: {
    // Create circle element
    circle: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.wrapWithAttrCheck)(function (size = 0) {
      return this.put(new Circle()).size(size).move(0, 0)
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.register)(Circle, 'Circle')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/ClipPath.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/ClipPath.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ClipPath)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../modules/core/selector.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js");





class ClipPath extends _Container_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('clipPath', node), attrs)
  }

  // Unclip all clipped elements and remove itself
  remove() {
    // unclip all targets
    this.targets().forEach(function (el) {
      el.unclip()
    })

    // remove clipPath from parent
    return super.remove()
  }

  targets() {
    return (0,_modules_core_selector_js__WEBPACK_IMPORTED_MODULE_3__["default"])('svg [clip-path*=' + this.id() + ']')
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create clipping element
    clip: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function () {
      return this.defs().put(new ClipPath())
    })
  },
  Element: {
    // Distribute clipPath to svg element
    clipper() {
      return this.reference('clip-path')
    },

    clipWith(element) {
      // use given clip or create a new one
      const clipper =
        element instanceof ClipPath
          ? element
          : this.parent().clip().add(element)

      // apply mask
      return this.attr('clip-path', 'url(#' + clipper.id() + ')')
    },

    // Unclip element
    unclip() {
      return this.attr('clip-path', null)
    }
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(ClipPath, 'ClipPath')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Container.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Container)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _Element_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");



class Container extends _Element_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  flatten() {
    this.each(function () {
      if (this instanceof Container) {
        return this.flatten().ungroup()
      }
    })

    return this
  }

  ungroup(parent = this.parent(), index = parent.index(this)) {
    // when parent != this, we want append all elements to the end
    index = index === -1 ? parent.children().length : index

    this.each(function (i, children) {
      // reverse each
      return children[children.length - i - 1].toParent(parent, index)
    })

    return this.remove()
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Container, 'Container')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Defs.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Defs.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Defs)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");



class Defs extends _Container_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('defs', node), attrs)
  }

  flatten() {
    return this
  }

  ungroup() {
    return this
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Defs, 'Defs')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Dom.js":
/*!***********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Dom.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Dom)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/core/selector.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../types/EventTarget.js */ "./node_modules/@svgdotjs/svg.js/src/types/EventTarget.js");
/* harmony import */ var _types_List_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../types/List.js */ "./node_modules/@svgdotjs/svg.js/src/types/List.js");
/* harmony import */ var _modules_core_attr_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../modules/core/attr.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/attr.js");









class Dom extends _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_5__["default"] {
  constructor(node, attrs) {
    super()
    this.node = node
    this.type = node.nodeName

    if (attrs && node !== attrs) {
      this.attr(attrs)
    }
  }

  // Add given element at a position
  add(element, i) {
    element = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(element)

    // If non-root svg nodes are added we have to remove their namespaces
    if (
      element.removeNamespace &&
      this.node instanceof _utils_window_js__WEBPACK_IMPORTED_MODULE_2__.globals.window.SVGElement
    ) {
      element.removeNamespace()
    }

    if (i == null) {
      this.node.appendChild(element.node)
    } else if (element.node !== this.node.childNodes[i]) {
      this.node.insertBefore(element.node, this.node.childNodes[i])
    }

    return this
  }

  // Add element to given container and return self
  addTo(parent, i) {
    return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(parent).put(this, i)
  }

  // Returns all child elements
  children() {
    return new _types_List_js__WEBPACK_IMPORTED_MODULE_6__["default"](
      (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.map)(this.node.children, function (node) {
        return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(node)
      })
    )
  }

  // Remove all elements in this container
  clear() {
    // remove children
    while (this.node.hasChildNodes()) {
      this.node.removeChild(this.node.lastChild)
    }

    return this
  }

  // Clone element
  clone(deep = true, assignNewIds = true) {
    // write dom data to the dom so the clone can pickup the data
    this.writeDataToDom()

    // clone element
    let nodeClone = this.node.cloneNode(deep)
    if (assignNewIds) {
      // assign new id
      nodeClone = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.assignNewId)(nodeClone)
    }
    return new this.constructor(nodeClone)
  }

  // Iterates over all children and invokes a given block
  each(block, deep) {
    const children = this.children()
    let i, il

    for (i = 0, il = children.length; i < il; i++) {
      block.apply(children[i], [i, children])

      if (deep) {
        children[i].each(block, deep)
      }
    }

    return this
  }

  element(nodeName, attrs) {
    return this.put(new Dom((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.create)(nodeName), attrs))
  }

  // Get first child
  first() {
    return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(this.node.firstChild)
  }

  // Get a element at the given index
  get(i) {
    return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(this.node.childNodes[i])
  }

  getEventHolder() {
    return this.node
  }

  getEventTarget() {
    return this.node
  }

  // Checks if the given element is a child
  has(element) {
    return this.index(element) >= 0
  }

  html(htmlOrFn, outerHTML) {
    return this.xml(htmlOrFn, outerHTML, _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_4__.html)
  }

  // Get / set id
  id(id) {
    // generate new id if no id set
    if (typeof id === 'undefined' && !this.node.id) {
      this.node.id = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.eid)(this.type)
    }

    // don't set directly with this.node.id to make `null` work correctly
    return this.attr('id', id)
  }

  // Gets index of given element
  index(element) {
    return [].slice.call(this.node.childNodes).indexOf(element.node)
  }

  // Get the last child
  last() {
    return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(this.node.lastChild)
  }

  // matches the element vs a css selector
  matches(selector) {
    const el = this.node
    const matcher =
      el.matches ||
      el.matchesSelector ||
      el.msMatchesSelector ||
      el.mozMatchesSelector ||
      el.webkitMatchesSelector ||
      el.oMatchesSelector ||
      null
    return matcher && matcher.call(el, selector)
  }

  // Returns the parent element instance
  parent(type) {
    let parent = this

    // check for parent
    if (!parent.node.parentNode) return null

    // get parent element
    parent = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(parent.node.parentNode)

    if (!type) return parent

    // loop through ancestors if type is given
    do {
      if (
        typeof type === 'string' ? parent.matches(type) : parent instanceof type
      )
        return parent
    } while ((parent = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(parent.node.parentNode)))

    return parent
  }

  // Basically does the same as `add()` but returns the added element instead
  put(element, i) {
    element = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(element)
    this.add(element, i)
    return element
  }

  // Add element to given container and return container
  putIn(parent, i) {
    return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(parent).add(this, i)
  }

  // Remove element
  remove() {
    if (this.parent()) {
      this.parent().removeElement(this)
    }

    return this
  }

  // Remove a given child
  removeElement(element) {
    this.node.removeChild(element.node)

    return this
  }

  // Replace this with element
  replace(element) {
    element = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(element)

    if (this.node.parentNode) {
      this.node.parentNode.replaceChild(element.node, this.node)
    }

    return element
  }

  round(precision = 2, map = null) {
    const factor = 10 ** precision
    const attrs = this.attr(map)

    for (const i in attrs) {
      if (typeof attrs[i] === 'number') {
        attrs[i] = Math.round(attrs[i] * factor) / factor
      }
    }

    this.attr(attrs)
    return this
  }

  // Import / Export raw svg
  svg(svgOrFn, outerSVG) {
    return this.xml(svgOrFn, outerSVG, _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_4__.svg)
  }

  // Return id on string conversion
  toString() {
    return this.id()
  }

  words(text) {
    // This is faster than removing all children and adding a new one
    this.node.textContent = text
    return this
  }

  wrap(node) {
    const parent = this.parent()

    if (!parent) {
      return this.addTo(node)
    }

    const position = parent.index(this)
    return parent.put(node, position).put(this)
  }

  // write svgjs data to the dom
  writeDataToDom() {
    // dump variables recursively
    this.each(function () {
      this.writeDataToDom()
    })

    return this
  }

  // Import / Export raw svg
  xml(xmlOrFn, outerXML, ns) {
    if (typeof xmlOrFn === 'boolean') {
      ns = outerXML
      outerXML = xmlOrFn
      xmlOrFn = null
    }

    // act as getter if no svg string is given
    if (xmlOrFn == null || typeof xmlOrFn === 'function') {
      // The default for exports is, that the outerNode is included
      outerXML = outerXML == null ? true : outerXML

      // write svgjs data to the dom
      this.writeDataToDom()
      let current = this

      // An export modifier was passed
      if (xmlOrFn != null) {
        current = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(current.node.cloneNode(true))

        // If the user wants outerHTML we need to process this node, too
        if (outerXML) {
          const result = xmlOrFn(current)
          current = result || current

          // The user does not want this node? Well, then he gets nothing
          if (result === false) return ''
        }

        // Deep loop through all children and apply modifier
        current.each(function () {
          const result = xmlOrFn(this)
          const _this = result || this

          // If modifier returns false, discard node
          if (result === false) {
            this.remove()

            // If modifier returns new node, use it
          } else if (result && this !== _this) {
            this.replace(_this)
          }
        }, true)
      }

      // Return outer or inner content
      return outerXML ? current.node.outerHTML : current.node.innerHTML
    }

    // Act as setter if we got a string

    // The default for import is, that the current node is not replaced
    outerXML = outerXML == null ? false : outerXML

    // Create temporary holder
    const well = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.create)('wrapper', ns)
    const fragment = _utils_window_js__WEBPACK_IMPORTED_MODULE_2__.globals.document.createDocumentFragment()

    // Dump raw svg
    well.innerHTML = xmlOrFn

    // Transplant nodes into the fragment
    for (let len = well.children.length; len--; ) {
      fragment.appendChild(well.firstElementChild)
    }

    const parent = this.parent()

    // Add the whole fragment at once
    return outerXML ? this.replace(fragment) && parent : this.add(fragment)
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Dom, { attr: _modules_core_attr_js__WEBPACK_IMPORTED_MODULE_7__["default"], find: _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_1__.find, findOne: _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_1__.findOne })
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Dom, 'Dom')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js":
/*!***************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Element.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Element)
/* harmony export */ });
/* harmony import */ var _types_Box_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _types_Matrix_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _types_Point_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../types/Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _Dom_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Dom.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Dom.js");
/* harmony import */ var _types_List_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../types/List.js */ "./node_modules/@svgdotjs/svg.js/src/types/List.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");











class Element extends _Dom_js__WEBPACK_IMPORTED_MODULE_7__["default"] {
  constructor(node, attrs) {
    super(node, attrs)

    // initialize data object
    this.dom = {}

    // create circular reference
    this.node.instance = this

    if (node.hasAttribute('data-svgjs') || node.hasAttribute('svgjs:data')) {
      // pull svgjs data from the dom (getAttributeNS doesn't work in html5)
      this.setData(
        JSON.parse(node.getAttribute('data-svgjs')) ??
          JSON.parse(node.getAttribute('svgjs:data')) ??
          {}
      )
    }
  }

  // Move element by its center
  center(x, y) {
    return this.cx(x).cy(y)
  }

  // Move by center over x-axis
  cx(x) {
    return x == null
      ? this.x() + this.width() / 2
      : this.x(x - this.width() / 2)
  }

  // Move by center over y-axis
  cy(y) {
    return y == null
      ? this.y() + this.height() / 2
      : this.y(y - this.height() / 2)
  }

  // Get defs
  defs() {
    const root = this.root()
    return root && root.defs()
  }

  // Relative move over x and y axes
  dmove(x, y) {
    return this.dx(x).dy(y)
  }

  // Relative move over x axis
  dx(x = 0) {
    return this.x(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_9__["default"](x).plus(this.x()))
  }

  // Relative move over y axis
  dy(y = 0) {
    return this.y(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_9__["default"](y).plus(this.y()))
  }

  getEventHolder() {
    return this
  }

  // Set height of element
  height(height) {
    return this.attr('height', height)
  }

  // Move element to given x and y values
  move(x, y) {
    return this.x(x).y(y)
  }

  // return array of all ancestors of given type up to the root svg
  parents(until = this.root()) {
    const isSelector = typeof until === 'string'
    if (!isSelector) {
      until = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.makeInstance)(until)
    }
    const parents = new _types_List_js__WEBPACK_IMPORTED_MODULE_8__["default"]()
    let parent = this

    while (
      (parent = parent.parent()) &&
      parent.node !== _utils_window_js__WEBPACK_IMPORTED_MODULE_3__.globals.document &&
      parent.nodeName !== '#document-fragment'
    ) {
      parents.push(parent)

      if (!isSelector && parent.node === until.node) {
        break
      }
      if (isSelector && parent.matches(until)) {
        break
      }
      if (parent.node === this.root().node) {
        // We worked our way to the root and didn't match `until`
        return null
      }
    }

    return parents
  }

  // Get referenced element form attribute value
  reference(attr) {
    attr = this.attr(attr)
    if (!attr) return null

    const m = (attr + '').match(_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_6__.reference)
    return m ? (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.makeInstance)(m[1]) : null
  }

  // Get parent document
  root() {
    const p = this.parent((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.getClass)(_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.root))
    return p && p.root()
  }

  // set given data to the elements data property
  setData(o) {
    this.dom = o
    return this
  }

  // Set element size to given width and height
  size(width, height) {
    const p = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_5__.proportionalSize)(this, width, height)

    return this.width(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_9__["default"](p.width)).height(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_9__["default"](p.height))
  }

  // Set width of element
  width(width) {
    return this.attr('width', width)
  }

  // write svgjs data to the dom
  writeDataToDom() {
    (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_5__.writeDataToDom)(this, this.dom)
    return super.writeDataToDom()
  }

  // Move over x-axis
  x(x) {
    return this.attr('x', x)
  }

  // Move over y-axis
  y(y) {
    return this.attr('y', y)
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.extend)(Element, {
  bbox: _types_Box_js__WEBPACK_IMPORTED_MODULE_0__.bbox,
  rbox: _types_Box_js__WEBPACK_IMPORTED_MODULE_0__.rbox,
  inside: _types_Box_js__WEBPACK_IMPORTED_MODULE_0__.inside,
  point: _types_Point_js__WEBPACK_IMPORTED_MODULE_4__.point,
  ctm: _types_Matrix_js__WEBPACK_IMPORTED_MODULE_1__.ctm,
  screenCTM: _types_Matrix_js__WEBPACK_IMPORTED_MODULE_1__.screenCTM
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.register)(Element, 'Element')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Ellipse.js":
/*!***************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Ellipse.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Ellipse)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/core/circled.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/circled.js");







class Ellipse extends _Shape_js__WEBPACK_IMPORTED_MODULE_4__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('ellipse', node), attrs)
  }

  size(width, height) {
    const p = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.proportionalSize)(this, width, height)

    return this.rx(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_3__["default"](p.width).divide(2)).ry(
      new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_3__["default"](p.height).divide(2)
    )
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Ellipse, _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_5__)

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_2__.registerMethods)('Container', {
  // Create an ellipse
  ellipse: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (width = 0, height = width) {
    return this.put(new Ellipse()).size(width, height).move(0, 0)
  })
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Ellipse, 'Ellipse')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/ForeignObject.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/ForeignObject.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ForeignObject)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Element_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");




class ForeignObject extends _Element_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('foreignObject', node), attrs)
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    foreignObject: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (width, height) {
      return this.put(new ForeignObject()).size(width, height)
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(ForeignObject, 'ForeignObject')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Fragment.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Fragment.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Dom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dom.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Dom.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");




class Fragment extends _Dom_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(node = _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.document.createDocumentFragment()) {
    super(node)
  }

  // Import / Export raw xml
  xml(xmlOrFn, outerXML, ns) {
    if (typeof xmlOrFn === 'boolean') {
      ns = outerXML
      outerXML = xmlOrFn
      xmlOrFn = null
    }

    // because this is a fragment we have to put all elements into a wrapper first
    // before we can get the innerXML from it
    if (xmlOrFn == null || typeof xmlOrFn === 'function') {
      const wrapper = new _Dom_js__WEBPACK_IMPORTED_MODULE_0__["default"]((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.create)('wrapper', ns))
      wrapper.add(this.node.cloneNode(true))

      return wrapper.xml(false, ns)
    }

    // Act as setter if we got a string
    return super.xml(xmlOrFn, false, ns)
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.register)(Fragment, 'Fragment')

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Fragment);


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/G.js":
/*!*********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/G.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ G)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _modules_core_containerGeometry_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../modules/core/containerGeometry.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/containerGeometry.js");





class G extends _Container_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('g', node), attrs)
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(G, _modules_core_containerGeometry_js__WEBPACK_IMPORTED_MODULE_3__)

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create a group element
    group: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function () {
      return this.put(new G())
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(G, 'G')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Gradient.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Gradient.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Gradient)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_Box_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/core/selector.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js");
/* harmony import */ var _modules_core_gradiented_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/core/gradiented.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/gradiented.js");







class Gradient extends _Container_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(type, attrs) {
    super(
      (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)(type + 'Gradient', typeof type === 'string' ? null : type),
      attrs
    )
  }

  // custom attr to handle transform
  attr(a, b, c) {
    if (a === 'transform') a = 'gradientTransform'
    return super.attr(a, b, c)
  }

  bbox() {
    return new _types_Box_js__WEBPACK_IMPORTED_MODULE_2__["default"]()
  }

  targets() {
    return (0,_modules_core_selector_js__WEBPACK_IMPORTED_MODULE_4__["default"])('svg [fill*=' + this.id() + ']')
  }

  // Alias string conversion to fill
  toString() {
    return this.url()
  }

  // Update gradient
  update(block) {
    // remove all stops
    this.clear()

    // invoke passed block
    if (typeof block === 'function') {
      block.call(this, this)
    }

    return this
  }

  // Return the fill id
  url() {
    return 'url(#' + this.id() + ')'
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Gradient, _modules_core_gradiented_js__WEBPACK_IMPORTED_MODULE_5__)

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create gradient element in defs
    gradient(...args) {
      return this.defs().gradient(...args)
    }
  },
  // define gradient
  Defs: {
    gradient: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (type, block) {
      return this.put(new Gradient(type)).update(block)
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Gradient, 'Gradient')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Image.js":
/*!*************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Image.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Image)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _modules_core_event_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/core/event.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/event.js");
/* harmony import */ var _modules_core_attr_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../modules/core/attr.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/attr.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Pattern.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Pattern.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");










class Image extends _Shape_js__WEBPACK_IMPORTED_MODULE_7__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.nodeOrNew)('image', node), attrs)
  }

  // (re)load image
  load(url, callback) {
    if (!url) return this

    const img = new _utils_window_js__WEBPACK_IMPORTED_MODULE_8__.globals.window.Image()

    ;(0,_modules_core_event_js__WEBPACK_IMPORTED_MODULE_2__.on)(
      img,
      'load',
      function (e) {
        const p = this.parent(_Pattern_js__WEBPACK_IMPORTED_MODULE_6__["default"])

        // ensure image size
        if (this.width() === 0 && this.height() === 0) {
          this.size(img.width, img.height)
        }

        if (p instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_6__["default"]) {
          // ensure pattern size if not set
          if (p.width() === 0 && p.height() === 0) {
            p.size(this.width(), this.height())
          }
        }

        if (typeof callback === 'function') {
          callback.call(this, e)
        }
      },
      this
    )

    ;(0,_modules_core_event_js__WEBPACK_IMPORTED_MODULE_2__.on)(img, 'load error', function () {
      // dont forget to unbind memory leaking events
      ;(0,_modules_core_event_js__WEBPACK_IMPORTED_MODULE_2__.off)(img)
    })

    return this.attr('href', (img.src = url), _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_5__.xlink)
  }
}

(0,_modules_core_attr_js__WEBPACK_IMPORTED_MODULE_3__.registerAttrHook)(function (attr, val, _this) {
  // convert image fill and stroke to patterns
  if (attr === 'fill' || attr === 'stroke') {
    if (_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isImage.test(val)) {
      val = _this.root().defs().image(val)
    }
  }

  if (val instanceof Image) {
    val = _this
      .root()
      .defs()
      .pattern(0, 0, (pattern) => {
        pattern.add(val)
      })
  }

  return val
})

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_4__.registerMethods)({
  Container: {
    // create image element, load image and set its size
    image: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.wrapWithAttrCheck)(function (source, callback) {
      return this.put(new Image()).size(0, 0).load(source, callback)
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.register)(Image, 'Image')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Line.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Line.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Line)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_PointArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/PointArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PointArray.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _modules_core_pointed_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/core/pointed.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/pointed.js");







class Line extends _Shape_js__WEBPACK_IMPORTED_MODULE_4__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('line', node), attrs)
  }

  // Get array
  array() {
    return new _types_PointArray_js__WEBPACK_IMPORTED_MODULE_3__["default"]([
      [this.attr('x1'), this.attr('y1')],
      [this.attr('x2'), this.attr('y2')]
    ])
  }

  // Move by left top corner
  move(x, y) {
    return this.attr(this.array().move(x, y).toLine())
  }

  // Overwrite native plot() method
  plot(x1, y1, x2, y2) {
    if (x1 == null) {
      return this.array()
    } else if (typeof y1 !== 'undefined') {
      x1 = { x1, y1, x2, y2 }
    } else {
      x1 = new _types_PointArray_js__WEBPACK_IMPORTED_MODULE_3__["default"](x1).toLine()
    }

    return this.attr(x1)
  }

  // Set element size to given width and height
  size(width, height) {
    const p = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.proportionalSize)(this, width, height)
    return this.attr(this.array().size(p.width, p.height).toLine())
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Line, _modules_core_pointed_js__WEBPACK_IMPORTED_MODULE_5__)

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_2__.registerMethods)({
  Container: {
    // Create a line element
    line: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (...args) {
      // make sure plot is called as a setter
      // x1 is not necessarily a number, it can also be an array, a string and a PointArray
      return Line.prototype.plot.apply(
        this.put(new Line()),
        args[0] != null ? args : [0, 0, 0, 0]
      )
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Line, 'Line')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Marker.js":
/*!**************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Marker.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Marker)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");




class Marker extends _Container_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('marker', node), attrs)
  }

  // Set height of element
  height(height) {
    return this.attr('markerHeight', height)
  }

  orient(orient) {
    return this.attr('orient', orient)
  }

  // Set marker refX and refY
  ref(x, y) {
    return this.attr('refX', x).attr('refY', y)
  }

  // Return the fill id
  toString() {
    return 'url(#' + this.id() + ')'
  }

  // Update marker
  update(block) {
    // remove all content
    this.clear()

    // invoke passed block
    if (typeof block === 'function') {
      block.call(this, this)
    }

    return this
  }

  // Set width of element
  width(width) {
    return this.attr('markerWidth', width)
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    marker(...args) {
      // Create marker element in defs
      return this.defs().marker(...args)
    }
  },
  Defs: {
    // Create marker
    marker: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (width, height, block) {
      // Set default viewbox to match the width and height, set ref to cx and cy and set orient to auto
      return this.put(new Marker())
        .size(width, height)
        .ref(width / 2, height / 2)
        .viewbox(0, 0, width, height)
        .attr('orient', 'auto')
        .update(block)
    })
  },
  marker: {
    // Create and attach markers
    marker(marker, width, height, block) {
      let attr = ['marker']

      // Build attribute name
      if (marker !== 'all') attr.push(marker)
      attr = attr.join('-')

      // Set marker attribute
      marker =
        arguments[1] instanceof Marker
          ? arguments[1]
          : this.defs().marker(width, height, block)

      return this.attr(attr, marker)
    }
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Marker, 'Marker')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Mask.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Mask.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Mask)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../modules/core/selector.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js");





class Mask extends _Container_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('mask', node), attrs)
  }

  // Unmask all masked elements and remove itself
  remove() {
    // unmask all targets
    this.targets().forEach(function (el) {
      el.unmask()
    })

    // remove mask from parent
    return super.remove()
  }

  targets() {
    return (0,_modules_core_selector_js__WEBPACK_IMPORTED_MODULE_3__["default"])('svg [mask*=' + this.id() + ']')
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    mask: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function () {
      return this.defs().put(new Mask())
    })
  },
  Element: {
    // Distribute mask to svg element
    masker() {
      return this.reference('mask')
    },

    maskWith(element) {
      // use given mask or create a new one
      const masker =
        element instanceof Mask ? element : this.parent().mask().add(element)

      // apply mask
      return this.attr('mask', 'url(#' + masker.id() + ')')
    },

    // Unmask element
    unmask() {
      return this.attr('mask', null)
    }
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Mask, 'Mask')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Path.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Path.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Path)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_PathArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/PathArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PathArray.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");






class Path extends _Shape_js__WEBPACK_IMPORTED_MODULE_4__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('path', node), attrs)
  }

  // Get array
  array() {
    return this._array || (this._array = new _types_PathArray_js__WEBPACK_IMPORTED_MODULE_3__["default"](this.attr('d')))
  }

  // Clear array cache
  clear() {
    delete this._array
    return this
  }

  // Set height of element
  height(height) {
    return height == null
      ? this.bbox().height
      : this.size(this.bbox().width, height)
  }

  // Move by left top corner
  move(x, y) {
    return this.attr('d', this.array().move(x, y))
  }

  // Plot new path
  plot(d) {
    return d == null
      ? this.array()
      : this.clear().attr(
          'd',
          typeof d === 'string' ? d : (this._array = new _types_PathArray_js__WEBPACK_IMPORTED_MODULE_3__["default"](d))
        )
  }

  // Set element size to given width and height
  size(width, height) {
    const p = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.proportionalSize)(this, width, height)
    return this.attr('d', this.array().size(p.width, p.height))
  }

  // Set width of element
  width(width) {
    return width == null
      ? this.bbox().width
      : this.size(width, this.bbox().height)
  }

  // Move by left top corner over x-axis
  x(x) {
    return x == null ? this.bbox().x : this.move(x, this.bbox().y)
  }

  // Move by left top corner over y-axis
  y(y) {
    return y == null ? this.bbox().y : this.move(this.bbox().x, y)
  }
}

// Define morphable array
Path.prototype.MorphArray = _types_PathArray_js__WEBPACK_IMPORTED_MODULE_3__["default"]

// Add parent method
;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_2__.registerMethods)({
  Container: {
    // Create a wrapped path element
    path: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (d) {
      // make sure plot is called as a setter
      return this.put(new Path()).plot(d || new _types_PathArray_js__WEBPACK_IMPORTED_MODULE_3__["default"]())
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Path, 'Path')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Pattern.js":
/*!***************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Pattern.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Pattern)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_Box_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/core/selector.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js");






class Pattern extends _Container_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('pattern', node), attrs)
  }

  // custom attr to handle transform
  attr(a, b, c) {
    if (a === 'transform') a = 'patternTransform'
    return super.attr(a, b, c)
  }

  bbox() {
    return new _types_Box_js__WEBPACK_IMPORTED_MODULE_2__["default"]()
  }

  targets() {
    return (0,_modules_core_selector_js__WEBPACK_IMPORTED_MODULE_4__["default"])('svg [fill*=' + this.id() + ']')
  }

  // Alias string conversion to fill
  toString() {
    return this.url()
  }

  // Update pattern by rebuilding
  update(block) {
    // remove content
    this.clear()

    // invoke passed block
    if (typeof block === 'function') {
      block.call(this, this)
    }

    return this
  }

  // Return the fill id
  url() {
    return 'url(#' + this.id() + ')'
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create pattern element in defs
    pattern(...args) {
      return this.defs().pattern(...args)
    }
  },
  Defs: {
    pattern: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (width, height, block) {
      return this.put(new Pattern()).update(block).attr({
        x: 0,
        y: 0,
        width: width,
        height: height,
        patternUnits: 'userSpaceOnUse'
      })
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Pattern, 'Pattern')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Polygon.js":
/*!***************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Polygon.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Polygon)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_PointArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/PointArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PointArray.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _modules_core_pointed_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/core/pointed.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/pointed.js");
/* harmony import */ var _modules_core_poly_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/core/poly.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/poly.js");







class Polygon extends _Shape_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('polygon', node), attrs)
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create a wrapped polygon element
    polygon: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (p) {
      // make sure plot is called as a setter
      return this.put(new Polygon()).plot(p || new _types_PointArray_js__WEBPACK_IMPORTED_MODULE_2__["default"]())
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Polygon, _modules_core_pointed_js__WEBPACK_IMPORTED_MODULE_4__)
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Polygon, _modules_core_poly_js__WEBPACK_IMPORTED_MODULE_5__)
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Polygon, 'Polygon')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Polyline.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Polyline.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Polyline)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_PointArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/PointArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PointArray.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _modules_core_pointed_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/core/pointed.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/pointed.js");
/* harmony import */ var _modules_core_poly_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/core/poly.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/poly.js");







class Polyline extends _Shape_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('polyline', node), attrs)
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create a wrapped polygon element
    polyline: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (p) {
      // make sure plot is called as a setter
      return this.put(new Polyline()).plot(p || new _types_PointArray_js__WEBPACK_IMPORTED_MODULE_2__["default"]())
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Polyline, _modules_core_pointed_js__WEBPACK_IMPORTED_MODULE_4__)
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Polyline, _modules_core_poly_js__WEBPACK_IMPORTED_MODULE_5__)
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Polyline, 'Polyline')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Rect.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Rect.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Rect)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/core/circled.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/circled.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");





class Rect extends _Shape_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('rect', node), attrs)
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Rect, { rx: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_2__.rx, ry: _modules_core_circled_js__WEBPACK_IMPORTED_MODULE_2__.ry })

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create a rect element
    rect: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (width, height) {
      return this.put(new Rect()).size(width, height)
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Rect, 'Rect')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js":
/*!*************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Shape.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Shape)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _Element_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");



class Shape extends _Element_js__WEBPACK_IMPORTED_MODULE_1__["default"] {}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Shape, 'Shape')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Stop.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Stop.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stop)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _Element_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");





class Stop extends _Element_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('stop', node), attrs)
  }

  // add color stops
  update(o) {
    if (typeof o === 'number' || o instanceof _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__["default"]) {
      o = {
        offset: arguments[0],
        color: arguments[1],
        opacity: arguments[2]
      }
    }

    // set attributes
    if (o.opacity != null) this.attr('stop-opacity', o.opacity)
    if (o.color != null) this.attr('stop-color', o.color)
    if (o.offset != null) this.attr('offset', new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__["default"](o.offset))

    return this
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_3__.registerMethods)({
  Gradient: {
    // Add a color stop
    stop: function (offset, color, opacity) {
      return this.put(new Stop()).update(offset, color, opacity)
    }
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Stop, 'Stop')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Style.js":
/*!*************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Style.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Style)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _Element_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");





function cssRule(selector, rule) {
  if (!selector) return ''
  if (!rule) return selector

  let ret = selector + '{'

  for (const i in rule) {
    ret += (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.unCamelCase)(i) + ':' + rule[i] + ';'
  }

  ret += '}'

  return ret
}

class Style extends _Element_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('style', node), attrs)
  }

  addText(w = '') {
    this.node.textContent += w
    return this
  }

  font(name, src, params = {}) {
    return this.rule('@font-face', {
      fontFamily: name,
      src: src,
      ...params
    })
  }

  rule(selector, obj) {
    return this.addText(cssRule(selector, obj))
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)('Dom', {
  style(selector, obj) {
    return this.put(new Style()).rule(selector, obj)
  },
  fontface(name, src, params) {
    return this.put(new Style()).font(name, src, params)
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Style, 'Style')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Svg.js":
/*!***********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Svg.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Svg)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _Defs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Defs.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Defs.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");







class Svg extends _Container_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('svg', node), attrs)
    this.namespace()
  }

  // Creates and returns defs element
  defs() {
    if (!this.isRoot()) return this.root().defs()

    return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(this.node.querySelector('defs')) || this.put(new _Defs_js__WEBPACK_IMPORTED_MODULE_4__["default"]())
  }

  isRoot() {
    return (
      !this.node.parentNode ||
      (!(this.node.parentNode instanceof _utils_window_js__WEBPACK_IMPORTED_MODULE_5__.globals.window.SVGElement) &&
        this.node.parentNode.nodeName !== '#document-fragment')
    )
  }

  // Add namespaces
  namespace() {
    if (!this.isRoot()) return this.root().namespace()
    return this.attr({ xmlns: _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_1__.svg, version: '1.1' }).attr(
      'xmlns:xlink',
      _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_1__.xlink,
      _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_1__.xmlns
    )
  }

  removeNamespace() {
    return this.attr({ xmlns: null, version: null })
      .attr('xmlns:xlink', null, _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_1__.xmlns)
      .attr('xmlns:svgjs', null, _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_1__.xmlns)
  }

  // Check if this is a root svg
  // If not, call root() from this element
  root() {
    if (this.isRoot()) return this
    return super.root()
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_2__.registerMethods)({
  Container: {
    // Create nested svg document
    nested: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function () {
      return this.put(new Svg())
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Svg, 'Svg', true)


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Symbol.js":
/*!**************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Symbol.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Symbol)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Container_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");




class Symbol extends _Container_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('symbol', node), attrs)
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    symbol: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function () {
      return this.put(new Symbol())
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Symbol, 'Symbol')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Text.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Text.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Text)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _modules_core_textable_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/core/textable.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/textable.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");








class Text extends _Shape_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('text', node), attrs)

    this.dom.leading = this.dom.leading ?? new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__["default"](1.3) // store leading value for rebuilding
    this._rebuild = true // enable automatic updating of dy values
    this._build = false // disable build mode for adding multiple lines
  }

  // Set / get leading
  leading(value) {
    // act as getter
    if (value == null) {
      return this.dom.leading
    }

    // act as setter
    this.dom.leading = new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__["default"](value)

    return this.rebuild()
  }

  // Rebuild appearance type
  rebuild(rebuild) {
    // store new rebuild flag if given
    if (typeof rebuild === 'boolean') {
      this._rebuild = rebuild
    }

    // define position of all lines
    if (this._rebuild) {
      const self = this
      let blankLineOffset = 0
      const leading = this.dom.leading

      this.each(function (i) {
        if ((0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_6__.isDescriptive)(this.node)) return

        const fontSize = _utils_window_js__WEBPACK_IMPORTED_MODULE_4__.globals.window
          .getComputedStyle(this.node)
          .getPropertyValue('font-size')

        const dy = leading * new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__["default"](fontSize)

        if (this.dom.newLined) {
          this.attr('x', self.attr('x'))

          if (this.text() === '\n') {
            blankLineOffset += dy
          } else {
            this.attr('dy', i ? dy + blankLineOffset : 0)
            blankLineOffset = 0
          }
        }
      })

      this.fire('rebuild')
    }

    return this
  }

  // overwrite method from parent to set data properly
  setData(o) {
    this.dom = o
    this.dom.leading = new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_2__["default"](o.leading || 1.3)
    return this
  }

  writeDataToDom() {
    (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_6__.writeDataToDom)(this, this.dom, { leading: 1.3 })
    return this
  }

  // Set the text content
  text(text) {
    // act as getter
    if (text === undefined) {
      const children = this.node.childNodes
      let firstLine = 0
      text = ''

      for (let i = 0, len = children.length; i < len; ++i) {
        // skip textPaths - they are no lines
        if (children[i].nodeName === 'textPath' || (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_6__.isDescriptive)(children[i])) {
          if (i === 0) firstLine = i + 1
          continue
        }

        // add newline if its not the first child and newLined is set to true
        if (
          i !== firstLine &&
          children[i].nodeType !== 3 &&
          (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(children[i]).dom.newLined === true
        ) {
          text += '\n'
        }

        // add content of this node
        text += children[i].textContent
      }

      return text
    }

    // remove existing content
    this.clear().build(true)

    if (typeof text === 'function') {
      // call block
      text.call(this, this)
    } else {
      // store text and make sure text is not blank
      text = (text + '').split('\n')

      // build new lines
      for (let j = 0, jl = text.length; j < jl; j++) {
        this.newLine(text[j])
      }
    }

    // disable build mode and rebuild lines
    return this.build(false).rebuild()
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Text, _modules_core_textable_js__WEBPACK_IMPORTED_MODULE_5__)

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create text element
    text: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (text = '') {
      return this.put(new Text()).text(text)
    }),

    // Create plain text element
    plain: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (text = '') {
      return this.put(new Text()).plain(text)
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Text, 'Text')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/TextPath.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/TextPath.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextPath)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _Path_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Path.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Path.js");
/* harmony import */ var _types_PathArray_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../types/PathArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PathArray.js");
/* harmony import */ var _Text_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Text.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Text.js");
/* harmony import */ var _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../modules/core/selector.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js");








class TextPath extends _Text_js__WEBPACK_IMPORTED_MODULE_5__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('textPath', node), attrs)
  }

  // return the array of the path track element
  array() {
    const track = this.track()

    return track ? track.array() : null
  }

  // Plot path if any
  plot(d) {
    const track = this.track()
    let pathArray = null

    if (track) {
      pathArray = track.plot(d)
    }

    return d == null ? pathArray : this
  }

  // Get the path element
  track() {
    return this.reference('href')
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    textPath: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (text, path) {
      // Convert text to instance if needed
      if (!(text instanceof _Text_js__WEBPACK_IMPORTED_MODULE_5__["default"])) {
        text = this.text(text)
      }

      return text.path(path)
    })
  },
  Text: {
    // Create path for text to run on
    path: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (track, importNodes = true) {
      const textPath = new TextPath()

      // if track is a path, reuse it
      if (!(track instanceof _Path_js__WEBPACK_IMPORTED_MODULE_3__["default"])) {
        // create path element
        track = this.defs().path(track)
      }

      // link textPath to path and add content
      textPath.attr('href', '#' + track, _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__.xlink)

      // Transplant all nodes from text to textPath
      let node
      if (importNodes) {
        while ((node = this.node.firstChild)) {
          textPath.node.appendChild(node)
        }
      }

      // add textPath element as child node and return textPath
      return this.put(textPath)
    }),

    // Get the textPath children
    textPath() {
      return this.findOne('textPath')
    }
  },
  Path: {
    // creates a textPath from this path
    text: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (text) {
      // Convert text to instance if needed
      if (!(text instanceof _Text_js__WEBPACK_IMPORTED_MODULE_5__["default"])) {
        text = new _Text_js__WEBPACK_IMPORTED_MODULE_5__["default"]().addTo(this.parent()).text(text)
      }

      // Create textPath from text and path and return
      return text.path(this)
    }),

    targets() {
      return (0,_modules_core_selector_js__WEBPACK_IMPORTED_MODULE_6__["default"])('svg textPath').filter((node) => {
        return (node.attr('href') || '').includes(this.id())
      })

      // Does not work in IE11. Use when IE support is dropped
      // return baseFind('svg textPath[*|href*=' + this.id() + ']')
    }
  }
})

TextPath.prototype.MorphArray = _types_PathArray_js__WEBPACK_IMPORTED_MODULE_4__["default"]
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(TextPath, 'TextPath')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Tspan.js":
/*!*************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Tspan.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Tspan)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _Text_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Text.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Text.js");
/* harmony import */ var _modules_core_textable_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../modules/core/textable.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/textable.js");








class Tspan extends _Shape_js__WEBPACK_IMPORTED_MODULE_4__["default"] {
  // Initialize node
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('tspan', node), attrs)
    this._build = false // disable build mode for adding multiple lines
  }

  // Shortcut dx
  dx(dx) {
    return this.attr('dx', dx)
  }

  // Shortcut dy
  dy(dy) {
    return this.attr('dy', dy)
  }

  // Create new line
  newLine() {
    // mark new line
    this.dom.newLined = true

    // fetch parent
    const text = this.parent()

    // early return in case we are not in a text element
    if (!(text instanceof _Text_js__WEBPACK_IMPORTED_MODULE_5__["default"])) {
      return this
    }

    const i = text.index(this)

    const fontSize = _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.window
      .getComputedStyle(this.node)
      .getPropertyValue('font-size')
    const dy = text.dom.leading * new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_3__["default"](fontSize)

    // apply new position
    return this.dy(i ? dy : 0).attr('x', text.x())
  }

  // Set text content
  text(text) {
    if (text == null)
      return this.node.textContent + (this.dom.newLined ? '\n' : '')

    if (typeof text === 'function') {
      this.clear().build(true)
      text.call(this, this)
      this.build(false)
    } else {
      this.plain(text)
    }

    return this
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Tspan, _modules_core_textable_js__WEBPACK_IMPORTED_MODULE_6__)

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_2__.registerMethods)({
  Tspan: {
    tspan: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (text = '') {
      const tspan = new Tspan()

      // clear if build mode is disabled
      if (!this._build) {
        this.clear()
      }

      // add new tspan
      return this.put(tspan).text(text)
    })
  },
  Text: {
    newLine: function (text = '') {
      return this.tspan(text).newLine()
    }
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Tspan, 'Tspan')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/elements/Use.js":
/*!***********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/elements/Use.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Use)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _Shape_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");





class Use extends _Shape_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(node, attrs = node) {
    super((0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.nodeOrNew)('use', node), attrs)
  }

  // Use element as a reference
  use(element, file) {
    // Set lined element
    return this.attr('href', (file || '') + '#' + element, _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__.xlink)
  }
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)({
  Container: {
    // Create a use element
    use: (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.wrapWithAttrCheck)(function (element, file) {
      return this.put(new Use()).use(element, file)
    })
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.register)(Use, 'Use')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/main.js":
/*!***************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/main.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* reexport safe */ _elements_A_js__WEBPACK_IMPORTED_MODULE_57__["default"]),
/* harmony export */   Animator: () => (/* reexport safe */ _animation_Animator_js__WEBPACK_IMPORTED_MODULE_49__["default"]),
/* harmony export */   Array: () => (/* reexport safe */ _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_34__["default"]),
/* harmony export */   Box: () => (/* reexport safe */ _types_Box_js__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   Circle: () => (/* reexport safe */ _elements_Circle_js__WEBPACK_IMPORTED_MODULE_53__["default"]),
/* harmony export */   ClipPath: () => (/* reexport safe */ _elements_ClipPath_js__WEBPACK_IMPORTED_MODULE_54__["default"]),
/* harmony export */   Color: () => (/* reexport safe */ _types_Color_js__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   Container: () => (/* reexport safe */ _elements_Container_js__WEBPACK_IMPORTED_MODULE_11__["default"]),
/* harmony export */   Controller: () => (/* reexport safe */ _animation_Controller_js__WEBPACK_IMPORTED_MODULE_50__.Controller),
/* harmony export */   Defs: () => (/* reexport safe */ _elements_Defs_js__WEBPACK_IMPORTED_MODULE_12__["default"]),
/* harmony export */   Dom: () => (/* reexport safe */ _elements_Dom_js__WEBPACK_IMPORTED_MODULE_13__["default"]),
/* harmony export */   Ease: () => (/* reexport safe */ _animation_Controller_js__WEBPACK_IMPORTED_MODULE_50__.Ease),
/* harmony export */   Element: () => (/* reexport safe */ _elements_Element_js__WEBPACK_IMPORTED_MODULE_14__["default"]),
/* harmony export */   Ellipse: () => (/* reexport safe */ _elements_Ellipse_js__WEBPACK_IMPORTED_MODULE_15__["default"]),
/* harmony export */   EventTarget: () => (/* reexport safe */ _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_16__["default"]),
/* harmony export */   ForeignObject: () => (/* reexport safe */ _elements_ForeignObject_js__WEBPACK_IMPORTED_MODULE_55__["default"]),
/* harmony export */   Fragment: () => (/* reexport safe */ _elements_Fragment_js__WEBPACK_IMPORTED_MODULE_17__["default"]),
/* harmony export */   G: () => (/* reexport safe */ _elements_G_js__WEBPACK_IMPORTED_MODULE_56__["default"]),
/* harmony export */   Gradient: () => (/* reexport safe */ _elements_Gradient_js__WEBPACK_IMPORTED_MODULE_18__["default"]),
/* harmony export */   Image: () => (/* reexport safe */ _elements_Image_js__WEBPACK_IMPORTED_MODULE_19__["default"]),
/* harmony export */   Line: () => (/* reexport safe */ _elements_Line_js__WEBPACK_IMPORTED_MODULE_20__["default"]),
/* harmony export */   List: () => (/* reexport safe */ _types_List_js__WEBPACK_IMPORTED_MODULE_21__["default"]),
/* harmony export */   Marker: () => (/* reexport safe */ _elements_Marker_js__WEBPACK_IMPORTED_MODULE_22__["default"]),
/* harmony export */   Mask: () => (/* reexport safe */ _elements_Mask_js__WEBPACK_IMPORTED_MODULE_58__["default"]),
/* harmony export */   Matrix: () => (/* reexport safe */ _types_Matrix_js__WEBPACK_IMPORTED_MODULE_23__["default"]),
/* harmony export */   Morphable: () => (/* reexport safe */ _animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__["default"]),
/* harmony export */   NonMorphable: () => (/* reexport safe */ _animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__.NonMorphable),
/* harmony export */   Number: () => (/* reexport safe */ _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_35__["default"]),
/* harmony export */   ObjectBag: () => (/* reexport safe */ _animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__.ObjectBag),
/* harmony export */   PID: () => (/* reexport safe */ _animation_Controller_js__WEBPACK_IMPORTED_MODULE_50__.PID),
/* harmony export */   Path: () => (/* reexport safe */ _elements_Path_js__WEBPACK_IMPORTED_MODULE_25__["default"]),
/* harmony export */   PathArray: () => (/* reexport safe */ _types_PathArray_js__WEBPACK_IMPORTED_MODULE_26__["default"]),
/* harmony export */   Pattern: () => (/* reexport safe */ _elements_Pattern_js__WEBPACK_IMPORTED_MODULE_27__["default"]),
/* harmony export */   Point: () => (/* reexport safe */ _types_Point_js__WEBPACK_IMPORTED_MODULE_29__["default"]),
/* harmony export */   PointArray: () => (/* reexport safe */ _types_PointArray_js__WEBPACK_IMPORTED_MODULE_28__["default"]),
/* harmony export */   Polygon: () => (/* reexport safe */ _elements_Polygon_js__WEBPACK_IMPORTED_MODULE_30__["default"]),
/* harmony export */   Polyline: () => (/* reexport safe */ _elements_Polyline_js__WEBPACK_IMPORTED_MODULE_31__["default"]),
/* harmony export */   Queue: () => (/* reexport safe */ _animation_Queue_js__WEBPACK_IMPORTED_MODULE_51__["default"]),
/* harmony export */   Rect: () => (/* reexport safe */ _elements_Rect_js__WEBPACK_IMPORTED_MODULE_32__["default"]),
/* harmony export */   Runner: () => (/* reexport safe */ _animation_Runner_js__WEBPACK_IMPORTED_MODULE_33__["default"]),
/* harmony export */   SVG: () => (/* binding */ SVG),
/* harmony export */   Shape: () => (/* reexport safe */ _elements_Shape_js__WEBPACK_IMPORTED_MODULE_36__["default"]),
/* harmony export */   Spring: () => (/* reexport safe */ _animation_Controller_js__WEBPACK_IMPORTED_MODULE_50__.Spring),
/* harmony export */   Stop: () => (/* reexport safe */ _elements_Stop_js__WEBPACK_IMPORTED_MODULE_59__["default"]),
/* harmony export */   Style: () => (/* reexport safe */ _elements_Style_js__WEBPACK_IMPORTED_MODULE_60__["default"]),
/* harmony export */   Svg: () => (/* reexport safe */ _elements_Svg_js__WEBPACK_IMPORTED_MODULE_37__["default"]),
/* harmony export */   Symbol: () => (/* reexport safe */ _elements_Symbol_js__WEBPACK_IMPORTED_MODULE_38__["default"]),
/* harmony export */   Text: () => (/* reexport safe */ _elements_Text_js__WEBPACK_IMPORTED_MODULE_39__["default"]),
/* harmony export */   TextPath: () => (/* reexport safe */ _elements_TextPath_js__WEBPACK_IMPORTED_MODULE_61__["default"]),
/* harmony export */   Timeline: () => (/* reexport safe */ _animation_Timeline_js__WEBPACK_IMPORTED_MODULE_52__["default"]),
/* harmony export */   TransformBag: () => (/* reexport safe */ _animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__.TransformBag),
/* harmony export */   Tspan: () => (/* reexport safe */ _elements_Tspan_js__WEBPACK_IMPORTED_MODULE_40__["default"]),
/* harmony export */   Use: () => (/* reexport safe */ _elements_Use_js__WEBPACK_IMPORTED_MODULE_62__["default"]),
/* harmony export */   adopt: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.adopt),
/* harmony export */   assignNewId: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.assignNewId),
/* harmony export */   clearEvents: () => (/* reexport safe */ _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__.clearEvents),
/* harmony export */   create: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.create),
/* harmony export */   defaults: () => (/* reexport module object */ _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_41__),
/* harmony export */   dispatch: () => (/* reexport safe */ _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__.dispatch),
/* harmony export */   easing: () => (/* reexport safe */ _animation_Controller_js__WEBPACK_IMPORTED_MODULE_50__.easing),
/* harmony export */   eid: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.eid),
/* harmony export */   extend: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend),
/* harmony export */   find: () => (/* reexport safe */ _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_46__["default"]),
/* harmony export */   getClass: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.getClass),
/* harmony export */   getEventTarget: () => (/* reexport safe */ _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__.getEventTarget),
/* harmony export */   getEvents: () => (/* reexport safe */ _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__.getEvents),
/* harmony export */   getWindow: () => (/* reexport safe */ _utils_window_js__WEBPACK_IMPORTED_MODULE_48__.getWindow),
/* harmony export */   makeInstance: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.makeInstance),
/* harmony export */   makeMorphable: () => (/* reexport safe */ _animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__.makeMorphable),
/* harmony export */   mockAdopt: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.mockAdopt),
/* harmony export */   namespaces: () => (/* reexport module object */ _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_43__),
/* harmony export */   nodeOrNew: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.nodeOrNew),
/* harmony export */   off: () => (/* reexport safe */ _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__.off),
/* harmony export */   on: () => (/* reexport safe */ _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__.on),
/* harmony export */   parser: () => (/* reexport safe */ _modules_core_parser_js__WEBPACK_IMPORTED_MODULE_45__["default"]),
/* harmony export */   regex: () => (/* reexport module object */ _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_44__),
/* harmony export */   register: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.register),
/* harmony export */   registerMorphableType: () => (/* reexport safe */ _animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__.registerMorphableType),
/* harmony export */   registerWindow: () => (/* reexport safe */ _utils_window_js__WEBPACK_IMPORTED_MODULE_48__.registerWindow),
/* harmony export */   restoreWindow: () => (/* reexport safe */ _utils_window_js__WEBPACK_IMPORTED_MODULE_48__.restoreWindow),
/* harmony export */   root: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.root),
/* harmony export */   saveWindow: () => (/* reexport safe */ _utils_window_js__WEBPACK_IMPORTED_MODULE_48__.saveWindow),
/* harmony export */   utils: () => (/* reexport module object */ _utils_utils_js__WEBPACK_IMPORTED_MODULE_42__),
/* harmony export */   windowEvents: () => (/* reexport safe */ _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__.windowEvents),
/* harmony export */   withWindow: () => (/* reexport safe */ _utils_window_js__WEBPACK_IMPORTED_MODULE_48__.withWindow),
/* harmony export */   wrapWithAttrCheck: () => (/* reexport safe */ _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.wrapWithAttrCheck)
/* harmony export */ });
/* harmony import */ var _modules_optional_arrange_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/optional/arrange.js */ "./node_modules/@svgdotjs/svg.js/src/modules/optional/arrange.js");
/* harmony import */ var _modules_optional_class_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/optional/class.js */ "./node_modules/@svgdotjs/svg.js/src/modules/optional/class.js");
/* harmony import */ var _modules_optional_css_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/optional/css.js */ "./node_modules/@svgdotjs/svg.js/src/modules/optional/css.js");
/* harmony import */ var _modules_optional_data_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/optional/data.js */ "./node_modules/@svgdotjs/svg.js/src/modules/optional/data.js");
/* harmony import */ var _modules_optional_memory_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/optional/memory.js */ "./node_modules/@svgdotjs/svg.js/src/modules/optional/memory.js");
/* harmony import */ var _modules_optional_sugar_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/optional/sugar.js */ "./node_modules/@svgdotjs/svg.js/src/modules/optional/sugar.js");
/* harmony import */ var _modules_optional_transform_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/optional/transform.js */ "./node_modules/@svgdotjs/svg.js/src/modules/optional/transform.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_Box_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./types/Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _types_Color_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./types/Color.js */ "./node_modules/@svgdotjs/svg.js/src/types/Color.js");
/* harmony import */ var _elements_Container_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./elements/Container.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Container.js");
/* harmony import */ var _elements_Defs_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./elements/Defs.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Defs.js");
/* harmony import */ var _elements_Dom_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./elements/Dom.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Dom.js");
/* harmony import */ var _elements_Element_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./elements/Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");
/* harmony import */ var _elements_Ellipse_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./elements/Ellipse.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Ellipse.js");
/* harmony import */ var _types_EventTarget_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./types/EventTarget.js */ "./node_modules/@svgdotjs/svg.js/src/types/EventTarget.js");
/* harmony import */ var _elements_Fragment_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./elements/Fragment.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Fragment.js");
/* harmony import */ var _elements_Gradient_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./elements/Gradient.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Gradient.js");
/* harmony import */ var _elements_Image_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./elements/Image.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Image.js");
/* harmony import */ var _elements_Line_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./elements/Line.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Line.js");
/* harmony import */ var _types_List_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./types/List.js */ "./node_modules/@svgdotjs/svg.js/src/types/List.js");
/* harmony import */ var _elements_Marker_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./elements/Marker.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Marker.js");
/* harmony import */ var _types_Matrix_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./types/Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");
/* harmony import */ var _animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./animation/Morphable.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Morphable.js");
/* harmony import */ var _elements_Path_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./elements/Path.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Path.js");
/* harmony import */ var _types_PathArray_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./types/PathArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PathArray.js");
/* harmony import */ var _elements_Pattern_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./elements/Pattern.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Pattern.js");
/* harmony import */ var _types_PointArray_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./types/PointArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PointArray.js");
/* harmony import */ var _types_Point_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./types/Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");
/* harmony import */ var _elements_Polygon_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./elements/Polygon.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Polygon.js");
/* harmony import */ var _elements_Polyline_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./elements/Polyline.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Polyline.js");
/* harmony import */ var _elements_Rect_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./elements/Rect.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Rect.js");
/* harmony import */ var _animation_Runner_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./animation/Runner.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Runner.js");
/* harmony import */ var _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./types/SVGArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGArray.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");
/* harmony import */ var _elements_Shape_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./elements/Shape.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Shape.js");
/* harmony import */ var _elements_Svg_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./elements/Svg.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Svg.js");
/* harmony import */ var _elements_Symbol_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./elements/Symbol.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Symbol.js");
/* harmony import */ var _elements_Text_js__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./elements/Text.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Text.js");
/* harmony import */ var _elements_Tspan_js__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./elements/Tspan.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Tspan.js");
/* harmony import */ var _modules_core_defaults_js__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./modules/core/defaults.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/defaults.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _modules_core_parser_js__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./modules/core/parser.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/parser.js");
/* harmony import */ var _modules_core_selector_js__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./modules/core/selector.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js");
/* harmony import */ var _modules_core_event_js__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./modules/core/event.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/event.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _animation_Animator_js__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./animation/Animator.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Animator.js");
/* harmony import */ var _animation_Controller_js__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./animation/Controller.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Controller.js");
/* harmony import */ var _animation_Queue_js__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./animation/Queue.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Queue.js");
/* harmony import */ var _animation_Timeline_js__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ./animation/Timeline.js */ "./node_modules/@svgdotjs/svg.js/src/animation/Timeline.js");
/* harmony import */ var _elements_Circle_js__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! ./elements/Circle.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Circle.js");
/* harmony import */ var _elements_ClipPath_js__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! ./elements/ClipPath.js */ "./node_modules/@svgdotjs/svg.js/src/elements/ClipPath.js");
/* harmony import */ var _elements_ForeignObject_js__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! ./elements/ForeignObject.js */ "./node_modules/@svgdotjs/svg.js/src/elements/ForeignObject.js");
/* harmony import */ var _elements_G_js__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! ./elements/G.js */ "./node_modules/@svgdotjs/svg.js/src/elements/G.js");
/* harmony import */ var _elements_A_js__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! ./elements/A.js */ "./node_modules/@svgdotjs/svg.js/src/elements/A.js");
/* harmony import */ var _elements_Mask_js__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! ./elements/Mask.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Mask.js");
/* harmony import */ var _elements_Stop_js__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! ./elements/Stop.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Stop.js");
/* harmony import */ var _elements_Style_js__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! ./elements/Style.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Style.js");
/* harmony import */ var _elements_TextPath_js__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! ./elements/TextPath.js */ "./node_modules/@svgdotjs/svg.js/src/elements/TextPath.js");
/* harmony import */ var _elements_Use_js__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! ./elements/Use.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Use.js");
/* Optional Modules */


















































const SVG = _utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.makeInstance






/* Animation Modules */






/* Types */











/* Elements */































;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)([_elements_Svg_js__WEBPACK_IMPORTED_MODULE_37__["default"], _elements_Symbol_js__WEBPACK_IMPORTED_MODULE_38__["default"], _elements_Image_js__WEBPACK_IMPORTED_MODULE_19__["default"], _elements_Pattern_js__WEBPACK_IMPORTED_MODULE_27__["default"], _elements_Marker_js__WEBPACK_IMPORTED_MODULE_22__["default"]], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('viewbox'))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)([_elements_Line_js__WEBPACK_IMPORTED_MODULE_20__["default"], _elements_Polyline_js__WEBPACK_IMPORTED_MODULE_31__["default"], _elements_Polygon_js__WEBPACK_IMPORTED_MODULE_30__["default"], _elements_Path_js__WEBPACK_IMPORTED_MODULE_25__["default"]], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('marker'))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_elements_Text_js__WEBPACK_IMPORTED_MODULE_39__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Text'))
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_elements_Path_js__WEBPACK_IMPORTED_MODULE_25__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Path'))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_elements_Defs_js__WEBPACK_IMPORTED_MODULE_12__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Defs'))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)([_elements_Text_js__WEBPACK_IMPORTED_MODULE_39__["default"], _elements_Tspan_js__WEBPACK_IMPORTED_MODULE_40__["default"]], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Tspan'))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)([_elements_Rect_js__WEBPACK_IMPORTED_MODULE_32__["default"], _elements_Ellipse_js__WEBPACK_IMPORTED_MODULE_15__["default"], _elements_Gradient_js__WEBPACK_IMPORTED_MODULE_18__["default"], _animation_Runner_js__WEBPACK_IMPORTED_MODULE_33__["default"]], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('radius'))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_types_EventTarget_js__WEBPACK_IMPORTED_MODULE_16__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('EventTarget'))
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_elements_Dom_js__WEBPACK_IMPORTED_MODULE_13__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Dom'))
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_elements_Element_js__WEBPACK_IMPORTED_MODULE_14__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Element'))
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_elements_Shape_js__WEBPACK_IMPORTED_MODULE_36__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Shape'))
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)([_elements_Container_js__WEBPACK_IMPORTED_MODULE_11__["default"], _elements_Fragment_js__WEBPACK_IMPORTED_MODULE_17__["default"]], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Container'))
;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_elements_Gradient_js__WEBPACK_IMPORTED_MODULE_18__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Gradient'))

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_7__.extend)(_animation_Runner_js__WEBPACK_IMPORTED_MODULE_33__["default"], (0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodsFor)('Runner'))

_types_List_js__WEBPACK_IMPORTED_MODULE_21__["default"].extend((0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_8__.getMethodNames)())

;(0,_animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__.registerMorphableType)([
  _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_35__["default"],
  _types_Color_js__WEBPACK_IMPORTED_MODULE_10__["default"],
  _types_Box_js__WEBPACK_IMPORTED_MODULE_9__["default"],
  _types_Matrix_js__WEBPACK_IMPORTED_MODULE_23__["default"],
  _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_34__["default"],
  _types_PointArray_js__WEBPACK_IMPORTED_MODULE_28__["default"],
  _types_PathArray_js__WEBPACK_IMPORTED_MODULE_26__["default"],
  _types_Point_js__WEBPACK_IMPORTED_MODULE_29__["default"]
])

;(0,_animation_Morphable_js__WEBPACK_IMPORTED_MODULE_24__.makeMorphable)()


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/attr.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/attr.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ attr),
/* harmony export */   registerAttrHook: () => (/* binding */ registerAttrHook)
/* harmony export */ });
/* harmony import */ var _defaults_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./defaults.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/defaults.js");
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _types_Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../types/Color.js */ "./node_modules/@svgdotjs/svg.js/src/types/Color.js");
/* harmony import */ var _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../types/SVGArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGArray.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");






const colorAttributes = new Set([
  'fill',
  'stroke',
  'color',
  'bgcolor',
  'stop-color',
  'flood-color',
  'lighting-color'
])

const hooks = []
function registerAttrHook(fn) {
  hooks.push(fn)
}

// Set svg element attribute
function attr(attr, val, ns) {
  // act as full getter
  if (attr == null) {
    // get an object of attributes
    attr = {}
    val = this.node.attributes

    for (const node of val) {
      attr[node.nodeName] = _regex_js__WEBPACK_IMPORTED_MODULE_1__.isNumber.test(node.nodeValue)
        ? parseFloat(node.nodeValue)
        : node.nodeValue
    }

    return attr
  } else if (attr instanceof Array) {
    // loop through array and get all values
    return attr.reduce((last, curr) => {
      last[curr] = this.attr(curr)
      return last
    }, {})
  } else if (typeof attr === 'object' && attr.constructor === Object) {
    // apply every attribute individually if an object is passed
    for (val in attr) this.attr(val, attr[val])
  } else if (val === null) {
    // remove value
    this.node.removeAttribute(attr)
  } else if (val == null) {
    // act as a getter if the first and only argument is not an object
    val = this.node.getAttribute(attr)
    return val == null
      ? _defaults_js__WEBPACK_IMPORTED_MODULE_0__.attrs[attr]
      : _regex_js__WEBPACK_IMPORTED_MODULE_1__.isNumber.test(val)
        ? parseFloat(val)
        : val
  } else {
    // Loop through hooks and execute them to convert value
    val = hooks.reduce((_val, hook) => {
      return hook(attr, _val, this)
    }, val)

    // ensure correct numeric values (also accepts NaN and Infinity)
    if (typeof val === 'number') {
      val = new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_4__["default"](val)
    } else if (colorAttributes.has(attr) && _types_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].isColor(val)) {
      // ensure full hex color
      val = new _types_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](val)
    } else if (val.constructor === Array) {
      // Check for plain arrays and parse array values
      val = new _types_SVGArray_js__WEBPACK_IMPORTED_MODULE_3__["default"](val)
    }

    // if the passed attribute is leading...
    if (attr === 'leading') {
      // ... call the leading method instead
      if (this.leading) {
        this.leading(val)
      }
    } else {
      // set given attribute on node
      typeof ns === 'string'
        ? this.node.setAttributeNS(ns, attr, val.toString())
        : this.node.setAttribute(attr, val.toString())
    }

    // rebuild if required
    if (this.rebuild && (attr === 'font-size' || attr === 'x')) {
      this.rebuild()
    }
  }

  return this
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/circled.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/circled.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cx: () => (/* binding */ cx),
/* harmony export */   cy: () => (/* binding */ cy),
/* harmony export */   height: () => (/* binding */ height),
/* harmony export */   rx: () => (/* binding */ rx),
/* harmony export */   ry: () => (/* binding */ ry),
/* harmony export */   width: () => (/* binding */ width),
/* harmony export */   x: () => (/* binding */ x),
/* harmony export */   y: () => (/* binding */ y)
/* harmony export */ });
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");


// Radius x value
function rx(rx) {
  return this.attr('rx', rx)
}

// Radius y value
function ry(ry) {
  return this.attr('ry', ry)
}

// Move over x-axis
function x(x) {
  return x == null ? this.cx() - this.rx() : this.cx(x + this.rx())
}

// Move over y-axis
function y(y) {
  return y == null ? this.cy() - this.ry() : this.cy(y + this.ry())
}

// Move by center over x-axis
function cx(x) {
  return this.attr('cx', x)
}

// Move by center over y-axis
function cy(y) {
  return this.attr('cy', y)
}

// Set width of element
function width(width) {
  return width == null ? this.rx() * 2 : this.rx(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](width).divide(2))
}

// Set height of element
function height(height) {
  return height == null
    ? this.ry() * 2
    : this.ry(new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](height).divide(2))
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/containerGeometry.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/containerGeometry.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dmove: () => (/* binding */ dmove),
/* harmony export */   dx: () => (/* binding */ dx),
/* harmony export */   dy: () => (/* binding */ dy),
/* harmony export */   height: () => (/* binding */ height),
/* harmony export */   move: () => (/* binding */ move),
/* harmony export */   size: () => (/* binding */ size),
/* harmony export */   width: () => (/* binding */ width),
/* harmony export */   x: () => (/* binding */ x),
/* harmony export */   y: () => (/* binding */ y)
/* harmony export */ });
/* harmony import */ var _types_Matrix_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");
/* harmony import */ var _types_Point_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../types/Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");
/* harmony import */ var _types_Box_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../types/Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");






function dmove(dx, dy) {
  this.children().forEach((child) => {
    let bbox

    // We have to wrap this for elements that dont have a bbox
    // e.g. title and other descriptive elements
    try {
      // Get the childs bbox
      // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1905039
      // Because bbox for nested svgs returns the contents bbox in the coordinate space of the svg itself (weird!), we cant use bbox for svgs
      // Therefore we have to use getBoundingClientRect. But THAT is broken (as explained in the bug).
      // Funnily enough the broken behavior would work for us but that breaks it in chrome
      // So we have to replicate the broken behavior of FF by just reading the attributes of the svg itself
      bbox =
        child.node instanceof (0,_utils_window_js__WEBPACK_IMPORTED_MODULE_4__.getWindow)().SVGSVGElement
          ? new _types_Box_js__WEBPACK_IMPORTED_MODULE_2__["default"](child.attr(['x', 'y', 'width', 'height']))
          : child.bbox()
    } catch (e) {
      return
    }

    // Get childs matrix
    const m = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_0__["default"](child)
    // Translate childs matrix by amount and
    // transform it back into parents space
    const matrix = m.translate(dx, dy).transform(m.inverse())
    // Calculate new x and y from old box
    const p = new _types_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"](bbox.x, bbox.y).transform(matrix)
    // Move element
    child.move(p.x, p.y)
  })

  return this
}

function dx(dx) {
  return this.dmove(dx, 0)
}

function dy(dy) {
  return this.dmove(0, dy)
}

function height(height, box = this.bbox()) {
  if (height == null) return box.height
  return this.size(box.width, height, box)
}

function move(x = 0, y = 0, box = this.bbox()) {
  const dx = x - box.x
  const dy = y - box.y

  return this.dmove(dx, dy)
}

function size(width, height, box = this.bbox()) {
  const p = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.proportionalSize)(this, width, height, box)
  const scaleX = p.width / box.width
  const scaleY = p.height / box.height

  this.children().forEach((child) => {
    const o = new _types_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"](box).transform(new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_0__["default"](child).inverse())
    child.scale(scaleX, scaleY, o.x, o.y)
  })

  return this
}

function width(width, box = this.bbox()) {
  if (width == null) return box.width
  return this.size(width, box.height, box)
}

function x(x, box = this.bbox()) {
  if (x == null) return box.x
  return this.move(x, box.y, box)
}

function y(y, box = this.bbox()) {
  if (y == null) return box.y
  return this.move(box.x, y, box)
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/defaults.js":
/*!********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/defaults.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   attrs: () => (/* binding */ attrs),
/* harmony export */   noop: () => (/* binding */ noop),
/* harmony export */   timeline: () => (/* binding */ timeline)
/* harmony export */ });
function noop() {}

// Default animation values
const timeline = {
  duration: 400,
  ease: '>',
  delay: 0
}

// Default attribute values
const attrs = {
  // fill and stroke
  'fill-opacity': 1,
  'stroke-opacity': 1,
  'stroke-width': 0,
  'stroke-linejoin': 'miter',
  'stroke-linecap': 'butt',
  fill: '#000000',
  stroke: '#000000',
  opacity: 1,

  // position
  x: 0,
  y: 0,
  cx: 0,
  cy: 0,

  // size
  width: 0,
  height: 0,

  // radius
  r: 0,
  rx: 0,
  ry: 0,

  // gradient
  offset: 0,
  'stop-opacity': 1,
  'stop-color': '#000000',

  // text
  'text-anchor': 'start'
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/event.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/event.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearEvents: () => (/* binding */ clearEvents),
/* harmony export */   dispatch: () => (/* binding */ dispatch),
/* harmony export */   getEventTarget: () => (/* binding */ getEventTarget),
/* harmony export */   getEvents: () => (/* binding */ getEvents),
/* harmony export */   off: () => (/* binding */ off),
/* harmony export */   on: () => (/* binding */ on),
/* harmony export */   windowEvents: () => (/* binding */ windowEvents)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");




let listenerId = 0
const windowEvents = {}

function getEvents(instance) {
  let n = instance.getEventHolder()

  // We dont want to save events in global space
  if (n === _utils_window_js__WEBPACK_IMPORTED_MODULE_2__.globals.window) n = windowEvents
  if (!n.events) n.events = {}
  return n.events
}

function getEventTarget(instance) {
  return instance.getEventTarget()
}

function clearEvents(instance) {
  let n = instance.getEventHolder()
  if (n === _utils_window_js__WEBPACK_IMPORTED_MODULE_2__.globals.window) n = windowEvents
  if (n.events) n.events = {}
}

// Add event binder in the SVG namespace
function on(node, events, listener, binding, options) {
  const l = listener.bind(binding || node)
  const instance = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.makeInstance)(node)
  const bag = getEvents(instance)
  const n = getEventTarget(instance)

  // events can be an array of events or a string of events
  events = Array.isArray(events) ? events : events.split(_regex_js__WEBPACK_IMPORTED_MODULE_0__.delimiter)

  // add id to listener
  if (!listener._svgjsListenerId) {
    listener._svgjsListenerId = ++listenerId
  }

  events.forEach(function (event) {
    const ev = event.split('.')[0]
    const ns = event.split('.')[1] || '*'

    // ensure valid object
    bag[ev] = bag[ev] || {}
    bag[ev][ns] = bag[ev][ns] || {}

    // reference listener
    bag[ev][ns][listener._svgjsListenerId] = l

    // add listener
    n.addEventListener(ev, l, options || false)
  })
}

// Add event unbinder in the SVG namespace
function off(node, events, listener, options) {
  const instance = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.makeInstance)(node)
  const bag = getEvents(instance)
  const n = getEventTarget(instance)

  // listener can be a function or a number
  if (typeof listener === 'function') {
    listener = listener._svgjsListenerId
    if (!listener) return
  }

  // events can be an array of events or a string or undefined
  events = Array.isArray(events) ? events : (events || '').split(_regex_js__WEBPACK_IMPORTED_MODULE_0__.delimiter)

  events.forEach(function (event) {
    const ev = event && event.split('.')[0]
    const ns = event && event.split('.')[1]
    let namespace, l

    if (listener) {
      // remove listener reference
      if (bag[ev] && bag[ev][ns || '*']) {
        // removeListener
        n.removeEventListener(
          ev,
          bag[ev][ns || '*'][listener],
          options || false
        )

        delete bag[ev][ns || '*'][listener]
      }
    } else if (ev && ns) {
      // remove all listeners for a namespaced event
      if (bag[ev] && bag[ev][ns]) {
        for (l in bag[ev][ns]) {
          off(n, [ev, ns].join('.'), l)
        }

        delete bag[ev][ns]
      }
    } else if (ns) {
      // remove all listeners for a specific namespace
      for (event in bag) {
        for (namespace in bag[event]) {
          if (ns === namespace) {
            off(n, [event, ns].join('.'))
          }
        }
      }
    } else if (ev) {
      // remove all listeners for the event
      if (bag[ev]) {
        for (namespace in bag[ev]) {
          off(n, [ev, namespace].join('.'))
        }

        delete bag[ev]
      }
    } else {
      // remove all listeners on a given node
      for (event in bag) {
        off(n, event)
      }

      clearEvents(instance)
    }
  })
}

function dispatch(node, event, data, options) {
  const n = getEventTarget(node)

  // Dispatch event
  if (event instanceof _utils_window_js__WEBPACK_IMPORTED_MODULE_2__.globals.window.Event) {
    n.dispatchEvent(event)
  } else {
    event = new _utils_window_js__WEBPACK_IMPORTED_MODULE_2__.globals.window.CustomEvent(event, {
      detail: data,
      cancelable: true,
      ...options
    })
    n.dispatchEvent(event)
  }
  return event
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/gradiented.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/gradiented.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   from: () => (/* binding */ from),
/* harmony export */   to: () => (/* binding */ to)
/* harmony export */ });
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");


function from(x, y) {
  return (this._element || this).type === 'radialGradient'
    ? this.attr({ fx: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](x), fy: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](y) })
    : this.attr({ x1: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](x), y1: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](y) })
}

function to(x, y) {
  return (this._element || this).type === 'radialGradient'
    ? this.attr({ cx: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](x), cy: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](y) })
    : this.attr({ x2: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](x), y2: new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_0__["default"](y) })
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   html: () => (/* binding */ html),
/* harmony export */   svg: () => (/* binding */ svg),
/* harmony export */   xlink: () => (/* binding */ xlink),
/* harmony export */   xmlns: () => (/* binding */ xmlns)
/* harmony export */ });
// Default namespaces
const svg = 'http://www.w3.org/2000/svg'
const html = 'http://www.w3.org/1999/xhtml'
const xmlns = 'http://www.w3.org/2000/xmlns/'
const xlink = 'http://www.w3.org/1999/xlink'


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/parser.js":
/*!******************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/parser.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ parser)
/* harmony export */ });
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");



function parser() {
  // Reuse cached element if possible
  if (!parser.nodes) {
    const svg = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.makeInstance)().size(2, 0)
    svg.node.style.cssText = [
      'opacity: 0',
      'position: absolute',
      'left: -100%',
      'top: -100%',
      'overflow: hidden'
    ].join(';')

    svg.attr('focusable', 'false')
    svg.attr('aria-hidden', 'true')

    const path = svg.path().node

    parser.nodes = { svg, path }
  }

  if (!parser.nodes.svg.node.parentNode) {
    const b = _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.document.body || _utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.document.documentElement
    parser.nodes.svg.addTo(b)
  }

  return parser.nodes
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/pointed.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/pointed.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MorphArray: () => (/* binding */ MorphArray),
/* harmony export */   height: () => (/* binding */ height),
/* harmony export */   width: () => (/* binding */ width),
/* harmony export */   x: () => (/* binding */ x),
/* harmony export */   y: () => (/* binding */ y)
/* harmony export */ });
/* harmony import */ var _types_PointArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/PointArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PointArray.js");


const MorphArray = _types_PointArray_js__WEBPACK_IMPORTED_MODULE_0__["default"]

// Move by left top corner over x-axis
function x(x) {
  return x == null ? this.bbox().x : this.move(x, this.bbox().y)
}

// Move by left top corner over y-axis
function y(y) {
  return y == null ? this.bbox().y : this.move(this.bbox().x, y)
}

// Set width of element
function width(width) {
  const b = this.bbox()
  return width == null ? b.width : this.size(width, b.height)
}

// Set height of element
function height(height) {
  const b = this.bbox()
  return height == null ? b.height : this.size(b.width, height)
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/poly.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/poly.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   array: () => (/* binding */ array),
/* harmony export */   clear: () => (/* binding */ clear),
/* harmony export */   move: () => (/* binding */ move),
/* harmony export */   plot: () => (/* binding */ plot),
/* harmony export */   size: () => (/* binding */ size)
/* harmony export */ });
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _types_PointArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../types/PointArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/PointArray.js");



// Get array
function array() {
  return this._array || (this._array = new _types_PointArray_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.attr('points')))
}

// Clear array cache
function clear() {
  delete this._array
  return this
}

// Move by left top corner
function move(x, y) {
  return this.attr('points', this.array().move(x, y))
}

// Plot new path
function plot(p) {
  return p == null
    ? this.array()
    : this.clear().attr(
        'points',
        typeof p === 'string' ? p : (this._array = new _types_PointArray_js__WEBPACK_IMPORTED_MODULE_1__["default"](p))
      )
}

// Set element size to given width and height
function size(width, height) {
  const p = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_0__.proportionalSize)(this, width, height)
  return this.attr('points', this.array().size(p.width, p.height))
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   delimiter: () => (/* binding */ delimiter),
/* harmony export */   hex: () => (/* binding */ hex),
/* harmony export */   isBlank: () => (/* binding */ isBlank),
/* harmony export */   isHex: () => (/* binding */ isHex),
/* harmony export */   isImage: () => (/* binding */ isImage),
/* harmony export */   isNumber: () => (/* binding */ isNumber),
/* harmony export */   isPathLetter: () => (/* binding */ isPathLetter),
/* harmony export */   isRgb: () => (/* binding */ isRgb),
/* harmony export */   numberAndUnit: () => (/* binding */ numberAndUnit),
/* harmony export */   reference: () => (/* binding */ reference),
/* harmony export */   rgb: () => (/* binding */ rgb),
/* harmony export */   transforms: () => (/* binding */ transforms),
/* harmony export */   whitespace: () => (/* binding */ whitespace)
/* harmony export */ });
// Parse unit value
const numberAndUnit =
  /^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i

// Parse hex value
const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

// Parse rgb value
const rgb = /rgb\((\d+),(\d+),(\d+)\)/

// Parse reference id
const reference = /(#[a-z_][a-z0-9\-_]*)/i

// splits a transformation chain
const transforms = /\)\s*,?\s*/

// Whitespace
const whitespace = /\s/g

// Test hex value
const isHex = /^#[a-f0-9]{3}$|^#[a-f0-9]{6}$/i

// Test rgb value
const isRgb = /^rgb\(/

// Test for blank string
const isBlank = /^(\s+)?$/

// Test for numeric string
const isNumber = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i

// Test for image url
const isImage = /\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i

// split at whitespace and comma
const delimiter = /[\s,]+/

// Test for path letter
const isPathLetter = /[MLHVCSQTAZ]/i


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js":
/*!********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/selector.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ baseFind),
/* harmony export */   find: () => (/* binding */ find),
/* harmony export */   findOne: () => (/* binding */ findOne)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _types_List_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../types/List.js */ "./node_modules/@svgdotjs/svg.js/src/types/List.js");





function baseFind(query, parent) {
  return new _types_List_js__WEBPACK_IMPORTED_MODULE_3__["default"](
    (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.map)((parent || _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.document).querySelectorAll(query), function (node) {
      return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(node)
    })
  )
}

// Scoped find method
function find(query) {
  return baseFind(query, this.node)
}

function findOne(query) {
  return (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.adopt)(this.node.querySelector(query))
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/core/textable.js":
/*!********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/core/textable.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   amove: () => (/* binding */ amove),
/* harmony export */   ax: () => (/* binding */ ax),
/* harmony export */   ay: () => (/* binding */ ay),
/* harmony export */   build: () => (/* binding */ build),
/* harmony export */   center: () => (/* binding */ center),
/* harmony export */   cx: () => (/* binding */ cx),
/* harmony export */   cy: () => (/* binding */ cy),
/* harmony export */   length: () => (/* binding */ length),
/* harmony export */   move: () => (/* binding */ move),
/* harmony export */   plain: () => (/* binding */ plain),
/* harmony export */   x: () => (/* binding */ x),
/* harmony export */   y: () => (/* binding */ y)
/* harmony export */ });
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");


// Create plain text node
function plain(text) {
  // clear if build mode is disabled
  if (this._build === false) {
    this.clear()
  }

  // create text node
  this.node.appendChild(_utils_window_js__WEBPACK_IMPORTED_MODULE_0__.globals.document.createTextNode(text))

  return this
}

// Get length of text element
function length() {
  return this.node.getComputedTextLength()
}

// Move over x-axis
// Text is moved by its bounding box
// text-anchor does NOT matter
function x(x, box = this.bbox()) {
  if (x == null) {
    return box.x
  }

  return this.attr('x', this.attr('x') + x - box.x)
}

// Move over y-axis
function y(y, box = this.bbox()) {
  if (y == null) {
    return box.y
  }

  return this.attr('y', this.attr('y') + y - box.y)
}

function move(x, y, box = this.bbox()) {
  return this.x(x, box).y(y, box)
}

// Move center over x-axis
function cx(x, box = this.bbox()) {
  if (x == null) {
    return box.cx
  }

  return this.attr('x', this.attr('x') + x - box.cx)
}

// Move center over y-axis
function cy(y, box = this.bbox()) {
  if (y == null) {
    return box.cy
  }

  return this.attr('y', this.attr('y') + y - box.cy)
}

function center(x, y, box = this.bbox()) {
  return this.cx(x, box).cy(y, box)
}

function ax(x) {
  return this.attr('x', x)
}

function ay(y) {
  return this.attr('y', y)
}

function amove(x, y) {
  return this.ax(x).ay(y)
}

// Enable / disable build mode
function build(build) {
  this._build = !!build
  return this
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/optional/arrange.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/optional/arrange.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   after: () => (/* binding */ after),
/* harmony export */   back: () => (/* binding */ back),
/* harmony export */   backward: () => (/* binding */ backward),
/* harmony export */   before: () => (/* binding */ before),
/* harmony export */   forward: () => (/* binding */ forward),
/* harmony export */   front: () => (/* binding */ front),
/* harmony export */   insertAfter: () => (/* binding */ insertAfter),
/* harmony export */   insertBefore: () => (/* binding */ insertBefore),
/* harmony export */   next: () => (/* binding */ next),
/* harmony export */   position: () => (/* binding */ position),
/* harmony export */   prev: () => (/* binding */ prev),
/* harmony export */   siblings: () => (/* binding */ siblings)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");



// Get all siblings, including myself
function siblings() {
  return this.parent().children()
}

// Get the current position siblings
function position() {
  return this.parent().index(this)
}

// Get the next element (will return null if there is none)
function next() {
  return this.siblings()[this.position() + 1]
}

// Get the next element (will return null if there is none)
function prev() {
  return this.siblings()[this.position() - 1]
}

// Send given element one step forward
function forward() {
  const i = this.position()
  const p = this.parent()

  // move node one step forward
  p.add(this.remove(), i + 1)

  return this
}

// Send given element one step backward
function backward() {
  const i = this.position()
  const p = this.parent()

  p.add(this.remove(), i ? i - 1 : 0)

  return this
}

// Send given element all the way to the front
function front() {
  const p = this.parent()

  // Move node forward
  p.add(this.remove())

  return this
}

// Send given element all the way to the back
function back() {
  const p = this.parent()

  // Move node back
  p.add(this.remove(), 0)

  return this
}

// Inserts a given element before the targeted element
function before(element) {
  element = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(element)
  element.remove()

  const i = this.position()

  this.parent().add(element, i)

  return this
}

// Inserts a given element after the targeted element
function after(element) {
  element = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(element)
  element.remove()

  const i = this.position()

  this.parent().add(element, i + 1)

  return this
}

function insertBefore(element) {
  element = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(element)
  element.before(this)
  return this
}

function insertAfter(element) {
  element = (0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.makeInstance)(element)
  element.after(this)
  return this
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)('Dom', {
  siblings,
  position,
  next,
  prev,
  forward,
  backward,
  front,
  back,
  before,
  after,
  insertBefore,
  insertAfter
})


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/optional/class.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/optional/class.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addClass: () => (/* binding */ addClass),
/* harmony export */   classes: () => (/* binding */ classes),
/* harmony export */   hasClass: () => (/* binding */ hasClass),
/* harmony export */   removeClass: () => (/* binding */ removeClass),
/* harmony export */   toggleClass: () => (/* binding */ toggleClass)
/* harmony export */ });
/* harmony import */ var _core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");



// Return array of classes on the node
function classes() {
  const attr = this.attr('class')
  return attr == null ? [] : attr.trim().split(_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.delimiter)
}

// Return true if class exists on the node, false otherwise
function hasClass(name) {
  return this.classes().indexOf(name) !== -1
}

// Add class to the node
function addClass(name) {
  if (!this.hasClass(name)) {
    const array = this.classes()
    array.push(name)
    this.attr('class', array.join(' '))
  }

  return this
}

// Remove class from the node
function removeClass(name) {
  if (this.hasClass(name)) {
    this.attr(
      'class',
      this.classes()
        .filter(function (c) {
          return c !== name
        })
        .join(' ')
    )
  }

  return this
}

// Toggle the presence of a class on the node
function toggleClass(name) {
  return this.hasClass(name) ? this.removeClass(name) : this.addClass(name)
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)('Dom', {
  classes,
  hasClass,
  addClass,
  removeClass,
  toggleClass
})


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/optional/css.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/optional/css.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   css: () => (/* binding */ css),
/* harmony export */   hide: () => (/* binding */ hide),
/* harmony export */   show: () => (/* binding */ show),
/* harmony export */   visible: () => (/* binding */ visible)
/* harmony export */ });
/* harmony import */ var _core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");



// Dynamic style generator
function css(style, val) {
  const ret = {}
  if (arguments.length === 0) {
    // get full style as object
    this.node.style.cssText
      .split(/\s*;\s*/)
      .filter(function (el) {
        return !!el.length
      })
      .forEach(function (el) {
        const t = el.split(/\s*:\s*/)
        ret[t[0]] = t[1]
      })
    return ret
  }

  if (arguments.length < 2) {
    // get style properties as array
    if (Array.isArray(style)) {
      for (const name of style) {
        const cased = name
        ret[name] = this.node.style.getPropertyValue(cased)
      }
      return ret
    }

    // get style for property
    if (typeof style === 'string') {
      return this.node.style.getPropertyValue(style)
    }

    // set styles in object
    if (typeof style === 'object') {
      for (const name in style) {
        // set empty string if null/undefined/'' was given
        this.node.style.setProperty(
          name,
          style[name] == null || _core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isBlank.test(style[name]) ? '' : style[name]
        )
      }
    }
  }

  // set style for property
  if (arguments.length === 2) {
    this.node.style.setProperty(
      style,
      val == null || _core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isBlank.test(val) ? '' : val
    )
  }

  return this
}

// Show element
function show() {
  return this.css('display', '')
}

// Hide element
function hide() {
  return this.css('display', 'none')
}

// Is element visible?
function visible() {
  return this.css('display') !== 'none'
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_1__.registerMethods)('Dom', {
  css,
  show,
  hide,
  visible
})


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/optional/data.js":
/*!********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/optional/data.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   data: () => (/* binding */ data)
/* harmony export */ });
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");



// Store data values on svg nodes
function data(a, v, r) {
  if (a == null) {
    // get an object of attributes
    return this.data(
      (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.map)(
        (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.filter)(
          this.node.attributes,
          (el) => el.nodeName.indexOf('data-') === 0
        ),
        (el) => el.nodeName.slice(5)
      )
    )
  } else if (a instanceof Array) {
    const data = {}
    for (const key of a) {
      data[key] = this.data(key)
    }
    return data
  } else if (typeof a === 'object') {
    for (v in a) {
      this.data(v, a[v])
    }
  } else if (arguments.length < 2) {
    try {
      return JSON.parse(this.attr('data-' + a))
    } catch (e) {
      return this.attr('data-' + a)
    }
  } else {
    this.attr(
      'data-' + a,
      v === null
        ? null
        : r === true || typeof v === 'string' || typeof v === 'number'
          ? v
          : JSON.stringify(v)
    )
  }

  return this
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)('Dom', { data })


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/optional/memory.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/optional/memory.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   forget: () => (/* binding */ forget),
/* harmony export */   memory: () => (/* binding */ memory),
/* harmony export */   remember: () => (/* binding */ remember)
/* harmony export */ });
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");


// Remember arbitrary data
function remember(k, v) {
  // remember every item in an object individually
  if (typeof arguments[0] === 'object') {
    for (const key in k) {
      this.remember(key, k[key])
    }
  } else if (arguments.length === 1) {
    // retrieve memory
    return this.memory()[k]
  } else {
    // store memory
    this.memory()[k] = v
  }

  return this
}

// Erase a given memory
function forget() {
  if (arguments.length === 0) {
    this._memory = {}
  } else {
    for (let i = arguments.length - 1; i >= 0; i--) {
      delete this.memory()[arguments[i]]
    }
  }
  return this
}

// This triggers creation of a new hidden class which is not performant
// However, this function is not rarely used so it will not happen frequently
// Return local memory object
function memory() {
  return (this._memory = this._memory || {})
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)('Dom', { remember, forget, memory })


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/optional/sugar.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/optional/sugar.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../types/Color.js */ "./node_modules/@svgdotjs/svg.js/src/types/Color.js");
/* harmony import */ var _elements_Element_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../elements/Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");
/* harmony import */ var _types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../types/Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");
/* harmony import */ var _types_Point_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../types/Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");
/* harmony import */ var _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../types/SVGNumber.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js");







// Define list of available attributes for stroke and fill
const sugar = {
  stroke: [
    'color',
    'width',
    'opacity',
    'linecap',
    'linejoin',
    'miterlimit',
    'dasharray',
    'dashoffset'
  ],
  fill: ['color', 'opacity', 'rule'],
  prefix: function (t, a) {
    return a === 'color' ? t : t + '-' + a
  }
}

// Add sugar for fill and stroke
;['fill', 'stroke'].forEach(function (m) {
  const extension = {}
  let i

  extension[m] = function (o) {
    if (typeof o === 'undefined') {
      return this.attr(m)
    }
    if (
      typeof o === 'string' ||
      o instanceof _types_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"] ||
      _types_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].isRgb(o) ||
      o instanceof _elements_Element_js__WEBPACK_IMPORTED_MODULE_2__["default"]
    ) {
      this.attr(m, o)
    } else {
      // set all attributes from sugar.fill and sugar.stroke list
      for (i = sugar[m].length - 1; i >= 0; i--) {
        if (o[sugar[m][i]] != null) {
          this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]])
        }
      }
    }

    return this
  }

  ;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)(['Element', 'Runner'], extension)
})

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)(['Element', 'Runner'], {
  // Let the user set the matrix directly
  matrix: function (mat, b, c, d, e, f) {
    // Act as a getter
    if (mat == null) {
      return new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"](this)
    }

    // Act as a setter, the user can pass a matrix or a set of numbers
    return this.attr('transform', new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"](mat, b, c, d, e, f))
  },

  // Map rotation to transform
  rotate: function (angle, cx, cy) {
    return this.transform({ rotate: angle, ox: cx, oy: cy }, true)
  },

  // Map skew to transform
  skew: function (x, y, cx, cy) {
    return arguments.length === 1 || arguments.length === 3
      ? this.transform({ skew: x, ox: y, oy: cx }, true)
      : this.transform({ skew: [x, y], ox: cx, oy: cy }, true)
  },

  shear: function (lam, cx, cy) {
    return this.transform({ shear: lam, ox: cx, oy: cy }, true)
  },

  // Map scale to transform
  scale: function (x, y, cx, cy) {
    return arguments.length === 1 || arguments.length === 3
      ? this.transform({ scale: x, ox: y, oy: cx }, true)
      : this.transform({ scale: [x, y], ox: cx, oy: cy }, true)
  },

  // Map translate to transform
  translate: function (x, y) {
    return this.transform({ translate: [x, y] }, true)
  },

  // Map relative translations to transform
  relative: function (x, y) {
    return this.transform({ relative: [x, y] }, true)
  },

  // Map flip to transform
  flip: function (direction = 'both', origin = 'center') {
    if ('xybothtrue'.indexOf(direction) === -1) {
      origin = direction
      direction = 'both'
    }

    return this.transform({ flip: direction, origin: origin }, true)
  },

  // Opacity
  opacity: function (value) {
    return this.attr('opacity', value)
  }
})

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)('radius', {
  // Add x and y radius
  radius: function (x, y = x) {
    const type = (this._element || this).type
    return type === 'radialGradient'
      ? this.attr('r', new _types_SVGNumber_js__WEBPACK_IMPORTED_MODULE_5__["default"](x))
      : this.rx(x).ry(y)
  }
})

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)('Path', {
  // Get path length
  length: function () {
    return this.node.getTotalLength()
  },
  // Get point at length
  pointAt: function (length) {
    return new _types_Point_js__WEBPACK_IMPORTED_MODULE_4__["default"](this.node.getPointAtLength(length))
  }
})

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)(['Element', 'Runner'], {
  // Set font
  font: function (a, v) {
    if (typeof a === 'object') {
      for (v in a) this.font(v, a[v])
      return this
    }

    return a === 'leading'
      ? this.leading(v)
      : a === 'anchor'
        ? this.attr('text-anchor', v)
        : a === 'size' ||
            a === 'family' ||
            a === 'weight' ||
            a === 'stretch' ||
            a === 'variant' ||
            a === 'style'
          ? this.attr('font-' + a, v)
          : this.attr(a, v)
  }
})

// Add events to elements
const methods = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseover',
  'mouseout',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'touchstart',
  'touchmove',
  'touchleave',
  'touchend',
  'touchcancel',
  'contextmenu',
  'wheel',
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointerleave',
  'pointercancel'
].reduce(function (last, event) {
  // add event to Element
  const fn = function (f) {
    if (f === null) {
      this.off(event)
    } else {
      this.on(event, f)
    }
    return this
  }

  last[event] = fn
  return last
}, {})

;(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_0__.registerMethods)('Element', methods)


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/modules/optional/transform.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/modules/optional/transform.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   matrixify: () => (/* binding */ matrixify),
/* harmony export */   toParent: () => (/* binding */ toParent),
/* harmony export */   toRoot: () => (/* binding */ toRoot),
/* harmony export */   transform: () => (/* binding */ transform),
/* harmony export */   untransform: () => (/* binding */ untransform)
/* harmony export */ });
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _core_regex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../types/Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");





// Reset all transformations
function untransform() {
  return this.attr('transform', null)
}

// merge the whole transformation chain into one matrix and returns it
function matrixify() {
  const matrix = (this.attr('transform') || '')
    // split transformations
    .split(_core_regex_js__WEBPACK_IMPORTED_MODULE_1__.transforms)
    .slice(0, -1)
    .map(function (str) {
      // generate key => value pairs
      const kv = str.trim().split('(')
      return [
        kv[0],
        kv[1].split(_core_regex_js__WEBPACK_IMPORTED_MODULE_1__.delimiter).map(function (str) {
          return parseFloat(str)
        })
      ]
    })
    .reverse()
    // merge every transformation into one matrix
    .reduce(function (matrix, transform) {
      if (transform[0] === 'matrix') {
        return matrix.lmultiply(_types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromArray(transform[1]))
      }
      return matrix[transform[0]].apply(matrix, transform[1])
    }, new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"]())

  return matrix
}

// add an element to another parent without changing the visual representation on the screen
function toParent(parent, i) {
  if (this === parent) return this

  if ((0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_0__.isDescriptive)(this.node)) return this.addTo(parent, i)

  const ctm = this.screenCTM()
  const pCtm = parent.screenCTM().inverse()

  this.addTo(parent, i).untransform().transform(pCtm.multiply(ctm))

  return this
}

// same as above with parent equals root-svg
function toRoot(i) {
  return this.toParent(this.root(), i)
}

// Add transformations
function transform(o, relative) {
  // Act as a getter if no object was passed
  if (o == null || typeof o === 'string') {
    const decomposed = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"](this).decompose()
    return o == null ? decomposed : decomposed[o]
  }

  if (!_types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"].isMatrixLike(o)) {
    // Set the origin according to the defined transform
    o = { ...o, origin: (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_0__.getOrigin)(o, this) }
  }

  // The user can pass a boolean, an Element or an Matrix or nothing
  const cleanRelative = relative === true ? this : relative || false
  const result = new _types_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"](cleanRelative).transform(o)
  return this.attr('transform', result)
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_2__.registerMethods)('Element', {
  untransform,
  matrixify,
  toParent,
  toRoot,
  transform
})


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/Base.js":
/*!*********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/Base.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Base)
/* harmony export */ });
class Base {
  // constructor (node/*, {extensions = []} */) {
  //   // this.tags = []
  //   //
  //   // for (let extension of extensions) {
  //   //   extension.setup.call(this, node)
  //   //   this.tags.push(extension.name)
  //   // }
  // }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/Box.js":
/*!********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/Box.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bbox: () => (/* binding */ bbox),
/* harmony export */   "default": () => (/* binding */ Box),
/* harmony export */   domContains: () => (/* binding */ domContains),
/* harmony export */   inside: () => (/* binding */ inside),
/* harmony export */   isNulledBox: () => (/* binding */ isNulledBox),
/* harmony export */   rbox: () => (/* binding */ rbox)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _utils_methods_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _Matrix_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");
/* harmony import */ var _Point_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");
/* harmony import */ var _modules_core_parser_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../modules/core/parser.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/parser.js");








function isNulledBox(box) {
  return !box.width && !box.height && !box.x && !box.y
}

function domContains(node) {
  return (
    node === _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.document ||
    (
      _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.document.documentElement.contains ||
      function (node) {
        // This is IE - it does not support contains() for top-level SVGs
        while (node.parentNode) {
          node = node.parentNode
        }
        return node === _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.document
      }
    ).call(_utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.document.documentElement, node)
  )
}

class Box {
  constructor(...args) {
    this.init(...args)
  }

  addOffset() {
    // offset by window scroll position, because getBoundingClientRect changes when window is scrolled
    this.x += _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.window.pageXOffset
    this.y += _utils_window_js__WEBPACK_IMPORTED_MODULE_1__.globals.window.pageYOffset
    return new Box(this)
  }

  init(source) {
    const base = [0, 0, 0, 0]
    source =
      typeof source === 'string'
        ? source.split(_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.delimiter).map(parseFloat)
        : Array.isArray(source)
          ? source
          : typeof source === 'object'
            ? [
                source.left != null ? source.left : source.x,
                source.top != null ? source.top : source.y,
                source.width,
                source.height
              ]
            : arguments.length === 4
              ? [].slice.call(arguments)
              : base

    this.x = source[0] || 0
    this.y = source[1] || 0
    this.width = this.w = source[2] || 0
    this.height = this.h = source[3] || 0

    // Add more bounding box properties
    this.x2 = this.x + this.w
    this.y2 = this.y + this.h
    this.cx = this.x + this.w / 2
    this.cy = this.y + this.h / 2

    return this
  }

  isNulled() {
    return isNulledBox(this)
  }

  // Merge rect box with another, return a new instance
  merge(box) {
    const x = Math.min(this.x, box.x)
    const y = Math.min(this.y, box.y)
    const width = Math.max(this.x + this.width, box.x + box.width) - x
    const height = Math.max(this.y + this.height, box.y + box.height) - y

    return new Box(x, y, width, height)
  }

  toArray() {
    return [this.x, this.y, this.width, this.height]
  }

  toString() {
    return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height
  }

  transform(m) {
    if (!(m instanceof _Matrix_js__WEBPACK_IMPORTED_MODULE_4__["default"])) {
      m = new _Matrix_js__WEBPACK_IMPORTED_MODULE_4__["default"](m)
    }

    let xMin = Infinity
    let xMax = -Infinity
    let yMin = Infinity
    let yMax = -Infinity

    const pts = [
      new _Point_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.x, this.y),
      new _Point_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.x2, this.y),
      new _Point_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.x, this.y2),
      new _Point_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.x2, this.y2)
    ]

    pts.forEach(function (p) {
      p = p.transform(m)
      xMin = Math.min(xMin, p.x)
      xMax = Math.max(xMax, p.x)
      yMin = Math.min(yMin, p.y)
      yMax = Math.max(yMax, p.y)
    })

    return new Box(xMin, yMin, xMax - xMin, yMax - yMin)
  }
}

function getBox(el, getBBoxFn, retry) {
  let box

  try {
    // Try to get the box with the provided function
    box = getBBoxFn(el.node)

    // If the box is worthless and not even in the dom, retry
    // by throwing an error here...
    if (isNulledBox(box) && !domContains(el.node)) {
      throw new Error('Element not in the dom')
    }
  } catch (e) {
    // ... and calling the retry handler here
    box = retry(el)
  }

  return box
}

function bbox() {
  // Function to get bbox is getBBox()
  const getBBox = (node) => node.getBBox()

  // Take all measures so that a stupid browser renders the element
  // so we can get the bbox from it when we try again
  const retry = (el) => {
    try {
      const clone = el.clone().addTo((0,_modules_core_parser_js__WEBPACK_IMPORTED_MODULE_6__["default"])().svg).show()
      const box = clone.node.getBBox()
      clone.remove()
      return box
    } catch (e) {
      // We give up...
      throw new Error(
        `Getting bbox of element "${
          el.node.nodeName
        }" is not possible: ${e.toString()}`
      )
    }
  }

  const box = getBox(this, getBBox, retry)
  const bbox = new Box(box)

  return bbox
}

function rbox(el) {
  const getRBox = (node) => node.getBoundingClientRect()
  const retry = (el) => {
    // There is no point in trying tricks here because if we insert the element into the dom ourselves
    // it obviously will be at the wrong position
    throw new Error(
      `Getting rbox of element "${el.node.nodeName}" is not possible`
    )
  }

  const box = getBox(this, getRBox, retry)
  const rbox = new Box(box)

  // If an element was passed, we want the bbox in the coordinate system of that element
  if (el) {
    return rbox.transform(el.screenCTM().inverseO())
  }

  // Else we want it in absolute screen coordinates
  // Therefore we need to add the scrollOffset
  return rbox.addOffset()
}

// Checks whether the given point is inside the bounding box
function inside(x, y) {
  const box = this.bbox()

  return (
    x > box.x && y > box.y && x < box.x + box.width && y < box.y + box.height
  )
}

(0,_utils_methods_js__WEBPACK_IMPORTED_MODULE_3__.registerMethods)({
  viewbox: {
    viewbox(x, y, width, height) {
      // act as getter
      if (x == null) return new Box(this.attr('viewBox'))

      // act as setter
      return this.attr('viewBox', new Box(x, y, width, height))
    },

    zoom(level, point) {
      // Its best to rely on the attributes here and here is why:
      // clientXYZ: Doesn't work on non-root svgs because they dont have a CSSBox (silly!)
      // getBoundingClientRect: Doesn't work because Chrome just ignores width and height of nested svgs completely
      //                        that means, their clientRect is always as big as the content.
      //                        Furthermore this size is incorrect if the element is further transformed by its parents
      // computedStyle: Only returns meaningful values if css was used with px. We dont go this route here!
      // getBBox: returns the bounding box of its content - that doesn't help!
      let { width, height } = this.attr(['width', 'height'])

      // Width and height is a string when a number with a unit is present which we can't use
      // So we try clientXYZ
      if (
        (!width && !height) ||
        typeof width === 'string' ||
        typeof height === 'string'
      ) {
        width = this.node.clientWidth
        height = this.node.clientHeight
      }

      // Giving up...
      if (!width || !height) {
        throw new Error(
          'Impossible to get absolute width and height. Please provide an absolute width and height attribute on the zooming element'
        )
      }

      const v = this.viewbox()

      const zoomX = width / v.width
      const zoomY = height / v.height
      const zoom = Math.min(zoomX, zoomY)

      if (level == null) {
        return zoom
      }

      let zoomAmount = zoom / level

      // Set the zoomAmount to the highest value which is safe to process and recover from
      // The * 100 is a bit of wiggle room for the matrix transformation
      if (zoomAmount === Infinity) zoomAmount = Number.MAX_SAFE_INTEGER / 100

      point =
        point || new _Point_js__WEBPACK_IMPORTED_MODULE_5__["default"](width / 2 / zoomX + v.x, height / 2 / zoomY + v.y)

      const box = new Box(v).transform(
        new _Matrix_js__WEBPACK_IMPORTED_MODULE_4__["default"]({ scale: zoomAmount, origin: point })
      )

      return this.viewbox(box)
    }
  }
})

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.register)(Box, 'Box')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/Color.js":
/*!**********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/Color.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Color)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");


function sixDigitHex(hex) {
  return hex.length === 4
    ? [
        '#',
        hex.substring(1, 2),
        hex.substring(1, 2),
        hex.substring(2, 3),
        hex.substring(2, 3),
        hex.substring(3, 4),
        hex.substring(3, 4)
      ].join('')
    : hex
}

function componentHex(component) {
  const integer = Math.round(component)
  const bounded = Math.max(0, Math.min(255, integer))
  const hex = bounded.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

function is(object, space) {
  for (let i = space.length; i--; ) {
    if (object[space[i]] == null) {
      return false
    }
  }
  return true
}

function getParameters(a, b) {
  const params = is(a, 'rgb')
    ? { _a: a.r, _b: a.g, _c: a.b, _d: 0, space: 'rgb' }
    : is(a, 'xyz')
      ? { _a: a.x, _b: a.y, _c: a.z, _d: 0, space: 'xyz' }
      : is(a, 'hsl')
        ? { _a: a.h, _b: a.s, _c: a.l, _d: 0, space: 'hsl' }
        : is(a, 'lab')
          ? { _a: a.l, _b: a.a, _c: a.b, _d: 0, space: 'lab' }
          : is(a, 'lch')
            ? { _a: a.l, _b: a.c, _c: a.h, _d: 0, space: 'lch' }
            : is(a, 'cmyk')
              ? { _a: a.c, _b: a.m, _c: a.y, _d: a.k, space: 'cmyk' }
              : { _a: 0, _b: 0, _c: 0, space: 'rgb' }

  params.space = b || params.space
  return params
}

function cieSpace(space) {
  if (space === 'lab' || space === 'xyz' || space === 'lch') {
    return true
  } else {
    return false
  }
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

class Color {
  constructor(...inputs) {
    this.init(...inputs)
  }

  // Test if given value is a color
  static isColor(color) {
    return (
      color && (color instanceof Color || this.isRgb(color) || this.test(color))
    )
  }

  // Test if given value is an rgb object
  static isRgb(color) {
    return (
      color &&
      typeof color.r === 'number' &&
      typeof color.g === 'number' &&
      typeof color.b === 'number'
    )
  }

  /*
  Generating random colors
  */
  static random(mode = 'vibrant', t) {
    // Get the math modules
    const { random, round, sin, PI: pi } = Math

    // Run the correct generator
    if (mode === 'vibrant') {
      const l = (81 - 57) * random() + 57
      const c = (83 - 45) * random() + 45
      const h = 360 * random()
      const color = new Color(l, c, h, 'lch')
      return color
    } else if (mode === 'sine') {
      t = t == null ? random() : t
      const r = round(80 * sin((2 * pi * t) / 0.5 + 0.01) + 150)
      const g = round(50 * sin((2 * pi * t) / 0.5 + 4.6) + 200)
      const b = round(100 * sin((2 * pi * t) / 0.5 + 2.3) + 150)
      const color = new Color(r, g, b)
      return color
    } else if (mode === 'pastel') {
      const l = (94 - 86) * random() + 86
      const c = (26 - 9) * random() + 9
      const h = 360 * random()
      const color = new Color(l, c, h, 'lch')
      return color
    } else if (mode === 'dark') {
      const l = 10 + 10 * random()
      const c = (125 - 75) * random() + 86
      const h = 360 * random()
      const color = new Color(l, c, h, 'lch')
      return color
    } else if (mode === 'rgb') {
      const r = 255 * random()
      const g = 255 * random()
      const b = 255 * random()
      const color = new Color(r, g, b)
      return color
    } else if (mode === 'lab') {
      const l = 100 * random()
      const a = 256 * random() - 128
      const b = 256 * random() - 128
      const color = new Color(l, a, b, 'lab')
      return color
    } else if (mode === 'grey') {
      const grey = 255 * random()
      const color = new Color(grey, grey, grey)
      return color
    } else {
      throw new Error('Unsupported random color mode')
    }
  }

  // Test if given value is a color string
  static test(color) {
    return typeof color === 'string' && (_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isHex.test(color) || _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isRgb.test(color))
  }

  cmyk() {
    // Get the rgb values for the current color
    const { _a, _b, _c } = this.rgb()
    const [r, g, b] = [_a, _b, _c].map((v) => v / 255)

    // Get the cmyk values in an unbounded format
    const k = Math.min(1 - r, 1 - g, 1 - b)

    if (k === 1) {
      // Catch the black case
      return new Color(0, 0, 0, 1, 'cmyk')
    }

    const c = (1 - r - k) / (1 - k)
    const m = (1 - g - k) / (1 - k)
    const y = (1 - b - k) / (1 - k)

    // Construct the new color
    const color = new Color(c, m, y, k, 'cmyk')
    return color
  }

  hsl() {
    // Get the rgb values
    const { _a, _b, _c } = this.rgb()
    const [r, g, b] = [_a, _b, _c].map((v) => v / 255)

    // Find the maximum and minimum values to get the lightness
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    // If the r, g, v values are identical then we are grey
    const isGrey = max === min

    // Calculate the hue and saturation
    const delta = max - min
    const s = isGrey
      ? 0
      : l > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min)
    const h = isGrey
      ? 0
      : max === r
        ? ((g - b) / delta + (g < b ? 6 : 0)) / 6
        : max === g
          ? ((b - r) / delta + 2) / 6
          : max === b
            ? ((r - g) / delta + 4) / 6
            : 0

    // Construct and return the new color
    const color = new Color(360 * h, 100 * s, 100 * l, 'hsl')
    return color
  }

  init(a = 0, b = 0, c = 0, d = 0, space = 'rgb') {
    // This catches the case when a falsy value is passed like ''
    a = !a ? 0 : a

    // Reset all values in case the init function is rerun with new color space
    if (this.space) {
      for (const component in this.space) {
        delete this[this.space[component]]
      }
    }

    if (typeof a === 'number') {
      // Allow for the case that we don't need d...
      space = typeof d === 'string' ? d : space
      d = typeof d === 'string' ? 0 : d

      // Assign the values straight to the color
      Object.assign(this, { _a: a, _b: b, _c: c, _d: d, space })
      // If the user gave us an array, make the color from it
    } else if (a instanceof Array) {
      this.space = b || (typeof a[3] === 'string' ? a[3] : a[4]) || 'rgb'
      Object.assign(this, { _a: a[0], _b: a[1], _c: a[2], _d: a[3] || 0 })
    } else if (a instanceof Object) {
      // Set the object up and assign its values directly
      const values = getParameters(a, b)
      Object.assign(this, values)
    } else if (typeof a === 'string') {
      if (_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isRgb.test(a)) {
        const noWhitespace = a.replace(_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.whitespace, '')
        const [_a, _b, _c] = _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.rgb
          .exec(noWhitespace)
          .slice(1, 4)
          .map((v) => parseInt(v))
        Object.assign(this, { _a, _b, _c, _d: 0, space: 'rgb' })
      } else if (_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isHex.test(a)) {
        const hexParse = (v) => parseInt(v, 16)
        const [, _a, _b, _c] = _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.hex.exec(sixDigitHex(a)).map(hexParse)
        Object.assign(this, { _a, _b, _c, _d: 0, space: 'rgb' })
      } else throw Error("Unsupported string format, can't construct Color")
    }

    // Now add the components as a convenience
    const { _a, _b, _c, _d } = this
    const components =
      this.space === 'rgb'
        ? { r: _a, g: _b, b: _c }
        : this.space === 'xyz'
          ? { x: _a, y: _b, z: _c }
          : this.space === 'hsl'
            ? { h: _a, s: _b, l: _c }
            : this.space === 'lab'
              ? { l: _a, a: _b, b: _c }
              : this.space === 'lch'
                ? { l: _a, c: _b, h: _c }
                : this.space === 'cmyk'
                  ? { c: _a, m: _b, y: _c, k: _d }
                  : {}
    Object.assign(this, components)
  }

  lab() {
    // Get the xyz color
    const { x, y, z } = this.xyz()

    // Get the lab components
    const l = 116 * y - 16
    const a = 500 * (x - y)
    const b = 200 * (y - z)

    // Construct and return a new color
    const color = new Color(l, a, b, 'lab')
    return color
  }

  lch() {
    // Get the lab color directly
    const { l, a, b } = this.lab()

    // Get the chromaticity and the hue using polar coordinates
    const c = Math.sqrt(a ** 2 + b ** 2)
    let h = (180 * Math.atan2(b, a)) / Math.PI
    if (h < 0) {
      h *= -1
      h = 360 - h
    }

    // Make a new color and return it
    const color = new Color(l, c, h, 'lch')
    return color
  }
  /*
  Conversion Methods
  */

  rgb() {
    if (this.space === 'rgb') {
      return this
    } else if (cieSpace(this.space)) {
      // Convert to the xyz color space
      let { x, y, z } = this
      if (this.space === 'lab' || this.space === 'lch') {
        // Get the values in the lab space
        let { l, a, b } = this
        if (this.space === 'lch') {
          const { c, h } = this
          const dToR = Math.PI / 180
          a = c * Math.cos(dToR * h)
          b = c * Math.sin(dToR * h)
        }

        // Undo the nonlinear function
        const yL = (l + 16) / 116
        const xL = a / 500 + yL
        const zL = yL - b / 200

        // Get the xyz values
        const ct = 16 / 116
        const mx = 0.008856
        const nm = 7.787
        x = 0.95047 * (xL ** 3 > mx ? xL ** 3 : (xL - ct) / nm)
        y = 1.0 * (yL ** 3 > mx ? yL ** 3 : (yL - ct) / nm)
        z = 1.08883 * (zL ** 3 > mx ? zL ** 3 : (zL - ct) / nm)
      }

      // Convert xyz to unbounded rgb values
      const rU = x * 3.2406 + y * -1.5372 + z * -0.4986
      const gU = x * -0.9689 + y * 1.8758 + z * 0.0415
      const bU = x * 0.0557 + y * -0.204 + z * 1.057

      // Convert the values to true rgb values
      const pow = Math.pow
      const bd = 0.0031308
      const r = rU > bd ? 1.055 * pow(rU, 1 / 2.4) - 0.055 : 12.92 * rU
      const g = gU > bd ? 1.055 * pow(gU, 1 / 2.4) - 0.055 : 12.92 * gU
      const b = bU > bd ? 1.055 * pow(bU, 1 / 2.4) - 0.055 : 12.92 * bU

      // Make and return the color
      const color = new Color(255 * r, 255 * g, 255 * b)
      return color
    } else if (this.space === 'hsl') {
      // https://bgrins.github.io/TinyColor/docs/tinycolor.html
      // Get the current hsl values
      let { h, s, l } = this
      h /= 360
      s /= 100
      l /= 100

      // If we are grey, then just make the color directly
      if (s === 0) {
        l *= 255
        const color = new Color(l, l, l)
        return color
      }

      // TODO I have no idea what this does :D If you figure it out, tell me!
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      // Get the rgb values
      const r = 255 * hueToRgb(p, q, h + 1 / 3)
      const g = 255 * hueToRgb(p, q, h)
      const b = 255 * hueToRgb(p, q, h - 1 / 3)

      // Make a new color
      const color = new Color(r, g, b)
      return color
    } else if (this.space === 'cmyk') {
      // https://gist.github.com/felipesabino/5066336
      // Get the normalised cmyk values
      const { c, m, y, k } = this

      // Get the rgb values
      const r = 255 * (1 - Math.min(1, c * (1 - k) + k))
      const g = 255 * (1 - Math.min(1, m * (1 - k) + k))
      const b = 255 * (1 - Math.min(1, y * (1 - k) + k))

      // Form the color and return it
      const color = new Color(r, g, b)
      return color
    } else {
      return this
    }
  }

  toArray() {
    const { _a, _b, _c, _d, space } = this
    return [_a, _b, _c, _d, space]
  }

  toHex() {
    const [r, g, b] = this._clamped().map(componentHex)
    return `#${r}${g}${b}`
  }

  toRgb() {
    const [rV, gV, bV] = this._clamped()
    const string = `rgb(${rV},${gV},${bV})`
    return string
  }

  toString() {
    return this.toHex()
  }

  xyz() {
    // Normalise the red, green and blue values
    const { _a: r255, _b: g255, _c: b255 } = this.rgb()
    const [r, g, b] = [r255, g255, b255].map((v) => v / 255)

    // Convert to the lab rgb space
    const rL = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    const gL = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    const bL = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

    // Convert to the xyz color space without bounding the values
    const xU = (rL * 0.4124 + gL * 0.3576 + bL * 0.1805) / 0.95047
    const yU = (rL * 0.2126 + gL * 0.7152 + bL * 0.0722) / 1.0
    const zU = (rL * 0.0193 + gL * 0.1192 + bL * 0.9505) / 1.08883

    // Get the proper xyz values by applying the bounding
    const x = xU > 0.008856 ? Math.pow(xU, 1 / 3) : 7.787 * xU + 16 / 116
    const y = yU > 0.008856 ? Math.pow(yU, 1 / 3) : 7.787 * yU + 16 / 116
    const z = zU > 0.008856 ? Math.pow(zU, 1 / 3) : 7.787 * zU + 16 / 116

    // Make and return the color
    const color = new Color(x, y, z, 'xyz')
    return color
  }

  /*
  Input and Output methods
  */

  _clamped() {
    const { _a, _b, _c } = this.rgb()
    const { max, min, round } = Math
    const format = (v) => max(0, min(round(v), 255))
    return [_a, _b, _c].map(format)
  }

  /*
  Constructing colors
  */
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/EventTarget.js":
/*!****************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/EventTarget.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EventTarget)
/* harmony export */ });
/* harmony import */ var _modules_core_event_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/event.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/event.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _Base_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Base.js */ "./node_modules/@svgdotjs/svg.js/src/types/Base.js");




class EventTarget extends _Base_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  addEventListener() {}

  dispatch(event, data, options) {
    return (0,_modules_core_event_js__WEBPACK_IMPORTED_MODULE_0__.dispatch)(this, event, data, options)
  }

  dispatchEvent(event) {
    const bag = this.getEventHolder().events
    if (!bag) return true

    const events = bag[event.type]

    for (const i in events) {
      for (const j in events[i]) {
        events[i][j](event)
      }
    }

    return !event.defaultPrevented
  }

  // Fire given event
  fire(event, data, options) {
    this.dispatch(event, data, options)
    return this
  }

  getEventHolder() {
    return this
  }

  getEventTarget() {
    return this
  }

  // Unbind event from listener
  off(event, listener, options) {
    (0,_modules_core_event_js__WEBPACK_IMPORTED_MODULE_0__.off)(this, event, listener, options)
    return this
  }

  // Bind given event to listener
  on(event, listener, binding, options) {
    (0,_modules_core_event_js__WEBPACK_IMPORTED_MODULE_0__.on)(this, event, listener, binding, options)
    return this
  }

  removeEventListener() {}
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_1__.register)(EventTarget, 'EventTarget')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/List.js":
/*!*********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/List.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");

// import { subClassArray } from './ArrayPolyfill.js'

class List extends Array {
  constructor(arr = [], ...args) {
    super(arr, ...args)
    if (typeof arr === 'number') return this
    this.length = 0
    this.push(...arr)
  }
}

/* = subClassArray('List', Array, function (arr = []) {
  // This catches the case, that native map tries to create an array with new Array(1)
  if (typeof arr === 'number') return this
  this.length = 0
  this.push(...arr)
}) */

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (List);

;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)([List], {
  each(fnOrMethodName, ...args) {
    if (typeof fnOrMethodName === 'function') {
      return this.map((el, i, arr) => {
        return fnOrMethodName.call(el, el, i, arr)
      })
    } else {
      return this.map((el) => {
        return el[fnOrMethodName](...args)
      })
    }
  },

  toArray() {
    return Array.prototype.concat.apply([], this)
  }
})

const reserved = ['toArray', 'constructor', 'each']

List.extend = function (methods) {
  methods = methods.reduce((obj, name) => {
    // Don't overwrite own methods
    if (reserved.includes(name)) return obj

    // Don't add private methods
    if (name[0] === '_') return obj

    // Allow access to original Array methods through a prefix
    if (name in Array.prototype) {
      obj['$' + name] = Array.prototype[name]
    }

    // Relay every call to each()
    obj[name] = function (...attrs) {
      return this.each(name, ...attrs)
    }
    return obj
  }, {})

  ;(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_0__.extend)([List], methods)
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js":
/*!***********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/Matrix.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ctm: () => (/* binding */ ctm),
/* harmony export */   "default": () => (/* binding */ Matrix),
/* harmony export */   screenCTM: () => (/* binding */ screenCTM)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/adopter.js */ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js");
/* harmony import */ var _elements_Element_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../elements/Element.js */ "./node_modules/@svgdotjs/svg.js/src/elements/Element.js");
/* harmony import */ var _Point_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");






function closeEnough(a, b, threshold) {
  return Math.abs(b - a) < (threshold || 1e-6)
}

class Matrix {
  constructor(...args) {
    this.init(...args)
  }

  static formatTransforms(o) {
    // Get all of the parameters required to form the matrix
    const flipBoth = o.flip === 'both' || o.flip === true
    const flipX = o.flip && (flipBoth || o.flip === 'x') ? -1 : 1
    const flipY = o.flip && (flipBoth || o.flip === 'y') ? -1 : 1
    const skewX =
      o.skew && o.skew.length
        ? o.skew[0]
        : isFinite(o.skew)
          ? o.skew
          : isFinite(o.skewX)
            ? o.skewX
            : 0
    const skewY =
      o.skew && o.skew.length
        ? o.skew[1]
        : isFinite(o.skew)
          ? o.skew
          : isFinite(o.skewY)
            ? o.skewY
            : 0
    const scaleX =
      o.scale && o.scale.length
        ? o.scale[0] * flipX
        : isFinite(o.scale)
          ? o.scale * flipX
          : isFinite(o.scaleX)
            ? o.scaleX * flipX
            : flipX
    const scaleY =
      o.scale && o.scale.length
        ? o.scale[1] * flipY
        : isFinite(o.scale)
          ? o.scale * flipY
          : isFinite(o.scaleY)
            ? o.scaleY * flipY
            : flipY
    const shear = o.shear || 0
    const theta = o.rotate || o.theta || 0
    const origin = new _Point_js__WEBPACK_IMPORTED_MODULE_4__["default"](
      o.origin || o.around || o.ox || o.originX,
      o.oy || o.originY
    )
    const ox = origin.x
    const oy = origin.y
    // We need Point to be invalid if nothing was passed because we cannot default to 0 here. That is why NaN
    const position = new _Point_js__WEBPACK_IMPORTED_MODULE_4__["default"](
      o.position || o.px || o.positionX || NaN,
      o.py || o.positionY || NaN
    )
    const px = position.x
    const py = position.y
    const translate = new _Point_js__WEBPACK_IMPORTED_MODULE_4__["default"](
      o.translate || o.tx || o.translateX,
      o.ty || o.translateY
    )
    const tx = translate.x
    const ty = translate.y
    const relative = new _Point_js__WEBPACK_IMPORTED_MODULE_4__["default"](
      o.relative || o.rx || o.relativeX,
      o.ry || o.relativeY
    )
    const rx = relative.x
    const ry = relative.y

    // Populate all of the values
    return {
      scaleX,
      scaleY,
      skewX,
      skewY,
      shear,
      theta,
      rx,
      ry,
      tx,
      ty,
      ox,
      oy,
      px,
      py
    }
  }

  static fromArray(a) {
    return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] }
  }

  static isMatrixLike(o) {
    return (
      o.a != null ||
      o.b != null ||
      o.c != null ||
      o.d != null ||
      o.e != null ||
      o.f != null
    )
  }

  // left matrix, right matrix, target matrix which is overwritten
  static matrixMultiply(l, r, o) {
    // Work out the product directly
    const a = l.a * r.a + l.c * r.b
    const b = l.b * r.a + l.d * r.b
    const c = l.a * r.c + l.c * r.d
    const d = l.b * r.c + l.d * r.d
    const e = l.e + l.a * r.e + l.c * r.f
    const f = l.f + l.b * r.e + l.d * r.f

    // make sure to use local variables because l/r and o could be the same
    o.a = a
    o.b = b
    o.c = c
    o.d = d
    o.e = e
    o.f = f

    return o
  }

  around(cx, cy, matrix) {
    return this.clone().aroundO(cx, cy, matrix)
  }

  // Transform around a center point
  aroundO(cx, cy, matrix) {
    const dx = cx || 0
    const dy = cy || 0
    return this.translateO(-dx, -dy).lmultiplyO(matrix).translateO(dx, dy)
  }

  // Clones this matrix
  clone() {
    return new Matrix(this)
  }

  // Decomposes this matrix into its affine parameters
  decompose(cx = 0, cy = 0) {
    // Get the parameters from the matrix
    const a = this.a
    const b = this.b
    const c = this.c
    const d = this.d
    const e = this.e
    const f = this.f

    // Figure out if the winding direction is clockwise or counterclockwise
    const determinant = a * d - b * c
    const ccw = determinant > 0 ? 1 : -1

    // Since we only shear in x, we can use the x basis to get the x scale
    // and the rotation of the resulting matrix
    const sx = ccw * Math.sqrt(a * a + b * b)
    const thetaRad = Math.atan2(ccw * b, ccw * a)
    const theta = (180 / Math.PI) * thetaRad
    const ct = Math.cos(thetaRad)
    const st = Math.sin(thetaRad)

    // We can then solve the y basis vector simultaneously to get the other
    // two affine parameters directly from these parameters
    const lam = (a * c + b * d) / determinant
    const sy = (c * sx) / (lam * a - b) || (d * sx) / (lam * b + a)

    // Use the translations
    const tx = e - cx + cx * ct * sx + cy * (lam * ct * sx - st * sy)
    const ty = f - cy + cx * st * sx + cy * (lam * st * sx + ct * sy)

    // Construct the decomposition and return it
    return {
      // Return the affine parameters
      scaleX: sx,
      scaleY: sy,
      shear: lam,
      rotate: theta,
      translateX: tx,
      translateY: ty,
      originX: cx,
      originY: cy,

      // Return the matrix parameters
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      e: this.e,
      f: this.f
    }
  }

  // Check if two matrices are equal
  equals(other) {
    if (other === this) return true
    const comp = new Matrix(other)
    return (
      closeEnough(this.a, comp.a) &&
      closeEnough(this.b, comp.b) &&
      closeEnough(this.c, comp.c) &&
      closeEnough(this.d, comp.d) &&
      closeEnough(this.e, comp.e) &&
      closeEnough(this.f, comp.f)
    )
  }

  // Flip matrix on x or y, at a given offset
  flip(axis, around) {
    return this.clone().flipO(axis, around)
  }

  flipO(axis, around) {
    return axis === 'x'
      ? this.scaleO(-1, 1, around, 0)
      : axis === 'y'
        ? this.scaleO(1, -1, 0, around)
        : this.scaleO(-1, -1, axis, around || axis) // Define an x, y flip point
  }

  // Initialize
  init(source) {
    const base = Matrix.fromArray([1, 0, 0, 1, 0, 0])

    // ensure source as object
    source =
      source instanceof _elements_Element_js__WEBPACK_IMPORTED_MODULE_3__["default"]
        ? source.matrixify()
        : typeof source === 'string'
          ? Matrix.fromArray(source.split(_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.delimiter).map(parseFloat))
          : Array.isArray(source)
            ? Matrix.fromArray(source)
            : typeof source === 'object' && Matrix.isMatrixLike(source)
              ? source
              : typeof source === 'object'
                ? new Matrix().transform(source)
                : arguments.length === 6
                  ? Matrix.fromArray([].slice.call(arguments))
                  : base

    // Merge the source matrix with the base matrix
    this.a = source.a != null ? source.a : base.a
    this.b = source.b != null ? source.b : base.b
    this.c = source.c != null ? source.c : base.c
    this.d = source.d != null ? source.d : base.d
    this.e = source.e != null ? source.e : base.e
    this.f = source.f != null ? source.f : base.f

    return this
  }

  inverse() {
    return this.clone().inverseO()
  }

  // Inverses matrix
  inverseO() {
    // Get the current parameters out of the matrix
    const a = this.a
    const b = this.b
    const c = this.c
    const d = this.d
    const e = this.e
    const f = this.f

    // Invert the 2x2 matrix in the top left
    const det = a * d - b * c
    if (!det) throw new Error('Cannot invert ' + this)

    // Calculate the top 2x2 matrix
    const na = d / det
    const nb = -b / det
    const nc = -c / det
    const nd = a / det

    // Apply the inverted matrix to the top right
    const ne = -(na * e + nc * f)
    const nf = -(nb * e + nd * f)

    // Construct the inverted matrix
    this.a = na
    this.b = nb
    this.c = nc
    this.d = nd
    this.e = ne
    this.f = nf

    return this
  }

  lmultiply(matrix) {
    return this.clone().lmultiplyO(matrix)
  }

  lmultiplyO(matrix) {
    const r = this
    const l = matrix instanceof Matrix ? matrix : new Matrix(matrix)

    return Matrix.matrixMultiply(l, r, this)
  }

  // Left multiplies by the given matrix
  multiply(matrix) {
    return this.clone().multiplyO(matrix)
  }

  multiplyO(matrix) {
    // Get the matrices
    const l = this
    const r = matrix instanceof Matrix ? matrix : new Matrix(matrix)

    return Matrix.matrixMultiply(l, r, this)
  }

  // Rotate matrix
  rotate(r, cx, cy) {
    return this.clone().rotateO(r, cx, cy)
  }

  rotateO(r, cx = 0, cy = 0) {
    // Convert degrees to radians
    r = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.radians)(r)

    const cos = Math.cos(r)
    const sin = Math.sin(r)

    const { a, b, c, d, e, f } = this

    this.a = a * cos - b * sin
    this.b = b * cos + a * sin
    this.c = c * cos - d * sin
    this.d = d * cos + c * sin
    this.e = e * cos - f * sin + cy * sin - cx * cos + cx
    this.f = f * cos + e * sin - cx * sin - cy * cos + cy

    return this
  }

  // Scale matrix
  scale() {
    return this.clone().scaleO(...arguments)
  }

  scaleO(x, y = x, cx = 0, cy = 0) {
    // Support uniform scaling
    if (arguments.length === 3) {
      cy = cx
      cx = y
      y = x
    }

    const { a, b, c, d, e, f } = this

    this.a = a * x
    this.b = b * y
    this.c = c * x
    this.d = d * y
    this.e = e * x - cx * x + cx
    this.f = f * y - cy * y + cy

    return this
  }

  // Shear matrix
  shear(a, cx, cy) {
    return this.clone().shearO(a, cx, cy)
  }

  // eslint-disable-next-line no-unused-vars
  shearO(lx, cx = 0, cy = 0) {
    const { a, b, c, d, e, f } = this

    this.a = a + b * lx
    this.c = c + d * lx
    this.e = e + f * lx - cy * lx

    return this
  }

  // Skew Matrix
  skew() {
    return this.clone().skewO(...arguments)
  }

  skewO(x, y = x, cx = 0, cy = 0) {
    // support uniformal skew
    if (arguments.length === 3) {
      cy = cx
      cx = y
      y = x
    }

    // Convert degrees to radians
    x = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.radians)(x)
    y = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.radians)(y)

    const lx = Math.tan(x)
    const ly = Math.tan(y)

    const { a, b, c, d, e, f } = this

    this.a = a + b * lx
    this.b = b + a * ly
    this.c = c + d * lx
    this.d = d + c * ly
    this.e = e + f * lx - cy * lx
    this.f = f + e * ly - cx * ly

    return this
  }

  // SkewX
  skewX(x, cx, cy) {
    return this.skew(x, 0, cx, cy)
  }

  // SkewY
  skewY(y, cx, cy) {
    return this.skew(0, y, cx, cy)
  }

  toArray() {
    return [this.a, this.b, this.c, this.d, this.e, this.f]
  }

  // Convert matrix to string
  toString() {
    return (
      'matrix(' +
      this.a +
      ',' +
      this.b +
      ',' +
      this.c +
      ',' +
      this.d +
      ',' +
      this.e +
      ',' +
      this.f +
      ')'
    )
  }

  // Transform a matrix into another matrix by manipulating the space
  transform(o) {
    // Check if o is a matrix and then left multiply it directly
    if (Matrix.isMatrixLike(o)) {
      const matrix = new Matrix(o)
      return matrix.multiplyO(this)
    }

    // Get the proposed transformations and the current transformations
    const t = Matrix.formatTransforms(o)
    const current = this
    const { x: ox, y: oy } = new _Point_js__WEBPACK_IMPORTED_MODULE_4__["default"](t.ox, t.oy).transform(current)

    // Construct the resulting matrix
    const transformer = new Matrix()
      .translateO(t.rx, t.ry)
      .lmultiplyO(current)
      .translateO(-ox, -oy)
      .scaleO(t.scaleX, t.scaleY)
      .skewO(t.skewX, t.skewY)
      .shearO(t.shear)
      .rotateO(t.theta)
      .translateO(ox, oy)

    // If we want the origin at a particular place, we force it there
    if (isFinite(t.px) || isFinite(t.py)) {
      const origin = new _Point_js__WEBPACK_IMPORTED_MODULE_4__["default"](ox, oy).transform(transformer)
      // TODO: Replace t.px with isFinite(t.px)
      // Doesn't work because t.px is also 0 if it wasn't passed
      const dx = isFinite(t.px) ? t.px - origin.x : 0
      const dy = isFinite(t.py) ? t.py - origin.y : 0
      transformer.translateO(dx, dy)
    }

    // Translate now after positioning
    transformer.translateO(t.tx, t.ty)
    return transformer
  }

  // Translate matrix
  translate(x, y) {
    return this.clone().translateO(x, y)
  }

  translateO(x, y) {
    this.e += x || 0
    this.f += y || 0
    return this
  }

  valueOf() {
    return {
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      e: this.e,
      f: this.f
    }
  }
}

function ctm() {
  return new Matrix(this.node.getCTM())
}

function screenCTM() {
  try {
    /* https://bugzilla.mozilla.org/show_bug.cgi?id=1344537
       This is needed because FF does not return the transformation matrix
       for the inner coordinate system when getScreenCTM() is called on nested svgs.
       However all other Browsers do that */
    if (typeof this.isRoot === 'function' && !this.isRoot()) {
      const rect = this.rect(1, 1)
      const m = rect.node.getScreenCTM()
      rect.remove()
      return new Matrix(m)
    }
    return new Matrix(this.node.getScreenCTM())
  } catch (e) {
    console.warn(
      `Cannot get CTM from SVG node ${this.node.nodeName}. Is the element rendered?`
    )
    return new Matrix()
  }
}

(0,_utils_adopter_js__WEBPACK_IMPORTED_MODULE_2__.register)(Matrix, 'Matrix')


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/PathArray.js":
/*!**************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/PathArray.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PathArray)
/* harmony export */ });
/* harmony import */ var _SVGArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SVGArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGArray.js");
/* harmony import */ var _modules_core_parser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/core/parser.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/parser.js");
/* harmony import */ var _Box_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _utils_pathParser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/pathParser.js */ "./node_modules/@svgdotjs/svg.js/src/utils/pathParser.js");





function arrayToString(a) {
  let s = ''
  for (let i = 0, il = a.length; i < il; i++) {
    s += a[i][0]

    if (a[i][1] != null) {
      s += a[i][1]

      if (a[i][2] != null) {
        s += ' '
        s += a[i][2]

        if (a[i][3] != null) {
          s += ' '
          s += a[i][3]
          s += ' '
          s += a[i][4]

          if (a[i][5] != null) {
            s += ' '
            s += a[i][5]
            s += ' '
            s += a[i][6]

            if (a[i][7] != null) {
              s += ' '
              s += a[i][7]
            }
          }
        }
      }
    }
  }

  return s + ' '
}

class PathArray extends _SVGArray_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  // Get bounding box of path
  bbox() {
    (0,_modules_core_parser_js__WEBPACK_IMPORTED_MODULE_1__["default"])().path.setAttribute('d', this.toString())
    return new _Box_js__WEBPACK_IMPORTED_MODULE_2__["default"](_modules_core_parser_js__WEBPACK_IMPORTED_MODULE_1__["default"].nodes.path.getBBox())
  }

  // Move path string
  move(x, y) {
    // get bounding box of current situation
    const box = this.bbox()

    // get relative offset
    x -= box.x
    y -= box.y

    if (!isNaN(x) && !isNaN(y)) {
      // move every point
      for (let l, i = this.length - 1; i >= 0; i--) {
        l = this[i][0]

        if (l === 'M' || l === 'L' || l === 'T') {
          this[i][1] += x
          this[i][2] += y
        } else if (l === 'H') {
          this[i][1] += x
        } else if (l === 'V') {
          this[i][1] += y
        } else if (l === 'C' || l === 'S' || l === 'Q') {
          this[i][1] += x
          this[i][2] += y
          this[i][3] += x
          this[i][4] += y

          if (l === 'C') {
            this[i][5] += x
            this[i][6] += y
          }
        } else if (l === 'A') {
          this[i][6] += x
          this[i][7] += y
        }
      }
    }

    return this
  }

  // Absolutize and parse path to array
  parse(d = 'M0 0') {
    if (Array.isArray(d)) {
      d = Array.prototype.concat.apply([], d).toString()
    }

    return (0,_utils_pathParser_js__WEBPACK_IMPORTED_MODULE_3__.pathParser)(d)
  }

  // Resize path string
  size(width, height) {
    // get bounding box of current situation
    const box = this.bbox()
    let i, l

    // If the box width or height is 0 then we ignore
    // transformations on the respective axis
    box.width = box.width === 0 ? 1 : box.width
    box.height = box.height === 0 ? 1 : box.height

    // recalculate position of all points according to new size
    for (i = this.length - 1; i >= 0; i--) {
      l = this[i][0]

      if (l === 'M' || l === 'L' || l === 'T') {
        this[i][1] = ((this[i][1] - box.x) * width) / box.width + box.x
        this[i][2] = ((this[i][2] - box.y) * height) / box.height + box.y
      } else if (l === 'H') {
        this[i][1] = ((this[i][1] - box.x) * width) / box.width + box.x
      } else if (l === 'V') {
        this[i][1] = ((this[i][1] - box.y) * height) / box.height + box.y
      } else if (l === 'C' || l === 'S' || l === 'Q') {
        this[i][1] = ((this[i][1] - box.x) * width) / box.width + box.x
        this[i][2] = ((this[i][2] - box.y) * height) / box.height + box.y
        this[i][3] = ((this[i][3] - box.x) * width) / box.width + box.x
        this[i][4] = ((this[i][4] - box.y) * height) / box.height + box.y

        if (l === 'C') {
          this[i][5] = ((this[i][5] - box.x) * width) / box.width + box.x
          this[i][6] = ((this[i][6] - box.y) * height) / box.height + box.y
        }
      } else if (l === 'A') {
        // resize radii
        this[i][1] = (this[i][1] * width) / box.width
        this[i][2] = (this[i][2] * height) / box.height

        // move position values
        this[i][6] = ((this[i][6] - box.x) * width) / box.width + box.x
        this[i][7] = ((this[i][7] - box.y) * height) / box.height + box.y
      }
    }

    return this
  }

  // Convert array to string
  toString() {
    return arrayToString(this)
  }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/Point.js":
/*!**********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/Point.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Point),
/* harmony export */   point: () => (/* binding */ point)
/* harmony export */ });
/* harmony import */ var _Matrix_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");


class Point {
  // Initialize
  constructor(...args) {
    this.init(...args)
  }

  // Clone point
  clone() {
    return new Point(this)
  }

  init(x, y) {
    const base = { x: 0, y: 0 }

    // ensure source as object
    const source = Array.isArray(x)
      ? { x: x[0], y: x[1] }
      : typeof x === 'object'
        ? { x: x.x, y: x.y }
        : { x: x, y: y }

    // merge source
    this.x = source.x == null ? base.x : source.x
    this.y = source.y == null ? base.y : source.y

    return this
  }

  toArray() {
    return [this.x, this.y]
  }

  transform(m) {
    return this.clone().transformO(m)
  }

  // Transform point with matrix
  transformO(m) {
    if (!_Matrix_js__WEBPACK_IMPORTED_MODULE_0__["default"].isMatrixLike(m)) {
      m = new _Matrix_js__WEBPACK_IMPORTED_MODULE_0__["default"](m)
    }

    const { x, y } = this

    // Perform the matrix multiplication
    this.x = m.a * x + m.c * y + m.e
    this.y = m.b * x + m.d * y + m.f

    return this
  }
}

function point(x, y) {
  return new Point(x, y).transformO(this.screenCTM().inverseO())
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/PointArray.js":
/*!***************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/PointArray.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PointArray)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _SVGArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SVGArray.js */ "./node_modules/@svgdotjs/svg.js/src/types/SVGArray.js");
/* harmony import */ var _Box_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Box.js */ "./node_modules/@svgdotjs/svg.js/src/types/Box.js");
/* harmony import */ var _Matrix_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Matrix.js */ "./node_modules/@svgdotjs/svg.js/src/types/Matrix.js");





class PointArray extends _SVGArray_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  // Get bounding box of points
  bbox() {
    let maxX = -Infinity
    let maxY = -Infinity
    let minX = Infinity
    let minY = Infinity
    this.forEach(function (el) {
      maxX = Math.max(el[0], maxX)
      maxY = Math.max(el[1], maxY)
      minX = Math.min(el[0], minX)
      minY = Math.min(el[1], minY)
    })
    return new _Box_js__WEBPACK_IMPORTED_MODULE_2__["default"](minX, minY, maxX - minX, maxY - minY)
  }

  // Move point string
  move(x, y) {
    const box = this.bbox()

    // get relative offset
    x -= box.x
    y -= box.y

    // move every point
    if (!isNaN(x) && !isNaN(y)) {
      for (let i = this.length - 1; i >= 0; i--) {
        this[i] = [this[i][0] + x, this[i][1] + y]
      }
    }

    return this
  }

  // Parse point string and flat array
  parse(array = [0, 0]) {
    const points = []

    // if it is an array, we flatten it and therefore clone it to 1 depths
    if (array instanceof Array) {
      array = Array.prototype.concat.apply([], array)
    } else {
      // Else, it is considered as a string
      // parse points
      array = array.trim().split(_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.delimiter).map(parseFloat)
    }

    // validate points - https://svgwg.org/svg2-draft/shapes.html#DataTypePoints
    // Odd number of coordinates is an error. In such cases, drop the last odd coordinate.
    if (array.length % 2 !== 0) array.pop()

    // wrap points in two-tuples
    for (let i = 0, len = array.length; i < len; i = i + 2) {
      points.push([array[i], array[i + 1]])
    }

    return points
  }

  // Resize poly string
  size(width, height) {
    let i
    const box = this.bbox()

    // recalculate position of all points according to new size
    for (i = this.length - 1; i >= 0; i--) {
      if (box.width)
        this[i][0] = ((this[i][0] - box.x) * width) / box.width + box.x
      if (box.height)
        this[i][1] = ((this[i][1] - box.y) * height) / box.height + box.y
    }

    return this
  }

  // Convert array to line object
  toLine() {
    return {
      x1: this[0][0],
      y1: this[0][1],
      x2: this[1][0],
      y2: this[1][1]
    }
  }

  // Convert array to string
  toString() {
    const array = []
    // convert to a poly point string
    for (let i = 0, il = this.length; i < il; i++) {
      array.push(this[i].join(','))
    }

    return array.join(' ')
  }

  transform(m) {
    return this.clone().transformO(m)
  }

  // transform points with matrix (similar to Point.transform)
  transformO(m) {
    if (!_Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"].isMatrixLike(m)) {
      m = new _Matrix_js__WEBPACK_IMPORTED_MODULE_3__["default"](m)
    }

    for (let i = this.length; i--; ) {
      // Perform the matrix multiplication
      const [x, y] = this[i]
      this[i][0] = m.a * x + m.c * y + m.e
      this[i][1] = m.b * x + m.d * y + m.f
    }

    return this
  }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/SVGArray.js":
/*!*************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/SVGArray.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SVGArray)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");


class SVGArray extends Array {
  constructor(...args) {
    super(...args)
    this.init(...args)
  }

  clone() {
    return new this.constructor(this)
  }

  init(arr) {
    // This catches the case, that native map tries to create an array with new Array(1)
    if (typeof arr === 'number') return this
    this.length = 0
    this.push(...this.parse(arr))
    return this
  }

  // Parse whitespace separated string
  parse(array = []) {
    // If already is an array, no need to parse it
    if (array instanceof Array) return array

    return array.trim().split(_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.delimiter).map(parseFloat)
  }

  toArray() {
    return Array.prototype.concat.apply([], this)
  }

  toSet() {
    return new Set(this)
  }

  toString() {
    return this.join(' ')
  }

  // Flattens the array if needed
  valueOf() {
    const ret = []
    ret.push(...this)
    return ret
  }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js":
/*!**************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/types/SVGNumber.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SVGNumber)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");


// Module for unit conversions
class SVGNumber {
  // Initialize
  constructor(...args) {
    this.init(...args)
  }

  convert(unit) {
    return new SVGNumber(this.value, unit)
  }

  // Divide number
  divide(number) {
    number = new SVGNumber(number)
    return new SVGNumber(this / number, this.unit || number.unit)
  }

  init(value, unit) {
    unit = Array.isArray(value) ? value[1] : unit
    value = Array.isArray(value) ? value[0] : value

    // initialize defaults
    this.value = 0
    this.unit = unit || ''

    // parse value
    if (typeof value === 'number') {
      // ensure a valid numeric value
      this.value = isNaN(value)
        ? 0
        : !isFinite(value)
          ? value < 0
            ? -3.4e38
            : +3.4e38
          : value
    } else if (typeof value === 'string') {
      unit = value.match(_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.numberAndUnit)

      if (unit) {
        // make value numeric
        this.value = parseFloat(unit[1])

        // normalize
        if (unit[5] === '%') {
          this.value /= 100
        } else if (unit[5] === 's') {
          this.value *= 1000
        }

        // store unit
        this.unit = unit[5]
      }
    } else {
      if (value instanceof SVGNumber) {
        this.value = value.valueOf()
        this.unit = value.unit
      }
    }

    return this
  }

  // Subtract number
  minus(number) {
    number = new SVGNumber(number)
    return new SVGNumber(this - number, this.unit || number.unit)
  }

  // Add number
  plus(number) {
    number = new SVGNumber(number)
    return new SVGNumber(this + number, this.unit || number.unit)
  }

  // Multiply number
  times(number) {
    number = new SVGNumber(number)
    return new SVGNumber(this * number, this.unit || number.unit)
  }

  toArray() {
    return [this.value, this.unit]
  }

  toJSON() {
    return this.toString()
  }

  toString() {
    return (
      (this.unit === '%'
        ? ~~(this.value * 1e8) / 1e6
        : this.unit === 's'
          ? this.value / 1e3
          : this.value) + this.unit
    )
  }

  valueOf() {
    return this.value
  }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/utils/adopter.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/utils/adopter.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   adopt: () => (/* binding */ adopt),
/* harmony export */   assignNewId: () => (/* binding */ assignNewId),
/* harmony export */   create: () => (/* binding */ create),
/* harmony export */   eid: () => (/* binding */ eid),
/* harmony export */   extend: () => (/* binding */ extend),
/* harmony export */   getClass: () => (/* binding */ getClass),
/* harmony export */   makeInstance: () => (/* binding */ makeInstance),
/* harmony export */   mockAdopt: () => (/* binding */ mockAdopt),
/* harmony export */   nodeOrNew: () => (/* binding */ nodeOrNew),
/* harmony export */   register: () => (/* binding */ register),
/* harmony export */   root: () => (/* binding */ root),
/* harmony export */   wrapWithAttrCheck: () => (/* binding */ wrapWithAttrCheck)
/* harmony export */ });
/* harmony import */ var _methods_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./methods.js */ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js");
/* harmony import */ var _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/core/namespaces.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/namespaces.js");
/* harmony import */ var _utils_window_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/window.js */ "./node_modules/@svgdotjs/svg.js/src/utils/window.js");
/* harmony import */ var _types_Base_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../types/Base.js */ "./node_modules/@svgdotjs/svg.js/src/types/Base.js");






const elements = {}
const root = '___SYMBOL___ROOT___'

// Method for element creation
function create(name, ns = _modules_core_namespaces_js__WEBPACK_IMPORTED_MODULE_2__.svg) {
  // create element
  return _utils_window_js__WEBPACK_IMPORTED_MODULE_3__.globals.document.createElementNS(ns, name)
}

function makeInstance(element, isHTML = false) {
  if (element instanceof _types_Base_js__WEBPACK_IMPORTED_MODULE_4__["default"]) return element

  if (typeof element === 'object') {
    return adopter(element)
  }

  if (element == null) {
    return new elements[root]()
  }

  if (typeof element === 'string' && element.trim().charAt(0) !== '<') {
    return adopter(_utils_window_js__WEBPACK_IMPORTED_MODULE_3__.globals.document.querySelector(element))
  }

  // Make sure, that HTML elements are created with the correct namespace
  const wrapper = isHTML ? _utils_window_js__WEBPACK_IMPORTED_MODULE_3__.globals.document.createElement('div') : create('svg')
  wrapper.innerHTML = element.trim()

  // We use firstElementChild here to skip potential comment nodes (#1339),
  element = adopter(wrapper.firstElementChild)

  // make sure, that element doesn't have its wrapper attached
  wrapper.removeChild(wrapper.firstElementChild)
  return element
}

function nodeOrNew(name, node) {
  return node &&
    (node instanceof _utils_window_js__WEBPACK_IMPORTED_MODULE_3__.globals.window.Node ||
      (node.ownerDocument &&
        node instanceof node.ownerDocument.defaultView.Node))
    ? node
    : create(name)
}

// Adopt existing svg elements
function adopt(node) {
  // check for presence of node
  if (!node) return null

  // make sure a node isn't already adopted
  if (node.instance instanceof _types_Base_js__WEBPACK_IMPORTED_MODULE_4__["default"]) return node.instance

  if (node.nodeName === '#document-fragment') {
    return new elements.Fragment(node)
  }

  // initialize variables
  let className = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.capitalize)(node.nodeName || 'Dom')

  // Make sure that gradients are adopted correctly
  if (className === 'LinearGradient' || className === 'RadialGradient') {
    className = 'Gradient'

    // Fallback to Dom if element is not known
  } else if (!elements[className]) {
    className = 'Dom'
  }

  return new elements[className](node)
}

let adopter = adopt

function mockAdopt(mock = adopt) {
  adopter = mock
}

function register(element, name = element.name, asRoot = false) {
  elements[name] = element
  if (asRoot) elements[root] = element

  ;(0,_methods_js__WEBPACK_IMPORTED_MODULE_0__.addMethodNames)(Object.getOwnPropertyNames(element.prototype))

  return element
}

function getClass(name) {
  return elements[name]
}

// Element id sequence
let did = 1000

// Get next named element id
function eid(name) {
  return 'Svgjs' + (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.capitalize)(name) + did++
}

// Deep new id assignment
function assignNewId(node) {
  // do the same for SVG child nodes as well
  for (let i = node.children.length - 1; i >= 0; i--) {
    assignNewId(node.children[i])
  }

  if (node.id) {
    node.id = eid(node.nodeName)
    return node
  }

  return node
}

// Method for extending objects
function extend(modules, methods) {
  let key, i

  modules = Array.isArray(modules) ? modules : [modules]

  for (i = modules.length - 1; i >= 0; i--) {
    for (key in methods) {
      modules[i].prototype[key] = methods[key]
    }
  }
}

function wrapWithAttrCheck(fn) {
  return function (...args) {
    const o = args[args.length - 1]

    if (o && o.constructor === Object && !(o instanceof Array)) {
      return fn.apply(this, args.slice(0, -1)).attr(o)
    } else {
      return fn.apply(this, args)
    }
  }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/utils/methods.js":
/*!************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/utils/methods.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addMethodNames: () => (/* binding */ addMethodNames),
/* harmony export */   getMethodNames: () => (/* binding */ getMethodNames),
/* harmony export */   getMethodsFor: () => (/* binding */ getMethodsFor),
/* harmony export */   registerMethods: () => (/* binding */ registerMethods)
/* harmony export */ });
const methods = {}
const names = []

function registerMethods(name, m) {
  if (Array.isArray(name)) {
    for (const _name of name) {
      registerMethods(_name, m)
    }
    return
  }

  if (typeof name === 'object') {
    for (const _name in name) {
      registerMethods(_name, name[_name])
    }
    return
  }

  addMethodNames(Object.getOwnPropertyNames(m))
  methods[name] = Object.assign(methods[name] || {}, m)
}

function getMethodsFor(name) {
  return methods[name] || {}
}

function getMethodNames() {
  return [...new Set(names)]
}

function addMethodNames(_names) {
  names.push(..._names)
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/utils/pathParser.js":
/*!***************************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/utils/pathParser.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   pathParser: () => (/* binding */ pathParser)
/* harmony export */ });
/* harmony import */ var _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/core/regex.js */ "./node_modules/@svgdotjs/svg.js/src/modules/core/regex.js");
/* harmony import */ var _types_Point_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/Point.js */ "./node_modules/@svgdotjs/svg.js/src/types/Point.js");



const segmentParameters = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0
}

const pathHandlers = {
  M: function (c, p, p0) {
    p.x = p0.x = c[0]
    p.y = p0.y = c[1]

    return ['M', p.x, p.y]
  },
  L: function (c, p) {
    p.x = c[0]
    p.y = c[1]
    return ['L', c[0], c[1]]
  },
  H: function (c, p) {
    p.x = c[0]
    return ['H', c[0]]
  },
  V: function (c, p) {
    p.y = c[0]
    return ['V', c[0]]
  },
  C: function (c, p) {
    p.x = c[4]
    p.y = c[5]
    return ['C', c[0], c[1], c[2], c[3], c[4], c[5]]
  },
  S: function (c, p) {
    p.x = c[2]
    p.y = c[3]
    return ['S', c[0], c[1], c[2], c[3]]
  },
  Q: function (c, p) {
    p.x = c[2]
    p.y = c[3]
    return ['Q', c[0], c[1], c[2], c[3]]
  },
  T: function (c, p) {
    p.x = c[0]
    p.y = c[1]
    return ['T', c[0], c[1]]
  },
  Z: function (c, p, p0) {
    p.x = p0.x
    p.y = p0.y
    return ['Z']
  },
  A: function (c, p) {
    p.x = c[5]
    p.y = c[6]
    return ['A', c[0], c[1], c[2], c[3], c[4], c[5], c[6]]
  }
}

const mlhvqtcsaz = 'mlhvqtcsaz'.split('')

for (let i = 0, il = mlhvqtcsaz.length; i < il; ++i) {
  pathHandlers[mlhvqtcsaz[i]] = (function (i) {
    return function (c, p, p0) {
      if (i === 'H') c[0] = c[0] + p.x
      else if (i === 'V') c[0] = c[0] + p.y
      else if (i === 'A') {
        c[5] = c[5] + p.x
        c[6] = c[6] + p.y
      } else {
        for (let j = 0, jl = c.length; j < jl; ++j) {
          c[j] = c[j] + (j % 2 ? p.y : p.x)
        }
      }

      return pathHandlers[i](c, p, p0)
    }
  })(mlhvqtcsaz[i].toUpperCase())
}

function makeAbsolut(parser) {
  const command = parser.segment[0]
  return pathHandlers[command](parser.segment.slice(1), parser.p, parser.p0)
}

function segmentComplete(parser) {
  return (
    parser.segment.length &&
    parser.segment.length - 1 ===
      segmentParameters[parser.segment[0].toUpperCase()]
  )
}

function startNewSegment(parser, token) {
  parser.inNumber && finalizeNumber(parser, false)
  const pathLetter = _modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isPathLetter.test(token)

  if (pathLetter) {
    parser.segment = [token]
  } else {
    const lastCommand = parser.lastCommand
    const small = lastCommand.toLowerCase()
    const isSmall = lastCommand === small
    parser.segment = [small === 'm' ? (isSmall ? 'l' : 'L') : lastCommand]
  }

  parser.inSegment = true
  parser.lastCommand = parser.segment[0]

  return pathLetter
}

function finalizeNumber(parser, inNumber) {
  if (!parser.inNumber) throw new Error('Parser Error')
  parser.number && parser.segment.push(parseFloat(parser.number))
  parser.inNumber = inNumber
  parser.number = ''
  parser.pointSeen = false
  parser.hasExponent = false

  if (segmentComplete(parser)) {
    finalizeSegment(parser)
  }
}

function finalizeSegment(parser) {
  parser.inSegment = false
  if (parser.absolute) {
    parser.segment = makeAbsolut(parser)
  }
  parser.segments.push(parser.segment)
}

function isArcFlag(parser) {
  if (!parser.segment.length) return false
  const isArc = parser.segment[0].toUpperCase() === 'A'
  const length = parser.segment.length

  return isArc && (length === 4 || length === 5)
}

function isExponential(parser) {
  return parser.lastToken.toUpperCase() === 'E'
}

const pathDelimiters = new Set([' ', ',', '\t', '\n', '\r', '\f'])
function pathParser(d, toAbsolute = true) {
  let index = 0
  let token = ''
  const parser = {
    segment: [],
    inNumber: false,
    number: '',
    lastToken: '',
    inSegment: false,
    segments: [],
    pointSeen: false,
    hasExponent: false,
    absolute: toAbsolute,
    p0: new _types_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"](),
    p: new _types_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"]()
  }

  while (((parser.lastToken = token), (token = d.charAt(index++)))) {
    if (!parser.inSegment) {
      if (startNewSegment(parser, token)) {
        continue
      }
    }

    if (token === '.') {
      if (parser.pointSeen || parser.hasExponent) {
        finalizeNumber(parser, false)
        --index
        continue
      }
      parser.inNumber = true
      parser.pointSeen = true
      parser.number += token
      continue
    }

    if (!isNaN(parseInt(token))) {
      if (parser.number === '0' || isArcFlag(parser)) {
        parser.inNumber = true
        parser.number = token
        finalizeNumber(parser, true)
        continue
      }

      parser.inNumber = true
      parser.number += token
      continue
    }

    if (pathDelimiters.has(token)) {
      if (parser.inNumber) {
        finalizeNumber(parser, false)
      }
      continue
    }

    if (token === '-' || token === '+') {
      if (parser.inNumber && !isExponential(parser)) {
        finalizeNumber(parser, false)
        --index
        continue
      }
      parser.number += token
      parser.inNumber = true
      continue
    }

    if (token.toUpperCase() === 'E') {
      parser.number += token
      parser.hasExponent = true
      continue
    }

    if (_modules_core_regex_js__WEBPACK_IMPORTED_MODULE_0__.isPathLetter.test(token)) {
      if (parser.inNumber) {
        finalizeNumber(parser, false)
      } else if (!segmentComplete(parser)) {
        throw new Error('parser Error')
      } else {
        finalizeSegment(parser)
      }
      --index
    }
  }

  if (parser.inNumber) {
    finalizeNumber(parser, false)
  }

  if (parser.inSegment && segmentComplete(parser)) {
    finalizeSegment(parser)
  }

  return parser.segments
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/utils/utils.js":
/*!**********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/utils/utils.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   capitalize: () => (/* binding */ capitalize),
/* harmony export */   degrees: () => (/* binding */ degrees),
/* harmony export */   filter: () => (/* binding */ filter),
/* harmony export */   getOrigin: () => (/* binding */ getOrigin),
/* harmony export */   isDescriptive: () => (/* binding */ isDescriptive),
/* harmony export */   map: () => (/* binding */ map),
/* harmony export */   proportionalSize: () => (/* binding */ proportionalSize),
/* harmony export */   radians: () => (/* binding */ radians),
/* harmony export */   unCamelCase: () => (/* binding */ unCamelCase),
/* harmony export */   writeDataToDom: () => (/* binding */ writeDataToDom)
/* harmony export */ });
// Map function
function map(array, block) {
  let i
  const il = array.length
  const result = []

  for (i = 0; i < il; i++) {
    result.push(block(array[i]))
  }

  return result
}

// Filter function
function filter(array, block) {
  let i
  const il = array.length
  const result = []

  for (i = 0; i < il; i++) {
    if (block(array[i])) {
      result.push(array[i])
    }
  }

  return result
}

// Degrees to radians
function radians(d) {
  return ((d % 360) * Math.PI) / 180
}

// Radians to degrees
function degrees(r) {
  return ((r * 180) / Math.PI) % 360
}

// Convert camel cased string to dash separated
function unCamelCase(s) {
  return s.replace(/([A-Z])/g, function (m, g) {
    return '-' + g.toLowerCase()
  })
}

// Capitalize first letter of a string
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Calculate proportional width and height values when necessary
function proportionalSize(element, width, height, box) {
  if (width == null || height == null) {
    box = box || element.bbox()

    if (width == null) {
      width = (box.width / box.height) * height
    } else if (height == null) {
      height = (box.height / box.width) * width
    }
  }

  return {
    width: width,
    height: height
  }
}

/**
 * This function adds support for string origins.
 * It searches for an origin in o.origin o.ox and o.originX.
 * This way, origin: {x: 'center', y: 50} can be passed as well as ox: 'center', oy: 50
 **/
function getOrigin(o, element) {
  const origin = o.origin
  // First check if origin is in ox or originX
  let ox = o.ox != null ? o.ox : o.originX != null ? o.originX : 'center'
  let oy = o.oy != null ? o.oy : o.originY != null ? o.originY : 'center'

  // Then check if origin was used and overwrite in that case
  if (origin != null) {
    ;[ox, oy] = Array.isArray(origin)
      ? origin
      : typeof origin === 'object'
        ? [origin.x, origin.y]
        : [origin, origin]
  }

  // Make sure to only call bbox when actually needed
  const condX = typeof ox === 'string'
  const condY = typeof oy === 'string'
  if (condX || condY) {
    const { height, width, x, y } = element.bbox()

    // And only overwrite if string was passed for this specific axis
    if (condX) {
      ox = ox.includes('left')
        ? x
        : ox.includes('right')
          ? x + width
          : x + width / 2
    }

    if (condY) {
      oy = oy.includes('top')
        ? y
        : oy.includes('bottom')
          ? y + height
          : y + height / 2
    }
  }

  // Return the origin as it is if it wasn't a string
  return [ox, oy]
}

const descriptiveElements = new Set(['desc', 'metadata', 'title'])
const isDescriptive = (element) =>
  descriptiveElements.has(element.nodeName)

const writeDataToDom = (element, data, defaults = {}) => {
  const cloned = { ...data }

  for (const key in cloned) {
    if (cloned[key].valueOf() === defaults[key]) {
      delete cloned[key]
    }
  }

  if (Object.keys(cloned).length) {
    element.node.setAttribute('data-svgjs', JSON.stringify(cloned)) // see #428
  } else {
    element.node.removeAttribute('data-svgjs')
    element.node.removeAttribute('svgjs:data')
  }
}


/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/src/utils/window.js":
/*!***********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/src/utils/window.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getWindow: () => (/* binding */ getWindow),
/* harmony export */   globals: () => (/* binding */ globals),
/* harmony export */   registerWindow: () => (/* binding */ registerWindow),
/* harmony export */   restoreWindow: () => (/* binding */ restoreWindow),
/* harmony export */   saveWindow: () => (/* binding */ saveWindow),
/* harmony export */   withWindow: () => (/* binding */ withWindow)
/* harmony export */ });
const globals = {
  window: typeof window === 'undefined' ? null : window,
  document: typeof document === 'undefined' ? null : document
}

function registerWindow(win = null, doc = null) {
  globals.window = win
  globals.document = doc
}

const save = {}

function saveWindow() {
  save.window = globals.window
  save.document = globals.document
}

function restoreWindow() {
  globals.window = save.window
  globals.document = save.document
}

function withWindow(win, fn) {
  saveWindow()
  registerWindow(win, win.document)
  fn(win, win.document)
  restoreWindow()
}

function getWindow() {
  return globals.window
}


/***/ }),

/***/ "./node_modules/chroma-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/chroma-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Color: () => (/* reexport safe */ _src_Color_js__WEBPACK_IMPORTED_MODULE_40__["default"]),
/* harmony export */   analyze: () => (/* reexport safe */ _src_utils_analyze_js__WEBPACK_IMPORTED_MODULE_30__.analyze),
/* harmony export */   average: () => (/* reexport safe */ _src_generator_average_js__WEBPACK_IMPORTED_MODULE_23__["default"]),
/* harmony export */   bezier: () => (/* reexport safe */ _src_generator_bezier_js__WEBPACK_IMPORTED_MODULE_24__["default"]),
/* harmony export */   blend: () => (/* reexport safe */ _src_generator_blend_js__WEBPACK_IMPORTED_MODULE_25__["default"]),
/* harmony export */   brewer: () => (/* reexport safe */ _src_colors_colorbrewer_js__WEBPACK_IMPORTED_MODULE_39__["default"]),
/* harmony export */   cmyk: () => (/* reexport safe */ _src_io_cmyk_index_js__WEBPACK_IMPORTED_MODULE_41__.cmyk),
/* harmony export */   colors: () => (/* reexport safe */ _src_colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_38__["default"]),
/* harmony export */   contrast: () => (/* reexport safe */ _src_utils_contrast_js__WEBPACK_IMPORTED_MODULE_31__["default"]),
/* harmony export */   contrastAPCA: () => (/* reexport safe */ _src_utils_contrastAPCA_js__WEBPACK_IMPORTED_MODULE_32__["default"]),
/* harmony export */   css: () => (/* reexport safe */ _src_io_css_index_js__WEBPACK_IMPORTED_MODULE_42__.css),
/* harmony export */   cubehelix: () => (/* reexport safe */ _src_generator_cubehelix_js__WEBPACK_IMPORTED_MODULE_26__["default"]),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   deltaE: () => (/* reexport safe */ _src_utils_delta_e_js__WEBPACK_IMPORTED_MODULE_33__["default"]),
/* harmony export */   distance: () => (/* reexport safe */ _src_utils_distance_js__WEBPACK_IMPORTED_MODULE_34__["default"]),
/* harmony export */   getLabWhitePoint: () => (/* reexport safe */ _src_io_lab_index_js__WEBPACK_IMPORTED_MODULE_49__.getLabWhitePoint),
/* harmony export */   gl: () => (/* reexport safe */ _src_io_gl_index_js__WEBPACK_IMPORTED_MODULE_43__.gl),
/* harmony export */   hcg: () => (/* reexport safe */ _src_io_hcg_index_js__WEBPACK_IMPORTED_MODULE_44__.hcg),
/* harmony export */   hcl: () => (/* reexport safe */ _src_io_lch_index_js__WEBPACK_IMPORTED_MODULE_50__.hcl),
/* harmony export */   hex: () => (/* reexport safe */ _src_io_hex_index_js__WEBPACK_IMPORTED_MODULE_45__.hex),
/* harmony export */   hsi: () => (/* reexport safe */ _src_io_hsi_index_js__WEBPACK_IMPORTED_MODULE_46__.hsi),
/* harmony export */   hsl: () => (/* reexport safe */ _src_io_hsl_index_js__WEBPACK_IMPORTED_MODULE_47__.hsl),
/* harmony export */   hsv: () => (/* reexport safe */ _src_io_hsv_index_js__WEBPACK_IMPORTED_MODULE_48__.hsv),
/* harmony export */   input: () => (/* reexport safe */ _src_io_input_js__WEBPACK_IMPORTED_MODULE_36__["default"]),
/* harmony export */   interpolate: () => (/* reexport safe */ _src_generator_mix_js__WEBPACK_IMPORTED_MODULE_27__["default"]),
/* harmony export */   kelvin: () => (/* reexport safe */ _src_io_temp_index_js__WEBPACK_IMPORTED_MODULE_53__.kelvin),
/* harmony export */   lab: () => (/* reexport safe */ _src_io_lab_index_js__WEBPACK_IMPORTED_MODULE_49__.lab),
/* harmony export */   lch: () => (/* reexport safe */ _src_io_lch_index_js__WEBPACK_IMPORTED_MODULE_50__.lch),
/* harmony export */   limits: () => (/* reexport safe */ _src_utils_analyze_js__WEBPACK_IMPORTED_MODULE_30__.limits),
/* harmony export */   mix: () => (/* reexport safe */ _src_generator_mix_js__WEBPACK_IMPORTED_MODULE_27__["default"]),
/* harmony export */   num: () => (/* reexport safe */ _src_io_num_index_js__WEBPACK_IMPORTED_MODULE_51__.num),
/* harmony export */   oklab: () => (/* reexport safe */ _src_io_oklab_index_js__WEBPACK_IMPORTED_MODULE_54__.oklab),
/* harmony export */   oklch: () => (/* reexport safe */ _src_io_oklch_index_js__WEBPACK_IMPORTED_MODULE_55__.oklch),
/* harmony export */   random: () => (/* reexport safe */ _src_generator_random_js__WEBPACK_IMPORTED_MODULE_28__["default"]),
/* harmony export */   rgb: () => (/* reexport safe */ _src_io_rgb_index_js__WEBPACK_IMPORTED_MODULE_52__.rgb),
/* harmony export */   scale: () => (/* reexport safe */ _src_generator_scale_js__WEBPACK_IMPORTED_MODULE_29__["default"]),
/* harmony export */   scales: () => (/* reexport safe */ _src_utils_scales_js__WEBPACK_IMPORTED_MODULE_37__["default"]),
/* harmony export */   setLabWhitePoint: () => (/* reexport safe */ _src_io_lab_index_js__WEBPACK_IMPORTED_MODULE_49__.setLabWhitePoint),
/* harmony export */   temp: () => (/* reexport safe */ _src_io_temp_index_js__WEBPACK_IMPORTED_MODULE_53__.temp),
/* harmony export */   temperature: () => (/* reexport safe */ _src_io_temp_index_js__WEBPACK_IMPORTED_MODULE_53__.temperature),
/* harmony export */   valid: () => (/* reexport safe */ _src_utils_valid_js__WEBPACK_IMPORTED_MODULE_35__["default"])
/* harmony export */ });
/* harmony import */ var _src_chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _src_io_named_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/io/named/index.js */ "./node_modules/chroma-js/src/io/named/index.js");
/* harmony import */ var _src_ops_alpha_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/ops/alpha.js */ "./node_modules/chroma-js/src/ops/alpha.js");
/* harmony import */ var _src_ops_clipped_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/ops/clipped.js */ "./node_modules/chroma-js/src/ops/clipped.js");
/* harmony import */ var _src_ops_darken_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/ops/darken.js */ "./node_modules/chroma-js/src/ops/darken.js");
/* harmony import */ var _src_ops_get_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./src/ops/get.js */ "./node_modules/chroma-js/src/ops/get.js");
/* harmony import */ var _src_ops_luminance_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./src/ops/luminance.js */ "./node_modules/chroma-js/src/ops/luminance.js");
/* harmony import */ var _src_ops_mix_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./src/ops/mix.js */ "./node_modules/chroma-js/src/ops/mix.js");
/* harmony import */ var _src_ops_premultiply_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./src/ops/premultiply.js */ "./node_modules/chroma-js/src/ops/premultiply.js");
/* harmony import */ var _src_ops_saturate_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./src/ops/saturate.js */ "./node_modules/chroma-js/src/ops/saturate.js");
/* harmony import */ var _src_ops_set_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./src/ops/set.js */ "./node_modules/chroma-js/src/ops/set.js");
/* harmony import */ var _src_ops_shade_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./src/ops/shade.js */ "./node_modules/chroma-js/src/ops/shade.js");
/* harmony import */ var _src_interpolator_rgb_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./src/interpolator/rgb.js */ "./node_modules/chroma-js/src/interpolator/rgb.js");
/* harmony import */ var _src_interpolator_lrgb_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./src/interpolator/lrgb.js */ "./node_modules/chroma-js/src/interpolator/lrgb.js");
/* harmony import */ var _src_interpolator_lab_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./src/interpolator/lab.js */ "./node_modules/chroma-js/src/interpolator/lab.js");
/* harmony import */ var _src_interpolator_lch_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./src/interpolator/lch.js */ "./node_modules/chroma-js/src/interpolator/lch.js");
/* harmony import */ var _src_interpolator_num_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./src/interpolator/num.js */ "./node_modules/chroma-js/src/interpolator/num.js");
/* harmony import */ var _src_interpolator_hcg_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./src/interpolator/hcg.js */ "./node_modules/chroma-js/src/interpolator/hcg.js");
/* harmony import */ var _src_interpolator_hsi_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./src/interpolator/hsi.js */ "./node_modules/chroma-js/src/interpolator/hsi.js");
/* harmony import */ var _src_interpolator_hsl_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./src/interpolator/hsl.js */ "./node_modules/chroma-js/src/interpolator/hsl.js");
/* harmony import */ var _src_interpolator_hsv_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./src/interpolator/hsv.js */ "./node_modules/chroma-js/src/interpolator/hsv.js");
/* harmony import */ var _src_interpolator_oklab_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./src/interpolator/oklab.js */ "./node_modules/chroma-js/src/interpolator/oklab.js");
/* harmony import */ var _src_interpolator_oklch_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./src/interpolator/oklch.js */ "./node_modules/chroma-js/src/interpolator/oklch.js");
/* harmony import */ var _src_generator_average_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./src/generator/average.js */ "./node_modules/chroma-js/src/generator/average.js");
/* harmony import */ var _src_generator_bezier_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./src/generator/bezier.js */ "./node_modules/chroma-js/src/generator/bezier.js");
/* harmony import */ var _src_generator_blend_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./src/generator/blend.js */ "./node_modules/chroma-js/src/generator/blend.js");
/* harmony import */ var _src_generator_cubehelix_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./src/generator/cubehelix.js */ "./node_modules/chroma-js/src/generator/cubehelix.js");
/* harmony import */ var _src_generator_mix_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./src/generator/mix.js */ "./node_modules/chroma-js/src/generator/mix.js");
/* harmony import */ var _src_generator_random_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./src/generator/random.js */ "./node_modules/chroma-js/src/generator/random.js");
/* harmony import */ var _src_generator_scale_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./src/generator/scale.js */ "./node_modules/chroma-js/src/generator/scale.js");
/* harmony import */ var _src_utils_analyze_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./src/utils/analyze.js */ "./node_modules/chroma-js/src/utils/analyze.js");
/* harmony import */ var _src_utils_contrast_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./src/utils/contrast.js */ "./node_modules/chroma-js/src/utils/contrast.js");
/* harmony import */ var _src_utils_contrastAPCA_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./src/utils/contrastAPCA.js */ "./node_modules/chroma-js/src/utils/contrastAPCA.js");
/* harmony import */ var _src_utils_delta_e_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./src/utils/delta-e.js */ "./node_modules/chroma-js/src/utils/delta-e.js");
/* harmony import */ var _src_utils_distance_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./src/utils/distance.js */ "./node_modules/chroma-js/src/utils/distance.js");
/* harmony import */ var _src_utils_valid_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./src/utils/valid.js */ "./node_modules/chroma-js/src/utils/valid.js");
/* harmony import */ var _src_io_input_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./src/io/input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _src_utils_scales_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./src/utils/scales.js */ "./node_modules/chroma-js/src/utils/scales.js");
/* harmony import */ var _src_colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./src/colors/w3cx11.js */ "./node_modules/chroma-js/src/colors/w3cx11.js");
/* harmony import */ var _src_colors_colorbrewer_js__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./src/colors/colorbrewer.js */ "./node_modules/chroma-js/src/colors/colorbrewer.js");
/* harmony import */ var _src_Color_js__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./src/Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _src_io_cmyk_index_js__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./src/io/cmyk/index.js */ "./node_modules/chroma-js/src/io/cmyk/index.js");
/* harmony import */ var _src_io_css_index_js__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./src/io/css/index.js */ "./node_modules/chroma-js/src/io/css/index.js");
/* harmony import */ var _src_io_gl_index_js__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./src/io/gl/index.js */ "./node_modules/chroma-js/src/io/gl/index.js");
/* harmony import */ var _src_io_hcg_index_js__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./src/io/hcg/index.js */ "./node_modules/chroma-js/src/io/hcg/index.js");
/* harmony import */ var _src_io_hex_index_js__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./src/io/hex/index.js */ "./node_modules/chroma-js/src/io/hex/index.js");
/* harmony import */ var _src_io_hsi_index_js__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./src/io/hsi/index.js */ "./node_modules/chroma-js/src/io/hsi/index.js");
/* harmony import */ var _src_io_hsl_index_js__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./src/io/hsl/index.js */ "./node_modules/chroma-js/src/io/hsl/index.js");
/* harmony import */ var _src_io_hsv_index_js__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./src/io/hsv/index.js */ "./node_modules/chroma-js/src/io/hsv/index.js");
/* harmony import */ var _src_io_lab_index_js__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./src/io/lab/index.js */ "./node_modules/chroma-js/src/io/lab/index.js");
/* harmony import */ var _src_io_lch_index_js__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./src/io/lch/index.js */ "./node_modules/chroma-js/src/io/lch/index.js");
/* harmony import */ var _src_io_num_index_js__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./src/io/num/index.js */ "./node_modules/chroma-js/src/io/num/index.js");
/* harmony import */ var _src_io_rgb_index_js__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ./src/io/rgb/index.js */ "./node_modules/chroma-js/src/io/rgb/index.js");
/* harmony import */ var _src_io_temp_index_js__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! ./src/io/temp/index.js */ "./node_modules/chroma-js/src/io/temp/index.js");
/* harmony import */ var _src_io_oklab_index_js__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! ./src/io/oklab/index.js */ "./node_modules/chroma-js/src/io/oklab/index.js");
/* harmony import */ var _src_io_oklch_index_js__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! ./src/io/oklch/index.js */ "./node_modules/chroma-js/src/io/oklch/index.js");
// feel free to comment out anything to rollup
// a smaller chroma.js bundle


// io --> convert colors


// operators --> modify existing Colors











// interpolators












// generators -- > create new colors








// other utility methods









// scale


// colors




Object.assign(_src_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"], {
    analyze: _src_utils_analyze_js__WEBPACK_IMPORTED_MODULE_30__.analyze,
    average: _src_generator_average_js__WEBPACK_IMPORTED_MODULE_23__["default"],
    bezier: _src_generator_bezier_js__WEBPACK_IMPORTED_MODULE_24__["default"],
    blend: _src_generator_blend_js__WEBPACK_IMPORTED_MODULE_25__["default"],
    brewer: _src_colors_colorbrewer_js__WEBPACK_IMPORTED_MODULE_39__["default"],
    Color: _src_Color_js__WEBPACK_IMPORTED_MODULE_40__["default"],
    colors: _src_colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_38__["default"],
    contrast: _src_utils_contrast_js__WEBPACK_IMPORTED_MODULE_31__["default"],
    contrastAPCA: _src_utils_contrastAPCA_js__WEBPACK_IMPORTED_MODULE_32__["default"],
    cubehelix: _src_generator_cubehelix_js__WEBPACK_IMPORTED_MODULE_26__["default"],
    deltaE: _src_utils_delta_e_js__WEBPACK_IMPORTED_MODULE_33__["default"],
    distance: _src_utils_distance_js__WEBPACK_IMPORTED_MODULE_34__["default"],
    input: _src_io_input_js__WEBPACK_IMPORTED_MODULE_36__["default"],
    interpolate: _src_generator_mix_js__WEBPACK_IMPORTED_MODULE_27__["default"],
    limits: _src_utils_analyze_js__WEBPACK_IMPORTED_MODULE_30__.limits,
    mix: _src_generator_mix_js__WEBPACK_IMPORTED_MODULE_27__["default"],
    random: _src_generator_random_js__WEBPACK_IMPORTED_MODULE_28__["default"],
    scale: _src_generator_scale_js__WEBPACK_IMPORTED_MODULE_29__["default"],
    scales: _src_utils_scales_js__WEBPACK_IMPORTED_MODULE_37__["default"],
    valid: _src_utils_valid_js__WEBPACK_IMPORTED_MODULE_35__["default"]
});

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_src_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"]);




















/***/ }),

/***/ "./node_modules/chroma-js/src/Color.js":
/*!*********************************************!*\
  !*** ./node_modules/chroma-js/src/Color.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _io_input_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./io/input.js */ "./node_modules/chroma-js/src/io/input.js");



class Color {
    constructor(...args) {
        const me = this;
        if (
            (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args[0]) === 'object' &&
            args[0].constructor &&
            args[0].constructor === this.constructor
        ) {
            // the argument is already a Color instance
            return args[0];
        }
        // last argument could be the mode
        let mode = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.last)(args);
        let autodetect = false;
        if (!mode) {
            autodetect = true;

            if (!_io_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].sorted) {
                _io_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].autodetect = _io_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].autodetect.sort((a, b) => b.p - a.p);
                _io_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].sorted = true;
            }

            // auto-detect format
            for (let chk of _io_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].autodetect) {
                mode = chk.test(...args);
                if (mode) break;
            }
        }
        if (_io_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].format[mode]) {
            const rgb = _io_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].format[mode].apply(
                null,
                autodetect ? args : args.slice(0, -1)
            );
            me._rgb = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.clip_rgb)(rgb);
        } else {
            throw new Error('unknown format: ' + args);
        }
        // add alpha channel
        if (me._rgb.length === 3) me._rgb.push(1);
    }
    toString() {
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(this.hex) == 'function') return this.hex();
        return `[${this._rgb.join(',')}]`;
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Color);


/***/ }),

/***/ "./node_modules/chroma-js/src/chroma.js":
/*!**********************************************!*\
  !*** ./node_modules/chroma-js/src/chroma.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./version.js */ "./node_modules/chroma-js/src/version.js");



const chroma = (...args) => {
    return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](...args);
};

chroma.version = _version_js__WEBPACK_IMPORTED_MODULE_1__.version;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (chroma);


/***/ }),

/***/ "./node_modules/chroma-js/src/colors/colorbrewer.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/colors/colorbrewer.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
    ColorBrewer colors for chroma.js

    Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
    Pennsylvania State University.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software distributed
    under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
    CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

const colorbrewer = {
    // sequential
    OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
    PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
    BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
    Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
    BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
    YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
    YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
    Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
    RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
    Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
    Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
    GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
    Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
    YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
    Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
    Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

    // diverging
    Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
    RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
    RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
    PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
    PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
    RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
    BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
    RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
    PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

    // qualitative
    Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
    Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
    Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
    Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
    Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
    Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
    Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
    Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
};

const colorbrewerTypes = Object.keys(colorbrewer);
const typeMap = new Map(colorbrewerTypes.map((key) => [key.toLowerCase(), key]));

// use Proxy to allow case-insensitive access to palettes
const colorbrewerProxy =
    typeof Proxy === 'function'
        ? new Proxy(colorbrewer, {
              get(target, prop) {
                  const lower = prop.toLowerCase();
                  if (typeMap.has(lower)) {
                      return target[typeMap.get(lower)];
                  }
              },
              getOwnPropertyNames() {
                  return Object.getOwnPropertyNames(colorbrewerTypes);
              }
          })
        : colorbrewer;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (colorbrewerProxy);


/***/ }),

/***/ "./node_modules/chroma-js/src/colors/w3cx11.js":
/*!*****************************************************!*\
  !*** ./node_modules/chroma-js/src/colors/w3cx11.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
	X11 color names

	http://www.w3.org/TR/css3-color/#svg-color
*/

const w3cx11 = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    grey: '#808080',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    laserlemon: '#ffff54',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrod: '#fafad2',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    maroon2: '#7f0000',
    maroon3: '#b03060',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    purple2: '#7f007f',
    purple3: '#a020f0',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32'
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (w3cx11);


/***/ }),

/***/ "./node_modules/chroma-js/src/generator/average.js":
/*!*********************************************************!*\
  !*** ./node_modules/chroma-js/src/generator/average.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");



const { pow, sqrt, PI, cos, sin, atan2 } = Math;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((colors, mode = 'lrgb', weights = null) => {
    const l = colors.length;
    if (!weights) weights = Array.from(new Array(l)).map(() => 1);
    // normalize weights
    const k =
        l /
        weights.reduce(function (a, b) {
            return a + b;
        });
    weights.forEach((w, i) => {
        weights[i] *= k;
    });
    // convert colors to Color objects
    colors = colors.map((c) => new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](c));
    if (mode === 'lrgb') {
        return _average_lrgb(colors, weights);
    }
    const first = colors.shift();
    const xyz = first.get(mode);
    const cnt = [];
    let dx = 0;
    let dy = 0;
    // initial color
    for (let i = 0; i < xyz.length; i++) {
        xyz[i] = (xyz[i] || 0) * weights[0];
        cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
        if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
            const A = (xyz[i] / 180) * PI;
            dx += cos(A) * weights[0];
            dy += sin(A) * weights[0];
        }
    }

    let alpha = first.alpha() * weights[0];
    colors.forEach((c, ci) => {
        const xyz2 = c.get(mode);
        alpha += c.alpha() * weights[ci + 1];
        for (let i = 0; i < xyz.length; i++) {
            if (!isNaN(xyz2[i])) {
                cnt[i] += weights[ci + 1];
                if (mode.charAt(i) === 'h') {
                    const A = (xyz2[i] / 180) * PI;
                    dx += cos(A) * weights[ci + 1];
                    dy += sin(A) * weights[ci + 1];
                } else {
                    xyz[i] += xyz2[i] * weights[ci + 1];
                }
            }
        }
    });

    for (let i = 0; i < xyz.length; i++) {
        if (mode.charAt(i) === 'h') {
            let A = (atan2(dy / cnt[i], dx / cnt[i]) / PI) * 180;
            while (A < 0) A += 360;
            while (A >= 360) A -= 360;
            xyz[i] = A;
        } else {
            xyz[i] = xyz[i] / cnt[i];
        }
    }
    alpha /= l;
    return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](xyz, mode).alpha(alpha > 0.99999 ? 1 : alpha, true);
});

const _average_lrgb = (colors, weights) => {
    const l = colors.length;
    const xyz = [0, 0, 0, 0];
    for (let i = 0; i < colors.length; i++) {
        const col = colors[i];
        const f = weights[i] / l;
        const rgb = col._rgb;
        xyz[0] += pow(rgb[0], 2) * f;
        xyz[1] += pow(rgb[1], 2) * f;
        xyz[2] += pow(rgb[2], 2) * f;
        xyz[3] += rgb[3] * f;
    }
    xyz[0] = sqrt(xyz[0]);
    xyz[1] = sqrt(xyz[1]);
    xyz[2] = sqrt(xyz[2]);
    if (xyz[3] > 0.9999999) xyz[3] = 1;
    return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.clip_rgb)(xyz));
};


/***/ }),

/***/ "./node_modules/chroma-js/src/generator/bezier.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/generator/bezier.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _io_lab_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../io/lab/index.js */ "./node_modules/chroma-js/src/io/lab/index.js");
/* harmony import */ var _scale_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scale.js */ "./node_modules/chroma-js/src/generator/scale.js");
//
// interpolates between a set of colors uzing a bezier spline
//

// @requires utils lab




// nth row of the pascal triangle
const binom_row = function (n) {
    let row = [1, 1];
    for (let i = 1; i < n; i++) {
        let newrow = [1];
        for (let j = 1; j <= row.length; j++) {
            newrow[j] = (row[j] || 0) + row[j - 1];
        }
        row = newrow;
    }
    return row;
};

const bezier = function (colors) {
    let I, lab0, lab1, lab2;
    colors = colors.map((c) => new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](c));
    if (colors.length === 2) {
        // linear interpolation
        [lab0, lab1] = colors.map((c) => c.lab());
        I = function (t) {
            const lab = [0, 1, 2].map((i) => lab0[i] + t * (lab1[i] - lab0[i]));
            return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](lab, 'lab');
        };
    } else if (colors.length === 3) {
        // quadratic bezier interpolation
        [lab0, lab1, lab2] = colors.map((c) => c.lab());
        I = function (t) {
            const lab = [0, 1, 2].map(
                (i) =>
                    (1 - t) * (1 - t) * lab0[i] +
                    2 * (1 - t) * t * lab1[i] +
                    t * t * lab2[i]
            );
            return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](lab, 'lab');
        };
    } else if (colors.length === 4) {
        // cubic bezier interpolation
        let lab3;
        [lab0, lab1, lab2, lab3] = colors.map((c) => c.lab());
        I = function (t) {
            const lab = [0, 1, 2].map(
                (i) =>
                    (1 - t) * (1 - t) * (1 - t) * lab0[i] +
                    3 * (1 - t) * (1 - t) * t * lab1[i] +
                    3 * (1 - t) * t * t * lab2[i] +
                    t * t * t * lab3[i]
            );
            return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](lab, 'lab');
        };
    } else if (colors.length >= 5) {
        // general case (degree n bezier)
        let labs, row, n;
        labs = colors.map((c) => c.lab());
        n = colors.length - 1;
        row = binom_row(n);
        I = function (t) {
            const u = 1 - t;
            const lab = [0, 1, 2].map((i) =>
                labs.reduce(
                    (sum, el, j) =>
                        sum + row[j] * u ** (n - j) * t ** j * el[i],
                    0
                )
            );
            return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](lab, 'lab');
        };
    } else {
        throw new RangeError('No point in running bezier with only one color.');
    }
    return I;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((colors) => {
    const f = bezier(colors);
    f.scale = () => (0,_scale_js__WEBPACK_IMPORTED_MODULE_2__["default"])(f);
    return f;
});


/***/ }),

/***/ "./node_modules/chroma-js/src/generator/blend.js":
/*!*******************************************************!*\
  !*** ./node_modules/chroma-js/src/generator/blend.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_rgb_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/rgb/index.js */ "./node_modules/chroma-js/src/io/rgb/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/*
 * interpolates between a set of colors uzing a bezier spline
 * blend mode formulas taken from https://web.archive.org/web/20180110014946/http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
 */




const blend = (bottom, top, mode) => {
    if (!blend[mode]) {
        throw new Error('unknown blend mode ' + mode);
    }
    return blend[mode](bottom, top);
};

const blend_f = (f) => (bottom, top) => {
    const c0 = (0,_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"])(top).rgb();
    const c1 = (0,_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"])(bottom).rgb();
    return _chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].rgb(f(c0, c1));
};

const each = (f) => (c0, c1) => {
    const out = [];
    out[0] = f(c0[0], c1[0]);
    out[1] = f(c0[1], c1[1]);
    out[2] = f(c0[2], c1[2]);
    return out;
};

const normal = (a) => a;
const multiply = (a, b) => (a * b) / 255;
const darken = (a, b) => (a > b ? b : a);
const lighten = (a, b) => (a > b ? a : b);
const screen = (a, b) => 255 * (1 - (1 - a / 255) * (1 - b / 255));
const overlay = (a, b) =>
    b < 128 ? (2 * a * b) / 255 : 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255));
const burn = (a, b) => 255 * (1 - (1 - b / 255) / (a / 255));
const dodge = (a, b) => {
    if (a === 255) return 255;
    a = (255 * (b / 255)) / (1 - a / 255);
    return a > 255 ? 255 : a;
};

// # add = (a,b) ->
// #     if (a + b > 255) then 255 else a + b

blend.normal = blend_f(each(normal));
blend.multiply = blend_f(each(multiply));
blend.screen = blend_f(each(screen));
blend.overlay = blend_f(each(overlay));
blend.darken = blend_f(each(darken));
blend.lighten = blend_f(each(lighten));
blend.dodge = blend_f(each(dodge));
blend.burn = blend_f(each(burn));
// blend.add = blend_f(each(add));

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (blend);


/***/ }),

/***/ "./node_modules/chroma-js/src/generator/cubehelix.js":
/*!***********************************************************!*\
  !*** ./node_modules/chroma-js/src/generator/cubehelix.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
// cubehelix interpolation
// based on D.A. Green "A colour scheme for the display of astronomical intensity images"
// http://astron-soc.in/bulletin/11June/289392011.pdf


const { pow, sin, cos } = Math;

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(start = 300,
    rotations = -1.5,
    hue = 1,
    gamma = 1,
    lightness = [0, 1]
) {
    let dh = 0,
        dl;
    if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(lightness) === 'array') {
        dl = lightness[1] - lightness[0];
    } else {
        dl = 0;
        lightness = [lightness, lightness];
    }
    const f = function (fract) {
        const a = _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI * ((start + 120) / 360 + rotations * fract);
        const l = pow(lightness[0] + dl * fract, gamma);
        const h = dh !== 0 ? hue[0] + fract * dh : hue;
        const amp = (h * l * (1 - l)) / 2;
        const cos_a = cos(a);
        const sin_a = sin(a);
        const r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
        const g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
        const b = l + amp * (+1.97294 * cos_a);
        return (0,_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.clip_rgb)([r * 255, g * 255, b * 255, 1]));
    };
    f.start = function (s) {
        if (s == null) {
            return start;
        }
        start = s;
        return f;
    };
    f.rotations = function (r) {
        if (r == null) {
            return rotations;
        }
        rotations = r;
        return f;
    };
    f.gamma = function (g) {
        if (g == null) {
            return gamma;
        }
        gamma = g;
        return f;
    };
    f.hue = function (h) {
        if (h == null) {
            return hue;
        }
        hue = h;
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(hue) === 'array') {
            dh = hue[1] - hue[0];
            if (dh === 0) {
                hue = hue[1];
            }
        } else {
            dh = 0;
        }
        return f;
    };
    f.lightness = function (h) {
        if (h == null) {
            return lightness;
        }
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(h) === 'array') {
            lightness = h;
            dl = h[1] - h[0];
        } else {
            lightness = [h, h];
            dl = 0;
        }
        return f;
    };
    f.scale = () => _chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].scale(f);
    f.hue(hue);
    return f;
}


/***/ }),

/***/ "./node_modules/chroma-js/src/generator/mix.js":
/*!*****************************************************!*\
  !*** ./node_modules/chroma-js/src/generator/mix.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _interpolator_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../interpolator/index.js */ "./node_modules/chroma-js/src/interpolator/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((col1, col2, f = 0.5, ...rest) => {
    let mode = rest[0] || 'lrgb';
    if (!_interpolator_index_js__WEBPACK_IMPORTED_MODULE_2__["default"][mode] && !rest.length) {
        // fall back to the first supported mode
        mode = Object.keys(_interpolator_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])[0];
    }
    if (!_interpolator_index_js__WEBPACK_IMPORTED_MODULE_2__["default"][mode]) {
        throw new Error(`interpolation mode ${mode} is not defined`);
    }
    if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(col1) !== 'object') col1 = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](col1);
    if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(col2) !== 'object') col2 = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](col2);
    return _interpolator_index_js__WEBPACK_IMPORTED_MODULE_2__["default"][mode](col1, col2, f).alpha(
        col1.alpha() + f * (col2.alpha() - col1.alpha())
    );
});


/***/ }),

/***/ "./node_modules/chroma-js/src/generator/random.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/generator/random.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");

const digits = '0123456789abcdef';

const { floor, random } = Math;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (() => {
    let code = '#';
    for (let i = 0; i < 6; i++) {
        code += digits.charAt(floor(random() * 16));
    }
    return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](code, 'hex');
});


/***/ }),

/***/ "./node_modules/chroma-js/src/generator/scale.js":
/*!*******************************************************!*\
  !*** ./node_modules/chroma-js/src/generator/scale.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
// minimal multi-purpose interface

// @requires utils color analyze



const { pow } = Math;

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(colors) {
    // constructor
    let _mode = 'rgb';
    let _nacol = (0,_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"])('#ccc');
    let _spread = 0;
    // const _fixed = false;
    let _domain = [0, 1];
    let _pos = [];
    let _padding = [0, 0];
    let _classes = false;
    let _colors = [];
    let _out = false;
    let _min = 0;
    let _max = 1;
    let _correctLightness = false;
    let _colorCache = {};
    let _useCache = true;
    let _gamma = 1;

    // private methods

    const setColors = function (colors) {
        colors = colors || ['#fff', '#000'];
        if (
            colors &&
            (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(colors) === 'string' &&
            _chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].brewer &&
            _chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].brewer[colors.toLowerCase()]
        ) {
            colors = _chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].brewer[colors.toLowerCase()];
        }
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(colors) === 'array') {
            // handle single color
            if (colors.length === 1) {
                colors = [colors[0], colors[0]];
            }
            // make a copy of the colors
            colors = colors.slice(0);
            // convert to chroma classes
            for (let c = 0; c < colors.length; c++) {
                colors[c] = (0,_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"])(colors[c]);
            }
            // auto-fill color position
            _pos.length = 0;
            for (let c = 0; c < colors.length; c++) {
                _pos.push(c / (colors.length - 1));
            }
        }
        resetCache();
        return (_colors = colors);
    };

    const getClass = function (value) {
        if (_classes != null) {
            const n = _classes.length - 1;
            let i = 0;
            while (i < n && value >= _classes[i]) {
                i++;
            }
            return i - 1;
        }
        return 0;
    };

    let tMapLightness = (t) => t;
    let tMapDomain = (t) => t;

    // const classifyValue = function(value) {
    //     let val = value;
    //     if (_classes.length > 2) {
    //         const n = _classes.length-1;
    //         const i = getClass(value);
    //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
    //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
    //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
    //     }
    //     return val;
    // };

    const getColor = function (val, bypassMap) {
        let col, t;
        if (bypassMap == null) {
            bypassMap = false;
        }
        if (isNaN(val) || val === null) {
            return _nacol;
        }
        if (!bypassMap) {
            if (_classes && _classes.length > 2) {
                // find the class
                const c = getClass(val);
                t = c / (_classes.length - 2);
            } else if (_max !== _min) {
                // just interpolate between min/max
                t = (val - _min) / (_max - _min);
            } else {
                t = 1;
            }
        } else {
            t = val;
        }

        // domain map
        t = tMapDomain(t);

        if (!bypassMap) {
            t = tMapLightness(t); // lightness correction
        }

        if (_gamma !== 1) {
            t = pow(t, _gamma);
        }

        t = _padding[0] + t * (1 - _padding[0] - _padding[1]);

        t = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.limit)(t, 0, 1);

        const k = Math.floor(t * 10000);

        if (_useCache && _colorCache[k]) {
            col = _colorCache[k];
        } else {
            if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(_colors) === 'array') {
                //for i in [0.._pos.length-1]
                for (let i = 0; i < _pos.length; i++) {
                    const p = _pos[i];
                    if (t <= p) {
                        col = _colors[i];
                        break;
                    }
                    if (t >= p && i === _pos.length - 1) {
                        col = _colors[i];
                        break;
                    }
                    if (t > p && t < _pos[i + 1]) {
                        t = (t - p) / (_pos[i + 1] - p);
                        col = _chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].interpolate(
                            _colors[i],
                            _colors[i + 1],
                            t,
                            _mode
                        );
                        break;
                    }
                }
            } else if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(_colors) === 'function') {
                col = _colors(t);
            }
            if (_useCache) {
                _colorCache[k] = col;
            }
        }
        return col;
    };

    var resetCache = () => (_colorCache = {});

    setColors(colors);

    // public interface

    const f = function (v) {
        const c = (0,_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"])(getColor(v));
        if (_out && c[_out]) {
            return c[_out]();
        } else {
            return c;
        }
    };

    f.classes = function (classes) {
        if (classes != null) {
            if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(classes) === 'array') {
                _classes = classes;
                _domain = [classes[0], classes[classes.length - 1]];
            } else {
                const d = _chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].analyze(_domain);
                if (classes === 0) {
                    _classes = [d.min, d.max];
                } else {
                    _classes = _chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].limits(d, 'e', classes);
                }
            }
            return f;
        }
        return _classes;
    };

    f.domain = function (domain) {
        if (!arguments.length) {
            return _domain;
        }
        _min = domain[0];
        _max = domain[domain.length - 1];
        _pos = [];
        const k = _colors.length;
        if (domain.length === k && _min !== _max) {
            // update positions
            for (let d of Array.from(domain)) {
                _pos.push((d - _min) / (_max - _min));
            }
        } else {
            for (let c = 0; c < k; c++) {
                _pos.push(c / (k - 1));
            }
            if (domain.length > 2) {
                // set domain map
                const tOut = domain.map((d, i) => i / (domain.length - 1));
                const tBreaks = domain.map((d) => (d - _min) / (_max - _min));
                if (!tBreaks.every((val, i) => tOut[i] === val)) {
                    tMapDomain = (t) => {
                        if (t <= 0 || t >= 1) return t;
                        let i = 0;
                        while (t >= tBreaks[i + 1]) i++;
                        const f =
                            (t - tBreaks[i]) / (tBreaks[i + 1] - tBreaks[i]);
                        const out = tOut[i] + f * (tOut[i + 1] - tOut[i]);
                        return out;
                    };
                }
            }
        }
        _domain = [_min, _max];
        return f;
    };

    f.mode = function (_m) {
        if (!arguments.length) {
            return _mode;
        }
        _mode = _m;
        resetCache();
        return f;
    };

    f.range = function (colors, _pos) {
        setColors(colors, _pos);
        return f;
    };

    f.out = function (_o) {
        _out = _o;
        return f;
    };

    f.spread = function (val) {
        if (!arguments.length) {
            return _spread;
        }
        _spread = val;
        return f;
    };

    f.correctLightness = function (v) {
        if (v == null) {
            v = true;
        }
        _correctLightness = v;
        resetCache();
        if (_correctLightness) {
            tMapLightness = function (t) {
                const L0 = getColor(0, true).lab()[0];
                const L1 = getColor(1, true).lab()[0];
                const pol = L0 > L1;
                let L_actual = getColor(t, true).lab()[0];
                const L_ideal = L0 + (L1 - L0) * t;
                let L_diff = L_actual - L_ideal;
                let t0 = 0;
                let t1 = 1;
                let max_iter = 20;
                while (Math.abs(L_diff) > 1e-2 && max_iter-- > 0) {
                    (function () {
                        if (pol) {
                            L_diff *= -1;
                        }
                        if (L_diff < 0) {
                            t0 = t;
                            t += (t1 - t) * 0.5;
                        } else {
                            t1 = t;
                            t += (t0 - t) * 0.5;
                        }
                        L_actual = getColor(t, true).lab()[0];
                        return (L_diff = L_actual - L_ideal);
                    })();
                }
                return t;
            };
        } else {
            tMapLightness = (t) => t;
        }
        return f;
    };

    f.padding = function (p) {
        if (p != null) {
            if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(p) === 'number') {
                p = [p, p];
            }
            _padding = p;
            return f;
        } else {
            return _padding;
        }
    };

    f.colors = function (numColors, out) {
        // If no arguments are given, return the original colors that were provided
        if (arguments.length < 2) {
            out = 'hex';
        }
        let result = [];

        if (arguments.length === 0) {
            result = _colors.slice(0);
        } else if (numColors === 1) {
            result = [f(0.5)];
        } else if (numColors > 1) {
            const dm = _domain[0];
            const dd = _domain[1] - dm;
            result = __range__(0, numColors, false).map((i) =>
                f(dm + (i / (numColors - 1)) * dd)
            );
        } else {
            // returns all colors based on the defined classes
            colors = [];
            let samples = [];
            if (_classes && _classes.length > 2) {
                for (
                    let i = 1, end = _classes.length, asc = 1 <= end;
                    asc ? i < end : i > end;
                    asc ? i++ : i--
                ) {
                    samples.push((_classes[i - 1] + _classes[i]) * 0.5);
                }
            } else {
                samples = _domain;
            }
            result = samples.map((v) => f(v));
        }

        if (_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"][out]) {
            result = result.map((c) => c[out]());
        }
        return result;
    };

    f.cache = function (c) {
        if (c != null) {
            _useCache = c;
            return f;
        } else {
            return _useCache;
        }
    };

    f.gamma = function (g) {
        if (g != null) {
            _gamma = g;
            return f;
        } else {
            return _gamma;
        }
    };

    f.nodata = function (d) {
        if (d != null) {
            _nacol = (0,_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"])(d);
            return f;
        } else {
            return _nacol;
        }
    };

    return f;
}

function __range__(left, right, inclusive) {
    let range = [];
    let ascending = left < right;
    let end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/_hsx.js":
/*!*********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/_hsx.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((col1, col2, f, m) => {
    let xyz0, xyz1;
    if (m === 'hsl') {
        xyz0 = col1.hsl();
        xyz1 = col2.hsl();
    } else if (m === 'hsv') {
        xyz0 = col1.hsv();
        xyz1 = col2.hsv();
    } else if (m === 'hcg') {
        xyz0 = col1.hcg();
        xyz1 = col2.hcg();
    } else if (m === 'hsi') {
        xyz0 = col1.hsi();
        xyz1 = col2.hsi();
    } else if (m === 'lch' || m === 'hcl') {
        m = 'hcl';
        xyz0 = col1.hcl();
        xyz1 = col2.hcl();
    } else if (m === 'oklch') {
        xyz0 = col1.oklch().reverse();
        xyz1 = col2.oklch().reverse();
    }

    let hue0, hue1, sat0, sat1, lbv0, lbv1;
    if (m.substr(0, 1) === 'h' || m === 'oklch') {
        [hue0, sat0, lbv0] = xyz0;
        [hue1, sat1, lbv1] = xyz1;
    }

    let sat, hue, lbv, dh;

    if (!isNaN(hue0) && !isNaN(hue1)) {
        // both colors have hue
        if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
        } else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
        } else {
            dh = hue1 - hue0;
        }
        hue = hue0 + f * dh;
    } else if (!isNaN(hue0)) {
        hue = hue0;
        if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') sat = sat0;
    } else if (!isNaN(hue1)) {
        hue = hue1;
        if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') sat = sat1;
    } else {
        hue = Number.NaN;
    }

    if (sat === undefined) sat = sat0 + f * (sat1 - sat0);
    lbv = lbv0 + f * (lbv1 - lbv0);
    return m === 'oklch'
        ? new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([lbv, sat, hue], m)
        : new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([hue, sat, lbv], m);
});


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/hcg.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/hcg.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_hcg_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/hcg/index.js */ "./node_modules/chroma-js/src/io/hcg/index.js");
/* harmony import */ var _hsx_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_hsx.js */ "./node_modules/chroma-js/src/interpolator/_hsx.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");




const hcg = (col1, col2, f) => {
    return (0,_hsx_js__WEBPACK_IMPORTED_MODULE_1__["default"])(col1, col2, f, 'hcg');
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].hcg = hcg;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hcg);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/hsi.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/hsi.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_hsi_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/hsi/index.js */ "./node_modules/chroma-js/src/io/hsi/index.js");
/* harmony import */ var _hsx_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_hsx.js */ "./node_modules/chroma-js/src/interpolator/_hsx.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");




const hsi = (col1, col2, f) => {
    return (0,_hsx_js__WEBPACK_IMPORTED_MODULE_1__["default"])(col1, col2, f, 'hsi');
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].hsi = hsi;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hsi);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/hsl.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/hsl.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_hsl_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/hsl/index.js */ "./node_modules/chroma-js/src/io/hsl/index.js");
/* harmony import */ var _hsx_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_hsx.js */ "./node_modules/chroma-js/src/interpolator/_hsx.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");




const hsl = (col1, col2, f) => {
    return (0,_hsx_js__WEBPACK_IMPORTED_MODULE_1__["default"])(col1, col2, f, 'hsl');
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].hsl = hsl;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hsl);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/hsv.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/hsv.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_hsv_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/hsv/index.js */ "./node_modules/chroma-js/src/io/hsv/index.js");
/* harmony import */ var _hsx_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_hsx.js */ "./node_modules/chroma-js/src/interpolator/_hsx.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");




const hsv = (col1, col2, f) => {
    return (0,_hsx_js__WEBPACK_IMPORTED_MODULE_1__["default"])(col1, col2, f, 'hsv');
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].hsv = hsv;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hsv);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({});


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/lab.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/lab.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_lab_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/lab/index.js */ "./node_modules/chroma-js/src/io/lab/index.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");




const lab = (col1, col2, f) => {
    const xyz0 = col1.lab();
    const xyz1 = col2.lab();
    return new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](
        xyz0[0] + f * (xyz1[0] - xyz0[0]),
        xyz0[1] + f * (xyz1[1] - xyz0[1]),
        xyz0[2] + f * (xyz1[2] - xyz0[2]),
        'lab'
    );
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].lab = lab;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lab);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/lch.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/lch.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_lch_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/lch/index.js */ "./node_modules/chroma-js/src/io/lch/index.js");
/* harmony import */ var _hsx_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_hsx.js */ "./node_modules/chroma-js/src/interpolator/_hsx.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");




const lch = (col1, col2, f) => {
    return (0,_hsx_js__WEBPACK_IMPORTED_MODULE_1__["default"])(col1, col2, f, 'lch');
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].lch = lch;
_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].hcl = lch;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lch);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/lrgb.js":
/*!*********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/lrgb.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");

const { sqrt, pow } = Math;


const lrgb = (col1, col2, f) => {
    const [x1, y1, z1] = col1._rgb;
    const [x2, y2, z2] = col2._rgb;
    return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](
        sqrt(pow(x1, 2) * (1 - f) + pow(x2, 2) * f),
        sqrt(pow(y1, 2) * (1 - f) + pow(y2, 2) * f),
        sqrt(pow(z1, 2) * (1 - f) + pow(z2, 2) * f),
        'rgb'
    );
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].lrgb = lrgb;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lrgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/num.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/num.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_num_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/num/index.js */ "./node_modules/chroma-js/src/io/num/index.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");





const num = (col1, col2, f) => {
    const c1 = col1.num();
    const c2 = col2.num();
    return new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](c1 + f * (c2 - c1), 'num');
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].num = num;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (num);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/oklab.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/oklab.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_oklab_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/oklab/index.js */ "./node_modules/chroma-js/src/io/oklab/index.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");




const oklab = (col1, col2, f) => {
    const xyz0 = col1.oklab();
    const xyz1 = col2.oklab();
    return new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](
        xyz0[0] + f * (xyz1[0] - xyz0[0]),
        xyz0[1] + f * (xyz1[1] - xyz0[1]),
        xyz0[2] + f * (xyz1[2] - xyz0[2]),
        'oklab'
    );
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].oklab = oklab;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (oklab);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/oklch.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/oklch.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _io_lch_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/lch/index.js */ "./node_modules/chroma-js/src/io/lch/index.js");
/* harmony import */ var _hsx_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_hsx.js */ "./node_modules/chroma-js/src/interpolator/_hsx.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");




const oklch = (col1, col2, f) => {
    return (0,_hsx_js__WEBPACK_IMPORTED_MODULE_1__["default"])(col1, col2, f, 'oklch');
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].oklch = oklch;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (oklch);


/***/ }),

/***/ "./node_modules/chroma-js/src/interpolator/rgb.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/interpolator/rgb.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.js */ "./node_modules/chroma-js/src/interpolator/index.js");



const rgb = (col1, col2, f) => {
    const xyz0 = col1._rgb;
    const xyz1 = col2._rgb;
    return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](
        xyz0[0] + f * (xyz1[0] - xyz0[0]),
        xyz0[1] + f * (xyz1[1] - xyz0[1]),
        xyz0[2] + f * (xyz1[2] - xyz0[2]),
        'rgb'
    );
};

// register interpolator
_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].rgb = rgb;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/cmyk/cmyk2rgb.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/cmyk/cmyk2rgb.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const cmyk2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'cmyk');
    const [c, m, y, k] = args;
    const alpha = args.length > 4 ? args[4] : 1;
    if (k === 1) return [0, 0, 0, alpha];
    return [
        c >= 1 ? 0 : 255 * (1 - c) * (1 - k), // r
        m >= 1 ? 0 : 255 * (1 - m) * (1 - k), // g
        y >= 1 ? 0 : 255 * (1 - y) * (1 - k), // b
        alpha
    ];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (cmyk2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/cmyk/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/cmyk/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cmyk: () => (/* binding */ cmyk)
/* harmony export */ });
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _cmyk2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cmyk2rgb.js */ "./node_modules/chroma-js/src/io/cmyk/cmyk2rgb.js");
/* harmony import */ var _rgb2cmyk_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2cmyk.js */ "./node_modules/chroma-js/src/io/cmyk/rgb2cmyk.js");







_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.cmyk = function () {
    return (0,_rgb2cmyk_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const cmyk = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](...args, 'cmyk');
Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"], { cmyk });

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.cmyk = _cmyk2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].autodetect.push({
    p: 2,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.unpack)(args, 'cmyk');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.type)(args) === 'array' && args.length === 4) {
            return 'cmyk';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/cmyk/rgb2cmyk.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/cmyk/rgb2cmyk.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { max } = Math;

const rgb2cmyk = (...args) => {
    let [r, g, b] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    r = r / 255;
    g = g / 255;
    b = b / 255;
    const k = 1 - max(r, max(g, b));
    const f = k < 1 ? 1 / (1 - k) : 0;
    const c = (1 - r - k) * f;
    const m = (1 - g - k) * f;
    const y = (1 - b - k) * f;
    return [c, m, y, k];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2cmyk);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/css2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/css2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _hsl_hsl2rgb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../hsl/hsl2rgb.js */ "./node_modules/chroma-js/src/io/hsl/hsl2rgb.js");
/* harmony import */ var _lab_lab2rgb_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lab/lab2rgb.js */ "./node_modules/chroma-js/src/io/lab/lab2rgb.js");
/* harmony import */ var _lch_lch2rgb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lch/lch2rgb.js */ "./node_modules/chroma-js/src/io/lch/lch2rgb.js");
/* harmony import */ var _oklab_oklab2rgb_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../oklab/oklab2rgb.js */ "./node_modules/chroma-js/src/io/oklab/oklab2rgb.js");
/* harmony import */ var _oklch_oklch2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../oklch/oklch2rgb.js */ "./node_modules/chroma-js/src/io/oklch/oklch2rgb.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _utils_limit_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/limit.js */ "./node_modules/chroma-js/src/utils/limit.js");
/* harmony import */ var _lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../lab/lab-constants.js */ "./node_modules/chroma-js/src/io/lab/lab-constants.js");









const INT_OR_PCT = /((?:-?\d+)|(?:-?\d+(?:\.\d+)?)%|none)/.source;
const FLOAT_OR_PCT = /((?:-?(?:\d+(?:\.\d*)?|\.\d+)%?)|none)/.source;
const PCT = /((?:-?(?:\d+(?:\.\d*)?|\.\d+)%)|none)/.source;
const RE_S = /\s*/.source;
const SEP = /\s+/.source;
const COMMA = /\s*,\s*/.source;
const ANLGE = /((?:-?(?:\d+(?:\.\d*)?|\.\d+)(?:deg)?)|none)/.source;
const ALPHA = /\s*(?:\/\s*((?:[01]|[01]?\.\d+)|\d+(?:\.\d+)?%))?/.source;

// e.g. rgb(250 20 0), rgb(100% 50% 20%), rgb(100% 50% 20% / 0.5)
const RE_RGB = new RegExp(
    '^rgba?\\(' +
        RE_S +
        [INT_OR_PCT, INT_OR_PCT, INT_OR_PCT].join(SEP) +
        ALPHA +
        '\\)$'
);
const RE_RGB_LEGACY = new RegExp(
    '^rgb\\(' +
        RE_S +
        [INT_OR_PCT, INT_OR_PCT, INT_OR_PCT].join(COMMA) +
        RE_S +
        '\\)$'
);
const RE_RGBA_LEGACY = new RegExp(
    '^rgba\\(' +
        RE_S +
        [INT_OR_PCT, INT_OR_PCT, INT_OR_PCT, FLOAT_OR_PCT].join(COMMA) +
        RE_S +
        '\\)$'
);

const RE_HSL = new RegExp(
    '^hsla?\\(' + RE_S + [ANLGE, PCT, PCT].join(SEP) + ALPHA + '\\)$'
);
const RE_HSL_LEGACY = new RegExp(
    '^hsl?\\(' + RE_S + [ANLGE, PCT, PCT].join(COMMA) + RE_S + '\\)$'
);
const RE_HSLA_LEGACY =
    /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

const RE_LAB = new RegExp(
    '^lab\\(' +
        RE_S +
        [FLOAT_OR_PCT, FLOAT_OR_PCT, FLOAT_OR_PCT].join(SEP) +
        ALPHA +
        '\\)$'
);
const RE_LCH = new RegExp(
    '^lch\\(' +
        RE_S +
        [FLOAT_OR_PCT, FLOAT_OR_PCT, ANLGE].join(SEP) +
        ALPHA +
        '\\)$'
);
const RE_OKLAB = new RegExp(
    '^oklab\\(' +
        RE_S +
        [FLOAT_OR_PCT, FLOAT_OR_PCT, FLOAT_OR_PCT].join(SEP) +
        ALPHA +
        '\\)$'
);
const RE_OKLCH = new RegExp(
    '^oklch\\(' +
        RE_S +
        [FLOAT_OR_PCT, FLOAT_OR_PCT, ANLGE].join(SEP) +
        ALPHA +
        '\\)$'
);

const { round } = Math;

const roundRGB = (rgb) => {
    return rgb.map((v, i) => (i <= 2 ? (0,_utils_limit_js__WEBPACK_IMPORTED_MODULE_6__["default"])(round(v), 0, 255) : v));
};

const percentToAbsolute = (pct, min = 0, max = 100, signed = false) => {
    if (typeof pct === 'string' && pct.endsWith('%')) {
        pct = parseFloat(pct.substring(0, pct.length - 1)) / 100;
        if (signed) {
            // signed percentages are in the range -100% to 100%
            pct = min + (pct + 1) * 0.5 * (max - min);
        } else {
            pct = min + pct * (max - min);
        }
    }
    return +pct;
};

const noneToValue = (v, noneValue) => {
    return v === 'none' ? noneValue : v;
};

const css2rgb = (css) => {
    css = css.toLowerCase().trim();

    if (css === 'transparent') {
        return [0, 0, 0, 0];
    }

    let m;

    if (_input_js__WEBPACK_IMPORTED_MODULE_5__["default"].format.named) {
        try {
            return _input_js__WEBPACK_IMPORTED_MODULE_5__["default"].format.named(css);
            // eslint-disable-next-line
        } catch (e) {}
    }

    // rgb(250 20 0) or rgb(250,20,0)
    if ((m = css.match(RE_RGB)) || (m = css.match(RE_RGB_LEGACY))) {
        let rgb = m.slice(1, 4);
        for (let i = 0; i < 3; i++) {
            rgb[i] = +percentToAbsolute(noneToValue(rgb[i], 0), 0, 255);
        }
        rgb = roundRGB(rgb);
        const alpha = m[4] !== undefined ? +percentToAbsolute(m[4], 0, 1) : 1;
        rgb[3] = alpha; // default alpha
        return rgb;
    }

    // rgba(250,20,0,0.4)
    if ((m = css.match(RE_RGBA_LEGACY))) {
        const rgb = m.slice(1, 5);
        for (let i = 0; i < 4; i++) {
            rgb[i] = +percentToAbsolute(rgb[i], 0, 255);
        }
        return rgb;
    }

    // hsl(0,100%,50%)
    if ((m = css.match(RE_HSL)) || (m = css.match(RE_HSL_LEGACY))) {
        const hsl = m.slice(1, 4);
        hsl[0] = +noneToValue(hsl[0].replace('deg', ''), 0);
        hsl[1] = +percentToAbsolute(noneToValue(hsl[1], 0), 0, 100) * 0.01;
        hsl[2] = +percentToAbsolute(noneToValue(hsl[2], 0), 0, 100) * 0.01;
        const rgb = roundRGB((0,_hsl_hsl2rgb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(hsl));
        const alpha = m[4] !== undefined ? +percentToAbsolute(m[4], 0, 1) : 1;
        rgb[3] = alpha;
        return rgb;
    }

    // hsla(0,100%,50%,0.5)
    if ((m = css.match(RE_HSLA_LEGACY))) {
        const hsl = m.slice(1, 4);
        hsl[1] *= 0.01;
        hsl[2] *= 0.01;
        const rgb = (0,_hsl_hsl2rgb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(hsl);
        for (let i = 0; i < 3; i++) {
            rgb[i] = round(rgb[i]);
        }
        rgb[3] = +m[4]; // default alpha = 1
        return rgb;
    }

    if ((m = css.match(RE_LAB))) {
        const lab = m.slice(1, 4);
        lab[0] = percentToAbsolute(noneToValue(lab[0], 0), 0, 100);
        lab[1] = percentToAbsolute(noneToValue(lab[1], 0), -125, 125, true);
        lab[2] = percentToAbsolute(noneToValue(lab[2], 0), -125, 125, true);
        // convert to D50 Lab whitepoint
        const wp = (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_7__.getLabWhitePoint)();
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_7__.setLabWhitePoint)('d50');
        const rgb = roundRGB((0,_lab_lab2rgb_js__WEBPACK_IMPORTED_MODULE_1__["default"])(lab));
        // convert back to original Lab whitepoint
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_7__.setLabWhitePoint)(wp);
        const alpha = m[4] !== undefined ? +percentToAbsolute(m[4], 0, 1) : 1;
        rgb[3] = alpha;
        return rgb;
    }

    if ((m = css.match(RE_LCH))) {
        const lch = m.slice(1, 4);
        lch[0] = percentToAbsolute(lch[0], 0, 100);
        lch[1] = percentToAbsolute(noneToValue(lch[1], 0), 0, 150, false);
        lch[2] = +noneToValue(lch[2].replace('deg', ''), 0);
        // convert to D50 Lab whitepoint
        const wp = (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_7__.getLabWhitePoint)();
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_7__.setLabWhitePoint)('d50');
        const rgb = roundRGB((0,_lch_lch2rgb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(lch));
        // convert back to original Lab whitepoint
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_7__.setLabWhitePoint)(wp);
        const alpha = m[4] !== undefined ? +percentToAbsolute(m[4], 0, 1) : 1;
        rgb[3] = alpha;
        return rgb;
    }

    if ((m = css.match(RE_OKLAB))) {
        const oklab = m.slice(1, 4);
        oklab[0] = percentToAbsolute(noneToValue(oklab[0], 0), 0, 1);
        oklab[1] = percentToAbsolute(noneToValue(oklab[1], 0), -0.4, 0.4, true);
        oklab[2] = percentToAbsolute(noneToValue(oklab[2], 0), -0.4, 0.4, true);
        const rgb = roundRGB((0,_oklab_oklab2rgb_js__WEBPACK_IMPORTED_MODULE_3__["default"])(oklab));
        const alpha = m[4] !== undefined ? +percentToAbsolute(m[4], 0, 1) : 1;
        rgb[3] = alpha;
        return rgb;
    }

    if ((m = css.match(RE_OKLCH))) {
        const oklch = m.slice(1, 4);
        oklch[0] = percentToAbsolute(noneToValue(oklch[0], 0), 0, 1);
        oklch[1] = percentToAbsolute(noneToValue(oklch[1], 0), 0, 0.4, false);
        oklch[2] = +noneToValue(oklch[2].replace('deg', ''), 0);
        const rgb = roundRGB((0,_oklch_oklch2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"])(oklch));
        const alpha = m[4] !== undefined ? +percentToAbsolute(m[4], 0, 1) : 1;
        rgb[3] = alpha;
        return rgb;
    }
};

css2rgb.test = (s) => {
    return (
        // modern
        RE_RGB.test(s) ||
        RE_HSL.test(s) ||
        RE_LAB.test(s) ||
        RE_LCH.test(s) ||
        RE_OKLAB.test(s) ||
        RE_OKLCH.test(s) ||
        // legacy
        RE_RGB_LEGACY.test(s) ||
        RE_RGBA_LEGACY.test(s) ||
        RE_HSL_LEGACY.test(s) ||
        RE_HSLA_LEGACY.test(s) ||
        s === 'transparent'
    );
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (css2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/hsl2css.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/hsl2css.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


/*
 * supported arguments:
 * - hsl2css(h,s,l)
 * - hsl2css(h,s,l,a)
 * - hsl2css([h,s,l], mode)
 * - hsl2css([h,s,l,a], mode)
 * - hsl2css({h,s,l,a}, mode)
 */
const hsl2css = (...args) => {
    const hsla = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hsla');
    let mode = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.last)(args) || 'lsa';
    hsla[0] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(hsla[0] || 0) + 'deg';
    hsla[1] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(hsla[1] * 100) + '%';
    hsla[2] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(hsla[2] * 100) + '%';
    if (mode === 'hsla' || (hsla.length > 3 && hsla[3] < 1)) {
        hsla[3] = '/ ' + (hsla.length > 3 ? hsla[3] : 1);
        mode = 'hsla';
    } else {
        hsla.length = 3;
    }
    return `${mode.substr(0, 3)}(${hsla.join(' ')})`;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hsl2css);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   css: () => (/* binding */ css)
/* harmony export */ });
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _rgb2css_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./rgb2css.js */ "./node_modules/chroma-js/src/io/css/rgb2css.js");
/* harmony import */ var _css2rgb_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./css2rgb.js */ "./node_modules/chroma-js/src/io/css/css2rgb.js");








_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.css = function (mode) {
    return (0,_rgb2css_js__WEBPACK_IMPORTED_MODULE_4__["default"])(this._rgb, mode);
};

const css = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](...args, 'css');
_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].css = css;

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.css = _css2rgb_js__WEBPACK_IMPORTED_MODULE_5__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].autodetect.push({
    p: 5,
    test: (h, ...rest) => {
        if (!rest.length && (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.type)(h) === 'string' && _css2rgb_js__WEBPACK_IMPORTED_MODULE_5__["default"].test(h)) {
            return 'css';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/lab2css.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/lab2css.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


/*
 * supported arguments:
 * - lab2css(l,a,b)
 * - lab2css(l,a,b,alpha)
 * - lab2css([l,a,b], mode)
 * - lab2css([l,a,b,alpha], mode)
 */
const lab2css = (...args) => {
    const laba = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lab');
    let mode = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.last)(args) || 'lab';
    laba[0] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(laba[0]) + '%';
    laba[1] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(laba[1]);
    laba[2] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(laba[2]);
    if (mode === 'laba' || (laba.length > 3 && laba[3] < 1)) {
        laba[3] = '/ ' + (laba.length > 3 ? laba[3] : 1);
    } else {
        laba.length = 3;
    }
    return `lab(${laba.join(' ')})`;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lab2css);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/lch2css.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/lch2css.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


/*
 * supported arguments:
 * - lab2css(l,a,b)
 * - lab2css(l,a,b,alpha)
 * - lab2css([l,a,b], mode)
 * - lab2css([l,a,b,alpha], mode)
 */
const lch2css = (...args) => {
    const lcha = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lch');
    let mode = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.last)(args) || 'lab';
    lcha[0] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(lcha[0]) + '%';
    lcha[1] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(lcha[1]);
    lcha[2] = isNaN(lcha[2]) ? 'none' : (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(lcha[2]) + 'deg'; // add deg unit to hue
    if (mode === 'lcha' || (lcha.length > 3 && lcha[3] < 1)) {
        lcha[3] = '/ ' + (lcha.length > 3 ? lcha[3] : 1);
    } else {
        lcha.length = 3;
    }
    return `lch(${lcha.join(' ')})`;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lch2css);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/oklab2css.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/oklab2css.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const oklab2css = (...args) => {
    const laba = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lab');
    laba[0] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(laba[0] * 100) + '%';
    laba[1] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd3)(laba[1]);
    laba[2] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd3)(laba[2]);
    if (laba.length > 3 && laba[3] < 1) {
        laba[3] = '/ ' + (laba.length > 3 ? laba[3] : 1);
    } else {
        laba.length = 3;
    }
    return `oklab(${laba.join(' ')})`;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (oklab2css);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/oklch2css.js":
/*!********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/oklch2css.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const oklch2css = (...args) => {
    const lcha = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lch');
    lcha[0] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(lcha[0] * 100) + '%';
    lcha[1] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd3)(lcha[1]);
    lcha[2] = isNaN(lcha[2]) ? 'none' : (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.rnd2)(lcha[2]) + 'deg'; // add deg unit to hue
    if (lcha.length > 3 && lcha[3] < 1) {
        lcha[3] = '/ ' + (lcha.length > 3 ? lcha[3] : 1);
    } else {
        lcha.length = 3;
    }
    return `oklch(${lcha.join(' ')})`;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (oklch2css);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/css/rgb2css.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/css/rgb2css.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _hsl2css_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./hsl2css.js */ "./node_modules/chroma-js/src/io/css/hsl2css.js");
/* harmony import */ var _hsl_rgb2hsl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hsl/rgb2hsl.js */ "./node_modules/chroma-js/src/io/hsl/rgb2hsl.js");
/* harmony import */ var _lab2css_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lab2css.js */ "./node_modules/chroma-js/src/io/css/lab2css.js");
/* harmony import */ var _lab_rgb2lab_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lab/rgb2lab.js */ "./node_modules/chroma-js/src/io/lab/rgb2lab.js");
/* harmony import */ var _lch2css_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./lch2css.js */ "./node_modules/chroma-js/src/io/css/lch2css.js");
/* harmony import */ var _lch_rgb2lch_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../lch/rgb2lch.js */ "./node_modules/chroma-js/src/io/lch/rgb2lch.js");
/* harmony import */ var _oklab_rgb2oklab_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../oklab/rgb2oklab.js */ "./node_modules/chroma-js/src/io/oklab/rgb2oklab.js");
/* harmony import */ var _oklab2css_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./oklab2css.js */ "./node_modules/chroma-js/src/io/css/oklab2css.js");
/* harmony import */ var _oklch_rgb2oklch_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../oklch/rgb2oklch.js */ "./node_modules/chroma-js/src/io/oklch/rgb2oklch.js");
/* harmony import */ var _oklch2css_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./oklch2css.js */ "./node_modules/chroma-js/src/io/css/oklch2css.js");
/* harmony import */ var _lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../lab/lab-constants.js */ "./node_modules/chroma-js/src/io/lab/lab-constants.js");












const { round } = Math;

/*
 * supported arguments:
 * - rgb2css(r,g,b)
 * - rgb2css(r,g,b,a)
 * - rgb2css([r,g,b], mode)
 * - rgb2css([r,g,b,a], mode)
 * - rgb2css({r,g,b,a}, mode)
 */
const rgb2css = (...args) => {
    const rgba = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgba');
    let mode = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.last)(args) || 'rgb';
    if (mode.substr(0, 3) === 'hsl') {
        return (0,_hsl2css_js__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_hsl_rgb2hsl_js__WEBPACK_IMPORTED_MODULE_2__["default"])(rgba), mode);
    }
    if (mode.substr(0, 3) === 'lab') {
        // change to D50 lab whitepoint since this is what W3C is using for CSS Lab colors
        const prevWhitePoint = (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_11__.getLabWhitePoint)();
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_11__.setLabWhitePoint)('d50');
        const cssColor = (0,_lab2css_js__WEBPACK_IMPORTED_MODULE_3__["default"])((0,_lab_rgb2lab_js__WEBPACK_IMPORTED_MODULE_4__["default"])(rgba), mode);
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_11__.setLabWhitePoint)(prevWhitePoint);
        return cssColor;
    }
    if (mode.substr(0, 3) === 'lch') {
        // change to D50 lab whitepoint since this is what W3C is using for CSS Lab colors
        const prevWhitePoint = (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_11__.getLabWhitePoint)();
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_11__.setLabWhitePoint)('d50');
        const cssColor = (0,_lch2css_js__WEBPACK_IMPORTED_MODULE_5__["default"])((0,_lch_rgb2lch_js__WEBPACK_IMPORTED_MODULE_6__["default"])(rgba), mode);
        (0,_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_11__.setLabWhitePoint)(prevWhitePoint);
        return cssColor;
    }
    if (mode.substr(0, 5) === 'oklab') {
        return (0,_oklab2css_js__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_oklab_rgb2oklab_js__WEBPACK_IMPORTED_MODULE_7__["default"])(rgba));
    }
    if (mode.substr(0, 5) === 'oklch') {
        return (0,_oklch2css_js__WEBPACK_IMPORTED_MODULE_10__["default"])((0,_oklch_rgb2oklch_js__WEBPACK_IMPORTED_MODULE_9__["default"])(rgba));
    }
    rgba[0] = round(rgba[0]);
    rgba[1] = round(rgba[1]);
    rgba[2] = round(rgba[2]);
    if (mode === 'rgba' || (rgba.length > 3 && rgba[3] < 1)) {
        rgba[3] = '/ ' + (rgba.length > 3 ? rgba[3] : 1);
        mode = 'rgba';
    }
    return `${mode.substr(0, 3)}(${rgba.slice(0, mode === 'rgb' ? 3 : 4).join(' ')})`;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2css);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/gl/index.js":
/*!***************************************************!*\
  !*** ./node_modules/chroma-js/src/io/gl/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gl: () => (/* binding */ gl)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");





_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.gl = (...args) => {
    const rgb = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.unpack)(args, 'rgba');
    rgb[0] *= 255;
    rgb[1] *= 255;
    rgb[2] *= 255;
    return rgb;
};

const gl = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](...args, 'gl');
_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].gl = gl;

_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.gl = function () {
    const rgb = this._rgb;
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3]];
};




/***/ }),

/***/ "./node_modules/chroma-js/src/io/hcg/hcg2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hcg/hcg2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { floor } = Math;

/*
 * this is basically just HSV with some minor tweaks
 *
 * hue.. [0..360]
 * chroma .. [0..1]
 * grayness .. [0..1]
 */

const hcg2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hcg');
    let [h, c, _g] = args;
    let r, g, b;
    _g = _g * 255;
    const _c = c * 255;
    if (c === 0) {
        r = g = b = _g;
    } else {
        if (h === 360) h = 0;
        if (h > 360) h -= 360;
        if (h < 0) h += 360;
        h /= 60;
        const i = floor(h);
        const f = h - i;
        const p = _g * (1 - c);
        const q = p + _c * (1 - f);
        const t = p + _c * f;
        const v = p + _c;
        switch (i) {
            case 0:
                [r, g, b] = [v, t, p];
                break;
            case 1:
                [r, g, b] = [q, v, p];
                break;
            case 2:
                [r, g, b] = [p, v, t];
                break;
            case 3:
                [r, g, b] = [p, q, v];
                break;
            case 4:
                [r, g, b] = [t, p, v];
                break;
            case 5:
                [r, g, b] = [v, p, q];
                break;
        }
    }
    return [r, g, b, args.length > 3 ? args[3] : 1];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hcg2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hcg/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hcg/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hcg: () => (/* binding */ hcg)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _hcg2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./hcg2rgb.js */ "./node_modules/chroma-js/src/io/hcg/hcg2rgb.js");
/* harmony import */ var _rgb2hcg_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2hcg.js */ "./node_modules/chroma-js/src/io/hcg/rgb2hcg.js");







_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.hcg = function () {
    return (0,_rgb2hcg_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const hcg = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'hcg');
_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].hcg = hcg;

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.hcg = _hcg2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 1,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hcg');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
            return 'hcg';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/hcg/rgb2hcg.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hcg/rgb2hcg.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const rgb2hcg = (...args) => {
    const [r, g, b] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    const minRgb = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.min)(r, g, b);
    const maxRgb = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.max)(r, g, b);
    const delta = maxRgb - minRgb;
    const c = (delta * 100) / 255;
    const _g = (minRgb / (255 - delta)) * 100;
    let h;
    if (delta === 0) {
        h = Number.NaN;
    } else {
        if (r === maxRgb) h = (g - b) / delta;
        if (g === maxRgb) h = 2 + (b - r) / delta;
        if (b === maxRgb) h = 4 + (r - g) / delta;
        h *= 60;
        if (h < 0) h += 360;
    }
    return [h, c, _g];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2hcg);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hex/hex2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hex/hex2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

const hex2rgb = (hex) => {
    if (hex.match(RE_HEX)) {
        // remove optional leading #
        if (hex.length === 4 || hex.length === 7) {
            hex = hex.substr(1);
        }
        // expand short-notation to full six-digit
        if (hex.length === 3) {
            hex = hex.split('');
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const u = parseInt(hex, 16);
        const r = u >> 16;
        const g = (u >> 8) & 0xff;
        const b = u & 0xff;
        return [r, g, b, 1];
    }

    // match rgba hex format, eg #FF000077
    if (hex.match(RE_HEXA)) {
        if (hex.length === 5 || hex.length === 9) {
            // remove optional leading #
            hex = hex.substr(1);
        }
        // expand short-notation to full eight-digit
        if (hex.length === 4) {
            hex = hex.split('');
            hex =
                hex[0] +
                hex[0] +
                hex[1] +
                hex[1] +
                hex[2] +
                hex[2] +
                hex[3] +
                hex[3];
        }
        const u = parseInt(hex, 16);
        const r = (u >> 24) & 0xff;
        const g = (u >> 16) & 0xff;
        const b = (u >> 8) & 0xff;
        const a = Math.round(((u & 0xff) / 0xff) * 100) / 100;
        return [r, g, b, a];
    }

    // we used to check for css colors here
    // if _input.css? and rgb = _input.css hex
    //     return rgb

    throw new Error(`unknown hex color: ${hex}`);
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hex2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hex/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hex/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hex: () => (/* binding */ hex)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _hex2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./hex2rgb.js */ "./node_modules/chroma-js/src/io/hex/hex2rgb.js");
/* harmony import */ var _rgb2hex_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2hex.js */ "./node_modules/chroma-js/src/io/hex/rgb2hex.js");







_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.hex = function (mode) {
    return (0,_rgb2hex_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb, mode);
};

const hex = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](...args, 'hex');
_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].hex = hex;

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.hex = _hex2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];
_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 4,
    test: (h, ...rest) => {
        if (
            !rest.length &&
            (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_2__.type)(h) === 'string' &&
            [3, 4, 5, 6, 7, 8, 9].indexOf(h.length) >= 0
        ) {
            return 'hex';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/hex/rgb2hex.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hex/rgb2hex.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { round } = Math;

const rgb2hex = (...args) => {
    let [r, g, b, a] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgba');
    let mode = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.last)(args) || 'auto';
    if (a === undefined) a = 1;
    if (mode === 'auto') {
        mode = a < 1 ? 'rgba' : 'rgb';
    }
    r = round(r);
    g = round(g);
    b = round(b);
    const u = (r << 16) | (g << 8) | b;
    let str = '000000' + u.toString(16); //#.toUpperCase();
    str = str.substr(str.length - 6);
    let hxa = '0' + round(a * 255).toString(16);
    hxa = hxa.substr(hxa.length - 2);
    switch (mode.toLowerCase()) {
        case 'rgba':
            return `#${str}${hxa}`;
        case 'argb':
            return `#${hxa}${str}`;
        default:
            return `#${str}`;
    }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2hex);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsi/hsi2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsi/hsi2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { cos } = Math;

/*
 * hue [0..360]
 * saturation [0..1]
 * intensity [0..1]
 */
const hsi2rgb = (...args) => {
    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
    */
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hsi');
    let [h, s, i] = args;
    let r, g, b;

    if (isNaN(h)) h = 0;
    if (isNaN(s)) s = 0;
    // normalize hue
    if (h > 360) h -= 360;
    if (h < 0) h += 360;
    h /= 360;
    if (h < 1 / 3) {
        b = (1 - s) / 3;
        r = (1 + (s * cos(_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI * h)) / cos(_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.PITHIRD - _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI * h)) / 3;
        g = 1 - (b + r);
    } else if (h < 2 / 3) {
        h -= 1 / 3;
        r = (1 - s) / 3;
        g = (1 + (s * cos(_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI * h)) / cos(_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.PITHIRD - _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI * h)) / 3;
        b = 1 - (r + g);
    } else {
        h -= 2 / 3;
        g = (1 - s) / 3;
        b = (1 + (s * cos(_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI * h)) / cos(_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.PITHIRD - _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI * h)) / 3;
        r = 1 - (g + b);
    }
    r = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.limit)(i * r * 3);
    g = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.limit)(i * g * 3);
    b = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.limit)(i * b * 3);
    return [r * 255, g * 255, b * 255, args.length > 3 ? args[3] : 1];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hsi2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsi/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsi/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hsi: () => (/* binding */ hsi)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _hsi2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./hsi2rgb.js */ "./node_modules/chroma-js/src/io/hsi/hsi2rgb.js");
/* harmony import */ var _rgb2hsi_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2hsi.js */ "./node_modules/chroma-js/src/io/hsi/rgb2hsi.js");







_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.hsi = function () {
    return (0,_rgb2hsi_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const hsi = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'hsi');
_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].hsi = hsi;

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.hsi = _hsi2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 2,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hsi');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
            return 'hsi';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsi/rgb2hsi.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsi/rgb2hsi.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { min, sqrt, acos } = Math;

const rgb2hsi = (...args) => {
    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
    */
    let [r, g, b] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    r /= 255;
    g /= 255;
    b /= 255;
    let h;
    const min_ = min(r, g, b);
    const i = (r + g + b) / 3;
    const s = i > 0 ? 1 - min_ / i : 0;
    if (s === 0) {
        h = NaN;
    } else {
        h = (r - g + (r - b)) / 2;
        h /= sqrt((r - g) * (r - g) + (r - b) * (g - b));
        h = acos(h);
        if (b > g) {
            h = _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI - h;
        }
        h /= _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.TWOPI;
    }
    return [h * 360, s, i];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2hsi);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsl/hsl2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsl/hsl2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const hsl2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hsl');
    const [h, s, l] = args;
    let r, g, b;
    if (s === 0) {
        r = g = b = l * 255;
    } else {
        const t3 = [0, 0, 0];
        const c = [0, 0, 0];
        const t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const t1 = 2 * l - t2;
        const h_ = h / 360;
        t3[0] = h_ + 1 / 3;
        t3[1] = h_;
        t3[2] = h_ - 1 / 3;
        for (let i = 0; i < 3; i++) {
            if (t3[i] < 0) t3[i] += 1;
            if (t3[i] > 1) t3[i] -= 1;
            if (6 * t3[i] < 1) c[i] = t1 + (t2 - t1) * 6 * t3[i];
            else if (2 * t3[i] < 1) c[i] = t2;
            else if (3 * t3[i] < 2) c[i] = t1 + (t2 - t1) * (2 / 3 - t3[i]) * 6;
            else c[i] = t1;
        }
        [r, g, b] = [c[0] * 255, c[1] * 255, c[2] * 255];
    }
    if (args.length > 3) {
        // keep alpha channel
        return [r, g, b, args[3]];
    }
    return [r, g, b, 1];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hsl2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsl/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsl/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hsl: () => (/* binding */ hsl)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _hsl2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./hsl2rgb.js */ "./node_modules/chroma-js/src/io/hsl/hsl2rgb.js");
/* harmony import */ var _rgb2hsl_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2hsl.js */ "./node_modules/chroma-js/src/io/hsl/rgb2hsl.js");







_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.hsl = function () {
    return (0,_rgb2hsl_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const hsl = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'hsl');
_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].hsl = hsl;

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.hsl = _hsl2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 2,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hsl');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
            return 'hsl';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsl/rgb2hsl.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsl/rgb2hsl.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


/*
 * supported arguments:
 * - rgb2hsl(r,g,b)
 * - rgb2hsl(r,g,b,a)
 * - rgb2hsl([r,g,b])
 * - rgb2hsl([r,g,b,a])
 * - rgb2hsl({r,g,b,a})
 */
const rgb2hsl = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgba');
    let [r, g, b] = args;

    r /= 255;
    g /= 255;
    b /= 255;

    const minRgb = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.min)(r, g, b);
    const maxRgb = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.max)(r, g, b);

    const l = (maxRgb + minRgb) / 2;
    let s, h;

    if (maxRgb === minRgb) {
        s = 0;
        h = Number.NaN;
    } else {
        s =
            l < 0.5
                ? (maxRgb - minRgb) / (maxRgb + minRgb)
                : (maxRgb - minRgb) / (2 - maxRgb - minRgb);
    }

    if (r == maxRgb) h = (g - b) / (maxRgb - minRgb);
    else if (g == maxRgb) h = 2 + (b - r) / (maxRgb - minRgb);
    else if (b == maxRgb) h = 4 + (r - g) / (maxRgb - minRgb);

    h *= 60;
    if (h < 0) h += 360;
    if (args.length > 3 && args[3] !== undefined) return [h, s, l, args[3]];
    return [h, s, l];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2hsl);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsv/hsv2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsv/hsv2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { floor } = Math;

const hsv2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hsv');
    let [h, s, v] = args;
    let r, g, b;
    v *= 255;
    if (s === 0) {
        r = g = b = v;
    } else {
        if (h === 360) h = 0;
        if (h > 360) h -= 360;
        if (h < 0) h += 360;
        h /= 60;

        const i = floor(h);
        const f = h - i;
        const p = v * (1 - s);
        const q = v * (1 - s * f);
        const t = v * (1 - s * (1 - f));

        switch (i) {
            case 0:
                [r, g, b] = [v, t, p];
                break;
            case 1:
                [r, g, b] = [q, v, p];
                break;
            case 2:
                [r, g, b] = [p, v, t];
                break;
            case 3:
                [r, g, b] = [p, q, v];
                break;
            case 4:
                [r, g, b] = [t, p, v];
                break;
            case 5:
                [r, g, b] = [v, p, q];
                break;
        }
    }
    return [r, g, b, args.length > 3 ? args[3] : 1];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hsv2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsv/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsv/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hsv: () => (/* binding */ hsv)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _hsv2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./hsv2rgb.js */ "./node_modules/chroma-js/src/io/hsv/hsv2rgb.js");
/* harmony import */ var _rgb2hsv_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2hsv.js */ "./node_modules/chroma-js/src/io/hsv/rgb2hsv.js");







_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.hsv = function () {
    return (0,_rgb2hsv_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const hsv = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'hsv');
_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"].hsv = hsv;

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.hsv = _hsv2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 2,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hsv');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
            return 'hsv';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/hsv/rgb2hsv.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/hsv/rgb2hsv.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { min, max } = Math;

/*
 * supported arguments:
 * - rgb2hsv(r,g,b)
 * - rgb2hsv([r,g,b])
 * - rgb2hsv({r,g,b})
 */
const rgb2hsl = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    let [r, g, b] = args;
    const min_ = min(r, g, b);
    const max_ = max(r, g, b);
    const delta = max_ - min_;
    let h, s, v;
    v = max_ / 255.0;
    if (max_ === 0) {
        h = Number.NaN;
        s = 0;
    } else {
        s = delta / max_;
        if (r === max_) h = (g - b) / delta;
        if (g === max_) h = 2 + (b - r) / delta;
        if (b === max_) h = 4 + (r - g) / delta;
        h *= 60;
        if (h < 0) h += 360;
    }
    return [h, s, v];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2hsl);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/input.js":
/*!************************************************!*\
  !*** ./node_modules/chroma-js/src/io/input.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    format: {},
    autodetect: []
});


/***/ }),

/***/ "./node_modules/chroma-js/src/io/lab/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lab/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getLabWhitePoint: () => (/* reexport safe */ _lab_constants_js__WEBPACK_IMPORTED_MODULE_6__.getLabWhitePoint),
/* harmony export */   lab: () => (/* binding */ lab),
/* harmony export */   setLabWhitePoint: () => (/* reexport safe */ _lab_constants_js__WEBPACK_IMPORTED_MODULE_6__.setLabWhitePoint)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _lab2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lab2rgb.js */ "./node_modules/chroma-js/src/io/lab/lab2rgb.js");
/* harmony import */ var _rgb2lab_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2lab.js */ "./node_modules/chroma-js/src/io/lab/rgb2lab.js");
/* harmony import */ var _lab_constants_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./lab-constants.js */ "./node_modules/chroma-js/src/io/lab/lab-constants.js");








_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.lab = function () {
    return (0,_rgb2lab_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const lab = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'lab');
Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"], { lab, getLabWhitePoint: _lab_constants_js__WEBPACK_IMPORTED_MODULE_6__.getLabWhitePoint, setLabWhitePoint: _lab_constants_js__WEBPACK_IMPORTED_MODULE_6__.setLabWhitePoint });

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.lab = _lab2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 2,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lab');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
            return 'lab';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/lab/lab-constants.js":
/*!************************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lab/lab-constants.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getLabWhitePoint: () => (/* binding */ getLabWhitePoint),
/* harmony export */   setLabWhitePoint: () => (/* binding */ setLabWhitePoint)
/* harmony export */ });
const labConstants = {
    // Corresponds roughly to RGB brighter/darker
    Kn: 18,

    // D65 standard referent
    labWhitePoint: 'd65',
    Xn: 0.95047,
    Yn: 1,
    Zn: 1.08883,

    t0: 0.137931034, // 4 / 29
    t1: 0.206896552, // 6 / 29
    t2: 0.12841855, // 3 * t1 * t1
    t3: 0.008856452, // t1 * t1 * t1,

    kE: 216.0 / 24389.0,
    kKE: 8.0,
    kK: 24389.0 / 27.0,

    RefWhiteRGB: {
        // sRGB
        X: 0.95047,
        Y: 1,
        Z: 1.08883
    },

    MtxRGB2XYZ: {
        m00: 0.4124564390896922,
        m01: 0.21267285140562253,
        m02: 0.0193338955823293,
        m10: 0.357576077643909,
        m11: 0.715152155287818,
        m12: 0.11919202588130297,
        m20: 0.18043748326639894,
        m21: 0.07217499330655958,
        m22: 0.9503040785363679
    },

    MtxXYZ2RGB: {
        m00: 3.2404541621141045,
        m01: -0.9692660305051868,
        m02: 0.055643430959114726,
        m10: -1.5371385127977166,
        m11: 1.8760108454466942,
        m12: -0.2040259135167538,
        m20: -0.498531409556016,
        m21: 0.041556017530349834,
        m22: 1.0572251882231791
    },

    // used in rgb2xyz
    As: 0.9414285350000001,
    Bs: 1.040417467,
    Cs: 1.089532651,

    MtxAdaptMa: {
        m00: 0.8951,
        m01: -0.7502,
        m02: 0.0389,
        m10: 0.2664,
        m11: 1.7135,
        m12: -0.0685,
        m20: -0.1614,
        m21: 0.0367,
        m22: 1.0296
    },

    MtxAdaptMaI: {
        m00: 0.9869929054667123,
        m01: 0.43230526972339456,
        m02: -0.008528664575177328,
        m10: -0.14705425642099013,
        m11: 0.5183602715367776,
        m12: 0.04004282165408487,
        m20: 0.15996265166373125,
        m21: 0.0492912282128556,
        m22: 0.9684866957875502
    }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (labConstants);

// taken from https://de.mathworks.com/help/images/ref/whitepoint.html
const ILLUMINANTS = new Map([
    // ASTM E308-01
    ['a', [1.0985, 0.35585]],
    // Wyszecki & Stiles, p. 769
    ['b', [1.0985, 0.35585]],
    // C ASTM E308-01
    ['c', [0.98074, 1.18232]],
    // D50 (ASTM E308-01)
    ['d50', [0.96422, 0.82521]],
    // D55 (ASTM E308-01)
    ['d55', [0.95682, 0.92149]],
    // D65 (ASTM E308-01)
    ['d65', [0.95047, 1.08883]],
    // E (ASTM E308-01)
    ['e', [1, 1, 1]],
    // F2 (ASTM E308-01)
    ['f2', [0.99186, 0.67393]],
    // F7 (ASTM E308-01)
    ['f7', [0.95041, 1.08747]],
    // F11 (ASTM E308-01)
    ['f11', [1.00962, 0.6435]],
    ['icc', [0.96422, 0.82521]]
]);

function setLabWhitePoint(name) {
    const ill = ILLUMINANTS.get(String(name).toLowerCase());
    if (!ill) {
        throw new Error('unknown Lab illuminant ' + name);
    }
    labConstants.labWhitePoint = name;
    labConstants.Xn = ill[0];
    labConstants.Zn = ill[1];
}

function getLabWhitePoint() {
    return labConstants.labWhitePoint;
}


/***/ }),

/***/ "./node_modules/chroma-js/src/io/lab/lab2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lab/lab2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   xyz2rgb: () => (/* binding */ xyz2rgb)
/* harmony export */ });
/* harmony import */ var _lab_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lab-constants.js */ "./node_modules/chroma-js/src/io/lab/lab-constants.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");



/*
 * L* [0..100]
 * a [-100..100]
 * b [-100..100]
 */
const lab2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.unpack)(args, 'lab');
    const [L, a, b] = args;
    const [x, y, z] = lab2xyz(L, a, b);
    const [r, g, b_] = xyz2rgb(x, y, z);
    return [r, g, b_, args.length > 3 ? args[3] : 1];
};

const lab2xyz = (L, a, b) => {
    const { kE, kK, kKE, Xn, Yn, Zn } = _lab_constants_js__WEBPACK_IMPORTED_MODULE_0__["default"];

    const fy = (L + 16.0) / 116.0;
    const fx = 0.002 * a + fy;
    const fz = fy - 0.005 * b;

    const fx3 = fx * fx * fx;
    const fz3 = fz * fz * fz;

    const xr = fx3 > kE ? fx3 : (116.0 * fx - 16.0) / kK;
    const yr = L > kKE ? Math.pow((L + 16.0) / 116.0, 3.0) : L / kK;
    const zr = fz3 > kE ? fz3 : (116.0 * fz - 16.0) / kK;

    const x = xr * Xn;
    const y = yr * Yn;
    const z = zr * Zn;

    return [x, y, z];
};

const compand = (linear) => {
    /* sRGB */
    const sign = Math.sign(linear);
    linear = Math.abs(linear);
    return (
        (linear <= 0.0031308
            ? linear * 12.92
            : 1.055 * Math.pow(linear, 1.0 / 2.4) - 0.055) * sign
    );
};

const xyz2rgb = (x, y, z) => {
    const { MtxAdaptMa, MtxAdaptMaI, MtxXYZ2RGB, RefWhiteRGB, Xn, Yn, Zn } =
        _lab_constants_js__WEBPACK_IMPORTED_MODULE_0__["default"];

    const As = Xn * MtxAdaptMa.m00 + Yn * MtxAdaptMa.m10 + Zn * MtxAdaptMa.m20;
    const Bs = Xn * MtxAdaptMa.m01 + Yn * MtxAdaptMa.m11 + Zn * MtxAdaptMa.m21;
    const Cs = Xn * MtxAdaptMa.m02 + Yn * MtxAdaptMa.m12 + Zn * MtxAdaptMa.m22;

    const Ad =
        RefWhiteRGB.X * MtxAdaptMa.m00 +
        RefWhiteRGB.Y * MtxAdaptMa.m10 +
        RefWhiteRGB.Z * MtxAdaptMa.m20;
    const Bd =
        RefWhiteRGB.X * MtxAdaptMa.m01 +
        RefWhiteRGB.Y * MtxAdaptMa.m11 +
        RefWhiteRGB.Z * MtxAdaptMa.m21;
    const Cd =
        RefWhiteRGB.X * MtxAdaptMa.m02 +
        RefWhiteRGB.Y * MtxAdaptMa.m12 +
        RefWhiteRGB.Z * MtxAdaptMa.m22;

    const X1 =
        (x * MtxAdaptMa.m00 + y * MtxAdaptMa.m10 + z * MtxAdaptMa.m20) *
        (Ad / As);
    const Y1 =
        (x * MtxAdaptMa.m01 + y * MtxAdaptMa.m11 + z * MtxAdaptMa.m21) *
        (Bd / Bs);
    const Z1 =
        (x * MtxAdaptMa.m02 + y * MtxAdaptMa.m12 + z * MtxAdaptMa.m22) *
        (Cd / Cs);

    const X2 =
        X1 * MtxAdaptMaI.m00 + Y1 * MtxAdaptMaI.m10 + Z1 * MtxAdaptMaI.m20;
    const Y2 =
        X1 * MtxAdaptMaI.m01 + Y1 * MtxAdaptMaI.m11 + Z1 * MtxAdaptMaI.m21;
    const Z2 =
        X1 * MtxAdaptMaI.m02 + Y1 * MtxAdaptMaI.m12 + Z1 * MtxAdaptMaI.m22;

    const r = compand(
        X2 * MtxXYZ2RGB.m00 + Y2 * MtxXYZ2RGB.m10 + Z2 * MtxXYZ2RGB.m20
    );
    const g = compand(
        X2 * MtxXYZ2RGB.m01 + Y2 * MtxXYZ2RGB.m11 + Z2 * MtxXYZ2RGB.m21
    );
    const b = compand(
        X2 * MtxXYZ2RGB.m02 + Y2 * MtxXYZ2RGB.m12 + Z2 * MtxXYZ2RGB.m22
    );

    return [r * 255, g * 255, b * 255];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lab2rgb);



/***/ }),

/***/ "./node_modules/chroma-js/src/io/lab/rgb2lab.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lab/rgb2lab.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   rgb2xyz: () => (/* binding */ rgb2xyz)
/* harmony export */ });
/* harmony import */ var _lab_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lab-constants.js */ "./node_modules/chroma-js/src/io/lab/lab-constants.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");



const rgb2lab = (...args) => {
    const [r, g, b, ...rest] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.unpack)(args, 'rgb');
    const [x, y, z] = rgb2xyz(r, g, b);
    const [L, a, b_] = xyz2lab(x, y, z);
    return [L, a, b_, ...(rest.length > 0 && rest[0] < 1 ? [rest[0]] : [])];
};

function xyz2lab(x, y, z) {
    const { Xn, Yn, Zn, kE, kK } = _lab_constants_js__WEBPACK_IMPORTED_MODULE_0__["default"];
    const xr = x / Xn;
    const yr = y / Yn;
    const zr = z / Zn;

    const fx = xr > kE ? Math.pow(xr, 1.0 / 3.0) : (kK * xr + 16.0) / 116.0;
    const fy = yr > kE ? Math.pow(yr, 1.0 / 3.0) : (kK * yr + 16.0) / 116.0;
    const fz = zr > kE ? Math.pow(zr, 1.0 / 3.0) : (kK * zr + 16.0) / 116.0;

    return [116.0 * fy - 16.0, 500.0 * (fx - fy), 200.0 * (fy - fz)];
}

function gammaAdjustSRGB(companded) {
    const sign = Math.sign(companded);
    companded = Math.abs(companded);
    const linear =
        companded <= 0.04045
            ? companded / 12.92
            : Math.pow((companded + 0.055) / 1.055, 2.4);
    return linear * sign;
}

const rgb2xyz = (r, g, b) => {
    // normalize and gamma adjust
    r = gammaAdjustSRGB(r / 255);
    g = gammaAdjustSRGB(g / 255);
    b = gammaAdjustSRGB(b / 255);

    const { MtxRGB2XYZ, MtxAdaptMa, MtxAdaptMaI, Xn, Yn, Zn, As, Bs, Cs } =
        _lab_constants_js__WEBPACK_IMPORTED_MODULE_0__["default"];

    let x = r * MtxRGB2XYZ.m00 + g * MtxRGB2XYZ.m10 + b * MtxRGB2XYZ.m20;
    let y = r * MtxRGB2XYZ.m01 + g * MtxRGB2XYZ.m11 + b * MtxRGB2XYZ.m21;
    let z = r * MtxRGB2XYZ.m02 + g * MtxRGB2XYZ.m12 + b * MtxRGB2XYZ.m22;

    const Ad = Xn * MtxAdaptMa.m00 + Yn * MtxAdaptMa.m10 + Zn * MtxAdaptMa.m20;
    const Bd = Xn * MtxAdaptMa.m01 + Yn * MtxAdaptMa.m11 + Zn * MtxAdaptMa.m21;
    const Cd = Xn * MtxAdaptMa.m02 + Yn * MtxAdaptMa.m12 + Zn * MtxAdaptMa.m22;

    let X = x * MtxAdaptMa.m00 + y * MtxAdaptMa.m10 + z * MtxAdaptMa.m20;
    let Y = x * MtxAdaptMa.m01 + y * MtxAdaptMa.m11 + z * MtxAdaptMa.m21;
    let Z = x * MtxAdaptMa.m02 + y * MtxAdaptMa.m12 + z * MtxAdaptMa.m22;

    X *= Ad / As;
    Y *= Bd / Bs;
    Z *= Cd / Cs;

    x = X * MtxAdaptMaI.m00 + Y * MtxAdaptMaI.m10 + Z * MtxAdaptMaI.m20;
    y = X * MtxAdaptMaI.m01 + Y * MtxAdaptMaI.m11 + Z * MtxAdaptMaI.m21;
    z = X * MtxAdaptMaI.m02 + Y * MtxAdaptMaI.m12 + Z * MtxAdaptMaI.m22;

    return [x, y, z];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2lab);



/***/ }),

/***/ "./node_modules/chroma-js/src/io/lch/hcl2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lch/hcl2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _lch2rgb_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lch2rgb.js */ "./node_modules/chroma-js/src/io/lch/lch2rgb.js");



const hcl2rgb = (...args) => {
    const hcl = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.reverse3)((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'hcl'));
    return (0,_lch2rgb_js__WEBPACK_IMPORTED_MODULE_1__["default"])(...hcl);
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hcl2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/lch/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lch/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hcl: () => (/* binding */ hcl),
/* harmony export */   lch: () => (/* binding */ lch)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _lch2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lch2rgb.js */ "./node_modules/chroma-js/src/io/lch/lch2rgb.js");
/* harmony import */ var _hcl2rgb_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./hcl2rgb.js */ "./node_modules/chroma-js/src/io/lch/hcl2rgb.js");
/* harmony import */ var _rgb2lch_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./rgb2lch.js */ "./node_modules/chroma-js/src/io/lch/rgb2lch.js");








_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.lch = function () {
    return (0,_rgb2lch_js__WEBPACK_IMPORTED_MODULE_6__["default"])(this._rgb);
};
_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.hcl = function () {
    return (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.reverse3)((0,_rgb2lch_js__WEBPACK_IMPORTED_MODULE_6__["default"])(this._rgb));
};

const lch = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'lch');
const hcl = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'hcl');

Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"], { lch, hcl });

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.lch = _lch2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];
_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.hcl = _hcl2rgb_js__WEBPACK_IMPORTED_MODULE_5__["default"];
['lch', 'hcl'].forEach((m) =>
    _input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
        p: 2,
        test: (...args) => {
            args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, m);
            if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
                return m;
            }
        }
    })
);




/***/ }),

/***/ "./node_modules/chroma-js/src/io/lch/lab2lch.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lch/lab2lch.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { sqrt, atan2, round } = Math;

const lab2lch = (...args) => {
    const [l, a, b] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lab');
    const c = sqrt(a * a + b * b);
    let h = (atan2(b, a) * _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.RAD2DEG + 360) % 360;
    if (round(c * 10000) === 0) h = Number.NaN;
    return [l, c, h];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lab2lch);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/lch/lch2lab.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lch/lch2lab.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");

const { sin, cos } = Math;

const lch2lab = (...args) => {
    /*
    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
    These formulas were invented by David Dalrymple to obtain maximum contrast without going
    out of gamut if the parameters are in the range 0-1.

    A saturation multiplier was added by Gregor Aisch
    */
    let [l, c, h] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lch');
    if (isNaN(h)) h = 0;
    h = h * _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.DEG2RAD;
    return [l, cos(h) * c, sin(h) * c];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lch2lab);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/lch/lch2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lch/lch2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _lch2lab_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lch2lab.js */ "./node_modules/chroma-js/src/io/lch/lch2lab.js");
/* harmony import */ var _lab_lab2rgb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lab/lab2rgb.js */ "./node_modules/chroma-js/src/io/lab/lab2rgb.js");




const lch2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lch');
    const [l, c, h] = args;
    const [L, a, b_] = (0,_lch2lab_js__WEBPACK_IMPORTED_MODULE_1__["default"])(l, c, h);
    const [r, g, b] = (0,_lab_lab2rgb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(L, a, b_);
    return [r, g, b, args.length > 3 ? args[3] : 1];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (lch2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/lch/rgb2lch.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/lch/rgb2lch.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _lab_rgb2lab_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lab/rgb2lab.js */ "./node_modules/chroma-js/src/io/lab/rgb2lab.js");
/* harmony import */ var _lab2lch_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lab2lch.js */ "./node_modules/chroma-js/src/io/lch/lab2lch.js");




const rgb2lch = (...args) => {
    const [r, g, b, ...rest] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    const [l, a, b_] = (0,_lab_rgb2lab_js__WEBPACK_IMPORTED_MODULE_1__["default"])(r, g, b);
    const [L, c, h] = (0,_lab2lch_js__WEBPACK_IMPORTED_MODULE_2__["default"])(l, a, b_);
    return [L, c, h, ...(rest.length > 0 && rest[0] < 1 ? [rest[0]] : [])];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2lch);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/named/index.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/named/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../colors/w3cx11.js */ "./node_modules/chroma-js/src/colors/w3cx11.js");
/* harmony import */ var _hex_hex2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../hex/hex2rgb.js */ "./node_modules/chroma-js/src/io/hex/hex2rgb.js");
/* harmony import */ var _hex_rgb2hex_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../hex/rgb2hex.js */ "./node_modules/chroma-js/src/io/hex/rgb2hex.js");








_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.name = function () {
    const hex = (0,_hex_rgb2hex_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb, 'rgb');
    for (let n of Object.keys(_colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_3__["default"])) {
        if (_colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_3__["default"][n] === hex) return n.toLowerCase();
    }
    return hex;
};

_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].format.named = (name) => {
    name = name.toLowerCase();
    if (_colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_3__["default"][name]) return (0,_hex_hex2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"])(_colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_3__["default"][name]);
    throw new Error('unknown color name: ' + name);
};

_input_js__WEBPACK_IMPORTED_MODULE_1__["default"].autodetect.push({
    p: 5,
    test: (h, ...rest) => {
        if (!rest.length && (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_2__.type)(h) === 'string' && _colors_w3cx11_js__WEBPACK_IMPORTED_MODULE_3__["default"][h.toLowerCase()]) {
            return 'named';
        }
    }
});


/***/ }),

/***/ "./node_modules/chroma-js/src/io/num/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/num/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   num: () => (/* binding */ num)
/* harmony export */ });
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _num2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./num2rgb.js */ "./node_modules/chroma-js/src/io/num/num2rgb.js");
/* harmony import */ var _rgb2num_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2num.js */ "./node_modules/chroma-js/src/io/num/rgb2num.js");







_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.num = function () {
    return (0,_rgb2num_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const num = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](...args, 'num');

Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"], { num });

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.num = _num2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].autodetect.push({
    p: 5,
    test: (...args) => {
        if (
            args.length === 1 &&
            (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.type)(args[0]) === 'number' &&
            args[0] >= 0 &&
            args[0] <= 0xffffff
        ) {
            return 'num';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/num/num2rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/num/num2rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const num2rgb = (num) => {
    if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(num) == 'number' && num >= 0 && num <= 0xffffff) {
        const r = num >> 16;
        const g = (num >> 8) & 0xff;
        const b = num & 0xff;
        return [r, g, b, 1];
    }
    throw new Error('unknown num color: ' + num);
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (num2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/num/rgb2num.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/num/rgb2num.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const rgb2num = (...args) => {
    const [r, g, b] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    return (r << 16) + (g << 8) + b;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2num);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/oklab/index.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/oklab/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   oklab: () => (/* binding */ oklab)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _oklab2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./oklab2rgb.js */ "./node_modules/chroma-js/src/io/oklab/oklab2rgb.js");
/* harmony import */ var _rgb2oklab_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2oklab.js */ "./node_modules/chroma-js/src/io/oklab/rgb2oklab.js");







_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.oklab = function () {
    return (0,_rgb2oklab_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const oklab = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'oklab');
Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"], { oklab });

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.oklab = _oklab2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 2,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'oklab');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
            return 'oklab';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/oklab/oklab2rgb.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/oklab/oklab2rgb.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _utils_multiply_matrices_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/multiply-matrices.js */ "./node_modules/chroma-js/src/utils/multiply-matrices.js");
/* harmony import */ var _lab_lab2rgb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lab/lab2rgb.js */ "./node_modules/chroma-js/src/io/lab/lab2rgb.js");




const oklab2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lab');
    const [L, a, b, ...rest] = args;
    const [X, Y, Z] = OKLab_to_XYZ([L, a, b]);
    const [r, g, b_] = (0,_lab_lab2rgb_js__WEBPACK_IMPORTED_MODULE_2__.xyz2rgb)(X, Y, Z);
    return [r, g, b_, ...(rest.length > 0 && rest[0] < 1 ? [rest[0]] : [])];
};

// from https://www.w3.org/TR/css-color-4/#color-conversion-code
function OKLab_to_XYZ(OKLab) {
    // Given OKLab, convert to XYZ relative to D65
    var LMStoXYZ = [
        [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
        [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
        [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
    ];
    var OKLabtoLMS = [
        [1.0, 0.3963377773761749, 0.2158037573099136],
        [1.0, -0.1055613458156586, -0.0638541728258133],
        [1.0, -0.0894841775298119, -1.2914855480194092]
    ];

    var LMSnl = (0,_utils_multiply_matrices_js__WEBPACK_IMPORTED_MODULE_1__["default"])(OKLabtoLMS, OKLab);
    return (0,_utils_multiply_matrices_js__WEBPACK_IMPORTED_MODULE_1__["default"])(
        LMStoXYZ,
        LMSnl.map((c) => c ** 3)
    );
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (oklab2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/oklab/rgb2oklab.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/oklab/rgb2oklab.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _utils_multiply_matrices_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/multiply-matrices.js */ "./node_modules/chroma-js/src/utils/multiply-matrices.js");
/* harmony import */ var _lab_rgb2lab_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lab/rgb2lab.js */ "./node_modules/chroma-js/src/io/lab/rgb2lab.js");




const rgb2oklab = (...args) => {
    const [r, g, b, ...rest] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    const xyz = (0,_lab_rgb2lab_js__WEBPACK_IMPORTED_MODULE_2__.rgb2xyz)(r, g, b);
    const oklab = XYZ_to_OKLab(xyz);
    return [...oklab, ...(rest.length > 0 && rest[0] < 1 ? [rest[0]] : [])];
};

// from https://www.w3.org/TR/css-color-4/#color-conversion-code
function XYZ_to_OKLab(XYZ) {
    // Given XYZ relative to D65, convert to OKLab
    const XYZtoLMS = [
        [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
        [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
        [0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
    ];
    const LMStoOKLab = [
        [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
        [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
        [0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
    ];

    const LMS = (0,_utils_multiply_matrices_js__WEBPACK_IMPORTED_MODULE_1__["default"])(XYZtoLMS, XYZ);
    // JavaScript Math.cbrt returns a sign-matched cube root
    // beware if porting to other languages
    // especially if tempted to use a general power function
    return (0,_utils_multiply_matrices_js__WEBPACK_IMPORTED_MODULE_1__["default"])(
        LMStoOKLab,
        LMS.map((c) => Math.cbrt(c))
    );
    // L in range [0,1]. For use in CSS, multiply by 100 and add a percent
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2oklab);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/oklch/index.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/io/oklch/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   oklch: () => (/* binding */ oklch)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _oklch2rgb_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./oklch2rgb.js */ "./node_modules/chroma-js/src/io/oklch/oklch2rgb.js");
/* harmony import */ var _rgb2oklch_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rgb2oklch.js */ "./node_modules/chroma-js/src/io/oklch/rgb2oklch.js");







_Color_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.oklch = function () {
    return (0,_rgb2oklch_js__WEBPACK_IMPORTED_MODULE_5__["default"])(this._rgb);
};

const oklch = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_2__["default"](...args, 'oklch');
Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_1__["default"], { oklch });

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].format.oklch = _oklch2rgb_js__WEBPACK_IMPORTED_MODULE_4__["default"];

_input_js__WEBPACK_IMPORTED_MODULE_3__["default"].autodetect.push({
    p: 2,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'oklch');
        if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.type)(args) === 'array' && args.length === 3) {
            return 'oklch';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/oklch/oklch2rgb.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/oklch/oklch2rgb.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _lch_lch2lab_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lch/lch2lab.js */ "./node_modules/chroma-js/src/io/lch/lch2lab.js");
/* harmony import */ var _oklab_oklab2rgb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../oklab/oklab2rgb.js */ "./node_modules/chroma-js/src/io/oklab/oklab2rgb.js");




const oklch2rgb = (...args) => {
    args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'lch');
    const [l, c, h, ...rest] = args;
    const [L, a, b_] = (0,_lch_lch2lab_js__WEBPACK_IMPORTED_MODULE_1__["default"])(l, c, h);
    const [r, g, b] = (0,_oklab_oklab2rgb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(L, a, b_);
    return [r, g, b, ...(rest.length > 0 && rest[0] < 1 ? [rest[0]] : [])];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (oklch2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/oklch/rgb2oklch.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/io/oklch/rgb2oklch.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/* harmony import */ var _oklab_rgb2oklab_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../oklab/rgb2oklab.js */ "./node_modules/chroma-js/src/io/oklab/rgb2oklab.js");
/* harmony import */ var _lch_lab2lch_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lch/lab2lch.js */ "./node_modules/chroma-js/src/io/lch/lab2lch.js");




const rgb2oklch = (...args) => {
    const [r, g, b, ...rest] = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.unpack)(args, 'rgb');
    const [l, a, b_] = (0,_oklab_rgb2oklab_js__WEBPACK_IMPORTED_MODULE_1__["default"])(r, g, b);
    const [L, c, h] = (0,_lch_lab2lch_js__WEBPACK_IMPORTED_MODULE_2__["default"])(l, a, b_);
    return [L, c, h, ...(rest.length > 0 && rest[0] < 1 ? [rest[0]] : [])];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2oklch);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/rgb/index.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/rgb/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   rgb: () => (/* binding */ rgb)
/* harmony export */ });
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");




const { round } = Math;

_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.rgb = function (rnd = true) {
    if (rnd === false) return this._rgb.slice(0, 3);
    return this._rgb.slice(0, 3).map(round);
};

_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.rgba = function (rnd = true) {
    return this._rgb.slice(0, 4).map((v, i) => {
        return i < 3 ? (rnd === false ? v : round(v)) : v;
    });
};

const rgb = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](...args, 'rgb');
Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"], { rgb });

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.rgb = (...args) => {
    const rgba = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.unpack)(args, 'rgba');
    if (rgba[3] === undefined) rgba[3] = 1;
    return rgba;
};

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].autodetect.push({
    p: 3,
    test: (...args) => {
        args = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.unpack)(args, 'rgba');
        if (
            (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.type)(args) === 'array' &&
            (args.length === 3 ||
                (args.length === 4 &&
                    (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_3__.type)(args[3]) == 'number' &&
                    args[3] >= 0 &&
                    args[3] <= 1))
        ) {
            return 'rgb';
        }
    }
});




/***/ }),

/***/ "./node_modules/chroma-js/src/io/temp/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/chroma-js/src/io/temp/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   kelvin: () => (/* binding */ temp),
/* harmony export */   temp: () => (/* binding */ temp),
/* harmony export */   temperature: () => (/* binding */ temp)
/* harmony export */ });
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../input.js */ "./node_modules/chroma-js/src/io/input.js");
/* harmony import */ var _temperature2rgb_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./temperature2rgb.js */ "./node_modules/chroma-js/src/io/temp/temperature2rgb.js");
/* harmony import */ var _rgb2temperature_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./rgb2temperature.js */ "./node_modules/chroma-js/src/io/temp/rgb2temperature.js");






_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.temp =
    _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.kelvin =
    _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.temperature =
        function () {
            return (0,_rgb2temperature_js__WEBPACK_IMPORTED_MODULE_4__["default"])(this._rgb);
        };

const temp = (...args) => new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](...args, 'temp');
Object.assign(_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"], { temp, kelvin: temp, temperature: temp });

_input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.temp =
    _input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.kelvin =
    _input_js__WEBPACK_IMPORTED_MODULE_2__["default"].format.temperature =
        _temperature2rgb_js__WEBPACK_IMPORTED_MODULE_3__["default"];




/***/ }),

/***/ "./node_modules/chroma-js/src/io/temp/rgb2temperature.js":
/*!***************************************************************!*\
  !*** ./node_modules/chroma-js/src/io/temp/rgb2temperature.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _temperature2rgb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./temperature2rgb.js */ "./node_modules/chroma-js/src/io/temp/temperature2rgb.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");
/*
 * Based on implementation by Neil Bartlett
 * https://github.com/neilbartlett/color-temperature
 **/



const { round } = Math;

const rgb2temperature = (...args) => {
    const rgb = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.unpack)(args, 'rgb');
    const r = rgb[0],
        b = rgb[2];
    let minTemp = 1000;
    let maxTemp = 40000;
    const eps = 0.4;
    let temp;
    while (maxTemp - minTemp > eps) {
        temp = (maxTemp + minTemp) * 0.5;
        const rgb = (0,_temperature2rgb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(temp);
        if (rgb[2] / rgb[0] >= b / r) {
            maxTemp = temp;
        } else {
            minTemp = temp;
        }
    }
    return round(temp);
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rgb2temperature);


/***/ }),

/***/ "./node_modules/chroma-js/src/io/temp/temperature2rgb.js":
/*!***************************************************************!*\
  !*** ./node_modules/chroma-js/src/io/temp/temperature2rgb.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*
 * Based on implementation by Neil Bartlett
 * https://github.com/neilbartlett/color-temperature
 */

const { log } = Math;

const temperature2rgb = (kelvin) => {
    const temp = kelvin / 100;
    let r, g, b;
    if (temp < 66) {
        r = 255;
        g =
            temp < 6
                ? 0
                : -155.25485562709179 -
                  0.44596950469579133 * (g = temp - 2) +
                  104.49216199393888 * log(g);
        b =
            temp < 20
                ? 0
                : -254.76935184120902 +
                  0.8274096064007395 * (b = temp - 10) +
                  115.67994401066147 * log(b);
    } else {
        r =
            351.97690566805693 +
            0.114206453784165 * (r = temp - 55) -
            40.25366309332127 * log(r);
        g =
            325.4494125711974 +
            0.07943456536662342 * (g = temp - 50) -
            28.0852963507957 * log(g);
        b = 255;
    }
    return [r, g, b, 1];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (temperature2rgb);


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/alpha.js":
/*!*************************************************!*\
  !*** ./node_modules/chroma-js/src/ops/alpha.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");



_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.alpha = function (a, mutate = false) {
    if (a !== undefined && (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(a) === 'number') {
        if (mutate) {
            this._rgb[3] = a;
            return this;
        }
        return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
    }
    return this._rgb[3];
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/clipped.js":
/*!***************************************************!*\
  !*** ./node_modules/chroma-js/src/ops/clipped.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");


_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.clipped = function () {
    return this._rgb._clipped || false;
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/darken.js":
/*!**************************************************!*\
  !*** ./node_modules/chroma-js/src/ops/darken.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _io_lab_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/lab/index.js */ "./node_modules/chroma-js/src/io/lab/index.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _io_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../io/lab/lab-constants.js */ "./node_modules/chroma-js/src/io/lab/lab-constants.js");




_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.darken = function (amount = 1) {
    const me = this;
    const lab = me.lab();
    lab[0] -= _io_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_2__["default"].Kn * amount;
    return new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](lab, 'lab').alpha(me.alpha(), true);
};

_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.brighten = function (amount = 1) {
    return this.darken(-amount);
};

_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.darker = _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.darken;
_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.brighter = _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.brighten;


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/get.js":
/*!***********************************************!*\
  !*** ./node_modules/chroma-js/src/ops/get.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");


_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.get = function (mc) {
    const [mode, channel] = mc.split('.');
    const src = this[mode]();
    if (channel) {
        const i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
        if (i > -1) return src[i];
        throw new Error(`unknown channel ${channel} in mode ${mode}`);
    } else {
        return src;
    }
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/luminance.js":
/*!*****************************************************!*\
  !*** ./node_modules/chroma-js/src/ops/luminance.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");


const { pow } = Math;

const EPS = 1e-7;
const MAX_ITER = 20;

_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.luminance = function (lum, mode = 'rgb') {
    if (lum !== undefined && (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(lum) === 'number') {
        if (lum === 0) {
            // return pure black
            return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([0, 0, 0, this._rgb[3]], 'rgb');
        }
        if (lum === 1) {
            // return pure white
            return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([255, 255, 255, this._rgb[3]], 'rgb');
        }
        // compute new color using...
        let cur_lum = this.luminance();
        let max_iter = MAX_ITER;

        const test = (low, high) => {
            const mid = low.interpolate(high, 0.5, mode);
            const lm = mid.luminance();
            if (Math.abs(lum - lm) < EPS || !max_iter--) {
                // close enough
                return mid;
            }
            return lm > lum ? test(low, mid) : test(mid, high);
        };

        const rgb = (
            cur_lum > lum
                ? test(new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([0, 0, 0]), this)
                : test(this, new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([255, 255, 255]))
        ).rgb();
        return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([...rgb, this._rgb[3]]);
    }
    return rgb2luminance(...this._rgb.slice(0, 3));
};

const rgb2luminance = (r, g, b) => {
    // relative luminance
    // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
    r = luminance_x(r);
    g = luminance_x(g);
    b = luminance_x(b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const luminance_x = (x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : pow((x + 0.055) / 1.055, 2.4);
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/mix.js":
/*!***********************************************!*\
  !*** ./node_modules/chroma-js/src/ops/mix.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _generator_mix_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../generator/mix.js */ "./node_modules/chroma-js/src/generator/mix.js");



_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.mix = _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.interpolate = function (
    col2,
    f = 0.5,
    ...rest
) {
    return (0,_generator_mix_js__WEBPACK_IMPORTED_MODULE_1__["default"])(this, col2, f, ...rest);
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/premultiply.js":
/*!*******************************************************!*\
  !*** ./node_modules/chroma-js/src/ops/premultiply.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");


_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.premultiply = function (mutate = false) {
    const rgb = this._rgb;
    const a = rgb[3];
    if (mutate) {
        this._rgb = [rgb[0] * a, rgb[1] * a, rgb[2] * a, a];
        return this;
    } else {
        return new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([rgb[0] * a, rgb[1] * a, rgb[2] * a, a], 'rgb');
    }
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/saturate.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/ops/saturate.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _io_lch_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/lch/index.js */ "./node_modules/chroma-js/src/io/lch/index.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _io_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../io/lab/lab-constants.js */ "./node_modules/chroma-js/src/io/lab/lab-constants.js");




_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.saturate = function (amount = 1) {
    const me = this;
    const lch = me.lch();
    lch[1] += _io_lab_lab_constants_js__WEBPACK_IMPORTED_MODULE_2__["default"].Kn * amount;
    if (lch[1] < 0) lch[1] = 0;
    return new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](lch, 'lch').alpha(me.alpha(), true);
};

_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.desaturate = function (amount = 1) {
    return this.saturate(-amount);
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/set.js":
/*!***********************************************!*\
  !*** ./node_modules/chroma-js/src/ops/set.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/chroma-js/src/utils/index.js");



_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.set = function (mc, value, mutate = false) {
    const [mode, channel] = mc.split('.');
    const src = this[mode]();
    if (channel) {
        const i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
        if (i > -1) {
            if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(value) == 'string') {
                switch (value.charAt(0)) {
                    case '+':
                        src[i] += +value;
                        break;
                    case '-':
                        src[i] += +value;
                        break;
                    case '*':
                        src[i] *= +value.substr(1);
                        break;
                    case '/':
                        src[i] /= +value.substr(1);
                        break;
                    default:
                        src[i] = +value;
                }
            } else if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.type)(value) === 'number') {
                src[i] = value;
            } else {
                throw new Error(`unsupported value for Color.set`);
            }
            const out = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](src, mode);
            if (mutate) {
                this._rgb = out._rgb;
                return this;
            }
            return out;
        }
        throw new Error(`unknown channel ${channel} in mode ${mode}`);
    } else {
        return src;
    }
};


/***/ }),

/***/ "./node_modules/chroma-js/src/ops/shade.js":
/*!*************************************************!*\
  !*** ./node_modules/chroma-js/src/ops/shade.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _io_lab_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../io/lab/index.js */ "./node_modules/chroma-js/src/io/lab/index.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _generator_mix_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../generator/mix.js */ "./node_modules/chroma-js/src/generator/mix.js");




_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.tint = function (f = 0.5, ...rest) {
    return (0,_generator_mix_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this, 'white', f, ...rest);
};

_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.shade = function (f = 0.5, ...rest) {
    return (0,_generator_mix_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this, 'black', f, ...rest);
};


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/analyze.js":
/*!*****************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/analyze.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   analyze: () => (/* binding */ analyze),
/* harmony export */   limits: () => (/* binding */ limits)
/* harmony export */ });
/* harmony import */ var _type_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./type.js */ "./node_modules/chroma-js/src/utils/type.js");


const { log, pow, floor, abs } = Math;

function analyze(data, key = null) {
    const r = {
        min: Number.MAX_VALUE,
        max: Number.MAX_VALUE * -1,
        sum: 0,
        values: [],
        count: 0
    };
    if ((0,_type_js__WEBPACK_IMPORTED_MODULE_0__["default"])(data) === 'object') {
        data = Object.values(data);
    }
    data.forEach((val) => {
        if (key && (0,_type_js__WEBPACK_IMPORTED_MODULE_0__["default"])(val) === 'object') val = val[key];
        if (val !== undefined && val !== null && !isNaN(val)) {
            r.values.push(val);
            r.sum += val;
            if (val < r.min) r.min = val;
            if (val > r.max) r.max = val;
            r.count += 1;
        }
    });

    r.domain = [r.min, r.max];

    r.limits = (mode, num) => limits(r, mode, num);

    return r;
}

function limits(data, mode = 'equal', num = 7) {
    if ((0,_type_js__WEBPACK_IMPORTED_MODULE_0__["default"])(data) == 'array') {
        data = analyze(data);
    }
    const { min, max } = data;
    const values = data.values.sort((a, b) => a - b);

    if (num === 1) {
        return [min, max];
    }

    const limits = [];

    if (mode.substr(0, 1) === 'c') {
        // continuous
        limits.push(min);
        limits.push(max);
    }

    if (mode.substr(0, 1) === 'e') {
        // equal interval
        limits.push(min);
        for (let i = 1; i < num; i++) {
            limits.push(min + (i / num) * (max - min));
        }
        limits.push(max);
    } else if (mode.substr(0, 1) === 'l') {
        // log scale
        if (min <= 0) {
            throw new Error(
                'Logarithmic scales are only possible for values > 0'
            );
        }
        const min_log = Math.LOG10E * log(min);
        const max_log = Math.LOG10E * log(max);
        limits.push(min);
        for (let i = 1; i < num; i++) {
            limits.push(pow(10, min_log + (i / num) * (max_log - min_log)));
        }
        limits.push(max);
    } else if (mode.substr(0, 1) === 'q') {
        // quantile scale
        limits.push(min);
        for (let i = 1; i < num; i++) {
            const p = ((values.length - 1) * i) / num;
            const pb = floor(p);
            if (pb === p) {
                limits.push(values[pb]);
            } else {
                // p > pb
                const pr = p - pb;
                limits.push(values[pb] * (1 - pr) + values[pb + 1] * pr);
            }
        }
        limits.push(max);
    } else if (mode.substr(0, 1) === 'k') {
        // k-means clustering
        /*
        implementation based on
        http://code.google.com/p/figue/source/browse/trunk/figue.js#336
        simplified for 1-d input values
        */
        let cluster;
        const n = values.length;
        const assignments = new Array(n);
        const clusterSizes = new Array(num);
        let repeat = true;
        let nb_iters = 0;
        let centroids = null;

        // get seed values
        centroids = [];
        centroids.push(min);
        for (let i = 1; i < num; i++) {
            centroids.push(min + (i / num) * (max - min));
        }
        centroids.push(max);

        while (repeat) {
            // assignment step
            for (let j = 0; j < num; j++) {
                clusterSizes[j] = 0;
            }
            for (let i = 0; i < n; i++) {
                const value = values[i];
                let mindist = Number.MAX_VALUE;
                let best;
                for (let j = 0; j < num; j++) {
                    const dist = abs(centroids[j] - value);
                    if (dist < mindist) {
                        mindist = dist;
                        best = j;
                    }
                    clusterSizes[best]++;
                    assignments[i] = best;
                }
            }

            // update centroids step
            const newCentroids = new Array(num);
            for (let j = 0; j < num; j++) {
                newCentroids[j] = null;
            }
            for (let i = 0; i < n; i++) {
                cluster = assignments[i];
                if (newCentroids[cluster] === null) {
                    newCentroids[cluster] = values[i];
                } else {
                    newCentroids[cluster] += values[i];
                }
            }
            for (let j = 0; j < num; j++) {
                newCentroids[j] *= 1 / clusterSizes[j];
            }

            // check convergence
            repeat = false;
            for (let j = 0; j < num; j++) {
                if (newCentroids[j] !== centroids[j]) {
                    repeat = true;
                    break;
                }
            }

            centroids = newCentroids;
            nb_iters++;

            if (nb_iters > 200) {
                repeat = false;
            }
        }

        // finished k-means clustering
        // the next part is borrowed from gabrielflor.it
        const kClusters = {};
        for (let j = 0; j < num; j++) {
            kClusters[j] = [];
        }
        for (let i = 0; i < n; i++) {
            cluster = assignments[i];
            kClusters[cluster].push(values[i]);
        }
        let tmpKMeansBreaks = [];
        for (let j = 0; j < num; j++) {
            tmpKMeansBreaks.push(kClusters[j][0]);
            tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
        }
        tmpKMeansBreaks = tmpKMeansBreaks.sort((a, b) => a - b);
        limits.push(tmpKMeansBreaks[0]);
        for (let i = 1; i < tmpKMeansBreaks.length; i += 2) {
            const v = tmpKMeansBreaks[i];
            if (!isNaN(v) && limits.indexOf(v) === -1) {
                limits.push(v);
            }
        }
    }
    return limits;
}


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/clip_rgb.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/clip_rgb.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _limit_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./limit.js */ "./node_modules/chroma-js/src/utils/limit.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((rgb) => {
    rgb._clipped = false;
    rgb._unclipped = rgb.slice(0);
    for (let i = 0; i <= 3; i++) {
        if (i < 3) {
            if (rgb[i] < 0 || rgb[i] > 255) rgb._clipped = true;
            rgb[i] = (0,_limit_js__WEBPACK_IMPORTED_MODULE_0__["default"])(rgb[i], 0, 255);
        } else if (i === 3) {
            rgb[i] = (0,_limit_js__WEBPACK_IMPORTED_MODULE_0__["default"])(rgb[i], 0, 1);
        }
    }
    return rgb;
});


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/contrast.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/contrast.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _ops_luminance_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ops/luminance.js */ "./node_modules/chroma-js/src/ops/luminance.js");



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((a, b) => {
    // WCAG contrast ratio
    // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
    a = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](a);
    b = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](b);
    const l1 = a.luminance();
    const l2 = b.luminance();
    return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
});


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/contrastAPCA.js":
/*!**********************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/contrastAPCA.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");
/* harmony import */ var _generator_mix_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../generator/mix.js */ "./node_modules/chroma-js/src/generator/mix.js");



/**
 * @license
 *
 * The APCA contrast prediction algorithm is based of the formulas published
 * in the APCA-1.0.98G specification by Myndex. The specification is available at:
 * https://raw.githubusercontent.com/Myndex/apca-w3/master/images/APCAw3_0.1.17_APCA0.0.98G.svg
 *
 * Note that the APCA implementation is still beta, so please update to
 * future versions of chroma.js when they become available.
 *
 * You can read more about the APCA Readability Criterion at
 * https://readtech.org/ARC/
 */

// constants
const W_offset = 0.027;
const P_in = 0.0005;
const P_out = 0.1;
const R_scale = 1.14;
const B_threshold = 0.022;
const B_exp = 1.414;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((text, bg) => {
    // parse input colors
    text = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](text);
    bg = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](bg);
    // if text color has alpha, blend against background
    if (text.alpha() < 1) {
        text = (0,_generator_mix_js__WEBPACK_IMPORTED_MODULE_1__["default"])(bg, text, text.alpha(), 'rgb');
    }
    const l_text = lum(...text.rgb());
    const l_bg = lum(...bg.rgb());

    // soft clamp black levels
    const Y_text =
        l_text >= B_threshold
            ? l_text
            : l_text + Math.pow(B_threshold - l_text, B_exp);
    const Y_bg =
        l_bg >= B_threshold ? l_bg : l_bg + Math.pow(B_threshold - l_bg, B_exp);

    // normal polarity (dark text on light background)
    const S_norm = Math.pow(Y_bg, 0.56) - Math.pow(Y_text, 0.57);
    // reverse polarity (light text on dark background)
    const S_rev = Math.pow(Y_bg, 0.65) - Math.pow(Y_text, 0.62);
    // clamp noise then scale
    const C =
        Math.abs(Y_bg - Y_text) < P_in
            ? 0
            : Y_text < Y_bg
              ? S_norm * R_scale
              : S_rev * R_scale;
    // clamp minimum contrast then offset
    const S_apc = Math.abs(C) < P_out ? 0 : C > 0 ? C - W_offset : C + W_offset;
    // scale to 100
    return S_apc * 100;
});

function lum(r, g, b) {
    return (
        0.2126729 * Math.pow(r / 255, 2.4) +
        0.7151522 * Math.pow(g / 255, 2.4) +
        0.072175 * Math.pow(b / 255, 2.4)
    );
}


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/delta-e.js":
/*!*****************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/delta-e.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");

const { sqrt, pow, min, max, atan2, abs, cos, sin, exp, PI } = Math;

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(a, b, Kl = 1, Kc = 1, Kh = 1) {
    // Delta E (CIE 2000)
    // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
    var rad2deg = function (rad) {
        return (360 * rad) / (2 * PI);
    };
    var deg2rad = function (deg) {
        return (2 * PI * deg) / 360;
    };
    a = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](a);
    b = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](b);
    const [L1, a1, b1] = Array.from(a.lab());
    const [L2, a2, b2] = Array.from(b.lab());
    const avgL = (L1 + L2) / 2;
    const C1 = sqrt(pow(a1, 2) + pow(b1, 2));
    const C2 = sqrt(pow(a2, 2) + pow(b2, 2));
    const avgC = (C1 + C2) / 2;
    const G = 0.5 * (1 - sqrt(pow(avgC, 7) / (pow(avgC, 7) + pow(25, 7))));
    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    const C1p = sqrt(pow(a1p, 2) + pow(b1, 2));
    const C2p = sqrt(pow(a2p, 2) + pow(b2, 2));
    const avgCp = (C1p + C2p) / 2;
    const arctan1 = rad2deg(atan2(b1, a1p));
    const arctan2 = rad2deg(atan2(b2, a2p));
    const h1p = arctan1 >= 0 ? arctan1 : arctan1 + 360;
    const h2p = arctan2 >= 0 ? arctan2 : arctan2 + 360;
    const avgHp =
        abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
    const T =
        1 -
        0.17 * cos(deg2rad(avgHp - 30)) +
        0.24 * cos(deg2rad(2 * avgHp)) +
        0.32 * cos(deg2rad(3 * avgHp + 6)) -
        0.2 * cos(deg2rad(4 * avgHp - 63));
    let deltaHp = h2p - h1p;
    deltaHp =
        abs(deltaHp) <= 180
            ? deltaHp
            : h2p <= h1p
              ? deltaHp + 360
              : deltaHp - 360;
    deltaHp = 2 * sqrt(C1p * C2p) * sin(deg2rad(deltaHp) / 2);
    const deltaL = L2 - L1;
    const deltaCp = C2p - C1p;
    const sl = 1 + (0.015 * pow(avgL - 50, 2)) / sqrt(20 + pow(avgL - 50, 2));
    const sc = 1 + 0.045 * avgCp;
    const sh = 1 + 0.015 * avgCp * T;
    const deltaTheta = 30 * exp(-pow((avgHp - 275) / 25, 2));
    const Rc = 2 * sqrt(pow(avgCp, 7) / (pow(avgCp, 7) + pow(25, 7)));
    const Rt = -Rc * sin(2 * deg2rad(deltaTheta));
    const result = sqrt(
        pow(deltaL / (Kl * sl), 2) +
            pow(deltaCp / (Kc * sc), 2) +
            pow(deltaHp / (Kh * sh), 2) +
            Rt * (deltaCp / (Kc * sc)) * (deltaHp / (Kh * sh))
    );
    return max(0, min(100, result));
}


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/distance.js":
/*!******************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/distance.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");


// simple Euclidean distance
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(a, b, mode = 'lab') {
    // Delta E (CIE 1976)
    // see http://www.brucelindbloom.com/index.html?Equations.html
    a = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](a);
    b = new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](b);
    const l1 = a.get(mode);
    const l2 = b.get(mode);
    let sum_sq = 0;
    for (let i in l1) {
        const d = (l1[i] || 0) - (l2[i] || 0);
        sum_sq += d * d;
    }
    return Math.sqrt(sum_sq);
}


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/index.js":
/*!***************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEG2RAD: () => (/* binding */ DEG2RAD),
/* harmony export */   PI: () => (/* binding */ PI),
/* harmony export */   PITHIRD: () => (/* binding */ PITHIRD),
/* harmony export */   RAD2DEG: () => (/* binding */ RAD2DEG),
/* harmony export */   TWOPI: () => (/* binding */ TWOPI),
/* harmony export */   clip_rgb: () => (/* reexport safe */ _clip_rgb_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   last: () => (/* reexport safe */ _last_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   limit: () => (/* reexport safe */ _limit_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   max: () => (/* binding */ max),
/* harmony export */   min: () => (/* binding */ min),
/* harmony export */   reverse3: () => (/* binding */ reverse3),
/* harmony export */   rnd2: () => (/* binding */ rnd2),
/* harmony export */   rnd3: () => (/* binding */ rnd3),
/* harmony export */   type: () => (/* reexport safe */ _type_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   unpack: () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_3__["default"])
/* harmony export */ });
/* harmony import */ var _clip_rgb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clip_rgb.js */ "./node_modules/chroma-js/src/utils/clip_rgb.js");
/* harmony import */ var _limit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./limit.js */ "./node_modules/chroma-js/src/utils/limit.js");
/* harmony import */ var _type_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./type.js */ "./node_modules/chroma-js/src/utils/type.js");
/* harmony import */ var _unpack_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./unpack.js */ "./node_modules/chroma-js/src/utils/unpack.js");
/* harmony import */ var _last_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./last.js */ "./node_modules/chroma-js/src/utils/last.js");
const { PI, min, max } = Math;

const rnd2 = (a) => Math.round(a * 100) / 100;
const rnd3 = (a) => Math.round(a * 100) / 100;







const TWOPI = PI * 2;
const PITHIRD = PI / 3;
const DEG2RAD = PI / 180;
const RAD2DEG = 180 / PI;

/**
 * Reverse the first three elements of an array
 *
 * @param {any[]} arr
 * @returns {any[]}
 */
function reverse3(arr) {
    return [...arr.slice(0, 3).reverse(), ...arr.slice(3)];
}




/***/ }),

/***/ "./node_modules/chroma-js/src/utils/last.js":
/*!**************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/last.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _type_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./type.js */ "./node_modules/chroma-js/src/utils/type.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((args) => {
    if (args.length < 2) return null;
    const l = args.length - 1;
    if ((0,_type_js__WEBPACK_IMPORTED_MODULE_0__["default"])(args[l]) == 'string') return args[l].toLowerCase();
    return null;
});


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/limit.js":
/*!***************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/limit.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const { min, max } = Math;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((x, low = 0, high = 1) => {
    return min(max(low, x), high);
});


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/multiply-matrices.js":
/*!***************************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/multiply-matrices.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ multiplyMatrices)
/* harmony export */ });
// from https://www.w3.org/TR/css-color-4/multiply-matrices.js
function multiplyMatrices(A, B) {
    let m = A.length;

    if (!Array.isArray(A[0])) {
        // A is vector, convert to [[a, b, c, ...]]
        A = [A];
    }

    if (!Array.isArray(B[0])) {
        // B is vector, convert to [[a], [b], [c], ...]]
        B = B.map((x) => [x]);
    }

    let p = B[0].length;
    let B_cols = B[0].map((_, i) => B.map((x) => x[i])); // transpose B
    let product = A.map((row) =>
        B_cols.map((col) => {
            if (!Array.isArray(row)) {
                return col.reduce((a, c) => a + c * row, 0);
            }

            return row.reduce((a, c, i) => a + c * (col[i] || 0), 0);
        })
    );

    if (m === 1) {
        product = product[0]; // Avoid [[a, b, c, ...]]
    }

    if (p === 1) {
        return product.map((x) => x[0]); // Avoid [[a], [b], [c], ...]]
    }

    return product;
}


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/scales.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/scales.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chroma.js */ "./node_modules/chroma-js/src/chroma.js");
/* harmony import */ var _io_hsl_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../io/hsl/index.js */ "./node_modules/chroma-js/src/io/hsl/index.js");
/* harmony import */ var _generator_scale_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../generator/scale.js */ "./node_modules/chroma-js/src/generator/scale.js");
// some pre-defined color scales:




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    cool() {
        return (0,_generator_scale_js__WEBPACK_IMPORTED_MODULE_2__["default"])([_chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].hsl(180, 1, 0.9), _chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].hsl(250, 0.7, 0.4)]);
    },
    hot() {
        return (0,_generator_scale_js__WEBPACK_IMPORTED_MODULE_2__["default"])(['#000', '#f00', '#ff0', '#fff'], [0, 0.25, 0.75, 1]).mode(
            'rgb'
        );
    }
});


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/type.js":
/*!**************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/type.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// ported from jQuery's $.type
const classToType = {};
for (let name of [
    'Boolean',
    'Number',
    'String',
    'Function',
    'Array',
    'Date',
    'RegExp',
    'Undefined',
    'Null'
]) {
    classToType[`[object ${name}]`] = name.toLowerCase();
}
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(obj) {
    return classToType[Object.prototype.toString.call(obj)] || 'object';
}


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/unpack.js":
/*!****************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/unpack.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _type_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./type.js */ "./node_modules/chroma-js/src/utils/type.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((args, keyOrder = null) => {
    // if called with more than 3 arguments, we return the arguments
    if (args.length >= 3) return Array.prototype.slice.call(args);
    // with less than 3 args we check if first arg is object
    // and use the keyOrder string to extract and sort properties
    if ((0,_type_js__WEBPACK_IMPORTED_MODULE_0__["default"])(args[0]) == 'object' && keyOrder) {
        return keyOrder
            .split('')
            .filter((k) => args[0][k] !== undefined)
            .map((k) => args[0][k]);
    }
    // otherwise we just return the first argument
    // (which we suppose is an array of args)
    return args[0].slice(0);
});


/***/ }),

/***/ "./node_modules/chroma-js/src/utils/valid.js":
/*!***************************************************!*\
  !*** ./node_modules/chroma-js/src/utils/valid.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color.js */ "./node_modules/chroma-js/src/Color.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((...args) => {
    try {
        new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](...args);
        return true;
        // eslint-disable-next-line
    } catch (e) {
        return false;
    }
});


/***/ }),

/***/ "./node_modules/chroma-js/src/version.js":
/*!***********************************************!*\
  !*** ./node_modules/chroma-js/src/version.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
// this gets updated automatically
const version = '3.1.2';


/***/ }),

/***/ "./node_modules/dayjs/dayjs.min.js":
/*!*****************************************!*\
  !*** ./node_modules/dayjs/dayjs.min.js ***!
  \*****************************************/
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}(this,(function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",c="month",f="quarter",h="year",d="date",l="Invalid Date",$=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],n=t%100;return"["+t+(e[(n-20)%10]||e[n]||e[0])+"]"}},m=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},v={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,c),s=n-i<0,u=e.clone().add(r+(s?-1:1),c);return+(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:c,y:h,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:f}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},g="en",D={};D[g]=M;var p="$isDayjsObject",S=function(t){return t instanceof _||!(!t||!t[p])},w=function t(e,n,r){var i;if(!e)return g;if("string"==typeof e){var s=e.toLowerCase();D[s]&&(i=s),n&&(D[s]=n,i=s);var u=e.split("-");if(!i&&u.length>1)return t(u[0])}else{var a=e.name;D[a]=e,i=a}return!r&&i&&(g=i),i||!r&&g},O=function(t,e){if(S(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},b=v;b.l=w,b.i=S,b.w=function(t,e){return O(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=w(t.locale,null,!0),this.parse(t),this.$x=this.$x||t.x||{},this[p]=!0}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(b.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match($);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.init()},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},m.$utils=function(){return b},m.isValid=function(){return!(this.$d.toString()===l)},m.isSame=function(t,e){var n=O(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return O(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<O(t)},m.$g=function(t,e,n){return b.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!b.u(e)||e,f=b.p(t),l=function(t,e){var i=b.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},$=function(t,e){return b.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,v="set"+(this.$u?"UTC":"");switch(f){case h:return r?l(1,0):l(31,11);case c:return r?l(1,M):l(0,M+1);case o:var g=this.$locale().weekStart||0,D=(y<g?y+7:y)-g;return l(r?m-D:m+(6-D),M);case a:case d:return $(v+"Hours",0);case u:return $(v+"Minutes",1);case s:return $(v+"Seconds",2);case i:return $(v+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=b.p(t),f="set"+(this.$u?"UTC":""),l=(n={},n[a]=f+"Date",n[d]=f+"Date",n[c]=f+"Month",n[h]=f+"FullYear",n[u]=f+"Hours",n[s]=f+"Minutes",n[i]=f+"Seconds",n[r]=f+"Milliseconds",n)[o],$=o===a?this.$D+(e-this.$W):e;if(o===c||o===h){var y=this.clone().set(d,1);y.$d[l]($),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d}else l&&this.$d[l]($);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[b.p(t)]()},m.add=function(r,f){var d,l=this;r=Number(r);var $=b.p(f),y=function(t){var e=O(l);return b.w(e.date(e.date()+Math.round(t*r)),l)};if($===c)return this.set(c,this.$M+r);if($===h)return this.set(h,this.$y+r);if($===a)return y(1);if($===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[$]||1,m=this.$d.getTime()+r*M;return b.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||l;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=b.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,c=n.months,f=n.meridiem,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].slice(0,s)},d=function(t){return b.s(s%12||12,t,"0")},$=f||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r};return r.replace(y,(function(t,r){return r||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return b.s(e.$y,4,"0");case"M":return a+1;case"MM":return b.s(a+1,2,"0");case"MMM":return h(n.monthsShort,a,c,3);case"MMMM":return h(c,a);case"D":return e.$D;case"DD":return b.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return h(n.weekdaysMin,e.$W,o,2);case"ddd":return h(n.weekdaysShort,e.$W,o,3);case"dddd":return o[e.$W];case"H":return String(s);case"HH":return b.s(s,2,"0");case"h":return d(1);case"hh":return d(2);case"a":return $(s,u,!0);case"A":return $(s,u,!1);case"m":return String(u);case"mm":return b.s(u,2,"0");case"s":return String(e.$s);case"ss":return b.s(e.$s,2,"0");case"SSS":return b.s(e.$ms,3,"0");case"Z":return i}return null}(t)||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,l){var $,y=this,M=b.p(d),m=O(r),v=(m.utcOffset()-this.utcOffset())*e,g=this-m,D=function(){return b.m(y,m)};switch(M){case h:$=D()/12;break;case c:$=D();break;case f:$=D()/3;break;case o:$=(g-v)/6048e5;break;case a:$=(g-v)/864e5;break;case u:$=g/n;break;case s:$=g/e;break;case i:$=g/t;break;default:$=g}return l?$:b.a($)},m.daysInMonth=function(){return this.endOf(c).$D},m.$locale=function(){return D[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=w(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return b.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),k=_.prototype;return O.prototype=k,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",c],["$y",h],["$D",d]].forEach((function(t){k[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),O.extend=function(t,e){return t.$i||(t(e,_,O),t.$i=!0),O},O.locale=w,O.isDayjs=S,O.unix=function(t){return O(1e3*t)},O.en=D[g],O.Ls=D,O.p={},O}));

/***/ }),

/***/ "./node_modules/dayjs/plugin/isToday.js":
/*!**********************************************!*\
  !*** ./node_modules/dayjs/plugin/isToday.js ***!
  \**********************************************/
/***/ (function(module) {

!function(e,o){ true?module.exports=o():0}(this,(function(){"use strict";return function(e,o,t){o.prototype.isToday=function(){var e="YYYY-MM-DD",o=t();return this.format(e)===o.format(e)}}}));

/***/ }),

/***/ "./node_modules/dayjs/plugin/isoWeek.js":
/*!**********************************************!*\
  !*** ./node_modules/dayjs/plugin/isoWeek.js ***!
  \**********************************************/
/***/ (function(module) {

!function(e,t){ true?module.exports=t():0}(this,(function(){"use strict";var e="day";return function(t,i,s){var a=function(t){return t.add(4-t.isoWeekday(),e)},d=i.prototype;d.isoWeekYear=function(){return a(this).year()},d.isoWeek=function(t){if(!this.$utils().u(t))return this.add(7*(t-this.isoWeek()),e);var i,d,n,o,r=a(this),u=(i=this.isoWeekYear(),d=this.$u,n=(d?s.utc:s)().year(i).startOf("year"),o=4-n.isoWeekday(),n.isoWeekday()>4&&(o+=7),n.add(o,e));return r.diff(u,"week")+1},d.isoWeekday=function(e){return this.$utils().u(e)?this.day()||7:this.day(this.day()%7?e:e-7)};var n=d.startOf;d.startOf=function(e,t){var i=this.$utils(),s=!!i.u(t)||t;return"isoweek"===i.p(e)?s?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):n.bind(this)(e,t)}}}));

/***/ }),

/***/ "./node_modules/dayjs/plugin/localeData.js":
/*!*************************************************!*\
  !*** ./node_modules/dayjs/plugin/localeData.js ***!
  \*************************************************/
/***/ (function(module) {

!function(n,e){ true?module.exports=e():0}(this,(function(){"use strict";return function(n,e,t){var r=e.prototype,o=function(n){return n&&(n.indexOf?n:n.s)},u=function(n,e,t,r,u){var i=n.name?n:n.$locale(),a=o(i[e]),s=o(i[t]),f=a||s.map((function(n){return n.slice(0,r)}));if(!u)return f;var d=i.weekStart;return f.map((function(n,e){return f[(e+(d||0))%7]}))},i=function(){return t.Ls[t.locale()]},a=function(n,e){return n.formats[e]||function(n){return n.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(n,e,t){return e||t.slice(1)}))}(n.formats[e.toUpperCase()])},s=function(){var n=this;return{months:function(e){return e?e.format("MMMM"):u(n,"months")},monthsShort:function(e){return e?e.format("MMM"):u(n,"monthsShort","months",3)},firstDayOfWeek:function(){return n.$locale().weekStart||0},weekdays:function(e){return e?e.format("dddd"):u(n,"weekdays")},weekdaysMin:function(e){return e?e.format("dd"):u(n,"weekdaysMin","weekdays",2)},weekdaysShort:function(e){return e?e.format("ddd"):u(n,"weekdaysShort","weekdays",3)},longDateFormat:function(e){return a(n.$locale(),e)},meridiem:this.$locale().meridiem,ordinal:this.$locale().ordinal}};r.localeData=function(){return s.bind(this)()},t.localeData=function(){var n=i();return{firstDayOfWeek:function(){return n.weekStart||0},weekdays:function(){return t.weekdays()},weekdaysShort:function(){return t.weekdaysShort()},weekdaysMin:function(){return t.weekdaysMin()},months:function(){return t.months()},monthsShort:function(){return t.monthsShort()},longDateFormat:function(e){return a(n,e)},meridiem:n.meridiem,ordinal:n.ordinal}},t.months=function(){return u(i(),"months")},t.monthsShort=function(){return u(i(),"monthsShort","months",3)},t.weekdays=function(n){return u(i(),"weekdays",null,null,n)},t.weekdaysShort=function(n){return u(i(),"weekdaysShort","weekdays",3,n)},t.weekdaysMin=function(n){return u(i(),"weekdaysMin","weekdays",2,n)}}}));

/***/ }),

/***/ "./node_modules/dayjs/plugin/minMax.js":
/*!*********************************************!*\
  !*** ./node_modules/dayjs/plugin/minMax.js ***!
  \*********************************************/
/***/ (function(module) {

!function(e,n){ true?module.exports=n():0}(this,(function(){"use strict";return function(e,n,t){var i=function(e,n){if(!n||!n.length||1===n.length&&!n[0]||1===n.length&&Array.isArray(n[0])&&!n[0].length)return null;var t;1===n.length&&n[0].length>0&&(n=n[0]);t=(n=n.filter((function(e){return e})))[0];for(var i=1;i<n.length;i+=1)n[i].isValid()&&!n[i][e](t)||(t=n[i]);return t};t.max=function(){var e=[].slice.call(arguments,0);return i("isAfter",e)},t.min=function(){var e=[].slice.call(arguments,0);return i("isBefore",e)}}}));

/***/ }),

/***/ "./node_modules/dayjs/plugin/updateLocale.js":
/*!***************************************************!*\
  !*** ./node_modules/dayjs/plugin/updateLocale.js ***!
  \***************************************************/
/***/ (function(module) {

!function(e,n){ true?module.exports=n():0}(this,(function(){"use strict";return function(e,n,t){t.updateLocale=function(e,n){var o=t.Ls[e];if(o)return(n?Object.keys(n):[]).forEach((function(e){o[e]=n[e]})),o}}}));

/***/ }),

/***/ "./node_modules/lodash/_DataView.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_DataView.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;


/***/ }),

/***/ "./node_modules/lodash/_Hash.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_Hash.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var hashClear = __webpack_require__(/*! ./_hashClear */ "./node_modules/lodash/_hashClear.js"),
    hashDelete = __webpack_require__(/*! ./_hashDelete */ "./node_modules/lodash/_hashDelete.js"),
    hashGet = __webpack_require__(/*! ./_hashGet */ "./node_modules/lodash/_hashGet.js"),
    hashHas = __webpack_require__(/*! ./_hashHas */ "./node_modules/lodash/_hashHas.js"),
    hashSet = __webpack_require__(/*! ./_hashSet */ "./node_modules/lodash/_hashSet.js");

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),

/***/ "./node_modules/lodash/_ListCache.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_ListCache.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var listCacheClear = __webpack_require__(/*! ./_listCacheClear */ "./node_modules/lodash/_listCacheClear.js"),
    listCacheDelete = __webpack_require__(/*! ./_listCacheDelete */ "./node_modules/lodash/_listCacheDelete.js"),
    listCacheGet = __webpack_require__(/*! ./_listCacheGet */ "./node_modules/lodash/_listCacheGet.js"),
    listCacheHas = __webpack_require__(/*! ./_listCacheHas */ "./node_modules/lodash/_listCacheHas.js"),
    listCacheSet = __webpack_require__(/*! ./_listCacheSet */ "./node_modules/lodash/_listCacheSet.js");

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),

/***/ "./node_modules/lodash/_Map.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Map.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),

/***/ "./node_modules/lodash/_MapCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_MapCache.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var mapCacheClear = __webpack_require__(/*! ./_mapCacheClear */ "./node_modules/lodash/_mapCacheClear.js"),
    mapCacheDelete = __webpack_require__(/*! ./_mapCacheDelete */ "./node_modules/lodash/_mapCacheDelete.js"),
    mapCacheGet = __webpack_require__(/*! ./_mapCacheGet */ "./node_modules/lodash/_mapCacheGet.js"),
    mapCacheHas = __webpack_require__(/*! ./_mapCacheHas */ "./node_modules/lodash/_mapCacheHas.js"),
    mapCacheSet = __webpack_require__(/*! ./_mapCacheSet */ "./node_modules/lodash/_mapCacheSet.js");

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),

/***/ "./node_modules/lodash/_Promise.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_Promise.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;


/***/ }),

/***/ "./node_modules/lodash/_Set.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Set.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),

/***/ "./node_modules/lodash/_SetCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_SetCache.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js"),
    setCacheAdd = __webpack_require__(/*! ./_setCacheAdd */ "./node_modules/lodash/_setCacheAdd.js"),
    setCacheHas = __webpack_require__(/*! ./_setCacheHas */ "./node_modules/lodash/_setCacheHas.js");

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;


/***/ }),

/***/ "./node_modules/lodash/_Stack.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_Stack.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    stackClear = __webpack_require__(/*! ./_stackClear */ "./node_modules/lodash/_stackClear.js"),
    stackDelete = __webpack_require__(/*! ./_stackDelete */ "./node_modules/lodash/_stackDelete.js"),
    stackGet = __webpack_require__(/*! ./_stackGet */ "./node_modules/lodash/_stackGet.js"),
    stackHas = __webpack_require__(/*! ./_stackHas */ "./node_modules/lodash/_stackHas.js"),
    stackSet = __webpack_require__(/*! ./_stackSet */ "./node_modules/lodash/_stackSet.js");

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),

/***/ "./node_modules/lodash/_Symbol.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "./node_modules/lodash/_Uint8Array.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_Uint8Array.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),

/***/ "./node_modules/lodash/_WeakMap.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_WeakMap.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;


/***/ }),

/***/ "./node_modules/lodash/_apply.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_apply.js ***!
  \***************************************/
/***/ ((module) => {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),

/***/ "./node_modules/lodash/_arrayEach.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayEach.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;


/***/ }),

/***/ "./node_modules/lodash/_arrayFilter.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_arrayFilter.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;


/***/ }),

/***/ "./node_modules/lodash/_arrayLikeKeys.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayLikeKeys.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseTimes = __webpack_require__(/*! ./_baseTimes */ "./node_modules/lodash/_baseTimes.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),

/***/ "./node_modules/lodash/_arrayPush.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayPush.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),

/***/ "./node_modules/lodash/_arraySome.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arraySome.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;


/***/ }),

/***/ "./node_modules/lodash/_assignMergeValue.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_assignMergeValue.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;


/***/ }),

/***/ "./node_modules/lodash/_assignValue.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_assignValue.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),

/***/ "./node_modules/lodash/_assocIndexOf.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_assocIndexOf.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),

/***/ "./node_modules/lodash/_baseAssign.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseAssign.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;


/***/ }),

/***/ "./node_modules/lodash/_baseAssignIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseAssignIn.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;


/***/ }),

/***/ "./node_modules/lodash/_baseAssignValue.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseAssignValue.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js");

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),

/***/ "./node_modules/lodash/_baseClone.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseClone.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    arrayEach = __webpack_require__(/*! ./_arrayEach */ "./node_modules/lodash/_arrayEach.js"),
    assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    baseAssign = __webpack_require__(/*! ./_baseAssign */ "./node_modules/lodash/_baseAssign.js"),
    baseAssignIn = __webpack_require__(/*! ./_baseAssignIn */ "./node_modules/lodash/_baseAssignIn.js"),
    cloneBuffer = __webpack_require__(/*! ./_cloneBuffer */ "./node_modules/lodash/_cloneBuffer.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js"),
    copySymbols = __webpack_require__(/*! ./_copySymbols */ "./node_modules/lodash/_copySymbols.js"),
    copySymbolsIn = __webpack_require__(/*! ./_copySymbolsIn */ "./node_modules/lodash/_copySymbolsIn.js"),
    getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js"),
    getAllKeysIn = __webpack_require__(/*! ./_getAllKeysIn */ "./node_modules/lodash/_getAllKeysIn.js"),
    getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    initCloneArray = __webpack_require__(/*! ./_initCloneArray */ "./node_modules/lodash/_initCloneArray.js"),
    initCloneByTag = __webpack_require__(/*! ./_initCloneByTag */ "./node_modules/lodash/_initCloneByTag.js"),
    initCloneObject = __webpack_require__(/*! ./_initCloneObject */ "./node_modules/lodash/_initCloneObject.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isMap = __webpack_require__(/*! ./isMap */ "./node_modules/lodash/isMap.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isSet = __webpack_require__(/*! ./isSet */ "./node_modules/lodash/isSet.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;


/***/ }),

/***/ "./node_modules/lodash/_baseCreate.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseCreate.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),

/***/ "./node_modules/lodash/_baseFor.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseFor.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var createBaseFor = __webpack_require__(/*! ./_createBaseFor */ "./node_modules/lodash/_createBaseFor.js");

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;


/***/ }),

/***/ "./node_modules/lodash/_baseGetAllKeys.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_baseGetAllKeys.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;


/***/ }),

/***/ "./node_modules/lodash/_baseGetTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "./node_modules/lodash/_baseIsArguments.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsArguments.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),

/***/ "./node_modules/lodash/_baseIsEqual.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIsEqual.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsEqualDeep = __webpack_require__(/*! ./_baseIsEqualDeep */ "./node_modules/lodash/_baseIsEqualDeep.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;


/***/ }),

/***/ "./node_modules/lodash/_baseIsEqualDeep.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsEqualDeep.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    equalByTag = __webpack_require__(/*! ./_equalByTag */ "./node_modules/lodash/_equalByTag.js"),
    equalObjects = __webpack_require__(/*! ./_equalObjects */ "./node_modules/lodash/_equalObjects.js"),
    getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;


/***/ }),

/***/ "./node_modules/lodash/_baseIsMap.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsMap.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

module.exports = baseIsMap;


/***/ }),

/***/ "./node_modules/lodash/_baseIsNative.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIsNative.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isMasked = __webpack_require__(/*! ./_isMasked */ "./node_modules/lodash/_isMasked.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),

/***/ "./node_modules/lodash/_baseIsSet.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsSet.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

module.exports = baseIsSet;


/***/ }),

/***/ "./node_modules/lodash/_baseIsTypedArray.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_baseIsTypedArray.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),

/***/ "./node_modules/lodash/_baseKeys.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseKeys.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    nativeKeys = __webpack_require__(/*! ./_nativeKeys */ "./node_modules/lodash/_nativeKeys.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),

/***/ "./node_modules/lodash/_baseKeysIn.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseKeysIn.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    nativeKeysIn = __webpack_require__(/*! ./_nativeKeysIn */ "./node_modules/lodash/_nativeKeysIn.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),

/***/ "./node_modules/lodash/_baseMerge.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseMerge.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    assignMergeValue = __webpack_require__(/*! ./_assignMergeValue */ "./node_modules/lodash/_assignMergeValue.js"),
    baseFor = __webpack_require__(/*! ./_baseFor */ "./node_modules/lodash/_baseFor.js"),
    baseMergeDeep = __webpack_require__(/*! ./_baseMergeDeep */ "./node_modules/lodash/_baseMergeDeep.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js"),
    safeGet = __webpack_require__(/*! ./_safeGet */ "./node_modules/lodash/_safeGet.js");

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack);
    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;


/***/ }),

/***/ "./node_modules/lodash/_baseMergeDeep.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_baseMergeDeep.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assignMergeValue = __webpack_require__(/*! ./_assignMergeValue */ "./node_modules/lodash/_assignMergeValue.js"),
    cloneBuffer = __webpack_require__(/*! ./_cloneBuffer */ "./node_modules/lodash/_cloneBuffer.js"),
    cloneTypedArray = __webpack_require__(/*! ./_cloneTypedArray */ "./node_modules/lodash/_cloneTypedArray.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js"),
    initCloneObject = __webpack_require__(/*! ./_initCloneObject */ "./node_modules/lodash/_initCloneObject.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isArrayLikeObject = __webpack_require__(/*! ./isArrayLikeObject */ "./node_modules/lodash/isArrayLikeObject.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isPlainObject = __webpack_require__(/*! ./isPlainObject */ "./node_modules/lodash/isPlainObject.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js"),
    safeGet = __webpack_require__(/*! ./_safeGet */ "./node_modules/lodash/_safeGet.js"),
    toPlainObject = __webpack_require__(/*! ./toPlainObject */ "./node_modules/lodash/toPlainObject.js");

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;


/***/ }),

/***/ "./node_modules/lodash/_baseRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseRest.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js"),
    overRest = __webpack_require__(/*! ./_overRest */ "./node_modules/lodash/_overRest.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "./node_modules/lodash/_setToString.js");

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),

/***/ "./node_modules/lodash/_baseSetToString.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseSetToString.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var constant = __webpack_require__(/*! ./constant */ "./node_modules/lodash/constant.js"),
    defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js"),
    identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js");

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),

/***/ "./node_modules/lodash/_baseTimes.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseTimes.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),

/***/ "./node_modules/lodash/_baseUnary.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnary.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),

/***/ "./node_modules/lodash/_cacheHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_cacheHas.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;


/***/ }),

/***/ "./node_modules/lodash/_cloneArrayBuffer.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_cloneArrayBuffer.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js");

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;


/***/ }),

/***/ "./node_modules/lodash/_cloneBuffer.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneBuffer.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;


/***/ }),

/***/ "./node_modules/lodash/_cloneDataView.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_cloneDataView.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js");

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;


/***/ }),

/***/ "./node_modules/lodash/_cloneRegExp.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneRegExp.js ***!
  \*********************************************/
/***/ ((module) => {

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;


/***/ }),

/***/ "./node_modules/lodash/_cloneSymbol.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneSymbol.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;


/***/ }),

/***/ "./node_modules/lodash/_cloneTypedArray.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_cloneTypedArray.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js");

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;


/***/ }),

/***/ "./node_modules/lodash/_copyArray.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_copyArray.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),

/***/ "./node_modules/lodash/_copyObject.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_copyObject.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js");

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),

/***/ "./node_modules/lodash/_copySymbols.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_copySymbols.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js");

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;


/***/ }),

/***/ "./node_modules/lodash/_copySymbolsIn.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_copySymbolsIn.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    getSymbolsIn = __webpack_require__(/*! ./_getSymbolsIn */ "./node_modules/lodash/_getSymbolsIn.js");

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;


/***/ }),

/***/ "./node_modules/lodash/_coreJsData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_coreJsData.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),

/***/ "./node_modules/lodash/_createAssigner.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_createAssigner.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseRest = __webpack_require__(/*! ./_baseRest */ "./node_modules/lodash/_baseRest.js"),
    isIterateeCall = __webpack_require__(/*! ./_isIterateeCall */ "./node_modules/lodash/_isIterateeCall.js");

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;


/***/ }),

/***/ "./node_modules/lodash/_createBaseFor.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_createBaseFor.js ***!
  \***********************************************/
/***/ ((module) => {

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;


/***/ }),

/***/ "./node_modules/lodash/_defineProperty.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_defineProperty.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),

/***/ "./node_modules/lodash/_equalArrays.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_equalArrays.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var SetCache = __webpack_require__(/*! ./_SetCache */ "./node_modules/lodash/_SetCache.js"),
    arraySome = __webpack_require__(/*! ./_arraySome */ "./node_modules/lodash/_arraySome.js"),
    cacheHas = __webpack_require__(/*! ./_cacheHas */ "./node_modules/lodash/_cacheHas.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Check that cyclic values are equal.
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;


/***/ }),

/***/ "./node_modules/lodash/_equalByTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_equalByTag.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    mapToArray = __webpack_require__(/*! ./_mapToArray */ "./node_modules/lodash/_mapToArray.js"),
    setToArray = __webpack_require__(/*! ./_setToArray */ "./node_modules/lodash/_setToArray.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

module.exports = equalByTag;


/***/ }),

/***/ "./node_modules/lodash/_equalObjects.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_equalObjects.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Check that cyclic values are equal.
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;


/***/ }),

/***/ "./node_modules/lodash/_freeGlobal.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

module.exports = freeGlobal;


/***/ }),

/***/ "./node_modules/lodash/_getAllKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getAllKeys.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;


/***/ }),

/***/ "./node_modules/lodash/_getAllKeysIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getAllKeysIn.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"),
    getSymbolsIn = __webpack_require__(/*! ./_getSymbolsIn */ "./node_modules/lodash/_getSymbolsIn.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;


/***/ }),

/***/ "./node_modules/lodash/_getMapData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getMapData.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isKeyable = __webpack_require__(/*! ./_isKeyable */ "./node_modules/lodash/_isKeyable.js");

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),

/***/ "./node_modules/lodash/_getNative.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getNative.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsNative = __webpack_require__(/*! ./_baseIsNative */ "./node_modules/lodash/_baseIsNative.js"),
    getValue = __webpack_require__(/*! ./_getValue */ "./node_modules/lodash/_getValue.js");

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),

/***/ "./node_modules/lodash/_getPrototype.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getPrototype.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),

/***/ "./node_modules/lodash/_getRawTag.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "./node_modules/lodash/_getSymbols.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getSymbols.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayFilter = __webpack_require__(/*! ./_arrayFilter */ "./node_modules/lodash/_arrayFilter.js"),
    stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;


/***/ }),

/***/ "./node_modules/lodash/_getSymbolsIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getSymbolsIn.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"),
    stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;


/***/ }),

/***/ "./node_modules/lodash/_getTag.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_getTag.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DataView = __webpack_require__(/*! ./_DataView */ "./node_modules/lodash/_DataView.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    Promise = __webpack_require__(/*! ./_Promise */ "./node_modules/lodash/_Promise.js"),
    Set = __webpack_require__(/*! ./_Set */ "./node_modules/lodash/_Set.js"),
    WeakMap = __webpack_require__(/*! ./_WeakMap */ "./node_modules/lodash/_WeakMap.js"),
    baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;


/***/ }),

/***/ "./node_modules/lodash/_getValue.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_getValue.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),

/***/ "./node_modules/lodash/_hashClear.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_hashClear.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),

/***/ "./node_modules/lodash/_hashDelete.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_hashDelete.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),

/***/ "./node_modules/lodash/_hashGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashGet.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),

/***/ "./node_modules/lodash/_hashHas.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashHas.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),

/***/ "./node_modules/lodash/_hashSet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashSet.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),

/***/ "./node_modules/lodash/_initCloneArray.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_initCloneArray.js ***!
  \************************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;


/***/ }),

/***/ "./node_modules/lodash/_initCloneByTag.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_initCloneByTag.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js"),
    cloneDataView = __webpack_require__(/*! ./_cloneDataView */ "./node_modules/lodash/_cloneDataView.js"),
    cloneRegExp = __webpack_require__(/*! ./_cloneRegExp */ "./node_modules/lodash/_cloneRegExp.js"),
    cloneSymbol = __webpack_require__(/*! ./_cloneSymbol */ "./node_modules/lodash/_cloneSymbol.js"),
    cloneTypedArray = __webpack_require__(/*! ./_cloneTypedArray */ "./node_modules/lodash/_cloneTypedArray.js");

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;


/***/ }),

/***/ "./node_modules/lodash/_initCloneObject.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_initCloneObject.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseCreate = __webpack_require__(/*! ./_baseCreate */ "./node_modules/lodash/_baseCreate.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js");

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;


/***/ }),

/***/ "./node_modules/lodash/_isIndex.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_isIndex.js ***!
  \*****************************************/
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),

/***/ "./node_modules/lodash/_isIterateeCall.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_isIterateeCall.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),

/***/ "./node_modules/lodash/_isKeyable.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_isKeyable.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),

/***/ "./node_modules/lodash/_isMasked.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_isMasked.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var coreJsData = __webpack_require__(/*! ./_coreJsData */ "./node_modules/lodash/_coreJsData.js");

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),

/***/ "./node_modules/lodash/_isPrototype.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_isPrototype.js ***!
  \*********************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),

/***/ "./node_modules/lodash/_listCacheClear.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_listCacheClear.js ***!
  \************************************************/
/***/ ((module) => {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_listCacheDelete.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_listCacheDelete.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_listCacheGet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheGet.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_listCacheHas.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheHas.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_listCacheSet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheSet.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheClear.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_mapCacheClear.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Hash = __webpack_require__(/*! ./_Hash */ "./node_modules/lodash/_Hash.js"),
    ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js");

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheDelete.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_mapCacheDelete.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheGet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheGet.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheHas.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheSet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheSet.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_mapToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_mapToArray.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;


/***/ }),

/***/ "./node_modules/lodash/_nativeCreate.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeCreate.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),

/***/ "./node_modules/lodash/_nativeKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_nativeKeys.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),

/***/ "./node_modules/lodash/_nativeKeysIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeKeysIn.js ***!
  \**********************************************/
/***/ ((module) => {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),

/***/ "./node_modules/lodash/_nodeUtil.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_nodeUtil.js ***!
  \******************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;


/***/ }),

/***/ "./node_modules/lodash/_objectToString.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "./node_modules/lodash/_overArg.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_overArg.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),

/***/ "./node_modules/lodash/_overRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_overRest.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var apply = __webpack_require__(/*! ./_apply */ "./node_modules/lodash/_apply.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),

/***/ "./node_modules/lodash/_root.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "./node_modules/lodash/_safeGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_safeGet.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

module.exports = safeGet;


/***/ }),

/***/ "./node_modules/lodash/_setCacheAdd.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheAdd.js ***!
  \*********************************************/
/***/ ((module) => {

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;


/***/ }),

/***/ "./node_modules/lodash/_setCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheHas.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_setToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_setToArray.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;


/***/ }),

/***/ "./node_modules/lodash/_setToString.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setToString.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseSetToString = __webpack_require__(/*! ./_baseSetToString */ "./node_modules/lodash/_baseSetToString.js"),
    shortOut = __webpack_require__(/*! ./_shortOut */ "./node_modules/lodash/_shortOut.js");

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),

/***/ "./node_modules/lodash/_shortOut.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_shortOut.js ***!
  \******************************************/
/***/ ((module) => {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),

/***/ "./node_modules/lodash/_stackClear.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_stackClear.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js");

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),

/***/ "./node_modules/lodash/_stackDelete.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_stackDelete.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),

/***/ "./node_modules/lodash/_stackGet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackGet.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),

/***/ "./node_modules/lodash/_stackHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackHas.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),

/***/ "./node_modules/lodash/_stackSet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackSet.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),

/***/ "./node_modules/lodash/_toSource.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_toSource.js ***!
  \******************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),

/***/ "./node_modules/lodash/cloneDeep.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/cloneDeep.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseClone = __webpack_require__(/*! ./_baseClone */ "./node_modules/lodash/_baseClone.js");

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

module.exports = cloneDeep;


/***/ }),

/***/ "./node_modules/lodash/constant.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/constant.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),

/***/ "./node_modules/lodash/eq.js":
/*!***********************************!*\
  !*** ./node_modules/lodash/eq.js ***!
  \***********************************/
/***/ ((module) => {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),

/***/ "./node_modules/lodash/identity.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/identity.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),

/***/ "./node_modules/lodash/isArguments.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArguments.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsArguments = __webpack_require__(/*! ./_baseIsArguments */ "./node_modules/lodash/_baseIsArguments.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),

/***/ "./node_modules/lodash/isArray.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/
/***/ ((module) => {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "./node_modules/lodash/isArrayLike.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArrayLike.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js");

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),

/***/ "./node_modules/lodash/isArrayLikeObject.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/isArrayLikeObject.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;


/***/ }),

/***/ "./node_modules/lodash/isBuffer.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isBuffer.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js"),
    stubFalse = __webpack_require__(/*! ./stubFalse */ "./node_modules/lodash/stubFalse.js");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;


/***/ }),

/***/ "./node_modules/lodash/isEqual.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isEqual.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ "./node_modules/lodash/_baseIsEqual.js");

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

module.exports = isEqual;


/***/ }),

/***/ "./node_modules/lodash/isFunction.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/isFunction.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),

/***/ "./node_modules/lodash/isLength.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isLength.js ***!
  \*****************************************/
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),

/***/ "./node_modules/lodash/isMap.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/isMap.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsMap = __webpack_require__(/*! ./_baseIsMap */ "./node_modules/lodash/_baseIsMap.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsMap = nodeUtil && nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

module.exports = isMap;


/***/ }),

/***/ "./node_modules/lodash/isObject.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ "./node_modules/lodash/isObjectLike.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "./node_modules/lodash/isPlainObject.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/isPlainObject.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;


/***/ }),

/***/ "./node_modules/lodash/isSet.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/isSet.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsSet = __webpack_require__(/*! ./_baseIsSet */ "./node_modules/lodash/_baseIsSet.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

module.exports = isSet;


/***/ }),

/***/ "./node_modules/lodash/isTypedArray.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isTypedArray.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsTypedArray = __webpack_require__(/*! ./_baseIsTypedArray */ "./node_modules/lodash/_baseIsTypedArray.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),

/***/ "./node_modules/lodash/keys.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/keys.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"),
    baseKeys = __webpack_require__(/*! ./_baseKeys */ "./node_modules/lodash/_baseKeys.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),

/***/ "./node_modules/lodash/keysIn.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/keysIn.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"),
    baseKeysIn = __webpack_require__(/*! ./_baseKeysIn */ "./node_modules/lodash/_baseKeysIn.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),

/***/ "./node_modules/lodash/merge.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/merge.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseMerge = __webpack_require__(/*! ./_baseMerge */ "./node_modules/lodash/_baseMerge.js"),
    createAssigner = __webpack_require__(/*! ./_createAssigner */ "./node_modules/lodash/_createAssigner.js");

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

module.exports = merge;


/***/ }),

/***/ "./node_modules/lodash/stubArray.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubArray.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;


/***/ }),

/***/ "./node_modules/lodash/stubFalse.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubFalse.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),

/***/ "./node_modules/lodash/toPlainObject.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/toPlainObject.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;


/***/ }),

/***/ "./node_modules/papaparse/papaparse.min.js":
/*!*************************************************!*\
  !*** ./node_modules/papaparse/papaparse.min.js ***!
  \*************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/
((e,t)=>{ true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (t),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):0})(this,function r(){var n="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==n?n:{};var d,s=!n.document&&!!n.postMessage,a=n.IS_PAPA_WORKER||!1,o={},h=0,v={};function u(e){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=b(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null);this._handle=new i(t),(this._handle.streamer=this)._config=t}.call(this,e),this.parseChunk=function(t,e){var i=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<i){let e=this._config.newline;e||(r=this._config.quoteChar||'"',e=this._handle.guessLineEndings(t,r)),t=[...t.split(e).slice(i)].join(e)}this.isFirstChunk&&U(this._config.beforeFirstChunk)&&void 0!==(r=this._config.beforeFirstChunk(t))&&(t=r),this.isFirstChunk=!1,this._halted=!1;var i=this._partialLine+t,r=(this._partialLine="",this._handle.parse(i,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){t=r.meta.cursor,i=(this._finished||(this._partialLine=i.substring(t-this._baseIndex),this._baseIndex=t),r&&r.data&&(this._rowCount+=r.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview);if(a)n.postMessage({results:r,workerId:v.WORKER_ID,finished:i});else if(U(this._config.chunk)&&!e){if(this._config.chunk(r,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=r=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(r.data),this._completeResults.errors=this._completeResults.errors.concat(r.errors),this._completeResults.meta=r.meta),this._completed||!i||!U(this._config.complete)||r&&r.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),i||r&&r.meta.paused||this._nextChunk(),r}this._halted=!0},this._sendError=function(e){U(this._config.error)?this._config.error(e):a&&this._config.error&&n.postMessage({workerId:v.WORKER_ID,error:e,finished:!1})}}function f(e){var r;(e=e||{}).chunkSize||(e.chunkSize=v.RemoteChunkSize),u.call(this,e),this._nextChunk=s?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(r=new XMLHttpRequest,this._config.withCredentials&&(r.withCredentials=this._config.withCredentials),s||(r.onload=y(this._chunkLoaded,this),r.onerror=y(this._chunkError,this)),r.open(this._config.downloadRequestBody?"POST":"GET",this._input,!s),this._config.downloadRequestHeaders){var e,t=this._config.downloadRequestHeaders;for(e in t)r.setRequestHeader(e,t[e])}var i;this._config.chunkSize&&(i=this._start+this._config.chunkSize-1,r.setRequestHeader("Range","bytes="+this._start+"-"+i));try{r.send(this._config.downloadRequestBody)}catch(e){this._chunkError(e.message)}s&&0===r.status&&this._chunkError()}},this._chunkLoaded=function(){4===r.readyState&&(r.status<200||400<=r.status?this._chunkError():(this._start+=this._config.chunkSize||r.responseText.length,this._finished=!this._config.chunkSize||this._start>=(e=>null!==(e=e.getResponseHeader("Content-Range"))?parseInt(e.substring(e.lastIndexOf("/")+1)):-1)(r),this.parseChunk(r.responseText)))},this._chunkError=function(e){e=r.statusText||e;this._sendError(new Error(e))}}function l(e){(e=e||{}).chunkSize||(e.chunkSize=v.LocalChunkSize),u.call(this,e);var i,r,n="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,r=e.slice||e.webkitSlice||e.mozSlice,n?((i=new FileReader).onload=y(this._chunkLoaded,this),i.onerror=y(this._chunkError,this)):i=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input,t=(this._config.chunkSize&&(t=Math.min(this._start+this._config.chunkSize,this._input.size),e=r.call(e,this._start,t)),i.readAsText(e,this._config.encoding));n||this._chunkLoaded({target:{result:t}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(i.error)}}function c(e){var i;u.call(this,e=e||{}),this.stream=function(e){return i=e,this._nextChunk()},this._nextChunk=function(){var e,t;if(!this._finished)return e=this._config.chunkSize,i=e?(t=i.substring(0,e),i.substring(e)):(t=i,""),this._finished=!i,this.parseChunk(t)}}function p(e){u.call(this,e=e||{});var t=[],i=!0,r=!1;this.pause=function(){u.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){u.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){r&&1===t.length&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):i=!0},this._streamData=y(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),i&&(i=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(e){this._streamError(e)}},this),this._streamError=y(function(e){this._streamCleanUp(),this._sendError(e)},this),this._streamEnd=y(function(){this._streamCleanUp(),r=!0,this._streamData("")},this),this._streamCleanUp=y(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function i(m){var n,s,a,t,o=Math.pow(2,53),h=-o,u=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,d=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,i=this,r=0,f=0,l=!1,e=!1,c=[],p={data:[],errors:[],meta:{}};function y(e){return"greedy"===m.skipEmptyLines?""===e.join("").trim():1===e.length&&0===e[0].length}function g(){if(p&&a&&(k("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+v.DefaultDelimiter+"'"),a=!1),m.skipEmptyLines&&(p.data=p.data.filter(function(e){return!y(e)})),_()){if(p)if(Array.isArray(p.data[0])){for(var e=0;_()&&e<p.data.length;e++)p.data[e].forEach(t);p.data.splice(0,1)}else p.data.forEach(t);function t(e,t){U(m.transformHeader)&&(e=m.transformHeader(e,t)),c.push(e)}}function i(e,t){for(var i=m.header?{}:[],r=0;r<e.length;r++){var n=r,s=e[r],s=((e,t)=>(e=>(m.dynamicTypingFunction&&void 0===m.dynamicTyping[e]&&(m.dynamicTyping[e]=m.dynamicTypingFunction(e)),!0===(m.dynamicTyping[e]||m.dynamicTyping)))(e)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&((e=>{if(u.test(e)){e=parseFloat(e);if(h<e&&e<o)return 1}})(t)?parseFloat(t):d.test(t)?new Date(t):""===t?null:t):t)(n=m.header?r>=c.length?"__parsed_extra":c[r]:n,s=m.transform?m.transform(s,n):s);"__parsed_extra"===n?(i[n]=i[n]||[],i[n].push(s)):i[n]=s}return m.header&&(r>c.length?k("FieldMismatch","TooManyFields","Too many fields: expected "+c.length+" fields but parsed "+r,f+t):r<c.length&&k("FieldMismatch","TooFewFields","Too few fields: expected "+c.length+" fields but parsed "+r,f+t)),i}var r;p&&(m.header||m.dynamicTyping||m.transform)&&(r=1,!p.data.length||Array.isArray(p.data[0])?(p.data=p.data.map(i),r=p.data.length):p.data=i(p.data,0),m.header&&p.meta&&(p.meta.fields=c),f+=r)}function _(){return m.header&&0===c.length}function k(e,t,i,r){e={type:e,code:t,message:i};void 0!==r&&(e.row=r),p.errors.push(e)}U(m.step)&&(t=m.step,m.step=function(e){p=e,_()?g():(g(),0!==p.data.length&&(r+=e.data.length,m.preview&&r>m.preview?s.abort():(p.data=p.data[0],t(p,i))))}),this.parse=function(e,t,i){var r=m.quoteChar||'"',r=(m.newline||(m.newline=this.guessLineEndings(e,r)),a=!1,m.delimiter?U(m.delimiter)&&(m.delimiter=m.delimiter(e),p.meta.delimiter=m.delimiter):((r=((e,t,i,r,n)=>{var s,a,o,h;n=n||[",","\t","|",";",v.RECORD_SEP,v.UNIT_SEP];for(var u=0;u<n.length;u++){for(var d,f=n[u],l=0,c=0,p=0,g=(o=void 0,new E({comments:r,delimiter:f,newline:t,preview:10}).parse(e)),_=0;_<g.data.length;_++)i&&y(g.data[_])?p++:(d=g.data[_].length,c+=d,void 0===o?o=d:0<d&&(l+=Math.abs(d-o),o=d));0<g.data.length&&(c/=g.data.length-p),(void 0===a||l<=a)&&(void 0===h||h<c)&&1.99<c&&(a=l,s=f,h=c)}return{successful:!!(m.delimiter=s),bestDelimiter:s}})(e,m.newline,m.skipEmptyLines,m.comments,m.delimitersToGuess)).successful?m.delimiter=r.bestDelimiter:(a=!0,m.delimiter=v.DefaultDelimiter),p.meta.delimiter=m.delimiter),b(m));return m.preview&&m.header&&r.preview++,n=e,s=new E(r),p=s.parse(n,t,i),g(),l?{meta:{paused:!0}}:p||{meta:{paused:!1}}},this.paused=function(){return l},this.pause=function(){l=!0,s.abort(),n=U(m.chunk)?"":n.substring(s.getCharIndex())},this.resume=function(){i.streamer._halted?(l=!1,i.streamer.parseChunk(n,!0)):setTimeout(i.resume,3)},this.aborted=function(){return e},this.abort=function(){e=!0,s.abort(),p.meta.aborted=!0,U(m.complete)&&m.complete(p),n=""},this.guessLineEndings=function(e,t){e=e.substring(0,1048576);var t=new RegExp(P(t)+"([^]*?)"+P(t),"gm"),i=(e=e.replace(t,"")).split("\r"),t=e.split("\n"),e=1<t.length&&t[0].length<i[0].length;if(1===i.length||e)return"\n";for(var r=0,n=0;n<i.length;n++)"\n"===i[n][0]&&r++;return r>=i.length/2?"\r\n":"\r"}}function P(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function E(C){var S=(C=C||{}).delimiter,O=C.newline,x=C.comments,I=C.step,A=C.preview,T=C.fastMode,D=null,L=!1,F=null==C.quoteChar?'"':C.quoteChar,j=F;if(void 0!==C.escapeChar&&(j=C.escapeChar),("string"!=typeof S||-1<v.BAD_DELIMITERS.indexOf(S))&&(S=","),x===S)throw new Error("Comment character same as delimiter");!0===x?x="#":("string"!=typeof x||-1<v.BAD_DELIMITERS.indexOf(x))&&(x=!1),"\n"!==O&&"\r"!==O&&"\r\n"!==O&&(O="\n");var z=0,M=!1;this.parse=function(i,t,r){if("string"!=typeof i)throw new Error("Input must be a string");var n=i.length,e=S.length,s=O.length,a=x.length,o=U(I),h=[],u=[],d=[],f=z=0;if(!i)return w();if(T||!1!==T&&-1===i.indexOf(F)){for(var l=i.split(O),c=0;c<l.length;c++){if(d=l[c],z+=d.length,c!==l.length-1)z+=O.length;else if(r)return w();if(!x||d.substring(0,a)!==x){if(o){if(h=[],k(d.split(S)),R(),M)return w()}else k(d.split(S));if(A&&A<=c)return h=h.slice(0,A),w(!0)}}return w()}for(var p=i.indexOf(S,z),g=i.indexOf(O,z),_=new RegExp(P(j)+P(F),"g"),m=i.indexOf(F,z);;)if(i[z]===F)for(m=z,z++;;){if(-1===(m=i.indexOf(F,m+1)))return r||u.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:h.length,index:z}),E();if(m===n-1)return E(i.substring(z,m).replace(_,F));if(F===j&&i[m+1]===j)m++;else if(F===j||0===m||i[m-1]!==j){-1!==p&&p<m+1&&(p=i.indexOf(S,m+1));var y=v(-1===(g=-1!==g&&g<m+1?i.indexOf(O,m+1):g)?p:Math.min(p,g));if(i.substr(m+1+y,e)===S){d.push(i.substring(z,m).replace(_,F)),i[z=m+1+y+e]!==F&&(m=i.indexOf(F,z)),p=i.indexOf(S,z),g=i.indexOf(O,z);break}y=v(g);if(i.substring(m+1+y,m+1+y+s)===O){if(d.push(i.substring(z,m).replace(_,F)),b(m+1+y+s),p=i.indexOf(S,z),m=i.indexOf(F,z),o&&(R(),M))return w();if(A&&h.length>=A)return w(!0);break}u.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:h.length,index:z}),m++}}else if(x&&0===d.length&&i.substring(z,z+a)===x){if(-1===g)return w();z=g+s,g=i.indexOf(O,z),p=i.indexOf(S,z)}else if(-1!==p&&(p<g||-1===g))d.push(i.substring(z,p)),z=p+e,p=i.indexOf(S,z);else{if(-1===g)break;if(d.push(i.substring(z,g)),b(g+s),o&&(R(),M))return w();if(A&&h.length>=A)return w(!0)}return E();function k(e){h.push(e),f=z}function v(e){var t=0;return t=-1!==e&&(e=i.substring(m+1,e))&&""===e.trim()?e.length:t}function E(e){return r||(void 0===e&&(e=i.substring(z)),d.push(e),z=n,k(d),o&&R()),w()}function b(e){z=e,k(d),d=[],g=i.indexOf(O,z)}function w(e){if(C.header&&!t&&h.length&&!L){var s=h[0],a=Object.create(null),o=new Set(s);let n=!1;for(let r=0;r<s.length;r++){let i=s[r];if(a[i=U(C.transformHeader)?C.transformHeader(i,r):i]){let e,t=a[i];for(;e=i+"_"+t,t++,o.has(e););o.add(e),s[r]=e,a[i]++,n=!0,(D=null===D?{}:D)[e]=i}else a[i]=1,s[r]=i;o.add(i)}n&&console.warn("Duplicate headers found and renamed."),L=!0}return{data:h,errors:u,meta:{delimiter:S,linebreak:O,aborted:M,truncated:!!e,cursor:f+(t||0),renamedHeaders:D}}}function R(){I(w()),h=[],u=[]}},this.abort=function(){M=!0},this.getCharIndex=function(){return z}}function g(e){var t=e.data,i=o[t.workerId],r=!1;if(t.error)i.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){r=!0,_(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:m,resume:m};if(U(i.userStep)){for(var s=0;s<t.results.data.length&&(i.userStep({data:t.results.data[s],errors:t.results.errors,meta:t.results.meta},n),!r);s++);delete t.results}else U(i.userChunk)&&(i.userChunk(t.results,n,t.file),delete t.results)}t.finished&&!r&&_(t.workerId,t.results)}function _(e,t){var i=o[e];U(i.userComplete)&&i.userComplete(t),i.terminate(),delete o[e]}function m(){throw new Error("Not implemented.")}function b(e){if("object"!=typeof e||null===e)return e;var t,i=Array.isArray(e)?[]:{};for(t in e)i[t]=b(e[t]);return i}function y(e,t){return function(){e.apply(t,arguments)}}function U(e){return"function"==typeof e}return v.parse=function(e,t){var i=(t=t||{}).dynamicTyping||!1;U(i)&&(t.dynamicTypingFunction=i,i={});if(t.dynamicTyping=i,t.transform=!!U(t.transform)&&t.transform,!t.worker||!v.WORKERS_SUPPORTED)return i=null,v.NODE_STREAM_INPUT,"string"==typeof e?(e=(e=>65279!==e.charCodeAt(0)?e:e.slice(1))(e),i=new(t.download?f:c)(t)):!0===e.readable&&U(e.read)&&U(e.on)?i=new p(t):(n.File&&e instanceof File||e instanceof Object)&&(i=new l(t)),i.stream(e);(i=(()=>{var e;return!!v.WORKERS_SUPPORTED&&(e=(()=>{var e=n.URL||n.webkitURL||null,t=r.toString();return v.BLOB_URL||(v.BLOB_URL=e.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",t,")();"],{type:"text/javascript"})))})(),(e=new n.Worker(e)).onmessage=g,e.id=h++,o[e.id]=e)})()).userStep=t.step,i.userChunk=t.chunk,i.userComplete=t.complete,i.userError=t.error,t.step=U(t.step),t.chunk=U(t.chunk),t.complete=U(t.complete),t.error=U(t.error),delete t.worker,i.postMessage({input:e,config:t,workerId:i.id})},v.unparse=function(e,t){var n=!1,_=!0,m=",",y="\r\n",s='"',a=s+s,i=!1,r=null,o=!1,h=((()=>{if("object"==typeof t){if("string"!=typeof t.delimiter||v.BAD_DELIMITERS.filter(function(e){return-1!==t.delimiter.indexOf(e)}).length||(m=t.delimiter),"boolean"!=typeof t.quotes&&"function"!=typeof t.quotes&&!Array.isArray(t.quotes)||(n=t.quotes),"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(i=t.skipEmptyLines),"string"==typeof t.newline&&(y=t.newline),"string"==typeof t.quoteChar&&(s=t.quoteChar),"boolean"==typeof t.header&&(_=t.header),Array.isArray(t.columns)){if(0===t.columns.length)throw new Error("Option columns is empty");r=t.columns}void 0!==t.escapeChar&&(a=t.escapeChar+s),t.escapeFormulae instanceof RegExp?o=t.escapeFormulae:"boolean"==typeof t.escapeFormulae&&t.escapeFormulae&&(o=/^[=+\-@\t\r].*$/)}})(),new RegExp(P(s),"g"));"string"==typeof e&&(e=JSON.parse(e));if(Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return u(null,e,i);if("object"==typeof e[0])return u(r||Object.keys(e[0]),e,i)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields||r),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:"object"==typeof e.data[0]?Object.keys(e.data[0]):[]),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),u(e.fields||[],e.data||[],i);throw new Error("Unable to serialize unrecognized input");function u(e,t,i){var r="",n=("string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t)),Array.isArray(e)&&0<e.length),s=!Array.isArray(t[0]);if(n&&_){for(var a=0;a<e.length;a++)0<a&&(r+=m),r+=k(e[a],a);0<t.length&&(r+=y)}for(var o=0;o<t.length;o++){var h=(n?e:t[o]).length,u=!1,d=n?0===Object.keys(t[o]).length:0===t[o].length;if(i&&!n&&(u="greedy"===i?""===t[o].join("").trim():1===t[o].length&&0===t[o][0].length),"greedy"===i&&n){for(var f=[],l=0;l<h;l++){var c=s?e[l]:l;f.push(t[o][c])}u=""===f.join("").trim()}if(!u){for(var p=0;p<h;p++){0<p&&!d&&(r+=m);var g=n&&s?e[p]:p;r+=k(t[o][g],p)}o<t.length-1&&(!i||0<h&&!d)&&(r+=y)}}return r}function k(e,t){var i,r;return null==e?"":e.constructor===Date?JSON.stringify(e).slice(1,25):(r=!1,o&&"string"==typeof e&&o.test(e)&&(e="'"+e,r=!0),i=e.toString().replace(h,a),(r=r||!0===n||"function"==typeof n&&n(e,t)||Array.isArray(n)&&n[t]||((e,t)=>{for(var i=0;i<t.length;i++)if(-1<e.indexOf(t[i]))return!0;return!1})(i,v.BAD_DELIMITERS)||-1<i.indexOf(m)||" "===i.charAt(0)||" "===i.charAt(i.length-1))?s+i+s:i)}},v.RECORD_SEP=String.fromCharCode(30),v.UNIT_SEP=String.fromCharCode(31),v.BYTE_ORDER_MARK="\ufeff",v.BAD_DELIMITERS=["\r","\n",'"',v.BYTE_ORDER_MARK],v.WORKERS_SUPPORTED=!s&&!!n.Worker,v.NODE_STREAM_INPUT=1,v.LocalChunkSize=10485760,v.RemoteChunkSize=5242880,v.DefaultDelimiter=",",v.Parser=E,v.ParserHandle=i,v.NetworkStreamer=f,v.FileStreamer=l,v.StringStreamer=c,v.ReadableStreamStreamer=p,n.jQuery&&((d=n.jQuery).fn.parse=function(o){var i=o.config||{},h=[];return this.each(function(e){if(!("INPUT"===d(this).prop("tagName").toUpperCase()&&"file"===d(this).attr("type").toLowerCase()&&n.FileReader)||!this.files||0===this.files.length)return!0;for(var t=0;t<this.files.length;t++)h.push({file:this.files[t],inputElem:this,instanceConfig:d.extend({},i)})}),e(),this;function e(){if(0===h.length)U(o.complete)&&o.complete();else{var e,t,i,r,n=h[0];if(U(o.before)){var s=o.before(n.file,n.inputElem);if("object"==typeof s){if("abort"===s.action)return e="AbortError",t=n.file,i=n.inputElem,r=s.reason,void(U(o.error)&&o.error({name:e},t,i,r));if("skip"===s.action)return void u();"object"==typeof s.config&&(n.instanceConfig=d.extend(n.instanceConfig,s.config))}else if("skip"===s)return void u()}var a=n.instanceConfig.complete;n.instanceConfig.complete=function(e){U(a)&&a(e,n.file,n.inputElem),u()},v.parse(n.file,n.instanceConfig)}}function u(){h.splice(0,1),e()}}),a&&(n.onmessage=function(e){e=e.data;void 0===v.WORKER_ID&&e&&(v.WORKER_ID=e.workerId);"string"==typeof e.input?n.postMessage({workerId:v.WORKER_ID,results:v.parse(e.input,e.config),finished:!0}):(n.File&&e.input instanceof File||e.input instanceof Object)&&(e=v.parse(e.input,e.config))&&n.postMessage({workerId:v.WORKER_ID,results:e,finished:!0})}),(f.prototype=Object.create(u.prototype)).constructor=f,(l.prototype=Object.create(u.prototype)).constructor=l,(c.prototype=Object.create(c.prototype)).constructor=c,(p.prototype=Object.create(u.prototype)).constructor=p,v});

/***/ }),

/***/ "./src/components/calendar-month.js":
/*!******************************************!*\
  !*** ./src/components/calendar-month.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var _constants_fonts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/fonts */ "./src/constants/fonts.js");
/* harmony import */ var _constants_help__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/help */ "./src/constants/help.js");
/**
 * Month Label Element
 */



const calendarMonth = function (draw) {
  let {
    format = 'MMM \'YY',
    fontFamily = _constants_fonts__WEBPACK_IMPORTED_MODULE_0__.fontfaces[0].value,
    fontSize = 18,
    fontWeight = "normal",
    fontColor = "#212529",
    textAlignment = "middle"
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    format,
    fontFamily,
    fontSize,
    fontWeight,
    fontColor,
    textAlignment
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (calendarMonth);
const settings = () => {
  return {
    "id": "calendar-month",
    "headerTitle": "Month Labels",
    "show": true,
    "disabled": false,
    "options": [{
      "type": "text",
      "name": "format",
      "value": "MMM \'YY",
      "label": "Month Label Format",
      "icon": (0,_constants_help__WEBPACK_IMPORTED_MODULE_1__["default"])("DATEFORMAT", {
        display: "info-icon"
      })
    }, ...(0,_constants_fonts__WEBPACK_IMPORTED_MODULE_0__["default"])({
      size: 18,
      textAlignment: "middle"
    })]
  };
};

/***/ }),

/***/ "./src/components/calendar-week.js":
/*!*****************************************!*\
  !*** ./src/components/calendar-week.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var _constants_fonts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/fonts */ "./src/constants/fonts.js");
/**
 * Weekday Label Element
 */


const calendarWeek = function (draw) {
  let {
    format = 'ddd',
    fontFamily = _constants_fonts__WEBPACK_IMPORTED_MODULE_0__.fontfaces[0].value,
    fontSize = 18,
    fontWeight = "normal",
    fontColor = "#212529",
    textAlignment = "start"
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    format,
    fontFamily,
    fontSize,
    fontWeight,
    fontColor,
    textAlignment
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (calendarWeek);
const settings = () => {
  return {
    "id": "calendar-week",
    "headerTitle": "Week Labels",
    "show": true,
    "disabled": false,
    "options": [{
      "type": "select",
      "name": "format",
      "value": "ddd",
      "options": [{
        name: "Mo, Tu, We, Th …",
        value: "dd"
      }, {
        name: "Mon, Tue, Wed, …",
        value: "ddd"
      }, {
        name: "Monday, Tuesday, …",
        value: "dddd"
      }],
      "label": "Week Label Format"
    }, ...(0,_constants_fonts__WEBPACK_IMPORTED_MODULE_0__["default"])({
      size: 18
    })]
  };
};

/***/ }),

/***/ "./src/components/calendar.js":
/*!************************************!*\
  !*** ./src/components/calendar.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! chroma-js */ "./node_modules/chroma-js/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var dayjs_plugin_localeData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! dayjs/plugin/localeData */ "./node_modules/dayjs/plugin/localeData.js");
/* harmony import */ var dayjs_plugin_localeData__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(dayjs_plugin_localeData__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var dayjs_plugin_updateLocale__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! dayjs/plugin/updateLocale */ "./node_modules/dayjs/plugin/updateLocale.js");
/* harmony import */ var dayjs_plugin_updateLocale__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(dayjs_plugin_updateLocale__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var dayjs_plugin_isoWeek__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! dayjs/plugin/isoWeek */ "./node_modules/dayjs/plugin/isoWeek.js");
/* harmony import */ var dayjs_plugin_isoWeek__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(dayjs_plugin_isoWeek__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var dayjs_plugin_isToday__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! dayjs/plugin/isToday */ "./node_modules/dayjs/plugin/isToday.js");
/* harmony import */ var dayjs_plugin_isToday__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(dayjs_plugin_isToday__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var dayjs_plugin_minMax__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! dayjs/plugin/minMax */ "./node_modules/dayjs/plugin/minMax.js");
/* harmony import */ var dayjs_plugin_minMax__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(dayjs_plugin_minMax__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _components_transform__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/transform */ "./src/components/transform.js");
/* harmony import */ var _components_i18n__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../components/i18n */ "./src/components/i18n.js");
/* harmony import */ var _constants_help__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../constants/help */ "./src/constants/help.js");
/**
 * Calendar Element
 */








dayjs__WEBPACK_IMPORTED_MODULE_1___default().extend((dayjs_plugin_localeData__WEBPACK_IMPORTED_MODULE_2___default()));
dayjs__WEBPACK_IMPORTED_MODULE_1___default().extend((dayjs_plugin_updateLocale__WEBPACK_IMPORTED_MODULE_3___default()));
dayjs__WEBPACK_IMPORTED_MODULE_1___default().extend((dayjs_plugin_isoWeek__WEBPACK_IMPORTED_MODULE_4___default()));
dayjs__WEBPACK_IMPORTED_MODULE_1___default().extend((dayjs_plugin_isToday__WEBPACK_IMPORTED_MODULE_5___default()));
dayjs__WEBPACK_IMPORTED_MODULE_1___default().extend((dayjs_plugin_minMax__WEBPACK_IMPORTED_MODULE_6___default()));



const calendar = function (draw) {
  let {
    x = 0,
    y = 0,
    data = [],
    weekStart = 1,
    tileSize = 16,
    tileColor = "#dddddd",
    tileFuture = true,
    tileShape = "rectangle",
    tilePadding = 4.5,
    monthPadding = 10,
    monthGap = true,
    monthsWrapAfter = 12,
    monthsRowsReverse = false,
    calendarMonthLabels = false,
    calendarWeekLabels = false,
    scale = false,
    legend = false,
    transform = false,
    tooltip = false,
    dataInput = false,
    i18n = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Initial variables
  let initial_x = x;
  let offset_x = x;
  let offset_y = y;
  let offset_x_max = x;
  let end_y = offset_y;
  let max_x = 0;
  let tileBorder = (0,chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"])(tileColor).darken(2).hex();
  let monthLabelHeight = 0;

  // Parse size as Number
  tileSize = Number(tileSize);
  tilePadding = Number(tilePadding);
  monthPadding = Number(monthPadding);
  weekStart = Number(weekStart);

  // Calendar
  let startDate = dayjs__WEBPACK_IMPORTED_MODULE_1___default()().subtract(8, 'month').startOf('month');
  let months = 12;
  let minMonth = dayjs__WEBPACK_IMPORTED_MODULE_1___default().min(...data.map(e => dayjs__WEBPACK_IMPORTED_MODULE_1___default()(e.date || e[dataInput.dateColumn]))) || null;
  let maxMonth = dayjs__WEBPACK_IMPORTED_MODULE_1___default().max(...data.map(e => dayjs__WEBPACK_IMPORTED_MODULE_1___default()(e.date || e[dataInput.dateColumn]))) || null;
  let minData = Math.min(...data.filter(e => (e.value || e[dataInput.valueColumn]) !== null && !isNaN(e.value || e[dataInput.valueColumn])).map(e => e.value || e[dataInput.valueColumn]));
  let maxData = Math.max(...data.filter(e => (e.value || e[dataInput.valueColumn]) !== null && !isNaN(e.value || e[dataInput.valueColumn])).map(e => e.value || e[dataInput.valueColumn]));

  // Format the date column to make the rendering later on faster
  let dataFormatted = data.map(e => {
    if (e.date !== undefined) e.date = dayjs__WEBPACK_IMPORTED_MODULE_1___default()(e.date).format('YYYY-MM-DD');else e[dataInput.dateColumn] = dayjs__WEBPACK_IMPORTED_MODULE_1___default()(e[dataInput.dateColumn]).format('YYYY-MM-DD');
    return e;
  });
  if (minMonth && dataInput) {
    startDate = minMonth.startOf('month');
    months = Math.ceil(maxMonth.diff(minMonth, 'month', true));
  }

  // Locale based formates
  dayjs__WEBPACK_IMPORTED_MODULE_1___default().updateLocale("en", {
    months: function (dayjsInstance, format) {
      if (i18n) return (0,_components_i18n__WEBPACK_IMPORTED_MODULE_8__.monthsForLocale)(i18n.locale, 'long')[dayjsInstance.month()];else return (0,_components_i18n__WEBPACK_IMPORTED_MODULE_8__.monthsForLocale)('en', 'long')[dayjsInstance.month()];
    },
    monthsShort: function (dayjsInstance, format) {
      if (i18n) return (0,_components_i18n__WEBPACK_IMPORTED_MODULE_8__.monthsForLocale)(i18n.locale, 'short')[dayjsInstance.month()];else return (0,_components_i18n__WEBPACK_IMPORTED_MODULE_8__.monthsForLocale)('en', 'short')[dayjsInstance.month()];
    },
    weekdays: (0,_components_i18n__WEBPACK_IMPORTED_MODULE_8__.weekdaysForLocale)(i18n.locale || 'en', 'long'),
    weekdaysShort: (0,_components_i18n__WEBPACK_IMPORTED_MODULE_8__.weekdaysForLocale)(i18n.locale || 'en', 'long').map(el => el.substring(0, 3)),
    weekdaysMin: (0,_components_i18n__WEBPACK_IMPORTED_MODULE_8__.weekdaysForLocale)(i18n.locale || 'en', 'short')
  });

  // Color Scale
  let colors = [];
  if (scale) {
    colors = scale.hexcolors;
  }

  // Weekday Labels
  let weekdays = [...Array(7).keys()];
  let weeklabelWidth = 0;
  if (calendarWeekLabels) {
    if (calendarWeekLabels.format == 'dd') weekdays = dayjs__WEBPACK_IMPORTED_MODULE_1___default().weekdaysMin();
    if (calendarWeekLabels.format == 'ddd') weekdays = dayjs__WEBPACK_IMPORTED_MODULE_1___default().weekdaysShort();
    if (calendarWeekLabels.format == 'dddd') weekdays = dayjs__WEBPACK_IMPORTED_MODULE_1___default().weekdays();

    // Calculate weeklabelWidth as offset
    [0, 2, 4, 6].forEach(wd => {
      let text = draw.text(weekdays[(wd + weekStart) % weekdays.length]);
      text.font({
        family: calendarWeekLabels.fontFamily,
        size: calendarWeekLabels.fontSize,
        weight: calendarWeekLabels.fontWeight
      });
      if (weeklabelWidth < text.bbox().w) weeklabelWidth = text.bbox().w + 5 + tilePadding;
      text.remove();
    });
    offset_x += weeklabelWidth;
  }
  let groupROW = null;

  // Build calendar months
  for (let t = 0; t < months; t++) {
    if (!groupROW) groupROW = draw.group().addClass('row');
    let wrap = false;
    if (t > 0 && t % monthsWrapAfter == 0) {
      offset_x = initial_x + weeklabelWidth;
      y = offset_y += tileSize * 7 + tilePadding * 6 + tileSize * 2;
      if (calendarMonthLabels && calendarMonthLabels.format !== "") {
        offset_y += monthLabelHeight;
      }
      wrap = true;
      groupROW = draw.group().addClass('row');
    }
    let group = draw.group();
    let month_days = startDate.daysInMonth();
    let day_count = 1;

    // Build calendar weeks
    for (let m = 0; m < 6; m++) {
      // Build calendar days
      let wStart = false;
      let wStartIdx = weekStart % weekdays.length;
      for (let w = 0; w < 7; w++) {
        // Done with current month, no more weeks needed
        if (month_days < day_count) continue;

        // Calculate x,y positions
        x = offset_x + (tilePadding + tileSize) * m;
        y = offset_y + (tilePadding + tileSize) * w;

        // Add Weekday Labels before the first month
        if ((t == 0 || wrap) && m == 0 && calendarWeekLabels) {
          // Add Labels at positions 0, 2, 4, 6
          if ([0, 2, 4, 6].indexOf(w) > -1) {
            let text = draw.text(weekdays[(w + weekStart) % weekdays.length]);
            text.font({
              family: calendarWeekLabels.fontFamily,
              size: calendarWeekLabels.fontSize,
              weight: calendarWeekLabels.fontWeight,
              anchor: calendarWeekLabels.textAlignment,
              fill: calendarWeekLabels.fontColor
            });
            text.addClass('calendar-week');
            text.move(offset_x - (weeklabelWidth - tilePadding), y - 2);
            group.add(text);
          }
        }
        if (x > max_x) max_x = x;

        // Continue if the weekday is not matching
        if (m == 0 && !wStart) {
          if (weekdays[wStartIdx % weekdays.length] == weekdays[startDate.isoWeekday() % weekdays.length]) {
            wStart = true;
          } else {
            wStartIdx++;
            continue;
          }
        }

        // Add a day
        let currentTileColor = tileColor;
        let dayData = null;
        let value = null;
        if (scale && data.length > 0) {
          let startDateFormatted = startDate.format('YYYY-MM-DD');
          dayData = dataFormatted.find(e => e[dataInput.dateColumn] == startDateFormatted) || null;
          if (dayData) {
            value = dayData.value || dayData[dataInput.valueColumn];
            let bins = createBins(minData, maxData, colors.length);
            let binIndex = getBinIndex(bins, value);

            // Transform data
            if (transform) {
              bins = createBins((0,_components_transform__WEBPACK_IMPORTED_MODULE_7__.transformValue)(minData, transform.fn), (0,_components_transform__WEBPACK_IMPORTED_MODULE_7__.transformValue)(maxData, transform.fn), colors.length);
              binIndex = getBinIndex(bins, (0,_components_transform__WEBPACK_IMPORTED_MODULE_7__.transformValue)(value, transform.fn));
            }
            if (binIndex > -1 && value !== null) currentTileColor = colors[binIndex];else currentTileColor = scale.nodata;
          }
        }

        // Draw tile
        let tile = drawTile(draw, x, y, tileShape, tileSize, currentTileColor, tileBorder);

        // Add title element as Tooltips
        if (tooltip && tile) {
          let tip = startDate.format(tooltip.format);
          if (tooltip.data) {
            tip = dayData ? "".concat(value !== null ? "".concat(Intl.NumberFormat(i18n.locale || "en", {
              maximumSignificantDigits: 4
            }).format(value)).concat(legend ? legend.suffix : '') : 'NaN', " on ").concat(tip) : tip;
          }
          tile.add(draw.element('title').words(tip));
        }

        // Set up for future days
        if (startDate.isToday() && tileFuture) {
          tileColor = (0,chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"])(tileColor).brighten(0.5);
        }

        // Add classes for Darkmode
        if (currentTileColor == scale.nodata) tile.addClass('no-data');
        if (startDate.isAfter(dayjs__WEBPACK_IMPORTED_MODULE_1___default()())) tile.addClass('future');
        if (end_y < y) end_y = y;
        if (month_days == day_count && w == 6) {
          x += tileSize + tilePadding;
        }

        // Add tiles to group
        group.add(tile);

        // Add next day
        startDate = startDate.add(1, 'day');
        day_count++;
      }
    }

    // Add the label
    if (calendarMonthLabels && calendarMonthLabels.format !== "") {
      let text = draw.plain(startDate.subtract(1, 'day').format(calendarMonthLabels.format));
      text.font({
        family: calendarMonthLabels.fontFamily,
        size: calendarMonthLabels.fontSize,
        weight: calendarMonthLabels.fontWeight,
        anchor: calendarMonthLabels.textAlignment,
        fill: calendarMonthLabels.fontColor
      });
      text.addClass('calendar-month');
      if (calendarMonthLabels.textAlignment == 'middle') {
        text.amove(offset_x + (tileSize + x - offset_x) / 2, end_y + tilePadding + tileSize + text.bbox().h);
      } else if (calendarMonthLabels.textAlignment == 'end') {
        text.amove(x + tileSize, end_y + tilePadding + tileSize + text.bbox().h);
      } else {
        text.amove(offset_x, end_y + tilePadding + tileSize + text.bbox().h);
      }
      monthLabelHeight = text.bbox().h;

      // Add month label
      group.add(text);
      groupROW.add(group);
    }

    // calculate offset for next month
    offset_x = x;
    if (monthGap) offset_x += monthPadding + tileSize;
    if (offset_x_max < offset_x) offset_x_max = offset_x;
  }

  // Reverse the order of rows
  if (monthsRowsReverse) {
    let groups = draw.find(".row");

    // Create array of groups with their positions
    let groupsWithPos = [];
    groups.each(group => {
      let bbox = group.bbox();
      groupsWithPos.push({
        'x': bbox.x,
        'y': bbox.y
      });
    });

    // Sort by position in reverse order and move groups to new positions
    groupsWithPos.reverse().forEach((item, index) => {
      groups[index].move(item.x, item.y);
    });
  }

  // calculate offset
  offset_y += tileSize * 7 + tilePadding * 6 + tileSize * 1.5;

  // add offset only if there is a string
  if (calendarMonthLabels && calendarMonthLabels.format !== "") {
    offset_y += monthLabelHeight;
  }

  // Legend
  if (legend) {
    offset_y = drawLegend(draw, offset_x_max, offset_y, colors, minData, maxData, tileShape, tileBorder, tileSize, tilePadding, monthGap, monthPadding, legend, transform, tooltip, i18n);
  }
  return {
    x: max_x + tileSize,
    y: offset_y
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (calendar);
const settings = () => {
  return {
    "id": "calendar",
    "headerTitle": "Calendar",
    "show": true,
    "disabled": true,
    "options": [{
      "type": "range",
      "name": "tileSize",
      "value": 16,
      "label": "Tile Size",
      "step": 0.5,
      "min": 2,
      "max": 30
    }, {
      "type": "select",
      "name": "tileShape",
      "value": 'rectangle',
      options: ["rectangle", "rectangle (rounded)", "circle"],
      "label": "Tile Shape"
    }, {
      "type": "color",
      "name": "tileColor",
      "value": "#dddddd",
      "label": "Tile Color"
    }, {
      "type": "check",
      "name": "tileFuture",
      "value": true,
      "label": "Future Days (lighten color)"
    }, {
      "type": "separator"
    }, {
      "type": "range",
      "name": "tilePadding",
      "value": 4.5,
      "label": "Tile Padding",
      "step": 0.5,
      "min": 0,
      "max": 10
    }, {
      "type": "range",
      "name": "monthPadding",
      "value": 10,
      "label": "Month Padding",
      "step": 1,
      "min": 0,
      "max": 50
    }, {
      "type": "check",
      "name": "monthGap",
      "value": true,
      "label": "Gap between Months"
    }, {
      "type": "separator"
    }, {
      "type": "select",
      "name": "weekStart",
      "value": 0,
      options: [{
        value: 1,
        name: 'Monday'
      }, {
        value: 2,
        name: 'Tuesday'
      }, {
        value: 3,
        name: 'Wednesday'
      }, {
        value: 4,
        name: 'Thursday'
      }, {
        value: 5,
        name: 'Friday'
      }, {
        value: 6,
        name: 'Saturday'
      }, {
        value: 0,
        name: 'Sunday'
      }],
      "label": "Week Start"
    }, {
      "type": "separator"
    }, {
      "type": "range",
      "name": "monthsWrapAfter",
      "value": 12,
      "label": "Months Wrap",
      icon: (0,_constants_help__WEBPACK_IMPORTED_MODULE_9__["default"])("MONTHWRAP", {
        display: "info-icon"
      }),
      "step": 1,
      "min": 1,
      "max": 24
    }, {
      "type": "check",
      "name": "monthsRowsReverse",
      "value": false,
      "label": "Reverse Row Order"
    }]
  };
};

// Create bins
function createBins(min, max, numBins) {
  const step = (max - min) / numBins;
  const bins = [];
  for (let i = 0; i < numBins; i++) {
    bins.push([i * step + min, i == numBins - 1 ? max : (i + 1) * step + min]);
  }
  return bins;
}

// Lookup bin index for value
function getBinIndex(bins, value) {
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];
    if (value >= bin[0] && value <= bin[1]) {
      return i;
    }
  }
  return -1; // no bin found
}

// Draw a tile representing a day
const drawTile = (draw, x, y, shape, size, color, border) => {
  let tile = null;
  if (shape == 'circle') tile = draw.circle(size).fill({
    color,
    opacity: 1
  }).move(x, y).stroke({
    color: border,
    opacity: 0.75,
    width: 1
  });else tile = draw.rect(size, size).fill({
    color,
    opacity: 1
  }).move(x, y).stroke({
    color: border,
    opacity: 0.75,
    width: 1
  });
  if (shape == 'rectangle (rounded)') tile.radius(size * .2);
  return tile;
};

// Draw the legend
const drawLegend = (draw, x, y, colors, min, max, tileShape, tileBorder, tileSize, tilePadding, gap, gapPadding, legend, transform, tooltip, i18n) => {
  // Legend
  let legendMin = Number.isFinite(min) ? min : 'Min';
  let legendMax = Number.isFinite(max) ? max : 'Max';
  let x_init = x;
  let labelOffset = 0;
  let group = draw.group();
  if (legend.position == 'left') x_init = 20;
  if (legend.position == 'right') {
    x_init = x - colors.length * (tilePadding + tileSize);
    if (gap) x_init -= gapPadding;
  }
  if (legend.position == 'center') x_init = x / 2 - colors.length * (tilePadding + tileSize) / 2;
  if (transform) {
    legendMin = (0,_components_transform__WEBPACK_IMPORTED_MODULE_7__.transformValue)(min, transform.fn) || 'Min';
    legendMax = (0,_components_transform__WEBPACK_IMPORTED_MODULE_7__.transformValue)(max, transform.fn) || 'Max';
  }
  const NumberFormat = new Intl.NumberFormat(i18n.locale || "en", {
    maximumSignificantDigits: 4
  });
  if (legendMin != 'Min') legendMin = NumberFormat.format(legendMin);
  if (legendMax != 'Max') legendMax = NumberFormat.format(legendMax);
  if (legend.suffix != '') {
    if (legendMin != 'Min') legendMin += legend.suffix;
    if (legendMax != 'Max') legendMax += legend.suffix;
  }

  // Legend padding
  var y_pad = 0;
  if (legend.position != 'center') {
    var text_tmp = draw.plain(legend.position == 'right' ? legendMax : legendMin);
    text_tmp.font({
      family: legend.fontFamily,
      size: legend.fontSize,
      weight: legend.fontWeight
    });
    y_pad = text_tmp.bbox().w / 2;
    text_tmp.remove();
    if (legend.position == 'right') y_pad = (y_pad + 10) * -1;
  }
  for (let s = 0; s < colors.length; s++) {
    // Add tile
    let tile = drawTile(draw, x_init + y_pad + (tilePadding + tileSize) * s, y, tileShape, tileSize, colors[s], tileBorder);

    // Add labels
    if ((s == 0 || s == colors.length - 1) && legend.labels) {
      var text = draw.plain(s == 0 ? legendMin : legendMax);
      text.font({
        family: legend.fontFamily,
        size: legend.fontSize,
        weight: legend.fontWeight,
        anchor: 'middle',
        fill: legend.fontColor
      });
      text.addClass('legend');
      labelOffset = text.bbox().h;
      text.amove(tile.x() + tileSize / 2, y + tileSize + labelOffset);
      group.add(text);
    }
    if (tooltip && tile && isFinite(min) && isFinite(max)) {
      let bins = createBins((0,_components_transform__WEBPACK_IMPORTED_MODULE_7__.transformValue)(min, transform.fn), (0,_components_transform__WEBPACK_IMPORTED_MODULE_7__.transformValue)(max, transform.fn), colors.length);
      let tip = "".concat(NumberFormat.format(bins[s][0])).concat(legend.suffix, " to ").concat(NumberFormat.format(bins[s][1])).concat(legend.suffix);
      tile.add(draw.element('title').words(tip));
    }
    group.add(tile);
  }
  return y += tileSize + labelOffset;
};

/***/ }),

/***/ "./src/components/darkmode.js":
/*!************************************!*\
  !*** ./src/components/darkmode.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/**
 * Darkmode
 * Automatically change text fill for darkmode
 */

const darkmode = function (draw) {
  let {} = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  draw.style("rect:hover", {
    strokeWidth: 2
  });
  return;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (darkmode);
const settings = () => {
  return {
    "id": "darkmode",
    "headerTitle": "Darkmode",
    "show": true,
    "disabled": false,
    "options": []
  };
};

/***/ }),

/***/ "./src/components/data.js":
/*!********************************!*\
  !*** ./src/components/data.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/**
 * Data Element
 */

const dataInput = function (draw) {
  let {
    dateColumn = '',
    valueColumn = ''
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    dateColumn,
    valueColumn
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (dataInput);
const settings = () => {
  return {
    "id": "data-input",
    "headerTitle": "Imported Data",
    "show": false,
    "disabled": false,
    "options": [{
      "type": "select",
      "name": "dateColumn",
      "value": '',
      options: [],
      "label": "Dates"
    }, {
      "type": "select",
      "name": "valueColumn",
      "value": '',
      options: [],
      "label": "Values"
    }]
  };
};

/***/ }),

/***/ "./src/components/hover.js":
/*!*********************************!*\
  !*** ./src/components/hover.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/**
 * Hover Element
 * Add a hover effect to each tile
 */

const hover = function (draw) {
  let {} = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  draw.style("rect:hover", {
    strokeWidth: 2
  });
  return;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hover);
const settings = () => {
  return {
    "id": "hover",
    "headerTitle": "Hover Effect",
    "show": false,
    "disabled": false,
    "options": []
  };
};

/***/ }),

/***/ "./src/components/i18n.js":
/*!********************************!*\
  !*** ./src/components/i18n.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   monthsForLocale: () => (/* binding */ monthsForLocale),
/* harmony export */   settings: () => (/* binding */ settings),
/* harmony export */   weekdaysForLocale: () => (/* binding */ weekdaysForLocale)
/* harmony export */ });
/* harmony import */ var _constants_help__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/help */ "./src/constants/help.js");
/* harmony import */ var _constants_locales__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/locales */ "./src/constants/locales.js");
/**
 * Label Element
 */



const monthsForLocale = function () {
  let localeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'en';
  let monthFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'long';
  const format = new Intl.DateTimeFormat(localeName, {
    month: monthFormat
  }).format;
  return [...Array(12).keys()].map(m => format(new Date(Date.UTC(2021, m % 12))));
};
const weekdaysForLocale = function () {
  let localeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'en';
  let weekday = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'long';
  const {
    format
  } = new Intl.DateTimeFormat(localeName, {
    weekday
  });
  return [...Array(7).keys()].map(day => format(new Date(Date.UTC(2021, 5, day - 1))));
};
const i18n = function () {
  let {
    locale = 'en-US'
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    locale
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (i18n);
const settings = () => {
  const languageNamesInEnglish = new Intl.DisplayNames(navigator.languages || ['en'], {
    type: 'language'
  });
  const languages = _constants_locales__WEBPACK_IMPORTED_MODULE_1__["default"].filter(el => languageNamesInEnglish.of(el) != el).map(el => {
    return {
      "value": el,
      "name": languageNamesInEnglish.of(el)
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  const browserLanguage = navigator.language.split("-")[0] || "en";
  return {
    "id": "i18n",
    "headerTitle": "Language",
    "show": false,
    "disabled": false,
    "options": [{
      "type": "select",
      "name": "locale",
      "value": browserLanguage,
      "options": languages,
      "label": "Localization"
    }, ...(0,_constants_help__WEBPACK_IMPORTED_MODULE_0__["default"])("LOCALES", {
      display: "block"
    })]
  };
};

/***/ }),

/***/ "./src/components/labels.js":
/*!**********************************!*\
  !*** ./src/components/labels.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/**
 * Label Element
 */

const labels = function (draw) {
  let {
    name = null,
    mode = 'rgb',
    correctLightness = false,
    colors = 5,
    nodata = '#eeeeee'
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    name,
    mode,
    correctLightness,
    colors,
    nodata
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (labels);
const settings = () => {
  return {
    "id": "labels",
    "headerTitle": "labels",
    "show": true,
    "disabled": false,
    "options": [{
      "type": "select",
      "name": "mode",
      "value": "rgb",
      "options": ["rgb", "lrgb", "lab", "hsl", "lch"],
      "label": "Color Mode"
    }, {
      "type": "check",
      "name": "correctLightness",
      "value": false,
      "label": "Correct Lightness"
    }, {
      "type": "range",
      "name": "colors",
      "value": 5,
      "label": "Colors",
      "step": 1,
      "min": 2,
      "max": 10
    }, {
      "type": "color",
      "name": "nodata",
      "value": "#eeeeee",
      "label": "No Data Color"
    }]
  };
};

/***/ }),

/***/ "./src/components/legend.js":
/*!**********************************!*\
  !*** ./src/components/legend.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var _constants_fonts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/fonts */ "./src/constants/fonts.js");
/**
 * Legend Element
 */


const legend = function (draw) {
  let {
    position = 'right',
    labels = true,
    suffix = '',
    fontFamily = _constants_fonts__WEBPACK_IMPORTED_MODULE_0__.fontfaces[0].value,
    fontSize = 18,
    fontWeight = "normal",
    fontColor = "#212529",
    textAlignment = "middle"
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    position,
    labels,
    fontFamily,
    fontSize,
    fontWeight,
    fontColor,
    textAlignment,
    suffix
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (legend);
const settings = () => {
  return {
    "id": "legend",
    "headerTitle": "Legend",
    "show": true,
    "disabled": false,
    "options": [{
      "type": "select",
      "name": "position",
      "value": "right",
      "options": ["left", "center", "right"],
      "label": "Position",
      className: 'col-6'
    }, {
      "type": "text",
      "name": "suffix",
      "value": "",
      "label": "Suffix",
      className: 'col-6'
    }, {
      "type": "check",
      "name": "labels",
      "value": true,
      "label": "Show Labels"
    }, ...(0,_constants_fonts__WEBPACK_IMPORTED_MODULE_0__["default"])({
      size: 18
    })]
  };
};

/***/ }),

/***/ "./src/components/scale.js":
/*!*********************************!*\
  !*** ./src/components/scale.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! chroma-js */ "./node_modules/chroma-js/index.js");
/**
 * Scale Element
 */


const scale = function (draw) {
  let {
    name = null,
    reverse = false,
    mode = 'rgb',
    correctLightness = false,
    gamma = 1,
    colors = 5,
    nodata = '#eeeeee'
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let colorScale = chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].scale(name);
  if (correctLightness) {
    colorScale.correctLightness();
  }
  if (nodata) {
    colorScale.nodata(nodata);
  }
  colorScale.gamma(gamma);
  colorScale.mode(mode);
  let hexcolors = colorScale.colors(colors);
  if (reverse) hexcolors.reverse();
  return {
    hexcolors,
    nodata
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (scale);
const settings = () => {
  let scales = Object.keys(chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].brewer).filter(s => s.charAt(0) == s.charAt(0).toUpperCase()).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
  let scalesColors = scales.map(e => {
    return {
      "value": chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"].scale(e).colors(5),
      "name": e
    };
  });
  return {
    "id": "scale",
    "headerTitle": "Scale",
    "show": true,
    "disabled": false,
    "options": [{
      "type": "scales",
      "name": "name",
      "value": scales[scales.length - 1],
      "options": scalesColors,
      "label": "Color Scale"
    }, {
      "type": "check",
      "name": "reverse",
      "value": false,
      "label": "Reverse Scale"
    }, {
      "type": "range",
      "name": "colors",
      "value": 5,
      "label": "Color Steps",
      "step": 1,
      "min": 3,
      "max": 12
    }, {
      "type": "select",
      "name": "mode",
      "value": "rgb",
      "options": ["rgb", "lrgb", "lab", "hsl", "lch"],
      "label": "Color Mode"
    }, {
      "type": "check",
      "name": "correctLightness",
      "value": false,
      "label": "Correct Lightness"
    }, {
      "type": "range",
      "name": "gamma",
      "value": 1,
      "label": "Gamma",
      "step": 0.1,
      "min": 0.1,
      "max": 2
    }, {
      "type": "color",
      "name": "nodata",
      "value": "#eeeeee",
      "label": "No Data Color"
    }]
  };
};

/***/ }),

/***/ "./src/components/subtitle.js":
/*!************************************!*\
  !*** ./src/components/subtitle.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var _constants_fonts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/fonts */ "./src/constants/fonts.js");
/**
 * Sub-Title Element
 */


const subtitle = function (draw) {
  let {
    titleText = 'Sub Title',
    fontFamily = _constants_fonts__WEBPACK_IMPORTED_MODULE_0__.fontfaces[0].value,
    fontSize = 24,
    fontWeight = 'normal',
    fontColor = '#212529',
    textAlignment = "start",
    x = 0,
    y = 0
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  titleText = titleText.replace(' ', ' ');
  var text = draw.text(titleText);
  if (textAlignment == 'middle') x = draw.width() / 2;
  if (textAlignment == 'end') x = draw.width() - x;
  text.font({
    family: fontFamily,
    size: fontSize,
    weight: fontWeight,
    anchor: textAlignment,
    fill: fontColor,
    opacity: .75
  });
  text.move(x, y);
  text.addClass('sub-title');
  return text;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (subtitle);
const settings = () => {
  return {
    "id": "subtitle",
    "headerTitle": "Subtitle",
    "show": true,
    "disabled": false,
    "options": [{
      "type": "text",
      "name": "titleText",
      "value": "Sub Title",
      "label": "Text"
    }, ...(0,_constants_fonts__WEBPACK_IMPORTED_MODULE_0__["default"])({
      size: 24,
      fontColor: "#65696c"
    })]
  };
};

/***/ }),

/***/ "./src/components/title.js":
/*!*********************************!*\
  !*** ./src/components/title.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var _constants_fonts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/fonts */ "./src/constants/fonts.js");
/**
 * Main Title Element
 */


const title = function (draw) {
  let {
    titleText = 'Main Title',
    fontFamily = _constants_fonts__WEBPACK_IMPORTED_MODULE_0__.fontfaces[0].value,
    fontSize = 36,
    fontWeight = 'normal',
    fontColor = '#212529',
    textAlignment = "start",
    x = 0,
    y = 0
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  titleText = titleText.replace(' ', ' ');
  var text = draw.plain(titleText);
  if (textAlignment == 'middle') x = draw.width() / 2;
  if (textAlignment == 'end') x = draw.width() - x;
  text.font({
    family: fontFamily,
    size: fontSize,
    weight: fontWeight,
    anchor: textAlignment,
    fill: fontColor
  });
  text.move(x, y);
  text.addClass('title');
  return text;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (title);
const settings = () => {
  return {
    "id": "title",
    "headerTitle": "Title",
    "show": true,
    "disabled": false,
    "options": [{
      "type": "text",
      "name": "titleText",
      "value": "Main Title",
      "label": "Text"
    }, ...(0,_constants_fonts__WEBPACK_IMPORTED_MODULE_0__["default"])({
      size: 36
    })]
  };
};

/***/ }),

/***/ "./src/components/tooltip.js":
/*!***********************************!*\
  !*** ./src/components/tooltip.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings)
/* harmony export */ });
/* harmony import */ var _constants_help__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/help */ "./src/constants/help.js");
/**
 * Tooltip Element
 */


const hover = function (draw) {
  let {
    format = 'YYYY-MM-DD',
    data = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    format,
    data
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hover);
const settings = () => {
  return {
    "id": "tooltip",
    "headerTitle": "Tooltips",
    "show": false,
    "disabled": false,
    "options": [{
      "type": "text",
      "name": "format",
      "value": "YYYY-MM-DD",
      "label": "Date Format",
      "icon": (0,_constants_help__WEBPACK_IMPORTED_MODULE_0__["default"])("DATEFORMAT", {
        display: "info-icon"
      })
    }, {
      "type": "check",
      "name": "data",
      "value": true,
      "label": "Include Datapoint"
    }]
  };
};

/***/ }),

/***/ "./src/components/transform.js":
/*!*************************************!*\
  !*** ./src/components/transform.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   settings: () => (/* binding */ settings),
/* harmony export */   transformValue: () => (/* binding */ transformValue)
/* harmony export */ });
/**
 * Transform Element
 */

const transform = function (draw) {
  let {
    fn = 'log10'
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    fn
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (transform);
const settings = () => {
  return {
    "id": "transform",
    "headerTitle": "Transform",
    "show": false,
    "disabled": false,
    "options": [{
      "type": "select",
      "name": "fn",
      "value": "log₁₀",
      "options": [{
        value: "log10",
        name: "log₁₀(x) - base 10 logarithm"
      }, {
        value: "log2",
        name: "log₂(x) - base 2 logarithm"
      }, {
        value: "log",
        name: "ln(x) - natural logarithm (base ℇ)"
      }, {
        value: "sqrt",
        name: "√ₓ - Square Root"
      }, {
        value: "x2",
        name: "x² - x squared"
      }, {
        value: "1/x",
        name: "¹∕ₓ - 1 over x"
      }],
      "label": "Transform Data"
    }]
  };
};
const transformValue = function (value) {
  let fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  switch (fn) {
    case 'log10':
      value = Math.log10(value) || null;
      break;
    case 'log2':
      value = Math.log2(value) || null;
      break;
    case 'log':
      value = Math.log(value) || null;
      break;
    case 'sqrt':
      value = Math.sqrt(value) || null;
      break;
    case 'x2':
      value *= value || null;
      break;
    case '1/x':
      value = 1 / value || null;
      break;
  }
  return value;
};

/***/ }),

/***/ "./src/constants/fonts.js":
/*!********************************!*\
  !*** ./src/constants/fonts.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   fontfaces: () => (/* binding */ fontfaces)
/* harmony export */ });
const fontfaces = [{
  name: "System",
  value: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Liberation Sans, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji"
}, {
  name: "Arial",
  value: "Arial"
}, {
  name: "Times New Roman",
  value: "Times New Roman"
}, {
  name: "Calibri",
  value: "Calibri"
}, {
  name: "Courier New",
  value: "Courier New"
}, {
  name: "Verdana",
  value: "Verdana"
}];
const fontmenu = function () {
  let {
    size = 18,
    fontFamily = fontfaces[0].value,
    fontWeight = 'normal',
    textAlignment = "left",
    fontColor = "#212529"
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return [{
    "type": "select",
    "name": "fontFamily",
    "value": fontFamily,
    "options": fontfaces,
    "label": "Font",
    className: "col-6"
  }, {
    "type": "select",
    "name": "fontSize",
    "value": size,
    "options": [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96],
    "label": "Size",
    className: "col-6"
  }, {
    "type": "select",
    "name": "fontWeight",
    "value": fontWeight,
    "options": [{
      name: "light",
      value: "lighter"
    }, "normal", "bold"],
    "label": "Style",
    className: "col-6"
  }, {
    "type": "select",
    "name": "textAlignment",
    "value": textAlignment,
    "options": [{
      name: "left",
      value: "start"
    }, {
      name: "center",
      value: "middle"
    }, {
      name: "right",
      value: "end"
    }],
    "label": "Align",
    className: "col-6"
  }, {
    "type": "color",
    "name": "fontColor",
    "value": fontColor,
    "label": "Color"
  }];
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fontmenu);

/***/ }),

/***/ "./src/constants/help.js":
/*!*******************************!*\
  !*** ./src/constants/help.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   helpentries: () => (/* binding */ helpentries)
/* harmony export */ });
const helpentries = {
  "DATEFORMAT": "Available formats:\n\nYY - Two-digit year\nYYYY - Four-digit year\n\nM - 1-12\nMM - 01-12\nMMM - Jan-Dec\nMMMM - January-December\n\nD - Day 0-31\nDD - Day 01-31",
  "LOCALES": "Set the language for number format, month and weekday labels (default: English)",
  "MONTHWRAP": "Select the number of months after which the following months wrap into the next row"
};
const help = function () {
  let entry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  let {
    display = "inline"
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Add as a block element
  if (["block"].indexOf(display) > -1 && entry) return [{
    "type": "help",
    "display": display,
    "content": helpentries[entry]
  }];

  // Inline float right
  if (display == "info-icon" && entry) return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"currentColor\" style=\"float: right; margin-top:.5rem;\" viewBox=\"0 0 16 16\">\n              <title>".concat(helpentries[entry], "</title>\n              <path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16\"/>\n              <path d=\"m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0\"/>\n            </svg>");
  // If no entry was found
  return [];
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (help);

/***/ }),

/***/ "./src/constants/locales.js":
/*!**********************************!*\
  !*** ./src/constants/locales.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LOCALES_ALL: () => (/* binding */ LOCALES_ALL),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const LOCALES_ALL = ["af-NA", "af-ZA", "af", "ak-GH", "ak", "sq-AL", "sq", "am-ET", "am", "ar-DZ", "ar-BH", "ar-EG", "ar-IQ", "ar-JO", "ar-KW", "ar-LB", "ar-LY", "ar-MA", "ar-OM", "ar-QA", "ar-SA", "ar-SD", "ar-SY", "ar-TN", "ar-AE", "ar-YE", "ar", "hy-AM", "hy", "as-IN", "as", "asa-TZ", "asa", "az-Cyrl", "az-Cyrl-AZ", "az-Latn", "az-Latn-AZ", "az", "bm-ML", "bm", "eu-ES", "eu", "be-BY", "be", "bem-ZM", "bem", "bez-TZ", "bez", "bn-BD", "bn-IN", "bn", "bs-BA", "bs", "bg-BG", "bg", "my-MM", "my", "yue-Hant-HK", "ca-ES", "ca", "tzm-Latn", "tzm-Latn-MA", "tzm", "chr-US", "chr", "cgg-UG", "cgg", "zh-Hans", "zh-Hans-CN", "zh-Hans-HK", "zh-Hans-MO", "zh-Hans-SG", "zh-Hant", "zh-Hant-HK", "zh-Hant-MO", "zh-Hant-TW", "zh", "kw-GB", "kw", "hr-HR", "hr", "cs-CZ", "cs", "da-DK", "da", "nl-BE", "nl-NL", "nl", "ebu-KE", "ebu", "en-AS", "en-AU", "en-BE", "en-BZ", "en-BW", "en-CA", "en-GU", "en-HK", "en-IN", "en-IE", "en-IL", "en-JM", "en-MT", "en-MH", "en-MU", "en-NA", "en-NZ", "en-MP", "en-PK", "en-PH", "en-SG", "en-ZA", "en-TT", "en-UM", "en-VI", "en-GB", "en-US", "en-ZW", "en", "eo", "et-EE", "et", "ee-GH", "ee-TG", "ee", "fo-FO", "fo", "fil-PH", "fil", "fi-FI", "fi", "fr-BE", "fr-BJ", "fr-BF", "fr-BI", "fr-CM", "fr-CA", "fr-CF", "fr-TD", "fr-KM", "fr-CG", "fr-CD", "fr-CI", "fr-DJ", "fr-GQ", "fr-FR", "fr-GA", "fr-GP", "fr-GN", "fr-LU", "fr-MG", "fr-ML", "fr-MQ", "fr-MC", "fr-NE", "fr-RW", "fr-RE", "fr-BL", "fr-MF", "fr-SN", "fr-CH", "fr-TG", "fr", "ff-SN", "ff", "gl-ES", "gl", "lg-UG", "lg", "ka-GE", "ka", "de-AT", "de-BE", "de-DE", "de-LI", "de-LU", "de-CH", "de", "el-CY", "el-GR", "el", "gu-IN", "gu", "guz-KE", "guz", "ha-Latn", "ha-Latn-GH", "ha-Latn-NE", "ha-Latn-NG", "ha", "haw-US", "haw", "he-IL", "he", "hi-IN", "hi", "hu-HU", "hu", "is-IS", "is", "ig-NG", "ig", "id-ID", "id", "ga-IE", "ga", "it-IT", "it-CH", "it", "ja-JP", "ja", "kea-CV", "kea", "kab-DZ", "kab", "kl-GL", "kl", "kln-KE", "kln", "kam-KE", "kam", "kn-IN", "kn", "kk-Cyrl", "kk-Cyrl-KZ", "kk", "km-KH", "km", "ki-KE", "ki", "rw-RW", "rw", "kok-IN", "kok", "ko-KR", "ko", "khq-ML", "khq", "ses-ML", "ses", "lag-TZ", "lag", "lv-LV", "lv", "lt-LT", "lt", "luo-KE", "luo", "luy-KE", "luy", "mk-MK", "mk", "jmc-TZ", "jmc", "kde-TZ", "kde", "mg-MG", "mg", "ms-BN", "ms-MY", "ms", "ml-IN", "ml", "mt-MT", "mt", "gv-GB", "gv", "mr-IN", "mr", "mas-KE", "mas-TZ", "mas", "mer-KE", "mer", "mfe-MU", "mfe", "naq-NA", "naq", "ne-IN", "ne-NP", "ne", "nd-ZW", "nd", "nb-NO", "nb", "nn-NO", "nn", "nyn-UG", "nyn", "or-IN", "or", "om-ET", "om-KE", "om", "ps-AF", "ps", "fa-AF", "fa-IR", "fa", "pl-PL", "pl", "pt-BR", "pt-GW", "pt-MZ", "pt-PT", "pt", "pa-Arab", "pa-Arab-PK", "pa-Guru", "pa-Guru-IN", "pa", "ro-MD", "ro-RO", "ro", "rm-CH", "rm", "rof-TZ", "rof", "ru-MD", "ru-RU", "ru-UA", "ru", "rwk-TZ", "rwk", "saq-KE", "saq", "sg-CF", "sg", "seh-MZ", "seh", "sr-Cyrl", "sr-Cyrl-BA", "sr-Cyrl-ME", "sr-Cyrl-RS", "sr-Latn", "sr-Latn-BA", "sr-Latn-ME", "sr-Latn-RS", "sr", "sn-ZW", "sn", "ii-CN", "ii", "si-LK", "si", "sk-SK", "sk", "sl-SI", "sl", "xog-UG", "xog", "so-DJ", "so-ET", "so-KE", "so-SO", "so", "es-AR", "es-BO", "es-CL", "es-CO", "es-CR", "es-DO", "es-EC", "es-SV", "es-GQ", "es-GT", "es-HN", "es-419", "es-MX", "es-NI", "es-PA", "es-PY", "es-PE", "es-PR", "es-ES", "es-US", "es-UY", "es-VE", "es", "sw-KE", "sw-TZ", "sw", "sv-FI", "sv-SE", "sv", "gsw-CH", "gsw", "shi-Latn", "shi-Latn-MA", "shi-Tfng", "shi-Tfng-MA", "shi", "dav-KE", "dav", "ta-IN", "ta-LK", "ta", "te-IN", "te", "teo-KE", "teo-UG", "teo", "th-TH", "th", "bo-CN", "bo-IN", "bo", "ti-ER", "ti-ET", "ti", "to-TO", "to", "tr-TR", "tr", "uk-UA", "uk", "ur-IN", "ur-PK", "ur", "uz-Arab", "uz-Arab-AF", "uz-Cyrl", "uz-Cyrl-UZ", "uz-Latn", "uz-Latn-UZ", "uz", "vi-VN", "vi", "vun-TZ", "vun", "cy-GB", "cy", "yo-NG", "yo", "zu-ZA", "zu"];
const LOCALES = Intl.DateTimeFormat.supportedLocalesOf(LOCALES_ALL.filter(el => {
  if (!el.match(/\D-/)) return el;
}), {
  localeMatcher: 'lookup'
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LOCALES);

/***/ }),

/***/ "./src/constants/presets.js":
/*!**********************************!*\
  !*** ./src/constants/presets.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _presets_no_labels_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./presets/no-labels.json */ "./src/constants/presets/no-labels.json");
/**
 * Calendar Heatmap Presets
 */


const presets = [{
  title: 'No Labels',
  settings: _presets_no_labels_json__WEBPACK_IMPORTED_MODULE_0__
}];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (presets);

/***/ }),

/***/ "./src/constants/presets/no-labels.json":
/*!**********************************************!*\
  !*** ./src/constants/presets/no-labels.json ***!
  \**********************************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"title":{"show":false},"subtitle":{"show":false},"calendar-month":{"show":false},"calendar-week":{"show":false},"hover":{"show":false},"tooltip":{"show":false},"legend":{"labels":false}}');

/***/ }),

/***/ "./src/constants/settings.js":
/*!***********************************!*\
  !*** ./src/constants/settings.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   layers: () => (/* binding */ layers),
/* harmony export */   menu: () => (/* binding */ menu)
/* harmony export */ });
/* harmony import */ var _components_title__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/title */ "./src/components/title.js");
/* harmony import */ var _components_subtitle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/subtitle */ "./src/components/subtitle.js");
/* harmony import */ var _components_scale__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/scale */ "./src/components/scale.js");
/* harmony import */ var _components_legend__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/legend */ "./src/components/legend.js");
/* harmony import */ var _components_labels__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/labels */ "./src/components/labels.js");
/* harmony import */ var _components_hover__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/hover */ "./src/components/hover.js");
/* harmony import */ var _components_transform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/transform */ "./src/components/transform.js");
/* harmony import */ var _components_tooltip__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/tooltip */ "./src/components/tooltip.js");
/* harmony import */ var _components_darkmode__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../components/darkmode */ "./src/components/darkmode.js");
/* harmony import */ var _components_calendar__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../components/calendar */ "./src/components/calendar.js");
/* harmony import */ var _components_calendar_month__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../components/calendar-month */ "./src/components/calendar-month.js");
/* harmony import */ var _components_calendar_week__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../components/calendar-week */ "./src/components/calendar-week.js");
/* harmony import */ var _components_data__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../components/data */ "./src/components/data.js");
/* harmony import */ var _components_i18n__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../components/i18n */ "./src/components/i18n.js");














const settings = [_components_title__WEBPACK_IMPORTED_MODULE_0__.settings(), _components_subtitle__WEBPACK_IMPORTED_MODULE_1__.settings(), _components_scale__WEBPACK_IMPORTED_MODULE_2__.settings(), _components_legend__WEBPACK_IMPORTED_MODULE_3__.settings(), _components_labels__WEBPACK_IMPORTED_MODULE_4__.settings(), _components_hover__WEBPACK_IMPORTED_MODULE_5__.settings(), _components_transform__WEBPACK_IMPORTED_MODULE_6__.settings(), _components_tooltip__WEBPACK_IMPORTED_MODULE_7__.settings(), _components_darkmode__WEBPACK_IMPORTED_MODULE_8__.settings(), _components_calendar__WEBPACK_IMPORTED_MODULE_9__.settings(), _components_calendar_month__WEBPACK_IMPORTED_MODULE_10__.settings(), _components_calendar_week__WEBPACK_IMPORTED_MODULE_11__.settings(), _components_data__WEBPACK_IMPORTED_MODULE_12__.settings(), _components_i18n__WEBPACK_IMPORTED_MODULE_13__.settings()];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (settings);
const layers = ["title", "subtitle", "scale", "legend", "i18n", "hover", "tooltip", "data-input", "data", "transform", "calendar-month", "calendar-week", "calendar"];
const menu = {
  "Layout": ["calendar", "title", "subtitle", "calendar-month", "calendar-week", "legend", "i18n"],
  "Data": ["data-input", "scale", "transform"],
  "Interactivity": ["hover", "tooltip", "darkmode"]
};

/***/ }),

/***/ "./src/helpers/generateDarkColor.js":
/*!******************************************!*\
  !*** ./src/helpers/generateDarkColor.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! chroma-js */ "./node_modules/chroma-js/index.js");

const generateDarkColor = function () {
  let lightColor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#000000';
  const c = (0,chroma_js__WEBPACK_IMPORTED_MODULE_0__["default"])(lightColor);
  const lum = c.luminance();
  if (lum < 0.3) return c.brighten(2).hex();
  if (lum < 0.5) return c.brighten(1).hex();
  return c.saturate(0.5).hex();
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (generateDarkColor);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CalendarHeatmap)
/* harmony export */ });
/* harmony import */ var lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/cloneDeep */ "./node_modules/lodash/cloneDeep.js");
/* harmony import */ var lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_isEqual__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/isEqual */ "./node_modules/lodash/isEqual.js");
/* harmony import */ var lodash_isEqual__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_isEqual__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash/isPlainObject */ "./node_modules/lodash/isPlainObject.js");
/* harmony import */ var lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash/merge */ "./node_modules/lodash/merge.js");
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash_merge__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var papaparse__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! papaparse */ "./node_modules/papaparse/papaparse.min.js");
/* harmony import */ var papaparse__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(papaparse__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _constants_settings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants/settings */ "./src/constants/settings.js");
/* harmony import */ var _constants_presets__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./constants/presets */ "./src/constants/presets.js");
/* harmony import */ var _components_title__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/title */ "./src/components/title.js");
/* harmony import */ var _components_subtitle__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/subtitle */ "./src/components/subtitle.js");
/* harmony import */ var _components_scale__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/scale */ "./src/components/scale.js");
/* harmony import */ var _components_legend__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/legend */ "./src/components/legend.js");
/* harmony import */ var _components_transform__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/transform */ "./src/components/transform.js");
/* harmony import */ var _components_tooltip__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/tooltip */ "./src/components/tooltip.js");
/* harmony import */ var _components_darkmode__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/darkmode */ "./src/components/darkmode.js");
/* harmony import */ var _components_hover__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/hover */ "./src/components/hover.js");
/* harmony import */ var _components_calendar__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./components/calendar */ "./src/components/calendar.js");
/* harmony import */ var _components_calendar_month__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/calendar-month */ "./src/components/calendar-month.js");
/* harmony import */ var _components_calendar_week__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/calendar-week */ "./src/components/calendar-week.js");
/* harmony import */ var _components_data__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./components/data */ "./src/components/data.js");
/* harmony import */ var _svgdotjs_svg_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @svgdotjs/svg.js */ "./node_modules/@svgdotjs/svg.js/src/main.js");
/* harmony import */ var _components_i18n__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./components/i18n */ "./src/components/i18n.js");
/* harmony import */ var _helpers_generateDarkColor__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./helpers/generateDarkColor */ "./src/helpers/generateDarkColor.js");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }






















var _menu = /*#__PURE__*/new WeakMap();
var _layers = /*#__PURE__*/new WeakMap();
var _settings = /*#__PURE__*/new WeakMap();
var _initialSettings = /*#__PURE__*/new WeakMap();
var _componentSettings = /*#__PURE__*/new WeakMap();
var _presets = /*#__PURE__*/new WeakMap();
var _data = /*#__PURE__*/new WeakMap();
var _columns = /*#__PURE__*/new WeakMap();
var _draw = /*#__PURE__*/new WeakMap();
var _padding = /*#__PURE__*/new WeakMap();
var _startXY = /*#__PURE__*/new WeakMap();
var _CalendarHeatmap_brand = /*#__PURE__*/new WeakSet();
class CalendarHeatmap {
  constructor(target) {
    let {
      width = 'auto',
      height = 'auto',
      className: _className,
      style: _style,
      autoInit = true
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classPrivateMethodInitSpec(this, _CalendarHeatmap_brand);
    _classPrivateFieldInitSpec(this, _menu, void 0);
    _classPrivateFieldInitSpec(this, _layers, void 0);
    _classPrivateFieldInitSpec(this, _settings, void 0);
    _classPrivateFieldInitSpec(this, _initialSettings, void 0);
    _classPrivateFieldInitSpec(this, _componentSettings, void 0);
    _classPrivateFieldInitSpec(this, _presets, void 0);
    _classPrivateFieldInitSpec(this, _data, void 0);
    _classPrivateFieldInitSpec(this, _columns, void 0);
    _classPrivateFieldInitSpec(this, _draw, void 0);
    _classPrivateFieldInitSpec(this, _padding, void 0);
    _classPrivateFieldInitSpec(this, _startXY, void 0);
    this.target = target || null;
    this.width = width == 'auto' ? 1400 : width;
    this.height = height == 'auto' ? 1400 : height;
    this.className = _className || null;
    this.style = _style || null;
    _classPrivateFieldSet(_startXY, this, {
      x: width,
      y: height
    });
    _classPrivateFieldSet(_padding, this, {
      x: 20,
      y: 20
    });
    _classPrivateFieldSet(_data, this, []);
    _classPrivateFieldSet(_columns, this, []);
    _classPrivateFieldSet(_componentSettings, this, lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_0___default()(_constants_settings__WEBPACK_IMPORTED_MODULE_5__["default"]));
    _classPrivateFieldSet(_initialSettings, this, _assertClassBrand(_CalendarHeatmap_brand, this, _settingsJSON).call(this));
    _classPrivateFieldSet(_settings, this, lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_0___default()(_classPrivateFieldGet(_initialSettings, this)));
    _classPrivateFieldSet(_menu, this, _constants_settings__WEBPACK_IMPORTED_MODULE_5__.menu || {});
    _classPrivateFieldSet(_layers, this, _constants_settings__WEBPACK_IMPORTED_MODULE_5__.layers || []);
    _classPrivateFieldSet(_presets, this, _constants_presets__WEBPACK_IMPORTED_MODULE_6__["default"]);
    _classPrivateFieldSet(_draw, this, null);
    autoInit ? _assertClassBrand(_CalendarHeatmap_brand, this, _buildCalendar).call(this) : null; // Call build immidiately to show an empty 
  }
  build() {
    _assertClassBrand(_CalendarHeatmap_brand, this, _buildCalendar).call(this);
    return _classPrivateFieldGet(_draw, this).svg();
  }
  update() {
    _assertClassBrand(_CalendarHeatmap_brand, this, _buildCalendar).call(this);
  }
  importData(data) {
    let arr = [];
    // try to parse JSON
    if (typeof data === 'object' && Array.isArray(data)) {
      arr = data;
    } else {
      try {
        arr = JSON.parse(data);
        if (!Array.isArray(arr)) arr = [];
      } catch (e) {
        data = papaparse__WEBPACK_IMPORTED_MODULE_4___default().parse(data, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        if (data.errors.length == 0) arr = data.data;else {
          console.log(data.errors);
        }
      }
    }
    this.data = arr;
    if (arr.length > 0) {
      if (this.settings['data-input'] && typeof this.data[0] === 'object' && !Array.isArray(this.data[0])) {
        this.headers = Object.keys(this.data[0]).filter(e => e !== '');
        // generate some presets
        this.settings['data-input'] = {
          dateColumn: this.headers[0],
          valueColumn: this.headers[1]
        };
        this.settings['data-input'].show = true;
      }
    }
    return arr.length > 0;
  }
  reset() {
    _classPrivateFieldSet(_columns, this, []);
    _classPrivateFieldSet(_data, this, []);
    _classPrivateFieldSet(_settings, this, lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_0___default()(_classPrivateFieldGet(_initialSettings, this)));
  }
  resetSettings() {
    _classPrivateFieldSet(_settings, this, lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_0___default()(_classPrivateFieldGet(_initialSettings, this)));
  }
  get settingsSave() {
    const current = this.settings;
    const initial = _classPrivateFieldGet(_initialSettings, this);
    return _assertClassBrand(_CalendarHeatmap_brand, this, _getNestedChanges).call(this, current, initial);
  }
  set settings(obj) {
    _classPrivateFieldSet(_settings, this, lodash_merge__WEBPACK_IMPORTED_MODULE_3___default()(_classPrivateFieldGet(_settings, this), obj)); // {...this.#settings, ...obj};
  }
  get settings() {
    return _classPrivateFieldGet(_settings, this);
  }
  settingsHTML() {
    let elCount = 0;
    let html = '<form id="settingsform">';
    for (let header in _classPrivateFieldGet(_menu, this)) {
      let uid = "ps-" + crypto.randomUUID();
      let accordionid = "ps-" + crypto.randomUUID();
      html += "<div style=\"cursor:pointer;\" class=\"small fw-bold mt-3 mb-2 d-flex justify-content-between align-items-center\" data-bs-toggle=\"collapse\" data-bs-target=\"#".concat(uid, "\" aria-controls=\"Toggle ").concat(header, "\">\n        ").concat(header, "\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-expand me-1\" viewBox=\"0 0 16 16\">\n          <path fill-rule=\"evenodd\" d=\"M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708zm0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708z\"/>\n        </svg>\n      </div>");
      html += "<div class=\"collapse ".concat(!elCount ? "show" : "", "\" id=\"").concat(uid, "\" data-bs-parent=\"#settingsform\">");
      html += "<div class=\"accordion\" id=\"".concat(accordionid, "\">");
      for (let i in _classPrivateFieldGet(_menu, this)[header]) {
        let idx = _classPrivateFieldGet(_componentSettings, this).findIndex(itm => itm.id == _classPrivateFieldGet(_menu, this)[header][i]);
        if (idx == -1) continue;
        if (_classPrivateFieldGet(_componentSettings, this)[idx].show === undefined && _classPrivateFieldGet(_componentSettings, this)[idx].options === undefined) continue;
        html += "<div class=\"accordion-item\">\n          <h2 class=\"accordion-header\" id=\"heading".concat(idx, "\">\n            <button class=\"accordion-button collapsed ps-5\" type=\"button\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse").concat(idx, "\" aria-expanded=\"").concat(elCount === 0 ? 'true' : 'false', "\" aria-controls=\"collapse").concat(idx, "\">\n            ").concat(_classPrivateFieldGet(_componentSettings, this)[idx].headerTitle, "\n            </button>\n            ").concat(_assertClassBrand(_CalendarHeatmap_brand, this, _elementInputSwitch).call(this, [_classPrivateFieldGet(_componentSettings, this)[idx].id, 'show'].join('.'), {
          value: _classPrivateFieldGet(_componentSettings, this)[idx].show,
          label: '',
          disabled: _classPrivateFieldGet(_componentSettings, this)[idx].disabled || false
        }), "\n          </h2>\n          <div id=\"collapse").concat(idx, "\" class=\"accordion-collapse collapse\" aria-labelledby=\"heading").concat(idx, "\" data-bs-parent=\"#").concat(accordionid, "\">\n            <div class=\"accordion-body row\">");
        if (_classPrivateFieldGet(_componentSettings, this)[idx].options !== undefined && _classPrivateFieldGet(_componentSettings, this)[idx].options.length > 0) {
          for (let i in _classPrivateFieldGet(_componentSettings, this)[idx].options) {
            let option = _classPrivateFieldGet(_componentSettings, this)[idx].options[i];
            let name = [_classPrivateFieldGet(_componentSettings, this)[idx].id, option.name].join('.');
            switch (option.type) {
              case 'color':
                html += _assertClassBrand(_CalendarHeatmap_brand, this, _elementInputColor).call(this, name, _objectSpread({}, option));
                break;
              case 'text':
                html += _assertClassBrand(_CalendarHeatmap_brand, this, _elementInputText).call(this, name, _objectSpread({}, option));
                break;
              case 'check':
                html += _assertClassBrand(_CalendarHeatmap_brand, this, _elementInputCheck).call(this, name, _objectSpread({}, option));
                break;
              case 'range':
                html += _assertClassBrand(_CalendarHeatmap_brand, this, _elementInputRange).call(this, name, _objectSpread({}, option));
                break;
              case 'select':
                html += _assertClassBrand(_CalendarHeatmap_brand, this, _elementInputSelect).call(this, name, _objectSpread({}, option));
                break;
              case 'scales':
                html += _assertClassBrand(_CalendarHeatmap_brand, this, _elementInputScales).call(this, name, _objectSpread({}, option));
                break;
              case 'help':
                html += _assertClassBrand(_CalendarHeatmap_brand, this, _elementHelp).call(this, _objectSpread({}, option));
                break;
              case 'separator':
                html += "<div class=\"separator\"><hr></div>";
                break;
            }
          }
        } else {
          html += "<div class=\"form-text\">No settings available</div>";
        }
        html += "</div>\n          </div>\n        </div>";
        elCount++;
      }
      html += "</div>";
      html += "</div>";
    }
    html += '</form>';
    return html;
  }
  applyPreset(id) {
    var _this$presets$id;
    this.settings = ((_this$presets$id = this.presets[id]) === null || _this$presets$id === void 0 ? void 0 : _this$presets$id.settings) || {};
  }
  get presets() {
    return _classPrivateFieldGet(_presets, this);
  }
  set data(arr) {
    _classPrivateFieldSet(_data, this, arr);
  }
  get data() {
    return _classPrivateFieldGet(_data, this);
  }
  set headers(arr) {
    _classPrivateFieldSet(_columns, this, arr);
  }
  get headers() {
    return _classPrivateFieldGet(_columns, this);
  }
  presetsHTML() {
    let html = "<select class=\"form-select form-select-sm\" aria-label=\"Default select example\" id=\"presets-selector\">";
    html += "<option value=\"-1\" disabled selected>Select&hellip;</option>";
    if (Array.isArray(this.presets)) {
      for (let i in this.presets) html += "<option value=\"".concat(i, "\">").concat(this.presets[i].title, "</option>");
    } else if (typeof this.presets == 'object') {
      for (let group in this.presets) {
        html += "<optgroup label=\"".concat(group, "\">");
        for (let i in this.presets[group]) html += "<option value=\"".concat(group, "[").concat(i, "]\">").concat(this.presets[group][i].title, "</option>");
        html += "</optgroup>";
      }
    }
    html += "</select>";
    return html;
  }
  destroy() {
    _classPrivateFieldGet(_draw, this).remove();
  }
}
function _buildCalendar() {
  var _this$settings;
  // Init the SVG
  if (!_classPrivateFieldGet(_draw, this)) {
    // Initial dimensions
    if (this.target && typeof this.target === 'string') {
      _classPrivateFieldSet(_draw, this, (0,_svgdotjs_svg_js__WEBPACK_IMPORTED_MODULE_19__.SVG)().addTo(this.target).size(this.width, this.height));
      // Add class
      if (this.className) _classPrivateFieldGet(_draw, this).addClass('calendar-heatmap');
      // Add css styles
      if (this.style) _classPrivateFieldGet(_draw, this).css(style);
    } else _classPrivateFieldSet(_draw, this, (0,_svgdotjs_svg_js__WEBPACK_IMPORTED_MODULE_19__.SVG)().size(this.width, this.height));

    // Set viewbox
    _classPrivateFieldGet(_draw, this).viewbox(0, 0, this.width, this.height);
  }
  // Clear content before the next redraw
  _classPrivateFieldGet(_draw, this).clear();

  // Set up defs for darkmode
  if ((_this$settings = this.settings) !== null && _this$settings !== void 0 && (_this$settings = _this$settings.darkmode) !== null && _this$settings !== void 0 && _this$settings.show) {
    var defs = _classPrivateFieldGet(_draw, this).defs();
    let style = [];
    for (let id in this.settings) {
      var _this$settings$id, _this$settings$id2, _this$settings$id3;
      if ((_this$settings$id = this.settings[id]) !== null && _this$settings$id !== void 0 && _this$settings$id.fontColor) style.push(" .".concat(id, " { fill: ").concat((0,_helpers_generateDarkColor__WEBPACK_IMPORTED_MODULE_21__["default"])(this.settings[id].fontColor), " !important;}"));
      if ((_this$settings$id2 = this.settings[id]) !== null && _this$settings$id2 !== void 0 && _this$settings$id2.tileFuture) style.push(" .future { fill: ".concat((0,_helpers_generateDarkColor__WEBPACK_IMPORTED_MODULE_21__["default"])((_this$settings$id3 = this.settings[id]) === null || _this$settings$id3 === void 0 ? void 0 : _this$settings$id3.tileColor), " !important;}"));
    }
    let styleContent = '@media (prefers-color-scheme: dark) {\n';
    styleContent += style.join('\n');
    styleContent += '\n}';
    defs.element('style').words(styleContent);
  }

  // Layout collects all elements for the calendar
  var layout = {};
  var xoffset = _classPrivateFieldGet(_padding, this).x;
  var yoffset = _classPrivateFieldGet(_padding, this).y;
  var maxX = 0;

  // Apply options
  for (let i in _classPrivateFieldGet(_layers, this)) {
    let key = _classPrivateFieldGet(_layers, this)[i];
    if (this.settings[key] && this.settings[key].show || key == 'calendar') {
      // Shallow copy to prevent offsets to seep into settings
      let options = _objectSpread({}, this.settings[key]);
      switch (key) {
        case 'title':
          let titleBbox = (0,_components_title__WEBPACK_IMPORTED_MODULE_7__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread(_objectSpread({}, options), {
            x: xoffset,
            y: yoffset
          })).bbox();
          yoffset += titleBbox.height;
          maxX = titleBbox.width > maxX ? titleBbox.width : maxX;
          break;
        case 'subtitle':
          let subtitleBbox = (0,_components_subtitle__WEBPACK_IMPORTED_MODULE_8__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread(_objectSpread({}, options), {
            x: xoffset,
            y: yoffset
          })).bbox();
          yoffset += subtitleBbox.height;
          maxX = subtitleBbox.width > maxX ? subtitleBbox.width : maxX;
          break;
        case 'scale':
          layout.scale = (0,_components_scale__WEBPACK_IMPORTED_MODULE_9__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'legend':
          layout.legend = (0,_components_legend__WEBPACK_IMPORTED_MODULE_10__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'transform':
          layout.transform = (0,_components_transform__WEBPACK_IMPORTED_MODULE_11__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'tooltip':
          layout.tooltip = (0,_components_tooltip__WEBPACK_IMPORTED_MODULE_12__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'hover':
          layout.hover = (0,_components_hover__WEBPACK_IMPORTED_MODULE_14__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'darkmode':
          layout.darkmode = (0,_components_darkmode__WEBPACK_IMPORTED_MODULE_13__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'calendar-month':
          layout.calendarMonthLabels = (0,_components_calendar_month__WEBPACK_IMPORTED_MODULE_16__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'calendar-week':
          layout.calendarWeekLabels = (0,_components_calendar_week__WEBPACK_IMPORTED_MODULE_17__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'data-input':
          layout.dataInput = (0,_components_data__WEBPACK_IMPORTED_MODULE_18__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread({}, options));
          break;
        case 'i18n':
          layout.i18n = (0,_components_i18n__WEBPACK_IMPORTED_MODULE_20__["default"])(_objectSpread({}, options));
          break;
        case 'calendar':
          // Add gap between title and tiles if they are visible
          yoffset += yoffset > _classPrivateFieldGet(_padding, this).y ? 20 : 0;

          // Generate Calendar
          let {
            x,
            y
          } = (0,_components_calendar__WEBPACK_IMPORTED_MODULE_15__["default"])(_classPrivateFieldGet(_draw, this), _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, options), layout), {
            x: xoffset,
            y: yoffset
          }), {}, {
            data: this.data
          }));

          // Change width if Titles are wider than the calendar
          x = x < maxX ? maxX : x;

          // Add end and bottom padding
          x += _classPrivateFieldGet(_padding, this).x;
          y += _classPrivateFieldGet(_padding, this).y;

          // Adjust image size if set to auto
          _classPrivateFieldGet(_draw, this).size(_classPrivateFieldGet(_startXY, this).x == 'auto' ? x : this.width, _classPrivateFieldGet(_startXY, this).y == 'auto' ? y : this.height);

          // Adjust the viewbox to fit generated calendar
          _classPrivateFieldGet(_draw, this).viewbox(0, 0, x, y);
          break;
      }
    }
  }
}
function _getNestedChanges(obj1, obj2) {
  const changes = {};
  for (const key in obj2) {
    const val1 = obj1 === null || obj1 === void 0 ? void 0 : obj1[key];
    const val2 = obj2[key];
    if (lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_2___default()(val1) && lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_2___default()(val2)) {
      // Recursively check nested objects
      const nestedChanges = _assertClassBrand(_CalendarHeatmap_brand, this, _getNestedChanges).call(this, val1, val2);
      if (Object.keys(nestedChanges).length > 0) {
        changes[key] = nestedChanges;
      }
    } else if (!lodash_isEqual__WEBPACK_IMPORTED_MODULE_1___default()(val1, val2)) {
      changes[key] = val2;
    }
  }
  return changes;
}
function _settingsJSON() {
  let s = {};
  for (let i in _classPrivateFieldGet(_componentSettings, this)) {
    s[_classPrivateFieldGet(_componentSettings, this)[i].id] = {};
    for (let a of Object.entries(_classPrivateFieldGet(_componentSettings, this)[i])) {
      if (!['id', 'disabled', 'options', 'headerTitle'].includes(a[0])) s[_classPrivateFieldGet(_componentSettings, this)[i].id][a[0]] = a[1];
      if (a[0] === 'options') {
        for (let b of a[1]) {
          if (b.name) s[_classPrivateFieldGet(_componentSettings, this)[i].id][b.name] = b.value;
        }
      }
    }
  }
  return s;
}
function _elementInputCheck() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'check';
  let {
    value = true,
    label = 'label',
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let id = "ch-" + crypto.randomUUID();
  return "<div class=\"form-check mb-1\">\n      <input class=\"form-check-input\" name=\"".concat(name, "\" type=\"checkbox\" value=\"", true, "\" id=\"").concat(id, "\" ").concat(value ? 'checked' : '', ">\n      <label class=\"form-check-label\" for=\"").concat(id, "\">").concat(label, "</label>\n    </div>");
}
function _elementInputSwitch() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'switch';
  let {
    value = true,
    label = 'label',
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let id = "ch-" + crypto.randomUUID();
  return "<div class=\"form-check form-switch fs-6\" style=\"position:relative; margin:-2.1rem .5rem .6rem .5rem; z-index:10; width:2em;\">\n    <input class=\"form-check-input\" type=\"checkbox\" role=\"switch\" name=\"".concat(name, "\" value=\"", true, "\" id=\"").concat(id, "\" ").concat(value ? 'checked' : '', " ").concat(disabled ? 'disabled' : '', " switch>\n    <label class=\"form-check-label\" for=\"").concat(id, "\">").concat(label, "</label>\n  </div>");
}
function _elementInputText() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'text';
  let {
    value = 'Text',
    label = 'label',
    icon = '',
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let id = "ch-" + crypto.randomUUID();
  return "<div class=\"mb-1 ".concat(className, "\">\n      <label for=\"").concat(id, "\" class=\"form-label\">").concat(label, "</label>").concat(icon, "\n      <input type=\"text\" class=\"form-control form-control-sm\" name=\"").concat(name, "\" id=\"").concat(id, "\" placeholder=\"").concat(value, "\" value=\"").concat(value, "\">\n    </div>");
}
function _elementInputColor() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'color';
  let {
    value = '#000000',
    label = 'label',
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let id = "ch-" + crypto.randomUUID();
  return "<div class=\"d-flex mb-1 ".concat(className, "\">\n      <input type=\"color\" class=\"form-control form-control-color\" name=\"").concat(name, "\" id=\"").concat(id, "\" value=\"").concat(value, "\" title=\"Choose ").concat(label, " color\">\n      <label for=\"").concat(id, "\" class=\"col-sm-9 col-form-label\">").concat(label, "</label>\n    </div>");
}
function _elementInputRange() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'range';
  let {
    value = -1,
    label = 'label',
    icon = '',
    step = 1,
    min = 0,
    max = 1,
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let id = "ch-" + crypto.randomUUID();
  return "<div class=\"mt-1\">\n    <label for=\"".concat(id, "\" class=\"form-label\" style=\"margin-bottom:-1.5rem\">\n      ").concat(label, " (").concat(min, "-").concat(max, ", default: ").concat(value, ")\n    </label>").concat(icon, "\n    <input type=\"range\" class=\"form-range\" name=\"").concat(name, "\" id=\"").concat(id, "\" value=\"").concat(value, "\" min=\"").concat(min, "\" max=\"").concat(max, "\" step=\"").concat(step, "\">      \n    </div>");
}
function _elementInputSelect() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'select';
  let {
    value = '',
    label = 'label',
    icon = '',
    options = [],
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let id = "ch-" + crypto.randomUUID();
  options = options.map(e => e.name ? "<option value=\"".concat(e.value, "\"").concat(e.value == value ? "selected" : "", ">").concat(e.name, "</option>") : "<option value=\"".concat(e, "\"").concat(e == value ? "selected" : "", ">").concat(e, "</option>"));
  return "<div class=\"mb-2 ".concat(className, "\">\n      <label for=\"").concat(id, "\" class=\"form-label\">").concat(label, "</label>").concat(icon, "\n      <select class=\"form-select form-select-sm\" name=\"").concat(name, "\" id=\"").concat(id, "\">").concat(options.join('\n'), "</select>\n    </div>");
}
function _elementInputRadio() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'check';
  let {
    value = '',
    label = 'label',
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let id = "ch-" + crypto.randomUUID();
  return "<div class=\"form-check mb-1\">\n      <input class=\"form-check-input\" name=\"".concat(name, "\" type=\"radio\" autocomplete=\"off\" value=\"", true, "\" id=\"").concat(id, "\" ").concat(value ? 'checked' : '', ">\n      <label class=\"form-check-label\" for=\"").concat(id, "\">").concat(label, "</label>\n    </div>");
}
function _elementInputScales() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'scales';
  let {
    value = '',
    label = 'label',
    options = [],
    className = '',
    disabled = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  options = options.map(e => {
    let id = "ch-" + crypto.randomUUID();
    return "<div>\n        <input class=\"form-radio-scale d-none\" type=\"radio\" name=\"".concat(name, "\" value=\"").concat(e.name, "\" autocomplete=\"off\" id=\"").concat(id, "\" ").concat(e.name == value ? 'checked' : '', ">\n        <label class=\"form-check-label border\" for=\"").concat(id, "\" title=\"").concat(e.name, "\" style=\"background: linear-gradient( to bottom, ").concat(e.value.map((e, i) => "".concat(e, " ").concat(20 * i, "%, ").concat(e, " ").concat(20 * (i + 1), "%")).join(','), "); width:15px; height:75px;\"></label>\n        </div>");
  });
  return "<div class=\"mb-1 ".concat(className, "\">\n        <label class=\"form-check-label mb-1\">").concat(label, "</label>\n        <div class=\"p-1\" style=\"display:flex; flex-wrap: wrap; column-gap: 5px;\">\n          ").concat(options.join('\n'), "\n        </div>\n      </div>");
}
function _elementHelp(options) {
  let id = "ch-" + crypto.randomUUID();
  if (options.display == 'inline') return "<span>".concat(options.content, "</span>");
  if (options.display == 'block') return "<div id=\"".concat(id, "\" class=\"form-text\">\n        ").concat(options.content, "\n      </div>");
}
})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=calendarheatmap.js.map