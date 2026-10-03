console.log(
    "FocusTale：report.js 載入成功"
);


/* ---------------------------------------------------------
   長期趨勢圖表
--------------------------------------------------------- */

let focusHistoryChart = null;



/* =========================================================
   讀取專注分析資料
========================================================= */

const savedAttentionData =
    localStorage.getItem(
        "focusTaleAttentionData"
    );


if (!savedAttentionData) {

    console.warn(
        "FocusTale：找不到專注分析資料"
    );

}

else {

    try {

        const attentionData =
            JSON.parse(
                savedAttentionData
            );


        console.log(
            "FocusTale：成功讀取專注分析資料",
            attentionData
        );


        console.log(
            "FocusTale：專注歷程筆數",
            attentionData.timeline?.length ?? 0
        );

        /*
    更新本次閱讀摘要
*/

updateReportSummary(
    attentionData
);


/*
    更新六大行為分析
*/

updateBehaviorAnalysis(
    attentionData
);

/*
    保存這次閱讀到歷史紀錄
*/

saveReadingHistory(
    attentionData
    );
    /*
    建立長期專注趨勢圖
*/

createFocusHistoryChart();


        /*
    如果有專注歷程資料，
    就建立專注時間趨勢圖
*/

if (
    attentionData.timeline &&
    attentionData.timeline.length > 0
) {

    createAttentionChart(
        attentionData.timeline
    );

}

    }

    catch (error) {

        console.error(
            "FocusTale：專注分析資料解析失敗",
            error
        );

    }

}


/* =========================================================
   專注時間趨勢圖
========================================================= */

function createAttentionChart(timeline) {

    const canvas =
        document.getElementById(
            "attentionChart"
        );

    if (!canvas) {

        console.warn(
            "FocusTale：找不到 attentionChart"
        );

        return;
    }


    /* =============================================
       檢查 timeline
    ============================================= */

    if (
        !Array.isArray(timeline) ||
        timeline.length === 0
    ) {

        console.warn(
            "FocusTale：沒有專注歷程資料"
        );

        return;
    }


    console.log(
        "FocusTale：專注時間趨勢原始資料",
        timeline
    );


    /* =============================================
       X 軸：閱讀經過秒數
    ============================================= */

    const labels =
        timeline.map(
            function (point) {

                return Number(
                    point.time ?? 0
                ).toFixed(0) + " 秒";

            }
        );


    /* =============================================
       Y 軸：專注狀態

       1 = 專注
       0 = 分心 / 未面向
    ============================================= */

    const focusValues =
        timeline.map(
            function (point) {

                return point.focused
                    ? 1
                    : 0;

            }
        );


    console.log(
        "FocusTale：圖表時間",
        labels
    );

    console.log(
        "FocusTale：圖表專注狀態",
        focusValues
    );


    /* =============================================
       建立 Chart.js
    ============================================= */

    new Chart(
        canvas,
        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label:
                            "專注狀態",

                        data:
                            focusValues,

                        borderWidth:
                            4,

                        pointRadius:
                            0,

                        pointHoverRadius:
                            5,

                        stepped:
                            true,

                        tension:
                            0,

                        fill:
                            false

                    }

                ]

            },


            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,


                interaction: {

                    intersect:
                        false,

                    mode:
                        "index"

                },


                plugins: {

                    legend: {

                        display:
                            false

                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function (context) {

                                    if (
                                        context.raw === 1
                                    ) {

                                        return "專注";

                                    }

                                    return "分心";

                                }

                        }

                    }

                },


                scales: {


                    /* =============================
                       Y 軸
                    ============================= */

                    y: {

                        min:
                            0,

                        max:
                            1,

                        beginAtZero:
                            true,

                        ticks: {

                            stepSize:
                                1,

                            callback:
                                function (value) {

                                    if (value === 1) {

                                        return "專注";

                                    }

                                    if (value === 0) {

                                        return "分心";

                                    }

                                    return "";

                                }

                        },

                        title: {

                            display:
                                false

                        }

                    },


                    /* =============================
                       X 軸
                    ============================= */

                    x: {

                        ticks: {

                            autoSkip:
                                true,

                            maxTicksLimit:
                                12

                        },

                        title: {

                            display:
                                false

                        }

                    }

                }

            }

        }
    );


    console.log(
        "FocusTale：專注時間趨勢圖建立完成"
    );

}

