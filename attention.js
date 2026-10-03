console.log(
    "FocusTale：attention.js 載入成功"
);


/* =========================================================
   FocusTale
   眼睛視線專注行為分析

   注意：

   app.js
   → 負責攝影機
   → 負責 MediaPipe
   → 負責眼睛 / 虹膜視線判斷
   → 提供 attentionGazeDirection

   attention.js
   → 不再建立 MediaPipe
   → 不再判斷頭部方向
   → 只負責統計與保存資料
========================================================= */


/* =========================================================
   基本設定
========================================================= */

/*
    每 1 秒保存一次資料
*/

const DATA_SAVE_INTERVAL =
    1000;


/*
    每 1 秒記錄一次 timeline

    不要每一個 requestAnimationFrame
    都 push 一筆，
    否則閱讀幾分鐘就會產生大量資料。
*/

const TIMELINE_INTERVAL =
    1000;


/* =========================================================
   DOM 元素
========================================================= */

const attentionStatus =
    document.getElementById(
        "attentionStatus"
    );


const faceStatus =
    document.getElementById(
        "faceStatus"
    );


const headDirectionStatus =
    document.getElementById(
        "headDirectionStatus"
    );


const focusTimeStatus =
    document.getElementById(
        "focusTimeStatus"
    );


const focusRatioStatus =
    document.getElementById(
        "focusRatioStatus"
    );


const distractionStatus =
    document.getElementById(
        "distractionStatus"
    );


const distractionDurationStatus =
    document.getElementById(
        "distractionDurationStatus"
    );


const reengagementStatus =
    document.getElementById(
        "reengagementStatus"
    );


const averageReengagementStatus =
    document.getElementById(
        "averageReengagementStatus"
    );


/* =========================================================
   專注時間
========================================================= */

/*
    開始分析時間
*/

let attentionStartTime =
    null;


/*
    上一次更新專注時間
*/

let lastAttentionUpdateTime =
    null;


/*
    總閱讀時間
    單位：毫秒
*/

let totalAttentionTime =
    0;


/*
    眼睛看畫面的時間
    單位：毫秒
*/

let focusedAttentionTime =
    0;


/* =========================================================
   目前眼睛視線方向

   為了相容原本 report.js，
   暫時保留 currentHeadDirection 名稱。

   但現在它代表的是：

   CENTER
   LEFT
   RIGHT
   UP
   DOWN
   UNKNOWN

   全部都是「眼睛視線」。
========================================================= */

let currentHeadDirection =
    "UNKNOWN";


/* =========================================================
   視線方向時間
========================================================= */

let headDirectionTimes = {

    CENTER: 0,

    LEFT: 0,

    RIGHT: 0,

    UP: 0,

    DOWN: 0,

    UNKNOWN: 0

};


let previousHeadDirection =
    "UNKNOWN";


let lastHeadDirectionUpdateTime =
    null;


/* =========================================================
   分心事件
========================================================= */

/*
    本次分心開始時間
*/

let distractionStartTime =
    null;


/*
    目前是否正在分心
*/

let isDistracted =
    false;


/*
    分心次數
*/

let distractionCount =
    0;


/*
    已完成的分心事件
*/

let distractionEvents =
    [];


/* =========================================================
   重新投入
========================================================= */

/*
    每一次：

    視線離開
       ↓
    重新看回中央

    所花的時間
*/

let reengagementTimes =
    [];


/* =========================================================
   Timeline
========================================================= */

let attentionTimeline =
    [];


let lastTimelineRecordTime =
    0;


/* =========================================================
   每秒保存控制
========================================================= */

let lastStoryDataUpdateTime =
    0;


/* =========================================================
   requestAnimationFrame
========================================================= */

let attentionAnalysisFrame =
    null;


/* =========================================================
   六大行為分析

   保持原本資料結構，
   避免 report.js 壞掉。
========================================================= */

