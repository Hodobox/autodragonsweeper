/* eslint-disable no-unused-vars */
// @ts-nocheck
"use_strict"

let RELEASE = true;
let debugOn = false;
let solverLoggingOn = true;
let debugLines = [];
let fontDebug;
let solverTesting = false;
let lastSolverTestingAction = Date.now();
/** @type {SolverStats[]} */
let solverTestingStats = [];
let solverTestingCadenceMs = 50;
// For reproducible games
let gameRandomnessSeeds = [];
let solverTestingNumGames = 100;
/** @type {BitmapFont} */
let fontUINumbers;
let fontHUD;
let fontUIOrange;
let fontUIGray;
let fontUIBlackDark;
/** @type {BitmapFont} */
let fontBook;
let fontUIRed;
let fontUIYellow;
let fontUIBlue;
let fontUIBook;
let fontCredits;
let fontWinscreen;

let nomiconWasEverRead = false;
let soundOn = true;
let musicOn = true;
let freeClickOn = true;
let powerHintsOn = true;
let runningMusic = null;
let runningMusicId = null;
let musicToRun = null;

let imgJuliDragon;
let imgJuliDragonAlternate;
let stripHint;
let stripHintLevelup;
let stripButtons;
let stripScanlines;
let stripLevelup;
let stripIcons;
let stripIconsBig;
let stripHero;
let stripMonsters;
let stripHUD;
let stripBook;
let stripLevelupButtons;
let stripFX;
let stripBookFlap;
let stripStamps;
let stripStoryteller;
/** @type {GameState} */
let state;
/** @type {KnownGameState} */
let knownGameState;
/** @type {SolverStats} */
let solverStats;
let revealValues;
let collectedStamps = [];

let sndEvents = {};

const version = "v1.1.18";
const TIME_TO_HOVER_MENU = 0.33;
const BOOK_MOVEMENT_DURATION = 1;
const MAX_HP = 19;
const MAX_LEVEL_WITH_HP_UPGRADE = 25;
const ORB_RADIUS = 2.1;
const HEART_GROWING = [60, 61, 62, 63, 64, 65, 66].reverse();
// const HEART_GROWING = [160, 161, 162, 163, 164];
const HEART_DRAINING = [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92];
// const HEART_NEW = [100, 101, 102, 103, 104, 105, 106].reverse();
const HEART_NEW = [160, 161, 162, 163, 164, 165, 166];
const HEART_HALF_GROWING = [153, 154, 155].reverse();
const XP_GROWING = [70, 71, 72, 73, 74].reverse();
// const XP_GROWING = [160, 161, 162, 163, 164];
const XP_SHRINKING = [70, 71, 72, 73, 74];
const XP_SPINNING = [120, 121, 122, 123, 124, 125, 126, 127, 128, 129];
const HERO_IDLE = [0];
const HERO_DEAD = [1];
const HERO_EMPOWERED = [10, 11];
const HERO_NAKED = [20, 21, 22];
const HERO_ITS_A_ME = [40, 41, 40];
const HERO_ITS_A_ME_NAKED = [90, 91, 92, 93, 94, 95, 96];
const HERO_LEVELING = [32, 33, 34, 35, 36, 37];
const HERO_STABBING = [50];
const HERO_CELEBRATING = [70, 71];
const ALL_MARKERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const STAMP_LOVERS = "stamp_lovers";
const STAMP_CLEAR = "stamp_clear";
const STAMP_EGG = "stamp_egg";
const STAMP_PACIFIST = "stamp_pacifist";
const STAMP_SPEC_IDS = [STAMP_LOVERS, STAMP_CLEAR, STAMP_EGG, STAMP_PACIFIST];
const STAMP_SPEC_FRAME = [5, 8, 1, 2];
const STAMP_DESC = [["lovers", "survive"], ["clear", "board"], ["future", "generation"], ["rat", "pacifist"]]


let LEVELUP_FRAMES = [];
for (let i = 0; i < 113; i++) LEVELUP_FRAMES.push(i);

class RandomGeneratorLayer {
    constructor() {
        /** @type {Actor[]} */
        this.actors = [];
    }
}

class HoverMenu {
    constructor() {
        /** @type {Actor|null} */
        this.actor = null;
        this.resetTo(null);
    }

    isActive() {
        return this.actor != null;
    }

    resetTo(a) {
        this.actor = a;
    }
}

class IndexedAnimation {
    constructor(heartIndex, frames) {
        this.index = heartIndex;
        this.frames = frames;
        this.timer = new FrameTimer();
    }
}

class PlacedAnimation {
    constructor(strip, frames, scale, x, y) {
        this.timer = new FrameTimer();
        this.strip = strip;
        this.frames = frames;
        this.x = x;
        this.y = y;
        this.scale = scale;
    }
}

class FrameAnimation {
    constructor() {
        this.timer = new FrameTimer();
        this.frames = [];
    }

    stop() {
        this.timer.stop();
    }

    once(frames, fps) {
        this.frames = frames;
        this.timer.once(this.frames.length, fps);
    }

    loop(frames, fps) {
        this.frames = frames;
        this.timer.loop(this.frames.length, fps);
    }

    running() {
        return this.timer.running();
    }

    update(dt) {
        this.timer.update(dt);
    }

    frame() {
        return this.frames[this.timer.frame];
    }
}

class PlayerState {
    constructor() {
        this.maxHP = 4;
        this.hp = this.maxHP;
        this.xp = 0;
        this.level = 1;
        this.score = 0;
    }
}

class GameStatus {
    static None = "none";
    static Playing = "playing";
    static Dead = "dead";
    static WinScreen = "win_screen";
    static GeneratingDungeon = "generating";
}

class ActorId {
    static None = "none";
    static Empty = "empty";
    static Orb = "orb";
    static SpellMakeOrb = "spell_reveal";
    static Mine = "mine";
    static MineKing = "mine king";
    static Dragon = "dragon";
    static Wall = "wall";
    static Mimic = "mimic";
    static Medikit = "medikit";
    static RatKing = "rat king";
    static Rat = "rat";
    static Slime = "slime";
    static Gargoyle = "gargoyle";
    static Minotaur = "minotaur";
    static Chest = "chest";
    static Skeleton = "skeleton";
    static Treasure = "treasure";
    static Snake = "snake";
    static Giant = "giant";
    static Decoration = "decoration";
    static Wizard = "wizard";
    static Gazer = "gazer";
    static SpellDisarm = "spell_disarm";
    static BigSlime = "big slime";
    static SpellRevealRats = "spell_reveal_rats";
    static SpellRevealSlimes = "spell_reveal_slimes";
    static Gnome = "gnome";
    static Bat = "bat";
    static Guard = "guardian";
    static Crown = "crown";
    static Fidel = "fidel";
    static DragonEgg = "dragon_egg";
}

function makeActor(actorId) {
    let a = new Actor();

    if (actorId == ActorId.Empty) {
        makeEmpty(a);
    }
    else if (actorId == ActorId.Orb) {
        makeOrb(a);
    }
    else if (actorId == ActorId.SpellMakeOrb) {
        makeSpellOrb(a);
    }
    else if (actorId == ActorId.Mine) {
        makeMine(a);
    }
    else if (actorId == ActorId.MineKing) {
        makeMineKing(a);
    }
    else if (actorId == ActorId.Dragon) {
        makeDragon(a);
    }
    else if (actorId == ActorId.Wall) {
        makeWall(a);
    }
    else if (actorId == ActorId.Mimic) {
        makeMimic(a);
    }
    else if (actorId == ActorId.Medikit) {
        makeMedikit(a);
    }
    else if (actorId == ActorId.RatKing) {
        makeRatKing(a);
    }
    else if (actorId == ActorId.Rat) {
        makeRat1(a);
    }
    else if (actorId == ActorId.Slime) {
        makeSlime5(a);
    }
    else if (actorId == ActorId.Gargoyle) {
        makeGargoyle4(a);
    }
    else if (actorId == ActorId.Minotaur) {
        makeMinotaur6(a);
    }
    else if (actorId == ActorId.Chest) {
        makeChest(a);
    }
    else if (actorId == ActorId.Skeleton) {
        makeSkeleton3(a);
    }
    else if (actorId == ActorId.Treasure) {
        makeTreasure5(a);
    }
    else if (actorId == ActorId.Snake) {
        makeSnake7(a);
    }
    else if (actorId == ActorId.Giant) {
        makeGiant9(a);
    } else if (actorId == ActorId.Decoration) {
        makeDecoration(a);
    } else if (actorId == ActorId.Wizard) {
        makeWizard(a);
    } else if (actorId == ActorId.Gazer) {
        makeGazer(a);
    } else if (actorId == ActorId.SpellDisarm) {
        makeSpellDisarm(a);
    } else if (actorId == ActorId.BigSlime) {
        makeBigSlime8(a);
    } else if (actorId == ActorId.SpellRevealRats) {
        makeSpellRevealRats(a);
    } else if (actorId == ActorId.SpellRevealSlimes) {
        makeSpellRevealSlimes(a);
    } else if (actorId == ActorId.Gnome) {
        makeGnome(a);
    } else if (actorId == ActorId.Bat) {
        makeBat2(a);
    } else if (actorId == ActorId.Guard) {
        makeGuard7(a);
    } else if (actorId == ActorId.Crown) {
        makeCrown(a);
    } else if (actorId == ActorId.Fidel) {
        makeFidel(a);
    }
    else if (actorId == ActorId.DragonEgg) {
        makeDragonEgg(a);
    }

    return a;
}

class Actor {
    constructor() {
        this.tx = 0;
        this.ty = 0;
        this.fixed = false;

        this.id = ActorId.None;
        this.strip = null;
        this.stripFrame = 0;
        this.deadStripFrame = 0;
        this.revealed = false;
        this.monsterLevel = 0;
        this.xp = 0;
        this.mimicMimicking = false; // TODO: necessary?
        this.facingDirection = -1; // up, right, down, left. For gargoyles and rats, for solver.
        this.defeated = false;
        this.mark = 0;
        this.trapDisarmed = false;
        this.contains = null;
        this.wallHP = 0;
        this.wallMaxHP = 0;
        this.isMonster = false;
        this.name = "none";
        this.minotaurChestLocation = [-1, -1];
    }

    copyFrom(other) {
        this.id = other.id;
        this.strip = other.strip;
        this.stripFrame = other.stripFrame;
        this.deadStripFrame = other.deadStripFrame;
        this.revealed = other.revealed;
        this.monsterLevel = other.monsterLevel;
        this.xp = other.xp;
        this.mimicMimicking = other.mimicMimicking;
        this.facingDirection = other.facingDirection;
        this.defeated = other.defeated;
        this.mark = other.mark;
        this.trapDisarmed = other.trapDisarmed;
        this.contains = other.contains;
        this.wallHP = other.wallHP;
        this.wallMaxHP = other.wallMaxHP;
        this.isMonster = other.isMonster;
        this.name = other.name;
        this.minotaurChestLocation[0] = other.minotaurChestLocation[0];
        this.minotaurChestLocation[1] = other.minotaurChestLocation[1];
    }

    reset() {
        let temp = new Actor();
        this.copyFrom(temp);
    }
}

class GameStats {
    constructor() {
        this.total = 0;
        this.empties = 0;
        this.totalXP = 0;
        this.xpRequiredToMax = 0;
        this.excessXP = 0;
        this.totalHPOnMaxLevel = 0;
        this.totalMonsterHP = 0;
    }
}

class GameState {
    constructor() {
        this.gridW = 0;
        this.gridH = 0;
        this.seed = 0;
        this.seedWasProvided = false;
        /** @type {Actor[]} */
        this.actors = [];
        this.actorsGrid = [];
        this.actorsIndexGrid = [];
        this.player = new PlayerState();
        this.showingMonsternomicon = false;
        this.buttonFrames = [];
        /** @type {PlacedAnimation[]} */
        this.animationsFX = [];
        this.tempHeroAnim = new FrameAnimation();
        this.heroAnim = new FrameAnimation();
        this.status = GameStatus.None;
        /** @type {ActorId} */
        this.lastActorTypeClicked = ActorId.None;
        this.lastActorNameClicked = "";

        /** @type {FrameAnimation} */
        this.levelupAnimation = new FrameAnimation();
        /** @type {IndexedAnimation[]} */
        this.heartAnimations = [];
        /** @type {IndexedAnimation[]} */
        this.xpAnimations = [];
        this.lastTileClicked = null;
        this.screenShakeTimer = 0;
        /** @type {GameStats} */
        this.stats = new GameStats();
        this.bookLocationElapsed = 0;
        /** @type {HoverMenu} */
        this.hoverMenu = new HoverMenu();
        this.lastHoveredHoverButtonIndex = -1;
        this.lastPushedButtonIndex = -1;
        this.timeElapsedPushingButton = 0;
        this.waitForAFrameBeforeGeneration = false;
        this.waitForFramesAfterGeneration = 0;
        this.minesDisarmed = false;
        this.wallLocations = [];
        this.chestsLocations = [];
        this.dragonDefeated = false;
        this.crownAnimation = new FrameAnimation();
        this.startTime = 0;
        this.endTime = 0;
        // this.clearedBoard = false;
        // this.fidelSurvived = false;
        this.bookPage = 0;
        /** @type {string[]} */
        this.stampsCollectedThisRun = [];
        this.killedRats = 0;
        this.autoPlayRect = new Rect();
    }
}

function stripXYToFrame(x, y) {
    return Math.floor(x / 16) + Math.floor(y / 16) * 16;
}

function stripXYToFrame24(x, y) {
    return Math.floor(x / 24) + Math.floor(y / 24) * 10;
}

function nextLevelXP(level) {
    //              1  2  3  4  5   6   7   8   9  10  11  12  13  14  15 (level)
    //              5     6     7       8       9      10      11      12 (hp)
    let table = [0, 4, 5, 7, 9, 9, 10, 12, 12, 12, 15, 18, 21, 21, 25];
    let index = Math.min(level, table.length - 1);
    return table[index];
}

function loadSettings() {
    let nomicon = localStorage.getItem("nomicon");
    if (nomicon == null) {
        localStorage.setItem("nomicon", "no");
        nomiconWasEverRead = false;
    }
    else {
        nomiconWasEverRead = nomicon == "yes";
    }

    let soundSetting = localStorage.getItem("sound");
    if (soundSetting == null) {
        localStorage.setItem("sound", "on");
        soundOn = true;
    }
    else {
        soundOn = soundSetting == "on";
    }

    let musicSetting = localStorage.getItem("music");
    if (soundSetting == null) {
        localStorage.setItem("music", "on");
        musicOn = true;
    }
    else {
        musicOn = musicSetting == "on";
    }

    let freeClickSetting = localStorage.getItem("freeclick");
    if (freeClickSetting == null) {
        localStorage.setItem("freeclick", "on");
        freeClickOn = true;
    }
    else {
        freeClickOn = freeClickSetting == "on";
    }

    let powerHintsSetting = localStorage.getItem("hints");
    if (powerHintsSetting == null) {
        localStorage.setItem("hints", "on");
        powerHintsOn = true;
    }
    else {
        powerHintsOn = powerHintsSetting == "on";
    }

    collectedStamps = [];
    for (let stampSpec of STAMP_SPEC_IDS) {
        if (localStorage.getItem(stampSpec) != null) {
            collectedStamps.push(stampSpec);
        }
    }
}

function saveSettings() {
    localStorage.setItem("sound", soundOn ? "on" : "off");
    localStorage.setItem("music", musicOn ? "on" : "off");
    localStorage.setItem("nomicon", nomiconWasEverRead ? "yes" : "no");
    localStorage.setItem("freeclick", freeClickOn ? "on" : "off");
    localStorage.setItem("hints", powerHintsOn ? "on" : "off");
    for (let stamp of collectedStamps) {
        localStorage.setItem(stamp, "yes");
    }
}

function newGame() {
    state = new GameState();
    state.player.level = 1;
    state.player.maxHP = 6;
    state.player.hp = state.player.maxHP;
    state.gridW = 13;
    state.gridH = 10;

    if (gameRandomnessSeeds.length) {
        state.seed = gameRandomnessSeeds.pop();
        state.seedWasProvided = true;
        console.log(`Starting a game with provided seed ${state.seed}`);
    } else {
        state.seed = (Math.random() * 2 ** 32) >>> 0;
        state.seedWasProvided = false;
        console.log(`Starting a game with random seed ${state.seed}`);
    }

    seedDragonsweeperRandom(state.seed);

    state.status = GameStatus.GeneratingDungeon;
    state.waitForAFrameBeforeGeneration = true;

    // state.crownAnimation.loop([10, 11, 12, 13 ,14 ,15 ,16, 17], 9);
    state.crownAnimation.loop([4, 5, 6], 9);

    knownGameState = new KnownGameState();
    solverStats = new SolverStats();
    solverStats.seed = state.seed;
    if (solverTestingStats.length == solverTestingNumGames) {
        solverTesting = false;
        console.log(`Done with solver testing`);
    }

    if (solverTesting) {
        console.log(`Solver testing game ${solverTestingStats.length + 1}/${solverTestingNumGames}`);
    }
}

function generateDungeon() {

    // generator
    /** @type {RandomGeneratorLayer} */
    let currentLayer = new RandomGeneratorLayer();
    // buttons and all available actors
    let buttonFrameBag = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    let currentButtonBag = [];
    state.actors = []; state.wallLocations = []; state.chestsLocations = [];
    state.actorsGrid = Array(state.gridH).fill().map(() => []); state.actorsIndexGrid = Array(state.gridH).fill().map(() => []);
    for (let y = 0; y < state.gridH; y++) {
        for (let x = 0; x < state.gridW; x++) {
            let a = new Actor();
            makeEmpty(a);
            a.tx = x;
            a.ty = y;
            state.actors.push(a);
            state.actorsGrid[y][x] = a;
            state.actorsIndexGrid[y][x] = state.actors.length - 1;

            if (currentButtonBag.length == 0) {
                currentButtonBag = buttonFrameBag.slice();
                shuffle(currentButtonBag);
            }

            if (x == 0 && y == 0) state.buttonFrames[x + y * state.gridW] = 25;
            else if (x == state.gridW - 1 && y == 0) state.buttonFrames[x + y * state.gridW] = 26;
            else state.buttonFrames[x + y * state.gridW] = currentButtonBag.pop();
        }
    }

    // I need this for the happiness algo to not place stuff
    // always in the same place
    // shuffle(state.actors);

    beginLayer();
    add(1, makeDragon);
    add(1, makeWizard);
    endLayer();

    beginLayer();
    add(5, makeBigSlime8);
    endLayer();

    beginLayer();
    add(1, makeMineKing);
    endLayer();

    beginLayer();
    add(1, makeGiant9).forEach(a => a.name = "romeo");
    add(1, makeGiant9).forEach(a => a.name = "juliet");
    // add(2, makeRat1).forEach(a => a.name = "rat_guard");
    endLayer();

    beginLayer();
    add(1, makeRatKing);
    add(6, makeWall).forEach(a => a.contains = makeTreasure1);
    add(5, makeMinotaur6);
    add(1, makeGuard7).forEach(a => a.name = "guard1");
    add(1, makeGuard7).forEach(a => a.name = "guard2");
    add(1, makeGuard7).forEach(a => a.name = "guard3");
    add(1, makeGuard7).forEach(a => a.name = "guard4");

    add(2, makeGargoyle4).forEach(a => a.name = "gargoyle1");
    add(2, makeGargoyle4).forEach(a => a.name = "gargoyle2");
    add(2, makeGargoyle4).forEach(a => a.name = "gargoyle3");
    add(2, makeGargoyle4).forEach(a => a.name = "gargoyle4");

    add(2, makeGazer);

    add(9, makeMine);
    // add( 1, makeMine).forEach(a => a.name = "mine_with_orb");

    // add( 3, makeWall).forEach(a => a.contains = makeTreasure1);
    add(5, makeMedikit);
    add(3, makeChest);
    // add( 1, makeChest).forEach(a => a.contains = makeSpellOrb);
    add(2, makeChest).forEach(a => a.contains = makeMedikit);
    // add(1, makeOrb).forEach(a => a.revealed = true);
    add(1, makeOrb).forEach(a => { a.revealed = true; a.name = "orb_with_healing"; });
    // add(2, makeMedikit);//.forEach(a => a.revealed = true);
    // add(1, makeFidel);
    add(1, makeDragonEgg);

    endLayer();

    beginLayer();
    add(13, makeRat1);
    add(12, makeBat2);
    add(10, makeSkeleton3);
    add(8, makeSlime5);
    add(1, makeMimic);
    add(1, makeGnome);
    add(1, makeSpellOrb);
    endLayer();

    // post generation initialization
    // let wallHPs = [1, 2, 3, 3, 4, 5];
    let wallHPs = [3, 3, 3, 3, 3, 3];
    let wallHPCounter = 0;
    for (let a of state.actors) {
        if (a.id == ActorId.Guard) {
            if (a.name == "guard1") a.stripFrame = stripXYToFrame(200, 200);
            else if (a.name == "guard2") a.stripFrame = stripXYToFrame(200, 200) + 1;
            else if (a.name == "guard3") a.stripFrame = stripXYToFrame(200, 200) + 3;
            else if (a.name == "guard4") a.stripFrame = stripXYToFrame(200, 200) + 2;
        }
        else
            if (a.id == ActorId.Minotaur) {
                // find my chest
                for (let b of state.actors) {
                    if (b.id == ActorId.Chest && distance(b.tx, b.ty, a.tx, a.ty) < 1.5) {
                        a.minotaurChestLocation = [b.tx, b.ty];
                    }
                }
            }
            else
                if (a.id == ActorId.Dragon) {
                    a.revealed = true;
                    // make sure its button is clean
                    state.buttonFrames[a.tx + a.ty * state.gridW] = 0;
                }
                else
                    if (a.id == ActorId.Gargoyle) {
                        let twin = state.actors.find(b => b.id == a.id && b.name == a.name && b !== a);
                        if (twin != undefined) {
                            // a.stripFrame = stripXYToFrame(20, 212);
                            if (a.tx < twin.tx) { a.stripFrame = stripXYToFrame(0, 210); a.facingDirection = 1; }
                            else if (a.tx > twin.tx) { a.stripFrame = stripXYToFrame(0, 210) + 3; a.facingDirection = 3; }
                            else if (a.ty < twin.ty) { a.stripFrame = stripXYToFrame(0, 210) + 1; a.facingDirection = 2; }
                            else if (a.ty > twin.ty) { a.stripFrame = stripXYToFrame(0, 210) + 2; a.facingDirection = 0; }
                        }
                        else {
                            console.assert(false);
                        }
                    }
                    else
                        if (a.id == ActorId.Wall) {
                            a.wallHP = a.wallMaxHP = wallHPs[wallHPCounter];
                            wallHPCounter = (wallHPCounter + 1) % wallHPs.length;
                            // mark this location as a wall
                            state.wallLocations.push([a.tx, a.ty]);
                        }
                        else if (a.id == ActorId.Chest) {
                            state.chestsLocations.push([a.tx, a.ty]);
                        }
    }

    computeStats();

    function beginLayer() {
        currentLayer = new RandomGeneratorLayer();
    }

    function endLayer() {
        let layerActors = [];
        for (let layerActorToAdd of currentLayer.actors) {
            let availableActor = state.actors.find(a => isEmpty(a));
            if (availableActor == undefined) continue;
            availableActor.copyFrom(layerActorToAdd);
            layerActors.push(availableActor);
        }

        let bestHappiness = happiness();
        for (let k = 0; k < 4; k++) {
            shuffle(state.actors);
            for (let i = 0; i < state.actors.length; ++i) { state.actorsIndexGrid[state.actors[i].ty][state.actors[i].tx] = i; }

            for (let i = 0; i < layerActors.length; i++) {
                let a = layerActors[i];
                let happiestReplacement = null;
                for (let j = 0; j < state.actors.length; j++) {
                    let b = state.actors[j];
                    if (b.fixed || a === b) continue;
                    swapPlaces(a, b);
                    let newHappiness = happiness();
                    swapPlaces(a, b);
                    if (newHappiness >= bestHappiness) {
                        bestHappiness = newHappiness;
                        happiestReplacement = b;
                    }
                }

                if (happiestReplacement != null) {
                    swapPlaces(a, happiestReplacement);
                }
            }
        }

        for (let a of layerActors) {
            a.fixed = true;
        }
    }

    function add(amount, fn) {
        let ret = [];
        for (let i = 0; i < amount; i++) {
            let a = new Actor();
            fn(a);
            currentLayer.actors.push(a);
            ret.push(a);
        }
        return ret;
    }

    function swapPlaces(a, b) {
        let tempx = a.tx;
        let tempy = a.ty;
        a.tx = b.tx;
        a.ty = b.ty;
        b.tx = tempx;
        b.ty = tempy;
        state.actorsGrid[a.ty][a.tx] = a;
        state.actorsGrid[b.ty][b.tx] = b;
        let tempIndex = state.actorsIndexGrid[a.ty][a.tx];
        state.actorsIndexGrid[a.ty][a.tx] = state.actorsIndexGrid[b.ty][b.tx];
        state.actorsIndexGrid[b.ty][b.tx] = tempIndex;
    }

    function happiness() {
        let ret = 0;
        for (let a of state.actors) {
            if (a.id == ActorId.DragonEgg) {
                if (isCloseTo(a, ActorId.Dragon, 1.5)) {
                    ret += 9000;
                }
            }
            else
                if (a.id == ActorId.Fidel) {
                    if (isCorner(a.tx, a.ty)) {
                        ret += 9000;
                    }
                    // if(!isCloseTo(a, ActorId.Chest, 1.5))
                    // {
                    //     ret += 9000;
                    // }
                }
                else
                    if (a.id == ActorId.Gnome) {
                        if (isCloseTo(a, ActorId.Medikit, 1.5)) {
                            ret += 10000;
                        }

                        // let target = getGnomeFavoriteJumpTarget();
                        // if(target != null && target.tx == a.tx && target.ty == a.ty)
                        // {
                        //     ret += 5000;
                        // }
                    }
                    else
                        if (a.id == ActorId.Rat) {
                            if (a.name == "rat_guard") {
                                let king = state.actors.find(b => b.id == ActorId.RatKing);
                                if (king != undefined) {
                                    if (distance(a.tx, a.ty, king.tx, king.ty) == 1 && king.ty == a.ty) {
                                        ret += 1000;
                                    }
                                }
                            }
                        }
                        else
                            if (a.id == ActorId.Guard) {
                                if (isGuardianInRightQuadrant(a)) {
                                    ret += 2500;
                                }
                            }
                            else
                                if (a.id == ActorId.Giant) {
                                    let centerx = Math.floor(state.gridW / 2);
                                    let myLove = state.actors.find(b => b.id == ActorId.Giant && b != a);
                                    if (myLove != undefined) {
                                        if (((a.name == "romeo" && a.tx <= 5) || (a.name == "juliet" && a.tx >= 7))) {
                                            ret += 1000;
                                        }

                                        if (myLove.ty == a.ty && Math.abs(a.tx - centerx) == Math.abs(myLove.tx - centerx)) {
                                            ret += 10000;
                                        }
                                    }
                                }
                                else
                                    if (a.id == ActorId.BigSlime) {
                                        if (isCloseTo(a, ActorId.Wizard, 1.5)) {
                                            ret += 1000;
                                        }
                                    }
                                    else
                                        if (a.id == ActorId.Wizard) {
                                            if (!isCorner(a.tx, a.ty) && isEdge(a.tx, a.ty)) {
                                                ret += 10000;
                                            }
                                        }
                                        else
                                            if (a.id == ActorId.MineKing) {
                                                if (isCorner(a.tx, a.ty)) {
                                                    ret += 10000;
                                                }
                                            }
                                            else
                                                if (a.id == ActorId.Dragon) {
                                                    if (a.tx == Math.floor(state.gridW / 2) && a.ty == 4) {
                                                        ret += 10000;
                                                    }
                                                }
                                                else
                                                    if (a.id == ActorId.Minotaur) {
                                                        let chests = 0;
                                                        let crowded = false;
                                                        for (let b of state.actors) {
                                                            if (b.id != ActorId.Chest) continue;
                                                            if (b.tx == a.tx) continue;
                                                            if (distance(a.tx, a.ty, b.tx, b.ty) >= 2) continue;

                                                            chests++;

                                                            if (state.actors.find(c => c.id == ActorId.Minotaur && c !== a && distance(c.tx, c.ty, b.tx, b.ty) < 2) != undefined) {
                                                                crowded = true;
                                                            }
                                                        }

                                                        if (chests == 1 && !crowded) {
                                                            ret += 10000;
                                                        }
                                                    }
                                                    else
                                                        if (a.id == ActorId.Gargoyle) {
                                                            if (isGargoyleInRightPlace(a)) {
                                                                ret += 1000;
                                                            }
                                                        }
                                                        else
                                                            if (a.id == ActorId.Orb) {
                                                                if (isCloseToEdge(a.tx, a.ty)) {
                                                                    ret -= 10000;
                                                                }

                                                                let medikitsRevealed = 0;
                                                                let wallsRevealed = 0;
                                                                let minesRevealed = 0;
                                                                let forbiddenObjects = 0;
                                                                for (let b of state.actors) {
                                                                    if (a === b) continue;
                                                                    let dist = distance(a.tx, a.ty, b.tx, b.ty);

                                                                    if (dist < ORB_RADIUS) {
                                                                        // things I don't want to ever reveal
                                                                        if (b.id == ActorId.Dragon ||
                                                                            b.id == ActorId.Gazer ||
                                                                            b.id == ActorId.Chest ||
                                                                            b.id == ActorId.SpellMakeOrb ||
                                                                            b.id == ActorId.RatKing ||
                                                                            b.id == ActorId.Mine ||
                                                                            b.id == ActorId.Fidel ||
                                                                            b.id == ActorId.DragonEgg ||
                                                                            b.id == ActorId.BigSlime ||
                                                                            b.id == ActorId.Mimic) {
                                                                            forbiddenObjects++;
                                                                        }

                                                                        if (b.id == ActorId.Medikit) {
                                                                            medikitsRevealed++;
                                                                        }
                                                                        else
                                                                            if (b.id == ActorId.Mine) {
                                                                                minesRevealed++;
                                                                            }
                                                                            else
                                                                                if (b.id == ActorId.Wall) {
                                                                                    wallsRevealed++;
                                                                                }
                                                                    }
                                                                }

                                                                ret += forbiddenObjects * -2000;
                                                                if (wallsRevealed > 2) ret += (wallsRevealed - 2) * -2000;
                                                                if (medikitsRevealed == 1 && wallsRevealed > 0) ret += 2000;
                                                            }
                                                            else
                                                                if (a.id == ActorId.Medikit) {
                                                                    ret += -1000 * countNearMeWithSameId(a, 3.5);
                                                                }
                                                                else
                                                                    if (a.id == ActorId.Chest) {
                                                                        ret += -1000 * countNearMeWithSameId(a, 3);
                                                                    }
                                                                    else
                                                                        if (a.id == ActorId.Wall) {
                                                                            // if(isEdge(a.tx, a.ty))
                                                                            // {
                                                                            //     ret -= 1000;
                                                                            // }

                                                                            let closeCount = 0;
                                                                            let farCount = 0;
                                                                            let onEdge = isEdge(a.tx, a.ty) ? 1 : 0;
                                                                            for (let b of state.actors) {
                                                                                if (a === b) continue;
                                                                                let dist = distance(a.tx, a.ty, b.tx, b.ty);
                                                                                if (dist <= 1 && b.id == ActorId.Wall) {
                                                                                    closeCount += 1;
                                                                                    if (isEdge(b.tx, b.ty)) onEdge++;
                                                                                }
                                                                                else
                                                                                    if (dist < 1.5 && b.id == ActorId.Wall) {
                                                                                        farCount += 1;
                                                                                    }
                                                                            }

                                                                            if (closeCount == 1 && farCount == 0 && onEdge < 2) {
                                                                                ret += 2000;
                                                                            }
                                                                        }
        }
        return ret;

        function countNearMeWithSameId(a, minDistance) {
            let count = 0;
            for (let b of state.actors) {
                if (a.id == b.id && b !== a && distance(a.tx, a.ty, b.tx, b.ty) < minDistance) {
                    count += 1;
                }
            }
            return count;
        }
    }
}

