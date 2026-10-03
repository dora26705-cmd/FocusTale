

console.log(
    "【測試】app.js 已載入"
);
function updateAttentionDebugPanel(
    faceDetected,
    horizontal = null,
    vertical = null
) {

    console.log(
        "【測試】updateAttentionDebugPanel 有成功執行",
        faceDetected,
        horizontal,
        vertical
    );

}
/* =========================================================
   FocusTale - app.js
   小兔貝貝的森林尋友記
========================================================= */


/* =========================================================
   1. 首頁
========================================================= */

function startStory() {
    window.location.href = "assets/story.html";
}

function openReport() {
    window.location.href = "pages/report.html";
}


/* =========================================================
   2. 故事基本設定
========================================================= */

let currentStoryPage = 1;

const totalStoryPages = 7;


/* =========================================================
   3. 第三幕狀態
========================================================= */

let deerSearchActive = false;

let deerSearchStartTime = null;

let deerFound = false;


/* =========================================================
   4. 第四幕狀態
========================================================= */

let giftSearchActive = false;

let giftSearchStartTime = null;

let foundGiftCount = 0;

let giftTimes = [];


/* =========================================================
   5. 第五幕蝴蝶狀態
========================================================= */

let butterflyTimer = null;

let butterflyFinished = false;


/* =========================================================
   6. 第六幕問題狀態
========================================================= */

let scene6QuestionActive = false;

let scene6QuestionStartTime = null;

let scene6Answered = false;


/* =========================================================
   7. 第七幕結尾狀態
========================================================= */

let scene7EndingStarted = false;

let scene7EndingTimer = null;

let scene7FinishTimer = null;


/* =========================================================
   8. 行為紀錄
========================================================= */

let storyData = {

    /* 第三幕 */
    deerReactionTime: null,

    deerSearchCompleted: false,


    /* 第四幕 */
    giftSearchCompleted: false,

    giftTotalTime: null,

    giftTimes: [],


    /* 第六幕 */
    scene6ReactionTime: null,

    scene6SelectedAnswer: null,

    scene6Correct: null,

    scene6Completed: false,


    /* 整個故事 */
    storyCompleted: false,

    completedAt: null
};


/* =========================================================
   9. 讀取之前紀錄
========================================================= */

const savedStoryData =
    localStorage.getItem(
        "focusTaleStoryData"
    );


if (savedStoryData) {

    try {

        storyData = {

            ...storyData,

            ...JSON.parse(
                savedStoryData
            )

        };

    } catch (error) {

        console.log(
            "無法讀取之前的故事紀錄。"
        );

    }

}


/* =========================================================
   10. 場景資料
========================================================= */

const storyScenes = {


    /* 第一幕 */
    1: {

        image:
            "../assets/images/scene1.png",

        speaker:
            "貝貝",

        text:
            "媽媽，我今天要去森林找小鹿甜甜！"

    },


    /* 第二幕 */
    2: {

        image:
            "../assets/images/scene2.png",

        speaker:
            "旁白",

        text:
            "貝貝走進森林，沿著小路慢慢往前走。忽然，他看見前面有一棟紅色的小房子。"

    },


    /* 第三幕 */
    3: {

        image:
            "../assets/images/scene3-start.jpg",

        speaker:
            "貝貝",

        text:
            "咦？是誰躲在樹後面呀？你可以幫我找找看嗎？"

    },


    /* 第四幕 */
    4: {

        image:
            "../assets/images/scene4-start.jpg",

        speaker:
            "甜甜",

        text:
            "貝貝，我偷偷把禮物藏起來了，你能找到嗎？"

    },


    /* 第五幕 */
    5: {

        image:
            "../assets/images/scene5.png",

        speaker:
            "旁白",

        text:
            "貝貝和甜甜繼續往森林裡走。微風吹過樹葉，一隻粉紅色的小蝴蝶悄悄飛過……"

    },


    /* 第六幕 */
    6: {

        image:
            "../assets/images/scene6.png",

        speaker:
            "甜甜",

        text:
            "貝貝，剛才好像有個小客人從我們旁邊飛過去了，你有注意到是誰嗎？"

    },


    /* 第七幕 */
    7: {

        image:
            "../assets/images/scene7.png",

        speaker:
            "旁白",

        text:
            "天色慢慢變暗了，貝貝跟甜甜揮揮手，開心地各自回自己的家。"

    }

};


/* =========================================================
   11. 顯示故事場景
========================================================= */

function showStoryScene(
    pageNumber
) {

    const scene =
        storyScenes[
            pageNumber
        ];


    if (!scene) {

        console.log(
            "這一幕還沒有製作完成：",
            pageNumber
        );

        return;

    }


    stopSpeech();

    clearStoryInteraction();


    /* 圖片 */

    const sceneImage =
        document.getElementById(
            "sceneImage"
        );


    if (sceneImage) {

        sceneImage.src =
            scene.image;

    }


    /* 說話者 */

    const speaker =
        document.getElementById(
            "speaker"
        );


    if (speaker) {

        speaker.textContent =
            scene.speaker;

    }


    /* 文字 */

    const storyText =
        document.getElementById(
            "storyText"
        );


    if (storyText) {

        storyText.textContent =
            scene.text;

    }


    /* 目前頁碼 */

    const currentPageElement =
        document.getElementById(
            "currentPage"
        );


    if (currentPageElement) {

        currentPageElement.textContent =
            pageNumber;

    }


    /* 總頁數 */

    const totalPageElement =
        document.getElementById(
            "totalPage"
        );


    if (totalPageElement) {

        totalPageElement.textContent =
            totalStoryPages;

    }


    updateBackButton(
        pageNumber
    );


    /*
       一般頁面預設可以繼續
    */

    showNextButton();


    /* 第三幕 */

    if (pageNumber === 3) {

        prepareDeerMission();

        return;

    }


    /* 第四幕 */

    if (pageNumber === 4) {

        prepareGiftMission();

        return;

    }


    /* 第五幕 */

    if (pageNumber === 5) {

        prepareButterflyScene();

        return;

    }


    /* 第六幕 */

    if (pageNumber === 6) {

        prepareScene6Question();

        return;

    }


    /* 第七幕 */

    if (pageNumber === 7) {

        prepareScene7Ending();

        return;

    }

}


/* =========================================================
   12. 左上按鈕
========================================================= */

function updateBackButton(
    pageNumber
) {

    const backButton =
        document.getElementById(
            "backButton"
        );


    const backButtonText =
        document.getElementById(
            "backButtonText"
        );


    if (
        !backButton ||
        !backButtonText
    ) {

        return;

    }


    if (pageNumber === 1) {

        backButtonText.textContent =
            "⌂ 回首頁";


        backButton.setAttribute(
            "aria-label",
            "回首頁"
        );

    } else {

        backButtonText.textContent =
            "‹ 上一頁";


        backButton.setAttribute(
            "aria-label",
            "上一頁"
        );

    }

}


/* =========================================================
   13. 下一頁
========================================================= */

function nextStory() {

    stopSpeech();


    /* 第一幕 → 第二幕 */

    if (
        currentStoryPage === 1
    ) {

        currentStoryPage = 2;


        showStoryScene(
            currentStoryPage
        );


        return;

    }


    /* 第二幕 → 第三幕 */

    if (
        currentStoryPage === 2
    ) {

        currentStoryPage = 3;


        showStoryScene(
            currentStoryPage
        );


        return;

    }

    /* 第三幕 → 第四幕 */

    if (currentStoryPage === 3) {

        if (!deerFound) {
            return;
        }

        currentStoryPage = 4;

        showStoryScene(
            currentStoryPage
        );

        return;
    }


    /* 第四幕 → 第五幕 */

    if (currentStoryPage === 4) {

        if (foundGiftCount < 3) {
            return;
        }

        currentStoryPage = 5;

        showStoryScene(
            currentStoryPage
        );

        return;
    }


    /* 第五幕 → 第六幕 */

    if (currentStoryPage === 5) {

        if (!butterflyFinished) {
            return;
        }

        currentStoryPage = 6;

        showStoryScene(
            currentStoryPage
        );

        return;
    }


    /* 第六幕 → 第七幕 */

    if (currentStoryPage === 6) {

        if (!scene6Answered) {
            return;
        }

        currentStoryPage = 7;

        showStoryScene(
            currentStoryPage
        );

        return;
    }


    /* 第七幕沒有下一頁 */

    if (currentStoryPage === 7) {
        return;
    }

}


/* =========================================================
   14. 上一頁
========================================================= */

function previousStory() {

    stopSpeech();

    removeButterfly();

    removeScene6Question();

    removeScene7Ending();

    clearScene7Timers();


    if (currentStoryPage === 1) {

        window.location.href =
            "../index.html";

        return;
    }


    currentStoryPage--;


    showStoryScene(
        currentStoryPage
    );

}


/* =========================================================
   15. 第三幕：準備找甜甜
========================================================= */

function prepareDeerMission() {

    deerSearchActive = false;

    deerSearchStartTime = null;

    deerFound = false;


    hideNextButton();

    hideMissionPanel();

}


/* =========================================================
   16. 顯示開始尋找甜甜
========================================================= */