let behaviorAnalysis = {


    /* ① 持續注意 */

    attention: {

        totalTime: 0,

        focusedTime: 0,

        focusRate: 0

    },


    /* ② 分心事件 */

    distraction: {

        count: 0,

        totalTime: 0,

        events: []

    },


    /* ③ 重新投入 */

    reengagement: {

        count: 0,

        averageTime: 0,

        times: []

    },


    /*
        ④ 視覺方向

        欄位名稱 headDirection
        暫時保留給 report.js。

        實際內容現在是眼睛視線方向。
    */

    headDirection: {

        center: 0,

        left: 0,

        right: 0,

        up: 0,

        down: 0,

        unknown: 0

    },


    /* ⑤ 任務反應 */

    interaction: {

        deerReactionTime: null,

        giftTotalTime: null,

        giftTimes: []

    },


    /* ⑥ 故事理解 */

    comprehension: {

        reactionTime: null,

        selectedAnswer: null,

        correct: null

    },


    /*
        專注歷程
    */

    timeline: []

};


/* =========================================================
   從 app.js 取得最新眼睛視線
========================================================= */

function syncEyeTrackingData() {

    /*
        app.js 必須提供：

        attentionGazeDirection

        值預期為：

        中央
        左
        右
        上
        下
        未偵測
    */

    if (
        typeof attentionGazeDirection ===
        "undefined"
    ) {

        currentHeadDirection =
            "UNKNOWN";


        updateEyeDirectionDisplay();


        return;

    }


    if (
        attentionGazeDirection ===
        "中央"
    ) {

        currentHeadDirection =
            "CENTER";

    }


    else if (
        attentionGazeDirection ===
        "左"
    ) {

        currentHeadDirection =
            "LEFT";

    }


    else if (
        attentionGazeDirection ===
        "右"
    ) {

        currentHeadDirection =
            "RIGHT";

    }


    else if (
        attentionGazeDirection ===
        "上"
    ) {

        currentHeadDirection =
            "UP";

    }


    else if (
        attentionGazeDirection ===
        "下"
    ) {

        currentHeadDirection =
            "DOWN";

    }


    else {

        currentHeadDirection =
            "UNKNOWN";

    }


    updateEyeDirectionDisplay();

}


/* =========================================================
   更新畫面上的視線文字
========================================================= */

function updateEyeDirectionDisplay() {

    if (!headDirectionStatus) {

        return;

    }


    if (
        currentHeadDirection ===
        "CENTER"
    ) {

        headDirectionStatus.textContent =
            "👀 視線方向：中央";

    }


    else if (
        currentHeadDirection ===
        "LEFT"
    ) {

        headDirectionStatus.textContent =
            "👀 視線方向：左";

    }


    else if (
        currentHeadDirection ===
        "RIGHT"
    ) {

        headDirectionStatus.textContent =
            "👀 視線方向：右";

    }


    else if (
        currentHeadDirection ===
        "UP"
    ) {

        headDirectionStatus.textContent =
            "👀 視線方向：上";

    }


    else if (
        currentHeadDirection ===
        "DOWN"
    ) {

        headDirectionStatus.textContent =
            "👀 視線方向：下";

    }


    else {

        headDirectionStatus.textContent =
            "👀 視線方向：未偵測";

    }

}


/* =========================================================
   更新專注時間

   CENTER
   → 專注

   LEFT / RIGHT / UP / DOWN / UNKNOWN
   → 非專注
========================================================= */

function updateAttentionTime() {

    const now =
        performance.now();


    /*
        第一次執行
    */

    if (
        attentionStartTime ===
        null
    ) {

        attentionStartTime =
            now;


        lastAttentionUpdateTime =
            now;


        return;

    }


    const delta =
        now -
        lastAttentionUpdateTime;


    lastAttentionUpdateTime =
        now;


    /*
        累積總閱讀時間
    */

    totalAttentionTime +=
        delta;


    /*
        只有視線中央才算專注
    */

    if (
        currentHeadDirection ===
        "CENTER"
    ) {

        focusedAttentionTime +=
            delta;

    }


    /*
        寫入六大行為分析
    */

    behaviorAnalysis.attention.totalTime =
        totalAttentionTime /
        1000;


    behaviorAnalysis.attention.focusedTime =
        focusedAttentionTime /
        1000;


    if (
        totalAttentionTime > 0
    ) {

        behaviorAnalysis.attention.focusRate =
            (
                focusedAttentionTime /
                totalAttentionTime
            ) * 100;

    }

    else {

        behaviorAnalysis.attention.focusRate =
            0;

    }


    updateAttentionDisplay();

}


