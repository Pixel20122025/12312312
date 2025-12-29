let constraintCount = 0;
let chart;

function addConstraint() {
  const div = document.createElement("div");
  div.id = "c" + constraintCount;
  div.innerHTML = `
    <input type="number" class="ca" value="1"> x₁ +
    <input type="number" class="cb" value="1"> x₂ ≤
    <input type="number" class="cc" value="6">
    <button onclick="removeConstraint('${div.id}')">✖</button>
  `;
  document.getElementById("constraints").appendChild(div);
  constraintCount++;
}

function removeConstraint(id) {
  document.getElementById(id).remove();
}

function solve() {
  const a = +document.getElementById("a").value;
  const b = +document.getElementById("b").value;

  let constraints = [
    [+m1a.value, +m1b.value, +m1c.value],
    [+m2a.value, +m2b.value, +m2c.value]
  ];

  document.querySelectorAll("#constraints div").forEach(c => {
    constraints.push([
      +c.querySelector(".ca").value,
      +c.querySelector(".cb").value,
      +c.querySelector(".cc").value
    ]);
  });

  constraints.push([1, 0, 0]);
  constraints.push([0, 1, 0]);

  let points = [];

  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const [a1, b1, c1] = constraints[i];
      const [a2, b2, c2] = constraints[j];
      const det = a1 * b2 - a2 * b1;
      if (det === 0) continue;

      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;

      if (x >= 0 && y >= 0 &&
        constraints.every(([aa, bb, cc]) => aa * x + bb * y <= cc + 1e-6)) {
        points.push({ x, y, z: a * x + b * y });
      }
    }
  }

  if (points.length === 0) {
    result.innerText = "No feasible solution";
    return;
  }

  const best = points.reduce((p, c) => c.z > p.z ? c : p);
  result.innerText = `Optimal solution: x₁ = ${best.x.toFixed(2)}, x₂ = ${best.y.toFixed(2)}`;

  drawChart(constraints, best);
}

function drawChart(constraints, best) {
  if (chart) chart.destroy();

  let datasets = constraints.map((c, i) => ({
    label: `Constraint ${i + 1}`,
    data: [
      { x: 0, y: c[2] / c[1] || 0 },
      { x: c[2] / c[0] || 0, y: 0 }
    ],
    borderWidth: 1,
    fill: false
  }));

  datasets.push({
    label: "Optimal Point",
    data: [{ x: best.x, y: best.y }],
    pointRadius: 6,
    showLine: false
  });

  chart = new Chart(document.getElementById("chart"), {
    type: "scatter",
    data: { datasets },
    options: {
      scales: {
        x: { beginAtZero: true },
        y: { beginAtZero: true }
      }
    }
  });
}