function showDeerStartButton() {

    console.log(
        "【甜甜測試 1】showDeerStartButton 被呼叫",
        {
            currentStoryPage:
                currentStoryPage,

            deerSearchActive:
                deerSearchActive,

            deerFound:
                deerFound
        }
    );


    if (currentStoryPage !== 3) {

        console.log(
            "【甜甜測試失敗】目前不是第三幕"
        );

        return;

    }


    if (deerSearchActive) {

        console.log(
            "【甜甜測試失敗】deerSearchActive 已經是 true"
        );

        return;

    }


    if (deerFound) {

        console.log(
            "【甜甜測試失敗】deerFound 已經是 true"
        );

        return;

    }


    hideNextButton();


    console.log(
        "【甜甜測試 2】準備建立開始尋找按鈕"
    );


    showSearchStartButton(3);


    console.log(
        "【甜甜測試 3】建立後按鈕數量：",
        document.querySelectorAll(
            ".search-start-button"
        ).length
    );

}


/* =========================================================
   17. 開始找甜甜
========================================================= */

function startDeerSearch() {

    if (currentStoryPage !== 3) {
        return;
    }


    stopSpeech();

    hideMissionPanel();


    deerFound = false;

    deerSearchActive = true;


    /*
        第三幕：
        正式開始尋找甜甜後，
        才切換成有甜甜藏起來的遊戲畫面。
    */

    const sceneImage =
        document.getElementById(
            "sceneImage"
        );


    if (sceneImage) {

        sceneImage.src =
            "../assets/images/scene3-search.png";

    }


    /*
        進入搜尋模式
        → 隱藏下方字幕區
        → 顯示霧
    */

    enterSearchMode();


    /*
        等搜尋圖片切換完成後
        再讓霧慢慢散開
    */

    setTimeout(

        function () {

            hideSearchFog();

        },

        250

    );


    /*
        從真正開始尋找時才開始計時
    */

    deerSearchStartTime =
        performance.now();


    /*
        建立甜甜的點擊區域
    */

    createDeerTarget();

}


/* =========================================================
   18. 建立甜甜點擊區
========================================================= */

function createDeerTarget() {

    removeDeerTarget();


    const storyScene =
        document.getElementById(
            "storyScene"
        );


    if (!storyScene) {
        return;
    }


    const target =
        document.createElement(
            "button"
        );


    target.id =
        "deerTarget";


    target.className =
        "deer-target";


    target.type =
        "button";


    target.setAttribute(
        "aria-label",
        "小鹿甜甜"
    );


    /*
       甜甜的點擊位置
    */

    target.style.left =
        "73%";

    target.style.top =
        "21%";

    target.style.width =
        "11%";

    target.style.height =
        "25%";


    target.addEventListener(
        "click",
        foundDeer
    );


    storyScene.appendChild(
        target
    );

}


/* =========================================================
   19. 找到甜甜
========================================================= */

function foundDeer() {

    if (
        !deerSearchActive ||
        deerFound
    ) {
        return;
    }


    deerFound = true;

    deerSearchActive = false;


    /* =========================
       計算尋找甜甜的反應時間
    ========================= */

    const endTime =
        performance.now();


    const reactionTime =
        (
            endTime -
            deerSearchStartTime
        ) / 1000;


    storyData.deerReactionTime =
        Number(
            reactionTime.toFixed(2)
        );


    storyData.deerSearchCompleted =
        true;


    saveStoryData();


    /* 移除甜甜的點擊區 */

    removeDeerTarget();


    /* =========================
       找到甜甜 → 霧慢慢出現
    ========================= */

    showSearchFog();


    /*
       等霧蓋住畫面後，
       才切換成找到甜甜的圖片
    */

    setTimeout(

        function () {

            const sceneImage =
                document.getElementById(
                    "sceneImage"
                );


            if (sceneImage) {

                sceneImage.src =
                    "../assets/images/scene3-found.jpg";

            }


            /*
               搜尋結束
               恢復下方字幕
            */

            leaveSearchMode();


            /*
               顯示找到甜甜後的文字
            */

            updateDialogue(

                "貝貝",

                "找到甜甜了！原來甜甜躲在樹後面！"

            );


            /*
               找到後自動播放語音
            */

            speakText(
                "找到甜甜了！原來甜甜躲在樹後面！"
            );


            /*
               顯示繼續故事按鈕
            */

            showNextButton();


            /*
               圖片換好後，
               讓霧慢慢散開
            */

            setTimeout(

                function () {

                    hideSearchFog();

                },

                300

            );

        },

        750

    );

}


/* =========================================================
   20. 第四幕：準備找禮物
========================================================= */

function prepareGiftMission() {

    giftSearchActive = false;

    giftSearchStartTime = null;

    foundGiftCount = 0;

    giftTimes = [];


    hideNextButton();

    hideGiftProgress();

    hideMissionPanel();


    updateDialogue(

        "甜甜",

        "貝貝，我偷偷把禮物藏起來了，你能找到嗎？"

    );



}


/* =========================================================
   21. 顯示開始尋找禮物
========================================================= */

function showGiftStartButton() {

    if (currentStoryPage !== 4) {
        return;
    }

    if (giftSearchActive) {
        return;
    }

    if (foundGiftCount >= 3) {
        return;
    }

    /* 搜尋開始前不能直接跳下一幕 */
    hideNextButton();

    showSearchStartButton(4);

}


/* =========================================================
   22. 開始找禮物
========================================================= */

function startGiftSearch() {

    if (currentStoryPage !== 4) {
        return;
    }

    stopSpeech();

    hideMissionPanel();

    giftSearchActive = true;

    foundGiftCount = 0;

    giftTimes = [];


    /*
        第四幕：
        按下「開始尋找」後，
        切換到真正藏有三個禮物的圖片。
    */

    const sceneImage =
        document.getElementById(
            "sceneImage"
        );


    if (sceneImage) {

        sceneImage.src =
            "../assets/images/scene4-search.jpg";

    }


    /*
        進入搜尋模式
        → 隱藏下面的故事字幕
    */

    enterSearchMode();


    /*
        圖片切換完成後，
        讓霧慢慢散開。
    */

    setTimeout(

        function () {

            hideSearchFog();

        },

        250

    );


    /*
        從真正開始尋找時才開始計時
    */

    giftSearchStartTime =
        performance.now();


    /*
        建立三個禮物的點擊區
    */

    createGiftTargets();


    /*
        更新「已找到 0 / 3」
    */

    updateGiftProgress();

    showGiftProgress();

}


/* =========================================================
   23. 建立禮物點擊區
========================================================= */

function createGiftTargets() {

    removeGiftTargets();


    const storyScene =
        document.getElementById(
            "storyScene"
        );


    if (!storyScene) {
        return;
    }


    const giftPositions = [

        /* 🎁 左上紅色禮物 */

        {
            left: "9%",
            top: "0%",
            width: "9%",
            height: "18%"
        },


        /* 🎁 右上藍色禮物 */

        {
            left: "79%",
            top: "0%",
            width: "9%",
            height: "19%"
        },


        /* 🎁 右側紫色禮物 */

        {
            left: "83%",
            top: "40%",
            width: "12%",
            height: "20%"
        }

    ];


    giftPositions.forEach(

        function (
            position,
            index
        ) {

            const gift =
                document.createElement(
                    "button"
                );


            gift.type =
                "button";


            gift.className =
                "gift-target";


            gift.dataset.gift =
                index + 1;


            gift.dataset.found =
                "false";


            gift.setAttribute(
                "aria-label",
                "禮物 " + (index + 1)
            );


            gift.style.left =
                position.left;


            gift.style.top =
                position.top;


            gift.style.width =
                position.width;


            gift.style.height =
                position.height;


            /*
                點擊區設定
            */

            gift.style.position =
                "absolute";

            gift.style.zIndex =
                "100";

            gift.style.background =
                "transparent";

            gift.style.border =
                "none";

            gift.style.cursor =
                "pointer";

            gift.style.pointerEvents =
                "auto";


            gift.addEventListener(

                "click",

                function () {

                    foundGift(
                        gift
                    );

                }

            );


            storyScene.appendChild(
                gift
            );

        }

    );

}


/* =========================================================
   24. 找到禮物
========================================================= */

function foundGift(
    giftElement
) {

    if (!giftSearchActive) {
        return;
    }


    if (
        giftElement.dataset.found ===
        "true"
    ) {

        return;

    }


    giftElement.dataset.found =
        "true";


    foundGiftCount++;


    const currentTime =
        performance.now();


    const elapsedTime =
        (
            currentTime -
            giftSearchStartTime
        ) / 1000;


    giftTimes.push(

        Number(
            elapsedTime.toFixed(2)
        )

    );


    /*
        找到之後，
        這個位置不能再點第二次
    */

    giftElement.style.pointerEvents =
        "none";


    updateGiftProgress();


    if (foundGiftCount === 3) {

        completeGiftSearch();

    }

}


/* =========================================================
   25. 更新禮物進度
========================================================= */

function updateGiftProgress() {

    const giftCount =
        document.getElementById(
            "giftCount"
        );


    if (giftCount) {

        giftCount.textContent =
            foundGiftCount;

    }

}


/* =========================================================
   26. 三個禮物都找到
========================================================= */

