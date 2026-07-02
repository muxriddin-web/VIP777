
(function () {
    "use strict";
    const items = [
         "💲", "7️⃣", "🍒", "🍑", "🍌", "🍇", "🍓", "🍊", "🍉", "🍈", "🍏", // Emojilar va mevalar
        // "★", "♦", "▲", "◯", "⊿", "▽", "■",  "○", "∞", "□",  // Geometrik shakllar
        // "♥", "♠", "$", "♣", "☆", "☻", "☺", "&"   // Boshqa shakllar va maxsus belgilar
    ];
    
    const stickerContainer = document.getElementById("stickerContainer");
/////////////////////////////////////////////////////////////////////////////////////////////
    document.querySelector('.info').textContent = items.join(" ");

    const doors = document.querySelectorAll(".door");  
    document.querySelector("#spinner").addEventListener("click", spin);  
    document.querySelector("#reseter").addEventListener("click", init); 

    function spin() {
        init(false, 1, 2);  


        for (const door of doors) {
            const boxes = door.querySelector(".boxes");
            boxes.style.animation = "spinAnimation 2s ease-in-out";  // Animatsiyani boshlash
        }
    }
///////////////////////////////////////////////////////////////////////////////////////////////
    function init(firstInit = true, groups = 1, duration = 1) {
        for (const door of doors) {
            if (firstInit) {
                door.dataset.spinned = "0";  
            } else if (door.dataset.spinned === "1") {
                return;  
            }

            const boxes = door.querySelector(".boxes");
            const boxesClone = boxes.cloneNode(false);  
            const pool = []; 
            if (!firstInit) {
                const arr = [];
                for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
                    arr.push(...items);
                }
                pool.push(...shuffle(arr));  
            } else {
                pool.push("?");
            }
///////////////////////////////////////////////////////////////////////////////////////////////
            // Yangi box elementlarini yaratish
            for (let i = pool.length - 1; i >= 0; i--) {
                const box = document.createElement("div");
                box.classList.add("box");
                box.style.width = door.clientWidth + "px"; 
                box.style.height = door.clientHeight + "px"; 
                boxesClone.appendChild(box);
                box.textContent = pool[i];  
            }

            boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;  // Animatsiya davomiyligi
            boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1)}px)`; 
            door.replaceChild(boxesClone, boxes); 
        }
    }
//////////////////////////////////////////////////////////////////////////////
    // Belgilarni tasodifiy aralashtirish
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

    init();  
})();
