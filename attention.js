console.log(
    "FocusTale：attention.js 載入成功"
);


/* =========================================================
   FocusTale
   專注行為分析
========================================================= */


/* ---------------------------------------------------------
   取得畫面上的元素
--------------------------------------------------------- */

const camera =
    document.getElementById(
        "attentionCamera"
    );

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
/* ---------------------------------------------------------
   MediaPipe 變數
--------------------------------------------------------- */

let faceLandmarker = null;

let lastVideoTime = -1;

/* 上一次同步故事互動資料的時間 */
let lastStoryDataUpdateTime = 0;


/* ---------------------------------------------------------
   專注歷程
--------------------------------------------------------- */

/* 儲存整個閱讀過程的專注狀態 */
let attentionTimeline = [];

/* 上一次記錄歷程的時間 */
let lastTimelineRecordTime = 0;

/* 每 1 秒記錄一次 */
const TIMELINE_INTERVAL = 1000;



/* ---------------------------------------------------------
   持續注意計時
--------------------------------------------------------- */

/* 開始觀察的時間 */
let attentionStartTime = null;

/* 上一次更新時間 */
let lastAttentionUpdateTime = null;

/* 累積面向畫面的毫秒數 */
let focusedTime = 0;

/* 目前頭部方向 */
let currentHeadDirection = "UNKNOWN";

/* 上一次統計頭部方向的時間 */
let lastHeadDirectionUpdateTime = null;

/* ---------------------------------------------------------
   分心事件紀錄
--------------------------------------------------------- */

/* 開始偏離中央的時間 */
let distractionStartTime = null;

/* 目前是否已經正式算成一次分心 */
let isDistracted = false;

/* 分心次數 */
let distractionCount = 0;

/* 每一次分心的完整資料 */
let distractionEvents = [];

/* 每次重新投入所花的時間 */
let reengagementTimes = [];

/*
    超過 2 秒才正式算一次分心
*/
const DISTRACTION_THRESHOLD = 2000;


/* =========================================================
   六大行為分析指標
========================================================= */

let behaviorAnalysis = {

    // ① 持續注意
    attention: {
        totalTime: 0,
        focusedTime: 0,
        focusRate: 0
    },

    // ② 分心事件
    distraction: {
        count: 0,
        totalTime: 0,
        events: []
    },

    // ③ 重新投入
    reengagement: {
        count: 0,
        averageTime: 0,
        times: []
    },

    // ④ 視覺方向
    headDirection: {
        center: 0,
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        unknown: 0
    },

    // ⑤ 任務反應
    interaction: {
        deerReactionTime: null,
        giftTotalTime: null,
        giftTimes: []
    },

    // ⑥ 故事理解
    comprehension: {
        reactionTime: null,
        selectedAnswer: null,
        correct: null
    }

};


/* ---------------------------------------------------------
   載入 MediaPipe
--------------------------------------------------------- */

async function initializeFaceDetection() {

    try {

        attentionStatus.textContent =
            "🟡 正在載入臉部偵測...";


        /*
            從 CDN 載入 MediaPipe Tasks Vision
        */

        const vision =
            await import(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/+esm"
            );


        const {
            FaceLandmarker,
            FilesetResolver
        } = vision;


        /*
            載入 MediaPipe WASM
        */

        const filesetResolver =
            await FilesetResolver.forVisionTasks(

                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"

            );


        /*
            建立 Face Landmarker
        */

        faceLandmarker =
            await FaceLandmarker.createFromOptions(

                filesetResolver,

                {

                    baseOptions: {

                        modelAssetPath:

                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

                    },

                    runningMode:
                        "VIDEO",

                    numFaces:
                        1

                }

            );

console.log(
    "【測試】FaceLandmarker 建立完成"
);


if (attentionStatus) {

    attentionStatus.textContent =
        "🟢 專注偵測中";

}


if (faceStatus) {

    faceStatus.textContent =
        "👤 準備偵測臉部...";

}


console.log(
    "FocusTale：MediaPipe 載入成功"
);


detectFace();

    }

    catch (error) {

        if (attentionStatus) {

            attentionStatus.textContent =
                "🔴 臉部偵測載入失敗";

        }


        console.error(
            "FocusTale：MediaPipe 載入失敗",
            error
        );

    }

}


