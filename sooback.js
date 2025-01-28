// Alpha Vantage API Key
const ALPHA_VANTAGE_KEY = "GQOEVPJR1G5R18SL";

// 전역 변수
let variable = 0; // 구매 버튼 클릭 횟수
let A = 2500; // 초기값
let chartData = []; // 봉차트 데이터

// Chart.js 설정
const ctx = document.getElementById("candlestickChart").getContext("2d");
const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [], // 시간
        datasets: [
            {
                label: "A 값 변화",
                data: chartData,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.4,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "시간" } },
            y: { title: { display: true, text: "A 값" } },
        },
    },
});

// 변수 증가 함수
function increaseVariable() {
    variable += 1;
    calculateA();
}

// A 값 계산
async function calculateA() {
    const interestRate = await getInterestRate();
    const googleChangeRate = await getGoogleStockChange();

    const variableChangeRate = variable / (variable || 1); // 1분 변화율(가정)
    A = interestRate * variableChangeRate * 120 * googleChangeRate * 100 + 2500;

    document.getElementById("currentA").innerText = A.toFixed(2);
    updateChart(A);
    saveToServer(A);
}

// A 값 서버 저장
function saveToServer(AValue) {
    axios.post("/save", { A: AValue })
        .then(response => console.log("저장 성공:", response.data))
        .catch(error => console.error("저장 실패:", error));
}

// 실시간 금리 가져오기
async function getInterestRate() {
    const url = `https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&apikey=${ALPHA_VANTAGE_KEY}`;
    try {
        const response = await axios.get(url);
        const latestData = response.data.data[0];
        return parseFloat(latestData.value); // 금리 값
    } catch (error) {
        console.error("금리 데이터를 가져오는 중 오류:", error);
        return 0.03; // 기본값
    }
}

// Google 주식 변화율 가져오기
async function getGoogleStockChange() {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=GOOG&interval=1min&apikey=${ALPHA_VANTAGE_KEY}`;
    try {
        const response = await axios.get(url);
        const timeSeries = response.data["Time Series (1min)"];
        const times = Object.keys(timeSeries);
        const latest = parseFloat(timeSeries[times[0]]["4. close"]);
        const previous = parseFloat(timeSeries[times[1]]["4. close"]);
        return (latest - previous) / previous; // 변화율 계산
    } catch (error) {
        console.error("Google 주식 데이터를 가져오는 중 오류:", error);
        return 0.01; // 기본값
    }
}

// 차트 업데이트
function updateChart(AValue) {
    const now = new Date();
    const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    chart.data.labels.push(timeLabel);
    chart.data.datasets[0].data.push(AValue);
    chart.update();
}

// 1분마다 A 값 갱신
setInterval(calculateA, 60000);