function completeGiftSearch() {

    giftSearchActive = false;


    /* =========================
       計算尋找禮物的總時間
    ========================= */

    const endTime =
        performance.now();


    const totalTime =
        (
            endTime -
            giftSearchStartTime
        ) / 1000;


    storyData.giftSearchCompleted =
        true;


    storyData.giftTotalTime =
        Number(
            totalTime.toFixed(2)
        );


    storyData.giftTimes =
        [...giftTimes];


    saveStoryData();


    /*
        移除三個禮物的點擊區
        並隱藏 3 / 3 進度
    */

    removeGiftTargets();

    hideGiftProgress();


    /* =========================
       三個禮物都找到
       → 先讓霧出現
    ========================= */

    showSearchFog();


    /*
        等霧蓋住搜尋畫面後，
        再切換成完成圖片
    */

    setTimeout(

        function () {

            const sceneImage =
                document.getElementById(
                    "sceneImage"
                );


            if (sceneImage) {

                sceneImage.src =
                    "../assets/images/scene4-found.jpg";

            }


            /*
                搜尋結束
                → 恢復下方字幕
            */

            leaveSearchMode();


            /*
                顯示完成後的文字
            */

            updateDialogue(

                "甜甜",

                "哇！三個禮物都被你找到了！"

            );


            /*
                自動播放完成語音
            */

            speakText(
                "哇！三個禮物都被你找到了！"
            );


            /*
                顯示「繼續故事」
            */

            showNextButton();


            /*
                完成圖片切換好後
                → 讓霧慢慢散開
            */

            setTimeout(

                function () {

                    hideSearchFog();

                },

                300

            );

        },

        750

    );

}


/* =========================================================
   27. 第五幕：準備蝴蝶場景
========================================================= */

function prepareButterflyScene() {

    butterflyFinished = false;
        removeButterfly();

    hideMissionPanel();

    hideGiftProgress();

    removeGiftTargets();

    removeDeerTarget();


    updateDialogue(

        "旁白",

        "貝貝和甜甜繼續往森林裡走。微風吹過樹葉，一隻粉紅色的小蝴蝶悄悄飛過……"

    );


    /*
        剛進第五幕時，
        不能看到「繼續故事」
    */

    hideNextButton();

}


/* =========================================================
   28. 第五幕：蝴蝶飛入
========================================================= */

function startButterflyAnimation() {

    if (currentStoryPage !== 5) {
        return;
    }


    /*
        只刪除畫面上舊的蝴蝶。

        注意：
        這裡不要呼叫 removeButterfly()，
        避免把其他正在使用的計時器一起清掉。
    */

    const oldButterfly =
        document.getElementById(
            "flyingButterfly"
        );


    if (oldButterfly) {

        oldButterfly.remove();

    }


    const storyScene =
        document.getElementById(
            "storyScene"
        );


    if (!storyScene) {

        console.log(
            "找不到 storyScene"
        );

        return;

    }


    /*
        建立蝴蝶圖片
    */

    const butterfly =
        document.createElement(
            "img"
        );


    butterfly.id =
        "flyingButterfly";


    butterfly.className =
        "flying-butterfly";


    butterfly.alt =
        "";


    butterfly.setAttribute(
        "aria-hidden",
        "true"
    );


    butterfly.style.pointerEvents =
        "none";


    /*
        圖片載入成功後，
        才真正啟動 CSS 飛行動畫。
    */

    butterfly.onload =
        function () {

            requestAnimationFrame(

                function () {

                    requestAnimationFrame(

                        function () {

                            butterfly.classList.add(
                                "butterfly-fly"
                            );

                        }

                    );

                }

            );

        };


    butterfly.onerror =
        function () {

            console.log(
                "找不到蝴蝶圖片：../assets/images/butterfly.png"
            );

        };


    /*
        蝴蝶飛完整段動畫後，
        才允許進入下一幕。
    */

    butterfly.addEventListener(

        "animationend",

        function () {

            butterflyFinished =
                true;


            /*
                這裡只移除這一隻蝴蝶，
                不需要清除其他計時器。
            */

            if (butterfly) {

                butterfly.remove();

            }


            /*
                還在第五幕才顯示
                「繼續故事」
            */

            if (
                currentStoryPage === 5
            ) {

                showNextButton();

            }

        },

        {
            once: true
        }

    );


    storyScene.appendChild(
        butterfly
    );


    butterfly.src =
        "../assets/images/butterfly.png";

}


/* =========================================================
   29. 移除蝴蝶
========================================================= */

function removeButterfly() {

    const butterfly =
        document.getElementById(
            "flyingButterfly"
        );


    if (butterfly) {

        butterfly.remove();

    }


    /*
        如果有尚未執行的蝴蝶計時器，
        一起取消。
    */

    if (butterflyTimer) {

        clearTimeout(
            butterflyTimer
        );


        butterflyTimer =
            null;

    }

}


/* =========================================================
   30. 第六幕：準備問題
========================================================= */

function prepareScene6Question() {

    scene6QuestionActive =
        false;


    scene6QuestionStartTime =
        null;


    scene6Answered =
        false;


    removeScene6Question();

    hideMissionPanel();

    hideGiftProgress();

    hideNextButton();


    updateDialogue(

        "甜甜",

        "貝貝，剛才好像有個小客人從我們旁邊飛過去了，你有注意到是誰嗎？"

    );

}


/* =========================================================
   31. 第六幕：顯示三個選項
========================================================= */

function showScene6Question() {

    if (currentStoryPage !== 6) {
        return;
    }


    if (scene6Answered) {
        return;
    }


    removeScene6Question();


    const storyScene =
        document.getElementById(
            "storyScene"
        );


    if (!storyScene) {
        return;
    }


    /*
        建立問題面板
    */

    const questionPanel =
        document.createElement(
            "div"
        );


    questionPanel.id =
        "scene6Question";


    questionPanel.className =
        "scene6-question";


    /*
        問題標題
    */

    const questionTitle =
        document.createElement(
            "div"
        );


    questionTitle.className =
        "scene6-question-title";


    questionTitle.textContent =
        "你覺得是哪一位小客人呢？";


    questionPanel.appendChild(
        questionTitle
    );


    /*
        選項容器
    */

    const options =
        document.createElement(
            "div"
        );


    options.className =
        "scene6-options";


    /*
        三個答案
    */

    const answers = [

        {
            value: "bird",
            emoji: "🐦",
            text: "小鳥"
        },

        {
            value: "butterfly",
            emoji: "🦋",
            text: "蝴蝶"
        },

        {
            value: "bee",
            emoji: "🐝",
            text: "蜜蜂"
        }

    ];


    answers.forEach(

        function (answer) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "scene6-option";


            button.dataset.answer =
                answer.value;


            /*
                選項圖示
            */

            const emoji =
                document.createElement(
                    "span"
                );


            emoji.className =
                "scene6-option-emoji";


            emoji.textContent =
                answer.emoji;


            /*
                選項文字
            */

            const optionText =
                document.createElement(
                    "span"
                );


            optionText.className =
                "scene6-option-text";


            optionText.textContent =
                answer.text;


            button.appendChild(
                emoji
            );


            button.appendChild(
                optionText
            );


            /*
                點選答案
            */

            button.addEventListener(

                "click",

                function () {

                    answerScene6Question(

                        answer.value,

                        answer.text,

                        button

                    );

                }

            );


            options.appendChild(
                button
            );

        }

    );


    questionPanel.appendChild(
        options
    );


    storyScene.appendChild(
        questionPanel
    );


    /*
        選項真正出現後，
        才開始計算回答時間。
    */

    scene6QuestionActive =
        true;


    scene6QuestionStartTime =
        performance.now();

}


/* =========================================================
   32. 第六幕：回答問題
========================================================= */

function answerScene6Question(
    answerValue,
    answerText,
    selectedButton
) {

    if (!scene6QuestionActive) {
        return;
    }

    if (scene6Answered) {
        return;
    }


    scene6QuestionActive =
        false;

    scene6Answered =
        true;


    /* =========================
       計算回答反應時間
    ========================= */

    const endTime =
        performance.now();


    const reactionTime =
        (
            endTime -
            scene6QuestionStartTime
        ) / 1000;


    /* =========================
       正確答案：蝴蝶
    ========================= */

    const isCorrect =
        answerValue ===
        "butterfly";


    /* =========================
       儲存回答紀錄
    ========================= */

    storyData.scene6ReactionTime =
        Number(
            reactionTime.toFixed(2)
        );


    storyData.scene6SelectedAnswer =
        answerText;


    storyData.scene6Correct =
        isCorrect;


    storyData.scene6Completed =
        true;


    saveStoryData();


    /* =========================
       鎖定三個答案按鈕
    ========================= */

    const buttons =
        document.querySelectorAll(
            ".scene6-option"
        );


    buttons.forEach(

        function (button) {

            button.disabled =
                true;

        }

    );


    /* =========================
       標記小朋友選擇的答案
    ========================= */

    if (selectedButton) {

        selectedButton.classList.add(
            "selected"
        );

    }


    /* =========================
       標記正確答案「蝴蝶」
    ========================= */

    const correctButton =
        document.querySelector(
            '[data-answer="butterfly"]'
        );


    if (correctButton) {

        correctButton.classList.add(
            "correct"
        );

    }


    /* =========================
       答對
    ========================= */

    if (isCorrect) {

        updateDialogue(

            "甜甜",

            "對呀！剛才飛過去的是一隻粉紅色的小蝴蝶！"

        );


        speakText(

            "對呀！剛才飛過去的是一隻粉紅色的小蝴蝶！"

        );

    }


    /* =========================
       答錯
    ========================= */

    else {

        updateDialogue(

            "甜甜",

            "答錯囉～剛才飛過去的是蝴蝶喔！🦋"

        );


        /*
            語音不要放 Emoji，
            避免系統把符號念出來。
        */

        speakText(

            "答錯囉～剛才飛過去的是蝴蝶喔！"

        );

    }


    /*
        作答完成後，
        才出現「繼續故事」
    */

    showNextButton();

}