/* =========================================================
   判斷頭部方向

   使用 Face Landmarker 的臉部特徵點，
   以鼻子相對於臉部左右、上下位置
   做簡單的方向估計。

   回傳：
   CENTER
   LEFT
   RIGHT
   UP
   DOWN
   UNKNOWN
========================================================= */

function getHeadDirection(
    landmarks
) {

    if (
        !landmarks ||
        landmarks.length === 0
    ) {

        return "UNKNOWN";

    }


    /*
        MediaPipe Face Landmarker 特徵點

        1   ：鼻子附近
        234 ：臉部左側
        454 ：臉部右側
        10  ：臉部上方
        152 ：下巴
    */

    const nose =
        landmarks[1];

    const leftFace =
        landmarks[234];

    const rightFace =
        landmarks[454];

    const forehead =
        landmarks[10];

    const chin =
        landmarks[152];


    if (
        !nose ||
        !leftFace ||
        !rightFace ||
        !forehead ||
        !chin
    ) {

        return "UNKNOWN";

    }


    /* -----------------------------
       左右方向
    ----------------------------- */

    const faceCenterX =
        (
            leftFace.x +
            rightFace.x
        ) / 2;


    const faceWidth =
        Math.abs(
            rightFace.x -
            leftFace.x
        );


    if (faceWidth <= 0) {

        return "UNKNOWN";

    }


    const horizontalOffset =
        (
            nose.x -
            faceCenterX
        ) / faceWidth;


    /* -----------------------------
       上下方向
    ----------------------------- */

    const faceCenterY =
        (
            forehead.y +
            chin.y
        ) / 2;


    const faceHeight =
        Math.abs(
            chin.y -
            forehead.y
        );


    if (faceHeight <= 0) {

        return "UNKNOWN";

    }


const verticalOffset =
    (
        nose.y -
        faceCenterY
    ) / faceHeight;


console.log(
    "horizontalOffset:",
    horizontalOffset.toFixed(3),
    "verticalOffset:",
    verticalOffset.toFixed(3)
);


    /*
        先判斷幅度較明顯的方向。

        這些門檻之後可以依實際測試
        再調整，不把它當成醫療判定。
    */


    /*
    上下方向優先判斷
*/

if (verticalOffset < -0.05) {

    return "UP";

}


if (verticalOffset > 0.10) {

    return "DOWN";

}


/*
    再判斷左右
*/

if (horizontalOffset < -0.12) {

    return "RIGHT";

}


if (horizontalOffset > 0.12) {

    return "LEFT";

}


/*
    都沒有超過門檻
    就視為大致面向中央
*/

return "CENTER";
}


/* =========================================================
   持續注意時間統計
========================================================= */

function updateAttentionTime() {

    const now =
        performance.now();


    if (attentionStartTime === null) {

        attentionStartTime =
            now;

        lastAttentionUpdateTime =
            now;

        return;

    }


    const deltaTime =
        now -
        lastAttentionUpdateTime;


    lastAttentionUpdateTime =
        now;


    /*
        只有中央才算面向畫面
    */

    if (
        currentHeadDirection ===
        "CENTER"
    ) {

        focusedTime +=
            deltaTime;

    }


    const totalTime =
        now -
        attentionStartTime;


    let focusRatio = 0;


    if (totalTime > 0) {

        focusRatio =
            (
                focusedTime /
                totalTime
            ) * 100;

    }

    /*
    同步到六大行為分析
*/

behaviorAnalysis.attention.totalTime =
    totalTime / 1000;

behaviorAnalysis.attention.focusedTime =
    focusedTime / 1000;

behaviorAnalysis.attention.focusRate =
    focusRatio;

    if (focusTimeStatus) {

        focusTimeStatus.textContent =
            "⏱️ 面向畫面：" +
            (focusedTime / 1000)
                .toFixed(1) +
            " 秒";

    }


    if (focusRatioStatus) {

        focusRatioStatus.textContent =
            "📊 面向比例：" +
            focusRatio.toFixed(1) +
            "%";

    }

}