function isGuardianInRightQuadrant(a) {
    if (a.name == "guard1") {
        if (a.tx < 6 && a.ty < 4) return true;
    }
    else if (a.name == "guard2") {
        if (a.tx > 6 && a.ty < 4) return true;
    }
    else if (a.name == "guard3") {
        if (a.tx > 6 && a.ty > 4) return true;
    }
    else if (a.name == "guard4") {
        if (a.tx < 6 && a.ty > 4) return true;
    }
    return false;
}

function isGargoyleInRightPlace(a) {
    let foundTwin = false;
    let neighborCount = 0;
    for (let b of state.actors) {
        if (a === b) continue;
        let dist = distance(a.tx, a.ty, b.tx, b.ty);
        if (dist <= 1 && b.id == ActorId.Gargoyle) {
            neighborCount += 1;
            if (b.name == a.name) {
                foundTwin = true;
            }
        }
    }
    return foundTwin;
}

function checkLevel() {
    // console.log("checking level...");
    for (let a of state.actors) {
        if (a.id == ActorId.BigSlime) {
            if (!isCloseTo(a, ActorId.Wizard, 1.5)) return fail("misplaced slime");
        }
        else
            if (a.id == ActorId.Gargoyle) {
                if (!isGargoyleInRightPlace(a)) return fail("gargoyle misplaced");
            }
            else
                if (a.id == ActorId.Guard) {
                    if (!isGuardianInRightQuadrant(a)) return fail("guardian misplaced");
                }
                else
                    if (a.id == ActorId.MineKing) {
                        if (!isCorner(a.tx, a.ty)) return fail("mine king not in corner");
                    }
                    else
                        if (a.id == ActorId.Giant) {
                            let centerx = Math.floor(state.gridW / 2);
                            let other = state.actors.find(b => b.id == ActorId.Giant && b.name != a.name);
                            if (other == undefined) continue;
                            if ((a.name == "romeo" && a.tx > 5) || (a.name == "juliet" && a.tx < 7)) return fail("misplaced giant");
                            if (other.ty != a.ty) return fail("misplaced giant");
                            if (Math.abs(a.tx - centerx) != Math.abs(other.tx - centerx)) return fail("misplaced giant");
                        }
                        else
                            if (a.id == ActorId.Minotaur) {
                                let chests = 0;
                                for (let b of state.actors) {
                                    if (b.id != ActorId.Chest) continue;
                                    if (distance(a.tx, a.ty, b.tx, b.ty) >= 1.5) continue;
                                    chests++;
                                }

                                if (chests != 1) {
                                    return fail("minotaur wrong place");
                                }
                            }
    }

    return true;

    function fail(msg) {
        // console.error(msg);
        return false;
    }
}

function isEdge(tx, ty) {
    return tx == 0 || ty == 0 || tx == state.gridW - 1 || ty == state.gridH - 1;
}

function isCloseTo(a, actorId, dist) {
    for (let b of state.actors) {
        if (b === a) continue;
        if (b.id != actorId) continue;
        if (distance(a.tx, a.ty, b.tx, b.ty) >= dist) continue;
        return true;
    }
    return false;
}

function isCorner(tx, ty) {
    return (tx == 0 && ty == 0) ||
        (tx == 0 && ty == state.gridH - 1) ||
        (tx == state.gridW - 1 && ty == state.gridH - 1) ||
        (tx == state.gridW - 1 && ty == 0);
}

function isCloseToEdge(tx, ty) {
    return tx <= 1 || ty <= 1 || tx >= state.gridW - 2 || ty >= state.gridH - 2;
}

function computeStats() {
    state.stats = new GameStats();
    state.stats.total = state.actors.length;
    for (let a of state.actors) {
        if (a.id == ActorId.Empty) state.stats.empties++;
        state.stats.totalXP += a.xp;
        if (a.id == ActorId.Mine) continue;
        if (a.contains != null) {
            let placeholder = new Actor();
            a.contains(placeholder);
            state.stats.totalXP += placeholder.xp;
        }
        state.stats.totalMonsterHP += a.monsterLevel + a.wallHP;
    }

    let maxhp = 5;
    state.stats.totalHPOnMaxLevel = maxhp;
    let level = 1;
    while (maxhp < MAX_HP - 1 - 3) {
        state.stats.xpRequiredToMax += nextLevelXP(level);
        if (isLevelHalfHeart(level)) maxhp += 1;
        state.stats.totalHPOnMaxLevel += maxhp;
        level++;
    }
    state.stats.totalHPOnMaxLevel += 1;
    state.stats.excessXP = state.stats.totalXP - state.stats.xpRequiredToMax;
}

function drawLineOutlineCentered(ctx, text, x, y, centering) {
    x = Math.floor(x);
    y = Math.floor(y);
    fontUIGray.drawLine(ctx, text, x + 1, y, centering);
    fontUIGray.drawLine(ctx, text, x, y + 1, centering);
    fontUIGray.drawLine(ctx, text, x - 1, y, centering);
    fontUIGray.drawLine(ctx, text, x, y - 1, centering);
    fontUIGray.drawLine(ctx, text, x + 1, y + 1, centering);
    fontUIGray.drawLine(ctx, text, x - 1, y + 1, centering);
    fontUIGray.drawLine(ctx, text, x - 1, y - 1, centering);
    fontUIGray.drawLine(ctx, text, x + 1, y - 1, centering);
    fontUIOrange.drawLine(ctx, text, x, y, centering);
}

function isEmpty(a) {
    return a.id == ActorId.Empty;
}

function isInside(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < state.gridW && ty < state.gridH;
}

function getActorAt(tx, ty) {
    return state.actorsGrid[ty][tx];
    // let mine = state.actorsGrid[ty][tx];
    // if(state.actors.find(a => a.tx == tx && a.ty == ty) !== mine) {
    //      console.error(`bad actor at ${ty} ${tx});
    // }
    // return state.actors.find(a => a.tx == tx && a.ty == ty);
}

function getActorIndexAt(tx, ty) {
    return state.actorsIndexGrid[ty][tx];
    // let mine = state.actorsIndexGrid[ty][tx];
    // for (let i = 0; i < state.actors.length; i++) {
    //     if (state.actors[i].tx == tx && state.actors[i].ty == ty) {
    //         if (mine != i) {
    //             console.error(`bad index, ${tx} ${ty} is ${i} but I say ${mine}`);
    //         }
    //         return i;
    //     }
    // }
    // return -1;
}

function revealIsolatedGroupsOfMines(actors) {
    let taboo = [];
    let reveals = 0;
    for (let a of actors) {
        if (a.revealed) continue;
        if (taboo.includes(a)) continue;
        let group = flood(a);
        let hasNonMine = group.find(c => c.id != ActorId.Mine) != undefined;
        if (!hasNonMine) {
            for (let c of group) {
                if (!c.revealed) {
                    reveals++;
                    c.revealed = true;
                    startFXReveal(c.tx, c.ty);
                }
            }
        }
    }

    if (reveals > 0) {
        play("reveal");
    }

    function flood(pivotActor) {
        let ret = [pivotActor];
        for (let b of getNeighborsWithDiagonals(pivotActor.tx, pivotActor.ty)) {
            if (isEmpty(b)) continue;
            if (taboo.includes(b)) continue;
            taboo.push(b);
            ret = ret.concat(flood(b));
        }
        return ret;
    }
}

function floodCross(pivotActor, filterFn) {
    return internalFlood(pivotActor, filterFn, []);

    function internalFlood(pivotActor, filterFn, taboo) {
        let ret = [];
        if (filterFn(pivotActor)) {
            ret.push(pivotActor);
            // taboo.push(pivotActor);
            for (let b of getNeighborsCross(pivotActor.tx, pivotActor.ty)) {
                if (taboo.includes(b)) continue;
                taboo.push(b);
                ret = ret.concat(internalFlood(b, filterFn, taboo));
            }
        }
        return ret;
    }
}

function recursiveReveal(a, tabooArray = []) {
    // note: I don't reveal all empty tiles because it feels too automated and boring
    // let group = floodCross(a, b => b === a || (b.id == ActorId.Empty && !b.revealed));

    // let group = floodCross(a, b => b === a || (b.id == ActorId.Empty && !b.revealed && getAttackNumber(b.tx, b.ty) == 0));
    // for(let g of group)
    // {
    //     g.revealed = true;
    // }
    a.revealed = true;
}

function getNeighborsWithDiagonals(tx, ty) {

    let newret = [];
    for (let dx of [-1, 1, 0]) {
        for (let dy of [-1, 1, 0]) {
            if (dx == 0 && dy == 0) {
                continue;
            }
            if (tx + dx >= 0 && tx + dx < state.gridW && ty + dy >= 0 && ty + dy < state.gridH) {
                newret.push(state.actorsGrid[ty + dy][tx + dx]);
            }
        }
    }
    newret.sort((a, b) => getActorIndexAt(a.tx, a.ty) - getActorIndexAt(b.tx, b.ty));
    return newret;

    // let ret = [];
    // for (let a of state.actors) {
    //     if (a.tx == tx && a.ty == ty) continue;
    //     if (distance(a.tx, a.ty, tx, ty) < 2) {
    //         ret.push(a);
    //     }
    // }

    // if (!arraysEqual(newret, ret)) {
    //     console.error(`old and new diag neighbors not the same`);
    //     console.error(ret);
    //     console.error(newret);
    // }

    // return ret;
}

function getNeighborsCross(tx, ty) {


    let newret = [];
    let dxs = [-1, 1, 0, 0];
    let dys = [0, 0, -1, 1];
    for (let i = 0; i < 4; ++i) {
        let dx = dxs[i], dy = dys[i];
        if (tx + dx >= 0 && tx + dx < state.gridW && ty + dy >= 0 && ty + dy < state.gridH) {
            newret.push(state.actorsGrid[ty + dy][tx + dx]);
        }
    }
    newret.sort((a, b) => getActorIndexAt(a.tx, a.ty) - getActorIndexAt(b.tx, b.ty));

    return newret;

    // let ret = [];
    // for (let a of state.actors) {
    //     if (a.tx == tx && a.ty == ty) continue;
    //     let dist = distance(a.tx, a.ty, tx, ty);
    //     if (dist == 1) {
    //         ret.push(a);
    //     }
    // }
    // if (!arraysEqual(newret, ret)) {
    //     console.error(`Old and new cross neighbors not the same`);
    //     console.error(ret);
    //     console.error(newret);
    // }
    // return ret;
}

function getRectForTile(tx, ty) {
    let r = new Rect();
    r.w = 30;
    r.h = 30;
    r.x = tx * r.w;
    r.y = ty * r.h;
    return r;
}

function startHeartAnimation(heartIndex, frames) {
    let a = new IndexedAnimation(heartIndex, frames);
    a.timer.once(frames.length, 60);
    state.heartAnimations.push(a);
}

function loopXPAnimation(heartIndex, frames) {
    let a = new IndexedAnimation(heartIndex, frames);
    a.timer.loop(frames.length, 20);
    state.xpAnimations.push(a);
}

function startXPAnimation(heartIndex, frames) {
    let a = new IndexedAnimation(heartIndex, frames);
    a.timer.once(frames.length, 60);
    state.xpAnimations.push(a);
}

function startTempHeroAnim(frames) {
    state.tempHeroAnim.once(frames, 6);
}

function startHeroAnim(frames) {
    if (state.heroAnim.frames != null && arraysEqual(state.heroAnim.frames, frames)) return;
    state.heroAnim.loop(frames, 3);
}

// function startFXExposeMinion(a)
// {
//     let rect = getRectForTile(a.tx, a.ty);
//     startFX([27, 28, 29, 30], rect.centerx(), rect.centery());
// }

function startFXChangeNumber(tx, ty) {
    // startFXReveal(tx, ty);
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, 1, [114, 115, 116], rect.centerx(), rect.centery()); // TODO: replace
}

function startFXAddOrb(tx, ty) {
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, 2, [20, 21, 22, 23, 24, 25, 26, 27], rect.centerx(), rect.centery()); // TODO: replace
}

function startFXGnomeJumping(tx, ty) {
    let rect = getRectForTile(tx, ty);
    // startFX([27, 28, 29, 30], rect.centerx(), rect.centery() - 5);
    let startFrame = stripXYToFrame(34, 408);
    let frames = [];
    for (let i = 0; i < 14; i++) frames.push(startFrame + i);
    startFX(stripMonsters, 1, frames, rect.centerx(), rect.centery(), 12);
}

function startFXReveal(tx, ty) {
    let rect = getRectForTile(tx, ty);
    // startFX([27, 28, 29, 30], rect.centerx(), rect.centery() - 5);
    startFX(stripFX, 2, [60, 61, 62, 63, 64, 65, 66], rect.centerx(), rect.centery());
}

function startFXDisarmMine(tx, ty) {
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, 2, [10, 11, 12], rect.centerx(), rect.centery() - 5);
}

function startFXAngerMonster(tx, ty) {
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, 2, [70, 71, 72, 73, 74, 75, 76, 77], rect.centerx(), rect.centery() - 5);
}

function startFXDragonDead(tx, ty) {
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, 2, [70, 71, 72, 73, 74, 75, 76, 77], rect.centerx(), rect.centery() - 5);
}

function startFXMineExploding(tx, ty) {
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, 2, [40, 41, 42, 43], rect.centerx(), rect.centery() - 5);
}

function startFXWeakenDragon(tx, ty) {
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, 2, [80, 81, 82, 83, 84], rect.centerx(), rect.centery() - 5);
}

function startFXMonsterHit(rect) {
    startFX(stripFX, 2, [3, 4, 5], rect.centerx(), rect.centery() - 5);
}

function startFXStandard(scale, framesArray, tx, ty) {
    let rect = getRectForTile(tx, ty);
    startFX(stripFX, scale, framesArray, rect.centerx(), rect.centery());
}

function startFX(strip, scale, framesArray, x, y, fps = 10) {
    let a = new PlacedAnimation(strip, framesArray, scale, x, y);
    a.timer.once(framesArray.length, fps);
    state.animationsFX.push(a);
}

function play(sndEventId, volume = 0) {
    if (!soundOn) return;
    let sounds = sndEvents[sndEventId];
    let sound = sounds[rnd(0, sounds.length)];
    if (volume == 0) sound.volume = 0.33;
    else sound.volume = volume;
    sound.play();
    return sound;
}

function grantXP(xp) {
    state.player.xp += xp;
    state.player.score += xp;
}

function makeEmptyAndReveal(a) {
    recursiveReveal(a);
    makeEmpty(a);
}

/** @param {Actor} a*/
function makeEmpty(a) {
    a.reset();
    a.id = ActorId.Empty;
    a.strip = stripMonsters;
    a.stripFrame = 1; // empty sprite
    return a;
}

/** @param {Actor} a*/
function makeDecoration(a, strip, frame) {
    a.reset();
    a.id = ActorId.Decoration;
    a.strip = strip;
    a.stripFrame = frame;
}

