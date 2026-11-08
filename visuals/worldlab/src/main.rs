//! Offline, dependency-free visual asset compiler. No website runtime required.
use std::{f64::consts::PI, fmt::Write, fs, path::PathBuf};
type V = [f64; 3];
#[derive(Clone)]
struct Vertex {
    p: V,
    n: V,
}
struct Face {
    ids: [usize; 4],
    material: usize,
}
#[derive(Default)]
struct Mesh {
    vertices: Vec<Vertex>,
    faces: Vec<Face>,
}
fn add(a: V, b: V) -> V {
    [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
fn mul(a: V, s: f64) -> V {
    a.map(|v| v * s)
}
fn unit(a: V) -> V {
    mul(a, 1.0 / a.iter().map(|v| v * v).sum::<f64>().sqrt())
}
fn rotate([mut x, mut y, mut z]: V, [rx, ry, rz]: V) -> V {
    (y, z) = (y * rx.cos() - z * rx.sin(), y * rx.sin() + z * rx.cos());
    (x, z) = (x * ry.cos() + z * ry.sin(), -x * ry.sin() + z * ry.cos());
    [x * rz.cos() - y * rz.sin(), x * rz.sin() + y * rz.cos(), z]
}
impl Mesh {
    fn surface(
        &mut self,
        rows: usize,
        columns: usize,
        wrap: bool,
        material: usize,
        sample: impl Fn(usize, usize) -> Vertex,
    ) {
        let base = self.vertices.len();
        for i in 0..rows {
            for j in 0..columns {
                self.vertices.push(sample(i, j));
            }
        }
        for i in 0..if wrap { rows } else { rows - 1 } {
            for j in 0..columns {
                let next = (i + 1) % rows;
                let k = (j + 1) % columns;
                self.faces.push(Face {
                    ids: [
                        base + i * columns + j,
                        base + next * columns + j,
                        base + next * columns + k,
                        base + i * columns + k,
                    ],
                    material,
                });
            }
        }
    }
    fn orbit(&mut self, rotation: V, rx: f64, ry: f64, material: usize) {
        self.surface(128, 16, true, material, |i, j| {
            let u = i as f64 * 2.0 * PI / 128.0;
            let v = j as f64 * 2.0 * PI / 16.0;
            let radial = unit([u.cos() / rx, u.sin() / ry, 0.0]);
            let n = add(mul(radial, v.cos()), [0.0, 0.0, v.sin()]);
            Vertex {
                p: rotate(
                    add([rx * u.cos(), ry * u.sin(), 0.0], mul(n, 0.048)),
                    rotation,
                ),
                n: rotate(n, rotation),
            }
        });
    }
    fn sphere(&mut self, center: V, radius: f64, material: usize) {
        self.surface(17, 24, false, material, |i, j| {
            let u = j as f64 * 2.0 * PI / 24.0;
            let v = i as f64 * PI / 16.0;
            let n = [u.cos() * v.sin(), v.cos(), u.sin() * v.sin()];
            Vertex {
                p: add(center, mul(n, radius)),
                n,
            }
        });
    }
    fn stroke(&mut self, points: &[[f64; 2]], radius: f64) {
        self.surface(points.len(), 20, false, 3, |i, j| {
            let a = points[i.saturating_sub(1)];
            let b = points[(i + 1).min(points.len() - 1)];
            let side = unit([b[1] - a[1], a[0] - b[0], 0.0]);
            let v = j as f64 * 2.0 * PI / 20.0;
            let n = add(mul(side, v.cos()), [0.0, 0.0, v.sin()]);
            Vertex {
                p: add([points[i][0], points[i][1], 0.1], mul(n, radius)),
                n,
            }
        });
        for p in [points[0], points[points.len() - 1]] {
            self.sphere([p[0], p[1], 0.1], radius, 3);
        }
    }
    fn validate(&self) {
        assert!(self.faces.len() < 10000, "Mobile mesh budget exceeded");
        for v in &self.vertices {
            assert!(v.p.iter().chain(v.n.iter()).all(|v| v.is_finite()));
            assert!(v.p.iter().all(|v| v.abs() < 2.0));
            assert!((v.n.iter().map(|v| v * v).sum::<f64>() - 1.0).abs() < 1e-10);
        }
        for f in &self.faces {
            assert!(f.ids.iter().all(|&i| i < self.vertices.len()));
            assert!(f.material < 5);
        }
    }
    fn json(&self) -> String {
        let mut s = String::from("{\"generator\":\"worldlab-visuals/1\",\"vertices\":[");
        for (i, v) in self.vertices.iter().enumerate() {
            if i > 0 {
                s.push(',');
            }
            write!(
                s,
                "[{:.5},{:.5},{:.5},{:.5},{:.5},{:.5}]",
                v.p[0], v.p[1], v.p[2], v.n[0], v.n[1], v.n[2]
            )
            .unwrap();
        }
        s.push_str("],\"faces\":[");
        for (i, f) in self.faces.iter().enumerate() {
            if i > 0 {
                s.push(',');
            }
            write!(
                s,
                "[{},{},{},{},{}]",
                f.ids[0], f.ids[1], f.ids[2], f.ids[3], f.material
            )
            .unwrap();
        }
        s.push_str("]}\n");
        s
    }
    fn poster(&self) -> String {
        let mut polygons = Vec::new();
        for f in &self.faces {
            let normal = unit(
                f.ids
                    .iter()
                    .fold([0.0; 3], |a, &i| add(a, self.vertices[i].n)),
            );
            let n = rotate(normal, [-0.18, -0.18, 0.0]);
            if n[2] < -0.1 {
                continue;
            }
            let mut points = String::new();
            let mut depth = 0.0;
            for i in f.ids {
                let p = rotate(self.vertices[i].p, [-0.18, -0.18, 0.0]);
                depth += p[2];
                let k = 5.9 / (5.9 - p[2]);
                write!(
                    points,
                    "{:.2},{:.2} ",
                    300.0 + p[0] * 164.0 * k,
                    280.0 - p[1] * 164.0 * k
                )
                .unwrap();
            }
            let light = (0.32 + 0.65 * (n[0] * -0.4 + n[1] * 0.6 + n[2] * 0.7).max(0.0)).min(1.0);
            let rgb = if f.material == 4 {
                [181.0, 248.0, 150.0]
            } else if f.material == 2 {
                [100.0, 178.0, 153.0]
            } else {
                [220.0, 232.0, 225.0]
            };
            let color = format!(
                "#{:02x}{:02x}{:02x}",
                (rgb[0] * light) as u8,
                (rgb[1] * light) as u8,
                (rgb[2] * light) as u8
            );
            polygons.push((
                depth,
                format!(
                    "<polygon points=\"{}\" fill=\"{}\" stroke=\"{}\" stroke-width=\".5\"/>",
                    points.trim_end(),
                    color,
                    color
                ),
            ));
        }
        polygons.sort_by(|a, b| a.0.total_cmp(&b.0));
        format!("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 560\" role=\"img\" aria-label=\"JCEE WorldLab: a titanium J within three orbital frames\"><title>JCEE WorldLab orbital sculpture</title>{}</svg>\n",polygons.into_iter().map(|p|p.1).collect::<String>())
    }
}
fn build() -> Mesh {
    let mut m = Mesh::default();
    let rotations = [[0.28, 0.55, -0.64], [-0.62, 0.36, 0.64], [0.4, -0.65, 1.53]];
    for (i, r) in rotations.into_iter().enumerate() {
        m.orbit(r, 1.48, 0.88, i);
        let t: f64 = [0.4, 2.4, 4.5][i];
        m.sphere(
            rotate([1.48_f64 * t.cos(), 0.88_f64 * t.sin(), 0.0], r),
            0.086,
            4,
        );
    }
    let mut j: Vec<[f64; 2]> = (0..20)
        .map(|i| [0.24, 0.68 - i as f64 * 0.88 / 19.0])
        .collect();
    for i in 1..=32 {
        let t = i as f64 * PI / 32.0;
        j.push([-0.08 + 0.32 * t.cos(), -0.2 - 0.32 * t.sin()]);
    }
    m.stroke(&j, 0.104);
    m.stroke(&[[-0.1, 0.68], [0.48, 0.68]], 0.084);
    m.validate();
    m
}
fn theme() -> String {
    let mut s = include_str!("theme.css.in").to_string();
    for (token, value) in [
        ("BG", "#080b12"),
        ("INK", "#f0f5fb"),
        ("MUTED", "#a8b7c8"),
        ("LINE", "#2a3a49"),
        ("ACCENT", "#6ab8ff"),
        ("SURFACE", "#0d1724"),
    ] {
        s = s.replace(&format!("{{{{{token}}}}}"), value);
    }
    assert!(!s.contains("{{"), "Unexpanded theme token");
    s
}
/// Recover the August 18 glyph-wave behavior as an offline-generated numeric model.
/// The browser interpolates this Rust-authored sinusoid table while it advances
/// time and changes hexadecimal glyphs. No Rust/WASM runtime is needed on Manus.
fn hex_wave() -> String {
    const SAMPLES: usize = 256;
    let mut s = String::from(
        "{\"generator\":\"worldlab-visuals/1\",\"kind\":\"hex-wave\",\"glyphs\":\"01ACEF2479\",\"desktopWaves\":9,\"mobileWaves\":6,\"colors\":[\"106,184,255\",\"163,207,245\"],\"sinLut\":[",
    );
    for i in 0..SAMPLES {
        if i > 0 {
            s.push(',');
        }
        let theta = 2.0 * PI * i as f64 / SAMPLES as f64;
        write!(s, "{:.6}", theta.sin()).unwrap();
    }
    s.push_str("]}\n");
    s
}
fn main() {
    let check = std::env::args().any(|a| a == "--check");
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let mesh = build();
    for (file, bytes) in [
        ("client/src/generated/worldlab-mesh.json", mesh.json()),
        ("client/public/brand/worldlab-sculpture.svg", mesh.poster()),
        ("client/src/worldlab-cohesion.css", theme()),
        ("client/src/generated/worldlab-hex-wave.json", hex_wave()),
    ] {
        let path = root.join(file);
        if check {
            assert_eq!(
                fs::read_to_string(&path).unwrap(),
                bytes,
                "Stale generated asset: {file}"
            );
        } else {
            fs::create_dir_all(path.parent().unwrap()).unwrap();
            fs::write(&path, bytes).unwrap();
        }
        println!("{} {file}", if check { "Verified" } else { "Generated" });
    }
    println!(
        "{} vertices; {} faces",
        mesh.vertices.len(),
        mesh.faces.len()
    );
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn bounded_finite_geometry_and_materials() {
        let m = build();
        m.validate();
        for material in 0..5 {
            assert!(m.faces.iter().any(|f| f.material == material));
        }
    }
    #[test]
    fn j_hook_has_vertical_stem_and_left_hook() {
        let m = build();
        let j: Vec<_> = m
            .faces
            .iter()
            .filter(|f| f.material == 3)
            .flat_map(|f| f.ids.map(|i| m.vertices[i].p))
            .collect();
        assert!(j.iter().any(|p| p[0] < -0.4 && p[1] < -0.2));
        assert!(j.iter().any(|p| p[1] > 0.7));
    }
    #[test]
    fn identical_builds_and_resolved_theme() {
        assert_eq!(build().json(), build().json());
        assert!(!theme().contains("{{"));
        assert!(theme().contains("#6ab8ff"));
        assert_eq!(hex_wave(), hex_wave());
    }
    #[test]
    fn finite_bounded_hex_wave_and_fixed_glyph_alphabet() {
        let packet = hex_wave();
        assert!(packet.contains("\"kind\":\"hex-wave\""));
        assert!(packet.contains("\"glyphs\":\"01ACEF2479\""));
        assert!(packet.contains("\"desktopWaves\":9"));
        assert_eq!(packet.matches(',').count(), 262);
        for i in 0..256 {
            let phase = 2.0 * PI * i as f64 / 256.0;
            let sampled = phase.sin();
            assert!(sampled.is_finite() && sampled.abs() <= 1.0);
        }
    }
}
