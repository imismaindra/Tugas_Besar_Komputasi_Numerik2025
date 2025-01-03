// 📊 Data Historis
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
const onRefresh = (chart) => {
    const datasetHistoris = chart.data.datasets[0].data;
    const datasetPrediksi = chart.data.datasets[1].data;

    // Tahun terakhir dari dataset historis
    let lastHistoricalYear = datasetHistoris.length > 0
        ? datasetHistoris.at(-1).x
        : 2017;

    // Tambahkan data historis jika masih ada di dataHistoris
    const nextHistoricalIndex = dataHistoris.tahun.indexOf(lastHistoricalYear + 1);
    if (nextHistoricalIndex !== -1) {
        tambahDataKeChart(
            chart,
            dataHistoris.tahun[nextHistoricalIndex],
            dataHistoris.pendaftar[nextHistoricalIndex],
            0
        );
    }
    // Jika historis selesai, tambahkan prediksi
    else {
        let lastPredictedYear = datasetPrediksi.length > 0
            ? datasetPrediksi.at(-1).x
            : lastHistoricalYear;

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
        },
        interaction: {
            intersect: false,
        },
    },
});

// 🎯 Hitung Regresi dan Prediksi Awal
let { m, b } = hitungRegresi(dataHistoris);
let prediksiPendaftar = hitungPrediksi(m, b, Math.max(...dataHistoris.tahun) + 1, 2027);

// ➕ Event Tambah Data Manual
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

            tambahDataKeChart(chart, tahun, pendaftar, 0);

            // Hitung ulang regresi dan prediksi
            ({ m, b } = hitungRegresi(dataHistoris));
            prediksiPendaftar = hitungPrediksi(m, b, Math.max(...dataHistoris.tahun) + 1, 2027);

            chart.update();
        } else {
            alert('Tahun sudah ada di data historis!');
        }
    } else {
        alert('Masukkan tahun dan jumlah pendaftar dengan benar!');
    }
});

// ⏲️ Interval untuk Refresh Data
let refreshInterval = setInterval(() => {
    onRefresh(chart);
}, 2000);
function updateTabelPerhitungan() {
    const tabelBody = document.getElementById('tabelPerhitungan');
    tabelBody.innerHTML = ''; // Kosongkan tabel

    // Tambahkan data historis
    dataHistoris.tahun.forEach((tahun, index) => {
        tabelBody.innerHTML += `
            <tr>
                <td class="border border-gray-300 px-4 py-2">${tahun}</td>
                <td class="border border-gray-300 px-4 py-2">${dataHistoris.pendaftar[index]}</td>
                <td class="border border-gray-300 px-4 py-2">-</td>
            </tr>
        `;
    });

    // Tambahkan data prediksi
    prediksiPendaftar.forEach(item => {
        tabelBody.innerHTML += `
            <tr>
                <td class="border border-gray-300 px-4 py-2">${item.tahun}</td>
                <td class="border border-gray-300 px-4 py-2">-</td>
                <td class="border border-gray-300 px-4 py-2">${item.jumlahPendaftar}</td>
            </tr>
        `;
    });
}
// Hitung ulang regresi dan prediksi
({ m, b } = hitungRegresi(dataHistoris));
prediksiPendaftar = hitungPrediksi(m, b, Math.max(...dataHistoris.tahun) + 1, 2027);

chart.update();
updateTabelPerhitungan(); // Perbarui tabel
updateRumusRegresi(m, b); // Perbarui rumus regresi

// 📐 Update Rumus Regresi
function updateRumusRegresi(m, b) {
    document.getElementById('rumusM').innerText = `m = ${m.toFixed(4)}`;
    document.getElementById('rumusB').innerText = `b = ${b.toFixed(4)}`;
    document.getElementById('persamaanRegresi').innerText = `y = ${m.toFixed(4)}x + ${b.toFixed(4)}`;
}

// 🎯 Panggil Update Tabel Setelah Data Diubah
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

            tambahDataKeChart(chart, tahun, pendaftar, 0);

            // Hitung ulang regresi dan prediksi
            ({ m, b } = hitungRegresi(dataHistoris));
            prediksiPendaftar = hitungPrediksi(m, b, Math.max(...dataHistoris.tahun) + 1, 2027);

            chart.update();
            updateTabelPerhitungan(); // Perbarui tabel
        } else {
            alert('Tahun sudah ada di data historis!');
        }
    } else {
        alert('Masukkan tahun dan jumlah pendaftar dengan benar!');
    }
});

// Panggil tabel pertama kali saat halaman dimuat
updateTabelPerhitungan();