/* =========================================================
   33. 移除第六幕問題
========================================================= */

function removeScene6Question() {

    const question =
        document.getElementById(
            "scene6Question"
        );


    if (question) {

        question.remove();

    }

}


/* =========================================================
   34. 第七幕：準備結尾
========================================================= */

function prepareScene7Ending() {

    scene7EndingStarted =
        false;


    clearScene7Timers();

    removeScene7Ending();

    hideMissionPanel();

    hideGiftProgress();

    hideNextButton();


    updateDialogue(

        "旁白",

        "天色慢慢變暗了，貝貝跟甜甜揮揮手，開心地各自回自己的家。"

    );

}


/* =========================================================
   35. 第七幕：開始結尾流程
========================================================= */

function startScene7Ending() {

    if (currentStoryPage !== 7) {
        return;
    }


    if (scene7EndingStarted) {
        return;
    }


    scene7EndingStarted =
        true;


    /*
        第七幕旁白說完後，
        這個函式才會開始執行。

        等 1 秒：
        顯示「今天的森林冒險完成了」
    */

    scene7EndingTimer =
        setTimeout(

            function () {

                if (
                    currentStoryPage !== 7
                ) {

                    return;

                }


                showScene7CompleteMessage();

            },

            1000

        );


    /*
        再過 1.5 秒，
        顯示「完成故事」按鈕。

        總計 2.5 秒。
    */

    scene7FinishTimer =
        setTimeout(

            function () {

                if (
                    currentStoryPage !== 7
                ) {

                    return;

                }


                showScene7FinishButton();

            },

            2500

        );

}


/* =========================================================
   36. 第七幕：顯示完成文字
========================================================= */

function showScene7CompleteMessage() {

    const storyScene =
        document.getElementById(
            "storyScene"
        );


    if (!storyScene) {
        return;
    }


    /*
        避免重複建立
    */

    if (
        document.getElementById(
            "scene7CompleteMessage"
        )
    ) {

        return;

    }


    const message =
        document.createElement(
            "div"
        );


    message.id =
        "scene7CompleteMessage";


    message.className =
        "scene7-complete-message";


    message.textContent =
        "🌟 今天的森林冒險完成了！";


    storyScene.appendChild(
        message
    );

}


/* =========================================================
   37. 第七幕：顯示完成故事按鈕
========================================================= */

