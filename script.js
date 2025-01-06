const dataHistoris = {
    tahun: [2018, 2019, 2020, 2021, 2022],
    pendaftar: [120, 250, 370, 100, 120],
};

// 🔄 Fungsi Perhitungan Regresi Linear
function hitungRegresi(data) {
    const N = data.tahun.length;
    const sumX = data.tahun.reduce((a, b) => a + b, 0);
    const sumY = data.pendaftar.reduce((a, b) => a + b, 0);
    const sumXY = data.tahun.reduce((acc, x, i) => acc + x * data.pendaftar[i], 0);
    const sumX2 = data.tahun.reduce((acc, x) => acc + x * x, 0);

    const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / N;

    return { m, b };
}

// 🔄 Fungsi Perhitungan Prediksi
function hitungPrediksi(m, b, tahunAwal, tahunAkhir) {
    const prediksi = [];
    for (let tahun = tahunAwal; tahun <= tahunAkhir; tahun++) {
        const jumlahPendaftar = Math.round(m * tahun + b);
        prediksi.push({ tahun, jumlahPendaftar });
    }
    return prediksi;
}

// 🎯 Fungsi Tambah Data ke Chart
function tambahDataKeChart(chart, tahun, jumlahPendaftar, datasetIndex) {
    chart.data.datasets[datasetIndex].data.push({
        x: tahun,
        y: jumlahPendaftar,
    });

    // Urutkan dataset berdasarkan tahun
    chart.data.datasets[datasetIndex].data.sort((a, b) => a.x - b.x);
}

// 🎯 Fungsi Refresh Data pada Chart
// 🎯 Fungsi Refresh Data pada Interval
const onRefresh = (chart) => {
    const datasetHistoris = chart.data.datasets[0].data;
    const datasetPrediksi = chart.data.datasets[1].data;

    let lastYear = datasetHistoris.length > 0 ? datasetHistoris.at(-1).x : 2017;

    const nextIndex = dataHistoris.tahun.indexOf(lastYear + 1);
    if (nextIndex !== -1) {
        tambahDataKeChart(chart, dataHistoris.tahun[nextIndex], dataHistoris.pendaftar[nextIndex], 0);
    } else {
        let lastPredictedYear = datasetPrediksi.length > 0
            ? datasetPrediksi.at(-1).x
            : lastYear;

        if (lastPredictedYear < 2027) {
            lastPredictedYear++;
            const prediksi = prediksiPendaftar.find(p => p.tahun === lastPredictedYear);
            if (prediksi) {
                tambahDataKeChart(chart, prediksi.tahun, prediksi.jumlahPendaftar, 1);
            }
        }
    }

    chart.update();
};
function refreshChart() {
    // Hitung ulang regresi dan prediksi
    ({ m, b } = hitungRegresi(dataHistoris));
    prediksiPendaftar = hitungPrediksi(m, b, Math.max(...dataHistoris.tahun) + 1, 2027);

    // Reset data di chart
    chart.data.datasets[0].data = dataHistoris.tahun.map((tahun, i) => ({
        x: tahun,
        y: dataHistoris.pendaftar[i],
    }));
    chart.data.datasets[1].data = prediksiPendaftar.map(prediksi => ({
        x: prediksi.tahun,
        y: prediksi.jumlahPendaftar,
    }));

    chart.update();

    // Update tabel dan rumus
    updateTabelPerhitungan();
    updateRumusRegresi(m, b);
}
// 📊 Inisialisasi Chart
const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [
            {
                label: '📊 Data Historis',
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                data: [], // Data historis diisi melalui refreshChart()
                pointRadius: 5, // Ukuran titik data
                pointHoverRadius: 7, // Ukuran titik saat di-hover
            },
            {
                label: '📈 Data Prediksi',
                borderColor: '#FF5722',
                backgroundColor: 'rgba(255, 87, 34, 0.2)',
                data: [], // Data prediksi diisi melalui refreshChart()
                pointRadius: 5,
                pointHoverRadius: 7,
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
                        return value;
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

            tooltip: {
                enabled: true,
                mode: 'index', // Fokus pada semua titik dengan x yang sama
                intersect: false, // Aktifkan tooltip meskipun tidak tepat di titik
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                footerColor: '#ffffff',
                callbacks: {
                    title: function (tooltipItems) {
                        if (tooltipItems.length > 0) {
                            const item = tooltipItems[0];
                            return `📅 Tahun: ${item.raw.x}`;
                        }
                        return 'Tahun tidak tersedia';
                    },
                    label: function (tooltipItem) {
                        return `👥 Pendaftar: ${tooltipItem.raw.y}`;
                    },
                    footer: function (tooltipItems) {
                        return tooltipItems[0]?.dataset?.label || 'Data tidak tersedia';
                    }
                }
            }
        },

        interaction: {
            mode: 'index', // Fokus pada titik data terdekat
            intersect: false, // Aktifkan tooltip meskipun tidak tepat pada titik
        },
        responsive: true,
    },
});


// 🎯 Hitung Regresi dan Prediksi Awal
let { m, b } = hitungRegresi(dataHistoris);
let prediksiPendaftar = hitungPrediksi(m, b, Math.max(...dataHistoris.tahun) + 1, 2027);