/* =========================================================
   更新專注資訊顯示
========================================================= */

function updateAttentionDisplay() {

    if (focusTimeStatus) {

        focusTimeStatus.textContent =
            (
                focusedAttentionTime /
                1000
            ).toFixed(1) +
            " 秒";

    }


    if (focusRatioStatus) {

        const focusRate =
            behaviorAnalysis
                .attention
                .focusRate;


        focusRatioStatus.textContent =
            focusRate.toFixed(1) +
            "%";

    }

}


/* =========================================================
   更新分心

   規則：

   眼睛只要不是 CENTER
   → 立即算一次分心

   持續看旁邊
   → 不重複增加

   看回 CENTER
   → 結束本次分心
   → 記錄重新投入時間
========================================================= */

/* =========================================================
   更新分心事件

   注意：
   attention.js 不再自己判斷視線是否離開。

   真正的視線判斷由 app.js 負責：
   → 150ms 離開防抖
   → 150ms 回歸防抖

   attention.js 只同步 app.js 已確認的結果。
========================================================= */

function updateDistraction() {

    const now =
        performance.now();


    /* =====================================================
       ① 確認 app.js 的視線系統是否已經準備好
    ===================================================== */

    if (
        typeof window.focusTaleEyeData ===
        "undefined"
    ) {

        updateDistractionDisplay(
            now
        );

        return;

    }


    const eyeData =
        window.focusTaleEyeData;


    /* =====================================================
       ② 尚未取得有效視線資料

       → 不算專注
       → 不算分心
    ===================================================== */

    if (
        !eyeData.ready
    ) {

        updateDistractionDisplay(
            now
        );

        return;

    }


    /* =====================================================
       ③ 直接同步 app.js 已確認的分心資料
    ===================================================== */

    distractionCount =
        eyeData.distractionCount || 0;


    isDistracted =
        eyeData.isDistracted === true;


    /* =====================================================
       ④ 同步目前分心開始時間

       app.js 傳進來的是 performance.now() 時間基準，
       所以可以直接使用。
    ===================================================== */

    if (
        isDistracted &&
        eyeData.distractionStartTime !== null
    ) {

        distractionStartTime =
            eyeData.distractionStartTime;

    }

    else {

        distractionStartTime =
            null;

    }


    /* =====================================================
       ⑤ 同步重新投入資料
    ===================================================== */

    if (
        Array.isArray(
            eyeData.reengagementTimes
        )
    ) {

        reengagementTimes =
            [
                ...eyeData.reengagementTimes
            ];

    }


    /* =====================================================
       ⑥ 同步完成的分心事件

       如果 app.js 有提供，就直接使用。
    ===================================================== */

    if (
        Array.isArray(
            eyeData.distractionEvents
        )
    ) {

        distractionEvents =
            [
                ...eyeData.distractionEvents
            ];

    }


    /* =====================================================
       ⑦ 更新畫面
    ===================================================== */

    updateDistractionDisplay(
        now
    );

}


/* =========================================================
   更新分心／重新投入顯示
========================================================= */

