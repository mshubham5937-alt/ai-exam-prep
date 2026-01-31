
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const roundTo = (num, places) => Number(num.toFixed(places));

export const EXAM_TYPES = ['JEE', 'NEET'];
export const SUBJECTS = {
    JEE: ['Physics', 'Chemistry', 'Maths'],
    NEET: ['Physics', 'Chemistry', 'Biology']
};

export const FALLBACK_TEMPLATES = {
    Physics: [
        {
            level: 1,
            gen: () => {
                const u = rnd(5, 20);
                const a = rnd(2, 10);
                const t = rnd(2, 5);
                const v = u + a * t;
                return {
                    text: `A particle starts with an initial velocity of ${u} m/s and accelerates at ${a} m/s² for ${t} seconds. What is its final velocity?`,
                    options: [`${v} m/s`, `${v + rnd(1, 5)} m/s`, `${v - rnd(1, 5)} m/s`, `${u + a} m/s`],
                    correct: 0,
                    solution: `Using v = u + at: v = ${u} + (${a} × ${t}) = ${v} m/s.`
                };
            }
        },
        {
            level: 3,
            gen: () => {
                const m = rnd(2, 10);
                const f = rnd(10, 50);
                const a = f / m;
                return {
                    text: `A force of ${f} N is applied to a body of mass ${m} kg. What is the acceleration produced?`,
                    options: [`${roundTo(a, 1)} m/s²`, `${roundTo(a * 2, 1)} m/s²`, `${roundTo(a / 2, 1)} m/s²`, `${roundTo(f + m, 1)} m/s²`],
                    correct: 0,
                    solution: `Newton's Second Law F=ma -> a=F/m -> a=${f}/${m} = ${roundTo(a, 2)} m/s².`
                };
            }
        },
        {
            level: 2,
            gen: () => {
                const m = rnd(2, 10);
                const v = rnd(5, 20);
                const ke = 0.5 * m * v * v;
                return {
                    text: `Calculate the kinetic energy of a body of mass ${m} kg moving with a velocity of ${v} m/s.`,
                    options: [`${ke} J`, `${ke * 2} J`, `${ke / 2} J`, `${m * v} J`],
                    correct: 0,
                    solution: `Kinetic Energy = 0.5 * m * v^2 = 0.5 * ${m} * ${v}^2 = ${ke} J.`
                };
            }
        }
    ],
    Chemistry: [
        {
            level: 2,
            gen: () => {
                const ph = rnd(3, 11);
                const poh = 14 - ph;
                return {
                    text: `If the pH of a solution is ${ph}, what is its pOH at 25°C?`,
                    options: [`${poh}`, `${ph}`, `7`, `14`],
                    correct: 0,
                    solution: `pH + pOH = 14. Thus, pOH = 14 - ${ph} = ${poh}.`
                };
            }
        },
        {
            level: 1,
            gen: () => {
                const moles = rnd(1, 5);
                const molarMass = 18; // Water
                const mass = moles * molarMass;
                return {
                    text: `What is the mass of ${moles} moles of Water (H2O)? (Atomic masses: H=1, O=16)`,
                    options: [`${mass} g`, `${mass + 10} g`, `${mass / 2} g`, `${moles} g`],
                    correct: 0,
                    solution: `Molar mass of H2O = 2*1 + 16 = 18 g/mol. Mass = Moles * Molar Mass = ${moles} * 18 = ${mass} g.`
                };
            }
        }
    ],
    Biology: [
        {
            level: 1,
            gen: () => {
                return {
                    text: "Which organelle is known as the powerhouse of the cell?",
                    options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi Apparatus"],
                    correct: 0,
                    solution: "Mitochondria generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
                };
            }
        }
    ],
    Maths: [
        {
            level: 2,
            gen: () => {
                const a = rnd(2, 5);
                return {
                    text: `Evaluate ∫ x^${a} dx`,
                    options: [`x^${a + 1}/${a + 1} + C`, `x^${a - 1}/${a - 1} + C`, `${a}x^${a - 1} + C`, `x^${a + 1} + C`],
                    correct: 0,
                    solution: `Power rule: ∫ x^n dx = x^(n+1)/(n+1). Result: x^${a + 1}/${a + 1} + C`
                };
            }
        },
        {
            level: 2,
            gen: () => {
                const r1 = rnd(1, 5);
                const r2 = rnd(1, 5);
                const sum = r1 + r2;
                const prod = r1 * r2;
                // x^2 - (sum)x + prod = 0
                return {
                    text: `Find the roots of the quadratic equation: x² - ${sum}x + ${prod} = 0`,
                    options: [`${r1}, ${r2}`, `${-r1}, ${-r2}`, `${r1}, ${-r2}`, `${sum}, ${prod}`],
                    correct: 0,
                    solution: `For ax² + bx + c = 0, sum of roots = -b/a = ${sum}, product = c/a = ${prod}. Roots are ${r1} and ${r2}.`
                };
            }
        },
        {
            level: 1,
            gen: () => {
                // sin(x) = ?
                const angles = [0, 30, 45, 60, 90];
                const angle = pick(angles);
                const vals = {
                    0: "0", 30: "1/2", 45: "1/√2", 60: "√3/2", 90: "1"
                };
                return {
                    text: `What is the value of sin(${angle}°)?`,
                    options: [vals[angle], vals[(angle + 30) % 90] || "1", vals[(angle + 60) % 90] || "0", "None of these"],
                    correct: 0,
                    solution: `From trigonometric standard table, sin(${angle}°) = ${vals[angle]}.`
                };
            }
        }
    ]
};

export const generateFallbackQuestion = (subject) => {
    const templates = FALLBACK_TEMPLATES[subject] || FALLBACK_TEMPLATES['Physics']; // Fallback to Physics if subject not found
    const template = pick(templates);
    return {
        ...template.gen(),
        subject,
        id: Date.now() + Math.random().toString(),
        type: 'fallback'
    };
};