// ⏲️ Interval untuk Refresh Data
let refreshInterval = setInterval(() => {
    onRefresh(chart);
}, 2000);
function updateTabelPerhitungan() {
    const tabel = document.getElementById('tabelPerhitungan');
    tabel.innerHTML = `
        <tr>
            <th class="px-4 py-2 border border-gray-300">Tahun</th>
            <th class="px-4 py-2 border border-gray-300">Jumlah Pendaftar</th>
            <th class="px-4 py-2 border border-gray-300">x * y</th>
            <th class="px-4 py-2 border border-gray-300">x²</th>
        </tr>
    `;

    let totalX = 0, totalY = 0, totalXY = 0, totalX2 = 0;
    dataHistoris.tahun.forEach((tahun, i) => {
        const x = tahun;
        const y = dataHistoris.pendaftar[i];
        const xy = x * y;
        const x2 = x * x;

        totalX += x;
        totalY += y;
        totalXY += xy;
        totalX2 += x2;

        tabel.innerHTML += `
            <tr>
                <td>${x}</td>
                <td>${y}</td>
                <td>${xy}</td>
                <td>${x2}</td>
            </tr>
        `;
    });

    // Tampilkan total perhitungan di bawah tabel
    tabel.innerHTML += `
        <tr>
            <th>Total</th>
            <th>${totalY}</th>
            <th>${totalXY}</th>
            <th>${totalX2}</th>
        </tr>
    `;
}

// Hitung ulang regresi dan prediksi
({ m, b } = hitungRegresi(dataHistoris));
prediksiPendaftar = hitungPrediksi(m, b, Math.max(...dataHistoris.tahun) + 1, 2027);

chart.update();

updateTabelPerhitungan(); // Perbarui tabel
updateRumusRegresi(m, b); // Perbarui rumus regresi

function updateRumusRegresi(m, b) {
    const tahunTerakhir = Math.max(...dataHistoris.tahun);
    const tahunPrediksi = tahunTerakhir + 1;
    const jumlahPendaftarPrediksi = Math.round(m * tahunPrediksi + b);
    document.getElementById('thn').innerText = `${tahunPrediksi}`;
    document.getElementById('rumusM').innerText = `m (Gradien) = ${m.toFixed(0)}`;
    document.getElementById('rumusB').innerText = `b (Intersep) = ${b.toFixed(0)}`;
    document.getElementById('persamaanRegresi').innerText = `Persamaan Regresi: y = ${m.toFixed(0)}x + ${b.toFixed(0)}`;
    document.getElementById('tahunPrediksi').innerText = `${jumlahPendaftarPrediksi} pendaftar`;
}

document.getElementById('tambahData').addEventListener('click', () => {
    const tahun = parseInt(document.getElementById('tahun').value);
    const pendaftar = parseInt(document.getElementById('pendaftar').value);

    if (!isNaN(tahun) && !isNaN(pendaftar)) {
        if (!dataHistoris.tahun.includes(tahun)) {
            dataHistoris.tahun.push(tahun);
            dataHistoris.pendaftar.push(pendaftar);

            // Urutkan data historis
            const combined = dataHistoris.tahun.map((tahun, i) => ({
                tahun,
                pendaftar: dataHistoris.pendaftar[i],
            })).sort((a, b) => a.tahun - b.tahun);

            dataHistoris.tahun = combined.map(d => d.tahun);
            dataHistoris.pendaftar = combined.map(d => d.pendaftar);

            // Tambahkan data ke grafik historis
            tambahDataKeChart(chart, tahun, pendaftar, 0);

            // Hitung ulang regresi dan prediksi
            ({ m, b } = hitungRegresi(dataHistoris));

            // Tentukan tahun awal prediksi
            const tahunTerakhirHistoris = Math.max(...dataHistoris.tahun);
            const tahunAwalPrediksi = tahunTerakhirHistoris + 1;

            // Jika tahun yang ditambahkan di bawah tahun awal prediksi, jangan geser prediksi
            if (tahun <= tahunTerakhirHistoris) {
                prediksiPendaftar = hitungPrediksi(m, b, tahunAwalPrediksi, tahunAwalPrediksi + 4);
            }
            // Jika tahun yang ditambahkan di atas tahun terakhir prediksi, geser prediksi
            else {
                prediksiPendaftar = hitungPrediksi(m, b, tahunAwalPrediksi, tahunAwalPrediksi + 4);
            }

            // Perbarui dataset prediksi di chart
            chart.data.datasets[1].data = [];
            prediksiPendaftar.forEach(prediksi => {
                tambahDataKeChart(chart, prediksi.tahun, prediksi.jumlahPendaftar, 1);
            });

            chart.update();
            updateTabelPerhitungan(); // Perbarui tabel
            updateRumusRegresi(m, b); // Perbarui rumus regresi
        } else {
            alert('Tahun sudah ada di data historis!');
        }
    } else {
        alert('Masukkan tahun dan jumlah pendaftar dengan benar!');
    }
});

updateTabelPerhitungan();