/* =========================================================
   分心事件判斷
========================================================= */

function updateDistraction() {

    const now =
        performance.now();


    /*
        中央 = 目前面向故事
    */

    if (
        currentHeadDirection ===
        "CENTER"
    ) {

        /*
            如果剛才已經正式進入分心，
            現在回到中央，就結束這次事件。
        */

        if (
            isDistracted &&
            distractionStartTime !== null
        ) {

            const duration =
                now -
                distractionStartTime;


            distractionEvents.push({

                startTime:
                    (
                        distractionStartTime -
                        attentionStartTime
                    ) / 1000,

                duration:
                    duration / 1000

            });


            behaviorAnalysis.distraction.events =
    [...distractionEvents];


behaviorAnalysis.distraction.totalTime =
    distractionEvents.reduce(

        function (total, event) {

            return total + event.duration;

        },

        0

    );

            /*
    分心開始到重新面向中央的時間，
    作為這次重新投入所需時間。
*/

const reengagementTime =
    duration / 1000;


reengagementTimes.push(
    reengagementTime
);

behaviorAnalysis.reengagement.times =
    [...reengagementTimes];

behaviorAnalysis.reengagement.count =
    reengagementTimes.length;


/*
    計算平均重新投入時間
*/

const totalReengagementTime =
    reengagementTimes.reduce(
        function (total, time) {

            return total + time;

        },
        0
    );


const averageReengagementTime =
    totalReengagementTime /
    reengagementTimes.length;

    behaviorAnalysis.reengagement.averageTime =
    averageReengagementTime;

/*
    更新右下角
*/

if (reengagementStatus) {

    reengagementStatus.textContent =
        "🔄 最近重新投入：" +
        reengagementTime.toFixed(1) +
        " 秒";

}


if (averageReengagementStatus) {

    averageReengagementStatus.textContent =
        "📊 平均重新投入：" +
        averageReengagementTime.toFixed(1) +
        " 秒";

}


            console.log(
                "FocusTale：分心結束",
                distractionEvents[
                    distractionEvents.length - 1
                ]
            );

        }


        /*
            回到正常狀態
        */

        distractionStartTime =
            null;

        isDistracted =
            false;


        if (
            distractionDurationStatus
        ) {

            distractionDurationStatus.textContent =
                "⏳ 本次分心：0.0 秒";

        }


        return;

    }


    /*
        不是中央
        第一次發現偏離時開始計時
    */

    if (
        distractionStartTime === null
    ) {

        distractionStartTime =
            now;

    }


    const duration =
        now -
        distractionStartTime;


    /*
        超過 2 秒才正式算一次
    */

    if (
        !isDistracted &&
        duration >=
        DISTRACTION_THRESHOLD
    ) {

        isDistracted =
            true;

        distractionCount++;


        behaviorAnalysis.distraction.count =
    distractionCount;


        console.log(
            "FocusTale：偵測到第",
            distractionCount,
            "次分心"
        );

    }


    /*
        更新右下角
    */

    if (distractionStatus) {

        distractionStatus.textContent =
            "↪️ 分心次數：" +
            distractionCount +
            " 次";

    }


    if (
        distractionDurationStatus
    ) {

        /*
            未滿 2 秒時，
            還不把它顯示成正式分心。
        */

        if (isDistracted) {

            distractionDurationStatus.textContent =
                "⏳ 本次分心：" +
                (duration / 1000)
                    .toFixed(1) +
                " 秒";

        }

        else {

            distractionDurationStatus.textContent =
                "⏳ 本次分心：0.0 秒";

        }

    }

}