/** @param {Actor} a*/
function makeDragon(a) {
    a.reset();
    a.id = ActorId.Dragon;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(200, 311);
    a.deadStripFrame = stripXYToFrame(230, 310);
    a.isMonster = true;
    a.monsterLevel = 13;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeFidel(a) {
    a.reset();
    a.id = ActorId.Fidel;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(0, 408);
    a.isMonster = true;
    a.monsterLevel = 0;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeDragonEgg(a) {
    a.reset();
    a.id = ActorId.DragonEgg;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(0, 250);
    a.deadStripFrame = a.stripFrame + 1;
    a.isMonster = true;
    a.monsterLevel = 0;
    a.xp = 3;
}

/** @param {Actor} a*/
function makeSpellRevealSlimes(a) {
    a.reset();
    a.id = ActorId.SpellRevealSlimes;
    a.strip = stripIcons;
    a.stripFrame = 19;
}

/** @param {Actor} a*/
function makeSpellRevealRats(a) {
    a.reset();
    a.id = ActorId.SpellRevealRats;
    a.strip = stripIcons;
    a.stripFrame = 29;
}

/** @param {Actor} a*/
function makeCrown(a) {
    a.reset();
    a.id = ActorId.Crown;
    a.strip = stripIcons;
    a.stripFrame = 142;//stripXYToFrame(40, 230);
}

/** @param {Actor} a*/
function makeSpellDisarm(a) {
    a.reset();
    a.id = ActorId.SpellDisarm;
    a.strip = stripIcons;
    a.stripFrame = 35;
}

/** @param {Actor} a*/
function makeOrb(a) {
    a.reset();
    a.id = ActorId.Orb;
    a.strip = stripIcons;
    a.stripFrame = 23;
}

/** @param {Actor} a*/
function makeSpellOrb(a) {
    a.reset();
    a.id = ActorId.SpellMakeOrb;
    a.strip = stripIcons;
    a.stripFrame = 10;
}

/** @param {Actor} a*/
function makeMedikit(a) {
    a.reset();
    a.id = ActorId.Medikit;
    // a.strip = stripItems;
    // a.stripFrame = stripXYToFrame(22, 22);
    // a.heal = 4;
    a.strip = stripIcons;
    a.stripFrame = 22;
}

/** @param {Actor} a*/
function makeRatKing(a) {
    a.reset();
    a.id = ActorId.RatKing;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(70, 265);
    a.isMonster = true;
    a.monsterLevel = 5;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeRat1(a) {
    a.reset();
    a.id = ActorId.Rat;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(90, 265);
    a.isMonster = true;
    a.monsterLevel = 1;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeBat2(a) {
    a.reset();
    a.id = ActorId.Bat;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(134, 231);
    a.isMonster = true;
    a.monsterLevel = 2;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeSkeleton3(a) {
    a.reset();
    a.id = ActorId.Skeleton;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(70, 134);
    // a.stripFrame = stripXYToFrame(55, 100);
    // a.stripFrame = stripXYToFrame(250, 230);
    a.isMonster = true;
    a.monsterLevel = 3;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeGuard7(a) {
    a.reset();
    a.id = ActorId.Guard;
    a.strip = stripMonsters;
    // a.stripFrame = stripXYToFrame(70, 134);
    // a.stripFrame = stripXYToFrame(55, 100);
    // a.stripFrame = stripXYToFrame(250, 230); // small snake
    // a.stripFrame = stripXYToFrame(250, 250); // red snake
    // a.stripFrame = stripXYToFrame(233, 231); // drake
    a.stripFrame = stripXYToFrame(200, 200); // drake
    a.isMonster = true;
    a.monsterLevel = 7;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeSnake7(a) {
    a.reset();
    a.id = ActorId.Snake;
    a.strip = stripMonsters;
    // a.stripFrame = stripXYToFrame(70, 134);
    // a.stripFrame = stripXYToFrame(55, 100);
    // a.stripFrame = stripXYToFrame(250, 230); // small snake
    a.stripFrame = stripXYToFrame(250, 250); // red snake
    // a.stripFrame = stripXYToFrame(233, 231); // drake
    a.isMonster = true;
    a.monsterLevel = 7;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeMineKing(a) {
    a.reset();
    a.id = ActorId.MineKing;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(250, 135);
    // a.stripFrame = stripXYToFrame(150+16, 486); // bombucha
    a.isMonster = true;
    a.monsterLevel = 10;
    a.xp = a.monsterLevel;
    return a;
}

// /** @param {Actor} a*/
// function makeDarkKnight7(a)
// {
//     a.reset();
//     a.id = ActorId.DarkKnight;
//     a.strip = stripMonsters;
//     a.stripFrame = stripXYToFrame(200, 100);
//     a.monsterLevel = 7;
//     a.xp = a.monsterLevel;
// }

/** @param {Actor} a*/
function makeGazer(a) {
    a.reset();
    a.id = ActorId.Gazer;
    a.strip = stripMonsters;
    // a.stripFrame = stripXYToFrame(10, 170);
    // a.stripFrame = stripXYToFrame(70, 70);
    a.stripFrame = stripXYToFrame(135, 180);
    a.isMonster = true;
    a.monsterLevel = 5;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeSlime5(a) {
    a.reset();
    a.id = ActorId.Slime;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(86, 473);
    a.isMonster = true;
    a.monsterLevel = 5;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeWizard(a) {
    a.reset();
    a.id = ActorId.Wizard;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(72, 76);
    a.isMonster = true;
    a.monsterLevel = 1;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeBigSlime8(a) {
    a.reset();
    a.id = ActorId.BigSlime;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(120, 455);
    a.isMonster = true;
    a.monsterLevel = 8;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeMinotaur6(a) {
    a.reset();
    a.id = ActorId.Minotaur;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(200, 326);
    // a.stripFrame = stripXYToFrame(180, 170);
    a.isMonster = true;
    a.monsterLevel = 6;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeGargoyle4(a) {
    a.reset();
    a.id = ActorId.Gargoyle;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(26, 210);
    a.isMonster = true;
    a.monsterLevel = 4;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeGiant9(a) {
    a.reset();
    a.id = ActorId.Giant;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(0, 450);
    a.isMonster = true;
    a.monsterLevel = 9;
    a.xp = a.monsterLevel;
}

/** @param {Actor} a*/
function makeGnome(a) {
    a.reset();
    a.id = ActorId.Gnome;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(40, 408);
    a.isMonster = true;
    a.monsterLevel = 0;
    a.xp = 9;
}


// /** @param {Actor} a*/
// function makeDeath9(a)
// {
//     a.reset();
//     a.id = ActorId.Death;
//     a.strip = stripMonsters;
//     a.stripFrame = stripXYToFrame(130, 340);
//     a.monsterLevel = 9;
//     a.xp = a.monsterLevel;
// }

// /** @param {Actor} a*/
// function makeDarkKnight5(a)
// {
//     a.reset();
//     a.id = ActorId.DarkKnight;
//     a.strip = stripMonsters;
//     a.stripFrame = stripXYToFrame(200, 168);
//     a.monsterLevel = 5;
//     a.xp = a.monsterLevel;
// }

// /** @param {Actor} a*/
// function makeEye5(a)
// {
//     a.reset();
//     a.id = ActorId.Eye;
//     a.strip = stripMonsters;
//     a.stripFrame = stripXYToFrame(135, 167);
//     a.monsterLevel = 5;
//     a.xp = a.monsterLevel;
// }

/** @param {Actor} a*/
function makeChest(a) {
    a.reset();
    a.id = ActorId.Chest;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(70, 360);
    a.contains = makeTreasure5;
}

/** @param {Actor} a*/
function makeTreasure1(a) {
    a.reset();
    a.id = ActorId.Treasure;
    a.strip = stripIcons;
    a.stripFrame = 30;
    a.xp = 1;
}

/** @param {Actor} a*/
function makeTreasure3(a) {
    a.reset();
    a.id = ActorId.Treasure;
    a.strip = stripIcons;
    a.stripFrame = 31;
    a.xp = 3;
}

function makeTreasure5(a) {
    a.reset();
    a.id = ActorId.Treasure;
    a.strip = stripIcons;
    a.stripFrame = 24;
    a.xp = 5;
}

/** @param {Actor} a*/
function makeMimic(a) {
    a.reset();
    a.id = ActorId.Mimic;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(70, 360);
    a.isMonster = true;
    a.monsterLevel = 11;
    a.xp = a.monsterLevel;
    a.mimicMimicking = true;
}

/** @param {Actor} a*/
function makeWall(a) {
    a.reset();
    a.id = ActorId.Wall;
    // a.strip = stripIcons;
    // a.stripFrame = stripXYToFrame(70, 7);
    a.strip = stripIcons;
    a.stripFrame = 11;
}

/** @param {Actor} a*/
function makeMine(a) {
    a.reset();
    a.id = ActorId.Mine;
    a.strip = stripMonsters;
    a.stripFrame = stripXYToFrame(150, 455);
    a.deadStripFrame = stripXYToFrame(170, 455);
    a.isMonster = true;
    a.monsterLevel = 100;
    a.xp = 3;
}

function getAttackNumber(tx, ty) {
    let ret = 0;
    for (let a of getNeighborsWithDiagonals(tx, ty)) {
        if (a.monsterLevel > 0/* && !a.defeated*/) {
            ret += a.monsterLevel;
        }
    }
    return ret;
}

// Solver code

const SOLVER_WANTS_TO_LEVEL_UP_ACTOR_INDEX = -47;

function solverLog(msg) {
    if (solverLoggingOn) {
        console.log(msg);
    }
}

function solverLogError(msg) {
    console.error(msg);
    solverTesting = false;
}

function isHiddenByGazer(actor) {
    return (state.actors.find(b => b.id == ActorId.Gazer && !b.defeated && distance(b.tx, b.ty, actor.tx, actor.ty) <= 2) != undefined);
}

function showsGazerQuestionmark(actor) {
    return actor.revealed && isEmpty(actor) && isHiddenByGazer(actor);
}

function looksLikeClosedChest(actor) {
    return actor.revealed && (actor.id == ActorId.Chest || actor.mimicMimicking);
}

function getVisibleAttackNumber(actor) {
    if (!actor.revealed || !isEmpty(actor)) {
        return null;
    }

    if (isHiddenByGazer(actor)) {
        return null;
    }

    return getAttackNumber(actor.tx, actor.ty);
}

class KnownGameStateGridSquare {
    constructor(tx, ty) {
        this.possibleActors = [];
        this.tx = tx;
        this.ty = ty;
        this.wallNeighborFound = false;
        this.was = null;
        this.wasWhatWeThought = false;
        this.neighborMinesPopulated = false;
        this.lookedLikeClosedChest = false;
    }

    couldBe(actorId) {
        return this.possibleActors.find((a) => a.id == actorId) != undefined;
    }

    isOrWas(actorId) {
        return this.was == actorId || this.knownActor() == actorId;
    }

    couldBeOrWas(actorId) {
        return this.was == actorId || this.couldBe(actorId);
    }

    removePossibleActor(actorId) {
        this.possibleActors = this.possibleActors.filter((a) => a.id != actorId);
    }

    knownPower() {
        if (!this.possibleActors.every((actor) => actor.monsterLevel == this.possibleActors[0].monsterLevel)) {
            return null;
        }
        if (this.possibleActors.length == 0) {
            solverLogError(`ERROR: empty possible actors list at ${this.ty}, ${this.tx}`);
        }
        return this.possibleActors[0].monsterLevel;
    }

    bestCasePower() {
        return Math.min(...this.possibleActors.map((a) => a.monsterLevel));
    }

    worstCasePower() {
        return Math.max(...this.possibleActors.map((a) => a.monsterLevel));
    }

    worstCaseNonminePower() {
        return Math.max(...this.possibleActors.map((a) => a.monsterLevel % 100));
    }

    knownActor() {
        if (this.possibleActors.length == 1) {
            return this.possibleActors[0].id;
        }
        return null;
    }

    isXp() {
        let a = getActorAt(this.tx, this.ty);
        return a.revealed && a.isMonster && a.defeated && a.xp > 0;
    }

    isSpell() {
        return this.possibleActors.every((a) => a.id == ActorId.Orb || a.id == ActorId.SpellDisarm || a.id == ActorId.SpellMakeOrb || a.id == ActorId.SpellRevealRats || a.id == ActorId.SpellRevealSlimes);
    }

    survivalProbability() {
        return this.possibleActors.filter((a) => a.monsterLevel <= state.player.hp - 1).length / this.possibleActors.length;
    }
}

function constructInitialGrid() {
    let grid = [];
    for (let i = 0; i < state.gridH; i++) {
        grid[i] = [];
        for (let k = 0; k < state.gridW; k++) {
            grid[i][k] = new KnownGameStateGridSquare(k, i);
        }
    }

    // Could be anywhere
    for (let actorId of [ActorId.Bat, ActorId.Chest, ActorId.Empty, ActorId.Gnome, ActorId.Medikit, ActorId.Gargoyle, ActorId.Gazer, ActorId.Mimic, ActorId.Mine, ActorId.Minotaur, ActorId.Rat, ActorId.RatKing, ActorId.Skeleton, ActorId.Slime, ActorId.Wall]) {
        for (let i = 0; i < state.gridH; i++) {
            for (let k = 0; k < state.gridW; k++) {
                grid[i][k].possibleActors.push(makeActor(actorId));
            }
        }
    }
    // Dragon: Middle
    grid[4][Math.floor(state.gridW / 2)].possibleActors = [makeActor(ActorId.Dragon)];

    // DragonEgg: around dragon
    for (let dy = -1; dy <= 1; ++dy) {
        for (let dx = -1; dx <= 1; ++dx) {
            if (!dx && !dy) {
                continue;
            }
            grid[4 + dy][Math.floor(state.gridW / 2) + dx].possibleActors.push(makeActor(ActorId.DragonEgg));
        }
    }

    // MineKing: corners
    grid[0][0].possibleActors.push(makeActor(ActorId.MineKing));
    grid[0][state.gridW - 1].possibleActors.push(makeActor(ActorId.MineKing));
    grid[state.gridH - 1][0].possibleActors.push(makeActor(ActorId.MineKing));
    grid[state.gridH - 1][state.gridW - 1].possibleActors.push(makeActor(ActorId.MineKing));

    // Giant: not central column
    // Guard: not central column or row
    for (let i = 0; i < state.gridH; i++) {
        const isCentralRow = (i == 4);
        for (let k = 0; k < state.gridW; k++) {
            const isCentralCol = (k == Math.floor(state.gridW / 2));

            if (!isCentralCol) {
                grid[i][k].possibleActors.push(makeActor(ActorId.Giant));
            }

            if (!isCentralCol && !isCentralRow) {
                grid[i][k].possibleActors.push(makeActor(ActorId.Guard));
            }
        }
    }

    // Wizard: Edge, not corner
    for (let i = 1; i < state.gridH - 1; i++) {
        grid[i][0].possibleActors.push(makeActor(ActorId.Wizard));
        grid[i][state.gridW - 1].possibleActors.push(makeActor(ActorId.Wizard));
    }
    for (let k = 1; k < state.gridW - 1; k++) {
        grid[0][k].possibleActors.push(makeActor(ActorId.Wizard));
        grid[state.gridH - 1][k].possibleActors.push(makeActor(ActorId.Wizard));
    }

    // BigSlime: Edge or 1 from Edge
    for (let i = 0; i < state.gridH; i++) {
        grid[i][0].possibleActors.push(makeActor(ActorId.BigSlime));
        grid[i][1].possibleActors.push(makeActor(ActorId.BigSlime));
        grid[i][state.gridW - 1].possibleActors.push(makeActor(ActorId.BigSlime));
        grid[i][state.gridW - 2].possibleActors.push(makeActor(ActorId.BigSlime));
    }
    for (let k = 2; k < state.gridW - 2; k++) {
        grid[0][k].possibleActors.push(makeActor(ActorId.BigSlime));
        grid[1][k].possibleActors.push(makeActor(ActorId.BigSlime));
        grid[state.gridH - 1][k].possibleActors.push(makeActor(ActorId.BigSlime));
        grid[state.gridH - 2][k].possibleActors.push(makeActor(ActorId.BigSlime));
    }

    return grid;
}

class KnownGameState {
    constructor() {
        this.grid = constructInitialGrid();
        this.mimicFound = false;
        this.loversFound = false;
        this.guardFound = [[false, false], [false, false]];
        this.bigSlimesFound = false;
        this.dragonEggFound = false;
        this.mineKingFound = false;
        this.ratKingFound = false;
        this.wizardFound = false;
        this.minesDisarmed = false;
        // How many tiles we can have a wizard in.
        // Used as optimization to not clear over and over.
        this.wizardClearedExcept = 1000;
        // at end of update, remove each entity from below list
        // from possible actors, unless it is exactly it
        this.revealedBySpells = [];
        this.turn5IntoRatKing = false;
        this.allRevealed = false;
        this.lastUpdatePossibilities = 0;
        this.lastUpdateWasMeaningful = true;
    }

    totalPossibilities() {
        let ret = 0;
        for (let y = 0; y < state.gridH; ++y) {
            for (let x = 0; x < state.gridW; ++x) {
                ret += this.grid[y][x].possibleActors.length;
            }
        }
        return ret;
    }

    stableKnowledge() {
        return !this.lastUpdateWasMeaningful;
    }

    disarmMines() {
        this.minesDisarmed = true;
        solverLog("Disarming mines");
        for (let i = 0; i < state.gridH; ++i) {
            for (let k = 0; k < state.gridW; ++k) {
                if (knownGameState.grid[i][k].knownActor() == ActorId.Mine) {
                    knownGameState.grid[i][k].possibleActors = [makeActor(ActorId.Treasure)];
                }
                else knownGameState.grid[i][k].removePossibleActor(ActorId.Mine);
                knownGameState.grid[i][k].removePossibleActor(ActorId.MineKing);
            }
        }
    }

    // Assumes chest-like object is revealed at tx,ty
    couldBeChest(tx, ty) {
        // Dumb impl, true unless we know the mimic is here
        if (this.mimicFound) {
            return this.mimicFound[0] != ty || this.mimicFound[1] != tx;
        }
        return this.grid[ty][tx].couldBe(ActorId.Chest);
    }

    // Assumes chest-like object is revealed at tx,ty
    couldBeMimic(tx, ty) {
        // Dumb impl
        if (this.mimicFound) {
            return this.mimicFound[0] == ty && this.mimicFound[1] == tx;
        }
        return this.grid[ty][tx].couldBe(ActorId.Mimic);
    }

    clearWizard(except) {
        if (this.wizardClearedExcept <= except.length) {
            return;
        }
        this.wizardClearedExcept = except.length;
        solverLog(`Clearing out wizard possibility from the grid except ${except}`);
        for (let y = 0; y < state.gridH; ++y) {
            for (let x = 0; x < state.gridW; ++x) {
                if (except.find((e) => e[0] == y && e[1] == x) == undefined) {
                    this.grid[y][x].removePossibleActor(ActorId.Wizard);
                }
            }
        }
    }

    foundWizard(tx, ty) {
        solverLog(`Found wizard at ${ty}, ${tx}`);
        this.wizardFound = true;
        this.grid[ty][tx].possibleActors = [makeActor(ActorId.Wizard)];
        this.clearWizard([[ty, tx]]);
        for (let n of getNeighborsWithDiagonals(tx, ty)) {
            if (!n.revealed && this.grid[n.ty][n.tx].knownActor() != ActorId.BigSlime) {
                solverLog(`Wizard reveals big slime at ${n.ty} ${n.tx}`);
                this.grid[n.ty][n.tx].possibleActors = [makeActor(ActorId.BigSlime)];
            }
        }
    }

    // Try to identify the wizard using bigSlimes
    // Honestly, it's a bit jank, and leaves a lot of room for improvement. But in most games, this should do ok.
    // Struggles more when the formation is in a corner.
    huntForWizard() {
        let bigSlimes = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].isOrWas(ActorId.BigSlime));

        if (bigSlimes.length == 0) {
            return;
        }

        // wizard needs to be neighbor of all slimes
        let intersectionWizards = undefined;
        for (let s of bigSlimes) {
            const sx = s.tx
            const sy = s.ty

            if (intersectionWizards == undefined) {
                intersectionWizards = getNeighborsWithDiagonals(sx, sy);
            }
            else {
                intersectionWizards = intersectionWizards.filter((w) => distance(w.tx, w.ty, sx, sy) > 0 && distance(w.tx, w.ty, sx, sy) < 2);
            }
        }

        intersectionWizards = intersectionWizards.filter((w) => isEdge(w.tx, w.ty) && knownGameState.grid[w.ty][w.tx].couldBe(ActorId.Wizard));

        if (intersectionWizards.length == 0) {
            solverLogError(`ERROR: apparently there is no cross-section of slime neighbors that can be wizard.`);
        }
        else if (intersectionWizards.length == 1) {
            const ty = intersectionWizards[0].ty;
            const tx = intersectionWizards[0].tx;
            solverLog(`Intersection of all slime neighbors yields only one possible wizard ${ty} ${tx}`);
            this.foundWizard(tx, ty);
            return;
        }
        else {
            this.clearWizard(intersectionWizards.map((a) => [a.ty, a.tx]));
        }

        let edgeSlimes = bigSlimes.filter((s) => isEdge(s.tx, s.ty));
        let adjSlimes = bigSlimes.filter((s) => isCloseToEdge(s.tx, s.ty) && !isEdge(s.tx, s.ty));

        if (edgeSlimes.length == 1) {
            const sy = edgeSlimes[0].ty;
            const sx = edgeSlimes[0].tx;

            // problem when wizard is in corner and this could be an adj-slime.
            if (sx != 1 && sx != state.gridW - 2 && sy != 1 && sy != state.gridH - 2) {

                let plausibleTwinSquares = state.actors.filter((a) => isEdge(a.tx, a.ty) && Math.abs(a.tx - sx) + Math.abs(a.ty - sy) == 2);
                let possibleTwins = plausibleTwinSquares.filter((a) => knownGameState.grid[a.ty][a.tx].couldBeOrWas(ActorId.BigSlime));

                if (possibleTwins.length == 1) {
                    // wizard must be between the two slimes
                    const twinx = possibleTwins[0].tx;
                    const twiny = possibleTwins[0].ty;
                    const tx = Math.floor((sx + twinx) / 2);
                    const ty = Math.floor((sy + twiny) / 2);
                    solverLog(`Edge slime at ${sy} ${sx} has only one candidate twin ${twiny} ${twinx}`);
                    this.foundWizard(tx, ty);
                    solverStats.features.edgeSlimeDetections++;
                    return;
                }

                let plausibleWizards = getNeighborsWithDiagonals(sx, sy).filter((a) => isEdge(a.tx, a.ty));
                let possibleWizards = plausibleWizards.filter((a) => knownGameState.grid[a.ty][a.tx].couldBe(ActorId.Wizard));
                if (possibleWizards.length == 1) {
                    // only 1 place for the wizard
                    const ty = possibleWizards[0].ty;
                    const tx = possibleWizards[0].tx;
                    solverLog(`Edge slime at ${sy} ${sx} has only one possible wizard ${ty} ${tx}`);
                    this.foundWizard(tx, ty);
                    solverStats.features.edgeSlimeDetections++;
                    return;
                }
                else {
                    let wizardCoords = possibleWizards.map((a) => [a.ty, a.tx]);
                    this.clearWizard(wizardCoords);
                }
            }
        }

        for (let s of adjSlimes) {
            let neiAdj = getNeighborsCross(s.tx, s.ty).filter((a) => !isEdge(a.tx, a.ty) && isCloseToEdge(a.tx, a.ty));
            let neiAdjSlimes = neiAdj.filter((a) => knownGameState.grid[a.ty][a.tx].couldBeOrWas(ActorId.BigSlime));
            if (neiAdjSlimes.length == 1) {
                let n = neiAdjSlimes[0];
                if (!n.revealed && knownGameState.grid[n.ty][n.tx].knownActor() != ActorId.BigSlime) {
                    solverLog(`Non-edge slime ${s.ty} ${s.tx} can only have non-edge slime neighbor on ${n.ty} ${n.tx}`);
                    solverStats.features.adjSlimeDetections++;
                    knownGameState.grid[n.ty][n.tx].possibleActors = [makeActor(ActorId.BigSlime)];
                }
                let dx = n.tx - s.tx;
                let dy = n.ty - s.ty;

                let nnx = n.tx + dx;
                let nny = n.ty + dy;

                if ((s.tx != 1 && s.tx != state.gridW - 2) || (s.ty != 1 && s.ty != state.gridH - 2)) {
                    if (!getActorAt(nnx, nny).revealed && knownGameState.grid[nny][nnx].knownActor() != ActorId.BigSlime) {

                        solverLog(`Non-edge non-corner slime ${s.ty} ${s.tx} can only have slime step-neighbor on ${nny} ${nnx}`);
                        solverStats.features.adjSlimeDetections++;
                        knownGameState.grid[nny][nnx].possibleActors = [makeActor(ActorId.BigSlime)];
                    }
                }
                else { // corner adj slime could be the middle one
                    let onx = n.tx - 2 * dx;
                    let ony = n.ty - 2 * dy

                    let can_nn = knownGameState.grid[nny][nnx].couldBeOrWas(ActorId.BigSlime);
                    let can_on = knownGameState.grid[ony][onx].couldBeOrWas(ActorId.BigSlime);

                    if (can_nn ^ can_on) {
                        let x = can_nn ? nnx : onx;
                        let y = can_nn ? nny : ony;
                        if (!getActorAt(x, y).revealed && knownGameState.grid[y][x].knownActor() != ActorId.BigSlime) {
                            solverLog(`Non-edge corner slime ${s.ty} ${s.tx} will have other neighbor ${y} ${x}, because edge neighbor is ${can_on} and step-neighbor is ${can_nn}`);
                            solverStats.features.adjSlimeDetections++;
                            knownGameState.grid[y][x].possibleActors = [makeActor(ActorId.BigSlime)];
                        }
                    }
                }
            }
        }
    }

    // Tries to guess where the gazer is
    guessGazer() {
        let possibleGazers = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].couldBe(ActorId.Gazer));
        let mostQuestionMarks = 0;
        let bestGazers = [];

        for (let g of possibleGazers) {
            if (state.actors.find((a) => distance(a.tx, a.ty, g.tx, g.ty) <= 2 && getVisibleAttackNumber(a) != null) != undefined) {
                continue;
            }
            const questionMarks = state.actors.filter((a) => distance(a.tx, a.ty, g.tx, g.ty) <= 2 && showsGazerQuestionmark(a)).length;
            if (questionMarks > mostQuestionMarks) {
                mostQuestionMarks = questionMarks;
                bestGazers = [g];
            }
            else if (questionMarks == mostQuestionMarks) {
                bestGazers.push(g);
            }
        }

        if (mostQuestionMarks < 4) {
            return null;
        }

        // don't guess the gazer if multiple ones explain the same ?s
        for (let g of bestGazers) {
            let unique = true;
            const questionMarks = state.actors.filter((a) => distance(a.tx, a.ty, g.tx, g.ty) <= 2 && showsGazerQuestionmark(a))
            for (let other of bestGazers) {
                if (other.ty == g.ty && other.tx == g.tx) {
                    continue;
                }
                const diff = questionMarks.find(a => distance(a.tx, a.ty, other.tx, other.y) > 2);

                if (diff == undefined) {
                    unique = false;
                    // solverLog(`Possible gazer ${g.ty} ${g.tx} covers the same ? as ${other.ty} ${other.tx}, not guessing it`);
                    break;
                }

            }
            if (unique) {
                solverLog(`Guessing gazer at ${g.ty}, ${g.tx} because it matches ${mostQuestionMarks} question marks that no other does`);
                return getActorIndexAt(g.tx, g.ty);
            }
        }
        return null;
    }

}

class EndOfGameStats {
    constructor() {
        this.won = false;
        this.cleared = false;
        this.score = 0;
        this.damageToGo = 0;
        this.hpLeftOver = -1; // only iff cleared
    }
}

function computeEndOfGameStats() {
    stats = new EndOfGameStats();
    stats.score = state.player.score;
    stats.won = state.status == GameStatus.WinScreen;
    stats.cleared = state.player.score == state.stats.totalXP;
    stats.damageToGo = state.actors.reduce((acc, v) => { return acc + (v.monsterLevel % 100) + v.wallHP; }, 0);
    if (stats.cleared) {
        stats.hpLeftOver = state.player.hp - 1;
    }
    return stats;
}

class SolverFeatures {
    constructor() {
        this.edgeSlimeDetections = 0;
        this.adjSlimeDetections = 0;
        this.gargoylesSpotted = 0;
        this.minotaursSpottingChests = 0;
        this.chestsSpottingMinotaurs = 0;
        this.mimicsFoundByMinotaurs = 0;
        this.deducedOddOneOut = 0;
        this.deducedUpperBound = 0;
        this.deducedOddMineOut = 0;
        this.mineKingGuesses = 0;
        this.panicking = 0;
    }
}

class SolverStats {
    constructor() {
        this.endStats = new EndOfGameStats();
        this.tookRisk = false;
        this.freeActions = 0;
        this.nonfreeActions = 0;
        this.mineKingOpportunitiesMissed = 0;
        this.earlyWallHits = 0;
        this.seed = -1;
        this.features = new SolverFeatures();
    }

    computeEndStats() {
        this.endStats = computeEndOfGameStats();
    }
}


function updateSolverTestingStats() {
    solverStats.computeEndStats();
    solverTestingStats.push(solverStats);
}


function updateKnownGameState() {

    // we know where revealed things are
    // chest can be a mimic and vice-versa
    for (let a of state.actors) {
        if (!a.revealed) {
            continue;
        }

        if (!knownGameState.grid[a.ty][a.tx].wasWhatWeThought && knownGameState.grid[a.ty][a.tx].knownActor() != null) {
            if (!knownGameState.grid[a.ty][a.tx].couldBe(a.id)) {
                let okToBeWrong = (a.id == ActorId.Orb || a.id == ActorId.SpellMakeOrb) || (a.id == ActorId.Mine && knownGameState.minesDisarmed);
                if (!okToBeWrong) {
                    solverLogError(`ERROR: thought ${a.ty} ${a.tx} could be ${knownGameState.grid[a.ty][a.tx].possibleActors.map((a) => a.id)}, but it is ${a.id}`);
                }
            }
            knownGameState.grid[a.ty][a.tx].wasWhatWeThought = true;
        }

        if (a.id == ActorId.DragonEgg) {
            knownGameState.dragonEggFound = true;
        }

        if (a.id == ActorId.ratKing) {
            knownGameState.ratKingFound = true;
        }

        // Chests clicked before we know if they were mimics or not turn into treasure/medikit.
        // But we want to note that they were chests, actually
        if (knownGameState.grid[a.ty][a.tx].lookedLikeClosedChest && (a.id == ActorId.Treasure || a.id == ActorId.Medikit)) {
            knownGameState.grid[a.ty][a.tx].was = ActorId.Chest;
        }

        if (a.id != ActorId.Chest && a.id != ActorId.Mimic) {
            knownGameState.grid[a.ty][a.tx].possibleActors = [a];
            continue;
        }

        knownGameState.grid[a.ty][a.tx].lookedLikeClosedChest = true;

        // if we know where the mimic is, we know if this is a mimic or chest
        if (knownGameState.mimicFound) {
            if (knownGameState.mimicFound[0] == a.ty && knownGameState.mimicFound[1] == a.tx) {
                if (a.id != ActorId.Mimic) {
                    solverLogError(`ERROR: at ${a.ty} ${a.tx} should be mimic, but there is ${a.id}`);
                }
                knownGameState.grid[a.ty][a.tx].possibleActors = [a];
            }
            else {
                if (a.id == ActorId.Mimic) {
                    solverLogError(`ERROR: believe to have found mimic at ${knownGameState.mimicFound}, but he is at ${a.ty} ${a.tx}`);
                }
                knownGameState.grid[a.ty][a.tx].possibleActors = [a];
            }
        }
        else {
            knownGameState.grid[a.ty][a.tx].possibleActors = knownGameState.grid[a.ty][a.tx].possibleActors.filter((a) => a.id == ActorId.Chest || a.id == ActorId.Mimic);
            if (!knownGameState.couldBeChest(a.tx, a.ty)) {
                knownGameState.grid[a.ty][a.tx].removePossibleActor(ActorId.Chest);
            }
            if (!knownGameState.couldBeMimic(a.tx, a.ty))
                knownGameState.grid[a.ty][a.tx].removePossibleActor(ActorId.Mimic);
        }

    }

    // if we have a number tile (with visible number)
    // and the known actors surrounding it sum up to that number
    // then all other tiles around it are zeroes
    for (let i = 0; i < state.actors.length; i++) {
        let a = state.actors[i];

        let number = getVisibleAttackNumber(a);

        if (number == null) {
            continue;
        }

        let knownNumber = 0;
        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            const knownPower = knownGameState.grid[n.ty][n.tx].knownPower();
            if (knownPower != null) {
                knownNumber += knownPower;
            }
        }

        if (number != knownNumber) {
            continue;
        }

        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            if (!n.revealed && knownGameState.grid[n.ty][n.tx].knownPower() == null) {
                // must shove in things with power 0, so we don't make bad inferences about it e.g. find bad wall neighbor, think we can't have dragon egg
                knownGameState.grid[n.ty][n.tx].possibleActors = [makeActor(ActorId.Empty), makeActor(ActorId.Wall), makeActor(ActorId.Chest), makeActor(ActorId.Medikit), makeActor(ActorId.DragonEgg), makeActor(ActorId.Gnome)];
            }
        }
    }

    // if we have a number tile with 1 neighbor with unknown power, then we can compute its power
    for (let i = 0; i < state.actors.length; i++) {
        let a = state.actors[i];

        let number = getVisibleAttackNumber(a);

        if (number == null) {
            continue;
        }

        const unknown_neighs = getNeighborsWithDiagonals(a.tx, a.ty).filter((a) => knownGameState.grid[a.ty][a.tx].knownPower() == null);

        if (unknown_neighs.length != 1) {
            continue;
        }
        // unknown power neighbor
        let u = unknown_neighs[0];

        let knownPower = 0;
        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            let nPower = knownGameState.grid[n.ty][n.tx].knownPower();
            if (nPower != null) {
                knownPower += nPower;
            }
        }

        const missingPower = number - knownPower;
        knownGameState.grid[u.ty][u.tx].possibleActors = knownGameState.grid[u.ty][u.tx].possibleActors.filter((a) => a.monsterLevel == missingPower);
    }

    // if we have a chest where only mimic can be, we found him
    if (!knownGameState.mimicFound) {

        // chest without minotaur around is mimic
        for (let a of state.actors.filter((a) => looksLikeClosedChest(a) && knownGameState.grid[a.ty][a.tx].couldBe(ActorId.Mimic))) {
            let mino_neigh = getNeighborsWithDiagonals(a.tx, a.ty).find((n) => knownGameState.grid[n.ty][n.tx].couldBeOrWas(ActorId.Minotaur));
            if (mino_neigh == undefined) {
                solverLog(`Chest at ${a.ty} ${a.tx} is mimic because no minotaur neighbor`);
                solverStats.features.mimicsFoundByMinotaurs++;
                knownGameState.grid[a.ty][a.tx].possibleActors = [makeActor(ActorId.Mimic)];
            }
        }

        for (let i = 0; i < state.actors.length; i++) {
            let a = state.actors[i];

            if (knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Mimic) {
                solverLog(`Found mimic at ${a.ty}, ${a.tx}`);
                knownGameState.mimicFound = [a.ty, a.tx];
                for (let y = 0; y < state.gridH; ++y) {
                    for (let x = 0; x < state.gridW; ++x) {
                        if (y != a.ty || x != a.tx) {
                            knownGameState.grid[y][x].removePossibleActor(ActorId.Mimic);
                        }
                    }
                }
            }
        }
    }

    // if we found a lover, we found them both
    if (!knownGameState.loversFound) {
        for (let a of state.actors) {
            if (knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Giant) {
                solverLog(`Found lover at ${a.ty}, ${a.tx}`);
                const other_x = state.gridW - a.tx - 1;
                solverLog(`So other lover is at ${a.ty}, ${other_x}`);
                knownGameState.loversFound = true;

                knownGameState.grid[a.ty][other_x].possibleActors = [makeActor(ActorId.Giant)];

                for (let i = 0; i < state.gridH; i++) {
                    for (let k = 0; k < state.gridW; k++) {
                        if (i != a.ty || (k != a.tx && k != other_x)) {
                            knownGameState.grid[i][k].removePossibleActor(ActorId.Giant);
                        }
                    }
                }
            }
            else if (!knownGameState.grid[a.ty][a.tx].couldBe(ActorId.Giant)) {
                // mirror cannot be Giant
                knownGameState.grid[a.ty][state.gridW - a.tx - 1].removePossibleActor(ActorId.Giant);
            }
        }
    }

    // Gargoyles face each other. We can find the twin if we see one.
    for (let a of state.actors) {
        if (a.id != ActorId.Gargoyle) { continue; }
        if (a.revealed) {
            const twinx = a.tx + [0, 1, 0, -1][a.facingDirection];
            const twiny = a.ty + [-1, 0, 1, 0][a.facingDirection];
            if (!getActorAt(twinx, twiny).revealed) {
                knownGameState.grid[twiny][twinx].possibleActors = [makeActor(ActorId.Gargoyle)];
            }
        }
        else if (knownGameState.grid[a.ty][a.tx].isOrWas(ActorId.Gargoyle)) {
            // Even if we don't see it, there might only be one option
            let twins = getNeighborsCross(a.tx, a.ty).filter((a) => knownGameState.grid[a.ty][a.tx].couldBeOrWas(ActorId.Gargoyle));
            if (twins.length == 1) {
                let twin = twins[0];
                if (knownGameState.grid[twin.ty][twin.tx].knownActor() == null) {
                    solverLog(`Gargoyle at ${a.ty} ${a.tx} has only one twin option left: ${twin.ty} ${twin.tx}`);
                    knownGameState.grid[twin.ty][twin.tx].possibleActors = [makeActor(ActorId.Gargoyle)];
                    solverStats.features.gargoylesSpotted++;
                }
            }
        }
    }

    // Remove possible actors who are too big for some neighboring number
    for (let a of state.actors) {
        let number = getVisibleAttackNumber(a);
        if (number == null) {
            continue;
        }

        let knownPower = 0;
        let knownCreaturePower = 0;
        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            let nPower = knownGameState.grid[n.ty][n.tx].knownPower();
            if (nPower == null) {
                nPower = knownGameState.grid[n.ty][n.tx].bestCasePower();
            }

            knownPower += nPower;
            if (nPower != 100) {
                knownCreaturePower += nPower;
            }

        }

        const missingPower = number - knownPower;
        const missingCreaturePower = (number % 100) - knownCreaturePower;

        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            if (knownGameState.grid[n.ty][n.tx].knownPower() != null) {
                continue;
            }

            const missingWithoutMe = missingPower + knownGameState.grid[n.ty][n.tx].bestCasePower();
            // %100 should be redundant, because bestCasePower = 100 <-> we know it's a mine, but hey
            const missingCreatureWithoutMe = missingCreaturePower + (knownGameState.grid[n.ty][n.tx].bestCasePower() % 100);

            knownGameState.grid[n.ty][n.tx].possibleActors = knownGameState.grid[n.ty][n.tx].possibleActors.filter((a) => a.monsterLevel <= missingWithoutMe);
            knownGameState.grid[n.ty][n.tx].possibleActors = knownGameState.grid[n.ty][n.tx].possibleActors.filter((a) => a.monsterLevel >= 100 || a.monsterLevel <= missingCreatureWithoutMe);
        }
    }

    // Remove possible actors who are too small for some neighboring number
    for (let a of state.actors) {
        let number = getVisibleAttackNumber(a);
        if (number == null) {
            continue;
        }

        let knownPower = 0;
        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            let nPower = knownGameState.grid[n.ty][n.tx].knownPower();
            if (nPower != null) {
                knownPower += nPower;
            }
        }

        const missingCreaturePower = (number - knownPower) % 100;
        let atMostCreaturePower = 0;
        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            if (knownGameState.grid[n.ty][n.tx].knownPower() == null) {
                atMostCreaturePower += knownGameState.grid[n.ty][n.tx].worstCaseNonminePower();
            }
        }

        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            if (n.revealed || knownGameState.grid[n.ty][n.tx].knownPower() != null) {
                continue;
            }

            let atMostCreaturePowerWithoutMe = atMostCreaturePower - knownGameState.grid[n.ty][n.tx].worstCaseNonminePower();
            let needAtLeastThisCreaturePower = missingCreaturePower - atMostCreaturePowerWithoutMe;

            knownGameState.grid[n.ty][n.tx].possibleActors = knownGameState.grid[n.ty][n.tx].possibleActors.filter((a) => a.monsterLevel >= needAtLeastThisCreaturePower);
        }
    }

    // Walls with no wall neighbor and last remaining diagonal neighbor -> wall
    for (let a of state.actors) {
        if (knownGameState.grid[a.ty][a.tx].isOrWas(ActorId.Wall) && !knownGameState.grid[a.ty][a.tx].wallNeighborFound) {
            let neighs = getNeighborsCross(a.tx, a.ty);
            if (neighs.filter((n) => knownGameState.grid[n.ty][n.tx].isOrWas(ActorId.Wall)).length) {
                knownGameState.grid[a.ty][a.tx].wallNeighborFound = true;
                continue;
            }
            let unknown_neighs = neighs.filter((n) => knownGameState.grid[n.ty][n.tx].couldBe(ActorId.Wall));

            if (unknown_neighs.length != 1) {
                continue;
            }
            let n = unknown_neighs[0];
            solverLog(`Wall ${a.ty}, ${a.tx} found neighbor at ${n.ty}, ${n.tx}`);
            knownGameState.grid[a.ty][a.tx].wallNeighborFound = true;
            knownGameState.grid[n.ty][n.tx].wallNeighborFound = true;
            knownGameState.grid[n.ty][n.tx].possibleActors = [makeActor(ActorId.Wall)];
        }
    }

    // Check, for each clue that shows a hidden mine, if there are exactly the number of spots for the required mines
    for (let a of state.actors) {
        if (knownGameState.grid[a.ty][a.tx].neighborMinesPopulated) {
            continue;
        }
        let hintedPower = getVisibleAttackNumber(a);
        if (hintedPower == null || hintedPower < 100) {
            continue;
        }

        const numMines = Math.floor(hintedPower / 100);
        const possibleMineNeighs = getNeighborsWithDiagonals(a.tx, a.ty).filter((n) => knownGameState.grid[n.ty][n.tx].couldBe(ActorId.Mine));

        if (possibleMineNeighs.length == numMines) {
            solverLog(`Need ${numMines} mines around ${a.ty}, ${a.tx} and exactly as many spots!`);
            knownGameState.grid[a.ty][a.tx].neighborMinesPopulated = true;
            for (let n of possibleMineNeighs) {
                knownGameState.grid[n.ty][n.tx].possibleActors = [makeActor(ActorId.Mine)];
            }
        }
    }

    // Clear out guardians from each respective quadrant if we have found one
    for (let a of state.actors) {
        if (knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Guard) {
            const xq = Number(a.tx > 6);
            const yq = Number(a.ty > 4);
            if (knownGameState.guardFound[yq][xq]) {
                continue;
            }

            solverLog(`Found guard in quadrant y=${yq} x=${xq}`);

            for (let x = xq * 7; x < xq * 7 + 6; ++x) {
                for (let y = yq * 5; y < yq * 5 + 4 + yq; ++y) {
                    if (x != a.tx || y != a.ty) {
                        knownGameState.grid[y][x].removePossibleActor(ActorId.Guard);
                    }
                }
            }

            knownGameState.guardFound[yq][xq] = true;
        }
    }

    // Clear out big slimes which are too far away from reality
    if (!knownGameState.bigSlimesFound) {
        for (let a of state.actors) {
            if (knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.BigSlime) {
                solverLog(`Spotted a big slime, clearing out far away squares`);
                knownGameState.bigSlimesFound = true;
                for (let i = 0; i < state.gridH; ++i) {
                    for (let k = 0; k < state.gridW; ++k) {
                        if (distance(a.ty, a.tx, i, k) > 2.25) {
                            knownGameState.grid[i][k].removePossibleActor(ActorId.BigSlime);
                        }
                    }
                }
            }
        }
    }

    // Remove possibility of revealed entities from spaces which don't contain them
    for (let revealed of knownGameState.revealedBySpells) {
        solverLog(`Cleaning out non-revealed instances of ${revealed}`);
        for (let y = 0; y < state.gridH; y++) {
            for (let x = 0; x < state.gridW; x++) {
                if (knownGameState.grid[y][x].knownActor() != revealed) {
                    knownGameState.grid[y][x].removePossibleActor(revealed);
                }
            }
        }

        if (revealed == ActorId.Slime && !knownGameState.ratKingFound) {
            knownGameState.turn5IntoRatKing = true;
        }
    }
    knownGameState.revealedBySpells = [];

    // if we revealed slimes, and have not found rat king yet, try to spot him
    if (!knownGameState.ratKingFound && knownGameState.turn5IntoRatKing) {
        let candidate = state.actors.find((a) => !a.revealed && knownGameState.grid[a.ty][a.tx].knownPower() == 5 && knownGameState.grid[a.ty][a.tx].knownActor() != ActorId.Gazer);
        if (candidate != undefined) {
            solverLog(`Slimes have been cleared and we found a 5, so it's the rat king: ${candidate.ty} ${candidate.tx}`);
            knownGameState.grid[candidate.ty][candidate.tx].possibleActors = [makeActor(ActorId.RatKing)];
            knownGameState.ratKingFound = true;
            knownGameState.turn5IntoRatKing = false;
        }
    }

    // If we haven't found the dragon's egg, and there is only one adjacent square next to the dragon left, that's it.
    if (!knownGameState.dragonEggFound) {
        let neighs = getNeighborsWithDiagonals(Math.floor(state.gridW / 2), 4);
        let canEgg = neighs.filter((n) => knownGameState.grid[n.ty][n.tx].couldBe(ActorId.DragonEgg));
        if (canEgg.length == 1) {
            let n = canEgg[0];
            solverLog(`Found the dragon egg at ${n.ty} ${n.tx}`);
            knownGameState.grid[n.ty][n.tx].possibleActors = [makeActor(ActorId.DragonEgg)];
        }
    }

    // If we haven't found the MineKing, and there is only one square left for him, he's there
    if (!knownGameState.mineKingFound) {
        let corners = [knownGameState.grid[0][0], knownGameState.grid[0][state.gridW - 1], knownGameState.grid[state.gridH - 1][0], knownGameState.grid[state.gridH - 1][state.gridW - 1]];

        if (corners.filter((s) => s.knownActor() == ActorId.MineKing).length > 0) {
            knownGameState.mineKingFound = true;
        } else {
            let possible = corners.filter((s) => s.couldBe(ActorId.MineKing));
            if (possible.length == 1) {
                let p = possible[0];
                solverLog(`MineKing must be at ${p.ty} ${p.tx}`);
                knownGameState.grid[p.ty][p.tx].possibleActors = [makeActor(ActorId.MineKing)];
                knownGameState.mineKingFound = true;
            }
        }
    }

    // Hunt for the wizard
    if (!knownGameState.wizardFound) {
        let possible = state.actors.filter((a) => isEdge(a.tx, a.ty) || isCloseToEdge(a.tx, a.ty));
        let edges = possible.filter(a => isEdge(a.tx, a.ty));
        let nonEdges = possible.filter(a => isCloseToEdge(a.tx, a.ty) && !isEdge(a.tx, a.ty));

        // clear bigSlimes from squares which cannot have a bigSlime neighbor
        for (let a of possible) {
            if (!knownGameState.grid[a.ty][a.tx].couldBeOrWas(ActorId.BigSlime)) {
                continue;
            }
            // must have at least 1 non-edge neighbor slime
            let ruled_out = !isCorner(a.tx, a.ty) && nonEdges.find(p => distance(p.tx, p.ty, a.tx, a.ty) == 1 && knownGameState.grid[p.ty][p.tx].couldBeOrWas(ActorId.BigSlime)) == undefined;
            // non-edge slime must have at least 2
            if (!isEdge(a.tx, a.ty)) {
                ruled_out ||= possible.filter(p => distance(p.tx, p.ty, a.tx, a.ty) == 1 && knownGameState.grid[p.ty][p.tx].couldBeOrWas(ActorId.BigSlime)).length < 2;
            }
            if (ruled_out) {
                // solverLog(`No bigslime at ${a.ty} ${a.tx}`);
                knownGameState.grid[a.ty][a.tx].removePossibleActor(ActorId.BigSlime);
            }
        }

        let maybeWizard = edges.find((a) => knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Wizard);
        if (maybeWizard != undefined) {
            knownGameState.wizardFound = true;
            for (let n of getNeighborsWithDiagonals(maybeWizard.tx, maybeWizard.ty)) {
                if (!n.revealed && knownGameState.grid[n.ty][n.tx].knownActor() != ActorId.BigSlime) {
                    solverLog(`Wizard reveals big slime at ${n.ty} ${n.tx}`);
                    knownGameState.grid[n.ty][n.tx].possibleActors = [makeActor(ActorId.BigSlime)];
                }
            }
        }
        else {
            knownGameState.huntForWizard();
        }
    }

    // if a ? has only 1 square in range that could be a Gazer, it's him
    for (let a of state.actors.filter((a) => showsGazerQuestionmark(a))) {
        let gazers = state.actors.filter((g) => distance(a.tx, a.ty, g.tx, g.ty) <= 2 && knownGameState.grid[g.ty][g.tx].couldBe(ActorId.Gazer));
        if (gazers.length == 1 && knownGameState.grid[gazers[0].ty][gazers[0].tx].knownActor() != ActorId.Gazer) {
            let g = gazers[0];
            solverLog(`Gazer pinpointed at ${g.ty} ${g.tx} - only possibility to show ? at ${a.ty} ${a.tx}`);
            knownGameState.grid[g.ty][g.tx].possibleActors = [makeActor(ActorId.Gazer)]
        } else if (gazers.length == 0) {
            solverLogError(`ERROR: ? without possible gazer in range: ${a.ty} ${a.tx}`);
        }
    }

    // squares next to visible numbers can not be Gazers
    for (let a of state.actors) {
        if (getVisibleAttackNumber(a) == null) {
            continue;
        }

        for (let dx = -2; dx <= 2; ++dx) {
            for (let dy = -2; dy <= 2; ++dy) {
                if (Math.abs(dx) + Math.abs(dy) > 2) continue;
                let x = a.tx + dx;
                let y = a.ty + dy;
                if (x >= 0 && y >= 0 && x < state.gridW && y < state.gridH && knownGameState.grid[y][x].knownActor() != ActorId.Gazer) {
                    knownGameState.grid[y][x].removePossibleActor(ActorId.Gazer);
                }
            }
        }
    }

    // chests need to be next to a minotaur and vice versa
    for (let a of state.actors) {
        if (knownGameState.grid[a.ty][a.tx].isOrWas(ActorId.Chest)) {
            let mino = getNeighborsWithDiagonals(a.tx, a.ty).filter((n) => knownGameState.grid[n.ty][n.tx].couldBeOrWas(ActorId.Minotaur));
            if (mino.length == 1 && knownGameState.grid[mino[0].ty][mino[0].tx].knownActor() == null) {
                solverLog(`Chest ${a.ty} ${a.tx} pinpoints a minotaur at ${mino[0].ty} ${mino[0].tx}`);
                knownGameState.grid[mino[0].ty][mino[0].tx].possibleActors = [makeActor(ActorId.Minotaur)];
                solverStats.chestsSpottingMinotaurs++;
            }
        }

        if (knownGameState.grid[a.ty][a.tx].isOrWas(ActorId.Minotaur)) {
            let chest = getNeighborsWithDiagonals(a.tx, a.ty).filter((n) => knownGameState.grid[n.ty][n.tx].couldBeOrWas(ActorId.Chest));
            if (chest.length == 1 && knownGameState.grid[chest[0].ty][chest[0].tx].knownPower() == null) {
                solverLog(`Minotaur ${a.ty} ${a.tx} pinpoints a chest at ${chest[0].ty} ${chest[0].tx}`);
                knownGameState.grid[chest[0].ty][chest[0].tx].possibleActors = [makeActor(ActorId.Chest)];
                solverStats.minotaursSpottingChests++;
            }
        }
    }

    // if two neighboring numbers have all squares in common but one, we can deduce that one
    let vis = Array(state.gridH).fill().map(() => []), known = Array(state.gridH).fill().map(() => []), unknown = Array(state.gridH).fill().map(() => []);
    let missing = Array(state.gridH).fill().map(() => new Array(state.gridW).fill().map(() => new Set()));
    function encodeForSet(tx, ty) { return ty * state.gridW + tx; }
    function decodeForSet(i) { return [Math.floor(i / state.gridW), i % state.gridW]; }
    for (let a of state.actors) {
        vis[a.ty][a.tx] = getVisibleAttackNumber(a);
        known[a.ty][a.tx] = 0;
        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            let nPower = knownGameState.grid[n.ty][n.tx].knownPower();
            if (nPower != null) {
                known[a.ty][a.tx] += nPower;
            }
            else {
                missing[a.ty][a.tx].add(encodeForSet(n.tx, n.ty));
            }
        }
        unknown[a.ty][a.tx] = vis[a.ty][a.tx] - known[a.ty][a.tx];
    }

    for (let a of state.actors) {
        if (vis[a.ty][a.tx] == null || unknown[a.ty][a.tx] == 0 || missing[a.ty][a.tx].size == 1) {
            continue;
        }

        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            if (vis[n.ty][n.tx] == null || unknown[n.ty][n.tx] == 0 || missing[n.ty][n.tx].size == 1 || encodeForSet(a.tx, a.ty) > encodeForSet(n.tx, n.ty)) {
                continue;
            }

            let oddOneOut = missing[a.ty][a.tx].symmetricDifference(missing[n.ty][n.tx]);

            if (oddOneOut.size == 0) {
                continue;
            }

            if (oddOneOut.size == 1) {

                let deduce = oddOneOut.values().next().value;
                let yx = decodeForSet(deduce);

                let unknownIntersectionPower = missing[a.ty][a.tx].has(deduce) ? unknown[n.ty][n.tx] : unknown[a.ty][a.tx];
                let missingPower = missing[a.ty][a.tx].has(deduce) ? unknown[a.ty][a.tx] : unknown[n.ty][n.tx];
                let deducedPower = missingPower - unknownIntersectionPower;

                solverLog(`${a.ty} ${a.tx} and ${n.ty} ${n.tx} share all unknown squares apart from ${yx[0]} ${yx[1]}, shared power is ${unknownIntersectionPower}, and since in total they are ${missingPower} it must be ${deducedPower}`);
                knownGameState.grid[yx[0]][yx[1]].possibleActors = knownGameState.grid[yx[0]][yx[1]].possibleActors.filter((a) => a.monsterLevel == deducedPower);
                solverStats.features.deducedOddOneOut++;
                continue;
            }

            // if one is a superset of the other, we can at least limit them from above
            if (oddOneOut.isSubsetOf(missing[a.ty][a.tx])) {
                let unknownIntersectionPower = unknown[n.ty][n.tx];
                let missingPower = unknown[a.ty][a.tx];
                let deducedMaxPower = missingPower - unknownIntersectionPower;

                for (let act of oddOneOut) {
                    let yx = decodeForSet(act);
                    if (knownGameState.grid[yx[0]][yx[1]].worstCasePower() > deducedMaxPower) {
                        solverStats.features.deducedUpperBound++;
                        knownGameState.grid[yx[0]][yx[1]].possibleActors = knownGameState.grid[yx[0]][yx[1]].possibleActors.filter(a => a.monsterLevel <= deducedMaxPower);
                    }
                }
            }

            if (oddOneOut.isSubsetOf(missing[n.ty][n.tx])) {
                let unknownIntersectionPower = unknown[a.ty][a.tx];
                let missingPower = unknown[n.ty][n.tx];
                let deducedMaxPower = missingPower - unknownIntersectionPower;

                for (let act of oddOneOut) {
                    let yx = decodeForSet(act);
                    if (knownGameState.grid[yx[0]][yx[1]].worstCasePower() > deducedMaxPower) {
                        solverStats.features.deducedUpperBound++;
                        knownGameState.grid[yx[0]][yx[1]].possibleActors = knownGameState.grid[yx[0]][yx[1]].possibleActors.filter(a => a.monsterLevel <= deducedMaxPower);
                    }
                }
            }
        }
    }

    // if a square A needs X more mines around it than a neighboring square B
    // and we have exactly that many squares available that aren't next to B and could be mines
    // well then they are
    for (let a of state.actors.filter(a => getVisibleAttackNumber(a) >= 100)) {
        let need = Math.floor(getVisibleAttackNumber(a) / 100);
        let missing = need - getNeighborsWithDiagonals(a.tx, a.ty).filter((n) => knownGameState.grid[n.ty][n.tx].knownActor() == ActorId.Mine).length;

        if (missing == 0) {
            continue;
        }

        let plausibleMines = getNeighborsWithDiagonals(a.tx, a.ty).filter(s => knownGameState.grid[s.ty][s.tx].couldBe(ActorId.Mine) && knownGameState.grid[s.ty][s.tx].knownActor() == null);

        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            let nv = getVisibleAttackNumber(n);
            if (nv == null) {
                continue;
            }
            let neiNeed = Math.floor(nv / 100);
            let neiMiss = neiNeed - getNeighborsWithDiagonals(n.tx, n.ty).filter(n => knownGameState.grid[n.ty][n.tx].knownActor() == ActorId.Mine).length;

            if (neiMiss >= missing) {
                continue;
            }

            let needToPutSomewhereElse = missing - neiMiss;
            let unshared = plausibleMines.filter(m => distance(n.tx, n.ty, m.tx, m.ty) > 1.5);

            if (unshared.length == needToPutSomewhereElse) {
                solverLog(`${needToPutSomewhereElse} mines surrounding ${a.ty} ${a.tx} need to be placed away from ${n.ty} ${n.tx}`);
                solverStats.features.deducedOddMineOut++;
                for (let u of unshared) {
                    knownGameState.grid[u.ty][u.tx].possibleActors = [makeActor(ActorId.Mine)];
                }
                break;
            }
        }
    }

    // populate .was fields
    for (let a of state.actors) {
        if (knownGameState.grid[a.ty][a.tx].was == null && knownGameState.grid[a.ty][a.tx].knownActor() != undefined) {
            knownGameState.grid[a.ty][a.tx].was = knownGameState.grid[a.ty][a.tx].knownActor();
        }
    }

    if (!knownGameState.allRevealed) {
        knownGameState.allRevealed = state.actors.every((a) => knownGameState.grid[a.ty][a.tx].knownPower() != undefined);
        if (knownGameState.allRevealed) {
            solverLog(`All powers on board are known`);
        }
    }

    const currentUpdatePossibilities = knownGameState.totalPossibilities();
    knownGameState.lastUpdateWasMeaningful = (currentUpdatePossibilities != knownGameState.lastUpdatePossibilities);
    // solverLog(`Just had a meaningful update: ${knownGameState.lastUpdateWasMeaningful}, ${knownGameState.lastUpdatePossibilities} -> ${currentUpdatePossibilities}`);
    knownGameState.lastUpdatePossibilities = currentUpdatePossibilities;
}

