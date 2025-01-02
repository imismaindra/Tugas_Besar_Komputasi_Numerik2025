const dataHistoris = {
    tahun: [2018, 2019, 2020, 2021, 2022],
    pendaftar: [120, 150, 170, 200, 220],
};

const ctx = document.getElementById('chart').getContext('2d');

// Fungsi untuk menambahkan data real-time
const onRefresh = (chart) => {
    const nextYear = chart.data.datasets[1].data.length > 0 ? chart.data.datasets[1].data[chart.data.datasets[1].data.length - 1].x + 1 : 2022;
    if (nextYear <= 2027) {
        chart.data.datasets[1].data.push({
            x: nextYear,
            y: Math.floor(Math.random() * 250 + 100), // Simulasi data real-time
        });
        chart.update();
    }
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
                data: dataHistoris.tahun.map((tahun, i) => ({
                    x: tahun,
                    y: dataHistoris.pendaftar[i],
                })),
            },
            {
                label: '📈 Real-time Data',
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
                        return value >= 2022 && value <= 2027 ? value : '';
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

        chart.update();
    }
});

// Interval untuk menambahkan data real-time setiap detik
setInterval(() => {
    onRefresh(chart);
}, 1000);