/* =========================================================
   視覺方向時間統計
========================================================= */

function updateHeadDirectionTime() {

    const now =
        performance.now();


    /*
        第一次執行時只記錄時間
    */

    if (
        lastHeadDirectionUpdateTime ===
        null
    ) {

        lastHeadDirectionUpdateTime =
            now;

        return;

    }


    /*
        計算距離上一次更新經過多久
    */

    const deltaTime =
        (
            now -
            lastHeadDirectionUpdateTime
        ) / 1000;


    lastHeadDirectionUpdateTime =
        now;


    /*
        將時間累積到目前方向
    */

    if (
        currentHeadDirection ===
        "CENTER"
    ) {

        behaviorAnalysis.headDirection.center +=
            deltaTime;

    }

    else if (
        currentHeadDirection ===
        "LEFT"
    ) {

        behaviorAnalysis.headDirection.left +=
            deltaTime;

    }

    else if (
        currentHeadDirection ===
        "RIGHT"
    ) {

        behaviorAnalysis.headDirection.right +=
            deltaTime;

    }

    else if (
        currentHeadDirection ===
        "UP"
    ) {

        behaviorAnalysis.headDirection.up +=
            deltaTime;

    }

    else if (
        currentHeadDirection ===
        "DOWN"
    ) {

        behaviorAnalysis.headDirection.down +=
            deltaTime;

    }

    else {

        behaviorAnalysis.headDirection.unknown +=
            deltaTime;

    }

}


/* =========================================================
   同步故事互動資料
========================================================= */