/* =========================================================
   更新本次閱讀摘要
========================================================= */

function updateReportSummary(
    attentionData
) {

    /*
        取得四張摘要卡
    */

    const readingTimeElement =
        document.getElementById(
            "summaryReadingTime"
        );

    const focusRateElement =
        document.getElementById(
            "summaryFocusRate"
        );

    const distractionCountElement =
        document.getElementById(
            "summaryDistractionCount"
        );

    const reengagementTimeElement =
        document.getElementById(
            "summaryReengagementTime"
        );


    /* =============================================
       ① 閱讀時間
    ============================================= */

    const totalTime =
        Number(
            attentionData.attention?.totalTime ?? 0
        );


    const minutes =
        Math.floor(
            totalTime / 60
        );

    const seconds =
        Math.floor(
            totalTime % 60
        );


    if (readingTimeElement) {

        if (minutes > 0) {

            readingTimeElement.textContent =
                `${minutes} 分 ${seconds} 秒`;

        }

        else {

            readingTimeElement.textContent =
                `${seconds} 秒`;

        }

    }


    /* =============================================
       ② 專注比例
    ============================================= */

    const focusRate =
        Number(
            attentionData.attention?.focusRate ?? 0
        );


    if (focusRateElement) {

        focusRateElement.textContent =
            `${focusRate.toFixed(1)}%`;

    }


    /* =============================================
       ③ 分心次數
    ============================================= */

    const distractionCount =
        Number(
            attentionData.distraction?.count ?? 0
        );


    if (distractionCountElement) {

        distractionCountElement.textContent =
            `${distractionCount} 次`;

    }


    /* =============================================
       ④ 平均重新投入時間
    ============================================= */

    const averageReengagementTime =
        Number(
            attentionData.reengagement?.averageTime ?? 0
        );


    if (reengagementTimeElement) {

        reengagementTimeElement.textContent =
            `${averageReengagementTime.toFixed(1)} 秒`;

    }

}

/* =========================================================
   六大行為分析
   ① 持續注意
   ② 分心事件
   ③ 重新投入
========================================================= */