function showScene7FinishButton() {

    const storyScene =
        document.getElementById(
            "storyScene"
        );


    if (!storyScene) {
        return;
    }


    /*
        避免重複建立
    */

    if (
        document.getElementById(
            "scene7FinishButton"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "scene7FinishButton";


    button.className =
        "scene7-finish-button";


    button.type =
        "button";


    button.textContent =
        "完成故事";


    button.addEventListener(
        "click",
        finishStory
    );


    storyScene.appendChild(
        button
    );

}


/* =========================================================
   38. 完成整個故事
========================================================= */

function finishStory() {

    stopSpeech();

    clearScene7Timers();


    /*
        紀錄故事完成
    */

    storyData.storyCompleted =
        true;


    storyData.completedAt =
        new Date().toISOString();


    saveStoryData();


    /*
        完成後回首頁
    */

    window.location.href =
        "../index.html";

}


/* =========================================================
   39. 移除第七幕完成畫面
========================================================= */

function removeScene7Ending() {

    const message =
        document.getElementById(
            "scene7CompleteMessage"
        );


    if (message) {

        message.remove();

    }


    const button =
        document.getElementById(
            "scene7FinishButton"
        );

            if (button) {

        button.remove();

    }

}


/* =========================================================
   40. 清除第七幕計時器
========================================================= */

function clearScene7Timers() {

    if (scene7EndingTimer) {

        clearTimeout(
            scene7EndingTimer
        );

        scene7EndingTimer =
            null;

    }


    if (scene7FinishTimer) {

        clearTimeout(
            scene7FinishTimer
        );

        scene7FinishTimer =
            null;

    }

}


/* =========================================================
   41. 任務條
========================================================= */

function showMissionPanel(
    title,
    description,
    buttonText,
    clickFunction
) {

    const missionPanel =
        document.getElementById(
            "missionPanel"
        );


    const missionTitle =
        document.getElementById(
            "missionTitle"
        );


    const missionDescription =
        document.getElementById(
            "missionDescription"
        );


    const missionButton =
        document.getElementById(
            "missionButton"
        );


    if (!missionPanel) {

        return;

    }


    if (missionTitle) {

        missionTitle.textContent =
            title;

    }


    if (missionDescription) {

        missionDescription.textContent =
            description;

    }


    if (missionButton) {

        missionButton.textContent =
            buttonText;

        missionButton.onclick =
            clickFunction;

    }


    missionPanel.classList.remove(
        "hidden"
    );

}


/* =========================================================
   42. 隱藏任務條
========================================================= */

function hideMissionPanel() {

    const missionPanel =
        document.getElementById(
            "missionPanel"
        );


    if (missionPanel) {

        missionPanel.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   43. 顯示禮物進度
========================================================= */

function showGiftProgress() {

    const giftProgress =
        document.getElementById(
            "giftProgress"
        );


    if (giftProgress) {

        giftProgress.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   44. 隱藏禮物進度
========================================================= */

function hideGiftProgress() {

    const giftProgress =
        document.getElementById(
            "giftProgress"
        );


    if (giftProgress) {

        giftProgress.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   45. 更新對話
========================================================= */

function updateDialogue(
    speakerName,
    text
) {

    const speaker =
        document.getElementById(
            "speaker"
        );


    const storyText =
        document.getElementById(
            "storyText"
        );


    if (speaker) {

        speaker.textContent =
            speakerName;

    }


    if (storyText) {

        storyText.textContent =
            text;

    }

}


/* =========================================================
   46. 按下語音
========================================================= */

function speakStory() {

    const storyText =
        document.getElementById(
            "storyText"
        );


    if (!storyText) {

        return;

    }


    const text =
        storyText.textContent.trim();


    if (!text) {

        return;

    }


    /* -----------------------------------------------------
       第三幕
       語音說完才出現「開始尋找甜甜」
    ----------------------------------------------------- */

    if (
        currentStoryPage === 3 &&
        !deerSearchActive &&
        !deerFound
    ) {

        hideMissionPanel();


        speakText(

            text,

            function () {

                if (
                    currentStoryPage === 3 &&
                    !deerFound
                ) {

                    showDeerStartButton();

                }

            }

        );


        return;

    }


    /* -----------------------------------------------------
       第四幕
       語音說完才出現「開始尋找三個禮物」
    ----------------------------------------------------- */

    if (
        currentStoryPage === 4 &&
        !giftSearchActive &&
        foundGiftCount === 0
    ) {

        hideMissionPanel();


        speakText(

            text,

            function () {

                if (
                    currentStoryPage === 4 &&
                    !giftSearchActive
                ) {

                    showGiftStartButton();

                }

            }

        );


        return;

    }


    /* -----------------------------------------------------
       第五幕

       重要：
       先完整播放旁白
       ↓
       旁白真正結束
       ↓
       才建立蝴蝶並開始飛
    ----------------------------------------------------- */

    if (currentStoryPage === 5) {

        /*
            每次重新按語音時，
            都重新準備第五幕動畫。
        */

        butterflyFinished =
            false;


        /*
            移除之前可能存在的蝴蝶。
        */

        removeButterfly();


        /*
            蝴蝶飛完以前，
            不允許進下一幕。
        */

        hideNextButton();


        /*
            這裡不要再使用：

            setTimeout(..., 8000)

            直接等待 speakText 的
            onEnd callback。
        */

        speakText(

            text,

            function () {

                /*
                    如果旁白播放期間，
                    使用者已經離開第五幕，
                    就不要再產生蝴蝶。
                */

                if (
                    currentStoryPage !== 5
                ) {

                    return;

                }


                /*
                    旁白已經播放完畢。

                    現在才開始：
                    🦋 蝴蝶動畫
                */

                startButterflyAnimation();

            }

        );


        return;

    }


    /* -----------------------------------------------------
       第六幕
    ----------------------------------------------------- */

    if (currentStoryPage === 6) {


        /*
            如果已經回答過，
            再按語音只重播目前文字。
        */

        if (scene6Answered) {

            speakText(
                text
            );

            return;

        }


        /*
            語音講完以前，
            不顯示三個選項。
        */

        removeScene6Question();

        hideNextButton();


        speakText(

            text,

            function () {

                if (
                    currentStoryPage === 6 &&
                    !scene6Answered
                ) {

                    showScene6Question();

                }

            }

        );


        return;

    }


    /* -----------------------------------------------------
       第七幕
    ----------------------------------------------------- */

    if (currentStoryPage === 7) {


        /*
            如果結尾已經開始，
            再按 🔊 只重播旁白。
        */

        if (scene7EndingStarted) {

            speakText(
                text
            );

            return;

        }


        /*
            使用者按 🔊。

            旁白說完後，
            才開始最後的完成流程。
        */

        speakText(

            text,

            function () {

                if (
                    currentStoryPage === 7
                ) {

                    startScene7Ending();

                }

            }

        );


        return;

    }


    /* -----------------------------------------------------
       第一、二幕
       一般語音播放
    ----------------------------------------------------- */

    speakText(
        text
    );

}


/* =========================================================
   47. 語音
========================================================= */
function speakText(
    text,
    onEnd = null
) {

    stopSpeech();


    /*
        瀏覽器不支援語音
        → 直接執行後續流程
    */

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        if (onEnd) {
            onEnd();
        }

        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        "zh-TW";


    utterance.rate =
        0.88;


    utterance.pitch =
        1.05;


    utterance.volume =
        1;


    const voices =
        window
            .speechSynthesis
            .getVoices();


    const taiwanVoice =
        voices.find(

            function (voice) {

                return (
                    voice.lang ===
                    "zh-TW"
                );

            }

        );


    if (taiwanVoice) {

        utterance.voice =
            taiwanVoice;

    }


    /*
        防止 onEnd 被執行兩次
    */

    let finished =
        false;


    function finishSpeech() {

        if (finished) {
            return;
        }


        finished =
            true;


        console.log(
            "FocusTale：語音播放完成"
        );


        if (onEnd) {

            onEnd();

        }

    }


    /*
        正常播放完成
    */

    utterance.onend =
        function () {

            finishSpeech();

        };


    /*
        如果語音發生錯誤，
        也不要讓故事卡住。
    */

    utterance.onerror =
        function (event) {

            console.log(
                "FocusTale：語音播放發生錯誤",
                event
            );


            finishSpeech();

        };


    window
        .speechSynthesis
        .speak(
            utterance
        );

}


/* =========================================================
   48. 停止語音
========================================================= */

function stopSpeech() {

    if (
        "speechSynthesis"
        in window
    ) {

        window
            .speechSynthesis
            .cancel();

    }

}
/* =========================================================
   49. 顯示繼續故事
========================================================= */

function showNextButton() {

    const nextButton =
        document.getElementById(
            "nextButton"
        );


    if (nextButton) {

        nextButton.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   50. 隱藏繼續故事
========================================================= */

function hideNextButton() {

    const nextButton =
        document.getElementById(
            "nextButton"
        );


    if (nextButton) {

        nextButton.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   51. 移除甜甜點擊區
========================================================= */

function removeDeerTarget() {

    const deerTarget =
        document.getElementById(
            "deerTarget"
        );


    if (deerTarget) {

        deerTarget.remove();

    }

}


/* =========================================================
   52. 移除禮物點擊區
========================================================= */

function removeGiftTargets() {

    const giftTargets =
        document.querySelectorAll(
            ".gift-target"
        );


    giftTargets.forEach(

        function (target) {

            target.remove();

        }

    );

}


/* =========================================================
   53. 清除故事互動
========================================================= */

function clearStoryInteraction() {

    removeDeerTarget();

    removeGiftTargets();

    removeButterfly();

    removeScene6Question();

    removeScene7Ending();

    clearScene7Timers();

    hideMissionPanel();

    hideGiftProgress();

    removeSearchStartButton();

    /*
        離開搜尋模式，
        避免字幕一直被隱藏。
    */

    leaveSearchMode();

    /*
        把搜尋霧隱藏。
    */

    hideSearchFog();

}


/* =========================================================
   54. 儲存資料
========================================================= */

function saveStoryData() {

    localStorage.setItem(

        "focusTaleStoryData",

        JSON.stringify(
            storyData
        )

    );

}


/* =========================================================
   55. 回首頁
========================================================= */

function goHome() {

    stopSpeech();

    removeButterfly();

    removeScene6Question();

    removeScene7Ending();

    clearScene7Timers();

    removeSearchStartButton();

    leaveSearchMode();

    hideSearchFog();


    window.location.href =
        "../index.html";

}


/* =========================================================
   56. 初始化
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        const sceneImage =
            document.getElementById(
                "sceneImage"
            );


        /*
            只有 story.html
            才初始化故事。
        */

        if (sceneImage) {

            currentStoryPage =
                1;


            showStoryScene(
                currentStoryPage
            );

        }

    }

);


/* =========================================================
   57. 第三、第四幕：
       搜尋動畫共用功能
========================================================= */


/* ---------------------------------------------------------
   取得故事圖片區
--------------------------------------------------------- */

function getStoryScene() {

    return document.querySelector(
        ".story-scene"
    );

}


/* ---------------------------------------------------------
   建立搜尋霧
--------------------------------------------------------- */

function createSearchFog() {

    const storyScene =
        getStoryScene();


    if (!storyScene) {

        return null;

    }


    let fog =
        document.querySelector(
            ".search-fog"
        );


    /*
        如果目前沒有霧，
        才建立新的霧。
    */

    if (!fog) {

        fog =
            document.createElement(
                "div"
            );


        fog.className =
            "search-fog";


        storyScene.appendChild(
            fog
        );

    }


    return fog;

}


/* ---------------------------------------------------------
   霧慢慢出現
--------------------------------------------------------- */

function showSearchFog() {

    const fog =
        createSearchFog();


    if (!fog) {

        return;

    }


    requestAnimationFrame(

        function () {

            fog.classList.add(
                "show"
            );

        }

    );

}


/* ---------------------------------------------------------
   霧慢慢散開
--------------------------------------------------------- */

function hideSearchFog() {

    const fog =
        document.querySelector(
            ".search-fog"
        );


    if (!fog) {

        return;

    }


    fog.classList.remove(
        "show"
    );

}


/* ---------------------------------------------------------
   搜尋時隱藏字幕
--------------------------------------------------------- */

function enterSearchMode() {

    document.body.classList.add(
        "search-mode"
    );

}


/* ---------------------------------------------------------
   搜尋完成後恢復字幕
--------------------------------------------------------- */

function leaveSearchMode() {

    document.body.classList.remove(
        "search-mode"
    );

}


/* ---------------------------------------------------------
   刪除「開始尋找」按鈕
--------------------------------------------------------- */

function removeSearchStartButton() {

    const buttons =
        document.querySelectorAll(
            ".search-start-button"
        );


    buttons.forEach(

        function (button) {

            button.remove();

        }

    );

}


/* =========================================================
   58. 顯示「開始尋找」按鈕

   第三幕：
   🔍 開始尋找甜甜

   第四幕：
   🎁 開始尋找三個禮物
========================================================= */

function showSearchStartButton(
    sceneNumber
) {

    const storyScene =
        document.getElementById(
            "storyScene"
        );


    if (!storyScene) {

        return;

    }


    /*
        先刪除舊的開始尋找按鈕，
        避免畫面出現兩顆。
    */

    removeSearchStartButton();


    /*
        開始搜尋之前，
        先讓霧出現。
    */

    showSearchFog();


    /*
        建立按鈕
    */

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "search-start-button";


    /*
        第三幕與第四幕
        顯示不同文字。
    */

    if (sceneNumber === 3) {

        button.textContent =
            "🔍 開始尋找甜甜";

    }

    else if (sceneNumber === 4) {

        button.textContent =
            "🎁 開始尋找三個禮物";

    }

    else {

        button.textContent =
            "🔍 開始尋找";

    }


    /*
        直接用 JavaScript 固定位置，
        避免被其他 CSS 影響。
    */

/*
    強制顯示在故事畫面正中央
*/

button.style.setProperty(
    "display",
    "block",
    "important"
);

button.style.setProperty(
    "visibility",
    "visible",
    "important"
);

button.style.setProperty(
    "opacity",
    "1",
    "important"
);

button.style.setProperty(
    "position",
    "absolute",
    "important"
);

button.style.setProperty(
    "left",
    "50%",
    "important"
);

button.style.setProperty(
    "top",
    "45%",
    "important"
);

button.style.setProperty(
    "transform",
    "translate(-50%, -50%)",
    "important"
);

button.style.setProperty(
    "z-index",
    "99999",
    "important"
);


    /*
        霧的 z-index 是 80，
        所以按鈕一定要比霧高。
    */

    button.style.zIndex =
        "9999";


    button.style.padding =
        "20px 48px";


    button.style.border =
        "4px solid white";


    button.style.borderRadius =
        "999px";


    button.style.background =
        "#FFC94D";


    button.style.color =
        "#654A35";


    button.style.fontSize =
        "28px";


    button.style.fontWeight =
        "700";


    button.style.cursor =
        "pointer";


    button.style.boxShadow =
        "0 8px 24px rgba(0,0,0,0.22)";


    /*
        防止按鈕被其他元素蓋住。
    */

    button.style.pointerEvents =
        "auto";


    /*
        按下開始尋找
    */

    button.addEventListener(

        "click",

        function (event) {

            /*
                防止點擊事件傳到
                storyScene 或其他父層，
                避免「點中間直接跳下一幕」。
            */

            event.preventDefault();

            event.stopPropagation();


            /*
                先移除按鈕。
            */

            removeSearchStartButton();


            /*
                第三幕：
                開始尋找甜甜。
            */

            if (sceneNumber === 3) {

                startDeerSearch();

                return;

            }


            /*
                第四幕：
                開始尋找三個禮物。
            */

            if (sceneNumber === 4) {

                startGiftSearch();

                return;

            }

        }

    );


    /*
        把按鈕放進故事畫面。
    */

    storyScene.appendChild(
        button
    );

}

/* =========================================================
   59. 專注行為分析：眼睛視線偵測
========================================================= */


/* ---------------------------------------------------------
   攝影機
--------------------------------------------------------- */

let attentionCameraStream = null;


/* ---------------------------------------------------------
   MediaPipe Face Landmarker
--------------------------------------------------------- */

let attentionFaceLandmarker = null;

let attentionFaceLandmarkerReady = false;


/* ---------------------------------------------------------
   偵測動畫
--------------------------------------------------------- */

let attentionDetectionFrame = null;

let attentionLastVideoTime = -1;


/* ---------------------------------------------------------
   視線狀態
--------------------------------------------------------- */

let attentionGazeDirection = "未偵測";

let attentionIsLookingAtScreen = false;


/* ---------------------------------------------------------
   專注時間
--------------------------------------------------------- */

let attentionSessionStartTime = null;

let attentionFocusedTime = 0;

let attentionLastFrameTime = null;


/* ---------------------------------------------------------
   分心事件
--------------------------------------------------------- */

let attentionDistractionCount = 0;

let attentionDistractionStartTime = null;

let attentionCurrentDistractionTime = 0;


/*
    分心防抖：

    視線連續離開 150ms
    才正式算一次分心。
*/

let attentionLeaveCandidateTime = null;

const ATTENTION_LEAVE_CONFIRM_TIME = 150;


/*
    回到畫面防抖：

    視線連續回到中央 150ms
    才正式算重新投入。
*/

let attentionReturnCandidateTime = null;

const ATTENTION_RETURN_CONFIRM_TIME = 150;


/* ---------------------------------------------------------
   重新投入
--------------------------------------------------------- */

let attentionLastReengagementTime = null;

let attentionReengagementTimes = [];


/* ---------------------------------------------------------
   眼睛視線中央範圍

   X：
   0.32 ～ 0.68 = 中央

   Y：
   0.30 ～ 0.70 = 中央

   超出範圍就判定視線離開畫面
--------------------------------------------------------- */

const GAZE_HORIZONTAL_MIN = 0.32;

const GAZE_HORIZONTAL_MAX = 0.68;

const GAZE_VERTICAL_MIN = 0.30;

const GAZE_VERTICAL_MAX = 0.70;

/* =========================================================
   59-1. 啟動攝影機
========================================================= */

async function startAttentionCamera() {

    const camera =
        document.getElementById(
            "attentionCamera"
        );


    /* 找不到攝影機元素 */
    if (!camera) {

        console.error(
            "FocusTale：找不到 attentionCamera"
        );

        return;
    }


    /* 瀏覽器不支援攝影機 */
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        console.error(
            "FocusTale：瀏覽器不支援攝影機"
        );

        return;
    }


    try {

        /* -------------------------------------------------
           如果已經有攝影機串流
           就直接使用，不重複開啟
        ------------------------------------------------- */

        if (
            camera.srcObject &&
            camera.srcObject.getVideoTracks &&
            camera.srcObject
                .getVideoTracks()
                .some(
                    function (track) {

                        return (
                            track.readyState ===
                            "live"
                        );

                    }
                )
        ) {

            attentionCameraStream =
                camera.srcObject;

        }


        /* -------------------------------------------------
           還沒有攝影機串流
           → 開啟前鏡頭
        ------------------------------------------------- */

        else {

            attentionCameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            facingMode:
                                "user"

                        },

                        audio:
                            false

                    });


            camera.srcObject =
                attentionCameraStream;

        }


        /* -------------------------------------------------
           Video 設定
        ------------------------------------------------- */

        camera.muted =
            true;

        camera.playsInline =
            true;


        await camera.play();


        console.log(
            "FocusTale：攝影機啟動成功"
        );


        /* -------------------------------------------------
           攝影機成功後
           → 載入眼睛偵測模型
        ------------------------------------------------- */

        await initializeEyeTracking();


        /* 模型載入失敗就停止 */
        if (
            !attentionFaceLandmarkerReady
        ) {

            return;

        }


        /* -------------------------------------------------
           開始眼睛視線偵測
        ------------------------------------------------- */

        startEyeTracking();

    }


    catch (error) {

        console.error(
            "FocusTale：攝影機啟動失敗",
            error
        );

    }

}



/* =========================================================
   59-1-1. 進入故事頁後啟動攝影機與眼睛偵測
========================================================= */

window.addEventListener(
    "load",
    async function () {

        const camera =
            document.getElementById(
                "attentionCamera"
            );


        /*
            不是故事頁
            → 不啟動攝影機
        */

        if (!camera) {

            return;

        }


        console.log(
            "FocusTale：故事頁載入完成，準備啟動攝影機"
        );


        await startAttentionCamera();

    }
);


/* =========================================================
   59-2. 初始化 MediaPipe Face Landmarker
========================================================= */

async function initializeEyeTracking() {

    /*
        如果模型已經載入過
        就不要重複載入
    */
    if (
        attentionFaceLandmarkerReady &&
        attentionFaceLandmarker
    ) {

        return;

    }


    try {

        console.log(
            "FocusTale：開始載入眼睛視線模型"
        );


        /* -------------------------------------------------
           載入 MediaPipe Tasks Vision
        ------------------------------------------------- */

        const visionModule =
    await import(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/+esm"
    );


        const {
            FaceLandmarker,
            FilesetResolver
        } = visionModule;


        /* -------------------------------------------------
           載入 MediaPipe WASM
        ------------------------------------------------- */

        const vision =
    await FilesetResolver
        .forVisionTasks(

            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"

        );


        /* -------------------------------------------------
           建立 Face Landmarker
        ------------------------------------------------- */

        attentionFaceLandmarker =
            await FaceLandmarker
                .createFromOptions(

                    vision,

                    {

                        baseOptions: {

                            modelAssetPath:

                                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",

                            delegate:
                                "GPU"

                        },


                        /*
                            因為我們分析的是攝影機影片
                        */
                        runningMode:
                            "VIDEO",


                        /*
                            FocusTale 一次只分析一張臉
                        */
                        numFaces:
                            1,


                        /*
                            偵測信心門檻
                        */
                        minFaceDetectionConfidence:
                            0.5,

                        minFacePresenceConfidence:
                            0.5,

                        minTrackingConfidence:
                            0.5,


                        /*
                            目前不需要表情分析
                        */
                        outputFaceBlendshapes:
                            false,


                        /*
                            目前不使用頭部旋轉矩陣
                        */
                        outputFacialTransformationMatrixes:
                            false

                    }

                );


        /* -------------------------------------------------
           模型載入成功
        ------------------------------------------------- */

        attentionFaceLandmarkerReady =
            true;


        console.log(
            "FocusTale：眼睛視線偵測模型載入完成"
        );

    }


    catch (error) {

        attentionFaceLandmarkerReady =
            false;

        attentionFaceLandmarker =
            null;


        console.error(
            "FocusTale：眼睛視線模型載入失敗",
            error
        );

    }

}


/* =========================================================
   59-3. 啟動眼睛視線偵測
========================================================= */

function startEyeTracking() {

    const camera =
        document.getElementById(
            "attentionCamera"
        );


    /* 找不到攝影機 */
    if (!camera) {

        console.error(
            "FocusTale：眼睛偵測啟動失敗，找不到 camera"
        );

        return;
    }


    /* MediaPipe 還沒準備好 */
    if (
        !attentionFaceLandmarkerReady ||
        !attentionFaceLandmarker
    ) {

        console.error(
            "FocusTale：眼睛偵測啟動失敗，MediaPipe 尚未完成"
        );

        return;
    }


    /* -----------------------------------------------------
       防止重複建立偵測循環
    ----------------------------------------------------- */

    if (
        attentionDetectionFrame !==
        null
    ) {

        cancelAnimationFrame(
            attentionDetectionFrame
        );

        attentionDetectionFrame =
            null;

    }


    /* -----------------------------------------------------
       初始化這次閱讀的統計資料
    ----------------------------------------------------- */

    attentionLastVideoTime =
        -1;


    attentionSessionStartTime =
        performance.now();


    attentionFocusedTime =
        0;


    attentionLastFrameTime =
        null;


    attentionDistractionCount =
        0;


    attentionDistractionStartTime =
        null;


    attentionCurrentDistractionTime =
        0;


    attentionLastReengagementTime =
        null;


    attentionReengagementTimes =
        [];


    console.log(
        "FocusTale：開始眼睛視線偵測"
    );


    /* =====================================================
       每一個攝影機畫面持續分析
    ===================================================== */

    function detectFrame() {

        /*
            攝影機或 MediaPipe 尚未準備完成
        */

        if (
            !attentionCameraStream ||
            !attentionFaceLandmarkerReady ||
            !attentionFaceLandmarker
        ) {

            attentionDetectionFrame =
                requestAnimationFrame(
                    detectFrame
                );

            return;
        }


        /*
            camera.readyState >= 2
            代表已經有影像資料可以分析
        */

        if (
            camera.readyState >= 2 &&
            camera.videoWidth > 0 &&
            camera.videoHeight > 0 &&
            camera.currentTime !==
                attentionLastVideoTime
        ) {

            /*
                只分析新的攝影機畫面
            */

            attentionLastVideoTime =
                camera.currentTime;


            const now =
                performance.now();


            try {

                /*
                    MediaPipe 分析目前攝影機畫面
                */

                const results =
                    attentionFaceLandmarker
                        .detectForVideo(
                            camera,
                            now
                        );


                /*
                    把結果交給眼睛視線判斷
                */

                processEyeTrackingResults(
                    results,
                    now
                );

            }


            catch (error) {

                console.error(
                    "FocusTale：detectForVideo 發生錯誤",
                    error
                );

            }

        }


        /*
            下一個畫面繼續偵測
        */

        attentionDetectionFrame =
            requestAnimationFrame(
                detectFrame
            );

    }


    /* 第一次啟動 */
    detectFrame();

}

/* =========================================================
   59-4. 分析眼睛視線
========================================================= */

function processEyeTrackingResults(
    results,
    now
) {

    /* =====================================================
       ① 沒有偵測到臉
    ===================================================== */

    if (
        !results ||
        !results.faceLandmarks ||
        results.faceLandmarks.length === 0
    ) {

        attentionGazeDirection =
            "未偵測";


        /*
            沒有偵測到臉
            → 視為沒有注視畫面
        */

        updateAttentionState(
            false,
            now
        );


        updateAttentionDebugPanel(
            false
        );


        return;
    }


    /* =====================================================
       ② 取得第一張臉的 landmarks
    ===================================================== */

    const landmarks =
        results.faceLandmarks[0];


    /* =====================================================
       ③ 取得左右虹膜中心

       左虹膜：
       468～472

       右虹膜：
       473～477

       使用 5 個點平均
       比只使用單一 landmark 穩定
    ===================================================== */

    const leftIris =
        getAverageLandmark(
            landmarks,
            [
                468,
                469,
                470,
                471,
                472
            ]
        );


    const rightIris =
        getAverageLandmark(
            landmarks,
            [
                473,
                474,
                475,
                476,
                477
            ]
        );


    /* =====================================================
       ④ 左右眼的左右邊界
    ===================================================== */

    const leftEyeOuter =
        landmarks[33];


    const leftEyeInner =
        landmarks[133];


    const rightEyeInner =
        landmarks[362];


    const rightEyeOuter =
        landmarks[263];


    /* =====================================================
       ⑤ 左右眼的上下邊界
    ===================================================== */

    const leftEyeTop =
        landmarks[159];


    const leftEyeBottom =
        landmarks[145];


    const rightEyeTop =
        landmarks[386];


    const rightEyeBottom =
        landmarks[374];


    /* =====================================================
       ⑥ 防止 landmark 資料不完整
    ===================================================== */

    if (
        !leftIris ||
        !rightIris ||
        !leftEyeOuter ||
        !leftEyeInner ||
        !rightEyeInner ||
        !rightEyeOuter ||
        !leftEyeTop ||
        !leftEyeBottom ||
        !rightEyeTop ||
        !rightEyeBottom
    ) {

        attentionGazeDirection =
            "未偵測";


        updateAttentionState(
            false,
            now
        );


        updateAttentionDebugPanel(
            false
        );


        return;
    }


    /* =====================================================
       ⑦ 計算水平方向
    ===================================================== */

    const leftHorizontal =
        calculateEyeRatio(

            leftIris.x,

            leftEyeOuter.x,

            leftEyeInner.x

        );


    const rightHorizontal =
        calculateEyeRatio(

            rightIris.x,

            rightEyeInner.x,

            rightEyeOuter.x

        );


    /*
        左右眼取平均
    */

    const horizontal =
        (
            leftHorizontal +
            rightHorizontal
        ) / 2;


    /* =====================================================
       ⑧ 計算垂直方向
    ===================================================== */

    const leftVertical =
        calculateEyeRatio(

            leftIris.y,

            leftEyeTop.y,

            leftEyeBottom.y

        );


    const rightVertical =
        calculateEyeRatio(

            rightIris.y,

            rightEyeTop.y,

            rightEyeBottom.y

        );


    /*
        左右眼取平均
    */

    const vertical =
        (
            leftVertical +
            rightVertical
        ) / 2;


    /* =====================================================
       ⑨ 判斷是否仍在看畫面
    ===================================================== */

    let lookingAtScreen =
        true;


    /* ---------- 左 ---------- */

    if (
        horizontal <
        GAZE_HORIZONTAL_MIN
    ) {

        attentionGazeDirection =
            "左";


        lookingAtScreen =
            false;

    }


    /* ---------- 右 ---------- */

    else if (
        horizontal >
        GAZE_HORIZONTAL_MAX
    ) {

        attentionGazeDirection =
            "右";


        lookingAtScreen =
            false;

    }


    /* ---------- 上 ---------- */

    else if (
        vertical <
        GAZE_VERTICAL_MIN
    ) {

        attentionGazeDirection =
            "上";


        lookingAtScreen =
            false;

    }


    /* ---------- 下 ---------- */

    else if (
        vertical >
        GAZE_VERTICAL_MAX
    ) {

        attentionGazeDirection =
            "下";


        lookingAtScreen =
            false;

    }


    /* ---------- 中央 ---------- */

    else {

        attentionGazeDirection =
            "中央";


        lookingAtScreen =
            true;

    }


    /* =====================================================
       ⑩ 更新專注／分心狀態
    ===================================================== */

    updateAttentionState(
        lookingAtScreen,
        now
    );
/*
    將 app.js 的最新視線結果
    提供給 attention.js
*/

syncEyeDataToAttention();

    /* =====================================================
       ⑪ 更新右側後台
    ===================================================== */

    updateAttentionDebugPanel(
        true,
        horizontal,
        vertical
    );

}

/* =========================================================
   59-5. 計算虹膜中心
========================================================= */

function getAverageLandmark(
    landmarks,
    indexes
) {

    /*
        取得指定的 landmarks
    */

    const points =
        indexes
            .map(
                function (index) {

                    return landmarks[index];

                }
            )
            .filter(Boolean);


    /*
        沒有資料
    */

    if (
        points.length === 0
    ) {

        return null;

    }


    /* -----------------------------------------------------
       累加 X / Y / Z
    ----------------------------------------------------- */

    let x = 0;

    let y = 0;

    let z = 0;


    points.forEach(
        function (point) {

            x +=
                point.x;


            y +=
                point.y;


            z +=
                point.z || 0;

        }
    );


    /* -----------------------------------------------------
       回傳平均中心
    ----------------------------------------------------- */

    return {

        x:
            x /
            points.length,


        y:
            y /
            points.length,


        z:
            z /
            points.length

    };

}


/* =========================================================
   59-6. 計算虹膜在眼睛中的相對位置
========================================================= */

function calculateEyeRatio(
    iris,
    edge1,
    edge2
) {

    /*
        找出眼睛兩側較小的位置
    */

    const min =
        Math.min(
            edge1,
            edge2
        );


    /*
        找出眼睛兩側較大的位置
    */

    const max =
        Math.max(
            edge1,
            edge2
        );


    /*
        眼睛寬度／高度
    */

    const size =
        max - min;


    /*
        防止除以 0
    */

    if (
        size <= 0
    ) {

        return 0.5;

    }


    /*
        回傳虹膜相對位置

        約 0.5：
        虹膜位於中央

        越靠近 0：
        越靠其中一側

        越靠近 1：
        越靠另一側
    */

    return (
        iris - min
    ) / size;

}



/* =========================================================
   59-7. 更新視線專注狀態

   防抖規則：

   連續離開 150ms
   → 正式記錄一次分心

   連續回到畫面 150ms
   → 正式結束分心

   分心開始時間仍從「第一次離開」開始計算
========================================================= */

function updateAttentionState(
    lookingAtScreen,
    now
) {

    /* =====================================================
       ① 第一次取得有效視線
    ===================================================== */

    if (
        attentionLastFrameTime ===
        null
    ) {

        attentionLastFrameTime =
            now;


        attentionIsLookingAtScreen =
            lookingAtScreen;


        attentionDistractionStartTime =
            null;


        attentionCurrentDistractionTime =
            0;


        attentionLeaveCandidateTime =
            null;


        attentionReturnCandidateTime =
            null;


        console.log(
            "FocusTale：視線初始狀態",
            lookingAtScreen
                ? "畫面內"
                : "尚未穩定"
        );


        return;

    }


    /* =====================================================
       ② 計算上一幀到現在經過多久
    ===================================================== */

    const delta =
        Math.max(
            0,
            now -
            attentionLastFrameTime
        );


    attentionLastFrameTime =
        now;


    /* =====================================================
       ③ 眼睛正在看畫面
    ===================================================== */

    if (lookingAtScreen) {

        /*
            已經回到畫面，
            所以取消離開候選。
        */

        attentionLeaveCandidateTime =
            null;


        /* =============================================
           目前沒有正式分心
           → 正常累積專注時間
        ============================================= */

        if (
            attentionDistractionStartTime ===
            null
        ) {

            attentionFocusedTime +=
                delta;


            attentionReturnCandidateTime =
                null;


            attentionIsLookingAtScreen =
                true;


            return;

        }


        /* =============================================
           目前正在分心

           第一次偵測到回來
           → 開始回歸確認
        ============================================= */

        if (
            attentionReturnCandidateTime ===
            null
        ) {

            attentionReturnCandidateTime =
                now;


            return;

        }


        /*
            已經連續回來多久
        */

        const returnDuration =
            now -
            attentionReturnCandidateTime;


        /*
            還不到確認時間
        */

        if (
            returnDuration <
            ATTENTION_RETURN_CONFIRM_TIME
        ) {

            return;

        }


        /* =============================================
           已穩定回到畫面
           → 正式重新投入
        ============================================= */

        const reengagementTime =
            (
                attentionReturnCandidateTime -
                attentionDistractionStartTime
            ) / 1000;


        attentionLastReengagementTime =
            reengagementTime;


        attentionReengagementTimes.push(
            reengagementTime
        );


        console.log(
            "FocusTale：重新投入",
            reengagementTime.toFixed(2),
            "秒"
        );


        /*
            回歸確認期間其實已經在看畫面，
            補進專注時間。
        */

        attentionFocusedTime +=
            now -
            attentionReturnCandidateTime;


        /*
            正式結束分心
        */

        attentionDistractionStartTime =
            null;


        attentionCurrentDistractionTime =
            0;


        attentionReturnCandidateTime =
            null;


        attentionIsLookingAtScreen =
            true;


        return;

    }


    /* =====================================================
       ④ 眼睛離開畫面
    ===================================================== */

    /*
        又離開畫面，
        取消回歸候選。
    */

    attentionReturnCandidateTime =
        null;


    /* =============================================
       已經是正式分心
       → 持續更新時間
    ============================================= */

    if (
        attentionDistractionStartTime !==
        null
    ) {

        attentionIsLookingAtScreen =
            false;


        attentionCurrentDistractionTime =
            (
                now -
                attentionDistractionStartTime
            ) / 1000;


        return;

    }


    /* =============================================
       第一次偵測到離開

       先建立候選，
       暫時不 +1。
    ============================================= */

    if (
        attentionLeaveCandidateTime ===
        null
    ) {

        attentionLeaveCandidateTime =
            now;


        return;

    }


    /*
        已經連續離開多久
    */

    const leaveDuration =
        now -
        attentionLeaveCandidateTime;


    /*
        不到 150ms
        → 暫時視為可能的偵測抖動
    */

    if (
        leaveDuration <
        ATTENTION_LEAVE_CONFIRM_TIME
    ) {

        return;

    }


    /* =============================================
       ⑤ 正式確認分心

       注意：

       雖然現在才確認，
       但開始時間使用第一次離開的時間。

       所以沒有少算前面的 150ms。
    ============================================= */

    attentionDistractionStartTime =
        attentionLeaveCandidateTime;


    attentionLeaveCandidateTime =
        null;


    attentionIsLookingAtScreen =
        false;


    attentionDistractionCount++;


    attentionCurrentDistractionTime =
        (
            now -
            attentionDistractionStartTime
        ) / 1000;


    console.log(
        "FocusTale：視線持續離開，正式記錄分心"
    );

}

/* =========================================================
   提供眼睛偵測結果給 attention.js
========================================================= */

function syncEyeDataToAttention() {

    window.focusTaleEyeData = {

        ready:
            attentionFaceLandmarkerReady === true,

        lookingAtScreen:
            attentionIsLookingAtScreen,

        direction:
            attentionGazeDirection,

        distractionCount:
            attentionDistractionCount,

        isDistracted:
            attentionDistractionStartTime !== null,

        distractionStartTime:
            attentionDistractionStartTime,

        currentDistractionTime:
            attentionCurrentDistractionTime,

        reengagementTimes:
            [
                ...attentionReengagementTimes
            ]

    };

}

/* =========================================================
   60. 關閉攝影機＋停止眼睛視線偵測
========================================================= */

function stopAttentionCamera() {

    /* -----------------------------------------------------
       ① 停止眼睛偵測動畫
    ----------------------------------------------------- */

    if (
        attentionDetectionFrame !==
        null
    ) {

        cancelAnimationFrame(
            attentionDetectionFrame
        );

        attentionDetectionFrame =
            null;

    }


    /* -----------------------------------------------------
       ② 關閉攝影機串流
    ----------------------------------------------------- */

    if (
        attentionCameraStream
    ) {

        attentionCameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );


        attentionCameraStream =
            null;

    }


    /* -----------------------------------------------------
       ③ 清除 video 的串流
    ----------------------------------------------------- */

    const camera =
        document.getElementById(
            "attentionCamera"
        );


    if (camera) {

        camera.pause();

        camera.srcObject =
            null;

    }


    /* -----------------------------------------------------
       ④ 重設偵測狀態
    ----------------------------------------------------- */

    attentionLastVideoTime =
        -1;


    attentionLastFrameTime =
        null;


    attentionIsLookingAtScreen =
        false;


    console.log(
        "FocusTale：攝影機與視線偵測已停止"
    );

}


/* =========================================================
   59-8. 更新右下角視線偵測後台
========================================================= */

function updateAttentionDebugPanel(
    faceDetected,
    horizontal = null,
    vertical = null
) {

    const debug =
        document.getElementById(
            "attentionDebug"
        );


    /*
        找不到後台顯示區
        就不更新
    */

    if (!debug) {

        return;

    }


    /* =====================================================
       ① 計算總閱讀時間
    ===================================================== */

    const totalTime =
        attentionSessionStartTime

            ? performance.now() -
                attentionSessionStartTime

            : 0;


    /* =====================================================
       ② 計算注視比例
    ===================================================== */

    const focusRate =
        totalTime > 0

            ? (
                attentionFocusedTime /
                totalTime
            ) * 100

            : 0;


    /* =====================================================
       ③ 計算平均重新投入時間
    ===================================================== */

    const averageReengagement =
        attentionReengagementTimes.length > 0

            ? attentionReengagementTimes
                .reduce(

                    function (
                        total,
                        value
                    ) {

                        return (
                            total +
                            value
                        );

                    },

                    0

                ) /
                attentionReengagementTimes.length

            : 0;


    /* =====================================================
       ④ 更新右下角內容
    ===================================================== */

    debug.innerHTML = `

        <strong>
            🟢 眼睛專注偵測中
        </strong>

        <br>


        👤 ${
            faceDetected
                ? "已偵測到臉"
                : "未偵測到臉"
        }

        <br>


        👀 視線方向：
        ${attentionGazeDirection}

        <br>


        🎯 注視畫面：
        ${
            (
                attentionFocusedTime /
                1000
            ).toFixed(1)
        } 秒

        <br>


        📊 注視比例：
        ${
            focusRate.toFixed(1)
        }%

        <br>


        ↪️ 分心次數：
        ${attentionDistractionCount} 次

        <br>


        ⌛ 本次分心：
        ${
            attentionCurrentDistractionTime
                .toFixed(1)
        } 秒

        <br>


        🔄 最近重新投入：
        ${
            attentionLastReengagementTime !==
            null

                ? attentionLastReengagementTime
                    .toFixed(1) +
                    " 秒"

                : "--"
        }

        <br>


        📊 平均重新投入：
        ${
            attentionReengagementTimes.length > 0

                ? averageReengagement
                    .toFixed(1) +
                    " 秒"

                : "--"
        }

        <br>


        ${
            horizontal !== null

                ? "👁️ X：" +
                    horizontal.toFixed(2)

                : ""
        }


        ${
            vertical !== null

                ? "｜Y：" +
                    vertical.toFixed(2)

                : ""
        }

    `;

}

/* =========================================================
   FocusTale app.js
   程式結束

   已完成：

   1. 第一幕故事

   2. 第二幕故事

   3. 第三幕
      - 語音播放
      - 語音結束後顯示：
        🔍 開始尋找甜甜
      - 開始搜尋時出現霧
      - 搜尋時隱藏字幕
      - 找到甜甜後再次出現霧
      - 切換完成圖片
      - 顯示繼續故事

   4. 第四幕
      - 語音播放
      - 語音結束後顯示：
        🎁 開始尋找三個禮物
      - 搜尋時隱藏字幕
      - 三個禮物點擊區
      - 紀錄尋找時間
      - 三個都找到後出現霧
      - 切換完成圖片
      - 顯示繼續故事

   5. 第五幕
      - 按下語音
      - 完整播放旁白
      - 旁白播放完成後
        才呼叫 startButterflyAnimation()
      - 蝴蝶飛完後
        才顯示繼續故事

   6. 第六幕
      - 語音結束後出現問題
      - 小鳥
      - 蝴蝶
      - 蜜蜂
      - 正確答案：蝴蝶
      - 答錯顯示：
        答錯囉～剛才飛過去的是蝴蝶喔！🦋

   7. 第七幕
      - 播放最後旁白
      - 顯示森林冒險完成
      - 顯示完成故事按鈕

========================================================= */