function updateStoryInteractionData() {

    /*
        從 localStorage 取得 app.js
        已經保存的故事互動資料
    */

    const savedStoryData =
        localStorage.getItem(
            "focusTaleStoryData"
        );


    /*
        還沒有資料時先不處理
    */

    if (!savedStoryData) {

        return;

    }


    try {

        const storyData =
            JSON.parse(
                savedStoryData
            );


        /* =============================================
           ⑤ 任務反應
        ============================================= */

        behaviorAnalysis.interaction.deerReactionTime =
            storyData.deerReactionTime ??
            null;


        behaviorAnalysis.interaction.giftTotalTime =
            storyData.giftTotalTime ??
            null;


        behaviorAnalysis.interaction.giftTimes =
            Array.isArray(
                storyData.giftTimes
            )
                ? storyData.giftTimes
                : [];


        /* =============================================
           ⑥ 故事理解
        ============================================= */

        behaviorAnalysis.comprehension.reactionTime =
            storyData.scene6ReactionTime ??
            null;


        behaviorAnalysis.comprehension.selectedAnswer =
            storyData.scene6SelectedAnswer ??
            null;


        behaviorAnalysis.comprehension.correct =
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
   專注歷程紀錄

   每 1 秒記錄一次目前的專注狀態，
   之後用來製作專注歷程圖。
========================================================= */

function recordAttentionTimeline() {

    const now =
        performance.now();


    /*
        還沒開始計算閱讀時間時
        先不要記錄
    */

    if (
        attentionStartTime ===
        null
    ) {

        return;

    }


    /*
        距離上一次紀錄還不到 1 秒
        就先不記錄
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


    /*
        計算目前是閱讀開始後第幾秒
    */

    const elapsedTime =
        (
            now -
            attentionStartTime
        ) / 1000;


    /*
        建立這一秒的專注資料
    */

    const timelinePoint = {

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

    };


    /*
        存進專注歷程
    */

    attentionTimeline.push(
        timelinePoint
    );

    console.log(
    "FocusTale 專注歷程：",
    timelinePoint
);

}

/* =========================================================
   保存專注行為分析資料
========================================================= */

function saveAttentionAnalysis() {

    /*
        將目前的專注歷程放進行為分析資料
    */

    behaviorAnalysis.timeline =
        [...attentionTimeline];


    /*
        保存到 localStorage

        report.html 之後會從這裡讀取。
    */

    localStorage.setItem(
        "focusTaleAttentionData",
        JSON.stringify(
            behaviorAnalysis
        )
    );

}


/* ---------------------------------------------------------
   持續偵測攝影機畫面
--------------------------------------------------------- */

function detectFace() {

    /*
        MediaPipe 或攝影機還沒準備好
    */

    if (
        !faceLandmarker ||
        !camera
    ) {

        requestAnimationFrame(
            detectFace
        );

        return;

    }


    /*
        等攝影機真的有畫面
    */

    if (
        camera.readyState < 2
    ) {

        requestAnimationFrame(
            detectFace
        );

        return;

    }


    /*
        只分析新的攝影機畫面
    */

    if (
        camera.currentTime !==
        lastVideoTime
    ) {

        lastVideoTime =
            camera.currentTime;


        const results =
            faceLandmarker.detectForVideo(

                camera,

                performance.now()

            );


        /* =============================================
           有偵測到臉
        ============================================= */

        if (
            results.faceLandmarks &&
            results.faceLandmarks.length > 0
        ) {

            if (faceStatus) {

                faceStatus.textContent =
                    "👤 已偵測到臉";

            }


            /*
                取得第一張臉的特徵點
            */

            const landmarks =
                results.faceLandmarks[0];


            /*
                判斷頭部方向
            */

            const direction =
                getHeadDirection(
                    landmarks
                );

            currentHeadDirection =
                 direction;

            /*
                更新畫面上的方向
            */

            if (headDirectionStatus) {

                if (
                    direction ===
                    "CENTER"
                ) {

                    headDirectionStatus.textContent =
                        "👀 頭部方向：中央";

                }

                else if (
                    direction ===
                    "LEFT"
                ) {

                    headDirectionStatus.textContent =
                        "👀 頭部方向：左";

                }

                else if (
                    direction ===
                    "RIGHT"
                ) {

                    headDirectionStatus.textContent =
                        "👀 頭部方向：右";

                }

                else if (
                    direction ===
                    "UP"
                ) {

                    headDirectionStatus.textContent =
                        "👀 頭部方向：上";

                }

                else if (
                    direction ===
                    "DOWN"
                ) {

                    headDirectionStatus.textContent =
                        "👀 頭部方向：下";

                }

                else {

                    headDirectionStatus.textContent =
                        "👀 頭部方向：未偵測";

                }

            }

        }


        /* =============================================
           沒有偵測到臉
        ============================================= */

        else {

    currentHeadDirection =
        "UNKNOWN";


    if (faceStatus) {

                faceStatus.textContent =
                    "👤 未偵測到臉";

            }


            if (headDirectionStatus) {

                headDirectionStatus.textContent =
                    "👀 頭部方向：未偵測";

            }

        }

    }


/*
    更新持續注意時間
*/

updateAttentionTime();


/*
    更新分心事件
*/

updateDistraction();


/*
    更新視覺方向時間
*/

updateHeadDirectionTime();


/*
    記錄專注歷程
*/

recordAttentionTimeline();


/*
    每 1 秒同步一次故事互動資料
*/

const now =
    performance.now();

if (
    now -
    lastStoryDataUpdateTime >=
    1000
) {

    /*
        同步故事互動資料
    */

    updateStoryInteractionData();


    /*
        保存目前完整分析資料
    */

    saveAttentionAnalysis();


    lastStoryDataUpdateTime =
        now;

}


/*
    下一個畫面繼續偵測
*/

requestAnimationFrame(
    detectFace
);

}


/* ---------------------------------------------------------
   啟動 MediaPipe

   app.js 已經負責開攝影機，
   所以這裡稍微等待攝影機準備。
--------------------------------------------------------- */

window.addEventListener(

    "load",

    function () {

        initializeFaceDetection();

    }

);

/* =========================================================
   離開故事頁面前保存最後一次資料
========================================================= */

window.addEventListener(
    "pagehide",
    function () {

        saveAttentionAnalysis();

    }
);