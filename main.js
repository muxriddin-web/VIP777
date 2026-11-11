(function () {
    "use strict";

    // ===== SOZLAMALAR =====
    const CONFIG = {
        START_BALANCE: 310,   // boshlang'ich balans
        BET: 10,              // bitta Spin narxi
        WIN_THREE: 100,       // 3 ta bir xil (777 dan tashqari)
        WIN_777: 250000       // 777 jekpot mukofoti
    };

    const items = ["💲", "7️⃣", "🍒", "🍑", "🍌", "🍇", "🍓", "🍊", "🍉", "🍈", "🍏"];
    const SEVEN = "7️⃣";

    const app = document.getElementById("app");
    const doors = Array.from(document.querySelectorAll(".door"));
    const spinBtn = document.getElementById("spinner");
    const resetBtn = document.getElementById("reseter");
    const balanceEl = document.getElementById("balance");
    const infoEl = document.getElementById("info");
    const jackpotEl = document.getElementById("jackpot");

    const BASE_DURATION = 2;   // 1-g'altak to'xtash vaqti (soniya)
    const STEP = 0.6;          // keyingi g'altaklar orasidagi kechikish

    let balance = CONFIG.START_BALANCE;
    let shown = ["?", "?", "?"];
    let busy = false;

    // ===== AUDIO (Web Audio, tashqi fayl kerak emas) =====
    let ctx = null;
    function audio() {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) ctx = new AC();
        }
        if (ctx && ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    function tone(freq, start, dur, type, vol) {
        const c = audio();
        if (!c) return;
        const t = c.currentTime + start;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    // 777 tushganda: quvnoq fanfara musiqasi (~7 soniya)
    function playJackpotMusic() {
        const N = { C4: 261.63, G4: 392, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5 };
        const melody = [
            ["C5", 0, 0.2], ["E5", 0.2, 0.2], ["G5", 0.4, 0.2], ["C6", 0.6, 0.45],
            ["G5", 1.1, 0.2], ["C6", 1.3, 0.2], ["E6", 1.5, 0.7],
            ["A5", 2.2, 0.2], ["G5", 2.4, 0.2], ["E5", 2.6, 0.2], ["D5", 2.8, 0.2], ["C6", 3.0, 0.5]
        ];
        for (let loop = 0; loop < 3; loop++) {
            const offset = loop * 3.6;
            melody.forEach(function (n) {
                tone(N[n[0]], offset + n[1], n[2], "square", 0.08);
                tone(N[n[0]] / 2, offset + n[1], n[2], "triangle", 0.1);
            });
            tone(N.C4, offset, 1.7, "triangle", 0.12);
            tone(N.G4, offset + 1.8, 1.7, "triangle", 0.12);
        }
    }

    // Balans 0 bo'lganda: g'amgin tushuvchi ovoz
    function playZeroSound() {
        [[392, 0], [349, 0.4], [330, 0.8], [262, 1.2]].forEach(function (n, i) {
            tone(n[0], n[1], i === 3 ? 1.1 : 0.4, "sawtooth", 0.1);
        });
    }

    // ===== UI =====
    function updateBalance() {
        balanceEl.textContent = balance.toLocaleString("en-US");
        spinBtn.disabled = busy || balance <= 0;
        resetBtn.disabled = busy;
    }

    function setWin(on) {
        app.classList.toggle("win", on);
        doors.forEach(function (d) { d.classList.toggle("win", on); });
    }

    function clearResult() {
        setWin(false);
        jackpotEl.classList.remove("show");
    }

    // ===== G'ALTAKLAR =====
    function randomItem() {
        return items[Math.floor(Math.random() * items.length)];
    }

    function render(door, list, duration) {
        const boxes = door.querySelector(".boxes");
        const clone = boxes.cloneNode(false);
        const h = door.clientHeight;

        list.forEach(function (symbol) {
            const box = document.createElement("div");
            box.className = "box";
            box.style.width = door.clientWidth + "px";
            box.style.height = h + "px";
            box.textContent = symbol;
            clone.appendChild(box);
        });

        const finalY = "translateY(-" + h * (list.length - 1) + "px)";
        clone.style.transition = "none";
        clone.style.transform = "translateY(0)";
        door.replaceChild(clone, boxes);

        if (duration > 0) {
            clone.getBoundingClientRect(); // animatsiya boshlanishi uchun
            clone.style.transition = "transform " + duration + "s cubic-bezier(0.2, 0.8, 0.2, 1)";
        }
        clone.style.transform = finalY;
    }

    function init() {
        shown = ["?", "?", "?"];
        balance = CONFIG.START_BALANCE;
        busy = false;
        clearResult();
        doors.forEach(function (door) { render(door, ["?"], 0); });
        infoEl.textContent = "Tikish: " + CONFIG.BET + "$  |  3 ta bir xil: +" + CONFIG.WIN_THREE + "$  |  777: +" + CONFIG.WIN_777 + "$";
        updateBalance();
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    async function spin() {
        if (busy || balance <= 0) return;
        audio(); // brauzer ovoz ruxsati uchun (foydalanuvchi bosgan lahza)
        busy = true;
        clearResult();

        const bet = Math.min(CONFIG.BET, balance);
        balance -= bet;
        updateBalance();
        infoEl.textContent = "";

        const result = doors.map(randomItem);
        doors.forEach(function (door, i) {
            const filler = Array.from({ length: 14 + i * 6 }, randomItem);
            render(door, [shown[i]].concat(filler, result[i]), BASE_DURATION + i * STEP);
        });

        await wait((BASE_DURATION + (doors.length - 1) * STEP) * 1000 + 150);

        shown = result;
        busy = false;
        finish(result);
    }

    function finish(result) {
        const triple = result.every(function (s) { return s === result[0]; });

        if (triple) {
            const jackpot = result[0] === SEVEN;
            const prize = jackpot ? CONFIG.WIN_777 : CONFIG.WIN_THREE;
            balance += prize;
            setWin(true);
            infoEl.textContent = "Yutuq: +" + prize.toLocaleString("en-US") + "$";
            if (jackpot) {
                document.getElementById("jackpotAmount").textContent = prize;
                jackpotEl.classList.add("show");
                playJackpotMusic();
            }
        } else if (balance === 0) {
            infoEl.textContent = "Balans tugadi. Qayta boshlash uchun Reset bosing.";
            playZeroSound();
        }
        updateBalance();
    }

    spinBtn.addEventListener("click", spin);
    resetBtn.addEventListener("click", init);

    init();
})();