function updateDistractionDisplay(
    now
) {

    if (distractionStatus) {

        distractionStatus.textContent =
            distractionCount +
            " 次";

    }


    if (
        distractionDurationStatus
    ) {

        let currentDuration =
            0;


        if (
            isDistracted &&
            distractionStartTime !==
            null
        ) {

            currentDuration =
                (
                    now -
                    distractionStartTime
                ) / 1000;

        }


        distractionDurationStatus.textContent =
            currentDuration.toFixed(1) +
            " 秒";

    }


    if (reengagementStatus) {

        reengagementStatus.textContent =
            reengagementTimes.length +
            " 次";

    }


    if (
        averageReengagementStatus
    ) {

        let average =
            0;


        if (
            reengagementTimes.length > 0
        ) {

            average =
                reengagementTimes.reduce(

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
                reengagementTimes.length;

        }


        averageReengagementStatus.textContent =
            average.toFixed(2) +
            " 秒";

    }

}


/* =========================================================
   更新視線方向時間

   注意：

   behaviorAnalysis.headDirection
   名稱暫時保留。

   但內容現在全部代表眼睛視線。
========================================================= */

function updateHeadDirectionTime() {

    const now =
        performance.now();


    /*
        第一次執行
    */

    if (
        lastHeadDirectionUpdateTime ===
        null
    ) {

        lastHeadDirectionUpdateTime =
            now;


        previousHeadDirection =
            currentHeadDirection;


        return;

    }


    const delta =
        now -
        lastHeadDirectionUpdateTime;


    lastHeadDirectionUpdateTime =
        now;


    /*
        將剛才經過的時間
        加到上一個方向。
    */

    if (
        previousHeadDirection ===
        "CENTER"
    ) {

        headDirectionTimes.CENTER +=
            delta;

    }


    else if (
        previousHeadDirection ===
        "LEFT"
    ) {

        headDirectionTimes.LEFT +=
            delta;

    }


    else if (
        previousHeadDirection ===
        "RIGHT"
    ) {

        headDirectionTimes.RIGHT +=
            delta;

    }


    else if (
        previousHeadDirection ===
        "UP"
    ) {

        headDirectionTimes.UP +=
            delta;

    }


    else if (
        previousHeadDirection ===
        "DOWN"
    ) {

        headDirectionTimes.DOWN +=
            delta;

    }


    else {

        headDirectionTimes.UNKNOWN +=
            delta;

    }


    /*
        更新目前方向
    */

    previousHeadDirection =
        currentHeadDirection;


    /*
        寫進 behaviorAnalysis

        report.js 原本使用小寫，
        所以這裡保持小寫。
    */

    behaviorAnalysis.headDirection.center =
        headDirectionTimes.CENTER /
        1000;


    behaviorAnalysis.headDirection.left =
        headDirectionTimes.LEFT /
        1000;


    behaviorAnalysis.headDirection.right =
        headDirectionTimes.RIGHT /
        1000;


    behaviorAnalysis.headDirection.up =
        headDirectionTimes.UP /
        1000;


    behaviorAnalysis.headDirection.down =
        headDirectionTimes.DOWN /
        1000;


    behaviorAnalysis.headDirection.unknown =
        headDirectionTimes.UNKNOWN /
        1000;

}


/* =========================================================
   同步故事互動資料

   app.js 已經把故事互動資料放在：

   focusTaleStoryData
========================================================= */

function updateStoryInteractionData() {

    const savedStoryData =
        localStorage.getItem(
            "focusTaleStoryData"
        );


    if (!savedStoryData) {

        return;

    }


    try {

        const storyData =
            JSON.parse(
                savedStoryData
            );


        /* =================================================
           ⑤ 任務反應
        ================================================= */

        behaviorAnalysis
            .interaction
            .deerReactionTime =
            storyData.deerReactionTime ??
            null;


        behaviorAnalysis
            .interaction
            .giftTotalTime =
            storyData.giftTotalTime ??
            null;


        behaviorAnalysis
            .interaction
            .giftTimes =
            Array.isArray(
                storyData.giftTimes
            )
                ? storyData.giftTimes
                : [];


        /* =================================================
           ⑥ 故事理解
        ================================================= */

        behaviorAnalysis
            .comprehension
            .reactionTime =
            storyData.scene6ReactionTime ??
            null;


        behaviorAnalysis
            .comprehension
            .selectedAnswer =
            storyData.scene6SelectedAnswer ??
            null;


        behaviorAnalysis
            .comprehension
            .correct =
            storyData.scene6Correct ??
            null;

    }

    catch (error) {

        console.error(
            "FocusTale：讀取故事互動資料失敗",
            error
        );

    }

}


/* =========================================================
   Timeline

   每 1 秒記錄一筆，
   避免每幀產生大量資料。
========================================================= */

function recordAttentionTimeline() {

    if (
        attentionStartTime ===
        null
    ) {

        return;

    }


    const now =
        performance.now();


    /*
        距離上一筆不足 1 秒
        就先不記。
    */

    if (
        now -
        lastTimelineRecordTime <
        TIMELINE_INTERVAL
    ) {

        return;

    }


    lastTimelineRecordTime =
        now;


    const elapsedTime =
        (
            now -
            attentionStartTime
        ) / 1000;


    attentionTimeline.push({

        time:
            Number(
                elapsedTime.toFixed(1)
            ),

        /*
            這裡實際存的是眼睛視線方向
        */

        direction:
            currentHeadDirection,

        focused:
            currentHeadDirection ===
            "CENTER",

        distracted:
            isDistracted

    });

}


/* =========================================================
   將目前分心資料同步進 behaviorAnalysis
========================================================= */

function syncDistractionAnalysis() {

    const now =
        performance.now();


    behaviorAnalysis.distraction.count =
        distractionCount;


    behaviorAnalysis.distraction.events =
        [
            ...distractionEvents
        ];


    /*
        已完成事件的總時間
    */

    let totalDistractionTime =
        distractionEvents.reduce(

            function (
                total,
                event
            ) {

                return (
                    total +
                    event.duration
                );

            },

            0

        );


    /*
        如果目前仍在分心，
        報告中的 totalTime
        也先加上正在進行的時間。

        但不 push 到 events，
        避免完成後重複。
    */

    if (
        isDistracted &&
        distractionStartTime !==
        null
    ) {

        totalDistractionTime +=
            (
                now -
                distractionStartTime
            ) / 1000;

    }


    behaviorAnalysis
        .distraction
        .totalTime =
        totalDistractionTime;

}


/* =========================================================
   將重新投入資料同步進 behaviorAnalysis
========================================================= */

function syncReengagementAnalysis() {

    behaviorAnalysis
        .reengagement
        .times =
        [
            ...reengagementTimes
        ];


    behaviorAnalysis
        .reengagement
        .count =
        reengagementTimes.length;


    if (
        reengagementTimes.length > 0
    ) {

        behaviorAnalysis
            .reengagement
            .averageTime =
            reengagementTimes.reduce(

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
            reengagementTimes.length;

    }

    else {

        behaviorAnalysis
            .reengagement
            .averageTime =
            0;

    }

}


/* =========================================================
   保存完整專注分析
========================================================= */

function saveAttentionAnalysis() {

    /*
        同步 timeline
    */

    behaviorAnalysis.timeline =
        [
            ...attentionTimeline
        ];


    localStorage.setItem(

        "focusTaleAttentionData",

        JSON.stringify(
            behaviorAnalysis
        )

    );

}


/* =========================================================
   每秒完整同步一次資料
========================================================= */

function saveCurrentAnalysis() {

    /*
        分心
    */

    syncDistractionAnalysis();


    /*
        重新投入
    */

    syncReengagementAnalysis();


    /*
        故事互動
    */

    updateStoryInteractionData();


    /*
        保存
    */

    saveAttentionAnalysis();

}


/* =========================================================
   眼睛專注分析循環
========================================================= */

function startAttentionAnalysisLoop() {

    /*
        防止重複啟動
    */

    if (
        attentionAnalysisFrame !==
        null
    ) {

        cancelAnimationFrame(
            attentionAnalysisFrame
        );


        attentionAnalysisFrame =
            null;

    }


    /*
        初始化
    */

    attentionStartTime =
        null;


    lastAttentionUpdateTime =
        null;


    lastHeadDirectionUpdateTime =
        null;


    lastTimelineRecordTime =
        0;


    lastStoryDataUpdateTime =
        performance.now();


    console.log(
        "FocusTale：眼睛專注資料分析開始"
    );


    if (attentionStatus) {

        attentionStatus.textContent =
            "🟢 眼睛專注偵測中";

    }


    /* =====================================================
       分析循環
    ===================================================== */

    function analyze() {

        /*
            ① 從 app.js 取得最新視線
        */

        syncEyeTrackingData();


        /*
            ② 專注時間
        */

        updateAttentionTime();


        /*
            ③ 分心
        */

        updateDistraction();


        /*
            ④ 視線方向時間
        */

        updateHeadDirectionTime();


        /*
            ⑤ Timeline
        */

        recordAttentionTimeline();


        /*
            ⑥ 每 1 秒保存一次
        */

        const now =
            performance.now();


        if (
            now -
            lastStoryDataUpdateTime >=
            DATA_SAVE_INTERVAL
        ) {

            saveCurrentAnalysis();


            lastStoryDataUpdateTime =
                now;

        }


        /*
            下一幀
        */

        attentionAnalysisFrame =
            requestAnimationFrame(
                analyze
            );

    }


    analyze();

}


/* =========================================================
   頁面載入後啟動分析

   注意：
   這裡不啟動 MediaPipe。

   MediaPipe 已經由 app.js 負責。
========================================================= */

window.addEventListener(

    "load",

    function () {

        startAttentionAnalysisLoop();

    }

);


/* =========================================================
   離開故事頁前
   保存最後一次完整資料
========================================================= */

let finalAttentionDataSaved =
    false;


function saveFinalAttentionData() {

    /*
        防止 pagehide 重複執行
    */

    if (
        finalAttentionDataSaved
    ) {

        return;

    }


    finalAttentionDataSaved =
        true;


    /*
        取得最後一次眼睛視線
    */

    syncEyeTrackingData();


    /*
        如果分析根本還沒開始，
        至少保存故事互動資料。
    */

    if (
        attentionStartTime ===
        null
    ) {

        updateStoryInteractionData();


        saveAttentionAnalysis();


        return;

    }


    /*
        補最後一段專注時間
    */

    updateAttentionTime();


    /*
        補最後一段視線方向時間
    */

    updateHeadDirectionTime();


    /*
        注意：

        這裡不直接呼叫 updateDistraction()
        來結束事件。

        如果使用者離開頁面時仍在分心，
        我們另外建立 unfinishedEvent。
    */


    const now =
        performance.now();


    /* =====================================================
       最後 Timeline
    ===================================================== */

    const elapsedTime =
        (
            now -
            attentionStartTime
        ) / 1000;


    attentionTimeline.push({

        time:
            Number(
                elapsedTime.toFixed(1)
            ),

        direction:
            currentHeadDirection,

        focused:
            currentHeadDirection ===
            "CENTER",

        distracted:
            isDistracted

    });


    /* =====================================================
       保存分心事件
    ===================================================== */

    behaviorAnalysis.distraction.count =
        distractionCount;


    /*
        先複製所有已完成事件
    */

    const finalDistractionEvents =
        [
            ...distractionEvents
        ];


    /*
        如果離開時仍然正在分心，
        加一筆 unfinished。
    */

    if (
        isDistracted &&
        distractionStartTime !==
        null
    ) {

        const duration =
            (
                now -
                distractionStartTime
            ) / 1000;


        finalDistractionEvents.push({

            startTime:
                (
                    distractionStartTime -
                    attentionStartTime
                ) / 1000,

            duration:
                duration,

            unfinished:
                true

        });

    }


    behaviorAnalysis.distraction.events =
        finalDistractionEvents;


    behaviorAnalysis.distraction.totalTime =
        finalDistractionEvents.reduce(

            function (
                total,
                event
            ) {

                return (
                    total +
                    event.duration
                );

            },

            0

        );


    /* =====================================================
       保存重新投入
    ===================================================== */

    syncReengagementAnalysis();


    /* =====================================================
       保存故事互動
    ===================================================== */

    updateStoryInteractionData();


    /* =====================================================
       保存 Timeline
    ===================================================== */

    behaviorAnalysis.timeline =
        [
            ...attentionTimeline
        ];


    /* =====================================================
       最後保存
    ===================================================== */

    saveAttentionAnalysis();


    console.log(
        "FocusTale：離開故事頁面前，眼睛視線資料已保存",
        behaviorAnalysis
    );

}


/* =========================================================
   pagehide

   切換到 report.html 或離開故事頁時，
   保存最後資料。
========================================================= */

window.addEventListener(

    "pagehide",

    function () {

        saveFinalAttentionData();

    }

);