function updateBehaviorAnalysis(
    attentionData
) {

    /* -----------------------------------------------------
       取得畫面元素
    ----------------------------------------------------- */

    const attentionElement =
        document.getElementById(
            "behaviorAttention"
        );

    const distractionElement =
        document.getElementById(
            "behaviorDistraction"
        );

    const reengagementElement =
        document.getElementById(
            "behaviorReengagement"
        );

        const directionElement =
    document.getElementById(
        "behaviorDirection"
    );

    const interactionElement =
    document.getElementById(
        "behaviorInteraction"
    );

    const comprehensionElement =
    document.getElementById(
        "behaviorComprehension"
    );

    const comprehensionResultElement =
    document.getElementById(
        "comprehensionResult"
    );

const comprehensionAnswerElement =
    document.getElementById(
        "comprehensionAnswer"
    );

const comprehensionTimeElement =
    document.getElementById(
        "comprehensionTime"
    );

    console.log(
    "故事理解三格：",
    comprehensionResultElement,
    comprehensionAnswerElement,
    comprehensionTimeElement
);

    /* =====================================================
       ① 持續注意
    ===================================================== */

    const focusRate =
        Number(
            attentionData.attention?.focusRate ?? 0
        );


    if (attentionElement) {

        attentionElement.textContent =
            `${focusRate.toFixed(1)}%`;

    }


    /* =====================================================
       ② 分心事件
    ===================================================== */

    const distractionCount =
        Number(
            attentionData.distraction?.count ?? 0
        );


    if (distractionElement) {

        distractionElement.textContent =
            `${distractionCount} 次`;

    }


    /* =====================================================
       ③ 重新投入
    ===================================================== */

    const averageReengagementTime =
        Number(
            attentionData.reengagement?.averageTime ?? 0
        );


    if (reengagementElement) {

        reengagementElement.textContent =
            `${averageReengagementTime.toFixed(1)} 秒`;

    }

    /* =====================================================
   ④ 視覺方向
===================================================== */

const headDirection =
    attentionData.headDirection ?? {};


/*
    取得各方向累積時間
*/

const directionTimes = {

    CENTER:
        Number(
            headDirection.center ?? 0
        ),

    LEFT:
        Number(
            headDirection.left ?? 0
        ),

    RIGHT:
        Number(
            headDirection.right ?? 0
        ),

    UP:
        Number(
            headDirection.up ?? 0
        ),

    DOWN:
        Number(
            headDirection.down ?? 0
        )

};


/*
    找出累積時間最長的方向
*/

let mainDirection =
    "CENTER";

let longestTime =
    -1;


for (
    const direction in directionTimes
) {

    if (
        directionTimes[direction] >
        longestTime
    ) {

        longestTime =
            directionTimes[direction];

        mainDirection =
            direction;

    }

}


/*
    英文轉中文
*/

const directionNames = {

    CENTER:
        "中央",

    LEFT:
        "左側",

    RIGHT:
        "右側",

    UP:
        "上方",

    DOWN:
        "下方"

};


if (directionElement) {

    directionElement.textContent =
        directionNames[
            mainDirection
        ] ?? "未偵測";

}

/* =====================================================
   ⑤ 任務反應
===================================================== */

const interaction =
    attentionData.interaction ?? {};


const deerReactionTime =
    Number(
        interaction.deerReactionTime ?? 0
    );


const giftTotalTime =
    Number(
        interaction.giftTotalTime ?? 0
    );


if (interactionElement) {

    /*
        兩個任務都有完成
    */

    if (
        deerReactionTime > 0 &&
        giftTotalTime > 0
    ) {

        interactionElement.innerHTML =
            `找甜甜：${deerReactionTime.toFixed(1)} 秒<br>` +
            `找禮物：${giftTotalTime.toFixed(1)} 秒`;

    }


    /*
        只有找甜甜
    */

    else if (
        deerReactionTime > 0
    ) {

        interactionElement.textContent =
            `找甜甜：${deerReactionTime.toFixed(1)} 秒`;

    }


    /*
        只有找禮物
    */

    else if (
        giftTotalTime > 0
    ) {

        interactionElement.textContent =
            `找禮物：${giftTotalTime.toFixed(1)} 秒`;

    }


    /*
        都沒有完成
    */

    else {

        interactionElement.textContent =
            "尚無任務資料";

    }

}

else {

    interactionElement.textContent =
        "尚無任務資料";

}


/*
    測試故事理解資料
*/

/* =====================================================
   ⑥ 故事理解
===================================================== */

const comprehension =
    attentionData.comprehension ?? {};


const isCorrect =
    comprehension.correct;


const selectedAnswer =
    comprehension.selectedAnswer ?? "";


const reactionTime =
    Number(
        comprehension.reactionTime ?? 0
    );


if (
    comprehensionResultElement &&
    comprehensionAnswerElement &&
    comprehensionTimeElement
) {

    if (typeof isCorrect === "boolean") {

        const resultText =
            isCorrect
                ? "回答正確"
                : "回答錯誤";

        comprehensionResultElement.textContent =
            resultText;

        comprehensionAnswerElement.textContent =
            `選擇：${selectedAnswer}`;

        comprehensionTimeElement.textContent =
            `反應時間：${reactionTime.toFixed(1)} 秒`;

    } else {

        comprehensionResultElement.textContent =
            "尚無作答資料";

        comprehensionAnswerElement.textContent =
            "";

        comprehensionTimeElement.textContent =
            "";

    }
}

/*
    到這裡才結束 updateBehaviorAnalysis
*/

}


/* =========================================================
   FocusTale
   保存閱讀歷史紀錄
========================================================= */

