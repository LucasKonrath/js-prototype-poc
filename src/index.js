'use strict';

function title(t) {
  console.log('\n=== ' + t + ' ===');
}

function line(label, value) {
  console.log(label + ':', value);
}

// 1) Objects delegate property lookup to their prototype
title('1) Prototype chain property lookup');
const base = {
  kind: 'base',
  describe() {
    return `kind=${this.kind}`;
  }
};

const obj = Object.create(base);
obj.kind = 'child';

line('obj.kind (own)', obj.kind);
line('obj.describe() (from prototype)', obj.describe());
line('obj.hasOwnProperty("describe")', Object.prototype.hasOwnProperty.call(obj, 'describe'));
line('base.hasOwnProperty("describe")', Object.prototype.hasOwnProperty.call(base, 'describe'));
line('Object.getPrototypeOf(obj) === base', Object.getPrototypeOf(obj) === base);

// 2) Shadowing: an own property overrides a prototype property
title('2) Shadowing (overriding prototype properties)');
line('obj.describe()', obj.describe());
obj.describe = function () {
  return 'own describe(): ' + this.kind;
};
line('obj.describe() after shadow', obj.describe());
line('base.describe() still', base.describe.call({ kind: 'base' }));

// 3) Mutating the prototype affects all objects that delegate to it
title('3) Mutating prototype affects delegates');
const a = Object.create(base);
const b = Object.create(base);
a.kind = 'a';
b.kind = 'b';
base.shared = 1;
line('a.shared (inherited)', a.shared);
line('b.shared (inherited)', b.shared);
base.shared++;
line('a.shared after base.shared++', a.shared);
line('b.shared after base.shared++', b.shared);

// 4) Constructor functions and .prototype
title('4) Constructor function prototypes');
function Person(name) {
  this.name = name;
}
Person.prototype.say = function () {
  return `Hi, I'm ${this.name}`;
};

const p1 = new Person('Ada');
const p2 = new Person('Grace');

line('p1.say()', p1.say());
line('p2.say()', p2.say());
line('Object.getPrototypeOf(p1) === Person.prototype', Object.getPrototypeOf(p1) === Person.prototype);
line('p1.hasOwnProperty("say")', Object.prototype.hasOwnProperty.call(p1, 'say'));

// Changing the prototype method updates behavior for all instances
Person.prototype.say = function () {
  return `Hello from updated say(), ${this.name}`;
};
line('p1.say() after prototype change', p1.say());
line('p2.say() after prototype change', p2.say());

// 5) __proto__ vs Object.getPrototypeOf / Object.setPrototypeOf
title('5) Getting/setting prototypes');
const proto1 = { tag: 'proto1' };
const proto2 = { tag: 'proto2' };
const x = Object.create(proto1);
line('Object.getPrototypeOf(x).tag', Object.getPrototypeOf(x).tag);
Object.setPrototypeOf(x, proto2);
line('After Object.setPrototypeOf, prototype tag', Object.getPrototypeOf(x).tag);

// 6) ES6 class syntax is still prototype-based
title('6) ES6 class is prototype-based');
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a noise`;
  }
}
class Dog extends Animal {
  speak() {
    return `${this.name} barks`;
  }
}
const d = new Dog('Rex');
line('d.speak()', d.speak());
line('Object.getPrototypeOf(Dog.prototype) === Animal.prototype', Object.getPrototypeOf(Dog.prototype) === Animal.prototype);

// 7) Prototype pollution demo (safe access patterns)
title('7) Prototype pollution awareness (demo)');
const userInput = JSON.parse('{"__proto__": {"polluted": "yes"}, "safe": 123}');

// Naive merge can be dangerous (we will demonstrate the risk without permanently polluting global state)
function naiveMerge(target, src) {
  for (const k in src) {
    // `for...in` walks inherited enumerable keys too.
    target[k] = src[k];
  }
  return target;
}

const victim = {};
naiveMerge(victim, userInput);

// In modern Node, setting __proto__ on an object may change its prototype.
// Demonstrate how to check safely:
line('victim.safe', victim.safe);
line('victim.polluted (own?)', Object.prototype.hasOwnProperty.call(victim, 'polluted') ? victim.polluted : '(not own)');
line('({}).polluted exists?', ({}).polluted !== undefined);

// Safer merge: only own keys, and block __proto__/constructor/prototype
function safeMerge(target, src) {
  for (const k of Object.keys(src)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    target[k] = src[k];
  }
  return target;
}

const safeVictim = {};
safeMerge(safeVictim, userInput);
line('safeVictim.safe', safeVictim.safe);
line('safeVictim.polluted', safeVictim.polluted);

title('Done');
console.log('Edit src/index.js to try your own prototype experiments.');
