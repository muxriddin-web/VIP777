(function () {
    "use strict";

    const items = [
        "7️⃣", "🍒", "🍓", "🍋", "🍉", "🍇", "💵"
    ];
    
    // O'yin sozlamalari
    let balance = 100;
    const betCost = 10; // Har bir aylantirish narxi
    let isSpinning = false;

    const doors = document.querySelectorAll(".door");  
    const spinBtn = document.querySelector("#spinner");  
    const resetBtn = document.querySelector("#reseter"); 
    const infoText = document.querySelector('.info');
    const balanceDisplay = document.querySelector('#balance-amount');

    // Boshlang'ich ma'lumotlar text ko'rinishida pastda chiqmasligi uchun tozalaymiz
    infoText.textContent = "Try your luck!";
    balanceDisplay.textContent = balance;

    spinBtn.addEventListener("click", spin);  
    resetBtn.addEventListener("click", () => resetGame()); 

    function spin() {
        if (isSpinning) return;
        
        // Balansni tekshirish
        if (balance < betCost) {
            infoText.textContent = "⚠️ Not enough funds! Click the Reset button.";
            infoText.style.color = "#ff3333";
            return;
        }

        // Balansni kamaytirish
        balance -= betCost;
        balanceDisplay.textContent = balance;
        
        isSpinning = true;
        spinBtn.disabled = true;
        resetBtn.disabled = true;
        infoText.textContent = "Slots spinning...";
        infoText.style.color = "#fff";

        const results = [];
        const duration = 2; // sekundda animatsiya vaqti
        const groups = 3;   // aylanishlar soni (effekt uchun)

        doors.forEach((door, index) => {
            const boxes = door.querySelector(".boxes");
            const boxesClone = boxes.cloneNode(false);  
            const pool = []; 

            // Tasodifiy aylanish elementlari ro'yxati
            const arr = [];
            for (let n = 0; n < groups; n++) {
                arr.push(...items);
            }
            pool.push(...shuffle(arr));  

            // Oxirgi to'xtash emojisini aniqlash va saqlash
            const winningItem = pool[0];
            results.push(winningItem);

            // Box elementlarini generatsiya qilish
            for (let i = pool.length - 1; i >= 0; i--) {
                const box = document.createElement("div");
                box.classList.add("box");
                box.style.width = door.clientWidth + "px"; 
                box.style.height = door.clientHeight + "px"; 
                box.textContent = pool[i];  
                boxesClone.appendChild(box);
            }

            // Animatsiya sozlamalari (JS orqali boshqariladi)
            boxesClone.style.transition = `transform ${duration + index * 0.5}s cubic-bezier(0.1, 1, 0.1, 1)`;
            boxesClone.style.transform = `translateY(0px)`;
            
            door.replaceChild(boxesClone, boxes); 

            // Brauzerga o'zgarishni his qildirish va animatsiyani ishga tushirish
            setTimeout(() => {
                boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1)}px)`;
            }, 50);
        });

        // Hamma eshiklar aylanib bo'lgandan keyingi hisob-kitob (eng oxirgi eshik tugash vaqti)
        setTimeout(() => {
            checkResult(results);
            isSpinning = false;
            spinBtn.disabled = false;
            resetBtn.disabled = false;
        }, (duration + (doors.length - 1) * 0.5) * 1000 + 100);
    }

    // Yutuqni tekshirish mantiqi
    function checkResult(results) {
        const [r1, r2, r3] = results;

        if (r1 === r2 && r2 === r3) {
            // Uchchalasi bir xil tushsa (Jackpot)
            let prize = 100;
            if (r1 === "7️⃣") prize = 250; // Omadli 7 lik uchun maxsus katta yutuq
            balance += prize;
            infoText.textContent = `🎉 JEKPOT! +${prize}$ you won!`;
            infoText.style.color = "#00ff66";
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            // Ikkita eshik bir xil bo'lsa
            balance += 20;
            infoText.textContent = "🥳 Kichik yutuq! +20$";
            infoText.style.color = "#33ccff";
        } else {
            // Yutqazganda
            infoText.textContent = "❌ Yana bir bor urinib ko'ring!";
            infoText.style.color = "#ff3333";
        }

        balanceDisplay.textContent = balance;
    }

    function shuffle(arr) {
        let m = arr.length;
        let i, temp;
        while (m) {
            i = Math.floor(Math.random() * m--);
            temp = arr[m];
            arr[m] = arr[i];
            arr[i] = temp;
        }
        return arr;
    }

    function resetGame() {
        if (isSpinning) return;
        balance = 100;
        balanceDisplay.textContent = balance;
        infoText.textContent = "O'yin yangilandi! Davom etamiz.";
        infoText.style.color = "#fff";
        init();
    }

    function init() {
        for (const door of doors) {
            const boxes = door.querySelector(".boxes");
            const boxesClone = boxes.cloneNode(false);
            const box = document.createElement("div");
            box.classList.add("box");
            box.style.width = door.clientWidth + "px";
            box.style.height = door.clientHeight + "px";
            box.textContent = "❓";
            boxesClone.appendChild(box);
            door.replaceChild(boxesClone, boxes);
        }
    }

    init();  
})();