// clicks revealed objects which have no downside
// treasure
// xp
// gnome
// spells
function getFreeRevealedClick() {
    for (let i = 0; i < state.actors.length; i++) {
        let a = state.actors[i];
        if (!a.revealed) {
            continue;
        }

        let g = knownGameState.grid[a.ty][a.tx];
        if (g.knownActor() == ActorId.Crown) {
            continue;
        }

        if (g.isXp() || g.knownActor() == ActorId.Treasure || g.knownActor() == ActorId.Gnome || g.knownActor() == ActorId.DragonEgg || g.isSpell()) {
            solverLog(`Clicking ${a.ty} ${a.tx} because it is revealed and xp/treasure/gnome/spell`);
            return i;
        }
    }
    return null;
}

// clicks unrevealed squares with 0 power
function getRevealingEmptySpaceClick() {
    for (let i = 0; i < state.actors.length; i++) {
        let a = state.actors[i];
        if (a.revealed && !looksLikeClosedChest(a)) {
            continue;
        }

        if (knownGameState.grid[a.ty][a.tx].knownPower() == 0 && knownGameState.grid[a.ty][a.tx].knownActor() != ActorId.Crown) {
            solverLog(`Clicking ${a.ty} ${a.tx} because it is unrevealed and 0 power`);
            return i;
        }
    }

    return null;
}

