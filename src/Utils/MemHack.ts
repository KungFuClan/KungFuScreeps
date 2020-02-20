let lastMemory: any;
let lastTime: number = 0;
export class Mem {
    public static loadCachedMemory() {
        if (lastTime && lastMemory && Game.time === lastTime + 1) {
            delete global.Memory;
            global.Memory = lastMemory;
            RawMemory._parsed = lastMemory;
        }
        else {
            // tslint:disable-next-line
            Memory.rooms; // forces parsing
            lastMemory = RawMemory._parsed;
        }
        lastTime = Game.time;
        // Handle global time
        if (!global.age) {
            global.age = 0;
        }
        global.age++;
    }
}
