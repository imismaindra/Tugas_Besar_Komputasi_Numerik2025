const dataHistoris = {
    tahun: [2018, 2019, 2020, 2021, 2022],
    pendaftar: [120, 250, 370, 100, 120],
};

// Hitung regresi linear
const N = dataHistoris.tahun.length;
const sumX = dataHistoris.tahun.reduce((a, b) => a + b, 0);
const sumY = dataHistoris.pendaftar.reduce((a, b) => a + b, 0);
const sumXY = dataHistoris.tahun.reduce((acc, x, i) => acc + x * dataHistoris.pendaftar[i], 0);
const sumX2 = dataHistoris.tahun.reduce((acc, x) => acc + x * x, 0);

const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
const b = (sumY - m * sumX) / N;

// Hitung prediksi untuk tahun 2023 hingga 2027
const prediksiPendaftar = [];
for (let tahun = 2023; tahun <= 2027; tahun++) {
    const jumlahPendaftar = Math.round(m * tahun + b);
    prediksiPendaftar.push({ tahun, jumlahPendaftar });
}
console.log(prediksiPendaftar);
const ctx = document.getElementById('chart').getContext('2d');

// Fungsi untuk menambahkan data prediksi
const onRefresh = (chart) => {
    const currentYear = chart.data.datasets[0].data.length > 0 ? chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1].x : 2017;
    let nextYear = currentYear + 1;

    if (nextYear <= 2022) {
        // Tambahkan data historis
        const index = dataHistoris.tahun.indexOf(nextYear);
        if (index !== -1) {
            chart.data.datasets[0].data.push({
                x: nextYear,
                y: dataHistoris.pendaftar[index],
            });
        }
    } else if (nextYear <= 2027) {
        nextYear = chart.data.datasets[1].data.length > 0 ? chart.data.datasets[1].data[chart.data.datasets[1].data.length - 1].x + 1 : 2023;

        console.log('masuk elseif');
        // Tambahkan data prediksi
        for (let year = nextYear; year <= 2027; year++) {
            const prediksi = prediksiPendaftar.find(p => p.tahun === year);
            console.log(prediksi);
            if (prediksi) {
                chart.data.datasets[1].data.push({
                    x: year,
                    y: prediksi.jumlahPendaftar,
                });
                break; // Tambahkan satu tahun pada setiap refresh
            }
        }
    }

    chart.update();
};
// Konfigurasi chart
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [
            {
                label: '📊 Data Historis',
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                data: [],
            },
            {
                label: '📈 Data Prediksi',
                borderColor: '#FF5722',
                backgroundColor: 'rgba(255, 87, 34, 0.2)',
                data: [],
            },
        ],
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Tahun',
                },
                ticks: {
                    stepSize: 1,
                    callback: function (value) {
                        return value >= 2018 && value <= 2027 ? value : '';
                    }
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Jumlah Pendaftar',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
        interaction: {
            intersect: false,
        },
    },
});

// Tambahkan data baru secara manual
document.getElementById('tambahData').addEventListener('click', () => {
    const tahun = parseInt(document.getElementById('tahun').value);
    const pendaftar = parseInt(document.getElementById('pendaftar').value);

    if (!isNaN(tahun) && !isNaN(pendaftar)) {
        dataHistoris.tahun.push(tahun);
        dataHistoris.pendaftar.push(pendaftar);

        chart.data.datasets[0].data.push({
            x: tahun,
            y: pendaftar,
        });

        // Recalculate regression after adding new historical data
        const N = dataHistoris.tahun.length;
        const sumX = dataHistoris.tahun.reduce((a, b) => a + b, 0);
        const sumY = dataHistoris.pendaftar.reduce((a, b) => a + b, 0);
        const sumXY = dataHistoris.tahun.reduce((acc, x, i) => acc + x * dataHistoris.pendaftar[i], 0);
        const sumX2 = dataHistoris.tahun.reduce((acc, x) => acc + x * x, 0);

        const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / N;

        // Recalculate predictions
        prediksiPendaftar.length = 0; // Clear previous predictions
        for (let tahun = 2023; tahun <= 2027; tahun++) {
            const jumlahPendaftar = Math.round(m * tahun + b);
            prediksiPendaftar.push({ tahun, jumlahPendaftar });
        }

        chart.update();
    }
});

// Interval untuk menambahkan data prediksi setiap detik
setInterval(() => {
    onRefresh(chart);
}, 2000);