// returns SOLVER_WANTS_TO_LEVEL_UP_ACTOR_INDEX if we should level up
function optimalLevelUpTimeClick() {
    if (state.player.hp == 1 && state.player.xp >= nextLevelXP(state.player.level)) {
        solverLog(`Optimal time to level up`);
        return SOLVER_WANTS_TO_LEVEL_UP_ACTOR_INDEX;
    }
    return null;
}

function maybeGetFreeClick() {
    let click = null;
    click = click ?? getFreeRevealedClick();
    click = click ?? optimalLevelUpTimeClick();
    click = click ?? getRevealingEmptySpaceClick();
    if (click != null) {
        solverStats.freeActions++;
    }
    return click;
}

function numberWithSameUnknownNeighborExists(a) {
    let missing = new Set();
    function encodeForSet(tx, ty) { return ty * state.gridW + tx; }
    for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
        if (knownGameState.grid[n.ty][n.tx].knownPower() == null) {
            missing.add(encodeForSet(n.tx, n.ty));
        }
    }

    for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
        if (getVisibleAttackNumber(n) == null) {
            continue;
        }

        let nMissing = new Set();
        for (let nn of getNeighborsWithDiagonals(n.tx, n.ty)) {
            if (knownGameState.grid[nn.ty][nn.tx].knownPower() == null) {
                nMissing.add(encodeForSet(nn.tx, nn.ty));
            }
        }

        if (missing.symmetricDifference(nMissing).size == 0) {
            return true;
        }
    }
    return false;
}

// bunch of heuristic nonsense trying to figure out how good this square is to reveal
function computeRevealValue(a) {

    if (a.revealed && isEmpty(a)) {
        return -1;
    }

    if (knownGameState.grid[a.ty][a.tx].knownPower() != undefined && numberWithSameUnknownNeighborExists(a)) {
        return 0;
    }

    let value = 0;

    // 10 value for possible eggs, neighbors of MineKing
    if (!knownGameState.dragonEggFound && knownGameState.grid[a.ty][a.tx].couldBe(ActorId.DragonEgg)) {
        value += 10;
    }

    if (!knownGameState.mineKingFound && getNeighborsWithDiagonals(a.tx, a.ty).find((n) => knownGameState.grid[n.ty][n.tx].couldBe(ActorId.MineKing)) != undefined) {
        value += 10;
    }

    // for each unknown neighbor, 0.1 value for each known square around it
    for (let n of getNeighborsWithDiagonals(a.tx, a.ty).filter((f) => knownGameState.grid[f.ty][f.tx].knownPower() == undefined)) {
        value += 0.1 * getNeighborsWithDiagonals(n.tx, n.ty).filter((nn) => knownGameState.grid[nn.ty][nn.tx].knownPower() != undefined).length;
    }

    // 0.2 value if we don't know our power
    value += 0.2 * (knownGameState.grid[a.ty][a.tx].knownPower() == undefined);

    return value;
}

function populateRevealValues() {
    revealValues = Array(state.gridH).fill().map(() => []);
    for (let a of state.actors) {
        revealValues[a.ty][a.tx] = computeRevealValue(a);
    }
}

function sortByRevealValues(a, b) {
    return revealValues[b.ty][b.tx] - revealValues[a.ty][a.tx];
}

function cleanupOrder(a, b) {
    let isAlover = knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Giant;
    let isBlover = knownGameState.grid[b.ty][b.tx].knownActor() == ActorId.Giant;

    if (isAlover != isBlover) {
        return isBlover - isAlover;
    }

    return knownGameState.grid[b.ty][b.tx].knownPower() - knownGameState.grid[a.ty][a.tx].knownPower();
}

function knapsackToEnd(dp, powers, i, hp) {
    if (hp == 0) {
        return true;
    }
    else if (hp < 0) {
        return false;
    }

    if (i >= powers.length) {
        return false;
    }

    if (dp[i][hp] != -1) {
        return dp[i][hp];
    }

    dp[i][hp] = knapsackToEnd(dp, powers, i + 1, hp) || knapsackToEnd(dp, powers, i + 1, hp - powers[i]);
    return dp[i][hp];
}

function worstCaseRevealDamage(a) {
    if (!knownGameState.grid[a.ty][a.tx].couldBe(ActorId.Mimic)) {
        return knownGameState.grid[a.ty][a.tx].worstCasePower();
    }

    if (a.revealed) {
        return 11;
    }

    return Math.max(...knownGameState.grid[a.ty][a.tx].possibleActors.filter(a => a.id != ActorId.Mimic).map(a => a.monsterLevel));
}

// knapsack from highest health enemy, but prefering lovers
function cleanupPhaseClick() {
    let enemies = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].knownPower() > 0);
    enemies.sort(cleanupOrder);
    let powers = enemies.map((a) => knownGameState.grid[a.ty][a.tx].knownPower());
    const N = enemies.length;
    const hp = state.player.hp - 1;

    let dp = Array(N).fill().map(() => Array(hp + 1).fill(-1));

    for (let i = 0; i < N; ++i) {
        if (knapsackToEnd(dp, powers, i + 1, hp - powers[i])) {
            solverLog(`Cleanup: knapsack allows enemy ${enemies[i].ty} ${enemies[i].tx} with power ${powers[i]}`);
            return getActorIndexAt(enemies[i].tx, enemies[i].ty);
        }
    }

    // try hitting anything
    for (let i = 0; i < N; ++i) {
        if (powers[i] <= hp) {
            solverLog(`Cleanup: cannot clear cleanly, hitting biggest enemy at ${enemies[i].ty} ${enemies[i].tx} with power ${powers[i]}`);
            return getActorIndexAt(enemies[i].tx, enemies[i].ty);
        }
    }
}

function hailMaryClickActor() {
    let unknownE = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].knownPower() == undefined);
    unknownE.sort((a, b) => knownGameState.grid[b.ty][b.tx].survivalProbability() - knownGameState.grid[a.ty][a.tx].survivalProbability());
    if (unknownE.length > 0) {
        let e = unknownE[0];
        if (knownGameState.grid[e.ty][e.tx].survivalProbability() > 0) {
            return getActorAt(e.tx, e.ty);
        }
    }
    return null;
}

function explorationPhaseClick() {
    const hp = state.player.hp - 1;
    populateRevealValues();

    // 3 categories of enemy: unknown squares, known squares with interest, known squares which give us nothing
    let unknownE = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].knownPower() == undefined && worstCaseRevealDamage(a) <= hp);
    unknownE.sort(sortByRevealValues);
    let knownInterestingE = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].knownPower() > 0 && knownGameState.grid[a.ty][a.tx].knownPower() <= hp && revealValues[a.ty][a.tx] > 0);
    knownInterestingE.sort(sortByRevealValues);
    let boringE = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].knownPower() > 0 && knownGameState.grid[a.ty][a.tx].knownPower() <= hp && revealValues[a.ty][a.tx] == 0);
    boringE.sort((a, b) => knownGameState.grid[b.ty][b.tx].knownPower() - knownGameState.grid[a.ty][a.tx].knownPower());
    // and now a 4th bonus one: most interesting representative, for each square, of its unknown neighbors with some total power
    let groupsOfE = []
    for (let a of state.actors) {
        let vis = getVisibleAttackNumber(a);
        if (vis == null) {
            continue;
        }
        let unknown = [];
        let knownPower = 0;
        let revealPower = 0;
        for (let n of getNeighborsWithDiagonals(a.tx, a.ty)) {
            let nPower = knownGameState.grid[n.ty][n.tx].knownPower();
            if (nPower != null) {
                knownPower += nPower;
            }
            else {
                unknown.push(n);
                revealPower += revealValues[n.ty][n.tx];
            }
        }

        if (unknown.length == 0) {
            continue;
        }
        let unknownPower = vis - knownPower;
        unknown.sort(sortByRevealValues);
        groupsOfE.push([revealPower, unknown[0], unknownPower]);
    }
    groupsOfE.sort((a, b) => b[0] - a[0]);

    // canClearInterestingly[i]: can use up i hp by killing just interesting enemies
    let canClearInterestingly = Array(hp + 1).fill().fill(false);
    canClearInterestingly[0] = true;
    for (let e of knownInterestingE) {
        let p = knownGameState.grid[e.ty][e.tx].knownPower();
        for (let i = hp; i >= p; --i) {
            canClearInterestingly[i] ||= canClearInterestingly[i - p];
        }
    }

    // can clear using any known enemies
    let canClearAtAll = [...canClearInterestingly];
    for (let e of boringE) {
        let p = knownGameState.grid[e.ty][e.tx].knownPower();
        for (let i = hp; i >= p; --i) {
            canClearAtAll[i] ||= canClearAtAll[i - p];
        }
    }

    // try finding set of unknown squares which still allows interesting full clear
    for (let g of groupsOfE) {
        let rev = g[0], e = g[1], dmg = g[2];

        if (dmg > hp) {
            continue;
        }

        if (canClearInterestingly[hp - dmg]) {
            solverLog(`Can start hitting group with reveal value ${rev}, total power ${dmg}, starting with ${e.ty} ${e.tx}, and finish off with interesting enemies`);
            return getActorIndexAt(e.tx, e.ty);
        }
    }

    // try finding set of unknown squares which still allows any full clear
    for (let g of groupsOfE) {
        let rev = g[0], e = g[1], dmg = g[2];

        if (dmg > hp) {
            continue;
        }

        if (canClearAtAll[hp - dmg]) {
            solverLog(`Can start hitting group with reveal value ${rev}, total power ${dmg}, starting with ${e.ty} ${e.tx}, and finish off with known enemies`);
            return getActorIndexAt(e.tx, e.ty);
        }
    }

    // try finding an unknown square which still allows interesting full clear
    for (let e of unknownE) {
        let ok = true;
        for (let a of knownGameState.grid[e.ty][e.tx].possibleActors) {
            ok &&= canClearInterestingly[hp - a.monsterLevel];
        }

        if (ok) {
            solverLog(`Can reveal unknown ${e.ty} ${e.tx} with reveal value ${revealValues[e.ty][e.tx]} and finish off with interesting enemies`);
            return getActorIndexAt(e.tx, e.ty);
        }
    }

    // try finding an unknown square which still allows any full clear
    for (let e of unknownE) {
        let ok = true;
        for (let a of knownGameState.grid[e.ty][e.tx].possibleActors) {
            ok &&= canClearAtAll[hp - a.monsterLevel];
        }

        if (ok) {
            solverLog(`Can reveal unknown ${e.ty} ${e.tx} with reveal value ${revealValues[e.ty][e.tx]} and finish off with known enemies`);
            return getActorIndexAt(e.tx, e.ty);
        }
    }

    // try finding interesting known enemy to clear with
    for (let e of knownInterestingE) {

        let p = knownGameState.grid[e.ty][e.tx].knownPower();

        let canClearWithoutE = Array(hp + 1).fill(false);
        canClearWithoutE[0] = true;
        for (let ee of knownInterestingE.concat(boringE)) {
            if (ee.ty == e.ty && ee.tx == e.tx) {
                continue;
            }
            let pp = knownGameState.grid[ee.ty][ee.tx].knownPower();
            for (let i = hp; i >= pp; --i) {
                canClearWithoutE[i] ||= canClearWithoutE[i - pp];
            }
        }

        if (canClearWithoutE[hp - p]) {
            solverLog(`Can reveal known ${e.ty} ${e.tx} with reveal value ${revealValues[e.ty][e.tx]} and finish off with known enemies`);
            return getActorIndexAt(e.tx, e.ty);
        }
    }

    // sometimes we are in a situation where we are a bit stuck
    // but hitting a boring enemy will not get us anywhere, it only delays the problem
    // it's better to try and risk it early, when we have more chances to find a way out
    // shouldDelay: should try and find a safe square to hit first
    let shouldDelayHittingBoringEnemy = (state.player.hp == state.player.maxHP);
    // shouldAvoid: should try and hit a dangerous square as well instead.
    let haveAHeal = state.actors.find(a => knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Medikit) != undefined;
    let xpNeeded = nextLevelXP(state.player.level) - state.player.xp;
    let canLevelUp = canClearAtAll.map((v, i) => v && i >= xpNeeded).find(a => a) != undefined;
    let shouldAvoidHittingBoringEnemy = !haveAHeal && !canLevelUp;

    // try finding boring enemy to clear with
    // but if we're full hp, hold off on hitting it until we run out of options
    let targetBoringE = null;
    for (let e of boringE) {

        let p = knownGameState.grid[e.ty][e.tx].knownPower();

        let canClearWithoutE = Array(hp + 1).fill(false);
        canClearWithoutE[0] = true;
        for (let ee of knownInterestingE.concat(boringE)) {
            if (ee.ty == e.ty && ee.tx == e.tx) {
                continue;
            }
            let pp = knownGameState.grid[ee.ty][ee.tx].knownPower();
            for (let i = hp; i >= pp; --i) {
                canClearWithoutE[i] ||= canClearWithoutE[i - pp];
            }
        }

        if (canClearWithoutE[hp - p]) {
            if (shouldDelayHittingBoringEnemy || shouldAvoidHittingBoringEnemy) {
                if (targetBoringE == null) {
                    if (!shouldDelayHittingBoringEnemy) { solverStats.features.panicking++; }
                    solverLog(`Could clear with just boring enemies starting with ${e.ty} ${e.tx}, but will try to avoid this - a 'can't clear' target below means we managed to`);
                }
                targetBoringE = targetBoringE ?? e;
            }
            else {
                solverLog(`Can reveal known ${e.ty} ${e.tx} with reveal value ${revealValues[e.ty][e.tx]} and finish off with known enemies`);
                return getActorIndexAt(e.tx, e.ty);
            }
        }
    }

    // hit unknown square with lowest worst case reveal damage
    unknownE.sort((a, b) => worstCaseRevealDamage(a) - worstCaseRevealDamage(b));
    if (unknownE.length > 0) {
        let e = unknownE[0];
        solverLog(`Can't clear, will hit unknown ${e.ty} ${e.tx} with worst case reveal damage ${worstCaseRevealDamage(e)}`);
        return getActorIndexAt(e.tx, e.ty);
    }

    // hit interesting enemy with highest power
    knownInterestingE.sort((a, b) => knownGameState.grid[b.ty][b.tx].knownPower() - knownGameState.grid[a.ty][a.tx].knownPower());
    if (knownInterestingE.length > 0) {
        let e = knownInterestingE[0];
        solverLog(`Can't clear, will hit interesting ${e.ty} ${e.tx}`);
        return getActorIndexAt(e.tx, e.ty);
    }

    // If we are adamant we want to avoid hitting a boring enemy, cut straight to the hail mary
    if (shouldAvoidHittingBoringEnemy) {
        let hailMary = hailMaryClickActor();
        if (hailMary != null) {
            solverStats.tookRisk = true;
            solverLog(`Could maybe hit a boring enemy ${targetBoringE != null}, but we are panicking, go for hail mary at ${hailMary.ty} ${hailMary.tx} with survival probability ${knownGameState.grid[hailMary.ty][hailMary.tx].survivalProbability()}`);
            return getActorIndexAt(hailMary.tx, hailMary.ty);
        }
    }

    // we tried avoiding hitting a boring enemy, but if we found one that lets us full clear, do it
    if (targetBoringE != null) {
        solverLog(`Can reveal known ${targetBoringE.ty} ${targetBoringE.tx} with reveal value ${revealValues[targetBoringE.ty][targetBoringE.tx]} and finish off with known enemies`);
        return getActorIndexAt(targetBoringE.tx, targetBoringE.ty);
    }

    // hit boring enemy with highest power
    boringE.sort((a, b) => knownGameState.grid[b.ty][b.tx].knownPower() - knownGameState.grid[a.ty][a.tx].knownPower());
    if (boringE.length > 0) {
        let e = boringE[0];
        solverLog(`Can't clear, will hit boring ${e.ty} ${e.tx}`);
        return getActorIndexAt(e.tx, e.ty);
    }

    // we cannot hit any known enemies, and all unknown squares could kill us
    return null;
}

function maybeGetNextClick() {
    let click = maybeGetFreeClick();
    if (click != null) {
        return click;
    }

    const hp = state.player.hp - 1;

    // VIPs
    let VIPs = [];
    for (let y = 0; y < state.gridH; ++y) {
        for (let x = 0; x < state.gridW; ++x) {
            let knownActor = knownGameState.grid[y][x].knownActor();
            if (knownActor == ActorId.MineKing || knownActor == ActorId.RatKing || knownActor == ActorId.Wizard || knownActor == ActorId.Gazer) {
                VIPs.push({ x: x, y: y, id: knownActor });
            }
        }
    }

    const mineKing = VIPs.find((p) => p.id == ActorId.MineKing);
    if (hp >= 10 && mineKing != undefined) {
        solverLog(`Killing the MineKing`);
        return getActorIndexAt(mineKing.x, mineKing.y);
    }

    // MineKing is very cool, he's worth risking for.
    // At this point in the game we should be able to continue nicely even if we miss
    if (hp >= 10 && !knownGameState.mineKingFound) {
        for (y of [0, state.gridH - 1]) {
            for (x of [0, state.gridW - 1]) {
                // at 10hp, we can hit any square that can't be a mine - if it's a mimic, we won't take damage, and a revealed chest cant couldBe(mineking)
                if (knownGameState.grid[y][x].couldBe(ActorId.MineKing) && !knownGameState.grid[y][x].couldBe(ActorId.Mine)) {
                    solverLog(`MineKing could be at ${y} ${x}, worth a shot`);
                    solverStats.features.mineKingGuesses++;
                    return getActorIndexAt(x, y);
                }
            }
        }
    }

    const ratKing = VIPs.find((p) => p.id == ActorId.RatKing);
    if (hp >= 5 && ratKing != undefined) {
        solverLog(`Killing the RatKing`);
        return getActorIndexAt(ratKing.x, ratKing.y);
    }

    const wizard = VIPs.find((p) => p.id == ActorId.Wizard);
    if (hp >= 1 && wizard != undefined) {
        solverLog(`Killing the wizard`);
        return getActorIndexAt(wizard.x, wizard.y);
    }

    const gazer = VIPs.find((p) => p.id == ActorId.Gazer);
    if (hp >= 5 && gazer != undefined) {
        solverLog(`Killing a gazer`);
        return getActorIndexAt(gazer.x, gazer.y);
    }

    if (hp >= 13 && knownGameState.grid[4][Math.floor(state.gridW / 2)].knownActor() == ActorId.Dragon) {
        solverLog(`Slaying the dragon`);
        return getActorIndexAt(Math.floor(state.gridW / 2), 4);
    }

    // Risk it for gazers. Cannot be guaranteed.
    if (hp >= 5) {
        let gazerGuess = knownGameState.guessGazer();
        if (gazerGuess != null) {
            solverLog(`Hitting the guessed gazer`);
            return gazerGuess;
        }
    }

    if (knownGameState.allRevealed) {
        let cleanupClick = cleanupPhaseClick();
        if (cleanupClick != null) {
            return cleanupClick;
        }
    }
    else {
        let explorationClick = explorationPhaseClick();
        if (explorationClick != null) {
            return explorationClick;
        }
    }

    // We can't hit anything. Dump damage into lowest HP wall.
    let walls = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Wall);
    // Walls are always revealed, so we can see their HP
    walls.sort((a, b) => ((a.wallHP - b.wallHP) * 20) + (revealValues[b.ty][b.tx] - revealValues[a.ty][a.tx]));
    if (walls.length > 0 && hp > 0) {
        solverLog(`Dumping HP into a wall`);
        return getActorIndexAt(walls[0].tx, walls[0].ty);
    }

    // Level up
    if (state.player.xp >= nextLevelXP(state.player.level)) {
        solverLog(`Reluctantly leveling up`);
        return SOLVER_WANTS_TO_LEVEL_UP_ACTOR_INDEX;
    }

    // Use a heal
    let heals = state.actors.filter((a) => knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Medikit);
    heals.sort((a, b) => revealValues[b.ty][b.tx] - revealValues[a.ty][a.tx]);
    if (heals.length > 0) {
        solverLog(`Must take a heal`);
        return getActorIndexAt(heals[0].tx, heals[0].ty);
    }

    // Take the crown
    let crown = state.actors.find((a) => knownGameState.grid[a.ty][a.tx].knownActor() == ActorId.Crown);
    if (crown != undefined) {
        solverLog(`Nothing to do except win`);
        return getActorIndexAt(crown.tx, crown.ty);
    }

    // Hail mary
    solverLog(`Unable to find any safe click`);
    let hailMary = hailMaryClickActor();
    if (hailMary != null) {
        solverStats.tookRisk = true;
        solverLog(`Clicking dangerous unknown square ${hailMary.ty} ${hailMary.tx} with estimated surival probability ${knownGameState.grid[hailMary.ty][hailMary.tx].survivalProbability()}`);
        return getActorIndexAt(hailMary.tx, hailMary.ty);
    }

    // Give up
    // you need to purposefuly set it up so that this happens, but whatever floats your boat
    solverLog(`Every click is suicide, good game.`);
    return getActorIndexAt(4, Math.floor(state.gridW / 2));
}

// End of solver code