function saveReadingHistory(
    attentionData
) {

    /*
    這次閱讀的識別碼

    使用這次閱讀的開始／總時間資料，
    避免重新整理報告頁時重複保存。
*/

const sessionKey =
    JSON.stringify({

        totalTime:
            attentionData.attention?.totalTime ?? 0,

        distractionCount:
            attentionData.distraction?.count ?? 0,

        deerReactionTime:
            attentionData.interaction?.deerReactionTime ?? 0,

        giftTotalTime:
            attentionData.interaction?.giftTotalTime ?? 0,

        comprehensionReactionTime:
            attentionData.comprehension?.reactionTime ?? 0

    });

    /*
        讀取以前的歷史紀錄
    */

    const savedHistory =
        localStorage.getItem(
            "focusTaleHistory"
        );


    let history = [];


    /*
        如果以前有資料，
        就把資料讀回來
    */

    if (savedHistory) {

        try {

            history =
                JSON.parse(
                    savedHistory
                );

        }

        catch (error) {

            console.error(
                "FocusTale：歷史紀錄解析失敗",
                error
            );

            history = [];

        }
        }

        /*
    檢查這次閱讀是否已經保存
*/

const alreadySaved =
    history.some(
        function (record) {

            return record.sessionKey ===
                sessionKey;

        }
    );


if (alreadySaved) {

    console.log(
        "FocusTale：本次閱讀已存在，不重複保存"
    );

    return;

}



    /*
        建立這一次閱讀紀錄
    */

    const record = {

    id:
        Date.now(),

    sessionKey:
        sessionKey,

    date:
        new Date().toISOString(),

        attention:
            attentionData.attention ?? {},

        distraction:
            attentionData.distraction ?? {},

        reengagement:
            attentionData.reengagement ?? {},

        headDirection:
            attentionData.headDirection ?? {},

        interaction:
            attentionData.interaction ?? {},

        comprehension:
            attentionData.comprehension ?? {},

        timeline:
            attentionData.timeline ?? []

    };


    /*
        新增到歷史紀錄
    */

    history.push(
        record
    );


    /*
        保存回 localStorage
    */

    localStorage.setItem(
        "focusTaleHistory",
        JSON.stringify(
            history
        )
    );


    console.log(
        "FocusTale：閱讀歷史已保存",
        record
    );


    console.log(
        "FocusTale：目前歷史紀錄共",
        history.length,
        "次"
    );

}

/* =========================================================
   FocusTale
   長期閱讀趨勢－專注比例
========================================================= */

function createFocusHistoryChart() {

    /*
        讀取歷史紀錄
    */

    const savedHistory =
        localStorage.getItem(
            "focusTaleHistory"
        );


    if (!savedHistory) {

        console.log(
            "FocusTale：目前沒有歷史紀錄"
        );

        return;

    }


    let history = [];


    try {

        history =
            JSON.parse(
                savedHistory
            );

    }

    catch (error) {

        console.error(
            "FocusTale：歷史紀錄讀取失敗",
            error
        );

        return;

    }


    /*
        找到圖表
    */

    const canvas =
        document.getElementById(
            "focusHistoryChart"
        );


    if (!canvas) {

        console.warn(
            "FocusTale：找不到 focusHistoryChart"
        );

        return;

    }


    /*
        X 軸：
        第 1 次、第 2 次...
    */

    const labels =
        history.map(
            function (record, index) {

                return `第 ${index + 1} 次`;

            }
        );


    /*
        Y 軸：
        每一次的專注比例
    */

    const focusRates =
        history.map(
            function (record) {

                return Number(
                    record.attention?.focusRate ?? 0
                );

            }
        );


    /*
        建立圖表
    */

   focusHistoryChart =
    new Chart(
        canvas,
        {

            type:
                "line",

            data: {

                labels:
                    labels,

                datasets: [

                    {

                        label:
                            "專注比例",

                        data:
                            focusRates,

                        borderWidth:
                            3,

                        pointRadius:
                            6,

                        pointHoverRadius:
                            8,

                        tension:
                            0.25

                    }

                ]

            },


            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,


                plugins: {

                    legend: {

                        display:
                            false

                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function (context) {

                                    return (
                                        "專注比例：" +
                                        Number(
                                            context.raw
                                        ).toFixed(1) +
                                        "%"
                                    );

                                }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero:
                            true,

                        max:
                            100,

                        title: {

                            display:
                                true,

                            text:
                                "專注比例（%）"

                        },

                        ticks: {

                            callback:
                                function (value) {

                                    return value + "%";

                                }

                        }

                    },


                    x: {

                        title: {

                            display:
                                true,

                            text:
                                "閱讀次數"

                        }

                    }

                }

            }

        }
    );


    console.log(
        "FocusTale：長期專注趨勢圖建立完成",
        focusRates
    );

}

/* =========================================================
   切換長期趨勢圖
========================================================= */