function updateBook(ctx, dt, worldR, HUDRect, clickedLeft) {
    let bookR = new Rect();
    bookR.w = stripBook.frames[0].rect.w;
    bookR.h = stripBook.frames[0].rect.h;
    bookR.x = (worldR.w - bookR.w) * 0.5;
    bookR.y = (worldR.h - bookR.h - HUDRect.h) * 0.5;
    let bookLeft = new Rect();
    bookLeft.h = bookR.h;
    bookLeft.w = bookR.w * 0.5;
    bookLeft.x = bookR.x;
    bookLeft.y = bookR.y;
    let bookRight = new Rect();
    bookRight.h = bookR.h;
    bookRight.w = bookR.w * 0.5;
    bookRight.x = bookR.right() - bookRight.w;
    bookRight.y = bookR.y;
    let flapL = new Rect();
    flapL.w = 24;
    flapL.h = 24;
    flapL.x = bookLeft.x;
    flapL.y = bookR.bottom() - flapL.h;
    let flapR = new Rect();
    flapR.copyFrom(flapL);
    flapR.x = bookR.right() - flapR.w;

    drawFrame(ctx, stripBook, 0, bookR.centerx(), bookR.centery());

    if (state.bookPage == 0) {
        let top = 30;
        fontBook.drawLine(ctx, "Monsternomicon", bookLeft.centerx(), top, FONT_CENTER);

        let lines = [];
        lines.push("* jorge must defeat dragon");
        lines.push("* safe to lose all hearts");
        // lines.push("* observe patterns when dead");
        lines.push("* touch jorge to level up");
        // lines.push("* guessing means death");
        // lines.push("* walls can be taken down");
        // lines.push("crowned monsters reveal minions");
        // lines.push("* press \"S\" to toggle sound");
        if (supportsRightClick()) lines.push("* shift or right click to mark");
        else lines.push("* hold down button to mark");
        // lines.push("* fear the mimic");
        lines.push("* numbers are sum of");
        lines.push("  monster power");

        drawFrame(ctx, stripHint, 0, bookLeft.centerx(), bookLeft.bottom() - 105 - 15);
        // drawFrame(ctx, stripHintLevelup, 0, bookLeft.x + 35, bookLeft.bottom() - 40 - 15);
        // fontUIBook.drawLine(ctx, "touch jorge to level up", 55, bookRight.bottom() - 35 - 15);

        fontBook.drawLine(ctx, "observe monster", bookLeft.centerx(), bookLeft.bottom() - 50, FONT_CENTER);
        fontBook.drawLine(ctx, "patterns when dead", bookLeft.centerx(), bookLeft.bottom() - 40, FONT_CENTER);

        // fontBook.drawLine(ctx, "fear the mimic", bookRight.centerx(), bookRight.bottom() - 35, FONT_CENTER);

        let soundR = new Rect();
        soundR.w = 16;
        soundR.h = 16;
        soundR.x = bookLeft.x + 10;
        soundR.y = bookLeft.bottom() - 25;
        if (clickedLeft && soundR.contains(mousex, mousey)) {
            soundOn = !soundOn;
            if (soundOn) {
                play("spell");
            }
        }
        drawFrame(ctx, stripIcons, soundOn ? 58 : 57, soundR.centerx(), soundR.centery());

        let musicR = new Rect();
        musicR.w = 16;
        musicR.h = 16;
        musicR.x = soundR.right() + 10;
        musicR.y = bookLeft.bottom() - 25;
        if (clickedLeft && musicR.contains(mousex, mousey)) {
            musicOn = !musicOn;
        }
        drawFrame(ctx, stripIcons, musicOn ? 151 : 150, musicR.centerx(), musicR.centery());

        let freeClickR = new Rect();
        freeClickR.w = 30;
        freeClickR.h = 30;
        freeClickR.x = musicR.right() + 10;
        freeClickR.y = bookLeft.bottom() - 36;
        drawFrame(ctx, stripButtons, 0, freeClickR.centerx(), freeClickR.centery());
        drawFrame(ctx, stripIcons, 24, freeClickR.centerx() + 4, freeClickR.centery());
        drawFrame(ctx, stripIcons, 8, freeClickR.right() - 7, freeClickR.y + 6);
        fontUIBlue.drawLine(ctx, "0", freeClickR.centerx() + 4, freeClickR.centery() + 3, FONT_TOP);
        if (clickedLeft && freeClickR.contains(mousex, mousey)) {
            freeClickOn = !freeClickOn;
        }
        if (freeClickOn) {
            drawFrame(ctx, stripIcons, 34, freeClickR.centerx() - 10, freeClickR.centery());
        }

        let powerHintsR = new Rect();
        powerHintsR.w = 30;
        powerHintsR.h = 30;
        powerHintsR.x = freeClickR.right() + 10;
        powerHintsR.y = bookLeft.bottom() - 36;
        drawFrame(ctx, stripButtons, 0, powerHintsR.centerx(), powerHintsR.centery());
        if (clickedLeft && powerHintsR.contains(mousex, mousey)) {
            powerHintsOn = !powerHintsOn;
        }
        if (powerHintsOn) {
            fontUIBlue.drawLine(ctx, "5", powerHintsR.centerx(), powerHintsR.centery(), FONT_CENTER | FONT_VCENTER);
        }

        let offy = 0;
        for (let line of lines) {
            fontUIBook.drawLine(ctx, line, 12, 20 + offy + top);
            offy += 15;
        }

        let bookRightBody = new Rect();
        bookRightBody.copyFrom(bookRight);
        bookRightBody.h = bookRight.w - 20;
        bookRightBody.y = 40 + 10;
        bookRightBody.w *= 0.85;
        bookRightBody.x += 20;
        // fontUIBook.drawLine(ctx, "fear the mimic", bookRightBody.centerx(), bookRightBody.centery(), FONT_CENTER);

        // monster list
        let monsterCountTop = bookRightBody.y - 5;
        let showCountY = monsterCountTop;
        let showCountX = bookRightBody.x + 27;
        let showLineCounter = 0;
        showCount(makeRat1);
        showCount(makeBat2);
        showCount(makeSkeleton3);
        showCount(makeGargoyle4);
        // showCount(makeEye5);
        showCount(makeSlime5);
        showCount(makeMinotaur6);
        // showCount(makeSnake7);
        showCount(makeGuard7);
        showCount(makeBigSlime8);
        showCount(makeGiant9);
        // showCount(makeMinion9);
        // showCount(makeAngrySnake);
        // showCount(makeDeath9);
        showCount(makeMineKing);

        // showCount(makeLich); // 9
        showCount(makeRatKing);
        showCount(makeGazer);
        // showCount(makeSlimeKing);
        // showCount(makeLich);

        showCount(makeWizard);
        showCount(makeMimic, stripXYToFrame(70, 375));
        // showCount(makeDragon);
        showCount(makeMine);
        showCount(makeChest);
        showCount(makeGnome);
        showCount(makeMedikit);
        showCount(makeSpellOrb);
        showCount(makeSpellDisarm);
        // showCount(makeFidel);
        // showCount(makeSpellAngerMonsters);
        // showCount(makeChest);

        // fontBook.drawLine(ctx, "score: "+state.player.score, bookRight.centerx(), bookRight.bottom() - 20, FONT_CENTER);
        drawFrame(ctx, stripIcons, state.seedWasProvided ? 23 : 143, bookRight.centerx() - 69, bookRight.bottom() - 25);
        fontBook.drawLine(ctx, "seed: " + state.seed, bookRight.centerx(), bookRight.bottom() - 20, FONT_CENTER);

        let setSeedRect = fontUIBook.drawLine(ctx, "**set a seed**", bookRight.centerx(), bookRight.bottom() - 8, FONT_CENTER);
        if (clickedLeft && setSeedRect.contains(mousex, mousey)) {
            let userInputSeed = prompt("Enter the level seed (a positive number)");
            if (userInputSeed != null) {
                let parsedSeed = parseInt(userInputSeed);
                if (parsedSeed > 0) {
                    gameRandomnessSeeds = [parsedSeed];
                    play("restart");
                    newGame();
                }
                else {
                    console.log(`Received seed ${userInputSeed} but that is not a valid seed (parsed into ${parsedSeed})`);
                }
            }
        }

        fontUIBook.drawLine(ctx, version, bookLeft.right() - 50, bookRight.bottom() - 12);

        drawFrame(ctx, stripBookFlap, 0, flapR.centerx() - 2, flapR.centery() - 2);
        if (clickedLeft && flapR.contains(mousex, mousey)) {
            state.bookPage = 1;
            play("pageflip");
        }

        function showCount(makerFn, overrideFrame = -1) {
            let placeholder = new Actor();
            makerFn(placeholder);

            let level = placeholder.monsterLevel;

            let count = 0;
            for (let a of state.actors) {
                if (placeholder.id == a.id) count += 1;
                else if (placeholder.id == ActorId.SpellMakeOrb && a.contains == makeSpellOrb) count += 1;
                else if (placeholder.id == ActorId.Medikit && a.contains == makeMedikit) count += 1;
                else if (placeholder.id == ActorId.SpellDisarm && a.id == ActorId.MineKing) count += 1;
                else if (placeholder.id == ActorId.Medikit && a.id == ActorId.Giant) count += 1;
                else if (placeholder.id == ActorId.SpellRevealRats && a.id == ActorId.RatKing) count += 1;
                else if (placeholder.id == ActorId.SpellRevealSlimes && a.id == ActorId.Wizard) count += 1;

                // TODO: this should have been another type of actor
                if (a.id == ActorId.Mine && placeholder.id == a.id && a.monsterLevel == 0) {
                    level = 0;
                    overrideFrame = stripXYToFrame(168, 455);
                }
            }

            // if(all.length > 0)
            {
                let frame = placeholder.stripFrame;
                if (overrideFrame >= 0) frame = overrideFrame;
                drawFrame(ctx, stripIconsBig, 3, showCountX, showCountY);
                drawFrame(ctx, placeholder.strip, frame, showCountX, showCountY);

                // if(placeholder.id == ActorId.MineKing)
                // {
                //     let lich = state.actors.find(a => a.id == ActorId.MineKing);
                //     if(lich != undefined)
                //     {
                //         level = lich.monsterLevel;
                //     }
                // }

                let str = "$" + count;
                if (placeholder.monsterLevel >= 0) fontUIBook.drawLine(ctx, "P" + level, showCountX - 12, showCountY, FONT_VCENTER | FONT_RIGHT);
                if (makerFn == makeGazer) str = "$?";
                fontUIBook.drawLine(ctx, str, showCountX + 12, showCountY, FONT_VCENTER);
                showCountY += 22;
                showLineCounter += 1;
                if (showLineCounter == 10) {
                    showCountX += 90;
                    showCountY = monsterCountTop;
                }
            }
        }
    }
    else if (state.bookPage == 1) {
        let top = bookRight.y + 10;
        fontBook.drawLine(ctx, "** stamps **", bookLeft.centerx(), top + 30, FONT_CENTER);

        let offy = top + 70;
        let offx = bookLeft.x + 50;
        for (let i = 0; i < STAMP_SPEC_IDS.length; i++) {
            let lines = STAMP_DESC[i];
            let solved = hasStamp(STAMP_SPEC_IDS[i]);
            drawFrame(ctx, stripStamps, STAMP_SPEC_FRAME[i] + (solved ? 0 : 9), offx, offy);
            fontBook.drawLine(ctx, lines[0], offx + 22, offy - 2);
            fontBook.drawLine(ctx, lines[1], offx + 22, offy + 10 - 2);
            offy += stripStamps.frames[0].rect.h + 15;
        }

        { // credits
            let lines = [];
            lines.push("por Daniel Benmergui");
            lines.push("y hernan rozenwasser");
            lines.push("");
            lines.push("participaron:");
            lines.push("mercedes grazzini");
            lines.push("julieta romero");
            lines.push("daniela renton");
            lines.push("");
            lines.push("gracias:");
            lines.push("mademoiselle ^lin");
            lines.push("squirrel eiserloh");
            lines.push("matt vandevander");
            lines.push("antonio uribe, luka");
            lines.push("jake birkett, marco, bryan");
            lines.push("steve ridout")
            lines.push("");
            lines.push("");
            lines.push("inspirado en mamono sweeper");
            lines.push("");
            lines.push("hecho en #");
            let creditsy = top + 30;
            let creditsx = bookRight.centerx();
            for (let line of lines) {
                fontUIBook.drawLine(ctx, line, creditsx, creditsy, FONT_BOTTOM | FONT_CENTER);
                creditsy += 7;
            }
        }

        let storytellerR = new Rect();
        storytellerR.w = stripStoryteller.frames[0].rect.w;
        storytellerR.h = stripStoryteller.frames[0].rect.h;
        storytellerR.x = bookRight.centerx() - storytellerR.w * 0.5;
        storytellerR.y = bookRight.bottom() - storytellerR.h - 20;
        drawFrame(ctx, stripStoryteller, 0, storytellerR.centerx(), storytellerR.centery());

        fontUIBook.drawLine(ctx, "tambien hicimos", storytellerR.centerx(), storytellerR.y - 3, FONT_BOTTOM | FONT_CENTER);
        if (clickedLeft && storytellerR.contains(mousex, mousey)) {
            window.open("https://store.steampowered.com/app/1624540/Storyteller/", '_blank');
        }

        drawFrame(ctx, stripBookFlap, 1, flapL.centerx() + 2, flapL.centery() - 2);
        if (clickedLeft && flapL.contains(mousex, mousey)) {
            state.bookPage = 0;
            play("pageflip");
        }
    }
}

function updateGeneratingDungeon(ctx, dt) {
    if (state.waitForAFrameBeforeGeneration) {
        state.waitForAFrameBeforeGeneration = false;
    }
    else if (state.waitForFramesAfterGeneration > 0) {
        state.waitForFramesAfterGeneration--;
        if (state.waitForFramesAfterGeneration == 0) {
            state.status = GameStatus.Playing;
            state.startTime = Date.now();
        }
    }
    else {
        generateDungeon();
        while (!checkLevel()) generateDungeon();

        // I need this to eat any input events that were queued during generation
        state.waitForFramesAfterGeneration = 1;
    }

    let worldR = new Rect();
    worldR.w = backBuffer.width;
    worldR.h = backBuffer.height;

    ctx.save();
    ctx.fillStyle = "#293333";
    ctx.fillRect(0, 0, worldR.w, worldR.h);
    fontHUD.drawLine(ctx, "building dragon lair...", worldR.centerx(), worldR.centery(), FONT_CENTER | FONT_VCENTER);
    ctx.restore();
}

function updatePlaying(ctx, dt) {
    let worldR = new Rect();
    worldR.w = backBuffer.width;
    worldR.h = backBuffer.height;
    let HUDRect = new Rect();
    HUDRect.w = backBuffer.width;
    HUDRect.h = 41;
    HUDRect.y = backBuffer.height - HUDRect.h;
    let oldPlayerHP = state.player.hp;
    let oldPlayerXP = state.player.xp;
    /** @type {Actor[]} */
    let activeActors = []; // TODO: remove this
    let actorRects = []; // TODO: remove this
    let hoveringActorIndex = -1;
    let pressedActorIndex = -1;
    let clickedActorIndex = -1;
    let cycleMarkerActorIndex = -1;
    for (let a of state.actors) {
        activeActors.push(a);
        actorRects.push(getRectForTile(a.tx, a.ty));
    }

    // marker
    // if(cycleMarkerActorIndex >= 0)
    // {
    //     let marked = activeActors[cycleMarkerActorIndex];
    //     if(!marked.revealed)
    //     {
    //         marked.mark = (marked.mark + 1) % 12;
    //         play(marked.mark == 11 ? "mark_mine": "mark");
    //     }
    // }

    // compute marker rects
    let hoverRects = [];
    let hoverMarkers = [];
    if (state.hoverMenu.actor != null) {
        let hoverTileR = getRectForTile(state.hoverMenu.actor.tx, state.hoverMenu.actor.ty);

        let markerButtonTotalW = 4 * 24;
        let markerButtonTotalH = 4 * 24;
        let basex = hoverTileR.right();
        let basey = hoverTileR.y - markerButtonTotalH * 0.5 + 24 * 0.5;
        if (basex + markerButtonTotalW > worldR.right()) {
            basex = hoverTileR.x - markerButtonTotalW;
        }

        if (basey + markerButtonTotalH > HUDRect.y) {
            basey = HUDRect.y - markerButtonTotalH;
        }
        else
            if (basey < 0) {
                basey = 0;
            }

        let offy = 0;
        let offx = 0;
        let cols = 0;
        for (let i = 0; i < ALL_MARKERS.length; i++) {
            if (i == ALL_MARKERS.length - 1 && state.hoverMenu.actor.mark == 0) continue;
            let r = new Rect();
            r.w = 24;
            r.h = 24;
            r.y = basey + offy;
            r.x = basex + offx;
            hoverRects.push(r);
            hoverMarkers.push(ALL_MARKERS[i]);
            cols++;
            if (cols == 4) {
                cols = 0;
                offy += r.h;
                offx = 0;
            }
            else {
                offx += r.w;
            }
        }
    }

    // input
    let clickedRight = supportsRightClick() && (mouseJustPressedRight || (mouseJustPressed && shiftIsPressed));
    let clickedLeft = mouseJustPressed && !clickedRight;
    let clickedOnBoard = false;

    if (!mousePressed) {
        state.timeElapsedPushingButton = 0;
    }

    if (state.hoverMenu.isActive()) {
        let clickedSomewhere = false;
        let hoveringOverTileIndex = -1;
        for (let i = 0; i < hoverRects.length; i++) {
            let r = hoverRects[i];
            if (r.contains(mousex, mousey)) {
                hoveringOverTileIndex = i;
            }
        }

        if (state.lastHoveredHoverButtonIndex != hoveringOverTileIndex) {
            state.lastHoveredHoverButtonIndex = hoveringOverTileIndex;
            // play("hover_over_button");
        }

        if (hoveringOverTileIndex >= 0 && (clickedLeft || clickedRight)) {
            let mark = hoverMarkers[hoveringOverTileIndex] == ALL_MARKERS[ALL_MARKERS.length - 1] ? 0 : hoverMarkers[hoveringOverTileIndex];
            if (mark == state.hoverMenu.actor?.mark) mark = 0;
            // @ts-ignore
            state.hoverMenu.actor.mark = mark;
            play(mark == 0 ? "remove_mark" : "mark");
            clickedSomewhere = true;
            state.hoverMenu.resetTo(null);
        }

        // did I just move the menu elsewhere?
        // if(clickedRight && hoveringOverTileIndex < 0)
        // {
        //     for(let i = 0; i < activeActors.length; i++)
        //     {
        //         let a = activeActors[i];
        //         let r = actorRects[i];
        //         if(a != state.hoverMenu.actor && r.contains(mousex, mousey))
        //         {
        //             state.hoverMenu.resetTo(a);
        //             play("open_hover");
        //             clickedSomewhere = true;
        //         }
        //     }        
        // }

        if (!clickedSomewhere) {
            if (clickedLeft || clickedRight) {
                state.hoverMenu.resetTo(null);
                play("close_hover");
            }
        }
    }
    else {
        state.lastHoveredHoverButtonIndex = -1;
        for (let i = 0; i < activeActors.length; i++) {
            let a = activeActors[i];
            let r = actorRects[i];
            clickedOnBoard ||= r.contains(mousex, mousey);
            if ((!a.revealed || !isEmpty(a)) && state.status == GameStatus.Playing && r.contains(mousex, mousey) && !state.showingMonsternomicon) {
                hoveringActorIndex = i;
                // if(mousePressed) pressedActorIndex = i;
                if (clickedLeft) state.lastPushedButtonIndex = i;
                if (clickedRight) cycleMarkerActorIndex = i;
            }
        }

        clickedOnBoard &&= !state.showingMonsternomicon && state.status == GameStatus.Playing;

        if (state.lastPushedButtonIndex >= 0) {
            let a = activeActors[state.lastPushedButtonIndex];
            let r = actorRects[state.lastPushedButtonIndex];

            // if(a.mark == 13 && !state.minesDisarmed)
            // {
            //     play("wrong");
            //     state.lastPushedButtonIndex = -1;
            // }
            // else
            if (!mousePressed || supportsRightClick()) {
                if (r.contains(mousex, mousey)) clickedActorIndex = state.lastPushedButtonIndex;
                state.lastPushedButtonIndex = -1;
            }
            else
                if (!state.hoverMenu.isActive()) {
                    state.timeElapsedPushingButton += dt;
                    if (state.timeElapsedPushingButton > TIME_TO_HOVER_MENU) {
                        cycleMarkerActorIndex = state.lastPushedButtonIndex;
                        state.timeElapsedPushingButton = 0;
                        state.lastPushedButtonIndex = -1;
                    }
                }
        }

        if (cycleMarkerActorIndex >= 0) {
            let marked = activeActors[cycleMarkerActorIndex];
            if (!marked.revealed) {
                let menu = state.hoverMenu;
                menu.resetTo(null);
                menu.actor = marked;
                play("open_hover");
            }
        }
    }

    const performFreeClick = clickedLeft && clickedOnBoard && freeClickOn;
    let performNextClick = state.status == GameStatus.Playing && (clickedLeft && state.autoPlayRect.contains(mousex, mousey));
    if (solverTesting && Date.now() - lastSolverTestingAction > solverTestingCadenceMs && knownGameState.stableKnowledge()) {
        performNextClick = true;
        lastSolverTestingAction = Date.now();
    }

    if (performFreeClick) {
        let maybeClick = maybeGetFreeClick();
        if (maybeClick != null) {
            clickedActorIndex = maybeClick;
        }
    }
    else if (performNextClick) {
        let maybeClick = maybeGetNextClick();
        solverStats.nonfreeActions++;
        if (maybeClick != null) {
            clickedActorIndex = maybeClick;
        }
    }

    if (clickedActorIndex >= 0) {
        if (activeActors[clickedActorIndex].id == ActorId.SpellDisarm) {
            knownGameState.disarmMines();
        }
        else if (activeActors[clickedActorIndex].id == ActorId.SpellRevealSlimes) {
            knownGameState.revealedBySpells.push(ActorId.Slime);
        }
        else if (activeActors[clickedActorIndex].id == ActorId.SpellRevealRats) {
            knownGameState.revealedBySpells.push(ActorId.Rat);
        }
    }

    // turn
    if (clickedActorIndex >= 0) {
        let pushed = activeActors[clickedActorIndex];
        let pushedR = actorRects[clickedActorIndex];

        // to check if mine king opportunity was missed (for solver stats)
        let mineKingWasPossible = (state.actors.find((a) => a.id == ActorId.MineKing && a.defeated == false) != undefined) && state.player.hp > 10;

        // special case for the gnome
        if (pushed.id == ActorId.Gnome) {
            // if I have room, move away!
            let target = getGnomeFavoriteJumpTarget();
            if (target != null) {
                let oldmark = target.mark;
                makeGnome(target);
                target.mark = oldmark;
                makeEmpty(pushed);
                play("gnome_jump", 1);
                startFXGnomeJumping(pushed.tx, pushed.ty);
            }
        }

        if (pushed.id == ActorId.Crown) {
            state.endTime = Date.now();
            state.status = GameStatus.WinScreen;
            solverStats.computeEndStats();

            // stamps
            let living = 0;
            for (let a of state.actors) {
                if (isEmpty(a)) continue;
                if (a.id == ActorId.Dragon || a.id == ActorId.Crown) continue;
                living++;
            }
            if (living == 0) {
                state.stampsCollectedThisRun.push(STAMP_CLEAR);
            }

            if (state.actors.filter(a => a.id == ActorId.Giant && !a.defeated).length == 2) {
                state.stampsCollectedThisRun.push(STAMP_LOVERS);
            }

            if (state.actors.filter(a => a.id == ActorId.DragonEgg && !a.defeated).length == 1) {
                state.stampsCollectedThisRun.push(STAMP_EGG);
            }

            if (state.killedRats == 0) {
                state.stampsCollectedThisRun.push(STAMP_PACIFIST);
            }

            // merge stamps into global storage
            for (let stampId of state.stampsCollectedThisRun) {
                if (!collectedStamps.includes(stampId)) {
                    collectedStamps.push(stampId);
                }
            }
            saveSettings();

            play("win");
        }
        else
            if (pushed.id == ActorId.SpellRevealSlimes) {
                if (pushed.revealed) {
                    let foundOne = false;
                    for (let a of state.actors) {
                        if (a.id == ActorId.Slime || a.id == ActorId.BigSlime) {
                            foundOne = true;
                            a.revealed = true;
                            startFXReveal(a.tx, a.ty);
                        }
                    }

                    makeEmptyAndReveal(pushed);
                    play(foundOne ? "spell" : "wrong");
                }
            }
            else
                if (pushed.id == ActorId.SpellRevealRats) {
                    if (pushed.revealed) {
                        let foundOne = false;
                        for (let a of state.actors) {
                            if (a.id == ActorId.Rat) {
                                foundOne = true;
                                a.revealed = true;
                                startFXReveal(a.tx, a.ty);
                            }
                        }

                        makeEmptyAndReveal(pushed);
                        play(foundOne ? "spell" : "wrong");
                    }
                }
                else
                    if (pushed.id == ActorId.SpellDisarm) {
                        if (pushed.revealed) {
                            let candidates = state.actors.filter(a => !a.defeated && a.id == ActorId.Mine);
                            for (let mine of candidates) {
                                mine.defeated = true;
                                mine.monsterLevel = 0;
                                if (mine.revealed) {
                                    // startFXDisarmMine(mine.tx, mine.ty);
                                    startFXMineExploding(mine.tx, mine.ty);
                                }

                                for (let n of getNeighborsWithDiagonals(mine.tx, mine.ty)) {
                                    if (isEmpty(n) && n.revealed) {
                                        startFXChangeNumber(n.tx, n.ty);
                                    }
                                }
                            }

                            // let candidates = state.actors.filter(a => !a.defeated && a.id == ActorId.Mine && a.revealed);
                            // for(let mine of candidates)
                            // {
                            //     mine.defeated = true;
                            //     if(mine.revealed)
                            //     {
                            //         startFXDisarmMine(mine.tx, mine.ty);
                            //     }
                            // }
                            makeEmptyAndReveal(pushed);
                            play(candidates.length > 0 ? "earthquake" : "wrong");
                            if (candidates.length > 0) {
                                state.minesDisarmed = true;
                                state.screenShakeTimer = 1;
                            }
                        }
                    }
                    else
                        if (pushed.id == ActorId.SpellMakeOrb) {
                            if (pushed.revealed) {
                                let candidates = state.actors.filter(a => !a.revealed);
                                shuffle(candidates);

                                let pick = null;
                                for (let a of candidates) {
                                    if (state.actors.find(b => !b.revealed && b.id == ActorId.Mine && distance(a.tx, a.ty, b.tx, b.ty) < 1.5) != undefined) {
                                        pick = a;
                                    }
                                }

                                if (pick == null && candidates.length > 0) {
                                    pick = candidates[0];
                                }

                                if (pick != null) {
                                    let toReveal = state.actors.filter(b => !b.revealed && distance(pick.tx, pick.ty, b.tx, b.ty) < 1.5);
                                    let index = 0;
                                    while (index < toReveal.length) {
                                        let pick = toReveal[index++];
                                        pick.revealed = true;
                                        if (pick != pushed) startFXReveal(pick.tx, pick.ty);
                                    }
                                }

                                makeEmptyAndReveal(pushed);
                                play(pick != null ? "reveal" : "wrong");


                                // let candidates = state.actors.filter(a => !a.revealed);
                                // shuffle(candidates);
                                // if(candidates.length > 0)
                                // {
                                //     let a = candidates[0];
                                //     let toReveal = activeActors.filter(b => !b.revealed && distance(a.tx, a.ty, b.tx, b.ty) < 1.5);
                                //     let index = 0;
                                //     while(index < toReveal.length)
                                //     {
                                //         let pick = toReveal[index++];
                                //         pick.revealed = true;
                                //         if(pick != pushed) startFXReveal(pick.tx, pick.ty);
                                //     }    
                                // }
                                // makeEmptyAndReveal(pushed);
                                // play(candidates.length > 0 ? "reveal" : "wrong");

                                // let candidates = state.actors.filter(a => !a.revealed && isEmpty(a));
                                // shuffle(candidates);
                                // if(candidates.length > 0)
                                // {
                                //     let a = candidates[0];
                                //     makeOrb(a);
                                //     a.revealed = true;
                                //     startFXAddOrb(a.tx, a.ty);
                                // }
                                // makeEmptyAndReveal(pushed);
                                // play(candidates.length > 0 ? "spell" : "wrong");
                            }
                        }
                        else
                            if (pushed.id == ActorId.Treasure) {
                                if (pushed.revealed) {
                                    grantXP(pushed.xp);
                                    makeEmptyAndReveal(pushed);
                                    play("pick_xp");
                                }
                            }
                            else
                                if (pushed.id == ActorId.Wall) {
                                    if (pushed.revealed) {
                                        if (state.player.hp == 1) {
                                            // do not kill the player
                                            play("wrong");
                                        }
                                        else {
                                            state.player.hp -= 1;
                                            pushed.wallHP--;
                                            if (pushed.wallHP == 0) {
                                                recursiveReveal(pushed);
                                                if (pushed.contains != null) pushed.contains(pushed); // add whatever is inside the wall
                                                else makeEmpty(pushed);
                                                play("wall_down");
                                                startFXStandard(2, [103, 104], pushed.tx, pushed.ty);
                                            }
                                            else {
                                                play("hit_wall");
                                                if (pushed.wallHP == pushed.wallMaxHP) pushed.stripFrame = 0;
                                                else if (pushed.wallHP == 1) pushed.stripFrame = 2;
                                                else pushed.stripFrame = 1;
                                                pushed.stripFrame += 11;
                                                startFXStandard(1, [0, 1, 2], pushed.tx, pushed.ty);
                                            }
                                        }
                                    }
                                }
                                else
                                    if (pushed.id == ActorId.Chest) {
                                        if (pushed.revealed) {
                                            pushed.contains(pushed);
                                            play("chest_open");
                                        }
                                    }
                                    else
                                        if (pushed.id == ActorId.Orb) {
                                            if (pushed.revealed) {
                                                makeEmptyAndReveal(pushed);

                                                // method: reveal around the spell
                                                let candidates = activeActors.filter(a => !a.revealed && distance(a.tx, a.ty, pushed.tx, pushed.ty) < ORB_RADIUS);
                                                let index = 0;
                                                while (index < candidates.length) {
                                                    let pick = candidates[index++];
                                                    pick.revealed = true;
                                                    if (pick != pushed) startFXReveal(pick.tx, pick.ty);
                                                }

                                                if (candidates.length > 0) {
                                                    play("reveal");
                                                }
                                                else {
                                                    play("wrong");
                                                }
                                            }
                                        }
                                        else
                                            if (pushed.isMonster) {
                                                // combat
                                                // mimic acts mimicky
                                                if (pushed.mimicMimicking && !pushed.revealed) {
                                                    // act dumb
                                                }
                                                else
                                                    if (!pushed.defeated) {
                                                        if (pushed.mimicMimicking) {
                                                            pushed.mimicMimicking = false;
                                                        }

                                                        state.player.hp -= pushed.monsterLevel;
                                                        if (state.player.hp > 0) {
                                                            pushed.defeated = true;
                                                            startTempHeroAnim(HERO_STABBING);
                                                        }

                                                        if (pushed.id == ActorId.Rat) {
                                                            state.killedRats += 1;
                                                        }

                                                        if (pushed.id == ActorId.DragonEgg) {
                                                            play("crack_egg");
                                                        }
                                                        else
                                                            if (pushed.id == ActorId.Giant) {
                                                                play("fight_special");
                                                            }
                                                            else
                                                                if (pushed.id == ActorId.Dragon) {
                                                                    if (pushed.defeated) {
                                                                        state.screenShakeTimer = 0.8;
                                                                        startFXDragonDead(pushed.tx, pushed.ty);
                                                                    }
                                                                    play("dragon_dead");
                                                                }
                                                                else
                                                                    if (pushed.id == ActorId.Mine) {
                                                                        pushed.stripFrame = stripXYToFrame(130, 455);
                                                                        startFXMineExploding(pushed.tx, pushed.ty);
                                                                        play("explode");
                                                                    }
                                                                    else
                                                                        if (pushed.id == ActorId.Gnome) {
                                                                            play("disappointed");
                                                                        }
                                                                        else
                                                                            if (pushed.id == ActorId.RatKing || pushed.id == ActorId.MineKing || pushed.id == ActorId.Wizard || pushed.id == ActorId.Gazer || pushed.id == ActorId.Mimic) {
                                                                                startFXMonsterHit(pushedR);
                                                                                play("fight_special");
                                                                                if (pushed.id == ActorId.Gazer) {
                                                                                    // animate tiles revealed
                                                                                    for (let a of state.actors) {
                                                                                        if (distance(a.tx, a.ty, pushed.tx, pushed.ty) <= 2) {
                                                                                            startFXChangeNumber(a.tx, a.ty);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            // else
                                                                            // if(pushed.id == ActorId.Minion)
                                                                            // {
                                                                            //     // weaken the dragon
                                                                            //     let dragon = state.actors.find(a => a.id == ActorId.Dragon && !a.defeated);
                                                                            //     if(dragon != undefined && pushed.defeated)
                                                                            //     {
                                                                            //         dragon.monsterLevel -= 1;
                                                                            //         startFXWeakenDragon(dragon.tx, dragon.ty);
                                                                            //         play("dragon_hurt");
                                                                            //     }
                                                                            // }
                                                                            else {
                                                                                startFXMonsterHit(pushedR);
                                                                                play("fight");
                                                                            }

                                                    }
                                                    else
                                                        if (state.player.hp > 0 && pushed.revealed) {
                                                            grantXP(pushed.xp);
                                                            if (pushed.id == ActorId.Dragon) {
                                                                makeCrown(pushed);
                                                            }
                                                            else
                                                                if (pushed.id == ActorId.RatKing) {
                                                                    makeSpellRevealRats(pushed);
                                                                }
                                                                else
                                                                    if (pushed.id == ActorId.Wizard) {
                                                                        makeSpellRevealSlimes(pushed);
                                                                        // makeSpellOrb(pushed);
                                                                    }
                                                                    else
                                                                        if (pushed.id == ActorId.Giant) {
                                                                            makeMedikit(pushed);
                                                                        }
                                                                        else
                                                                            if (pushed.id == ActorId.MineKing) {
                                                                                makeSpellDisarm(pushed);
                                                                            }
                                                                            else {
                                                                                makeEmptyAndReveal(pushed);
                                                                            }

                                                            play("pick_xp");
                                                        }
                                                // pushed.revealed = true;
                                            }
                                            else
                                                if (pushed.id == ActorId.Medikit) {
                                                    if (pushed.revealed) {
                                                        if (state.player.hp < state.player.maxHP) {
                                                            state.player.hp = state.player.maxHP;
                                                            play("heal");
                                                        }
                                                        else {
                                                            play("wrong");
                                                        }
                                                        makeEmptyAndReveal(pushed);
                                                    }
                                                }

        if (!pushed.revealed) {
            // pushed.revealed = true;
            if (isEmpty(pushed)) recursiveReveal(pushed);
            else pushed.revealed = true;
            play("uncover");
        }
        else if (pushed.id == ActorId.Wall && !knownGameState.allRevealed) {
            solverLog(`Note: hitting wall before full clear`);
            solverStats.earlyWallHits++;
        }

        let mineKingDefeated = (state.actors.find((a) => a.id == ActorId.MineKing && a.defeated == true) != undefined);
        if (mineKingWasPossible && !mineKingDefeated && state.player.hp <= 10) {
            solverLog(`Missed opportunity to hit mine king ASAP`);
            solverStats.mineKingOpportunitiesMissed += 1;
        }


        state.lastActorTypeClicked = pushed.id;
        state.lastActorNameClicked = pushed.name;
        state.lastTileClicked = pushed;
    }

    // update all the actors
    for (let a of state.actors) {
        if (a.id == ActorId.Minotaur) {
            let chest = state.actors.find(b => b.id == ActorId.Chest && b.tx == a.minotaurChestLocation[0] && b.ty == a.minotaurChestLocation[1]);
            if (a.defeated) {
                // leave as it is
            }
            else
                if (chest == undefined) {
                    // a.stripFrame = stripXYToFrame(250, 360);
                    if (a.minotaurChestLocation[0] > a.tx) a.stripFrame = stripXYToFrame(233, 357);
                    else if (a.minotaurChestLocation[0] < a.tx) a.stripFrame = stripXYToFrame(233 + 16, 357);
                }
                else {
                    // look at the chest
                    if (chest.tx > a.tx) a.stripFrame = stripXYToFrame(250, 320);
                    else if (chest.tx < a.tx) a.stripFrame = stripXYToFrame(200, 320);
                    else if (chest.ty > a.ty) a.stripFrame = stripXYToFrame(230, 320);
                    else a.stripFrame = stripXYToFrame(215, 320);
                }
        }
        else
            if (a.id == ActorId.Giant) {
                if (state.actors.find(b => b.id == a.id && b !== a && !b.defeated) == undefined) {
                    if (a.name == "romeo") a.stripFrame = stripXYToFrame(0, 470);
                    else a.stripFrame = stripXYToFrame(16, 470);
                }
                else {
                    if (a.name == "romeo") a.stripFrame = stripXYToFrame(0, 450);
                    else a.stripFrame = stripXYToFrame(16, 450);
                }
            }
            else
                if (a.id == ActorId.Rat) {
                    let king = state.actors.find(b => b.id == ActorId.RatKing);
                    if (king != undefined) {
                        if (a.tx == king.tx) { a.stripFrame = stripXYToFrame(90, 260) + 3; a.facingDirection = 0; }
                        else if (king.tx > a.tx) { a.stripFrame = stripXYToFrame(90, 260); a.facingDirection = 1; }
                        else { a.stripFrame = stripXYToFrame(90, 260) + 2; a.facingDirection = 3; }
                        // if(king.tx < a.tx) a.stripFrame = stripXYToFrame(90, 260);
                        // else if(king.tx == a.tx) a.stripFrame = stripXYToFrame(90, 260)+1;
                        // else if(king.tx < a.tx) a.stripFrame = stripXYToFrame(90, 260)+2;
                        // else stripXYToFrame(90, 260)+2;
                    }
                    else {
                        a.stripFrame = stripXYToFrame(90, 260) + 3; // standing
                    }
                }
                else
                    if (a.id == ActorId.Mimic && !a.mimicMimicking) {
                        a.stripFrame = stripXYToFrame(70, 375);
                    }
        // else
        // if(a.id == ActorId.Lich && !a.defeated)
        // {
        //     // lich has extra health given by skeletons
        //     a.monsterLevel = makeLich(new Actor()).monsterLevel;
        //     for(let b of state.actors)
        //     {
        //         if(b.id == ActorId.Skeleton && !b.defeated)
        //         {
        //             a.monsterLevel += 1;
        //         }
        //     }
        // }
        // if(a.isTrap && !a.trapDisarmed)
        // {
        //     let neighs = getNeighborsCross(a.tx, a.ty);
        //     if(neighs.find(b => !b.revealed) == undefined)
        //     {
        //         a.revealed = true;
        //     }
        // }
    }

    // TODO: slow to do all the time
    // revealIsolatedGroupsOfMines(activeActors);

    let heroR = new Rect();
    heroR.w = 32;
    heroR.h = 32;
    heroR.y = HUDRect.centery() - heroR.h * 0.5 - 3;
    heroR.x = 55;

    let levelupButtonR = new Rect();
    levelupButtonR.w = 30;
    levelupButtonR.h = HUDRect.h;
    levelupButtonR.y = heroR.y;
    levelupButtonR.x = heroR.x;

    let isLevelupButtonEnabled = state.player.hp > 0 && state.player.xp >= nextLevelXP(state.player.level) && state.status == GameStatus.Playing;
    let tryingToLevelUp = (levelupButtonR.contains(mousex, mousey) && clickedLeft) || clickedActorIndex == SOLVER_WANTS_TO_LEVEL_UP_ACTOR_INDEX;
    let mustLevelup = isLevelupButtonEnabled && tryingToLevelUp;

    if (debugOn) {
        if (keysJustPressed.includes('w')) {
            localStorage.clear();
            loadSettings();
            musicToRun = null;
        }

        // cheats
        if (!RELEASE) {
            if (keysJustPressed.includes('l')) {
                state.player.xp += nextLevelXP(state.player.level);
                mustLevelup = true;
            }

            if (keysJustPressed.includes('k')) {
                for (let a of state.actors.filter(a => a.id == ActorId.Dragon || a.id == ActorId.MineKing)) {
                    a.monsterLevel = 1;
                }
            }

            if (keysJustPressed.includes('i')) {
                state.player.hp = 2;
                state.status = GameStatus.Playing;
            }
        }
    }

    if (mustLevelup) {
        // leveling
        state.player.xp -= nextLevelXP(state.player.level);
        state.player.level += 1;
        if (state.player.maxHP < MAX_HP) {
            if (!isLevelHalfHeart(state.player.level)) {
                state.player.maxHP += 1;
                startHeartAnimation(state.player.maxHP - 1, HEART_NEW);
            }
            else {
                startHeartAnimation(state.player.maxHP, HEART_HALF_GROWING);
            }
        }
        state.player.hp = state.player.maxHP;
        play("level_up");
        state.levelupAnimation.once(LEVELUP_FRAMES, 60);
        state.xpAnimations = [];
        startTempHeroAnim(HERO_LEVELING);
    }

    // win/lose
    if (state.player.hp <= 0) {
        state.player.hp = 0;
        if (oldPlayerHP > 0) {
            state.tempHeroAnim.stop();
            play("lose");
            state.screenShakeTimer = 0.7;
            // reveal everything that needs revealing
            for (let a of state.actors) {
                // a.revealed = true;
                if (a.id == ActorId.Mimic) a.mimicMimicking = false;
                // else if(a.id == ActorId.Chest) a.contains(a);
            }
        }
        solverStats.computeEndStats();
    }
    else {
        if (oldPlayerHP > 1 && state.player.hp == 1 && state.player.xp < nextLevelXP(state.player.level)) {
            play("alarm");
        }

        // run any relevant heart animations
        if (oldPlayerHP < state.player.hp) {
            for (let i = oldPlayerHP; i < state.player.hp; i++) {
                startHeartAnimation(i, HEART_GROWING);
            }
        }
        else
            if (oldPlayerHP > state.player.hp) {
                for (let i = state.player.hp; i < oldPlayerHP; i++) {
                    startHeartAnimation(i, HEART_DRAINING);
                }
            }
    }

    if (oldPlayerXP < state.player.xp && state.player.xp >= nextLevelXP(state.player.level)) {
        play("can_level");
    }

    if (state.player.xp >= nextLevelXP(state.player.level)) {
        for (let i = 0; i < state.player.xp; i++) {
            if (state.xpAnimations.find(a => a.frames == XP_SPINNING && a.index == i) == undefined) {
                loopXPAnimation(i, XP_SPINNING);
            }
        }
    }
    else {
        state.xpAnimations = state.xpAnimations.filter(a => a.frames != XP_SPINNING);
        if (oldPlayerXP < state.player.xp) {
            for (let i = oldPlayerXP; i < state.player.xp; i++) {
                startXPAnimation(i, XP_GROWING);
            }
        }
        else
            if (oldPlayerXP > state.player.xp) {
                for (let i = state.player.xp; i < oldPlayerXP; i++) {
                    startXPAnimation(i, XP_SHRINKING);
                }
            }
    }

    // debugLines.push("hover "+hoveringActorIndex+ " click:"+clickedActorIndex + " hp "+state.player.hp+ " xp "+state.player.xp + " next "+nextLevelXP(state.player.level));
    // debugLines.push("level "+state.player.level+ " next "+nextLevelXP(state.player.level));
    // debugLines.push("maxhp "+state.player.maxHP+ " hp "+state.player.hp);
    if (debugOn) {
        let stats = state.stats;
        debugLines.push("tiles " + (stats.total) + " empties " + stats.empties);
        debugLines.push("monsterXP " + stats.totalXP +
            " xpToMax " + stats.xpRequiredToMax +
            " excessXP " + stats.excessXP);
        debugLines.push("monsterHP " + stats.totalMonsterHP +
            " playerHP " + stats.totalHPOnMaxLevel);
        // debugLines.push("time elapsed pushing button: "+state.timeElapsedPushingButton);
        debugLines.push("level: " + state.player.level);
        debugLines.push("shift: " + shiftIsPressed);
        // debugLines.push("hp anims:"+state.heartAnimations.length+" xp:"+state.xpAnimations.length);
        // for(let a of state.actors)
        // {
        //     let r = getRectForTile(a.tx, a.ty);
        //     if(r.contains(mousex, mousey))
        //     {
        //         debugLines.push("hovering tile  "+a.tx + ", "+a.ty);
        //     }
        // }
    }

    // { 
    //     let xpStr = "";
    //     for(let i = 1; i < 19; i++)
    //     {
    //         xpStr += ""+i+": " + nextLevelXP(i)+" ";
    //     }
    //     debugLines.push(xpStr);
    // }

    if (state.status == GameStatus.Playing) {
        if (state.player.hp == 0) {
            state.status = GameStatus.Dead;
        }
        else
            if (activeActors.find(a => a.id == ActorId.Dragon && !a.defeated) == undefined) {
                state.dragonDefeated = true;
            }
    }

    let isRestartButtonEnabled = state.status == GameStatus.Dead;

    if (clickedLeft && levelupButtonR.contains(mousex, mousey) && !isLevelupButtonEnabled && !isRestartButtonEnabled) {
        startTempHeroAnim(state.player.hp == 1 ? HERO_ITS_A_ME_NAKED : HERO_ITS_A_ME);
        play("jorge", 1);
    }

    if (clickedActorIndex >= 0 || knownGameState.lastUpdateWasMeaningful) {
        updateKnownGameState();
    }

    let resetGame = false;
    if (keysJustPressed.includes('r')) resetGame = true;
    if (clickedLeft && levelupButtonR.contains(mousex, mousey) && isRestartButtonEnabled) {
        resetGame = true;
    }
    if ((solverTesting || gameRandomnessSeeds.length) && isRestartButtonEnabled) {
        resetGame = true;
    }

    // update book movement
    if (state.player.maxHP > 15 && (state.player.maxHP > 16 || isLevelHalfHeart(state.player.level))) {
        state.bookLocationElapsed = Math.min(BOOK_MOVEMENT_DURATION, state.bookLocationElapsed + dt);
    }

    let nomiconR = new Rect();
    nomiconR.w = 32;
    nomiconR.h = 32;
    nomiconR.x = lerp(13, worldR.right() - nomiconR.w - 5, 1 - state.bookLocationElapsed / BOOK_MOVEMENT_DURATION);
    nomiconR.y = HUDRect.centery() - nomiconR.h * 0.5;

    if (clickedLeft && nomiconR.contains(mousex, mousey)) {
        state.showingMonsternomicon = !state.showingMonsternomicon;
        if (!state.showingMonsternomicon) state.bookPage = 0;
        nomiconWasEverRead = true;
        saveSettings();
        play("book");
    }

    let jorgeR = new Rect();
    jorgeR.h = HUDRect.h;
    jorgeR.w = 50;
    jorgeR.y = HUDRect.y;

    // animations
    for (let ha of state.heartAnimations) {
        ha.timer.update(dt);
    }
    state.heartAnimations = state.heartAnimations.filter(anim => !anim.timer.finished);

    for (let ha of state.xpAnimations) {
        ha.timer.update(dt);
    }
    state.xpAnimations = state.xpAnimations.filter(anim => !anim.timer.finished);

    state.tempHeroAnim.update(dt);
    state.heroAnim.update(dt);

    for (let anim of state.animationsFX) {
        anim.timer.update(dt);
    }
    state.animationsFX = state.animationsFX.filter(anim => !anim.timer.finished);

    let clickedHUD = clickedLeft && HUDRect.contains(mousex, mousey);

    // hero animations
    if (state.player.hp == 0) {
        startHeroAnim(HERO_DEAD);
    }
    else
        if (isLevelupButtonEnabled) {
            startHeroAnim(HERO_EMPOWERED);
        }
        else
            if (state.player.hp == 1) {
                startHeroAnim(HERO_NAKED);
            }
            else {
                startHeroAnim(HERO_IDLE);
            }

    // if(state.status == GameStatus.Dead)
    // {
    //     if(clickedHUD) resetGame = true;
    // }
    // else
    // if(state.status == GameStatus.DragonDefeated)
    // {
    //     if(clickedHUD)
    //     {
    //         state.status = GameStatus.WinScreen;
    //     }
    // }

    // screen shake
    let screenx = 0;
    let screeny = 0;
    if (state.screenShakeTimer > 0) {
        state.screenShakeTimer -= dt;
        screenx = rnd(-2, 2);
        screeny = rnd(-1, 1);
    }

    // rendering
    ctx.save();
    ctx.translate(screenx, screeny);

    // ctx.fillStyle = "#30291f";
    // ctx.fillRect(0, 0, worldR.w, worldR.h);
    let showEverything = state.status == GameStatus.Dead;
    for (let i = 0; i < activeActors.length; i++) {
        let a = activeActors[i];
        let r = actorRects[i];
        let centerx = r.centerx();
        let centery = r.centery();
        let pressed = pressedActorIndex >= 0 && activeActors[pressedActorIndex] === a;
        let icon = pressed ? 1 : 0;
        if (isEmpty(a) && a.revealed) icon = 1;
        if (showEverything) icon = 1;
        if (icon == 0 && a.xp > 0 && a.revealed && (!a.isMonster || a.defeated)) icon = 2;
        // do not lower tile with killer monster
        if (state.player.hp == 0 && state.lastTileClicked == a) icon = 0;
        // if(a.id == ActorId.Dragon && a.defeated) icon = 1;
        drawFrame(ctx, stripButtons, icon, centerx, centery);
        if (icon != 1 && icon != 2) drawFrame(ctx, stripButtons, state.buttonFrames[a.tx + a.ty * state.gridW], centerx, centery);
        if (a.revealed || debugOn || showEverything) {
            if (isEmpty(a)) {
                if (state.wallLocations.find(w => w[0] == a.tx && w[1] == a.ty) != undefined) drawFrame(ctx, stripButtons, 43, centerx, centery);
                if (state.chestsLocations.find(w => w[0] == a.tx && w[1] == a.ty) != undefined) drawFrame(ctx, stripButtons, 44, centerx, centery);
                let neighbors = getAttackNumber(a.tx, a.ty);

                {
                    // if(getNeighborsWithDiagonals(a.tx, a.ty).find(b => b.id == ActorId.Gnome && !b.defeated) != undefined)

                    if (state.actors.find(b => b.id == ActorId.Gazer && !b.defeated && distance(b.tx, b.ty, a.tx, a.ty) <= 2) != undefined) {
                        fontUINumbers.drawLine(ctx, "?", centerx, centery, FONT_CENTER | FONT_VCENTER);
                    }
                    else
                        if (neighbors > 0) {
                            fontUINumbers.drawLine(ctx, "" + neighbors, centerx, centery, FONT_CENTER | FONT_VCENTER);
                        }
                }
            }
            else
                if (a.isMonster) {
                    let monsterY = centery - 5;
                    if (a.id == ActorId.Gnome && !a.defeated) monsterY += 5;
                    if (a.defeated && a.deadStripFrame > 0) drawFrame(ctx, a.strip, a.deadStripFrame, centerx, monsterY);
                    else if (a.mimicMimicking) drawFrame(ctx, a.strip, a.stripFrame, centerx, centery);
                    else drawFrame(ctx, a.strip, a.stripFrame, centerx, monsterY);

                    if (a.id == ActorId.Gnome && !a.defeated) {
                        // do not show number
                    }
                    else
                        if (a.defeated) {
                            if (a.xp > 0) {
                                drawXPIndicator(ctx, r, a.xp);
                            }
                            else {
                                monsterY += 5;
                            }
                        }
                        else
                            if (!a.mimicMimicking || debugOn) {
                                // fontUI.drawLine(ctx, ""+a.monsterLevel, r.centerx() + 1, r.bottom() - 4, FONT_CENTER|FONT_BOTTOM);
                                drawLineOutlineCentered(ctx, "" + a.monsterLevel, r.centerx() + 1, r.bottom() - 4, FONT_CENTER | FONT_BOTTOM)
                            }
                }
                else
                    if (a.id == ActorId.Crown) {
                        drawFrame(ctx, stripIconsBig, state.crownAnimation.frame(), centerx, centery);
                        // drawLineOutlineCentered(ctx, "" + state.player.score, r.centerx() + 1, r.bottom() - 3, FONT_CENTER|FONT_BOTTOM);
                    }
                    else
                        if (a.id == ActorId.Treasure) {
                            drawFrame(ctx, a.strip, a.stripFrame, centerx, centery - 4);
                            drawXPIndicator(ctx, r, a.xp);
                        }
                        else {
                            drawFrame(ctx, a.strip, a.stripFrame, centerx, centery);
                            if (debugOn) {
                                if (a.id == ActorId.Wall) {
                                    drawLineOutlineCentered(ctx, a.wallHP + "/" + a.wallMaxHP, r.centerx() + 1, r.bottom() - 3, FONT_CENTER | FONT_BOTTOM);
                                    // drawLineOutlineCentered(ctx, ""+a.contains, r.centerx() + 1, r.bottom() - 15, FONT_CENTER|FONT_BOTTOM);
                                }
                            }
                        }
        }

        if (a.mark > 0 && !a.revealed && !showEverything) {
            drawMarker(ctx, a.mark, centerx, centery);
        }
    }

    // knownGameState hints - show tiles whose power we know
    if (powerHintsOn) {
        for (let i = 0; i < state.gridH; i++) {
            for (let k = 0; k < state.gridW; k++) {

                let actor = getActorAt(k, i);
                if (actor.revealed) {
                    if (!looksLikeClosedChest(actor)) {
                        continue;
                    }
                    if (!knownGameState.couldBeMimic(k, i)) {
                        continue;
                    }
                }

                const knownPower = knownGameState.grid[i][k].knownPower();

                if (knownPower != null) {
                    const r = getRectForTile(k, i);
                    fontUIBlue.drawLine(ctx, "" + knownPower, r.centerx(), r.centery(), FONT_CENTER | FONT_VCENTER);
                    continue;
                }

                // show worst-case scenario if its not a mine (and best case, if >0)
                const worstCasePower = knownGameState.grid[i][k].worstCasePower();
                if (worstCasePower != 100) {
                    const bestCasePower = knownGameState.grid[i][k].bestCasePower();
                    const r = getRectForTile(k, i);
                    if (bestCasePower == 0) {
                        fontUIRed.drawLine(ctx, "" + worstCasePower, r.centerx(), r.centery(), FONT_CENTER | FONT_VCENTER);
                    }
                    else {
                        fontUIRed.drawLine(ctx, "" + bestCasePower + ":" + worstCasePower, r.centerx(), r.centery(), FONT_CENTER | FONT_VCENTER);
                        //fontUIRed.drawLine(ctx, "" + bestCasePower, r.centerx() - 6, r.centery() + 5, FONT_CENTER | FONT_VCENTER);
                    }
                }
            }
        }
    }

    // fx
    for (let a of state.animationsFX) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.scale(a.scale, a.scale);
        drawFrame(ctx, a.strip, a.frames[a.timer.frame], 0, 0);
        ctx.restore();
    }

    // menu rendering
    if (state.hoverMenu.isActive()) {
        let menu = state.hoverMenu;

        // render a frame over the selected actor
        // @ts-ignore
        let r = getRectForTile(state.hoverMenu.actor.tx, state.hoverMenu.actor.ty);
        drawFrame(ctx, stripButtons, 40, r.centerx(), r.centery());

        for (let i = 0; i < hoverRects.length; i++) {
            let r = hoverRects[i];
            drawFrame(ctx, stripIconsBig, 2, r.centerx(), r.centery());
            let offy = state.lastHoveredHoverButtonIndex == i ? 0 : 0;
            drawMarker(ctx, hoverMarkers[i], r.centerx(), r.centery() + offy);
        }
    }
    else
        if (state.timeElapsedPushingButton > 0 && state.lastPushedButtonIndex >= 0) {
            let a = state.actors[state.lastPushedButtonIndex];
            let r = getRectForTile(a.tx, a.ty);
            // drawFrame(ctx, stripButtons, 40, r.centerx(), r.centery());
            let circleFrames = [41, 42];
            let circleFrame = Math.floor((clamp01(state.timeElapsedPushingButton / TIME_TO_HOVER_MENU) * 4) % 2);
            if (state.timeElapsedPushingButton > 0.12) {
                drawFrame(ctx, stripButtons, circleFrames[circleFrame], r.centerx(), r.centery());
            }
        }


    // monsternomicon
    if (state.showingMonsternomicon) {
        updateBook(ctx, dt, worldR, HUDRect, clickedLeft);
    }

    // hud
    drawFrame(ctx, stripHUD, 0, HUDRect.centerx(), HUDRect.centery());

    // hero
    let heroButtonEnabled = isLevelupButtonEnabled || isRestartButtonEnabled;
    drawFrame(ctx, stripLevelupButtons, heroButtonEnabled ? 0 : 1, levelupButtonR.centerx(), levelupButtonR.centery() + 1);
    fontHUD.drawLine(ctx, "Jorge", 10, heroR.centery() + 1, FONT_VCENTER);

    ctx.save();
    ctx.translate(heroR.centerx() - 1, heroR.centery());
    ctx.scale(2, 2);
    if (state.tempHeroAnim.running()) drawFrame(ctx, stripHero, state.tempHeroAnim.frame(), 0, 0);
    else if (state.heroAnim.running()) drawFrame(ctx, stripHero, state.heroAnim.frame(), 0, 0);
    ctx.restore();

    // hp
    if (state.status == GameStatus.Playing) {
        let heartOffsets = [];
        let hpx = 0;
        let hpy = 0;
        for (let i = 0; i < MAX_HP; i++) {
            heartOffsets.push([hpx, hpy]);
            let w = 16;
            if (i > 0 && (i + 1) % 5 == 0 && state.player.maxHP > 1) w += 6;
            if (i == 16) {
                hpx = heartOffsets[i - 1][0];
                hpy += 15;
            }
            hpx += w;
        }

        let offx = heroR.right() + 10;
        let offy = worldR.h - 29;
        for (let i = 0; i < heartOffsets.length; i++) {
            if (i == 0) continue; // skip first heart
            let icon = 2; // blank
            if (i < state.player.hp) icon = 0; // full
            else if (i < state.player.maxHP) icon = 1; // empty
            else if (i == state.player.maxHP && isLevelHalfHeart(state.player.level)) icon = 153;
            let anim = state.heartAnimations.find(anim => anim.index == i);
            if (anim != undefined) icon = anim.frames[anim.timer.frame];
            let coords = heartOffsets[i - 1];
            drawFrame(ctx, stripIcons, icon, coords[0] + offx, coords[1] + offy);
        }

        // show help text at beginning of the game
        if (state.player.level < 4) {
            fontHUD.drawLine(ctx, "Click XP bar", offx + heartOffsets[4][0] + 40, offy, FONT_VCENTER);
            fontHUD.drawLine(ctx, "for automated click", offx + heartOffsets[4][0] + 15, offy + 15, FONT_VCENTER);
        }
    }

    // xp
    if (state.status == GameStatus.Playing) {
        let xpTotal = nextLevelXP(state.player.level);
        let xpOffsetsX = [];
        let xpX = 0;
        let xp = Math.min(state.player.xp, xpTotal);
        for (let i = 0; i < xpTotal; i++) {
            xpOffsetsX.push(xpX);
            let w = 8;
            if (i > 0 && (i + 1) % 5 == 0 && i < (xpTotal - 1) && xpTotal > 5) w += 8;
            xpX += w;
        }

        let offx = heroR.right() + 10;//(worldR.w - xpOffsetsX[xpOffsetsX.length - 1])/2;
        for (let i = 0; i < xpOffsetsX.length; i++) {
            let icon = i < xp ? 6 : 7;
            let anim = state.xpAnimations.find(anim => anim.index == i);
            if (anim != undefined) icon = anim.frames[anim.timer.frame];
            let offy = worldR.h - 14;
            if ((i % 2) == 0) offy += 6;
            drawFrame(ctx, stripIcons, icon, xpOffsetsX[i] + offx, offy);
        }
        offx += xpOffsetsX[xpOffsetsX.length - 1] + 12;

        if (state.player.xp > nextLevelXP(state.player.level)) {
            drawFrame(ctx, stripIcons, 56, offx, worldR.h - 12);
        }

        // for solver. Should be where xp bar is.
        state.autoPlayRect.x = heroR.right() + 10;
        state.autoPlayRect.y = worldR.h - 14;
        state.autoPlayRect.h = 24; // stripIcons cellh
        state.autoPlayRect.w = offx - state.autoPlayRect.x;
    }

    { // levelup button
        // let levelupButtonFrame = isLevelupButtonEnabled ? 0 : 1;
        // drawFrame(ctx, stripLevelupButtons, levelupButtonFrame, levelupButtonR.centerx(), levelupButtonR.centery());
        // drawFrame(ctx, stripLevelupButtons, 2, levelupButtonR.centerx(), levelupButtonR.centery());
    }

    // book icon
    let bookSine = (Math.sin(timeElapsed * 5) + 1) * 0.5 * 5 * (nomiconWasEverRead ? 0 : 1);

    ctx.save();
    ctx.translate(Math.floor(nomiconR.centerx()), Math.floor(nomiconR.centery() + 3));
    ctx.scale(1, 1);
    drawFrame(ctx, stripIconsBig, 1, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(Math.floor(nomiconR.centerx()), Math.floor(nomiconR.centery() - bookSine));
    ctx.scale(1, 1);
    drawFrame(ctx, stripIconsBig, 0, 0, 0);
    ctx.restore();

    if (state.status == GameStatus.Dead) {
        let deathmap = {};
        deathmap[ActorId.Mine] = "exploded by a mine";
        deathmap[ActorId.MineKing] = "crushed by the mine king";
        deathmap[ActorId.Dragon] = "torched by the dragon";
        deathmap[ActorId.Mimic] = "eaten by the mimic";
        deathmap[ActorId.RatKing] = "killed by the rat king";
        deathmap[ActorId.Rat] = "killed by a rat";
        deathmap[ActorId.Slime] = "consumed by a slime";
        deathmap[ActorId.Gargoyle] = "petrified by a gargoyle";
        deathmap[ActorId.Minotaur] = "trampled by a minotaur";
        deathmap[ActorId.Skeleton] = "slain by a skeleton";
        deathmap[ActorId.Snake] = "killed by a snake";
        deathmap[ActorId.Giant] = "mauled by giant"; // special case later
        deathmap[ActorId.Wizard] = "zapped by the wizard";
        deathmap[ActorId.Gazer] = "lobotomized by a gazer";
        deathmap[ActorId.BigSlime] = "liquefied by a slime";
        deathmap[ActorId.Bat] = "killed by a bat";
        deathmap[ActorId.Guard] = "killed by a guardian";
        deathmap[ActorId.Fidel] = "this should never happen";
        deathmap[ActorId.DragonEgg] = "this should never happen";
        let deathCause = deathmap[state.lastActorTypeClicked];
        if (state.lastActorNameClicked == "romeo") deathCause = "mauled by romeo";
        else if (state.lastActorNameClicked == "juliet") deathCause = "mauled by juliet";

        drawMultiline(ctx, fontHUD, [deathCause, "< restart"], levelupButtonR.right() + 5, HUDRect.centery(), FONT_VCENTER);
    }
    // else if(state.status == GameStatus.DragonDefeated)
    // {
    //     let msg = state.clearedBoard ? "DRAGON LAIR WIPED OUT!!!" : "DRAGON DEFEATED!";
    //     drawMultiline(ctx, fontHUD, [msg, "< win the game"], levelupButtonR.right() + 5, HUDRect.centery(), FONT_VCENTER);
    // }

    if (state.levelupAnimation.running()) {
        state.levelupAnimation.update(dt);
        ctx.save();
        ctx.translate(70, HUDRect.bottom() - 65);
        ctx.scale(0.4, 0.4);
        drawFrame(ctx, stripLevelup, state.levelupAnimation.frame(), 0, 0);
        ctx.restore();
    }

    if (state.crownAnimation.running()) {
        state.crownAnimation.update(dt);
    }

    ctx.restore();

    if (resetGame) {
        if (solverTesting) {
            updateSolverTestingStats();
        }
        newGame();
        play("restart");
    }
}

function getGnomeFavoriteJumpTarget() {
    let bestCandidate = null;
    let closestCandidateDist = 1000000;
    for (let c of state.actors) {
        if (!isEmpty(c) || c.revealed) continue;
        for (let n of state.actors) {
            if (n.id != ActorId.Medikit) continue;
            let delta = distance(n.tx, n.ty, c.tx, c.ty);
            if (delta < closestCandidateDist) {
                closestCandidateDist = delta;
                bestCandidate = c;
            }
        }
    }

    return bestCandidate;
}

function isLevelHalfHeart(level) {
    return level % 2 == 0;
}

function drawMarker(ctx, mark, centerx, centery) {
    let x = Math.floor(centerx);
    let y = Math.floor(centery);
    if (mark == 16) {
        drawFrame(ctx, stripIcons, 141, centerx, centery);
    }
    else
        if (mark == 15) {
            drawFrame(ctx, stripIcons, 145, centerx, centery);
        }
        else
            if (mark == 14) {
                drawFrame(ctx, stripIcons, 143, centerx, centery);
            }
            else
                if (mark == 13) {
                    drawFrame(ctx, stripIcons, 140, centerx, centery);
                }
                // else
                // if(mark == 12)
                // {
                //     drawFrame(ctx, stripIcons, 143, centerx, centery);
                // }
                else {
                    let str = "" + mark;
                    let centering = FONT_CENTER | FONT_VCENTER;
                    let text = str;
                    fontUIBlackDark.drawLine(ctx, text, x + 1, y, centering);
                    fontUIBlackDark.drawLine(ctx, text, x, y + 1, centering);
                    fontUIBlackDark.drawLine(ctx, text, x - 1, y, centering);
                    fontUIBlackDark.drawLine(ctx, text, x, y - 1, centering);
                    fontUIBlackDark.drawLine(ctx, text, x + 1, y + 1, centering);
                    fontUIBlackDark.drawLine(ctx, text, x - 1, y + 1, centering);
                    fontUIBlackDark.drawLine(ctx, text, x - 1, y - 1, centering);
                    fontUIBlackDark.drawLine(ctx, text, x + 1, y - 1, centering);
                    fontUIYellow.drawLine(ctx, text, x, y, centering);
                }
}

function updateWinscreen(ctx, dt) {
    // state.clearedBoard = true;
    musicToRun = "music_win";

    let r = new Rect();
    r.w = backBuffer.width;
    r.h = backBuffer.height;

    ctx.fillStyle = "#000000";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    let img = hasStamp(STAMP_CLEAR) ? imgJuliDragonAlternate : imgJuliDragon;
    ctx.drawImage(img, r.centerx() - imgJuliDragon.width / 2, -10);

    let lines = [];
    if (hasStamp(STAMP_CLEAR)) {
        lines.push("Nothing but blood in the desolate field,");
        lines.push("Echoes of battles the wind has revealed.");
        // lines.push("Echoes of battles that fade in the wind.");
        lines.push("Jorge looks up, and a question is posed:");
        lines.push("Perhaps I'm not different from those I've disposed?");
    }
    else {
        // lines.push("As the deadly beast finally expires");
        // lines.push("Jorge's thoughts get clouded");
        // lines.push("By his troubled desires.");
        // lines.push("");
        // lines.push("\"Is this the end? Shall I too say farewell");
        // lines.push("To the battlefields, and let my body rest");
        // lines.push("And be part of the bonfire?\"");
        lines.push("Sitting beside the smoking remains");
        lines.push("Jorge admires the dragon's red scales");
        lines.push("Deaf to the cheers of celebrating men");
        lines.push("a hunter without the bond of his prey");
    }

    // lines.push("sitting next to the smoking corpse");
    // lines.push("jorge admires the glimmer of its scales");
    // lines.push("oblivious to the celebrations of men");
    // lines.push("a hunter without the bond of his prey");
    // lines.push("feeling the bitter sting of loneliness");
    let deltaSeconds = Math.floor((state.endTime - state.startTime) / 1000);
    let deltaMinutes = Math.floor(deltaSeconds / 60) % 60;
    let deltaHours = Math.floor(deltaMinutes / 60);
    let deltaSecondsAjusted = deltaSeconds % 60;
    let timeStr = "#" + deltaHours + ":" + deltaMinutes + ":" + deltaSecondsAjusted.toString().padStart(2, "0");

    lines.push("");
    lines.push("score: " + state.player.score + "  (max: " + state.stats.totalXP + ")");
    lines.push(timeStr);
    drawMultiline(ctx, fontWinscreen, lines, r.centerx(), 185, FONT_CENTER | FONT_VCENTER, 6);

    fontCredits.drawLine(ctx, "por daniel benmergui - " + version, WORLDW - 5, WORLDH - 5, FONT_RIGHT);

    // let stampx = (WORLDW - state.stampsCollectedThisRun.length * 30 - (state.stampsCollectedThisRun.length - 1) * 5) * 0.5;
    let stampsW = state.stampsCollectedThisRun.length * 30 + (state.stampsCollectedThisRun.length - 1) * 5;
    let stampx = WORLDW * 0.5 - stampsW * 0.5 + 30 * 0.5;
    let stampy = 293;
    for (let stampId of state.stampsCollectedThisRun) {
        let index = STAMP_SPEC_IDS.findIndex(s => s == stampId);
        drawFrame(ctx, stripStamps, STAMP_SPEC_FRAME[index], stampx, stampy);
        stampx += 35;
    }
}

function hasStamp(id) {
    return collectedStamps.includes(id);
}

function onUpdate(phase, dt) {
    if (phase == UpdatePhase.Init) {
        WORLDW = 390;// + 30*2;
        WORLDH = 330 + 10;
        ZOOMX = 2;
        ZOOMY = 2;

        stripStoryteller = loadStrip("storyteller.png", 158, 62, 158 / 2, 62 / 2);
        stripStamps = loadStrip("badges.png", 30, 30, 30 / 2, 30 / 2);
        stripBookFlap = loadStrip("bookflap.png", 24, 24, 24 / 2, 24 / 2);
        stripIconsBig = loadStrip("icons24x24.png", 24, 24, 24 / 2, 24 / 2);
        stripHintLevelup = loadStrip("hint_levelup.png", 32, 32, 32 / 2, 32 / 2);
        stripHint = loadStrip("hint.png", 90, 90, 90 / 2, 90 / 2);
        stripHero = loadStrip("hero.png", 16, 16, 16 / 2, 16 / 2);
        stripButtons = loadStrip("buttons30x30.png", 30, 30, 15, 15);
        stripLevelupButtons = loadStrip("levelup_buttons.png", 30, 29, 15, 29 / 2);
        stripIcons = loadStrip("icons16x16.png", 16, 16, 8, 8);
        stripMonsters = loadStrip("tiny_dungeon_monsters.png", 16, 16, 8, 8);
        stripHUD = loadStrip("hud.png", 390, 41, 390 / 2, 41 / 2);
        stripBook = loadStrip("book.png", 381, 289, 381 * 0.5, 289 * 0.5);
        stripFX = loadStrip("uf_FX_impact.png", 48, 48, 48 / 2, 48 / 2);
        stripScanlines = loadStrip("scanlines.png", 450, 335, 0, 0);
        stripLevelup = loadStrip("levelup.png", 225, 125, 225 / 2, 125 / 2);
        imgJuliDragon = loadImage("juli_dragon.png");
        imgJuliDragonAlternate = loadImage("juli_dragon_alternate.png");

        fontDebug = loadFont("font_small_white.png", 6, 6, 0, 6,
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-+=:;,\"<>.?/\\[]_| ",
            false);
        fontDebug.spaceWidth = 5;

        fontCredits = loadFont("font_small_gray.png", 6, 6, 0, 6,
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-+=:;,\"<>.?/\\[]_| ",
            false);
        fontCredits.spaceWidth = 5;

        fontUIBook = loadFont("font_small_book.png", 6, 6, 0, 6,
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-+=:;,\"<>.?/\\[]_| ",
            false);
        fontUIBook.spaceWidth = 5;

        fontUINumbers = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0xd9d9d9);
        fontUINumbers.char_sep -= 2;
        fontUINumbers.spaceWidth = 5;

        fontHUD = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0xd9d9d9);
        fontHUD.spaceWidth = 5;
        // fontHUD.char_sep -= 1;

        fontWinscreen = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0x8a8a8a);
        // fontHUD.char_sep -= 1;
        fontWinscreen.spaceWidth = 5;

        fontUIOrange = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0xffb700);
        fontUIOrange.char_sep -= 1;
        fontUIOrange.spaceWidth = 5;

        fontUIGray = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0x454545);
        fontUIGray.char_sep -= 1;
        fontUIGray.spaceWidth = 5;

        fontUIYellow = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0xf7e26b);
        fontUIYellow.char_sep -= 1;
        fontUIYellow.spaceWidth = 5;

        fontUIBlue = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0x1ff);
        fontUIBlue.char_sep -= 1;
        fontUIBlue.spaceWidth = 5;

        fontUIBlackDark = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0x000000);
        fontUIBlackDark.char_sep -= 1;
        fontUIBlackDark.spaceWidth = 5;

        fontBook = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0x4f2a07);
        fontBook.char_sep -= 0;
        fontBook.spaceWidth = 5;

        fontUIRed = loadFont("ingame_font.png", 8, 8, 0, 8,
            "1234567890!#$%&*()-+=[]:;\"'<>,.?/ABCDEFGHIJKLMNOPQRSTUVWXYZ _",
            false, 0xff0d31);
        fontUIRed.char_sep -= 1;
        fontUIRed.spaceWidth = 5;

        addSound("crack_egg", "egg.wav");
        addSound("pageflip", "pageflip.wav");
        addSound("open_hover", "open_hover.wav");
        addSound("close_hover", "close_hover.wav");
        addSound("hover_over_button", "ui_hover.wav");
        addSound("dragon_hurt", "dragon_complaining.wav");
        addSound("dragon_dead", "dragon_death.wav");
        addSound("music_win", "Dragon_Final.mp3");
        addSoundStreamed("music", "Dragon_ingame.mp3");
        addSound("gnome_jump", "laugh.wav");
        addSound("disappointed", "disappointed.wav");
        addSound("earthquake", "shake.wav");
        addSound("can_level", "level_ready.wav");
        addSound("alarm", "alarm.wav");
        addSound("lose", "death.wav");
        addSound("win", "win.wav");
        addSound("explode", "death.wav");
        addSound("hit_wall", "hitWall.wav");
        addSound("hit_wall", "hit_wall2.wav");
        addSound("chest_open", "chestOpen.wav");
        addSound("uncover", "click.wav");
        addSound("uncover", "click2.wav");
        addSound("uncover", "click3.wav");
        addSound("uncover", "click4.wav");
        addSound("uncover", "click5.wav");
        addSound("uncover", "click6.wav");
        addSound("pick_xp", "pickupCoin.wav");
        addSound("reveal", "orb1.wav");
        addSound("reveal", "orb2.wav");
        addSound("restart", "restart.wav");
        addSound("heal", "healnew.wav");
        addSound("fight", "fight1.wav");
        addSound("fight", "fight2.wav");
        addSound("fight", "fight3.wav");
        addSound("fight_special", "hit_hard.wav");
        addSound("spell", "spell2.wav");
        addSound("wall_down", "wall_down.wav");
        addSound("level_up", "level_up.wav");
        addSound("book", "book.wav");
        addSound("mark", "mark.wav");
        addSound("remove_mark", "mark_highpitch.wav");
        addSound("wrong", "wrong.wav");
        addSound("jorge", "jorge.wav");

        function addSound(eventId, path) {
            if (!(eventId in sndEvents)) {
                sndEvents[eventId] = [];
            }
            sndEvents[eventId].push(loadSound("data/" + path));
        }

        function addSoundStreamed(eventId, path) {
            if (!(eventId in sndEvents)) {
                sndEvents[eventId] = [];
            }
            sndEvents[eventId].push(loadSoundStreamed("data/" + path));
        }
    }
    else if (phase == UpdatePhase.Loading) {
        let ctx = backBuffer.getContext("2d");
        let r = new Rect(0, 0, backBuffer.width, backBuffer.height);
        showLoadingC64(ctx, r);
    }
    else if (phase == UpdatePhase.DoneLoading) {
        loadSettings();
        musicToRun = "music";
        newGame();
    }
    else if (phase == UpdatePhase.Updating) {
        // handle music
        if (playerInteracted) {
            if (musicOn && musicToRun != null) {
                if (runningMusic == null || runningMusic.paused || runningMusicId != musicToRun) {
                    if (runningMusicId != musicToRun && runningMusic != null) {
                        runningMusic.pause();
                    }
                    runningMusicId = musicToRun;
                    let tracks = sndEvents[musicToRun];
                    runningMusic = tracks[rnd(0, tracks.length)];
                    runningMusic.volume = 0.5;
                    runningMusic.play();
                }
            }
            else
                if (runningMusic != null && !runningMusic.paused) {
                    runningMusic.pause();
                }
        }

        let ctx = get2DContext(backBuffer);
        ctx.imageSmoothingEnabled = false;

        if (state.status == GameStatus.GeneratingDungeon) {
            updateGeneratingDungeon(ctx, dt);
        }
        else
            if (state.status == GameStatus.Playing || state.status == GameStatus.Dead) {
                updatePlaying(ctx, dt);
            }
            else if (state.status == GameStatus.WinScreen) {
                updateWinscreen(ctx, dt);
                if ((solverTesting && Date.now() - lastSolverTestingAction > solverTestingCadenceMs) || gameRandomnessSeeds.length) {
                    updateSolverTestingStats();
                    newGame();
                }
            }

        drawFrame(ctx, stripScanlines, 0, 0, 0);

        if (keysJustPressed.includes('D')) {
            debugOn = !debugOn;
        }

        if (debugOn) {
            // TODO: use internal font in common code
            ctx.save();
            // ctx.fillStyle = "black";
            // ctx.fillRect(0, 20, canvas.width, canvas.height - 20);
            ctx.fillStyle = "white";
            ctx.font = '32px serif';
            let offy = 20;
            for (let line of debugLines) {
                fontDebug.drawLine(ctx, line, 5, offy);
                // ctx.fillText(line, 5, offy);
                offy += fontDebug.lineh;
            }
            ctx.restore();
        }
        debugLines = [];
    }
}

function drawXPIndicator(ctx, rect, xp) {
    let offx = rect.centerx() - 5;
    if (xp >= 10) offx -= 4;
    drawFrame(ctx, stripIcons, 8, offx, rect.bottom() - 7);
    fontUIYellow.drawLine(ctx, "" + xp, rect.centerx() + 4, rect.bottom() - 4, FONT_CENTER | FONT_BOTTOM);
}

function drawMultiline(ctx, font, lines, x, y, centering, vsep = 5) {
    let textR = new Rect();
    textR.h = 24;
    textR.y = y - textR.h / 2;

    let offy = 0;
    for (let line of lines) {
        let lineR = font.processLine(ctx, line, x, offy + y, 100000, false);
        textR.w = Math.max(textR.w, lineR.w);
        offy += font.lineh + vsep;
    }
    textR.x = x - textR.w / 2;

    offy = 0;
    for (let line of lines) {
        font.drawLine(ctx, line, x, offy + textR.y + font.lineh - 2, centering);
        offy += font.lineh + vsep;
    }
}