function updateHistoryChart(
    type
) {

    if (!focusHistoryChart) {

        return;

    }

    /* -----------------------------------------------------
   切換長期趨勢背景圖片
----------------------------------------------------- */

const historySection =
    document.querySelector(".long-term-section");

if (historySection) {

    historySection.classList.remove(
        "history-focus",
        "history-distraction",
        "history-reengagement"
    );

    if (type === "focus") {

        historySection.classList.add(
            "history-focus"
        );

    }
    else if (type === "distraction") {

        historySection.classList.add(
            "history-distraction"
        );

    }
    else if (type === "reengagement") {

        historySection.classList.add(
            "history-reengagement"
        );

    }
}


    /* -----------------------------------------------------
       讀取歷史資料
    ----------------------------------------------------- */

    const savedHistory =
        localStorage.getItem(
            "focusTaleHistory"
        );


    if (!savedHistory) {

        return;

    }


    let history = [];


    try {

        history =
            JSON.parse(
                savedHistory
            );

    }

    catch (error) {

        console.error(
            "FocusTale：歷史紀錄讀取失敗",
            error
        );

        return;

    }


    let values = [];



    let datasetLabel = "";

    let yAxisTitle = "";

    let yMax = undefined;


    /* =====================================================
       專注比例
    ===================================================== */

    if (type === "focus") {

        values =
            history.map(
                function (record) {

                    return Number(
                        record.attention?.focusRate ?? 0
                    );

                }
            );


        title =
            "🎯 歷次專注比例";

        datasetLabel =
            "專注比例";

        yAxisTitle =
            "專注比例（%）";

        yMax =
            100;

    }


    /* =====================================================
       分心次數
    ===================================================== */

    else if (
        type === "distraction"
    ) {

        values =
            history.map(
                function (record) {

                    return Number(
                        record.distraction?.count ?? 0
                    );

                }
            );


        title =
            "↪️ 歷次分心次數";

        datasetLabel =
            "分心次數";

        yAxisTitle =
            "分心次數（次）";

        yMax =
            undefined;

    }


    /* =====================================================
       平均重新投入
    ===================================================== */

    else if (
        type === "reengagement"
    ) {

        values =
            history.map(
                function (record) {

                    return Number(
                        record.reengagement?.averageTime ?? 0
                    );

                }
            );


        title =
            "🔄 歷次平均重新投入";

        datasetLabel =
            "平均重新投入";

        yAxisTitle =
            "平均重新投入時間（秒）";

        yMax =
            undefined;

    }


 


    /* -----------------------------------------------------
       更新圖表資料
    ----------------------------------------------------- */

    focusHistoryChart.data.datasets[0].data =
        values;


    focusHistoryChart.data.datasets[0].label =
        datasetLabel;


    /* -----------------------------------------------------
       更新 Y 軸
    ----------------------------------------------------- */

    focusHistoryChart.options.scales.y.title.text =
        yAxisTitle;


    focusHistoryChart.options.scales.y.max =
        yMax;


    /*
        不同資料使用不同刻度格式
    */

    if (type === "focus") {

        focusHistoryChart.options.scales.y.ticks.callback =
            function (value) {

                return value + "%";

            };

    }

    else {

        focusHistoryChart.options.scales.y.ticks.callback =
            function (value) {

                return value;

            };

    }


    /*
        更新 Tooltip
    */

    focusHistoryChart.options.plugins.tooltip.callbacks.label =
        function (context) {

            const value =
                Number(
                    context.raw
                );


            if (type === "focus") {

                return (
                    "專注比例：" +
                    value.toFixed(1) +
                    "%"
                );

            }


            if (type === "distraction") {

                return (
                    "分心次數：" +
                    value +
                    " 次"
                );

            }


            return (
                "平均重新投入：" +
                value.toFixed(1) +
                " 秒"
            );

        };


    /*
        重新繪製
    */

    focusHistoryChart.update();

}

/* =========================================================
   長期趨勢切換按鈕
========================================================= */

const historyTabs =
    document.querySelectorAll(
        ".history-tab"
    );


historyTabs.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                /* 移除所有 active */

                historyTabs.forEach(
                    function (tab) {

                        tab.classList.remove(
                            "active"
                        );

                    }
                );


                /* 目前按鈕變成 active */

                button.classList.add(
                    "active"
                );


                /* 取得目前類型 */

                const type =
                    button.dataset.historyType;


                /* 更新圖表
                   背景圖片已經在 updateHistoryChart()
                   裡面一起切換
                */

                updateHistoryChart(
                    type
                );

            }
        );

    }
);